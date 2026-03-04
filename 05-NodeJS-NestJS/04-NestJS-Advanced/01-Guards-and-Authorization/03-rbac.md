# Role-based Access Control (RBAC)

## 4. Role-based Access Control (RBAC)

RBAC la mo hinh phan quyen dua tren vai tro. Moi nguoi dung co mot hoac nhieu vai tro, moi vai tro co nhung quyen nhat dinh.

### Dinh nghia Roles

```typescript
// auth/enums/role.enum.ts
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super_admin',
}
```

### Roles Decorator

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Key de luu tru metadata
export const ROLES_KEY = 'roles';

// Custom decorator - de su dung hon @SetMetadata
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lay danh sach roles duoc yeu cau tu metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),  // Kiem tra metadata cua method truoc
      context.getClass(),    // Roi den metadata cua class
    ]);

    // Neu khong co @Roles() decorator => khong can kiem tra role => cho phep
    if (!requiredRoles) {
      return true;
    }

    // Lay user tu request (da duoc gan boi AuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      return false;
    }

    // Kiem tra xem user co it nhat 1 role phu hop khong
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Su dung RBAC trong Controller

```typescript
// users/users.controller.ts
import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Ap dung cho toan bo controller
export class UsersController {

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR) // Chi admin hoac moderator moi xem duoc danh sach users
  findAll() {
    return [
      { id: 1, username: 'admin', roles: ['admin'] },
      { id: 2, username: 'user1', roles: ['user'] },
    ];
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER) // Admin hoac user deu xem duoc chi tiet
  findOne(@Param('id') id: string) {
    return { id: +id, username: 'user1', roles: ['user'] };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN) // Chi super admin moi xoa duoc user
  remove(@Param('id') id: string) {
    return { message: `Da xoa user #${id}` };
  }
}
```

---

## 5. @SetMetadata() va Custom Decorators

### @SetMetadata() co ban

`@SetMetadata()` la cach gan metadata (du lieu bo sung) vao route handler hoac controller. Metadata nay co the duoc doc lai boi Guard thong qua Reflector.

```typescript
import { SetMetadata } from '@nestjs/common';

@Controller('articles')
export class ArticlesController {
  @Post()
  @SetMetadata('roles', ['admin', 'editor']) // Gan metadata truc tiep
  create() {
    return 'Tao bai viet moi';
  }
}
```

### Tao Custom Decorators thay vi dung truc tiep @SetMetadata

Dung `@SetMetadata()` truc tiep co van de:
1. Phai nho chuoi key ('roles') - de bi loi chinh ta
2. Khong co type safety
3. Code khong doc duoc

**Nen tao custom decorator:**

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Su dung:
// @Roles(Role.ADMIN, Role.EDITOR)  // Ro rang, type-safe
```

### Nhieu loai Custom Decorators

```typescript
// decorators/public.decorator.ts
// Danh dau route la public (khong can xac thuc)
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export enum Permission {
  CREATE_POST = 'create_post',
  EDIT_POST = 'edit_post',
  DELETE_POST = 'delete_post',
  MANAGE_USERS = 'manage_users',
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### Su dung @Public() decorator

```typescript
// auth/guards/jwt-auth.guard.ts (cap nhat)
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector, // Inject Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Kiem tra xem route co duoc danh dau la public khong
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Route public => khong can xac thuc
      return true;
    }

    // Tiep tuc logic xac thuc binh thuong
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Chua dang nhap');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token khong hop le');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

```typescript
// Su dung trong controller
@Controller('products')
@UseGuards(JwtAuthGuard) // Mac dinh yeu cau xac thuc
export class ProductsController {

  @Get()
  @Public() // Route nay KHONG can xac thuc
  findAll() {
    return 'Danh sach san pham - ai cung xem duoc';
  }

  @Post()
  // Route nay CAN xac thuc (vi controller da co JwtAuthGuard)
  create() {
    return 'Tao san pham moi - phai dang nhap';
  }
}
```

---

## 6. Reflector Class

`Reflector` la mot helper class cua NestJS, dung de doc metadata da duoc gan boi `@SetMetadata()` hoac cac custom decorators.

### Cac phuong thuc cua Reflector

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ExampleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. get() - Lay metadata tu MOT nguon (handler HOAC class)
    const rolesFromHandler = this.reflector.get<string[]>(
      'roles',
      context.getHandler(), // Chi doc tu method
    );

    const rolesFromClass = this.reflector.get<string[]>(
      'roles',
      context.getClass(), // Chi doc tu class
    );

    // 2. getAllAndOverride() - Lay metadata tu nhieu nguon, uu tien nguon dau tien
    // Neu handler co metadata => dung cua handler
    // Neu handler khong co => dung cua class
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 3. getAllAndMerge() - Gop metadata tu tat ca nguon lai
    // Neu handler co ['editor'] va class co ['admin']
    // => Ket qua: ['editor', 'admin']
    const allRoles = this.reflector.getAllAndMerge<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    return true;
  }
}
```

### Vi du minh hoa su khac biet

```typescript
@Roles(Role.ADMIN)  // Class-level metadata
@Controller('articles')
export class ArticlesController {

  @Get()
  // Khong co @Roles o day
  // getAllAndOverride: ['admin'] (lay tu class)
  // getAllAndMerge: ['admin'] (lay tu class)
  findAll() {}

  @Get(':id')
  @Roles(Role.USER)
  // getAllAndOverride: ['user'] (handler co => uu tien handler)
  // getAllAndMerge: ['user', 'admin'] (gop ca hai)
  findOne() {}
}
```

---

## 7. Multiple Guards

Ban co the su dung nhieu Guard cung luc. Chung se chay **theo thu tu** tu trai sang phai (hoac tu tren xuong duoi).

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
//          ^1st           ^2nd         ^3rd
export class AdminController {
  @Get('dashboard')
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MANAGE_USERS)
  getDashboard() {
    return 'Admin Dashboard';
  }
}
```

