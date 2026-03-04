# Bai 5: Dependency Injection trong NestJS

## Muc luc

- [1. Dependency Injection la gi?](#1-dependency-injection-la-gi)
  - [1.1. Khai niem co ban](#11-khai-niem-co-ban)
  - [1.2. Tai sao can Dependency Injection?](#12-tai-sao-can-dependency-injection)
  - [1.3. Inversion of Control (IoC)](#13-inversion-of-control-ioc)
- [2. IoC Container trong NestJS](#2-ioc-container-trong-nestjs)
  - [2.1. Cach IoC Container hoat dong](#21-cach-ioc-container-hoat-dong)
  - [2.2. Provider Registration](#22-provider-registration)
  - [2.3. Provider Resolution](#23-provider-resolution)
- [3. Constructor-based Injection](#3-constructor-based-injection)
  - [3.1. Co ban](#31-co-ban)
  - [3.2. Inject nhieu dependencies](#32-inject-nhieu-dependencies)
- [4. Property-based Injection](#4-property-based-injection)
  - [4.1. Su dung @Inject()](#41-su-dung-inject)
  - [4.2. Khi nao dung Property-based Injection](#42-khi-nao-dung-property-based-injection)
- [5. Custom Providers Deep Dive](#5-custom-providers-deep-dive)
  - [5.1. useClass - Class Providers](#51-useclass---class-providers)
  - [5.2. useValue - Value Providers](#52-usevalue---value-providers)
  - [5.3. useFactory - Factory Providers](#53-usefactory---factory-providers)
  - [5.4. useExisting - Alias Providers](#54-useexisting---alias-providers)
- [6. Injection Tokens](#6-injection-tokens)
  - [6.1. String Tokens](#61-string-tokens)
  - [6.2. Symbol Tokens](#62-symbol-tokens)
  - [6.3. InjectionToken Class](#63-injectiontoken-class)
- [7. Module-scoped Providers vs Global](#7-module-scoped-providers-vs-global)
  - [7.1. Module-scoped (mac dinh)](#71-module-scoped-mac-dinh)
  - [7.2. Global Providers](#72-global-providers)
- [8. Request-scoped Providers](#8-request-scoped-providers)
  - [8.1. Scope.REQUEST](#81-scoperequest)
  - [8.2. REQUEST object injection](#82-request-object-injection)
  - [8.3. Scope bubbling](#83-scope-bubbling)
- [9. Transient Providers](#9-transient-providers)
  - [9.1. Scope.TRANSIENT](#91-scopetransient)
  - [9.2. Use cases](#92-use-cases)
- [10. Durable Providers](#10-durable-providers)
- [11. Circular Dependency va forwardRef](#11-circular-dependency-va-forwardref)
  - [11.1. Van de Circular Dependency](#111-van-de-circular-dependency)
  - [11.2. forwardRef giua cac Providers](#112-forwardref-giua-cac-providers)
  - [11.3. forwardRef giua cac Modules](#113-forwardref-giua-cac-modules)
- [12. Hierarchical Injectors](#12-hierarchical-injectors)
- [13. Testing voi DI](#13-testing-voi-di)
  - [13.1. Mock Services](#131-mock-services)
  - [13.2. Override Providers](#132-override-providers)
  - [13.3. Auto Mocking](#133-auto-mocking)
- [14. Loi thuong gap](#14-loi-thuong-gap)
- [15. Best Practices](#15-best-practices)
- [16. Bai tap](#16-bai-tap)

---

## 1. Dependency Injection la gi?

### 1.1. Khai niem co ban

**Dependency Injection (DI)** la mot design pattern trong do mot object nhan cac dependencies cua no tu ben ngoai thay vi tu tao chung. Day la mot hinh thuc cua nguyen tac **Inversion of Control (IoC)**.

```
                    KHONG CO DI (Tight Coupling)
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   class UserController {                        │
    │     private userService = new UserService();    │  ← Tu tao dependency
    │     private emailService = new EmailService();  │  ← Tu tao dependency
    │   }                                             │
    │                                                 │
    │   Van de:                                       │
    │   - Khong the thay the implementation           │
    │   - Kho test (khong mock duoc)                  │
    │   - Tight coupling giua cac class               │
    │   - Vi pham SOLID principles                    │
    └─────────────────────────────────────────────────┘

                    CO DI (Loose Coupling)
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   class UserController {                        │
    │     constructor(                                │
    │       private userService: UserService,         │  ← Nhan tu ben ngoai
    │       private emailService: EmailService,       │  ← Nhan tu ben ngoai
    │     ) {}                                        │
    │   }                                             │
    │                                                 │
    │   Loi ich:                                      │
    │   - De dang thay doi implementation             │
    │   - De test voi mock objects                    │
    │   - Loose coupling                              │
    │   - Tuan thu SOLID principles                   │
    └─────────────────────────────────────────────────┘
```

### 1.2. Tai sao can Dependency Injection?

#### a) Loose Coupling (Lien ket long leo)

Khong co DI - Tight Coupling:

```typescript
// ❌ BAD: Tight coupling - UserService phu thuoc truc tiep vao implementation cu the
class UserService {
  private database: MySQLDatabase;

  constructor() {
    // Tu tao dependency - KHONG the thay doi
    this.database = new MySQLDatabase('localhost', 3306, 'mydb');
  }

  async findUser(id: number) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Neu muon doi sang PostgreSQL? => PHAI SUA CODE trong UserService
// Neu muon test voi in-memory database? => KHONG THE
```

Co DI - Loose Coupling:

```typescript
// ✅ GOOD: Loose coupling - UserService chi phu thuoc vao interface
interface DatabaseService {
  query(sql: string): Promise<any>;
  execute(sql: string, params: any[]): Promise<any>;
}

@Injectable()
class MySQLDatabase implements DatabaseService {
  async query(sql: string) {
    // MySQL implementation
  }
  async execute(sql: string, params: any[]) {
    // MySQL implementation
  }
}

@Injectable()
class PostgreSQLDatabase implements DatabaseService {
  async query(sql: string) {
    // PostgreSQL implementation
  }
  async execute(sql: string, params: any[]) {
    // PostgreSQL implementation
  }
}

@Injectable()
class UserService {
  constructor(
    @Inject('DATABASE_SERVICE')
    private database: DatabaseService, // Chi phu thuoc vao interface
  ) {}

  async findUser(id: number) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}
```

#### b) Testability (Kha nang test)

```typescript
// Voi DI, viet unit test tro nen cuc ky de dang
describe('UserService', () => {
  let userService: UserService;
  let mockDatabase: DatabaseService;

  beforeEach(() => {
    // Tao mock database
    mockDatabase = {
      query: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]),
      execute: jest.fn().mockResolvedValue({ affectedRows: 1 }),
    };

    // Inject mock vao UserService
    userService = new UserService(mockDatabase);
  });

  it('should find user by id', async () => {
    const result = await userService.findUser(1);
    expect(result).toEqual([{ id: 1, name: 'John' }]);
    expect(mockDatabase.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = 1',
    );
  });
});
```

#### c) Single Responsibility Principle

```typescript
// Moi class chi lam mot viec, cac dependency duoc inject vao
@Injectable()
class OrderService {
  constructor(
    private readonly userService: UserService,       // Quan ly user
    private readonly productService: ProductService, // Quan ly product
    private readonly paymentService: PaymentService, // Xu ly thanh toan
    private readonly emailService: EmailService,     // Gui email
    private readonly inventoryService: InventoryService, // Quan ly ton kho
  ) {}

  async createOrder(userId: number, items: OrderItem[]) {
    // Moi service dam nhan mot phan cong viec
    const user = await this.userService.findById(userId);
    const products = await this.productService.validateItems(items);
    await this.inventoryService.reserveItems(items);
    const payment = await this.paymentService.charge(user, products);
    await this.emailService.sendOrderConfirmation(user, payment);
    return payment;
  }
}
```

### 1.3. Inversion of Control (IoC)

**Inversion of Control** la nguyen tac thiet ke trong do quyenkkiemsoat viec tao va quan ly objects duoc chuyen tu code cua ban sang mot framework hoac container.

```
    TRUYEN THONG (Application Code kiem soat)
    ┌──────────────────────────────────────────┐
    │                                          │
    │   Application Code                       │
    │     │                                    │
    │     ├── new ServiceA()                   │
    │     ├── new ServiceB(serviceA)           │
    │     └── new Controller(serviceA, serviceB)│
    │                                          │
    │   => Developer phai tu quan ly lifecycle  │
    └──────────────────────────────────────────┘

    IoC (Framework/Container kiem soat)
    ┌──────────────────────────────────────────┐
    │                                          │
    │   IoC Container                          │
    │     │                                    │
    │     ├── Scan @Injectable() classes       │
    │     ├── Phan tich dependencies           │
    │     ├── Tao instances theo thu tu dung   │
    │     └── Inject dependencies tu dong      │
    │                                          │
    │   => Container quan ly toan bo lifecycle │
    └──────────────────────────────────────────┘
```

---

## 2. IoC Container trong NestJS

### 2.1. Cach IoC Container hoat dong

NestJS su dung mot **IoC Container** (con goi la DI Container) de quan ly viec tao va inject cac dependencies.

```
    QUY TRINH HOAT DONG CUA NestJS IoC Container
    ┌───────────────────────────────────────────────┐
    │                                               │
    │  1. REGISTRATION (Dang ky)                    │
    │     @Module({ providers: [UserService] })     │
    │     => Container biet UserService ton tai      │
    │                                               │
    │  2. RESOLUTION (Phan giai)                    │
    │     constructor(private userService: UserService) │
    │     => Container tim UserService da dang ky    │
    │                                               │
    │  3. INSTANTIATION (Khoi tao)                  │
    │     Container tao instance cua UserService     │
    │     (va cac dependencies cua no - de quy)     │
    │                                               │
    │  4. INJECTION (Tiem)                          │
    │     Container inject instance vao constructor  │
    │                                               │
    │  5. CACHING (Luu cache - Singleton)           │
    │     Instance duoc luu lai cho lan dung sau     │
    │                                               │
    └───────────────────────────────────────────────┘
```

Minh hoa chi tiet:

```typescript
// Buoc 1: Dinh nghia cac providers
@Injectable()
class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

@Injectable()
class DatabaseService {
  constructor(private readonly logger: LoggerService) {
    this.logger.log('DatabaseService initialized');
  }

  async query(sql: string): Promise<any[]> {
    this.logger.log(`Executing query: ${sql}`);
    return [];
  }
}

@Injectable()
class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserService initialized');
  }

  async findAll() {
    return this.db.query('SELECT * FROM users');
  }
}

// Buoc 2: Dang ky trong Module
@Module({
  providers: [LoggerService, DatabaseService, UserService],
  controllers: [UserController],
})
export class UserModule {}

// Buoc 3: Container tu dong resolve dependency tree:
// LoggerService (khong dependency)
//   => DatabaseService (can LoggerService - da co)
//     => UserService (can DatabaseService + LoggerService - da co)
//       => UserController (can UserService - da co)
```

### 2.2. Provider Registration

Khi ban khai bao providers trong `@Module()`, ban dang noi voi Container: "Day la cac class ma toi muon ban quan ly."

```typescript
@Module({
  providers: [
    // Cach 1: Shorthand - dang ky class truc tiep
    UserService,
    // Tuong duong voi:
    // { provide: UserService, useClass: UserService }

    // Cach 2: Full syntax - custom provider
    {
      provide: 'EMAIL_SERVICE',
      useClass: SendGridEmailService,
    },

    // Cach 3: Value provider
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'xxx', apiUrl: 'https://api.example.com' },
    },

    // Cach 4: Factory provider
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection();
        return connection;
      },
    },
  ],
})
export class AppModule {}
```

### 2.3. Provider Resolution

Container phan giai dependencies theo cac buoc:

```typescript
// Container phan tich constructor cua UserController
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService, // Container: "Can UserService"
  ) {}
}

// Container phan tich constructor cua UserService
@Injectable()
export class UserService {
  constructor(
    private readonly dbService: DatabaseService, // Container: "Can DatabaseService"
    private readonly logger: LoggerService,      // Container: "Can LoggerService"
  ) {}
}

// Container xay dung dependency graph:
//
//   UserController
//       │
//       └── UserService
//              │
//              ├── DatabaseService
//              │       │
//              │       └── LoggerService
//              │
//              └── LoggerService  (cung instance voi tren - singleton)
```

---

## 3. Constructor-based Injection

### 3.1. Co ban

**Constructor-based injection** la phuong phap DI pho bien nhat va duoc khuyen dung trong NestJS. Dependencies duoc khai bao trong constructor cua class.

```typescript
import { Injectable, Controller, Get, Post, Body, Param } from '@nestjs/common';

// Service 1: Logger
@Injectable()
export class LoggerService {
  private logs: string[] = [];

  log(context: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${context}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

// Service 2: Database
@Injectable()
export class UserRepository {
  private users: Array<{ id: number; name: string; email: string }> = [
    { id: 1, name: 'Nguyen Van A', email: 'a@example.com' },
    { id: 2, name: 'Tran Thi B', email: 'b@example.com' },
  ];

  constructor(private readonly logger: LoggerService) {
    this.logger.log('UserRepository', 'Initialized');
  }

  findAll() {
    this.logger.log('UserRepository', 'Finding all users');
    return this.users;
  }

  findById(id: number) {
    this.logger.log('UserRepository', `Finding user with id: ${id}`);
    return this.users.find(u => u.id === id);
  }

  create(data: { name: string; email: string }) {
    const newUser = { id: this.users.length + 1, ...data };
    this.users.push(newUser);
    this.logger.log('UserRepository', `Created user: ${newUser.id}`);
    return newUser;
  }
}

// Service 3: Business Logic
@Injectable()
export class UserService {
  // Constructor-based injection: khai bao dependencies trong constructor
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserService', 'Initialized');
  }

  getAllUsers() {
    this.logger.log('UserService', 'Getting all users');
    return this.userRepository.findAll();
  }

  getUserById(id: number) {
    this.logger.log('UserService', `Getting user: ${id}`);
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  createUser(name: string, email: string) {
    this.logger.log('UserService', `Creating user: ${name}`);
    return this.userRepository.create({ name, email });
  }
}

// Controller su dung cac services
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  findAll() {
    this.logger.log('UserController', 'GET /users');
    return this.userService.getAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('UserController', `GET /users/${id}`);
    return this.userService.getUserById(parseInt(id, 10));
  }

  @Post()
  create(@Body() body: { name: string; email: string }) {
    this.logger.log('UserController', 'POST /users');
    return this.userService.createUser(body.name, body.email);
  }
}
```

### 3.2. Inject nhieu dependencies

```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly inventoryService: InventoryService,
  ) {}

  async placeOrder(userId: number, items: OrderItem[]): Promise<Order> {
    // Moi dependency dam nhan mot vai tro
    const user = await this.userService.getUserById(userId);
    const products = await this.productService.getProducts(items.map(i => i.productId));
    await this.inventoryService.checkAvailability(items);
    const total = this.calculateTotal(products, items);
    const payment = await this.paymentService.processPayment(user, total);
    await this.inventoryService.decreaseStock(items);
    const order = await this.saveOrder(user, items, payment);
    await this.emailService.sendOrderConfirmation(user.email, order);
    await this.cacheService.invalidate(`user:${userId}:orders`);
    this.logger.log('OrderService', `Order ${order.id} placed successfully`);
    return order;
  }

  private calculateTotal(products: Product[], items: OrderItem[]): number {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price ?? 0) * item.quantity;
    }, 0);
  }

  private async saveOrder(user: any, items: OrderItem[], payment: any): Promise<Order> {
    // Save to database
    return { id: Date.now(), userId: user.id, items, paymentId: payment.id } as Order;
  }
}
```

---

## 4. Property-based Injection

### 4.1. Su dung @Inject()

**Property-based injection** cho phep inject dependencies vao properties cua class thay vi qua constructor. Su dung decorator `@Inject()`.

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ReportService {
  // Property-based injection
  @Inject(LoggerService)
  private readonly logger: LoggerService;

  @Inject('CONFIG')
  private readonly config: AppConfig;

  @Inject('CACHE_MANAGER')
  private readonly cacheManager: CacheManager;

  async generateReport(type: string): Promise<Report> {
    this.logger.log('ReportService', `Generating ${type} report`);

    // Kiem tra cache
    const cached = await this.cacheManager.get(`report:${type}`);
    if (cached) {
      return cached as Report;
    }

    // Tao report moi
    const report = await this.buildReport(type);

    // Luu cache
    await this.cacheManager.set(`report:${type}`, report, this.config.cacheTtl);

    return report;
  }

  private async buildReport(type: string): Promise<Report> {
    // Logic tao report
    return {
      type,
      data: [],
      generatedAt: new Date(),
    };
  }
}
```

### 4.2. Khi nao dung Property-based Injection

```typescript
// Use case 1: Base class co dependencies chung
@Injectable()
export class BaseService {
  // Cac subclass khong can goi super() voi dependency nay
  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  @Inject('CONFIG')
  protected readonly config: AppConfig;

  protected logAction(action: string): void {
    this.logger.log(this.constructor.name, action);
  }
}

@Injectable()
export class UserService extends BaseService {
  // Khong can khai bao logger va config trong constructor
  constructor(private readonly userRepo: UserRepository) {
    super();
  }

  async findAll() {
    this.logAction('findAll'); // Su dung logger tu BaseService
    return this.userRepo.findAll();
  }
}

@Injectable()
export class ProductService extends BaseService {
  constructor(private readonly productRepo: ProductRepository) {
    super();
  }

  async findAll() {
    this.logAction('findAll');
    return this.productRepo.findAll();
  }
}

// Use case 2: Optional dependency (co the khong co)
@Injectable()
export class NotificationService {
  @Inject(LoggerService)
  private readonly logger: LoggerService;

  // Optional: co the khong co SMS service
  @Inject('SMS_SERVICE')
  @Optional()
  private readonly smsService?: SmsService;

  async notify(userId: number, message: string) {
    this.logger.log('NotificationService', `Notifying user ${userId}`);

    // Chi gui SMS neu co SMS service
    if (this.smsService) {
      await this.smsService.send(userId, message);
    }
  }
}
```

**Luu y quan trong:** Constructor-based injection duoc uu tien hon property-based injection vi:
- De doc va hieu hon
- Dependencies ro rang hon
- TypeScript compiler co the kiem tra kieu
- De test hon (chi can truyen vao constructor)

---

## 5. Custom Providers Deep Dive

### 5.1. useClass - Class Providers

`useClass` cho phep ban chi dinh class nao se duoc su dung khi resolve mot provider token.

```typescript
// Interface (hoac abstract class)
export interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
}

// Implementation 1: Stripe
@Injectable()
export class StripePaymentService implements PaymentProcessor {
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`Processing $${amount} ${currency} via Stripe`);
    return {
      transactionId: `stripe_${Date.now()}`,
      status: 'success',
      amount,
      currency,
    };
  }

  async refund(transactionId: string): Promise<RefundResult> {
    console.log(`Refunding ${transactionId} via Stripe`);
    return { status: 'refunded', transactionId };
  }
}

// Implementation 2: PayPal
@Injectable()
export class PayPalPaymentService implements PaymentProcessor {
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    console.log(`Processing $${amount} ${currency} via PayPal`);
    return {
      transactionId: `paypal_${Date.now()}`,
      status: 'success',
      amount,
      currency,
    };
  }

  async refund(transactionId: string): Promise<RefundResult> {
    console.log(`Refunding ${transactionId} via PayPal`);
    return { status: 'refunded', transactionId };
  }
}

// Implementation 3: Mock cho testing
@Injectable()
export class MockPaymentService implements PaymentProcessor {
  private payments: Map<string, PaymentResult> = new Map();

  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    const result: PaymentResult = {
      transactionId: `mock_${Date.now()}`,
      status: 'success',
      amount,
      currency,
    };
    this.payments.set(result.transactionId, result);
    return result;
  }

  async refund(transactionId: string): Promise<RefundResult> {
    return { status: 'refunded', transactionId };
  }
}

// Module: Chon implementation dua tren environment
@Module({
  providers: [
    {
      provide: 'PAYMENT_PROCESSOR',
      useClass:
        process.env.NODE_ENV === 'production'
          ? StripePaymentService
          : process.env.NODE_ENV === 'test'
            ? MockPaymentService
            : PayPalPaymentService,
    },
  ],
})
export class PaymentModule {}

// Su dung trong service
@Injectable()
export class OrderService {
  constructor(
    @Inject('PAYMENT_PROCESSOR')
    private readonly paymentProcessor: PaymentProcessor,
  ) {}

  async checkout(amount: number) {
    return this.paymentProcessor.processPayment(amount, 'USD');
  }
}
```

**Ung dung thuc te - Strategy Pattern:**

```typescript
// Cac strategy cho shipping
@Injectable()
export class StandardShipping implements ShippingStrategy {
  calculate(weight: number, distance: number): number {
    return weight * 0.5 + distance * 0.1;
  }
  getEstimatedDays(): number {
    return 7;
  }
}

@Injectable()
export class ExpressShipping implements ShippingStrategy {
  calculate(weight: number, distance: number): number {
    return weight * 1.5 + distance * 0.3;
  }
  getEstimatedDays(): number {
    return 2;
  }
}

@Injectable()
export class OvernightShipping implements ShippingStrategy {
  calculate(weight: number, distance: number): number {
    return weight * 3.0 + distance * 0.5 + 10;
  }
  getEstimatedDays(): number {
    return 1;
  }
}

// Dang ky nhieu strategies
@Module({
  providers: [
    { provide: 'STANDARD_SHIPPING', useClass: StandardShipping },
    { provide: 'EXPRESS_SHIPPING', useClass: ExpressShipping },
    { provide: 'OVERNIGHT_SHIPPING', useClass: OvernightShipping },
  ],
})
export class ShippingModule {}
```

### 5.2. useValue - Value Providers

`useValue` cho phep inject mot gia tri cu the (object, string, number, array, v.v.) vao container.

```typescript
// Gia tri don gian
const API_KEY = 'sk_live_abc123xyz789';

// Object config
const APP_CONFIG = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'secret',
    database: process.env.DB_NAME || 'myapp',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  app: {
    name: 'My NestJS App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
};

// Mock object cho testing
const mockUserRepository = {
  find: jest.fn().mockResolvedValue([
    { id: 1, name: 'Test User' },
  ]),
  findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
  save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 1, ...user })),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

@Module({
  providers: [
    // String value
    {
      provide: 'API_KEY',
      useValue: API_KEY,
    },

    // Object value
    {
      provide: 'APP_CONFIG',
      useValue: APP_CONFIG,
    },

    // Array value
    {
      provide: 'SUPPORTED_LANGUAGES',
      useValue: ['vi', 'en', 'ja', 'ko', 'zh'],
    },

    // Boolean value
    {
      provide: 'IS_PRODUCTION',
      useValue: process.env.NODE_ENV === 'production',
    },

    // Mock cho testing
    {
      provide: 'USER_REPOSITORY',
      useValue: mockUserRepository,
    },

    // External library instance
    {
      provide: 'AXIOS_INSTANCE',
      useValue: axios.create({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }),
    },
  ],
})
export class AppModule {}

// Su dung trong service
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_KEY') private readonly apiKey: string,
    @Inject('APP_CONFIG') private readonly config: typeof APP_CONFIG,
    @Inject('SUPPORTED_LANGUAGES') private readonly languages: string[],
    @Inject('IS_PRODUCTION') private readonly isProduction: boolean,
    @Inject('AXIOS_INSTANCE') private readonly httpClient: AxiosInstance,
  ) {}

  async fetchData(endpoint: string) {
    if (this.isProduction) {
      console.log('Running in production mode');
    }

    const response = await this.httpClient.get(endpoint, {
      headers: { 'X-API-Key': this.apiKey },
    });
    return response.data;
  }

  getSupportedLanguages(): string[] {
    return this.languages;
  }

  getConfig() {
    return this.config;
  }
}
```

### 5.3. useFactory - Factory Providers

`useFactory` cho phep tao providers mot cach dong (dynamic) bang mot factory function. Factory co the inject cac providers khac va co the la async.

```typescript
// === FACTORY CO BAN ===
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: () => {
        const connection = new DatabaseConnection({
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

// === FACTORY VOI DEPENDENCIES (inject) ===
@Injectable()
export class ConfigService {
  private config: Record<string, string> = {};

  constructor() {
    this.config = {
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || '5432',
      DB_NAME: process.env.DB_NAME || 'myapp',
      DB_USER: process.env.DB_USER || 'admin',
      DB_PASS: process.env.DB_PASS || 'secret',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    };
  }

  get(key: string): string {
    return this.config[key];
  }
}

@Module({
  providers: [
    ConfigService,
    // Factory su dung ConfigService
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return new DatabaseConnection({
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT'), 10),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
        });
      },
      inject: [ConfigService], // Chi ro cac dependencies cua factory
    },
    // Factory voi nhieu dependencies
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService, logger: LoggerService) => {
        const url = configService.get('REDIS_URL');
        logger.log('RedisFactory', `Connecting to Redis: ${url}`);
        return new Redis(url);
      },
      inject: [ConfigService, LoggerService],
    },
  ],
})
export class InfrastructureModule {}

// === ASYNC FACTORY ===
@Module({
  providers: [
    ConfigService,
    {
      provide: 'ASYNC_DATABASE',
      useFactory: async (configService: ConfigService) => {
        // Co the await trong factory
        const connection = await TypeORM.createConnection({
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT'), 10),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
          synchronize: true,
        });
        console.log('Database connected successfully');
        return connection;
      },
      inject: [ConfigService],
    },
  ],
})
export class AsyncDatabaseModule {}

// === FACTORY VOI CONDITIONAL LOGIC ===
@Module({
  providers: [
    ConfigService,
    {
      provide: 'CACHE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const env = configService.get('NODE_ENV');

        if (env === 'production') {
          // Production: su dung Redis cache
          return new RedisCacheService({
            url: configService.get('REDIS_URL'),
            ttl: 3600,
          });
        } else if (env === 'test') {
          // Test: su dung in-memory cache
          return new InMemoryCacheService();
        } else {
          // Development: khong cache (noop)
          return new NoopCacheService();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class CacheModule {}

// === FACTORY TAO NHIEU INSTANCES ===
@Module({
  providers: [
    {
      provide: 'EMAIL_TRANSPORTER',
      useFactory: async () => {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT, 10),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Verify ket noi truoc khi return
        await transporter.verify();
        console.log('SMTP connection verified');

        return transporter;
      },
    },
  ],
})
export class EmailModule {}
```

### 5.4. useExisting - Alias Providers

`useExisting` tao mot alias (ten thay the) cho mot provider da ton tai. Ca hai tokens se tro den cung mot instance.

```typescript
// === ALIAS CO BAN ===
@Injectable()
export class LoggerService {
  log(message: string): void {
    console.log(`[Logger] ${message}`);
  }

  error(message: string): void {
    console.error(`[Error] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[Warn] ${message}`);
  }
}

@Module({
  providers: [
    LoggerService,
    // Tao alias: 'LOGGER' cung tro den LoggerService instance
    {
      provide: 'LOGGER',
      useExisting: LoggerService,
    },
    // Mot alias khac
    {
      provide: 'AuditLogger',
      useExisting: LoggerService,
    },
  ],
  exports: [LoggerService, 'LOGGER', 'AuditLogger'],
})
export class LoggerModule {}

// Tat ca deu nhan cung mot instance
@Injectable()
export class ServiceA {
  constructor(private readonly logger: LoggerService) {}
}

@Injectable()
export class ServiceB {
  constructor(@Inject('LOGGER') private readonly logger: LoggerService) {}
}

@Injectable()
export class ServiceC {
  constructor(@Inject('AuditLogger') private readonly logger: LoggerService) {}
}
// serviceA.logger === serviceB.logger === serviceC.logger => true

// === USE CASE: BACKWARD COMPATIBILITY ===
// Khi doi ten service, giu alias cu de khong break code
@Injectable()
export class NotificationService {
  // Day la ten moi
  async send(to: string, message: string) {
    console.log(`Sending to ${to}: ${message}`);
  }
}

@Module({
  providers: [
    NotificationService,
    // Alias cu: code cu van dung duoc
    {
      provide: 'MessagingService', // Ten cu
      useExisting: NotificationService,
    },
    {
      provide: 'AlertService', // Ten cu khac
      useExisting: NotificationService,
    },
  ],
})
export class MessagingModule {}

// === USE CASE: INTERFACE SEGREGATION ===
// Mot class implement nhieu interfaces, expose tung interface rieng biet
@Injectable()
export class FullDatabaseService {
  async read(query: string): Promise<any[]> {
    return [];
  }
  async write(query: string, data: any): Promise<void> {
    // write logic
  }
  async delete(query: string): Promise<void> {
    // delete logic
  }
}

@Module({
  providers: [
    FullDatabaseService,
    // Chi expose read capability
    { provide: 'READ_ONLY_DB', useExisting: FullDatabaseService },
    // Chi expose write capability
    { provide: 'WRITE_DB', useExisting: FullDatabaseService },
  ],
})
export class DatabaseModule {}
```

---

## 6. Injection Tokens

### 6.1. String Tokens

```typescript
// Dinh nghia string tokens
const DATABASE_TOKEN = 'DATABASE_CONNECTION';
const CONFIG_TOKEN = 'APP_CONFIG';
const API_KEY_TOKEN = 'API_KEY';

// Dang ky providers voi string tokens
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: async () => {
        return await createDatabaseConnection();
      },
    },
    {
      provide: CONFIG_TOKEN,
      useValue: {
        port: 3000,
        host: 'localhost',
      },
    },
    {
      provide: API_KEY_TOKEN,
      useValue: 'my-secret-api-key',
    },
  ],
})
export class AppModule {}

// Inject bang string token
@Injectable()
export class AppService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseConnection,
    @Inject(CONFIG_TOKEN) private readonly config: AppConfig,
    @Inject(API_KEY_TOKEN) private readonly apiKey: string,
  ) {}
}
```

**Van de voi String Tokens:** De bi trung ten, khong co type safety.

### 6.2. Symbol Tokens

```typescript
// Dinh nghia Symbol tokens (dam bao unique)
export const DATABASE_TOKEN = Symbol('DATABASE_CONNECTION');
export const CACHE_TOKEN = Symbol('CACHE_SERVICE');
export const LOGGER_TOKEN = Symbol('LOGGER');
export const MAILER_TOKEN = Symbol('MAILER');

// Du 2 Symbol co cung description, chung van khac nhau
const token1 = Symbol('test');
const token2 = Symbol('test');
console.log(token1 === token2); // false

// Su dung trong module
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: async (config: ConfigService) => {
        return await createConnection({
          host: config.get('DB_HOST'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: CACHE_TOKEN,
      useClass: RedisCacheService,
    },
    {
      provide: LOGGER_TOKEN,
      useClass: WinstonLoggerService,
    },
  ],
})
export class CoreModule {}

// Inject bang Symbol token
@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseConnection,
    @Inject(CACHE_TOKEN) private readonly cache: CacheService,
    @Inject(LOGGER_TOKEN) private readonly logger: LoggerService,
  ) {}
}
```

### 6.3. InjectionToken Class

Tat phuong phap tot nhat la tao file chua tat ca tokens:

```typescript
// tokens.ts - File chua tat ca injection tokens
export const Tokens = {
  // Database
  DATABASE_CONNECTION: Symbol('DATABASE_CONNECTION'),
  DATABASE_READ_REPLICA: Symbol('DATABASE_READ_REPLICA'),

  // Cache
  CACHE_MANAGER: Symbol('CACHE_MANAGER'),
  CACHE_TTL: Symbol('CACHE_TTL'),

  // External Services
  PAYMENT_SERVICE: Symbol('PAYMENT_SERVICE'),
  EMAIL_SERVICE: Symbol('EMAIL_SERVICE'),
  SMS_SERVICE: Symbol('SMS_SERVICE'),
  STORAGE_SERVICE: Symbol('STORAGE_SERVICE'),

  // Config
  APP_CONFIG: Symbol('APP_CONFIG'),
  JWT_CONFIG: Symbol('JWT_CONFIG'),
  DATABASE_CONFIG: Symbol('DATABASE_CONFIG'),

  // Logger
  LOGGER: Symbol('LOGGER'),

  // Queue
  EMAIL_QUEUE: Symbol('EMAIL_QUEUE'),
  NOTIFICATION_QUEUE: Symbol('NOTIFICATION_QUEUE'),
} as const;

// Su dung tokens
// module.ts
@Module({
  providers: [
    {
      provide: Tokens.PAYMENT_SERVICE,
      useClass: StripePaymentService,
    },
    {
      provide: Tokens.EMAIL_SERVICE,
      useClass: SendGridEmailService,
    },
    {
      provide: Tokens.LOGGER,
      useFactory: () => {
        return new WinstonLogger({
          level: 'info',
          transports: [new Console(), new File({ filename: 'app.log' })],
        });
      },
    },
  ],
})
export class ProvidersModule {}

// service.ts
@Injectable()
export class OrderService {
  constructor(
    @Inject(Tokens.PAYMENT_SERVICE) private readonly payment: PaymentService,
    @Inject(Tokens.EMAIL_SERVICE) private readonly email: EmailService,
    @Inject(Tokens.LOGGER) private readonly logger: LoggerService,
  ) {}
}
```

---

## 7. Module-scoped Providers vs Global

### 7.1. Module-scoped (mac dinh)

Mac dinh, tat ca providers trong NestJS deu la **module-scoped** - chi kha dung trong module ma chung duoc khai bao.

```typescript
// === MODULE A ===
@Injectable()
export class ServiceA {
  getData(): string {
    return 'Data from ServiceA';
  }
}

@Module({
  providers: [ServiceA],
  exports: [ServiceA], // PHAI export de module khac su dung
})
export class ModuleA {}

// === MODULE B ===
@Injectable()
export class ServiceB {
  constructor(private readonly serviceA: ServiceA) {} // Can ServiceA

  process(): string {
    return `ServiceB processed: ${this.serviceA.getData()}`;
  }
}

@Module({
  imports: [ModuleA], // PHAI import ModuleA de su dung ServiceA
  providers: [ServiceB],
})
export class ModuleB {}

// === Khong import => LOI ===
@Module({
  // Khong import ModuleA
  providers: [ServiceB], // ServiceB can ServiceA nhung khong co!
})
export class ModuleFail {}
// Error: Nest can't resolve dependencies of the ServiceB (?).
```

### 7.2. Global Providers

**Global providers** kha dung o moi noi trong ung dung ma khong can import module chua chung.

```typescript
// === CACH 1: @Global() decorator ===
@Global()
@Module({
  providers: [
    LoggerService,
    ConfigService,
    {
      provide: 'CACHE_MANAGER',
      useClass: RedisCacheService,
    },
  ],
  exports: [LoggerService, ConfigService, 'CACHE_MANAGER'],
})
export class CoreModule {}

// Bat ky module nao cung co the su dung LoggerService, ConfigService
// ma KHONG can import CoreModule
@Module({
  // Khong can: imports: [CoreModule]
  providers: [UserService],
})
export class UserModule {}

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,    // Co the inject truc tiep
    private readonly config: ConfigService,    // Co the inject truc tiep
    @Inject('CACHE_MANAGER') private readonly cache: CacheService,
  ) {}
}

// === CACH 2: Global Pipe/Filter/Guard/Interceptor ===
// Trong main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipe - ap dung cho moi route
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Global filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global guard
  app.useGlobalGuards(new AuthGuard());

  await app.listen(3000);
}

// === CACH 3: APP_* tokens (de co the inject dependencies) ===
@Module({
  providers: [
    // Global pipe co the inject dependencies
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Global filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

**Luu y:** Khong nen lam dung `@Global()`. Chi su dung cho cac providers thuc su can thiet o moi noi (logger, config, cache).

---

## 8. Request-scoped Providers

### 8.1. Scope.REQUEST

Mac dinh, NestJS providers la **singleton** (chi co 1 instance). Voi `Scope.REQUEST`, moi HTTP request se tao mot instance moi.

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

// === REQUEST-SCOPED SERVICE ===
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private readonly startTime: number;
  private readonly requestId: string;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.startTime = Date.now();
    this.requestId = this.generateRequestId();
    console.log(`[${this.requestId}] New RequestContextService instance created`);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRequestId(): string {
    return this.requestId;
  }

  getUser(): any {
    return (this.request as any).user;
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  getClientIp(): string {
    return this.request.ip || this.request.socket.remoteAddress || 'unknown';
  }

  getUserAgent(): string {
    return this.request.headers['user-agent'] || 'unknown';
  }
}

// Su dung trong controller
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  async findAll() {
    console.log(`Request ID: ${this.requestContext.getRequestId()}`);
    console.log(`Client IP: ${this.requestContext.getClientIp()}`);
    return this.orderService.findAll();
  }
}
```

### 8.2. REQUEST object injection

```typescript
// Inject REQUEST object truc tiep
@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async logAction(action: string, entity: string, entityId: string): Promise<void> {
    const auditEntry = {
      action,
      entity,
      entityId,
      userId: (this.request as any).user?.id || 'anonymous',
      ip: this.request.ip,
      userAgent: this.request.headers['user-agent'],
      timestamp: new Date(),
      method: this.request.method,
      path: this.request.path,
    };

    console.log('Audit:', JSON.stringify(auditEntry));
    // Luu vao database
  }
}

// Ket hop voi multi-tenancy
@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private tenantId: string;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    // Lay tenant ID tu header hoac subdomain
    this.tenantId =
      (this.request.headers['x-tenant-id'] as string) ||
      this.extractTenantFromHost(this.request.hostname);
  }

  private extractTenantFromHost(hostname: string): string {
    // tenant1.myapp.com => tenant1
    const parts = hostname.split('.');
    return parts.length > 2 ? parts[0] : 'default';
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getTenantDatabaseName(): string {
    return `db_${this.tenantId}`;
  }
}
```

### 8.3. Scope bubbling

Khi mot provider la request-scoped, tat ca cac providers phu thuoc vao no cung tro thanh request-scoped.

```typescript
// RequestContextService la REQUEST-scoped
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

// UserService inject RequestContextService
// => UserService CUNG tro thanh request-scoped (scope bubbling)
@Injectable() // Mac dinh la SINGLETON, nhung se bi "nang len" thanh REQUEST
export class UserService {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly userRepo: UserRepository,
  ) {}

  async getCurrentUser() {
    const userId = this.requestContext.getUser()?.id;
    return this.userRepo.findById(userId);
  }
}

// UserController cung bi anh huong
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe() {
    return this.userService.getCurrentUser();
  }
}

// Chu y: PERFORMANCE IMPACT
// - Moi request tao moi instances cua tat ca providers trong chain
// - Tang memory usage va latency
// - Chi dung khi that su can thiet
```

**Canh bao ve performance:**

```
    SINGLETON (mac dinh)          REQUEST-SCOPED
    ┌────────────────┐            ┌────────────────┐
    │ Request 1 ──┐  │            │ Request 1 ──┐  │
    │ Request 2 ──┤  │            │   └── New instance │
    │ Request 3 ──┘  │            │ Request 2 ──┐  │
    │   └── Same     │            │   └── New instance │
    │      instance   │            │ Request 3 ──┐  │
    │                │            │   └── New instance │
    │ Memory: Thap   │            │ Memory: Cao  │
    │ Speed: Nhanh   │            │ Speed: Cham hon │
    └────────────────┘            └────────────────┘
```

---

## 9. Transient Providers

### 9.1. Scope.TRANSIENT

**Transient providers** tao mot instance moi moi khi duoc inject. Khac voi REQUEST-scoped, transient tao instance moi cho moi consumer, khong phai cho moi request.

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientLoggerService {
  private context: string = '';
  private instanceId: string;

  constructor() {
    this.instanceId = Math.random().toString(36).substr(2, 9);
    console.log(`TransientLogger instance created: ${this.instanceId}`);
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string): void {
    console.log(`[${this.instanceId}][${this.context}] ${message}`);
  }

  error(message: string): void {
    console.error(`[${this.instanceId}][${this.context}] ERROR: ${message}`);
  }
}

// Moi service nhan mot instance KHAC NHAU cua TransientLoggerService
@Injectable()
export class UserService {
  constructor(private readonly logger: TransientLoggerService) {
    this.logger.setContext('UserService');
    // logger.instanceId = 'abc123'
  }

  findAll() {
    this.logger.log('Finding all users');
    return [];
  }
}

@Injectable()
export class ProductService {
  constructor(private readonly logger: TransientLoggerService) {
    this.logger.setContext('ProductService');
    // logger.instanceId = 'xyz789' (KHAC voi UserService)
  }

  findAll() {
    this.logger.log('Finding all products');
    return [];
  }
}

// Minh hoa:
// UserService.logger !== ProductService.logger (khac instance)
// Nhung trong moi request, UserService.logger luon la cung 1 instance
// (khac voi REQUEST scope - moi request tao instance moi)
```

### 9.2. Use cases

```typescript
// Use case 1: Logger voi context rieng biet
@Injectable({ scope: Scope.TRANSIENT })
export class ContextualLogger {
  private prefix: string = '';
  private metadata: Record<string, any> = {};

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  log(message: string): void {
    const metaStr = Object.keys(this.metadata).length
      ? ` ${JSON.stringify(this.metadata)}`
      : '';
    console.log(`[${this.prefix}]${metaStr} ${message}`);
  }
}

// Use case 2: Builder pattern
@Injectable({ scope: Scope.TRANSIENT })
export class QueryBuilder {
  private table: string = '';
  private conditions: string[] = [];
  private orderBy: string = '';
  private limitValue: number = 0;

  from(table: string): this {
    this.table = table;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  order(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderBy = `${column} ${direction}`;
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  build(): string {
    let query = `SELECT * FROM ${this.table}`;
    if (this.conditions.length) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    if (this.orderBy) {
      query += ` ORDER BY ${this.orderBy}`;
    }
    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`;
    }
    return query;
  }
}

// Moi service nhan QueryBuilder rieng, khong bi conflict state
@Injectable()
export class UserRepository {
  constructor(private readonly qb: QueryBuilder) {}

  findActive() {
    return this.qb
      .from('users')
      .where('active = true')
      .order('created_at', 'DESC')
      .limit(10)
      .build();
    // SELECT * FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10
  }
}
```

**So sanh 3 loai scope:**

```
    ┌──────────────┬──────────────────┬─────────────────┬────────────────┐
    │              │  SINGLETON       │  REQUEST         │  TRANSIENT     │
    ├──────────────┼──────────────────┼─────────────────┼────────────────┤
    │ Instance     │ 1 duy nhat      │ 1 / request     │ 1 / injection  │
    │ Shared       │ Toan bo app     │ Trong 1 request │ Khong shared   │
    │ Performance  │ Tot nhat        │ Trung binh      │ Trung binh     │
    │ State        │ Shared state    │ Per-request     │ Per-consumer   │
    │ Memory       │ Thap            │ Cao             │ Trung binh     │
    │ Use case     │ Stateless       │ Request context │ Stateful/      │
    │              │ services        │ multi-tenant    │ Builder        │
    └──────────────┴──────────────────┴─────────────────┴────────────────┘
```

---

## 10. Durable Providers

**Durable providers** la mot tinh nang nang cao cho phep toi uu hoa request-scoped providers bang cach tai su dung instances dua tren mot so tieu chi (vi du: tenant ID).

```typescript
import { Injectable, Scope } from '@nestjs/common';
import { ContextIdFactory, ContextId, HostComponentInfo } from '@nestjs/core';

// Custom ContextIdStrategy
export class TenantContextIdStrategy implements ContextIdStrategy {
  private readonly tenants = new Map<string, ContextId>();

  attach(contextId: ContextId, request: Request): ContextIdReplaceFn | undefined {
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return undefined; // Khong co tenant => dung default behavior
    }

    let tenantContextId: ContextId;

    if (this.tenants.has(tenantId)) {
      tenantContextId = this.tenants.get(tenantId)!;
    } else {
      // Tao ContextId moi cho tenant nay
      tenantContextId = ContextIdFactory.create();
      this.tenants.set(tenantId, tenantContextId);
    }

    // Return function de replace contextId
    return (info: HostComponentInfo) => {
      const isScopedProvider = info.isTreeDurable;
      return isScopedProvider ? tenantContextId : contextId;
    };
  }
}

// Dang ky strategy trong main.ts
async function bootstrap() {
  ContextIdFactory.apply(new TenantContextIdStrategy());
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// Durable provider: duoc tai su dung cho cung tenant
@Injectable({ scope: Scope.REQUEST, durable: true })
export class TenantDatabaseService {
  private connection: DatabaseConnection;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    console.log(`Creating durable DB service for tenant: ${tenantId}`);
    // Connection nay se duoc tai su dung cho tat ca requests tu cung tenant
  }

  async query(sql: string): Promise<any[]> {
    return this.connection.query(sql);
  }
}

// Ket qua:
// Request tu tenant-A lan 1: Tao moi TenantDatabaseService
// Request tu tenant-A lan 2: TAI SU DUNG instance cu
// Request tu tenant-B lan 1: Tao moi TenantDatabaseService
// Request tu tenant-B lan 2: TAI SU DUNG instance cu
// => Giam overhead dang ke so voi request-scoped thong thuong
```

---

## 11. Circular Dependency va forwardRef

### 11.1. Van de Circular Dependency

Circular dependency xay ra khi hai hoac nhieu classes phu thuoc lan nhau, tao thanh mot vong tron.

```
    CIRCULAR DEPENDENCY
    ┌──────────────┐         ┌──────────────┐
    │              │ inject  │              │
    │  ServiceA    ├────────→│  ServiceB    │
    │              │         │              │
    │              │←────────┤              │
    │              │ inject  │              │
    └──────────────┘         └──────────────┘

    ServiceA can ServiceB de khoi tao
    ServiceB can ServiceA de khoi tao
    => AI DUOC TAO TRUOC? => LOI!
```

```typescript
// ❌ LOI: Circular dependency
@Injectable()
export class CatService {
  constructor(private readonly dogService: DogService) {} // Can DogService

  getCats() {
    return ['Cat1', 'Cat2'];
  }

  getFriendlyDogs() {
    return this.dogService.getDogs().filter(d => d.friendly);
  }
}

@Injectable()
export class DogService {
  constructor(private readonly catService: CatService) {} // Can CatService

  getDogs() {
    return [
      { name: 'Dog1', friendly: true },
      { name: 'Dog2', friendly: false },
    ];
  }

  getChasedCats() {
    return this.catService.getCats();
  }
}

// Error: A circular dependency between modules/providers has been detected
```

### 11.2. forwardRef giua cac Providers

```typescript
import { Injectable, Inject, forwardRef } from '@nestjs/common';

// ✅ DUNG: Su dung forwardRef de giai quyet circular dependency
@Injectable()
export class CatService {
  constructor(
    @Inject(forwardRef(() => DogService)) // forwardRef
    private readonly dogService: DogService,
  ) {}

  getCats(): string[] {
    return ['Meo muop', 'Meo tam the', 'Meo Anh long ngan'];
  }

  getFriendlyDogs() {
    return this.dogService.getDogs().filter(d => d.friendly);
  }
}

@Injectable()
export class DogService {
  constructor(
    @Inject(forwardRef(() => CatService)) // forwardRef
    private readonly catService: CatService,
  ) {}

  getDogs() {
    return [
      { name: 'Corgi', friendly: true },
      { name: 'Husky', friendly: true },
      { name: 'Pitbull', friendly: false },
    ];
  }

  getChasedCats(): string[] {
    return this.catService.getCats();
  }
}

@Module({
  providers: [CatService, DogService],
  exports: [CatService, DogService],
})
export class PetModule {}
```

### 11.3. forwardRef giua cac Modules

```typescript
// === MODULE A ===
@Module({
  imports: [forwardRef(() => ModuleB)], // forwardRef
  providers: [ServiceA],
  exports: [ServiceA],
})
export class ModuleA {}

@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private readonly serviceB: ServiceB,
  ) {}

  getDataA(): string {
    return 'Data from A';
  }

  getDataFromB(): string {
    return this.serviceB.getDataB();
  }
}

// === MODULE B ===
@Module({
  imports: [forwardRef(() => ModuleA)], // forwardRef
  providers: [ServiceB],
  exports: [ServiceB],
})
export class ModuleB {}

@Injectable()
export class ServiceB {
  constructor(
    @Inject(forwardRef(() => ServiceA))
    private readonly serviceA: ServiceA,
  ) {}

  getDataB(): string {
    return 'Data from B';
  }

  getDataFromA(): string {
    return this.serviceA.getDataA();
  }
}
```

**Best Practice:** Nen tranh circular dependency neu co the. Cach tot hon:

```typescript
// CACH TOT HON: Tao mot service trung gian
@Injectable()
export class PetRelationshipService {
  constructor(
    private readonly catService: CatService,
    private readonly dogService: DogService,
  ) {}

  getFriendlyDogsForCats() {
    const cats = this.catService.getCats();
    const dogs = this.dogService.getDogs().filter(d => d.friendly);
    return { cats, friendlyDogs: dogs };
  }

  getChasedCatsByDogs() {
    const dogs = this.dogService.getDogs();
    const cats = this.catService.getCats();
    return { dogs, chasedCats: cats };
  }
}

// CatService va DogService khong can biet nhau
@Injectable()
export class CatService {
  getCats(): string[] {
    return ['Meo muop', 'Meo tam the'];
  }
}

@Injectable()
export class DogService {
  getDogs() {
    return [{ name: 'Corgi', friendly: true }];
  }
}
```

---

## 12. Hierarchical Injectors

NestJS su dung he thong module hierarchy. Moi module co injector rieng va co the truy cap providers tu parent modules.

```typescript
// === HIERARCHICAL MODULES ===

// Root Module (cap cao nhat)
@Global()
@Module({
  providers: [
    {
      provide: 'APP_LOGGER',
      useValue: new Logger('App'),
    },
    ConfigService,
  ],
  exports: [ConfigService, 'APP_LOGGER'],
})
export class CoreModule {}

// Feature Module (cap trung gian)
@Module({
  imports: [CoreModule],
  providers: [
    UserRepository,
    UserService,
    {
      provide: 'USER_CACHE',
      useFactory: (config: ConfigService) => {
        return new CacheService(config.get('CACHE_TTL'));
      },
      inject: [ConfigService], // Inject tu CoreModule
    },
  ],
  exports: [UserService],
})
export class UserModule {}

// Sub-feature Module (cap thap nhat)
@Module({
  imports: [UserModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService, // Tu UserModule
    // ConfigService tu CoreModule (global) cung kha dung
    private readonly config: ConfigService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userService.getUserById(userId);
    return {
      ...user,
      appName: this.config.get('APP_NAME'),
    };
  }
}

// === PROVIDER RESOLUTION ORDER ===
// 1. Tim trong module hien tai
// 2. Tim trong cac module da import
// 3. Tim trong global modules
// 4. Neu khong tim thay => Error
```

```
    PROVIDER RESOLUTION HIERARCHY
    ┌──────────────────────────────────┐
    │  AppModule (root)                │
    │  ┌────────────────────────────┐  │
    │  │ CoreModule (@Global)       │  │
    │  │  - ConfigService           │  │
    │  │  - APP_LOGGER              │  │
    │  └────────────────────────────┘  │
    │                                  │
    │  ┌────────────────────────────┐  │
    │  │ UserModule                 │  │
    │  │  - UserRepository          │  │
    │  │  - UserService             │  │
    │  │  - USER_CACHE              │  │
    │  │  ┌──────────────────────┐  │  │
    │  │  │ ProfileModule        │  │  │
    │  │  │  - ProfileService    │  │  │
    │  │  │  - ProfileController │  │  │
    │  │  │                      │  │  │
    │  │  │  Co the truy cap:    │  │  │
    │  │  │  ✅ UserService      │  │  │
    │  │  │  ✅ ConfigService    │  │  │
    │  │  │  ❌ UserRepository   │  │  │
    │  │  │  (khong duoc export) │  │  │
    │  │  └──────────────────────┘  │  │
    │  └────────────────────────────┘  │
    └──────────────────────────────────┘
```

---

## 13. Testing voi DI

### 13.1. Mock Services

```typescript
import { Test, TestingModule } from '@nestjs/testing';

// === Service can test ===
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userRepository.create(dto);
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    this.logger.log('UserService', `User created: ${user.id}`);
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
}

// === Unit Test voi mock dependencies ===
describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let emailService: jest.Mocked<EmailService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    // Tao mock objects
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Tao testing module voi NestJS DI
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    emailService = module.get(EmailService);
    loggerService = module.get(LoggerService);
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Nguyen Van A',
      email: 'a@example.com',
      password: 'password123',
    };

    it('nen tao user thanh cong khi email chua ton tai', async () => {
      const expectedUser = { id: 1, ...createUserDto };

      userRepository.findByEmail.mockResolvedValue(null); // Email chua ton tai
      userRepository.create.mockResolvedValue(expectedUser);
      emailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await userService.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.name,
      );
      expect(loggerService.log).toHaveBeenCalled();
    });

    it('nen throw ConflictException khi email da ton tai', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 1, ...createUserDto });

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('nen tra ve user khi tim thay', async () => {
      const expectedUser = { id: 1, name: 'Test', email: 'test@test.com' };
      userRepository.findById.mockResolvedValue(expectedUser);

      const result = await userService.findById(1);
      expect(result).toEqual(expectedUser);
    });

    it('nen throw NotFoundException khi khong tim thay', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 13.2. Override Providers

```typescript
// === Override providers trong testing ===
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override provider trong module that
      .overrideProvider(UserRepository)
      .useValue({
        findAll: jest.fn().mockResolvedValue([
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' },
        ]),
        findById: jest.fn().mockResolvedValue({ id: 1, name: 'User 1' }),
      })
      // Override custom provider
      .overrideProvider('EMAIL_SERVICE')
      .useValue({
        sendEmail: jest.fn().mockResolvedValue(true),
      })
      // Override guard
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]);
  });
});
```

### 13.3. Auto Mocking

```typescript
// === Auto mock voi jest.createMockFromModule ===
import { createMock } from '@golevelup/ts-jest';

describe('OrderService', () => {
  let orderService: OrderService;
  let userService: jest.Mocked<UserService>;
  let paymentService: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: UserService,
          useValue: createMock<UserService>(), // Auto mock tat ca methods
        },
        {
          provide: PaymentService,
          useValue: createMock<PaymentService>(),
        },
      ],
    }).compile();

    orderService = module.get(OrderService);
    userService = module.get(UserService);
    paymentService = module.get(PaymentService);
  });

  it('nen tao order', async () => {
    userService.findById.mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 'test@test.com',
    });
    paymentService.charge.mockResolvedValue({
      transactionId: 'tx_123',
      status: 'success',
    });

    const result = await orderService.createOrder(1, [
      { productId: 1, quantity: 2 },
    ]);

    expect(result).toBeDefined();
    expect(userService.findById).toHaveBeenCalledWith(1);
    expect(paymentService.charge).toHaveBeenCalled();
  });
});
```

---

## 14. Loi thuong gap

### Loi 1: Quen @Injectable()

```typescript
// ❌ LOI: Thieu @Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}
}
// Error: Nest can't resolve dependencies of the UserService (?).

// ✅ DUNG:
@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}
}
```

### Loi 2: Quen dang ky Provider trong Module

```typescript
// ❌ LOI: Khong dang ky trong providers
@Module({
  controllers: [UserController],
  // Quen: providers: [UserService]
})
export class UserModule {}
// Error: Nest can't resolve dependencies

// ✅ DUNG:
@Module({
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

### Loi 3: Quen export Provider

```typescript
// ❌ LOI: Khong export
@Module({
  providers: [SharedService],
  // Quen: exports: [SharedService]
})
export class SharedModule {}

@Module({
  imports: [SharedModule],
  providers: [AppService], // AppService dung SharedService nhung khong co
})
export class AppModule {}

// ✅ DUNG:
@Module({
  providers: [SharedService],
  exports: [SharedService], // PHAI export
})
export class SharedModule {}
```

### Loi 4: Circular Dependency khong co forwardRef

```typescript
// ❌ LOI:
@Module({
  imports: [ModuleB], // ModuleB import ModuleA
  providers: [ServiceA],
  exports: [ServiceA],
})
export class ModuleA {}
// Error: A circular dependency has been detected

// ✅ DUNG:
@Module({
  imports: [forwardRef(() => ModuleB)],
  providers: [ServiceA],
  exports: [ServiceA],
})
export class ModuleA {}
```

### Loi 5: Inject token khong dung

```typescript
// ❌ LOI: Dung string khong match
@Module({
  providers: [{ provide: 'MY_SERVICE', useClass: MyService }],
})
export class AppModule {}

@Injectable()
export class Consumer {
  constructor(
    @Inject('my_service') // sai ten! (case-sensitive)
    private readonly myService: MyService,
  ) {}
}

// ✅ DUNG: Dung constant de tranh loi typo
export const MY_SERVICE_TOKEN = 'MY_SERVICE';

@Module({
  providers: [{ provide: MY_SERVICE_TOKEN, useClass: MyService }],
})
export class AppModule {}

@Injectable()
export class Consumer {
  constructor(
    @Inject(MY_SERVICE_TOKEN) private readonly myService: MyService,
  ) {}
}
```

### Loi 6: Scope bubbling khong mong muon

```typescript
// ❌ CANH BAO: Performance issue
@Injectable({ scope: Scope.REQUEST })
export class RequestLogger {
  constructor(@Inject(REQUEST) private request: Request) {}
}

// Tat ca services inject RequestLogger deu tro thanh request-scoped!
@Injectable() // Se bi "nang" thanh REQUEST scope
export class HeavyComputationService {
  constructor(private readonly logger: RequestLogger) {}
  // Instance moi duoc tao cho moi request => CHAM
}

// ✅ GIAI PHAP: Tach rieng phan can request scope
@Injectable()
export class HeavyComputationService {
  constructor(private readonly logger: LoggerService) {} // Dung singleton logger

  compute(requestId: string, data: any) {
    this.logger.log(`[${requestId}] Computing...`);
    // heavy computation
  }
}
```

---

## 15. Best Practices

### 1. Luon dung Constructor-based Injection

```typescript
// ✅ GOOD: Constructor-based
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {}
}
```

### 2. Dung Interface/Abstract class de dinh nghia contracts

```typescript
// ✅ GOOD: Dinh nghia interface
export abstract class CacheService {
  abstract get(key: string): Promise<any>;
  abstract set(key: string, value: any, ttl?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
}

@Injectable()
export class RedisCacheService extends CacheService {
  async get(key: string) { /* ... */ }
  async set(key: string, value: any, ttl?: number) { /* ... */ }
  async del(key: string) { /* ... */ }
}

@Module({
  providers: [{ provide: CacheService, useClass: RedisCacheService }],
  exports: [CacheService],
})
export class CacheModule {}
```

### 3. Dung constants cho injection tokens

```typescript
// ✅ GOOD: Tap trung tokens trong 1 file
// constants/tokens.ts
export const TOKENS = {
  DATABASE: Symbol('DATABASE'),
  CACHE: Symbol('CACHE'),
  MAILER: Symbol('MAILER'),
} as const;
```

### 4. Giu providers Singleton khi co the

```typescript
// ✅ GOOD: Mac dinh la singleton, chi doi scope khi that su can
@Injectable() // Singleton - performance tot nhat
export class UserService {
  // Stateless logic - khong can request scope
  async findById(id: number) { /* ... */ }
}
```

### 5. Tranh circular dependencies

```typescript
// ✅ GOOD: Dung mediator/event pattern thay vi circular DI
@Injectable()
export class EventBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}
```

---

## 16. Bai tap

### Bai tap 1: Basic DI (De)

Tao mot ung dung NestJS voi:
- `TaskService` - quan ly danh sach cong viec (CRUD)
- `LoggerService` - ghi log tat ca operations
- `TaskController` - REST endpoints
- `TaskModule` - dang ky tat ca providers

Yeu cau:
- `TaskService` inject `LoggerService`
- `TaskController` inject `TaskService`
- Moi method cua `TaskService` phai goi `LoggerService.log()`

### Bai tap 2: Custom Providers (Trung binh)

Tao he thong notification voi cac yeu cau:
- Interface `NotificationSender` voi methods: `send(to, message)`, `sendBulk(recipients, message)`
- 3 implementations: `EmailNotification`, `SmsNotification`, `PushNotification`
- Su dung `useClass` de chon implementation dua tren environment variable
- Su dung `useFactory` de tao connection toi notification service
- Su dung `useValue` de cung cap config

### Bai tap 3: Advanced Scoping (Kho)

Xay dung he thong multi-tenant:
- `TenantService` (request-scoped) - xac dinh tenant tu request header
- `TenantDatabaseService` - ket noi toi database cua tenant tuong ung
- `AuditService` (request-scoped) - ghi log moi action voi thong tin request
- `TransientLogger` (transient) - logger voi context rieng cho moi consumer

Yeu cau:
- Hieu va xu ly scope bubbling
- Viet unit tests voi mock dependencies
- Su dung `forwardRef` neu can thiet

### Bai tap 4: Testing (Trung binh)

Viet unit tests cho mot `OrderService` co cac dependencies:
- `UserService` - lay thong tin user
- `ProductService` - lay thong tin san pham
- `PaymentService` - xu ly thanh toan
- `EmailService` - gui email xac nhan
- `InventoryService` - kiem tra ton kho

Yeu cau:
- Mock tat ca dependencies
- Test happy path va error cases
- Test voi cac gia tri bien (edge cases)
- Su dung `Test.createTestingModule()` va `.overrideProvider()`

### Bai tap 5: Tong hop (Nang cao)

Xay dung mini e-commerce backend voi DI:
- Abstract class `PaymentGateway` voi 2 implementations (Stripe, MoMo)
- Factory provider tao database connection dua tren config
- Global `CoreModule` voi Logger, Config, Cache
- Request-scoped `CartService` (gio hang rieng moi request/user)
- Transient `QueryBuilder`
- Su dung Symbol tokens cho tat ca custom providers
- Viet tests cho tat ca services

---

## Tong ket

```
    DEPENDENCY INJECTION TRONG NestJS - TONG QUAN
    ┌───────────────────────────────────────────────────┐
    │                                                   │
    │  INJECTION TYPES                                  │
    │  ├── Constructor-based (khuyen dung)              │
    │  └── Property-based (@Inject)                     │
    │                                                   │
    │  PROVIDER TYPES                                   │
    │  ├── useClass  - Class implementation             │
    │  ├── useValue  - Static values                    │
    │  ├── useFactory - Dynamic creation                │
    │  └── useExisting - Aliases                        │
    │                                                   │
    │  SCOPES                                           │
    │  ├── Singleton (mac dinh, tot nhat)               │
    │  ├── Request (moi HTTP request)                   │
    │  ├── Transient (moi injection)                    │
    │  └── Durable (tai su dung thong minh)             │
    │                                                   │
    │  TOKENS                                           │
    │  ├── Class reference (mac dinh)                   │
    │  ├── String tokens                                │
    │  └── Symbol tokens (khuyen dung)                  │
    │                                                   │
    │  BEST PRACTICES                                   │
    │  ├── Constructor injection                        │
    │  ├── Interface/Abstract contracts                 │
    │  ├── Singleton khi co the                         │
    │  ├── Tranh circular dependencies                  │
    │  └── Mock dependencies trong tests                │
    │                                                   │
    └───────────────────────────────────────────────────┘
```

> **Tiep theo:** [Bai 6: Pipes va Validation](../06-Pipes-and-Validation/README.md) - Tim hieu cach validate va transform du lieu dau vao trong NestJS.
