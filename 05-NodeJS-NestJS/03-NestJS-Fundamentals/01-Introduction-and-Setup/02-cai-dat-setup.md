# Cài đặt CLI, tạo project, cấu trúc project

## 5. Cài đặt NestJS CLI

### 5.1. Yêu cầu hệ thống

- **Node.js** >= 16 (khuyến nghị >= 18 LTS)
- **npm** >= 8 hoặc **yarn** >= 1.22 hoặc **pnpm** >= 8

Kiểm tra phiên bản:

```bash
node --version   # v18.17.0 trở lên
npm --version    # 9.x trở lên
```

### 5.2. Cài đặt NestJS CLI globally

```bash
# Sử dụng npm
npm install -g @nestjs/cli

# Hoặc sử dụng yarn
yarn global add @nestjs/cli

# Hoặc sử dụng pnpm
pnpm add -g @nestjs/cli

# Kiểm tra cài đặt thành công
nest --version
# Output: 10.x.x
```

### 5.3. Các lệnh NestJS CLI quan trọng

```bash
# Xem tất cả lệnh
nest --help

# Các lệnh generate (tạo mới):
nest generate module users       # hoặc: nest g mo users
nest generate controller users   # hoặc: nest g co users
nest generate service users      # hoặc: nest g s users
nest generate resource users     # hoặc: nest g res users (tạo CRUD đầy đủ)
nest generate pipe validation    # hoặc: nest g pi validation
nest generate guard auth         # hoặc: nest g gu auth
nest generate interceptor logging # hoặc: nest g itc logging
nest generate filter http-exception # hoặc: nest g f http-exception
nest generate middleware logger  # hoặc: nest g mi logger
nest generate class user.entity  # hoặc: nest g cl user.entity
nest generate interface user     # hoặc: nest g itf user

# Các lệnh khác:
nest info    # Thông tin hệ thống và dependencies
nest build   # Build project
nest start   # Chạy project
```

---

## 6. Tạo project mới

### 6.1. Tạo project bằng CLI

```bash
# Tạo project mới
nest new my-nestjs-app

# CLI sẽ hỏi bạn chọn package manager:
# ? Which package manager would you ❤️ to use?
#   npm
#   yarn
# > pnpm

# Nếu muốn bỏ qua prompt, chỉ định package manager:
nest new my-nestjs-app --package-manager pnpm

# Tạo project trong thư mục hiện tại:
nest new . --package-manager pnpm

# Nếu muốn dùng strict mode TypeScript:
nest new my-nestjs-app --strict
```

### 6.2. Tạo project thủ công (không dùng CLI)

```bash
mkdir my-nestjs-app && cd my-nestjs-app
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
npm install -D @nestjs/cli @nestjs/schematics typescript @types/node ts-node
```

---

## 7. Cấu trúc project mặc định

Sau khi chạy `nest new my-nestjs-app`, cấu trúc project sẽ như sau:

```
my-nestjs-app/
├── node_modules/
├── src/
│   ├── app.controller.ts        # Controller gốc với route mẫu
│   ├── app.controller.spec.ts   # Unit test cho controller
│   ├── app.module.ts            # Module gốc (root module)
│   ├── app.service.ts           # Service gốc
│   └── main.ts                  # Entry point - khởi tạo ứng dụng
├── test/
│   ├── app.e2e-spec.ts          # End-to-end test
│   └── jest-e2e.json            # E2E test config
├── .eslintrc.js                 # ESLint config
├── .prettierrc                  # Prettier config
├── nest-cli.json                # NestJS CLI config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tsconfig.build.json          # TypeScript build config
└── README.md                    # Project readme
```

### 7.1. Giải thích các file cấu hình

**nest-cli.json:**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,    // BẮT BUỘC cho NestJS
    "experimentalDecorators": true,    // BẮT BUỘC cho NestJS
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

> **Quan trọng:** `emitDecoratorMetadata` và `experimentalDecorators` PHẢI được bật trong `tsconfig.json`. Nếu thiếu, NestJS sẽ không hoạt động vì DI dựa vào metadata của decorators.

---

## 8. Phân tích các file chính

### 8.1. main.ts - Entry Point

```typescript
// main.ts - Điểm khởi đầu của ứng dụng
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo instance của NestJS application
  // NestFactory.create() nhận Root Module làm tham số
  const app = await NestFactory.create(AppModule);

  // Cấu hình thêm (tùy chọn):

  // Bật CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Thêm global prefix cho tất cả routes
  app.setGlobalPrefix('api/v1');

  // Bật validation pipe toàn cục
  // app.useGlobalPipes(new ValidationPipe());

  // Lắng nghe ở port 3000
  await app.listen(3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
```