### Quy tac quan trong:
- Cac Guard chay **tuan tu** (khong phai song song)
- Neu **bat ky** Guard nao tra ve `false` hoac nem exception => request bi tu choi **ngay lap tuc**
- Cac Guard sau se **khong duoc goi**
- Thu tu rat quan trong: JwtAuthGuard phai chay truoc RolesGuard vi RolesGuard can `request.user` da duoc JwtAuthGuard gan

```typescript
// Vi du: Guard ket hop nhieu dieu kien
@Injectable()
export class CompositeGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
    private rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Chay tuan tu
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);
    if (!isAuthenticated) return false;

    const hasRole = await this.rolesGuard.canActivate(context);
    return hasRole;
  }
}
```

---

## 8. Binding Guards

Co 3 cap do de gan (bind) Guard:

### Cap do 1: Method-level (tren tung route)

```typescript
@Controller('cats')
export class CatsController {
  @Get()
  @UseGuards(JwtAuthGuard) // Chi ap dung cho route nay
  findAll() {
    return 'Danh sach meo';
  }

  @Post()
  // Route nay KHONG co Guard
  create() {
    return 'Tao meo moi';
  }
}
```

### Cap do 2: Controller-level (tren toan bo controller)

```typescript
@Controller('cats')
@UseGuards(JwtAuthGuard) // Ap dung cho TAT CA routes trong controller
export class CatsController {
  @Get()
  findAll() { return 'Can xac thuc'; }

  @Post()
  create() { return 'Cung can xac thuc'; }
}
```

### Cap do 3: Global-level (toan bo ung dung)

**Cach 1: Trong main.ts (khong ho tro Dependency Injection)**

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Guard global - KHONG the inject dependencies
  app.useGlobalGuards(new JwtAuthGuard());

  await app.listen(3000);
}
bootstrap();
```

**Cach 2: Trong module (CO ho tro Dependency Injection) - KHUYEN DUNG**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  providers: [
    // Guard global voi DI
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Chay dau tien
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Chay thu hai
    },
  ],
})
export class AppModule {}
```

**Loi ich cua cach 2:**
- Guard co the inject cac service khac (JwtService, Reflector, ...)
- De test hon
- Khong can `@UseGuards()` tren moi controller
- Dung `@Public()` cho cac route khong can xac thuc

---

## 11. Guard Execution Order

Hieu ro thu tu thuc thi cua Guard la rat quan trong:

```
1. Global guards (theo thu tu dang ky trong module)
   |
   v
2. Controller guards (theo thu tu trong @UseGuards())
   |
   v
3. Method guards (theo thu tu trong @UseGuards())
```

### Vi du cu the

```typescript
// app.module.ts
@Module({
  providers: [
    { provide: APP_GUARD, useClass: GlobalGuard1 },  // Chay 1
    { provide: APP_GUARD, useClass: GlobalGuard2 },  // Chay 2
  ],
})
export class AppModule {}

// Controller
@UseGuards(ControllerGuardA, ControllerGuardB)  // Chay 3, 4
@Controller('items')
export class ItemsController {

  @UseGuards(MethodGuardX, MethodGuardY)  // Chay 5, 6
  @Get()
  findAll() {}
}

// Thu tu chay:
// GlobalGuard1 -> GlobalGuard2 -> ControllerGuardA -> ControllerGuardB -> MethodGuardX -> MethodGuardY
```

---

## 12. Loi thuong gap

### Loi 1: RolesGuard chay truoc AuthGuard

```typescript
// SAI - RolesGuard can user nhung AuthGuard chua chay
@UseGuards(RolesGuard, JwtAuthGuard)
@Get()
findAll() {}

// DUNG - AuthGuard chay truoc, gan user vao request
@UseGuards(JwtAuthGuard, RolesGuard)
@Get()
findAll() {}
```

### Loi 2: Guard khong inject duoc dependencies khi dung global

```typescript
// SAI - new khong ho tro DI
app.useGlobalGuards(new RolesGuard()); // Reflector se undefined!

// DUNG - dung APP_GUARD trong module
@Module({
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
```

### Loi 3: Quen export Guard tu module

```typescript
// SAI - Module khac khong dung duoc JwtAuthGuard
@Module({
  providers: [JwtAuthGuard],
})
export class AuthModule {}

// DUNG
@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard], // Phai export!
})
export class AuthModule {}
```

### Loi 4: Khong xu ly truong hop metadata khong ton tai

```typescript
// SAI - se throw error neu khong co @Roles()
canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.get<string[]>('roles', context.getHandler());
  return roles.some(role => user.roles.includes(role));
  // Error: Cannot read property 'some' of undefined
}

// DUNG - kiem tra truoc
canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.get<string[]>('roles', context.getHandler());
  if (!roles || roles.length === 0) {
    return true; // Khong co yeu cau role => cho phep
  }
  return roles.some(role => user.roles?.includes(role));
}
```

### Loi 5: Su dung class truc tiep thay vi instance trong @UseGuards

```typescript
// Ca hai deu dung, nhung co su khac biet:

// Cach 1: Truyen class (khuyen dung) - NestJS quan ly lifecycle va DI
@UseGuards(JwtAuthGuard)

// Cach 2: Truyen instance - KHONG co DI
@UseGuards(new JwtAuthGuard()) // JwtAuthGuard khong the inject JwtService!
```
