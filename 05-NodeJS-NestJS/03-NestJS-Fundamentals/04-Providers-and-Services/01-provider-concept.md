# Provider concept, @Injectable

## 1. Provider la gi?

### 1.1. Khai niem

**Provider** la khai niem cot loi trong NestJS. Nhieu class co ban trong NestJS co the duoc coi la provider: services, repositories, factories, helpers, va nhieu hon nua. Y tuong chinh cua provider la no co the duoc **inject** (tiem) nhu mot dependency.

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
│  Tat ca deu dung @Injectable() decorator     │
│  va duoc quan ly boi NestJS IoC Container    │
└──────────────────────────────────────────────┘
```

### 1.2. Cac loai Provider pho bien

| Loai | Muc dich | Vi du |
|------|---------|-------|
| **Service** | Business logic chinh | `UsersService`, `OrdersService` |
| **Repository** | Truy cap database | `UsersRepository`, `ProductsRepository` |
| **Factory** | Tao objects phuc tap | `ConnectionFactory`, `NotificationFactory` |
| **Helper/Utility** | Ham tien ich | `HashHelper`, `DateHelper` |
| **Strategy** | Implement algorithms | `PaymentStrategy`, `ShippingStrategy` |
| **Adapter** | Wrap external services | `EmailAdapter`, `SmsAdapter` |
| **Guard** | Bao ve routes | `AuthGuard`, `RolesGuard` |
| **Pipe** | Transform/validate data | `ValidationPipe`, `ParseIntPipe` |
| **Interceptor** | Xu ly truoc/sau request | `LoggingInterceptor` |
| **Filter** | Xu ly exceptions | `HttpExceptionFilter` |

---

## 2. @Injectable() Decorator

### 2.1. Co ban

`@Injectable()` decorator danh dau mot class la provider, cho phep NestJS IoC container quan ly va inject no.

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

### 2.2. Inject service vao controller

```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  // Constructor injection - cach pho bien nhat
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

### 2.3. Inject service vao service khac

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

### 2.4. Dang ky trong Module

```typescript
@Module({
  controllers: [CatsController],
  providers: [
    CatsService,
    // Day la shorthand cho:
    // { provide: CatsService, useClass: CatsService }
  ],
  exports: [CatsService],
})
export class CatsModule {}
```
