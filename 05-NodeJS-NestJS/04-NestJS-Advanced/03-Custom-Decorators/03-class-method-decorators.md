# Custom Class/Method Decorators va SetMetadata

## 6. Custom Class va Method Decorators

Ngoai parameter decorators, ban cung co the tao class decorators va method decorators.

### Custom Method Decorator

```typescript
// decorators/log-execution.decorator.ts
// Decorator tu dong log khi method duoc goi

export function LogExecution(message?: string) {
  return function (
    target: any,           // Class prototype
    propertyKey: string,   // Ten method
    descriptor: PropertyDescriptor, // Descriptor cua method
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const logMessage = message || `${className}.${propertyKey}()`;

      console.log(`[START] ${logMessage}`);
      console.log(`[ARGS]  ${JSON.stringify(args)}`);

      const start = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        console.log(`[END]   ${logMessage} - ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(`[ERROR] ${logMessage} - ${duration}ms - ${error.message}`);
        throw error;
      }
    };

    return descriptor;
  };
}
```

```typescript
// Su dung
@Injectable()
export class UsersService {
  @LogExecution('Tim tat ca users')
  async findAll() {
    // Khi method nay duoc goi, se tu dong log:
    // [START] Tim tat ca users
    // [ARGS]  []
    // [END]   Tim tat ca users - 15ms
    return [{ id: 1, name: 'Admin' }];
  }

  @LogExecution()
  async findOne(id: number) {
    // [START] UsersService.findOne()
    // [ARGS]  [1]
    // [END]   UsersService.findOne() - 5ms
    return { id, name: 'User' };
  }
}
```

### Custom Class Decorator

```typescript
// decorators/prefix-routes.decorator.ts
// Tu dong them prefix cho toan bo routes trong controller

import { Controller } from '@nestjs/common';

export function ApiController(prefix: string) {
  return Controller(`api/v1/${prefix}`);
}
```

```typescript
// Su dung
@ApiController('users') // Tuong duong @Controller('api/v1/users')
export class UsersController {
  @Get() // GET /api/v1/users
  findAll() {}

