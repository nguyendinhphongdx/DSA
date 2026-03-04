# Custom Parameter Decorators

## 1. Decorator la gi?

Decorator la mot tinh nang cua TypeScript (va ES7 proposal) cho phep ban **gan metadata** hoac **thay doi hanh vi** cua class, method, property, hoac parameter bang cach su dung cu phap `@expression`.

### Cac loai Decorator trong TypeScript

```typescript
// 1. Class Decorator
@Controller('users')
class UsersController {}

// 2. Method Decorator
@Get()
findAll() {}

// 3. Property Decorator
@Column()
name: string;

// 4. Parameter Decorator
findOne(@Param('id') id: string) {}
```

### Tai sao can Custom Decorators?

NestJS cung cap rat nhieu decorator co san (`@Body()`, `@Param()`, `@Query()`, ...), nhung trong thuc te ban thuong can:

1. **Lay thong tin user tu request** mot cach sach se (`@CurrentUser()`)
2. **Ket hop nhieu decorator** thanh mot (`@Auth(Role.ADMIN)`)
3. **Gan metadata tuy chinh** cho guard/interceptor doc (`@Roles()`, `@Public()`)
4. **Extract du lieu phuc tap** tu request (`@Pagination()`, `@Sorting()`)

---

## 2. Custom Parameter Decorators

### createParamDecorator

NestJS cung cap ham `createParamDecorator()` de tao parameter decorator tuy chinh.

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Cau truc co ban
export const MyParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // data: gia tri truyen vao khi su dung decorator, vi du @MyParam('abc') => data = 'abc'
    // ctx: ExecutionContext - truy cap request, response, ...

    const request = ctx.switchToHttp().getRequest();
    return request.someProperty; // Gia tri tra ve se duoc inject vao parameter
  },
);
```

### Vi du 1: @ClientIP() - Lay IP cua client

```typescript
// decorators/client-ip.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIP = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Uu tien header X-Forwarded-For (khi dung reverse proxy)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    }

    return request.ip || request.connection.remoteAddress;
  },
);
```

```typescript
// Su dung
@Controller('logs')
export class LogsController {
  @Post()
  createLog(@ClientIP() ip: string) {
    console.log(`Request tu IP: ${ip}`);
    return { ip };
  }
}
```

### Vi du 2: @UserAgent() - Lay User Agent

```typescript
// decorators/user-agent.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'] || 'Unknown';
  },
);
```

```typescript
// Su dung
@Get('info')
getInfo(@UserAgent() userAgent: string) {
  return { userAgent };
}
```

### Vi du 3: @Cookies() - Lay cookie tu request

```typescript
// decorators/cookies.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Neu co truyen ten cookie cu the => tra ve gia tri cua cookie do
    // Neu khong => tra ve tat ca cookies
    return data ? request.cookies?.[data] : request.cookies;
  },
);
```

```typescript
// Su dung
@Get('session')
getSession(
  @Cookies('session_id') sessionId: string,  // Lay cookie 'session_id'
  @Cookies() allCookies: Record<string, string>,  // Lay tat ca cookies
) {
  return { sessionId, allCookies };
}
```

### Vi du 4: @Pagination() - Extract thong tin pagination

```typescript
// decorators/pagination.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export const Pagination = createParamDecorator(
  (data: Partial<PaginationParams>, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    // Gia tri mac dinh
    const defaults = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      ...data, // Override bang gia tri truyen vao decorator
    };

    const page = Math.max(1, parseInt(query.page) || defaults.page);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaults.limit));
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || defaults.sortBy;
    const sortOrder = (query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

    return { page, limit, offset, sortBy, sortOrder };
  },
);
```

```typescript
// Su dung
@Controller('products')
export class ProductsController {
  @Get()
  findAll(@Pagination({ limit: 20 }) pagination: PaginationParams) {
    // pagination = { page: 1, limit: 20, offset: 0, sortBy: 'createdAt', sortOrder: 'DESC' }
    console.log(`Trang ${pagination.page}, ${pagination.limit} items/trang`);
    return this.productsService.findAll(pagination);
  }
}

// GET /products?page=2&limit=5&sortBy=price&sortOrder=ASC
// => pagination = { page: 2, limit: 5, offset: 5, sortBy: 'price', sortOrder: 'ASC' }
```

---

## 3. @User() va @CurrentUser() Decorator

Day la custom decorator duoc su dung nhieu nhat trong thuc te - lay thong tin user da xac thuc tu request.

### @User() Decorator co ban

```typescript
// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Duoc gan boi AuthGuard/Passport

    // Neu co truyen field cu the => tra ve field do
    // Neu khong => tra ve toan bo user object
    return data ? user?.[data] : user;
  },
);
```

```typescript
// Su dung
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {

  @Get()
  getProfile(@User() user: any) {
    // user = { id: 1, username: 'admin', roles: ['admin'] }
    return user;
  }

  @Get('id')
  getUserId(@User('id') userId: number) {
    // Chi lay field 'id' tu user
    return { userId };
  }

  @Get('roles')
  getUserRoles(@User('roles') roles: string[]) {
    return { roles };
  }
}
```

### @CurrentUser() voi Type Safety

```typescript
// interfaces/user-payload.interface.ts
export interface UserPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
```

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../interfaces/user-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserPayload = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
```

```typescript
// Su dung voi type safety
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {

  @Get('my-orders')
  getMyOrders(@CurrentUser() user: UserPayload) {
    // TypeScript biet user co cac field: id, username, email, roles
    return this.ordersService.findByUserId(user.id);
  }

  @Post()
  createOrder(
    @CurrentUser('id') userId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, createOrderDto);
  }
}
```

### @CurrentUser() cho WebSocket

```typescript
// decorators/ws-current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsCurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    const user = client.handshake?.auth?.user || client.data?.user;
    return data ? user?.[data] : user;
  },
);
```
