# Aggregating Decorators va Decorator Composition

## 4. Aggregating Decorators (applyDecorators)

`applyDecorators()` cho phep ban ket hop nhieu decorator thanh mot decorator duy nhat. Rat huu ich khi ban co nhom decorators thuong di cung nhau.

### applyDecorators co ban

```typescript
import { applyDecorators } from '@nestjs/common';

// Truoc: Phai viet nhieu dong
@Controller('admin')
export class AdminController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(LoggingInterceptor)
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin dashboard' })
  @ApiResponse({ status: 200, description: 'Thanh cong' })
  @ApiResponse({ status: 403, description: 'Khong co quyen' })
  getDashboard() {}
}
```

```typescript
// Sau: Gom lai thanh 1 decorator
// decorators/auth.decorator.ts
import { applyDecorators, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { Role } from '../auth/enums/role.enum';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    UseInterceptors(LoggingInterceptor),
  );
}
```

```typescript
// Su dung - sach se hon rat nhieu
@Controller('admin')
export class AdminController {
  @Get()
  @Auth(Role.ADMIN) // 1 dong thay vi 7 dong!
  getDashboard() {}

  @Delete(':id')
  @Auth(Role.SUPER_ADMIN)
  deleteUser(@Param('id') id: string) {}
}
```

### Vi du phuc tap hon: @ApiAuth()

```typescript
// decorators/api-auth.decorator.ts
import { applyDecorators, HttpCode, HttpStatus, Type, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../auth/enums/role.enum';

export interface ApiAuthOptions {
  roles?: Role[];
  summary?: string;
  responseType?: Type<any>;
  statusCode?: HttpStatus;
}

export function ApiAuth(options: ApiAuthOptions = {}) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(), // Swagger: hien thi nut Authorize
    ApiUnauthorizedResponse({ description: 'Chua xac thuc' }),
  ];

  if (options.roles && options.roles.length > 0) {
    decorators.push(
      Roles(...options.roles),
      UseGuards(RolesGuard),
      ApiForbiddenResponse({ description: 'Khong co quyen truy cap' }),
    );
  }

  if (options.statusCode) {
    decorators.push(HttpCode(options.statusCode));
  }

  if (options.responseType) {
    decorators.push(
      ApiResponse({
        status: options.statusCode || 200,
        type: options.responseType,
      }),
    );
  }

  return applyDecorators(...decorators);
}
```

```typescript
// Su dung
@Controller('articles')
export class ArticlesController {
  @Get()
  @ApiAuth({
    roles: [Role.ADMIN, Role.EDITOR],
    summary: 'Lay danh sach bai viet',
    statusCode: HttpStatus.OK,
  })
  findAll() {}

  @Post()
  @ApiAuth({
    roles: [Role.ADMIN],
    statusCode: HttpStatus.CREATED,
  })
  create() {}
}
```

---

## 5. Decorator Composition

Decorator composition la viec ket hop nhieu decorator, noi chung dung `applyDecorators`. O day ta xem xet cac pattern nang cao hon.

### Composition voi logic

```typescript
// decorators/public-or-auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from './public.decorator';

// Route vua co the truy cap public, vua co them thong tin neu da dang nhap
export function PublicOrAuth() {
  return applyDecorators(
    Public(),
    UseGuards(OptionalAuthGuard), // Guard khong nem loi neu khong co token
  );
}
```

```typescript
// auth/guards/optional-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync(token);
      } catch {
        // Token khong hop le nhung van cho phep truy cap (voi user = null)
        request.user = null;
      }
    }

    return true; // Luon cho phep
  }
}
```

### Composition cho Swagger Documentation

```typescript
// decorators/api-paginated.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiQuery, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginated(model: Type<any>) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'So trang' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'So item moi trang' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Truong sap xep' }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
        ],
      },
    }),
  );
}
```

```typescript
// Su dung
@Controller('products')
export class ProductsController {
  @Get()
  @ApiPaginated(ProductDto) // 1 dong = Swagger documentation hoan chinh cho pagination
  findAll(@Pagination() pagination: PaginationParams) {
    return this.productsService.findAll(pagination);
  }
}
```
