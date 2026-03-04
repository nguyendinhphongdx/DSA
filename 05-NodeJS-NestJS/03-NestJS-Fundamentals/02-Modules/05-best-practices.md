# Best practices to chuc modules

## 10. Best Practices to chuc Modules

### 10.1. Nguyen tac chung

1. **Mot module cho moi feature/domain**: Users, Products, Orders...
2. **Shared module cho utilities chung**: Logger, Email, Cache...
3. **Core module cho singleton services**: Database, Config...
4. **Tranh circular dependencies**: Dung shared module trung gian
5. **Han che @Global()**: Chi dung cho modules thuc su can thiet toan cuc
6. **Export co chon loc**: Chi export nhung gi can thiet

### 10.2. Cau truc project khuyen nghi

```
src/
├── main.ts
├── app.module.ts
│
├── core/                        # Core module (Global, singleton)
│   ├── core.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── configuration.ts     # Config factory
│   ├── database/
│   │   ├── database.module.ts
│   │   └── database.service.ts
│   └── logger/
│       ├── logger.module.ts
│       └── logger.service.ts
│
├── common/                      # Shared module (utilities)
│   ├── common.module.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── parse-object-id.pipe.ts
│   └── dto/
│       └── pagination.dto.ts
│
├── modules/                     # Feature modules
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   └── dto/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── entities/
│   │   └── dto/
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── entities/
│   │   └── dto/
│   └── orders/
│       ├── orders.module.ts
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       ├── entities/
│       └── dto/
│
└── shared/                      # Shared utilities / interfaces
    ├── interfaces/
    │   └── response.interface.ts
    ├── constants/
    │   └── app.constants.ts
    └── enums/
        └── role.enum.ts
```

### 10.3. Module Organization Pattern

```typescript
// === core/core.module.ts ===
// Core module: Global, chi import 1 lan o AppModule
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('app.isDevelopment'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CoreModule {}

// === common/common.module.ts ===
// Common module: Export shared providers
@Module({
  providers: [
    PaginationService,
    SlugService,
    FileUploadService,
  ],
  exports: [
    PaginationService,
    SlugService,
    FileUploadService,
  ],
})
export class CommonModule {}

// === app.module.ts ===
@Module({
  imports: [
    CoreModule,       // Global - import 1 lan
    CommonModule,     // Shared utilities

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
```

### 10.4. Quy tac dat ten

| Loai | Convention | Vi du |
|------|-----------|-------|
| Module file | `feature.module.ts` | `users.module.ts` |
| Module class | `FeatureModule` | `UsersModule` |
| Controller | `feature.controller.ts` | `users.controller.ts` |
| Service | `feature.service.ts` | `users.service.ts` |
| Entity | `feature.entity.ts` | `user.entity.ts` (singular) |
| DTO | `action-feature.dto.ts` | `create-user.dto.ts` |
| Interface | `feature.interface.ts` | `user.interface.ts` |
| Guard | `feature.guard.ts` | `jwt-auth.guard.ts` |
| Pipe | `feature.pipe.ts` | `validation.pipe.ts` |
| Filter | `feature.filter.ts` | `http-exception.filter.ts` |
| Interceptor | `feature.interceptor.ts` | `logging.interceptor.ts` |

---

## 11. Loi thuong gap

### 11.1. Provider not available

```
Error: Nest can't resolve dependencies of the OrdersService (?).
Please make sure that the argument UsersService at index [0]
is available in the OrdersModule context.

Potential solutions:
- If UsersService is a provider, is it part of the current OrdersModule?
- If UsersService is exported from a separate @Module, is that module
  imported within OrdersModule?
```

**Nguyen nhan:** OrdersModule can UsersService nhung chua import UsersModule.

**Giai phap:**

```typescript
// orders.module.ts
@Module({
  imports: [UsersModule], // Import UsersModule
  providers: [OrdersService],
})
export class OrdersModule {}

// users.module.ts
@Module({
  providers: [UsersService],
  exports: [UsersService], // PHAI export UsersService
})
export class UsersModule {}
```

### 11.2. Module khong duoc import vao AppModule

```
// Controller trong module khong hoat dong
// Routes khong duoc dang ky
```

**Giai phap:** Dam bao moi feature module deu duoc import vao root module hoac mot module con da duoc import.

```typescript
@Module({
  imports: [
    UsersModule, // Dung quen import!
  ],
})
export class AppModule {}
```

### 11.3. Export nhung quen khai bao trong providers

```typescript
// LOI: Export UsersService nhung khong khai bao trong providers
@Module({
  controllers: [UsersController],
  // providers: [UsersService], // Quen dong nay!
  exports: [UsersService], // Loi!
})
export class UsersModule {}

// DUNG:
@Module({
  controllers: [UsersController],
  providers: [UsersService], // Phai co
  exports: [UsersService],  // Moi export duoc
})
export class UsersModule {}
```
