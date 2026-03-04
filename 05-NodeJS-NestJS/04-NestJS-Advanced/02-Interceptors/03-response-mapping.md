# Response Mapping, Cache, Timeout Interceptors

## 4. Response Mapping Interceptor

Bien doi du lieu tra ve tu handler truoc khi gui cho client.

### Boc response trong format chuan

```typescript
// interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interface cho response chuan
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: 'Thanh cong',
        data: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Truoc khi co interceptor:**
```json
[
  { "id": 1, "name": "NestJS" },
  { "id": 2, "name": "Express" }
]
```

**Sau khi co interceptor:**
```json
{
  "statusCode": 200,
  "message": "Thanh cong",
  "data": [
    { "id": 1, "name": "NestJS" },
    { "id": 2, "name": "Express" }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Exclude Fields Interceptor

Loai bo cac truong nhay cam khoi response (vi du: password, token noi bo).

```typescript
// interceptors/serialize.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, ClassConstructor } from 'class-transformer';

// Custom decorator de chi dinh DTO cho response
import { SetMetadata } from '@nestjs/common';
export const SERIALIZE_KEY = 'serialize';
export const Serialize = (dto: ClassConstructor<any>) =>
  SetMetadata(SERIALIZE_KEY, dto);

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private reflector: any) {} // inject Reflector

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Loai bo cac field khong mong muon
        return this.sanitize(data);
      }),
    );
  }

  private sanitize(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (data && typeof data === 'object') {
      const sanitized = { ...data };
      // Loai bo cac truong nhay cam
      delete sanitized.password;
      delete sanitized.passwordHash;
      delete sanitized.__v;
      delete sanitized.internalToken;
      return sanitized;
    }

    return data;
  }
}
```

### Class Serializer Interceptor (su dung class-transformer)

```typescript
// Cach tieu chuan cua NestJS de serialize response
// Dung voi @Exclude() va @Expose() tu class-transformer

// user.entity.ts
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Exclude() // Se khong xuat hien trong response
  password: string;

  @Exclude()
  refreshToken: string;

  @Expose()
  get fullInfo(): string {
    return `${this.username} (${this.email})`;
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

```typescript
// users.controller.ts
import { Controller, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserEntity } from './user.entity';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Interceptor co san cua NestJS
export class UsersController {
  @Get()
  findAll(): UserEntity[] {
    const users = [
      { id: 1, username: 'admin', email: 'admin@test.com', password: 'hash123', refreshToken: 'abc' },
      { id: 2, username: 'user1', email: 'user1@test.com', password: 'hash456', refreshToken: 'def' },
    ];

    // Phai tra ve instance cua class (khong phai plain object)
    return users.map((user) => new UserEntity(user));
  }
}

// Response se la:
// [
//   { "id": 1, "username": "admin", "email": "admin@test.com", "fullInfo": "admin (admin@test.com)" },
//   { "id": 2, "username": "user1", "email": "user1@test.com", "fullInfo": "user1 (user1@test.com)" }
// ]
// => password va refreshToken bi loai bo!
```

---

## 5. Cache Interceptor

Luu cache response de giam tai cho server.

### Cache Interceptor co ban (in-memory)

```typescript
// interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SimpleCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly TTL = 30000; // 30 giay

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Chi cache GET requests
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key);

    // Kiem tra cache con hieu luc khong
    if (cached && cached.expiry > Date.now()) {
      console.log(`[CACHE HIT] ${key}`);
      return of(cached.data); // Tra ve du lieu tu cache, KHONG goi handler
    }

    console.log(`[CACHE MISS] ${key}`);

    // Goi handler va luu ket qua vao cache
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          expiry: Date.now() + this.TTL,
        });
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query } = request;
    return `${url}?${JSON.stringify(query)}`;
  }
}
```

### Cache Interceptor voi NestJS CacheModule

```bash
npm install @nestjs/cache-manager cache-manager
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 30, // thoi gian song (giay)
      max: 100, // so luong item toi da trong cache
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

```typescript
// Su dung CacheInterceptor co san
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('products')
@UseInterceptors(CacheInterceptor) // Ap dung cache cho toan bo controller
export class ProductsController {

  @Get()
  @CacheTTL(60) // Override TTL cho route nay: 60 giay
  findAll() {
    console.log('Handler duoc goi - khong co cache');
    return [
      { id: 1, name: 'Laptop', price: 1000 },
      { id: 2, name: 'Phone', price: 500 },
    ];
  }

  @Get('featured')
  @CacheKey('featured-products') // Custom cache key
  @CacheTTL(300) // Cache 5 phut
  getFeatured() {
    return [{ id: 1, name: 'Laptop Pro', price: 2000 }];
  }
}
```

---

## 6. Timeout Interceptor

Tu dong huy request neu handler mat qua nhieu thoi gian.

```typescript
// interceptors/timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 5000) {
    this.timeoutMs = timeoutMs;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException(
              `Request da vuot qua thoi gian cho toi da ${this.timeoutMs}ms`,
            ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
```

### Su dung

```typescript
@Controller('reports')
export class ReportsController {

  @Get('quick')
  @UseInterceptors(new TimeoutInterceptor(3000)) // Timeout 3 giay
  getQuickReport() {
    return 'Bao cao nhanh';
  }

  @Get('complex')
  @UseInterceptors(new TimeoutInterceptor(30000)) // Timeout 30 giay
  async getComplexReport() {
    // Xu ly phuc tap mat nhieu thoi gian
    await this.heavyComputation();
    return 'Bao cao phuc tap';
  }

  private heavyComputation(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
```

