# Feature modules, Shared modules, Global modules

## 3. Feature Modules

### 3.1. Khai niem

**Feature module** la module to chuc code lien quan den mot tinh nang cu the. Day la pattern chinh trong NestJS de chia nho ung dung.

### 3.2. Tao Feature Module

```bash
# Tao module bang CLI
nest generate module users
# hoac viet tat:
nest g mo users

# Tao day du CRUD resource:
nest generate resource products
# Ket qua: tao module, controller, service, dto, entity
```

### 3.3. Vi du: To chuc ung dung E-commerce

```
src/
├── app.module.ts                 # Root module
├── main.ts
│
├── users/                        # Feature: Quan ly users
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
├── products/                     # Feature: Quan ly san pham
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── entities/
│   │   └── product.entity.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
│
├── orders/                       # Feature: Quan ly don hang
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── entities/
│   │   └── order.entity.ts
│   └── dto/
│       ├── create-order.dto.ts
│       └── update-order.dto.ts
│
├── auth/                         # Feature: Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
│
└── common/                       # Shared utilities
    ├── common.module.ts
    ├── decorators/
    ├── filters/
    ├── guards/
    ├── interceptors/
    └── pipes/
```

```typescript
// === app.module.ts - Root Module ===
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Modules cau hinh (thuong la global)
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'ecommerce',
      autoLoadEntities: true,
      synchronize: true, // CHI dung trong development
    }),

    // Feature modules
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

```typescript
// === products/products.module.ts ===
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export de OrdersModule co the dung
})
export class ProductsModule {}
```

```typescript
// === orders/orders.module.ts ===
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UsersModule,      // Import de dung UsersService
    ProductsModule,   // Import de dung ProductsService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

```typescript
// === orders/orders.service.ts ===
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    // Co the inject UsersService vi OrdersModule import UsersModule
    // va UsersModule export UsersService
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async createOrder(userId: number, productId: number, quantity: number) {
    // Kiem tra user ton tai
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    // Kiem tra product ton tai
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    // Tao order...
    return {
      userId,
      productId,
      quantity,
      totalPrice: product.price * quantity,
    };
  }
}
```

---

## 4. Shared Modules

### 4.1. Khai niem

**Shared module** la module duoc thiet ke de chia se providers cho nhieu modules khac. Khi nhieu feature modules can dung chung mot service (vi du: `EmailService`, `LoggerService`), ta dat chung trong shared module.

### 4.2. Cach tao Shared Module

```typescript
// === common/common.module.ts ===
import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { EmailService } from './services/email.service';
import { SlugService } from './services/slug.service';
import { PaginationService } from './services/pagination.service';

@Module({
  providers: [
    LoggerService,
    EmailService,
    SlugService,
    PaginationService,
  ],
  exports: [
    LoggerService,
    EmailService,
    SlugService,
    PaginationService,
  ],
  // Luu y: export cac providers ma ban muon chia se
})
export class CommonModule {}
```

### 4.3. Su dung Shared Module

```typescript
// === users/users.module.ts ===
@Module({
  imports: [CommonModule], // Import CommonModule
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// === products/products.module.ts ===
@Module({
  imports: [CommonModule], // Import CommonModule
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

### 4.4. Singleton behavior

**Quan trong:** Trong NestJS, modules mac dinh la **singleton**. Khi nhieu modules import cung mot module, chung chia se cung mot instance. Dieu nay co nghia:

```typescript
// CommonModule chi duoc khoi tao 1 lan
// UsersModule va ProductsModule dung chung cung instance
// cua LoggerService, EmailService...

// UsersModule --> import CommonModule --> LoggerService (instance A)
// ProductsModule --> import CommonModule --> LoggerService (cung instance A)
```

---

## 5. Global Modules (@Global)

### 5.1. Van de

Khi co mot module can duoc dung o **moi noi** trong ung dung (vi du: ConfigModule, DatabaseModule, LoggerModule), viec phai import no vao tung feature module la rat phien phuc:

```typescript
// Khong dung @Global - phai import o moi noi
@Module({ imports: [ConfigModule, LoggerModule, ...] })
export class UsersModule {}

@Module({ imports: [ConfigModule, LoggerModule, ...] })
export class ProductsModule {}

@Module({ imports: [ConfigModule, LoggerModule, ...] })
export class OrdersModule {}
// ... lap lai cho moi module
```

### 5.2. Giai phap: @Global()

```typescript
import { Module, Global } from '@nestjs/common';

@Global() // Danh dau module nay la global
@Module({
  providers: [
    ConfigService,
    LoggerService,
    CacheService,
  ],
  exports: [
    ConfigService,
    LoggerService,
    CacheService,
  ],
})
export class CoreModule {}
```

### 5.3. Su dung Global Module

```typescript
// === app.module.ts ===
@Module({
  imports: [
    CoreModule, // Chi can import 1 lan o root module
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}

// === users/users.service.ts ===
@Injectable()
export class UsersService {
  // ConfigService va LoggerService tu dong available
  // ma KHONG can import CoreModule trong UsersModule
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}
}
```

### 5.4. Luu y quan trong

> **Canh bao:** Khong nen lam dung `@Global()`. Chi dung cho cac module thuc su can thiet o moi noi. Lam dung global modules lam giam tinh encapsulation va kho debug dependencies.

**Nen dung `@Global()` cho:**
- ConfigModule
- DatabaseModule (connection)
- LoggerModule
- CacheModule

**KHONG nen dung `@Global()` cho:**
- Feature modules (UsersModule, ProductsModule)
- Modules co business logic cu the

---

## 7. Module Re-exporting

### 7.1. Khai niem

Module co the **re-export** cac modules ma no import. Dieu nay giup tao cac "aggregate modules" - modules tong hop nhieu modules nho.

### 7.2. Vi du

```typescript
// === common/common.module.ts ===
// Module tong hop, re-export nhieu modules
@Module({
  imports: [
    LoggerModule,
    EmailModule,
    HelperModule,
  ],
  exports: [
    // Re-export toan bo modules da import
    // Bat ky module nao import CommonModule se co quyen
    // truy cap providers tu LoggerModule, EmailModule, HelperModule
    LoggerModule,
    EmailModule,
    HelperModule,
  ],
})
export class CommonModule {}

// === users/users.module.ts ===
@Module({
  imports: [CommonModule],
  // Tu dong co quyen truy cap LoggerService, EmailService, HelperService
  // ma KHONG can import tung module rieng le
})
export class UsersModule {}
```

### 7.3. Aggregate Module Pattern

```typescript
// Tao DatabaseModule re-export TypeOrmModule
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'myapp',
    }),
  ],
  exports: [TypeOrmModule], // Re-export TypeOrmModule
})
export class DatabaseModule {}

// Tao SharedModule tong hop tat ca shared concerns
@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    CacheModule.forRoot({ store: 'memory', ttl: 60 }),
  ],
  exports: [
    DatabaseModule,
    LoggerModule,
    CacheModule,
  ],
})
export class SharedModule {}
```