**Chi tiết về `NestFactory.create()`:**

```typescript
// Có thể truyền thêm options
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Log levels
  cors: true,                    // Bật CORS
  abortOnError: false,           // Không dừng app khi có lỗi init
  bufferLogs: true,              // Buffer logs cho custom logger
});

// Nếu muốn dùng Fastify thay vì Express:
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
await app.listen(3000, '0.0.0.0'); // Fastify cần bind '0.0.0.0'
```

### 8.2. app.module.ts - Root Module

```typescript
// app.module.ts - Module gốc, nơi khai báo tất cả modules, controllers, providers
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],         // Import các module khác
  controllers: [AppController],  // Khai báo controllers
  providers: [AppService],       // Khai báo providers (services, repositories...)
})
export class AppModule {}
```

**Giải thích `@Module()` decorator:**

| Property | Mô tả |
|----------|--------|
| `imports` | Danh sách các module cần import vào module này |
| `controllers` | Danh sách controllers thuộc module này |
| `providers` | Danh sách providers (services) thuộc module này |
| `exports` | Danh sách providers mà module này export cho modules khác dùng |

### 8.3. app.controller.ts - Controller

```typescript
// app.controller.ts - Xử lý HTTP requests
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // Route prefix: '' (root)
export class AppController {
  // AppService được inject tự động qua constructor
  constructor(private readonly appService: AppService) {}

  @Get() // GET /
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health') // GET /health
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 8.4. app.service.ts - Service

```typescript
// app.service.ts - Business logic
import { Injectable } from '@nestjs/common';

@Injectable() // Đánh dấu class này là injectable provider
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

### 8.5. Ví dụ tạo feature module hoàn chỉnh

```bash
# Tạo module users đầy đủ (CRUD resource)
nest generate resource users

# CLI sẽ hỏi:
# ? What transport layer do you use? REST API
# ? Would you like to generate CRUD entry points? Yes

# Kết quả tạo ra:
# src/users/
# ├── dto/
# │   ├── create-user.dto.ts
# │   └── update-user.dto.ts
# ├── entities/
# │   └── user.entity.ts
# ├── users.controller.ts
# ├── users.controller.spec.ts
# ├── users.module.ts
# ├── users.service.ts
# └── users.service.spec.ts
```

File được generate:

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
```

---

## 9. Chạy project

### 9.1. Các lệnh chạy

```bash
# Development mode (có hot-reload, tự động restart khi code thay đổi)
npm run start:dev

# Production mode
npm run start:prod

# Standard mode (không có hot-reload)
npm run start

# Debug mode (có thể attach debugger)
npm run start:debug

# Build project
npm run build
```

### 9.2. Scripts trong package.json

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 9.3. Kiểm tra hoạt động

```bash
# Sau khi chạy npm run start:dev
# Mở trình duyệt hoặc dùng curl:

curl http://localhost:3000
# Output: Hello World!

curl http://localhost:3000/health
# Output: {"status":"ok","timestamp":"2026-03-03T10:00:00.000Z"}
```

---

## 12. Lỗi thường gặp

### 12.1. Thiếu decorator metadata

```
Error: Nest can't resolve dependencies of the UsersController (?).
Please make sure that the argument UsersService at index [0]
is available in the UsersModule context.
```

**Nguyên nhân:** Service chưa được khai báo trong `providers` của module.

**Giải pháp:**

```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService], // Phải khai báo ở đây
})
export class UsersModule {}
```

### 12.2. Quên bật decorator trong tsconfig

```
Error: Unable to resolve signature of class decorator when called as an expression.
```

**Giải pháp:** Đảm bảo `tsconfig.json` có:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 12.3. Circular dependency

```
Error: A circular dependency has been detected.
```

**Giải pháp:** Sử dụng `forwardRef()`:

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class DogsModule {}
```

### 12.4. Port đã được sử dụng

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Giải pháp:**

```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc đổi port trong main.ts
await app.listen(3001);
```

### 12.5. Module not found

```
Error: Cannot find module './users/users.module'
```

**Nguyên nhân:** Đường dẫn import sai hoặc file chưa được tạo.

**Giải pháp:** Kiểm tra lại đường dẫn import và đảm bảo file tồn tại.