### Timeout voi Metadata (linh hoat hon)

```typescript
// decorators/timeout.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'timeout';
export const SetTimeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);
```

```typescript
// interceptors/dynamic-timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { TIMEOUT_KEY } from '../decorators/timeout.decorator';

@Injectable()
export class DynamicTimeoutInterceptor implements NestInterceptor {
  private readonly DEFAULT_TIMEOUT = 5000;

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Doc timeout tu metadata, mac dinh 5 giay
    const timeoutMs =
      this.reflector.get<number>(TIMEOUT_KEY, context.getHandler()) ||
      this.DEFAULT_TIMEOUT;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException(`Timeout sau ${timeoutMs}ms`),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
```

```typescript
// Su dung decorator
@Controller('data')
export class DataController {
  @Get('fast')
  @SetTimeout(2000) // 2 giay
  getFastData() { }

  @Get('slow')
  @SetTimeout(60000) // 60 giay
  getSlowData() { }
}
```

---

## 7. Exception Mapping Interceptor

Bien doi exception tu handler thanh format khac.

```typescript
// interceptors/error-mapping.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Map cac loai error cu the
        if (error.code === 'ECONNREFUSED') {
          return throwError(
            () => new BadGatewayException('Khong the ket noi den service ben ngoai'),
          );
        }

        if (error.name === 'ValidationError') {
          return throwError(
            () => new HttpException(
              {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                message: 'Du lieu khong hop le',
                errors: error.errors,
              },
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
          );
        }

        if (error.name === 'MongoServerError' && error.code === 11000) {
          return throwError(
            () => new HttpException(
              {
                statusCode: HttpStatus.CONFLICT,
                message: 'Du lieu da ton tai (duplicate)',
                field: Object.keys(error.keyPattern)[0],
              },
              HttpStatus.CONFLICT,
            ),
          );
        }

        // Neu khong biet loi gi, giu nguyen
        return throwError(() => error);
      }),
    );
  }
}
```

### Wrap Error voi format chuan

```typescript
// interceptors/error-format.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorFormatInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorFormatInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Log error truoc
        this.logger.error(
          `${error.name}: ${error.message}`,
          error.stack,
        );

        // Neu da la HttpException, giu nguyen nhung them timestamp
        if (error instanceof HttpException) {
          const response = error.getResponse();
          const status = error.getStatus();

          return throwError(
            () =>
              new HttpException(
                {
                  ...(typeof response === 'object' ? response : { message: response }),
                  timestamp: new Date().toISOString(),
                  path: context.switchToHttp().getRequest().url,
                },
                status,
              ),
          );
        }

        // Cac loi khac => 500 Internal Server Error
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Loi he thong. Vui long thu lai sau.',
                timestamp: new Date().toISOString(),
                path: context.switchToHttp().getRequest().url,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
```

---

## 9. Binding Interceptors

Giong nhu Guards, Interceptors co the duoc bind o 3 cap do:

### Cap do Method

```typescript
@Controller('cats')
export class CatsController {
  @Get()
  @UseInterceptors(LoggingInterceptor) // Chi cho route nay
  findAll() {
    return 'Danh sach meo';
  }
}
```

### Cap do Controller

```typescript
@Controller('cats')
@UseInterceptors(LoggingInterceptor) // Cho tat ca routes trong controller
export class CatsController {
  @Get()
  findAll() { }

  @Post()
  create() { }
}
```

### Cap do Global

**Cach 1: main.ts (khong co DI)**

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

**Cach 2: Module (co DI) - khuyen dung**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
```

### Thu tu thuc thi Interceptors

```
Global Interceptors (theo thu tu dang ky)
    |
    v
Controller Interceptors (tu trai sang phai trong @UseInterceptors())
    |
    v
Method Interceptors (tu trai sang phai)
    |
    v
Route Handler
    |
    v
Method Interceptors (nguoc lai - LIFO)
    |
    v
Controller Interceptors (nguoc lai)
    |
    v
Global Interceptors (nguoc lai)
    |
    v
Response
```

**Luu y:** Truoc handler, interceptors chay theo thu tu dang ky. Sau handler, chung chay theo thu tu **nguoc lai** (nhu stack - Last In First Out).

---

## 10. StreamableFile

`StreamableFile` la class cua NestJS de tra ve file dang stream thay vi load toan bo file vao memory.

```typescript
// files/files.controller.ts
import { Controller, Get, StreamableFile, Res, Header } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

@Controller('files')
export class FilesController {

  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="report.pdf"')
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'files', 'report.pdf'));
    return new StreamableFile(file);
  }

  @Get('image')
  getImage(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'files', 'photo.jpg'));

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="photo.jpg"',
    });

    return new StreamableFile(file);
  }

  @Get('csv')
  getCsv(): StreamableFile {
    // Tao CSV tu buffer
    const csvContent = 'id,name,email\n1,Admin,admin@test.com\n2,User,user@test.com';
    const buffer = Buffer.from(csvContent);

    return new StreamableFile(buffer, {
      type: 'text/csv',
      disposition: 'attachment; filename="users.csv"',
    });
  }
}
```

### Interceptor voi StreamableFile

Khi su dung interceptor bien doi response, can luu y khong bien doi `StreamableFile`:

```typescript
@Injectable()
export class SmartTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // KHONG wrap StreamableFile
        if (data instanceof StreamableFile) {
          return data;
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
```
