# @Module() decorator, imports/controllers/providers/exports

## 1. Module la gi?

### 1.1. Khai niem

**Module** la thanh phan cot loi de to chuc ung dung NestJS. Moi ung dung NestJS co it nhat mot module - **root module** (thuong la `AppModule`). Root module la diem bat dau ma NestJS su dung de xay dung **application graph** - cau truc du lieu noi bo ma NestJS dung de resolve quan he giua cac modules, providers, va dependencies.

```
┌────────────────────────────────────────────────────┐
│                   AppModule (Root)                  │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ UsersModule   │  │ ProductsModule│  │ AuthModule│ │
│  │              │  │              │  │          │ │
│  │ - Controller │  │ - Controller │  │ - Guard  │ │
│  │ - Service    │  │ - Service    │  │ - Service│ │
│  │ - Repository │  │ - Repository │  │ - JWT    │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ DatabaseModule│  │ ConfigModule │               │
│  │ (Shared)      │  │ (Global)     │               │
│  └──────────────┘  └──────────────┘               │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 1.2. Vai tro cua Module

- **To chuc code**: Chia ung dung thanh cac phan rieng biet theo tinh nang (feature)
- **Encapsulation**: Moi module dong goi providers cua minh; providers khong the truy cap tu ben ngoai tru khi duoc export
- **Dependency management**: Quan ly dependencies giua cac phan cua ung dung
- **Reusability**: Module co the duoc tai su dung trong nhieu project

---

## 2. @Module() Decorator

### 2.1. Cu phap va thuoc tinh

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],       // Cac module can import
  controllers: [],   // Cac controller thuoc module nay
  providers: [],     // Cac provider (service, repository...) thuoc module nay
  exports: [],       // Cac provider ma module nay chia se cho modules khac
})
export class SomeModule {}
```

### 2.2. Giai thich chi tiet tung thuoc tinh

#### `imports` - Import modules khac

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Import module tu thu vien ben ngoai
    TypeOrmModule.forFeature([User]),

    // Import module tu feature khac trong project
    AuthModule,
  ],
})
export class UsersModule {}
```

**Khi import mot module, ban co quyen truy cap vao cac providers ma module do da EXPORT.**

#### `controllers` - Khai bao controllers

```typescript
@Module({
  controllers: [
    UsersController,
    AdminUsersController,
    // Co the co nhieu controllers trong 1 module
  ],
})
export class UsersModule {}
```

#### `providers` - Khai bao providers

```typescript
@Module({
  providers: [
    UsersService,
    UsersRepository,
    EmailService,
    // Bat ky class @Injectable() nao can dung trong module nay
  ],
})
export class UsersModule {}
```

> **Quan trong:** Providers chi co pham vi (scope) trong module khai bao chung. Neu module khac muon dung, can EXPORT provider do.

#### `exports` - Export providers cho modules khac

```typescript
@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // Chi export UsersService, KHONG export UsersRepository
})
export class UsersModule {}

// Khi module khac import UsersModule:
@Module({
  imports: [UsersModule],
  // Bay gio co the inject UsersService, nhung KHONG the inject UsersRepository
})
export class OrdersModule {}
```

### 2.3. Vi du hoan chinh

```typescript
// === users.module.ts ===
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Import TypeORM cho entity User
    AuthModule,                         // Import AuthModule de dung AuthService
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],  // Export de modules khac co the dung UsersService
})
export class UsersModule {}
```