  @Get(':id') // GET /api/v1/users/:id
  findOne() {}
}
```

### Decorator Measure Performance

```typescript
// decorators/measure.decorator.ts
export function Measure() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();

      try {
        return await originalMethod.apply(this, args);
      } finally {
        const end = performance.now();
        const duration = (end - start).toFixed(2);

        // Luu metrics (co the gui den monitoring service)
        console.log(`[PERF] ${target.constructor.name}.${propertyKey}: ${duration}ms`);
      }
    };

    return descriptor;
  };
}
```

### Deprecated Decorator

```typescript
// decorators/deprecated.decorator.ts
export function Deprecated(message?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const defaultMsg = `${className}.${propertyKey}() da loi thoi (deprecated)`;

    descriptor.value = function (...args: any[]) {
      console.warn(`[DEPRECATED] ${message || defaultMsg}`);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
```

```typescript
// Su dung
@Injectable()
export class UsersService {
  @Deprecated('Su dung findAll() thay vi getAllUsers()')
  getAllUsers() {
    // [DEPRECATED] Su dung findAll() thay vi getAllUsers()
    return this.findAll();
  }

  findAll() {
    return [];
  }
}
```

---

## 7. SetMetadata va Custom Decorator

`SetMetadata` la co che quan trong de gan du lieu bo sung vao handler/class, sau do Guard hoac Interceptor co the doc bang `Reflector`.

### Flow co ban

```
@MyDecorator(value)    -->    SetMetadata('key', value)    -->    Reflector.get('key', handler)
  (tren handler)                 (luu metadata)                     (doc trong Guard)
```

### Vi du toan dien

```typescript
// === Buoc 1: Tao decorator gan metadata ===

// decorators/throttle.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface ThrottleConfig {
  limit: number;    // So request toi da
  ttl: number;      // Thoi gian (giay)
}

export const THROTTLE_KEY = 'throttle';
export const Throttle = (limit: number, ttl: number) =>
  SetMetadata(THROTTLE_KEY, { limit, ttl } as ThrottleConfig);
```

```typescript
// === Buoc 2: Tao Guard doc metadata ===

// guards/throttle.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY, ThrottleConfig } from '../decorators/throttle.decorator';

@Injectable()
export class ThrottleGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Doc config tu metadata
    const config = this.reflector.getAllAndOverride<ThrottleConfig>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Khong co @Throttle() => khong gioi han
    if (!config) return true;

    const request = context.switchToHttp().getRequest();
    const key = `${request.ip}-${request.url}`;
    const now = Date.now();

    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // Reset counter
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + config.ttl * 1000,
      });
      return true;
    }

    if (record.count >= config.limit) {
      throw new HttpException(
        `Qua nhieu request. Gioi han: ${config.limit} request / ${config.ttl} giay`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
```

```typescript
// === Buoc 3: Su dung ===

@Controller('api')
@UseGuards(ThrottleGuard)
export class ApiController {
  @Get('search')
  @Throttle(10, 60) // Toi da 10 request / 60 giay
  search() {
    return 'Ket qua tim kiem';
  }

  @Post('submit')
  @Throttle(3, 60) // Toi da 3 request / 60 giay (nghiem ngat hon)
  submit() {
    return 'Da gui';
  }

  @Get('public')
  // Khong co @Throttle() => khong bi gioi han
  getPublicData() {
    return 'Du lieu cong khai';
  }
}
```

### Nhieu metadata cung luc

```typescript
// decorators/api-endpoint.decorator.ts
import { applyDecorators, SetMetadata } from '@nestjs/common';

interface EndpointConfig {
  cache?: number;     // TTL tinh bang giay
  throttle?: { limit: number; ttl: number };
  version?: string;
  deprecated?: boolean;
}

export const ENDPOINT_CONFIG_KEY = 'endpoint_config';

export function ApiEndpoint(config: EndpointConfig) {
  const decorators = [
    SetMetadata(ENDPOINT_CONFIG_KEY, config),
  ];

  if (config.deprecated) {
    decorators.push(
      SetMetadata('deprecated', true),
    );
  }

  return applyDecorators(...decorators);
}
```

---

## 11. Loi thuong gap

### Loi 1: Custom decorator khong nhan duoc data

```typescript
// SAI - data luon la undefined
export const User = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    console.log(data); // undefined
    // ...
  },
);

// Vi khi su dung @User() khong truyen gi ca
// @User() => data = undefined
// @User('id') => data = 'id'
```

**Giai phap:** Luon kiem tra `data` truoc khi su dung.

### Loi 2: applyDecorators khong hoat dong voi Swagger

```typescript
// applyDecorators KHONG the gop Swagger decorators trong moi truong hop
// Vi mot so Swagger decorators dung metadata dac biet

// Neu gap van de, dung ApiExtraModels rieng
@ApiExtraModels(UserDto)
@Controller('users')
export class UsersController {}
```

### Loi 3: Custom decorator mat type safety

```typescript
// SAI - khong co type checking
export const User = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    // data co the la bat cu gi
  },
);

// DUNG - gioi han data bang type
export const User = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    // data chi co the la 'id' | 'username' | 'email' | 'roles' | undefined
  },
);
```

### Loi 4: Thay doi request object trong parameter decorator

```typescript
// SAI - Parameter decorator khong nen thay doi request
export const InjectUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    request.user = { id: 1 }; // KHONG NEN lam dieu nay trong param decorator!
    return request.user;
  },
);

// DUNG - Dung Guard hoac Middleware de thay doi request
// Parameter decorator chi nen DOC du lieu
```

### Loi 5: Decorator order matters

```typescript
// Thu tu decorator quan trong!

// Trong TypeScript, decorators chay tu DUOI LEN (bottom-up)
// Nhung trong NestJS, @UseGuards(), @UseInterceptors() chay theo thu tu khai bao

@UseGuards(AuthGuard)      // Chay 1
@UseGuards(RolesGuard)     // Chay 2
@Get()
findAll() {}

// KHAC voi:
@UseGuards(RolesGuard)     // Chay 1 - THIEU user!
@UseGuards(AuthGuard)      // Chay 2
@Get()
findAll() {}

// Tot nhat: gop lai
@UseGuards(AuthGuard, RolesGuard) // Chay theo thu tu: Auth -> Roles
@Get()
findAll() {}
```
