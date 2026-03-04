# Async providers, optional, forwardRef

## 6. Async Providers

### 6.1. Factory async

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        // Co the await operations bat dong bo
        const connection = await createConnection({
          host: 'localhost',
          port: 5432,
          database: 'myapp',
        });

        // Doi connection san sang
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

### 6.2. Factory async voi dependencies

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

        // Cleanup khi app tat
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

### 6.3. Nhieu async providers phu thuoc nhau

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
        // Phu thuoc vao DATABASE_CONNECTION
        return connection.getRepository('User');
      },
      inject: ['DATABASE_CONNECTION'],
    },
    {
      provide: UsersService,
      useFactory: async (userRepository: any, configService: ConfigService) => {
        // Phu thuoc vao USER_REPOSITORY va ConfigService
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

Khi mot dependency co the khong ton tai (chua duoc dang ky), dung `@Optional()` de tranh loi.

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService {
  constructor(
    @Optional()
    @Inject('HTTP_OPTIONS')
    private readonly httpOptions?: HttpModuleOptions,
  ) {
    // Neu HTTP_OPTIONS khong duoc dang ky, httpOptions = undefined
    // Khong co @Optional() se throw error!
    if (this.httpOptions) {
      console.log(`HTTP configured with timeout: ${this.httpOptions.timeout}`);
    } else {
      console.log('Using default HTTP options');
    }
  }
}
```

### 7.2. Vi du thuc te

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
    // Neu co external logger, dung no
    if (this.externalLogger) {
      this.externalLogger.log(message);
      return;
    }

    // Fallback: console.log
    console.log(`[${this.logLevel}] ${message}`);
  }
}

// Module KHONG dang ky LOGGER_CONFIG va EXTERNAL_LOGGER
@Module({
  providers: [LoggerService],
  // LoggerService van hoat dong voi gia tri mac dinh
})
export class LoggerModule {}

// Module co dang ky config
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

### 8.1. Co ban

Ngoai constructor injection, NestJS ho tro property-based injection:

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

### 8.2. Khi nao dung Property-based Injection?

```typescript
// Truong hop 1: Base class co dependencies
// Khi dung constructor injection, subclass phai forward dependencies
// Property injection giup tranh van de nay

// VAN DE voi constructor injection:
@Injectable()
export class BaseService {
  constructor(private readonly logger: LoggerService) {}
}

@Injectable()
export class UsersService extends BaseService {
  constructor(
    logger: LoggerService,  // Phai forward logger
    private readonly repo: UsersRepository,
  ) {
    super(logger);  // Phai goi super()
  }
}

// GIAI PHAP voi property injection:
@Injectable()
export class BaseService {
  @Inject(LoggerService)
  protected readonly logger: LoggerService;
  // Subclass khong can biet ve logger
}

@Injectable()
export class UsersService extends BaseService {
  constructor(private readonly repo: UsersRepository) {}
  // Khong can forward logger, tu dong inject qua property
}
```

### 8.3. Luu y

> **Khuyen nghi:** Uu tien dung **constructor injection** vi:
> - De test hon (mock qua constructor)
> - Dependencies ro rang hon (nhin constructor biet ngay)
> - Immutable (readonly)
> - TypeScript strict mode kiem tra tot hon

---

## 9. Circular Dependency (forwardRef)

### 9.1. Van de

```typescript
// CatsService can DogsService
@Injectable()
export class CatsService {
  constructor(private readonly dogsService: DogsService) {} // Loi!
}

// DogsService can CatsService
@Injectable()
export class DogsService {
  constructor(private readonly catsService: CatsService) {} // Loi!
}

// Error: A circular dependency has been detected
```

### 9.2. Giai phap: forwardRef()

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

**Module cung can forwardRef:**

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

### 9.3. Cach tranh Circular Dependency (tot hon)

```typescript
// Giai phap 1: Tach logic chung vao shared service
@Injectable()
export class PetRelationService {
  // Logic lien quan den quan he giua cats va dogs
  findPetFriends(petId: number) { }
}

// Giai phap 2: Dung Events/EventEmitter
@Injectable()
export class CatsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createCat(dto: CreateCatDto) {
    const cat = await this.catsRepo.create(dto);
    // Emit event thay vi goi truc tiep DogsService
    this.eventEmitter.emit('cat.created', cat);
    return cat;
  }
}

@Injectable()
export class DogsService {
  @OnEvent('cat.created')
  handleCatCreated(cat: Cat) {
    // Xu ly khi cat moi duoc tao
    console.log(`New cat created: ${cat.name}, notify related dogs`);
  }
}

// Giai phap 3: Mediator/Orchestrator pattern
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

## 10. Vi du thuc te hoan chinh

### 10.1. Payment System voi Strategy Pattern

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

### 10.2. Logger Service voi Transient Scope

```typescript
// === logger.service.ts ===
import { Injectable, Scope, Inject } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string = 'Application';

  // INQUIRER cho biet class nao da inject LoggerService
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

// Su dung:
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
    // Context tu dong khac nhau cho moi service!
  }
}
```

---

## 11. Loi thuong gap

### 11.1. Quen @Injectable()

```typescript
// LOI: Class khong co @Injectable()
export class CatsService {
  findAll() { return []; }
}

// Error: Nest can't resolve dependencies of the CatsController (?).
// Make sure that the argument CatsService is available in the CatsModule context.

// DUNG:
@Injectable() // Phai co decorator nay
export class CatsService {
  findAll() { return []; }
}
```

### 11.2. Quen dang ky trong providers

```typescript
// LOI: Service duoc inject nhung khong dang ky trong module
@Module({
  controllers: [CatsController],
  // providers: [CatsService], // Quen!
})
export class CatsModule {}

// Error: Nest can't resolve dependencies of the CatsController (?).

// DUNG:
@Module({
  controllers: [CatsController],
  providers: [CatsService], // Phai dang ky
})
export class CatsModule {}
```

### 11.3. Inject string token ma quen @Inject()

```typescript
// LOI:
@Injectable()
export class UsersService {
  constructor(
    private readonly apiKey: string, // NestJS khong biet inject gi!
  ) {}
}

// DUNG:
@Injectable()
export class UsersService {
  constructor(
    @Inject('API_KEY') private readonly apiKey: string,
  ) {}
}
```

### 11.4. Request scope anh huong performance

```typescript
// CANH BAO: Khi 1 provider la REQUEST scope,
// tat ca providers phu thuoc no cung thanh REQUEST scope

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {} // REQUEST scope

@Injectable() // TU DONG thanh REQUEST scope vi phu thuoc RequestContextService
export class UsersService {
  constructor(private readonly context: RequestContextService) {}
}

@Injectable() // TU DONG thanh REQUEST scope vi phu thuoc UsersService
export class OrdersService {
  constructor(private readonly usersService: UsersService) {}
}

// Toan bo chain deu tao instance moi cho moi request!
// Giai phap: Han che dung REQUEST scope, hoac tach rieng
```
