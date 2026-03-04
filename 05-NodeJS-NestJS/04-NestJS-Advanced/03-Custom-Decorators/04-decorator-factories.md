# Decorator Factories va Working voi Pipes

## 8. Working voi Pipes trong Custom Decorators

Custom parameter decorators co the ket hop voi Pipes de validate/transform du lieu.

### Truyen Pipe vao Custom Decorator

```typescript
// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

```typescript
// Su dung voi Pipe
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(
    // Pipe ap dung tren ket qua cua @User()
    @User('id', ParseIntPipe) userId: number,
  ) {
    // userId da duoc ParseIntPipe chuyen thanh number
    return this.usersService.findOne(userId);
  }
}
```

**Luu y quan trong:** Khi truyen pipe vao custom decorator, pipe se xu ly gia tri **tra ve tu decorator callback**, khong phai toan bo request.

### Tao Decorator voi Built-in Validation

```typescript
// decorators/validated-body.decorator.ts
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ValidatedBody = createParamDecorator(
  (data: { requiredFields: string[] }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body khong hop le');
    }

    if (data?.requiredFields) {
      const missingFields = data.requiredFields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === '',
      );

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Thieu cac truong bat buoc: ${missingFields.join(', ')}`,
        );
      }
    }

    return body;
  },
);
```

```typescript
// Su dung
@Post()
createUser(
  @ValidatedBody({ requiredFields: ['username', 'email', 'password'] })
  body: CreateUserDto,
) {
  return this.usersService.create(body);
}
```

### Custom Decorator voi Transform Pipe

```typescript
// decorators/query-params.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface QueryFilter {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

export const QueryFilters = createParamDecorator(
  (defaults: Partial<QueryFilter>, ctx: ExecutionContext): QueryFilter => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    return {
      search: query.search || defaults?.search || undefined,
      status: query.status || defaults?.status || undefined,
      startDate: query.startDate ? new Date(query.startDate) : defaults?.startDate,
      endDate: query.endDate ? new Date(query.endDate) : defaults?.endDate,
      tags: query.tags ? (Array.isArray(query.tags) ? query.tags : [query.tags]) : defaults?.tags,
    };
  },
);
```

```typescript
// Su dung
@Get()
findAll(@QueryFilters({ status: 'active' }) filters: QueryFilter) {
  // GET /products?search=laptop&tags=electronics&tags=sale
  // filters = { search: 'laptop', status: 'active', tags: ['electronics', 'sale'] }
  return this.productsService.search(filters);
}
```

---

## 9. Decorator Factories

Decorator factory la mot function tra ve decorator. Cho phep tuy chinh hanh vi cua decorator thong qua tham so.

### Factory Pattern co ban

```typescript
// decorators/rate-limit.decorator.ts
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

// Day la decorator factory - nhan tham so va tra ve decorator
export function RateLimit(options: {
  windowMs: number;  // Thoi gian cua so (ms)
  maxRequests: number;  // So request toi da
  message?: string;
}) {
  return applyDecorators(
    SetMetadata('rateLimit', options),
    UseGuards(RateLimitGuard),
  );
}
```

```typescript
// Su dung
@Controller('api')
export class ApiController {
  @Post('login')
  @RateLimit({ windowMs: 60000, maxRequests: 5, message: 'Qua nhieu lan dang nhap' })
  login() {}

  @Get('data')
  @RateLimit({ windowMs: 60000, maxRequests: 100 })
  getData() {}
}
```

### Factory voi Generic Types

```typescript
// decorators/serialize.decorator.ts
import { UseInterceptors, Type } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';

// Factory nhan vao DTO class de serialize response
export function Serialize<T>(dto: Type<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
```

```typescript
// Su dung
class UserResponseDto {
  id: number;
  username: string;
  email: string;
  // Khong co password!
}

class AdminUserResponseDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
  lastLogin: Date;
}

@Controller('users')
export class UsersController {
  @Get()
  @Serialize(UserResponseDto) // Tra ve chi cac field trong UserResponseDto
  findAll() {
    return this.usersService.findAll();
  }

  @Get('admin-view')
  @Serialize(AdminUserResponseDto) // Tra ve nhieu thong tin hon
  findAllAdmin() {
    return this.usersService.findAll();
  }
}
```

### Conditional Decorator Factory

```typescript
// decorators/cache-if.decorator.ts
import { UseInterceptors, applyDecorators, SetMetadata } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

export function CacheIf(condition: boolean, ttl: number = 30) {
  if (condition) {
    return applyDecorators(
      UseInterceptors(CacheInterceptor),
      CacheTTL(ttl),
    );
  }
  // Tra ve decorator khong lam gi
  return applyDecorators();
}
```

```typescript
// Su dung
const isProduction = process.env.NODE_ENV === 'production';

@Controller('data')
export class DataController {
  @Get()
  @CacheIf(isProduction, 60) // Chi cache trong production
  getData() {
    return this.dataService.fetchExpensiveData();
  }
}
```

### Config-based Decorator Factory

```typescript
// decorators/api-method.decorator.ts
import {
  applyDecorators,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';

interface ApiMethodOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string;
  summary: string;
  statusCode?: HttpStatus;
  auth?: boolean;
  cache?: number;
}

export function ApiMethod(options: ApiMethodOptions) {
  const decorators: MethodDecorator[] = [];

  // HTTP method
  const methodMap = { GET: Get, POST: Post, PUT: Put, DELETE: Delete };
  decorators.push(methodMap[options.method](options.path));

  // Status code
  if (options.statusCode) {
    decorators.push(HttpCode(options.statusCode));
  }

  // Swagger
  decorators.push(ApiOperation({ summary: options.summary }));

  // Auth
  if (options.auth) {
    decorators.push(UseGuards(JwtAuthGuard));
  }

  return applyDecorators(...decorators);
}
```

```typescript
// Su dung
@Controller('products')
export class ProductsController {
  @ApiMethod({
    method: 'GET',
    summary: 'Lay danh sach san pham',
    auth: false,
  })
  findAll() {}

  @ApiMethod({
    method: 'POST',
    summary: 'Tao san pham moi',
    statusCode: HttpStatus.CREATED,
    auth: true,
  })
  create() {}
}
```

---

## 10. Cac vi du nang cao

### Header Decorator

```typescript
// decorators/headers.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.headers[data.toLowerCase()] : request.headers;
  },
);

// Lay language tu header
export const Language = createParamDecorator(
  (defaultLang: string = 'vi', ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const acceptLanguage = request.headers['accept-language'];

    if (!acceptLanguage) return defaultLang;

    // Parse "vi-VN,vi;q=0.9,en;q=0.8" => "vi"
    const primaryLang = acceptLanguage.split(',')[0].split('-')[0].trim();
    const supportedLangs = ['vi', 'en', 'ja', 'ko'];

    return supportedLangs.includes(primaryLang) ? primaryLang : defaultLang;
  },
);
```

```typescript
// Su dung
@Get('welcome')
getWelcome(@Language() lang: string) {
  const messages = {
    vi: 'Xin chao!',
    en: 'Hello!',
    ja: 'Konnichiwa!',
  };
  return { message: messages[lang] || messages['vi'] };
}
```

### File Upload Decorator

```typescript
// decorators/upload.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface UploadOptions {
  fieldName: string;
  maxSize?: number; // bytes
  allowedTypes?: string[];
  maxCount?: number;
  destination?: string;
}

export function Upload(options: UploadOptions) {
  const {
    fieldName,
    maxSize = 5 * 1024 * 1024, // 5MB mac dinh
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxCount = 1,
    destination = './uploads',
  } = options;

  const multerOptions = {
    storage: diskStorage({
      destination,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${fieldName}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: maxSize },
    fileFilter: (req, file, callback) => {
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error(`Loai file khong duoc phep. Chi chap nhan: ${allowedTypes.join(', ')}`), false);
      }
    },
  };

  const interceptor =
    maxCount === 1
      ? FileInterceptor(fieldName, multerOptions)
      : FilesInterceptor(fieldName, maxCount, multerOptions);

  return applyDecorators(
    UseInterceptors(interceptor),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}
```

```typescript
// Su dung
@Controller('upload')
export class UploadController {
  @Post('avatar')
  @Upload({
    fieldName: 'avatar',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
  })
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      size: file.size,
      url: `/uploads/${file.filename}`,
    };
  }

  @Post('photos')
  @Upload({
    fieldName: 'photos',
    maxCount: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  })
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map((file) => ({
      filename: file.filename,
      size: file.size,
    }));
  }
}
```
