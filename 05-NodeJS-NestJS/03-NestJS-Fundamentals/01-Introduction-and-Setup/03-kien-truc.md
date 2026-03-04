# Kiến trúc NestJS, Lifecycle

## 4. Kiến trúc NestJS (Inspired by Angular)

NestJS lấy cảm hứng rất nhiều từ **Angular** - framework frontend phổ biến của Google. Các khái niệm tương đồng:

### 4.1. Các thành phần chính

```
┌─────────────────────────────────────────────────────┐
│                    APPLICATION                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              ROOT MODULE                     │    │
│  │           (AppModule)                        │    │
│  │                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │ Feature      │  │ Feature      │         │    │
│  │  │ Module A     │  │ Module B     │         │    │
│  │  │              │  │              │         │    │
│  │  │ Controllers  │  │ Controllers  │         │    │
│  │  │ Providers    │  │ Providers    │         │    │
│  │  │ (Services)   │  │ (Services)   │         │    │
│  │  └──────────────┘  └──────────────┘         │    │
│  │                                              │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Middleware → Guards → Interceptors (before)        │
│  → Pipes → Controller → Service                    │
│  → Interceptors (after) → Exception Filters         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2. Request Lifecycle

Khi một HTTP request đến NestJS, nó đi qua các layer theo thứ tự:

```
Client Request
    │
    ▼
1. Middleware (giống Express middleware)
    │
    ▼
2. Guards (xác thực/phân quyền)
    │
    ▼
3. Interceptors (before - trước khi xử lý)
    │
    ▼
4. Pipes (validation/transformation data)
    │
    ▼
5. Controller (route handler)
    │
    ▼
6. Service (business logic)
    │
    ▼
7. Interceptors (after - sau khi xử lý)
    │
    ▼
8. Exception Filters (nếu có lỗi)
    │
    ▼
Client Response
```

### 4.3. So sánh với Angular

| Angular (Frontend) | NestJS (Backend) | Mục đích |
|--------------------|--------------------|----------|
| `@NgModule` | `@Module` | Tổ chức code thành module |
| `@Component` | `@Controller` | Xử lý request/render UI |
| `@Injectable` Service | `@Injectable` Service | Business logic |
| `@Pipe` | `@Pipe` (PipeTransform) | Transform/validate data |
| `@Guard` (CanActivate) | `@Guard` (CanActivate) | Bảo vệ route |
| `@Interceptor` (HttpInterceptor) | `@Interceptor` (NestInterceptor) | Xử lý trước/sau request |
| Dependency Injection | Dependency Injection | Quản lý dependencies |

---

## 10. NestJS Lifecycle

### 10.1. Application Lifecycle Events

NestJS cung cấp các lifecycle hooks cho phép bạn thực hiện các hành động tại các thời điểm cụ thể trong vòng đời ứng dụng:

```
                    Application Startup
                          │
                          ▼
              ┌──── onModuleInit() ────┐
              │  (Module đã khởi tạo)  │
              └────────────┬───────────┘
                          │
                          ▼
          ┌──── onApplicationBootstrap() ────┐
          │  (App đã khởi động hoàn toàn)    │
          └─────────────┬────────────────────┘
                        │
                        ▼
              Application Running...
              (Đang chạy, xử lý request)
                        │
                        ▼
            ┌──── onModuleDestroy() ────┐
            │  (Trước khi module bị     │
            │   destroy, SIGTERM...)     │
            └───────────┬───────────────┘
                        │
                        ▼
          ┌──── beforeApplicationShutdown() ────┐
          │  (Trước khi app tắt, connections    │
          │   vẫn còn active)                   │
          └─────────────┬───────────────────────┘
                        │
                        ▼
          ┌──── onApplicationShutdown() ────┐
          │  (App đã tắt, cleanup cuối)     │
          └─────────────────────────────────┘
```

### 10.2. Implement Lifecycle Hooks

```typescript
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class AppService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  // 1. Được gọi khi module chứa service này đã khởi tạo xong
  async onModuleInit(): Promise<void> {
    console.log('1. onModuleInit - Module đã khởi tạo');
    // Thường dùng để: kết nối database, load config
    // await this.connectToDatabase();
  }

  // 2. Được gọi khi tất cả modules đã khởi tạo, app sẵn sàng
  async onApplicationBootstrap(): Promise<void> {
    console.log('2. onApplicationBootstrap - App đã sẵn sàng');
    // Thường dùng để: seed data, warm up cache
  }

  // 3. Được gọi khi nhận tín hiệu terminate (SIGTERM, SIGINT)
  async onModuleDestroy(): Promise<void> {
    console.log('3. onModuleDestroy - Module sắp bị destroy');
    // Thường dùng để: cleanup resources
  }

  // 4. Được gọi trước khi app shutdown, connections vẫn còn active
  async beforeApplicationShutdown(signal?: string): Promise<void> {
    console.log(`4. beforeApplicationShutdown - Signal: ${signal}`);
    // Thường dùng để: hoàn thành các request đang xử lý
  }

  // 5. Được gọi sau khi tất cả connections đã đóng
  async onApplicationShutdown(signal?: string): Promise<void> {
    console.log(`5. onApplicationShutdown - Signal: ${signal}`);
    // Thường dùng để: đóng database connection, cleanup cuối cùng
  }
}
```

### 10.3. Bật Shutdown Hooks

```typescript
// main.ts - Cần bật enableShutdownHooks() để lifecycle hooks hoạt động
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật shutdown hooks (lắng nghe SIGTERM, SIGINT)
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
```
