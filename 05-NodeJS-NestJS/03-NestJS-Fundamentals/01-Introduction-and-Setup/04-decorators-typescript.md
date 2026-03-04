# Decorators trong TypeScript

## 11. Decorators trong TypeScript

Decorators là tính năng quan trọng nhất mà NestJS sử dụng. Hiểu decorators sẽ giúp bạn hiểu cách NestJS hoạt động.

### 11.1. Decorator là gì?

Decorator là một **function đặc biệt** có thể gắn vào class, method, property, hoặc parameter để **thêm metadata** hoặc **thay đổi hành vi** của chúng.

```typescript
// Cú pháp: @decoratorName đặt trước target
@Controller('users')          // Class decorator
export class UsersController {
  @Get()                      // Method decorator
  findAll(): string {
    return 'all users';
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {  // Parameter decorator
    return `user ${id}`;
  }
}
```

### 11.2. Các loại Decorators

**a) Class Decorator:**

```typescript
// Decorator factory - trả về decorator function
function Controller(prefix: string): ClassDecorator {
  return (target: Function) => {
    // Lưu metadata 'path' vào class
    Reflect.defineMetadata('path', prefix, target);
    console.log(`Controller registered with prefix: ${prefix}`);
  };
}

@Controller('users')
class UsersController {}
// Log: "Controller registered with prefix: users"
```

**b) Method Decorator:**

```typescript
// Log thời gian thực thi method
function LogExecutionTime(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = Date.now();
      const result = originalMethod.apply(this, args);
      const end = Date.now();
      console.log(`${String(propertyKey)} executed in ${end - start}ms`);
      return result;
    };

    return descriptor;
  };
}

class UsersService {
  @LogExecutionTime()
  findAll() {
    // ... logic nặng
    return [];
  }
}
```

**c) Property Decorator:**

```typescript
function DefaultValue(value: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    let val = value;
    Object.defineProperty(target, propertyKey, {
      get: () => val,
      set: (newVal) => { val = newVal; },
      enumerable: true,
      configurable: true,
    });
  };
}

class Config {
  @DefaultValue(3000)
  port: number;

  @DefaultValue('development')
  environment: string;
}

const config = new Config();
console.log(config.port); // 3000
```

**d) Parameter Decorator:**

```typescript
function LogParam(target: any, propertyKey: string, parameterIndex: number) {
  const existingParams: number[] =
    Reflect.getOwnMetadata('log_params', target, propertyKey) || [];
  existingParams.push(parameterIndex);
  Reflect.defineMetadata('log_params', existingParams, target, propertyKey);
}

class UsersController {
  findOne(@LogParam id: string) {
    return `user ${id}`;
  }
}
```

### 11.3. Các Decorators quan trọng của NestJS

```typescript
// === MODULE ===
@Module({})               // Khai báo module
@Global()                 // Đánh dấu module là global

// === CONTROLLER ===
@Controller('prefix')     // Khai báo controller với route prefix

// === HTTP METHODS ===
@Get('path')              // GET request
@Post('path')             // POST request
@Put('path')              // PUT request
@Delete('path')           // DELETE request
@Patch('path')            // PATCH request
@Options('path')          // OPTIONS request
@Head('path')             // HEAD request
@All('path')              // Tất cả HTTP methods

// === REQUEST DATA ===
@Param('key')             // Route parameters (/users/:id)
@Query('key')             // Query parameters (?page=1)
@Body('key')              // Request body
@Headers('key')           // Request headers
@Ip()                     // Client IP address
@Session()                // Session object
@HostParam('param')       // Host parameters

// === RESPONSE ===
@HttpCode(200)            // Set HTTP status code
@Header('key', 'value')  // Set response header
@Redirect('url', 301)    // Redirect

// === PROVIDER ===
@Injectable()             // Đánh dấu class là injectable
@Inject('TOKEN')          // Inject provider bằng token
@Optional()               // Đánh dấu dependency là optional

// === KHÁC ===
@UseGuards(AuthGuard)     // Apply guard
@UseInterceptors(LoggingInterceptor) // Apply interceptor
@UsePipes(ValidationPipe) // Apply pipe
@UseFilters(HttpExceptionFilter)     // Apply exception filter
@SetMetadata('key', 'value')        // Set custom metadata
```

### 11.4. Custom Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Custom decorator lấy thông tin user từ request
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nếu truyền data (field cụ thể), trả về field đó
    // Ví dụ: @CurrentUser('email') => trả về user.email
    return data ? user?.[data] : user;
  },
);

// Sử dụng:
@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('email')
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```
