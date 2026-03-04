# Bài 4: Providers và Services trong NestJS

## Mục lục

- [1. Provider là gì?](#1-provider-là-gì)
- [2. @Injectable() Decorator](#2-injectable-decorator)
- [3. Service Layer Pattern](#3-service-layer-pattern)
- [4. Custom Providers](#4-custom-providers)
- [5. Provider Scope](#5-provider-scope)
- [6. Async Providers](#6-async-providers)
- [7. Optional Providers](#7-optional-providers)
- [8. Property-based Injection](#8-property-based-injection)
- [9. Circular Dependency (forwardRef)](#9-circular-dependency-forwardref)
- [10. Ví dụ thực tế hoàn chỉnh](#10-ví-dụ-thực-tế-hoàn-chỉnh)
- [11. Lỗi thường gặp](#11-lỗi-thường-gặp)
- [12. Bài tập](#12-bài-tập)

---

## 1. Provider là gì?

### 1.1. Khái niệm

**Provider** là khái niệm cốt lõi trong NestJS. Nhiều class cơ bản trong NestJS có thể được coi là provider: services, repositories, factories, helpers, và nhiều hơn nữa. Ý tưởng chính của provider là nó có thể được **inject** (tiêm) như một dependency.

```
┌──────────────────────────────────────────────┐
│                 PROVIDERS                     │
│                                              │
│  ┌───────────┐  ┌───────────┐               │
│  │  Service   │  │ Repository│               │
│  │ (Business  │  │ (Data     │               │
│  │  Logic)    │  │  Access)  │               │
│  └───────────┘  └───────────┘               │
│                                              │
│  ┌───────────┐  ┌───────────┐               │
│  │  Factory   │  │  Helper   │               │
│  │ (Object    │  │ (Utility  │               │
│  │  Creation) │  │  Functions)│               │
│  └───────────┘  └───────────┘               │
│                                              │
│  ┌───────────┐  ┌───────────┐               │
│  │  Strategy  │  │  Adapter  │               │
│  │ (Algorithm │  │ (Interface│               │
│  │  Variants) │  │  Wrapper) │               │
│  └───────────┘  └───────────┘               │
│                                              │
│  Tất cả đều dùng @Injectable() decorator     │
│  và được quản lý bởi NestJS IoC Container    │
└──────────────────────────────────────────────┘
```

### 1.2. Các loại Provider phổ biến

| Loại | Mục đích | Ví dụ |
|------|---------|-------|
| **Service** | Business logic chính | `UsersService`, `OrdersService` |
| **Repository** | Truy cập database | `UsersRepository`, `ProductsRepository` |
| **Factory** | Tạo objects phức tạp | `ConnectionFactory`, `NotificationFactory` |
| **Helper/Utility** | Hàm tiện ích | `HashHelper`, `DateHelper` |
| **Strategy** | Implement algorithms | `PaymentStrategy`, `ShippingStrategy` |
| **Adapter** | Wrap external services | `EmailAdapter`, `SmsAdapter` |
| **Guard** | Bảo vệ routes | `AuthGuard`, `RolesGuard` |
| **Pipe** | Transform/validate data | `ValidationPipe`, `ParseIntPipe` |
| **Interceptor** | Xử lý trước/sau request | `LoggingInterceptor` |
| **Filter** | Xử lý exceptions | `HttpExceptionFilter` |

---

## 2. @Injectable() Decorator

### 2.1. Cơ bản

`@Injectable()` decorator đánh dấu một class là provider, cho phép NestJS IoC container quản lý và inject nó.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: number): Cat | undefined {
    return this.cats.find(cat => cat.id === id);
  }

  create(cat: Cat): Cat {
    this.cats.push(cat);
    return cat;
  }
}
```

### 2.2. Inject service vào controller

```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  // Constructor injection - cách phổ biến nhất
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id);
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }
}
```

### 2.3. Inject service vào service khác

```typescript
@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {}

  async notifyUser(userId: number, message: string, channels: string[]) {
    const promises = [];

    if (channels.includes('email')) {
      promises.push(this.emailService.send(userId, message));
    }
    if (channels.includes('sms')) {
      promises.push(this.smsService.send(userId, message));
    }
    if (channels.includes('push')) {
      promises.push(this.pushService.send(userId, message));
    }

    await Promise.all(promises);
  }
}
```

### 2.4. Đăng ký trong Module

```typescript
@Module({
  controllers: [CatsController],
  providers: [
    CatsService,
    // Đây là shorthand cho:
    // { provide: CatsService, useClass: CatsService }
  ],
  exports: [CatsService],
})
export class CatsModule {}
```

---

## 3. Service Layer Pattern

### 3.1. Kiến trúc 3 lớp (Three-tier Architecture)

```
┌─────────────────────────────────────┐
│        Controller Layer              │
│  (Nhận request, trả response)       │
│  - Route handling                   │
│  - Input validation (DTO)           │
│  - Response formatting              │
└──────────────┬──────────────────────┘
               │ gọi
               ▼
┌─────────────────────────────────────┐
│         Service Layer                │
│  (Business logic)                   │
│  - Xử lý nghiệp vụ                │
│  - Validation logic phức tạp       │
│  - Orchestration                    │
│  - Transaction management           │
└──────────────┬──────────────────────┘
               │ gọi
               ▼
┌─────────────────────────────────────┐
│        Repository Layer              │
│  (Data access)                      │
│  - CRUD operations                  │
│  - Database queries                 │
│  - Data mapping                     │
└─────────────────────────────────────┘
```

### 3.2. Ví dụ: User Management

```typescript
// === entities/user.entity.ts ===
export class User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// === users.repository.ts ===
// Repository: chỉ lo data access
@Injectable()
export class UsersRepository {
  private users: User[] = [];
  private nextId = 1;

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: this.nextId++,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date(),
    };
    return this.users[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

// === users.service.ts ===
// Service: business logic, orchestration
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.findAll();
    // Loại bỏ password trước khi trả về
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Business logic: kiểm tra email đã tồn tại
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Business logic: hash password
    const hashedPassword = await this.hashService.hash(createUserDto.password);

    // Tạo user
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Business logic: gửi email chào mừng
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Kiểm tra user tồn tại
    await this.findOne(id);

    // Nếu cập nhật email, kiểm tra trùng
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // Nếu cập nhật password, hash lại
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(updateUserDto.password);
    }

    const user = await this.usersRepository.update(id, updateUserDto);
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}

// === users.controller.ts ===
// Controller: chỉ lo routing
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

---

## 4. Custom Providers

NestJS hỗ trợ 4 cách tạo custom providers: `useClass`, `useValue`, `useFactory`, `useExisting`.

### 4.1. useClass - Provider dùng class

```typescript
// Cách viết đầy đủ (tương đương shorthand)
@Module({
  providers: [
    {
      provide: CatsService,      // Token (key)
      useClass: CatsService,     // Class implementation
    },
  ],
})
export class CatsModule {}

// Shorthand (NestJS tự hiểu):
@Module({
  providers: [CatsService],
})
export class CatsModule {}
```

**Use case: Thay đổi implementation dựa trên environment:**

```typescript
// Interface/Abstract class
export abstract class ConfigService {
  abstract get(key: string): string;
}

// Implementation cho development
@Injectable()
export class DevelopmentConfigService extends ConfigService {
  get(key: string): string {
    return process.env[key] || 'dev-default';
  }
}

// Implementation cho production
@Injectable()
export class ProductionConfigService extends ConfigService {
  get(key: string): string {
    // Đọc từ secret manager (AWS Secrets Manager, Vault...)
    return process.env[key];
  }
}

// Module chọn implementation dựa trên environment
@Module({
  providers: [
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? ProductionConfigService
          : DevelopmentConfigService,
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}

// Sử dụng:
@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {
    // Tự động nhận đúng implementation dựa trên environment
  }
}
```

### 4.2. useValue - Provider dùng giá trị cụ thể

```typescript
// Dùng cho: constants, mock objects, external libraries

// Constant values
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: 'my-secret-api-key-123',
    },
    {
      provide: 'APP_CONFIG',
      useValue: {
        appName: 'My NestJS App',
        version: '1.0.0',
        port: 3000,
        isProduction: false,
      },
    },
    {
      provide: 'ALLOWED_ORIGINS',
      useValue: ['http://localhost:3000', 'https://myapp.com'],
    },
  ],
})
export class AppModule {}

// Inject bằng @Inject() decorator với token string
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_KEY') private readonly apiKey: string,
    @Inject('APP_CONFIG') private readonly config: AppConfig,
    @Inject('ALLOWED_ORIGINS') private readonly origins: string[],
  ) {
    console.log(`API Key: ${this.apiKey}`);
    console.log(`App: ${this.config.appName}`);
  }
}
```

**Mock object cho testing:**

```typescript
// Mock service cho testing
const mockCatsService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Tom' }),
  create: jest.fn().mockResolvedValue({ id: 1, name: 'Tom' }),
};

// Trong test module
const module = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService, // Thay thế real service bằng mock
    },
  ],
}).compile();
```

### 4.3. useFactory - Provider dùng factory function

Factory cho phép tạo provider **động** dựa trên dependencies khác.

```typescript
// Factory đơn giản
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const connection = await createDatabaseConnection({
          host: 'localhost',
          port: 5432,
          database: 'myapp',
        });
        return connection;
      },
    },
  ],
})
export class DatabaseModule {}

// Factory với dependencies (inject)
@Module({
  providers: [
    ConfigService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createDatabaseConnection({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
        });
        return connection;
      },
      inject: [ConfigService], // Inject ConfigService vào factory
    },
  ],
})
export class DatabaseModule {}
```

**Ví dụ phức tạp hơn:**

```typescript
// Factory tạo logger dựa trên environment
@Module({
  providers: [
    ConfigService,
    {
      provide: 'LOGGER',
      useFactory: (configService: ConfigService) => {
        const environment = configService.get('NODE_ENV');

        if (environment === 'production') {
          // Production: dùng structured logging (JSON)
          return new ProductionLogger({
            level: 'warn',
            format: 'json',
            transport: 'file',
          });
        }

        if (environment === 'test') {
          // Test: silent logger
          return new SilentLogger();
        }

        // Development: console logger với colors
        return new DevelopmentLogger({
          level: 'debug',
          format: 'pretty',
          transport: 'console',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['LOGGER'],
})
export class LoggerModule {}

// Sử dụng:
@Injectable()
export class UsersService {
  constructor(@Inject('LOGGER') private readonly logger: Logger) {
    this.logger.info('UsersService initialized');
  }
}
```

### 4.4. useExisting - Alias Provider

`useExisting` tạo alias cho một provider đã tồn tại. Hai tokens sẽ trỏ đến cùng một instance.

```typescript
// Tạo alias: 'AliasedLoggerService' trỏ đến cùng instance với LoggerService
@Module({
  providers: [
    LoggerService,
    {
      provide: 'AliasedLoggerService',
      useExisting: LoggerService,
      // AliasedLoggerService và LoggerService là CÙNG MỘT instance
    },
  ],
  exports: [LoggerService, 'AliasedLoggerService'],
})
export class LoggerModule {}
```

**Use case thực tế: Backward compatibility**

```typescript
// Khi rename service, giữ lại tên cũ cho backward compatibility
@Module({
  providers: [
    NewUsersService,
    {
      provide: 'OldUsersService', // Tên cũ
      useExisting: NewUsersService, // Trỏ đến service mới
    },
  ],
})
export class UsersModule {}

// Code cũ vẫn hoạt động:
@Injectable()
export class OldController {
  constructor(@Inject('OldUsersService') private usersService: any) {}
}

// Code mới dùng service mới:
@Injectable()
export class NewController {
  constructor(private readonly usersService: NewUsersService) {}
}
```

### 4.5. Injection Tokens

Khi dùng string token, nên tạo constants để tránh typo:

```typescript
// === constants/injection-tokens.ts ===
export const INJECTION_TOKENS = {
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  CACHE_MANAGER: 'CACHE_MANAGER',
  LOGGER: 'LOGGER',
  CONFIG: 'CONFIG',
  MAIL_TRANSPORT: 'MAIL_TRANSPORT',
} as const;

// Hoặc dùng Symbol (unique, không bị trùng):
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const CACHE_MANAGER = Symbol('CACHE_MANAGER');
export const LOGGER = Symbol('LOGGER');

// Sử dụng:
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => createConnection(),
    },
  ],
})
export class DatabaseModule {}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}
}
```

---

## 5. Provider Scope

### 5.1. Các loại Scope

NestJS hỗ trợ 3 loại scope cho providers:

| Scope | Mô tả | Lifetime |
|-------|--------|----------|
| `DEFAULT` | Singleton - 1 instance cho toàn bộ app | Suốt vòng đời app |
| `REQUEST` | 1 instance mới cho mỗi request | Trong 1 request |
| `TRANSIENT` | 1 instance mới mỗi khi inject | Mỗi lần inject |

### 5.2. DEFAULT Scope (Singleton)

```typescript
// Mặc định: Singleton
// Tất cả controllers/services dùng chung 1 instance
@Injectable() // scope: Scope.DEFAULT (mặc định)
export class CatsService {
  private cats: Cat[] = [];

  // CẢNH BÁO: Vì là singleton, state được chia sẻ giữa tất cả requests!
  // Điều này có thể gây ra race condition trong concurrent requests
  addCat(cat: Cat) {
    this.cats.push(cat); // Tất cả requests đều thấy cùng danh sách cats
  }
}
```

### 5.3. REQUEST Scope

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  constructor(@Inject(REQUEST) private readonly request: Request) {
    // Mỗi request tạo instance mới
    // Có thể truy cập request object
    console.log(`New instance for: ${request.url}`);
  }

  getCurrentUser() {
    return this.request['user']; // Lấy user từ request (sau khi qua auth middleware/guard)
  }

  getRequestId() {
    return this.request.headers['x-request-id'];
  }
}

// Khai báo trong module:
@Module({
  providers: [RequestScopedService],
})
export class UsersModule {}
```

**Lưu ý quan trọng về REQUEST scope:**

```typescript
// Khi một provider có scope REQUEST, tất cả providers
// phụ thuộc vào nó CŨNG sẽ trở thành REQUEST scope!

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}

@Injectable() // Sẽ TỰ ĐỘNG trở thành REQUEST scope
export class UsersService {
  constructor(
    private readonly auditService: AuditService, // AuditService là REQUEST scope
    // => UsersService cũng sẽ là REQUEST scope
  ) {}
}

// Điều này ảnh hưởng đến PERFORMANCE vì mỗi request
// đều tạo instance mới cho UsersService
```

### 5.4. TRANSIENT Scope

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private instanceId = Math.random().toString(36).substr(2, 9);

  constructor() {
    console.log(`TransientService created: ${this.instanceId}`);
  }

  getId() {
    return this.instanceId;
  }
}

// Mỗi consumer nhận instance riêng:
@Injectable()
export class ServiceA {
  constructor(private transientService: TransientService) {
    // transientService có instanceId = 'abc123'
  }
}

@Injectable()
export class ServiceB {
  constructor(private transientService: TransientService) {
    // transientService có instanceId = 'xyz789' (KHÁC với ServiceA)
  }
}
```

### 5.5. Khi nào dùng scope nào?

```typescript
// DEFAULT (Singleton) - Mặc định, nên dùng cho hầu hết trường hợp
// ✅ Stateless services
// ✅ Services kết nối database
// ✅ Services dùng chung (Email, Logger, Cache)
@Injectable()
export class EmailService {} // Singleton - 1 instance

// REQUEST - Khi cần truy cập request-specific data
// ✅ Audit logging (cần biết ai gọi)
// ✅ Multi-tenancy (mỗi request thuộc tenant khác)
// ✅ Request-scoped caching
// ⚠️ Ảnh hưởng performance
@Injectable({ scope: Scope.REQUEST })
export class TenantService {} // Mỗi request tạo mới

// TRANSIENT - Khi mỗi consumer cần instance riêng
// ✅ Stateful services (có internal state khác nhau cho mỗi consumer)
// ✅ Logger với context riêng
@Injectable({ scope: Scope.TRANSIENT })
export class ContextLogger {} // Mỗi inject tạo mới
```

---

## 6. Async Providers

### 6.1. Factory async

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        // Có thể await operations bất đồng bộ
        const connection = await createConnection({
          host: 'localhost',
          port: 5432,
          database: 'myapp',
        });

        // Đợi connection sẵn sàng
        await connection.initialize();

        console.log('Database connected successfully');
        return connection;
      },
    },
  ],
  exports: ['ASYNC_CONNECTION'],
})
export class DatabaseModule {}
```

### 6.2. Factory async với dependencies

```typescript
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          url: configService.get<string>('REDIS_URL'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });

        await client.connect();
        console.log('Redis connected');

        // Cleanup khi app tắt
        process.on('SIGTERM', async () => {
          await client.quit();
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

### 6.3. Nhiều async providers phụ thuộc nhau

```typescript
@Module({
  providers: [
    ConfigService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        return await createDatabaseConnection(configService.get('DB_URL'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: async (connection: any) => {
        // Phụ thuộc vào DATABASE_CONNECTION
        return connection.getRepository('User');
      },
      inject: ['DATABASE_CONNECTION'],
    },
    {
      provide: UsersService,
      useFactory: async (userRepository: any, configService: ConfigService) => {
        // Phụ thuộc vào USER_REPOSITORY và ConfigService
        const service = new UsersService(userRepository);
        await service.initialize(configService.get('USER_DEFAULTS'));
        return service;
      },
      inject: ['USER_REPOSITORY', ConfigService],
    },
  ],
})
export class UsersModule {}
```

---

## 7. Optional Providers

### 7.1. @Optional() Decorator

Khi một dependency có thể không tồn tại (chưa được đăng ký), dùng `@Optional()` để tránh lỗi.

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService {
  constructor(
    @Optional()
    @Inject('HTTP_OPTIONS')
    private readonly httpOptions?: HttpModuleOptions,
  ) {
    // Nếu HTTP_OPTIONS không được đăng ký, httpOptions = undefined
    // Không có @Optional() sẽ throw error!
    if (this.httpOptions) {
      console.log(`HTTP configured with timeout: ${this.httpOptions.timeout}`);
    } else {
      console.log('Using default HTTP options');
    }
  }
}
```

### 7.2. Ví dụ thực tế

```typescript
@Injectable()
export class LoggerService {
  constructor(
    @Optional()
    @Inject('LOGGER_CONFIG')
    private readonly config?: LoggerConfig,

    @Optional()
    @Inject('EXTERNAL_LOGGER')
    private readonly externalLogger?: ExternalLogger,
  ) {
    this.logLevel = config?.level || 'info';
  }

  log(message: string) {
    // Nếu có external logger, dùng nó
    if (this.externalLogger) {
      this.externalLogger.log(message);
      return;
    }

    // Fallback: console.log
    console.log(`[${this.logLevel}] ${message}`);
  }
}

// Module KHÔNG đăng ký LOGGER_CONFIG và EXTERNAL_LOGGER
@Module({
  providers: [LoggerService],
  // LoggerService vẫn hoạt động với giá trị mặc định
})
export class LoggerModule {}

// Module có đăng ký config
@Module({
  providers: [
    LoggerService,
    {
      provide: 'LOGGER_CONFIG',
      useValue: { level: 'debug', format: 'json' },
    },
  ],
})
export class DetailedLoggerModule {}
```

---

## 8. Property-based Injection

### 8.1. Cơ bản

Ngoài constructor injection, NestJS hỗ trợ property-based injection:

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Property-based injection
  @Inject(LoggerService)
  private readonly logger: LoggerService;

  @Inject('CONFIG')
  private readonly config: AppConfig;

  findAll() {
    this.logger.log('Finding all users');
    return [];
  }
}
```

### 8.2. Khi nào dùng Property-based Injection?

```typescript
// Trường hợp 1: Base class có dependencies
// Khi dùng constructor injection, subclass phải forward dependencies
// Property injection giúp tránh vấn đề này

// VẤN ĐỀ với constructor injection:
@Injectable()
export class BaseService {
  constructor(private readonly logger: LoggerService) {}
}

@Injectable()
export class UsersService extends BaseService {
  constructor(
    logger: LoggerService,  // Phải forward logger
    private readonly repo: UsersRepository,
  ) {
    super(logger);  // Phải gọi super()
  }
}

// GIẢI PHÁP với property injection:
@Injectable()
export class BaseService {
  @Inject(LoggerService)
  protected readonly logger: LoggerService;
  // Subclass không cần biết về logger
}

@Injectable()
export class UsersService extends BaseService {
  constructor(private readonly repo: UsersRepository) {}
  // Không cần forward logger, tự động inject qua property
}
```

### 8.3. Lưu ý

> **Khuyến nghị:** Ưu tiên dùng **constructor injection** vì:
> - Dễ test hơn (mock qua constructor)
> - Dependencies rõ ràng hơn (nhìn constructor biết ngay)
> - Immutable (readonly)
> - TypeScript strict mode kiểm tra tốt hơn

---

## 9. Circular Dependency (forwardRef)

### 9.1. Vấn đề

```typescript
// CatsService cần DogsService
@Injectable()
export class CatsService {
  constructor(private readonly dogsService: DogsService) {} // Lỗi!
}

// DogsService cần CatsService
@Injectable()
export class DogsService {
  constructor(private readonly catsService: CatsService) {} // Lỗi!
}

// Error: A circular dependency has been detected
```

### 9.2. Giải pháp: forwardRef()

```typescript
import { Injectable, Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => DogsService))
    private readonly dogsService: DogsService,
  ) {}

  getCatsWithDogs() {
    const dogs = this.dogsService.findAll();
    return { cats: this.findAll(), dogs };
  }

  findAll() {
    return ['Tom', 'Garfield'];
  }
}

@Injectable()
export class DogsService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}

  getDogsWithCats() {
    const cats = this.catsService.findAll();
    return { dogs: this.findAll(), cats };
  }

  findAll() {
    return ['Rex', 'Buddy'];
  }
}
```

**Module cũng cần forwardRef:**

```typescript
@Module({
  imports: [forwardRef(() => DogsModule)],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

@Module({
  imports: [forwardRef(() => CatsModule)],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {}
```

### 9.3. Cách tránh Circular Dependency (tốt hơn)

```typescript
// Giải pháp 1: Tách logic chung vào shared service
@Injectable()
export class PetRelationService {
  // Logic liên quan đến quan hệ giữa cats và dogs
  findPetFriends(petId: number) { }
}

// Giải pháp 2: Dùng Events/EventEmitter
@Injectable()
export class CatsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createCat(dto: CreateCatDto) {
    const cat = await this.catsRepo.create(dto);
    // Emit event thay vì gọi trực tiếp DogsService
    this.eventEmitter.emit('cat.created', cat);
    return cat;
  }
}

@Injectable()
export class DogsService {
  @OnEvent('cat.created')
  handleCatCreated(cat: Cat) {
    // Xử lý khi cat mới được tạo
    console.log(`New cat created: ${cat.name}, notify related dogs`);
  }
}

// Giải pháp 3: Mediator/Orchestrator pattern
@Injectable()
export class PetOrchestrator {
  constructor(
    private readonly catsService: CatsService,
    private readonly dogsService: DogsService,
  ) {}

  getAnimalFriends(animalId: number) {
    const cats = this.catsService.findAll();
    const dogs = this.dogsService.findAll();
    return { cats, dogs };
  }
}
```

---

## 10. Ví dụ thực tế hoàn chỉnh

### 10.1. Payment System với Strategy Pattern

```typescript
// === interfaces/payment-strategy.interface.ts ===
export interface PaymentStrategy {
  pay(amount: number, details: Record<string, any>): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  method: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
}

// === strategies/stripe-payment.strategy.ts ===
@Injectable()
export class StripePaymentStrategy implements PaymentStrategy {
  constructor(@Inject('STRIPE_API_KEY') private readonly apiKey: string) {}

  async pay(amount: number, details: Record<string, any>): Promise<PaymentResult> {
    console.log(`[Stripe] Charging ${amount} with card ${details.cardNumber}`);
    // Gọi Stripe API...
    return {
      success: true,
      transactionId: `stripe_${Date.now()}`,
      amount,
      method: 'stripe',
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    console.log(`[Stripe] Refunding ${amount} for ${transactionId}`);
    return { success: true, refundId: `refund_${Date.now()}`, amount };
  }
}

// === strategies/paypal-payment.strategy.ts ===
@Injectable()
export class PaypalPaymentStrategy implements PaymentStrategy {
  constructor(@Inject('PAYPAL_CONFIG') private readonly config: any) {}

  async pay(amount: number, details: Record<string, any>): Promise<PaymentResult> {
    console.log(`[PayPal] Charging ${amount} to ${details.email}`);
    return {
      success: true,
      transactionId: `paypal_${Date.now()}`,
      amount,
      method: 'paypal',
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    console.log(`[PayPal] Refunding ${amount} for ${transactionId}`);
    return { success: true, refundId: `refund_${Date.now()}`, amount };
  }
}

// === strategies/momo-payment.strategy.ts ===
@Injectable()
export class MomoPaymentStrategy implements PaymentStrategy {
  async pay(amount: number, details: Record<string, any>): Promise<PaymentResult> {
    console.log(`[MoMo] Charging ${amount} to phone ${details.phone}`);
    return {
      success: true,
      transactionId: `momo_${Date.now()}`,
      amount,
      method: 'momo',
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    return { success: true, refundId: `refund_${Date.now()}`, amount };
  }
}

// === payment.service.ts ===
@Injectable()
export class PaymentService {
  private strategies: Map<string, PaymentStrategy> = new Map();

  constructor(
    private readonly stripeStrategy: StripePaymentStrategy,
    private readonly paypalStrategy: PaypalPaymentStrategy,
    private readonly momoStrategy: MomoPaymentStrategy,
  ) {
    this.strategies.set('stripe', stripeStrategy);
    this.strategies.set('paypal', paypalStrategy);
    this.strategies.set('momo', momoStrategy);
  }

  async processPayment(
    method: string,
    amount: number,
    details: Record<string, any>,
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException(`Payment method "${method}" is not supported`);
    }
    return strategy.pay(amount, details);
  }

  async processRefund(
    method: string,
    transactionId: string,
    amount: number,
  ): Promise<RefundResult> {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException(`Payment method "${method}" is not supported`);
    }
    return strategy.refund(transactionId, amount);
  }
}

// === payment.module.ts ===
@Module({
  providers: [
    {
      provide: 'STRIPE_API_KEY',
      useValue: process.env.STRIPE_API_KEY || 'sk_test_xxx',
    },
    {
      provide: 'PAYPAL_CONFIG',
      useValue: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: 'sandbox',
      },
    },
    StripePaymentStrategy,
    PaypalPaymentStrategy,
    MomoPaymentStrategy,
    PaymentService,
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
```

### 10.2. Logger Service với Transient Scope

```typescript
// === logger.service.ts ===
import { Injectable, Scope, Inject } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string = 'Application';

  // INQUIRER cho biết class nào đã inject LoggerService
  constructor(@Inject(INQUIRER) private parentClass: object) {
    this.context = parentClass?.constructor?.name || 'Unknown';
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
  }

  log(message: string): void {
    console.log(this.formatMessage('log', message));
  }

  error(message: string, trace?: string): void {
    console.error(this.formatMessage('error', message));
    if (trace) console.error(trace);
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  debug(message: string): void {
    console.debug(this.formatMessage('debug', message));
  }
}

// Sử dụng:
@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {}

  findAll() {
    this.logger.log('Finding all users');
    // Output: [2026-03-03T10:00:00.000Z] [LOG] [UsersService] Finding all users
    return [];
  }
}

@Injectable()
export class OrdersService {
  constructor(private readonly logger: LoggerService) {}

  create() {
    this.logger.log('Creating order');
    // Output: [2026-03-03T10:00:00.000Z] [LOG] [OrdersService] Creating order
    // Context tự động khác nhau cho mỗi service!
  }
}
```

---

## 11. Lỗi thường gặp

### 11.1. Quên @Injectable()

```typescript
// LỖI: Class không có @Injectable()
export class CatsService {
  findAll() { return []; }
}

// Error: Nest can't resolve dependencies of the CatsController (?).
// Make sure that the argument CatsService is available in the CatsModule context.

// ĐÚNG:
@Injectable() // Phải có decorator này
export class CatsService {
  findAll() { return []; }
}
```

### 11.2. Quên đăng ký trong providers

```typescript
// LỖI: Service được inject nhưng không đăng ký trong module
@Module({
  controllers: [CatsController],
  // providers: [CatsService], // Quên!
})
export class CatsModule {}

// Error: Nest can't resolve dependencies of the CatsController (?).

// ĐÚNG:
@Module({
  controllers: [CatsController],
  providers: [CatsService], // Phải đăng ký
})
export class CatsModule {}
```

### 11.3. Inject string token mà quên @Inject()

```typescript
// LỖI:
@Injectable()
export class UsersService {
  constructor(
    private readonly apiKey: string, // NestJS không biết inject gì!
  ) {}
}

// ĐÚNG:
@Injectable()
export class UsersService {
  constructor(
    @Inject('API_KEY') private readonly apiKey: string,
  ) {}
}
```

### 11.4. Request scope ảnh hưởng performance

```typescript
// CẢNH BÁO: Khi 1 provider là REQUEST scope,
// tất cả providers phụ thuộc nó cũng thành REQUEST scope

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {} // REQUEST scope

@Injectable() // TỰ ĐỘNG thành REQUEST scope vì phụ thuộc RequestContextService
export class UsersService {
  constructor(private readonly context: RequestContextService) {}
}

@Injectable() // TỰ ĐỘNG thành REQUEST scope vì phụ thuộc UsersService
export class OrdersService {
  constructor(private readonly usersService: UsersService) {}
}

// Toàn bộ chain đều tạo instance mới cho mỗi request!
// Giải pháp: Hạn chế dùng REQUEST scope, hoặc tách riêng
```

---

## 12. Bài tập

### Bài tập 1: Service cơ bản (Cơ bản)

Tạo `TodosService` với các method:

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// Methods:
// - findAll(): Todo[]
// - findOne(id: number): Todo
// - create(dto: CreateTodoDto): Todo
// - update(id: number, dto: UpdateTodoDto): Todo
// - remove(id: number): void
// - toggleComplete(id: number): Todo
// - findByStatus(completed: boolean): Todo[]
```

### Bài tập 2: Custom Providers (Trung bình)

Tạo hệ thống notification với:

1. `useValue`: Đăng ký config cho notification
2. `useFactory`: Tạo notification client dựa trên config
3. `useClass`: Chọn implementation (Email/SMS) dựa trên environment
4. `useExisting`: Tạo alias cho backward compatibility

```typescript
// Config
{
  provide: 'NOTIFICATION_CONFIG',
  useValue: { defaultChannel: 'email', retryCount: 3 }
}

// Factory
{
  provide: 'NOTIFICATION_CLIENT',
  useFactory: (config) => new NotificationClient(config),
  inject: ['NOTIFICATION_CONFIG']
}
```

### Bài tập 3: Provider Scope (Trung bình)

1. Tạo `RequestLoggerService` với REQUEST scope
   - Log request URL, method, timestamp
2. Tạo `InstanceCounterService` với TRANSIENT scope
   - Đếm số instances được tạo
3. Tạo `CacheService` với DEFAULT scope
   - In-memory cache dùng Map

Quan sát và ghi lại behavior của từng scope.

### Bài tập 4: Repository Pattern (Trung bình)

Implement repository pattern cho Product management:

1. `ProductsRepository` - CRUD operations với in-memory array
2. `ProductsService` - Business logic (kiểm tra tồn kho, tính giá...)
3. `ProductsController` - Route handling

Yêu cầu:
- Service KHÔNG truy cập trực tiếp data, phải qua Repository
- Controller KHÔNG chứa business logic, phải qua Service

### Bài tập 5: Strategy Pattern (Nâng cao)

Tạo hệ thống shipping calculator:

1. Interface `ShippingStrategy`:
   - `calculateCost(weight: number, distance: number): number`
   - `getEstimatedDays(distance: number): number`

2. Implementations:
   - `StandardShipping`: Giá rẻ, 5-7 ngày
   - `ExpressShipping`: Giá trung bình, 2-3 ngày
   - `OvernightShipping`: Giá cao, 1 ngày

3. `ShippingService`:
   - `calculateShipping(method: string, weight: number, distance: number)`
   - Dùng factory provider để tạo strategy map

### Bài tập 6: Async Providers (Nâng cao)

Tạo module `DatabaseModule` với:

1. Async provider `DATABASE_CONNECTION` dùng `useFactory`:
   - Giả lập kết nối database (setTimeout 2 giây)
   - Log trạng thái kết nối
2. Provider `UsersRepository` phụ thuộc vào `DATABASE_CONNECTION`
3. Xử lý cleanup khi app shutdown

---

## Tổng kết

Trong bài này, bạn đã học:

1. **Provider concept** - Services, Repositories, Factories, Helpers
2. **@Injectable()** - Đánh dấu class là provider
3. **Service Layer Pattern** - Tách biệt controller, service, repository
4. **Custom Providers** - useClass, useValue, useFactory, useExisting
5. **Provider Scope** - DEFAULT (singleton), REQUEST, TRANSIENT
6. **Async Providers** - Factory functions bất đồng bộ
7. **Optional Providers** - @Optional() cho dependencies không bắt buộc
8. **Property-based Injection** - Alternative cho constructor injection
9. **Circular Dependency** - forwardRef() và cách tránh

Ở bài tiếp theo, chúng ta sẽ đi sâu vào **Dependency Injection** - cơ chế IoC Container của NestJS.
