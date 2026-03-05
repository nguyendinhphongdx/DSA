# Dependency Inversion Principle (DIP)

## 1. Khái niệm

> "High-level modules should not depend on low-level modules.
> Both should depend on abstractions."
> — Robert C. Martin

```
❌ Vi phạm DIP:                       ✅ Tuân thủ DIP:
┌──────────────┐                      ┌──────────────┐
│ OrderService │                      │ OrderService │
│ (high-level) │                      │ (high-level) │
└──────┬───────┘                      └──────┬───────┘
       │ phụ thuộc trực tiếp                 │ phụ thuộc abstraction
       ▼                                     ▼
┌──────────────┐                      ┌──────────────┐
│ MySQLDatabase│                      │  «interface» │
│ (low-level)  │                      │   Database   │
└──────────────┘                      └──────┬───────┘
                                        ┌────┴────┐
                                     MySQL   MongoDB
                                    (low-level implementations)
```

---

## 2. Ví dụ Bad vs Good

### Bad: Phụ thuộc trực tiếp vào concrete class

```javascript
// ❌ OrderService phụ thuộc TRỰC TIẾP vào MySQLDatabase
class MySQLDatabase {
  save(data) {
    console.log(`MySQL: INSERT INTO orders VALUES (${JSON.stringify(data)})`);
  }
  find(id) {
    console.log(`MySQL: SELECT * FROM orders WHERE id = ${id}`);
  }
}

class OrderService {
  constructor() {
    this.db = new MySQLDatabase(); // ❌ Hard-coded dependency!
  }

  createOrder(order) {
    // business logic...
    this.db.save(order);
  }
}

// Vấn đề:
// - Muốn đổi sang MongoDB? Phải SỬA OrderService
// - Muốn test? Phải có MySQL chạy thật
// - OrderService biết quá nhiều về implementation details
```

### Good: Phụ thuộc vào abstraction

```javascript
// ✅ Interface (abstraction)
class Database {
  save(data) { throw new Error('Must implement'); }
  find(id) { throw new Error('Must implement'); }
}

// Implementation 1
class MySQLDatabase extends Database {
  save(data) { console.log(`MySQL: saving ${JSON.stringify(data)}`); }
  find(id) { console.log(`MySQL: finding ${id}`); }
}

// Implementation 2
class MongoDatabase extends Database {
  save(data) { console.log(`MongoDB: saving ${JSON.stringify(data)}`); }
  find(id) { console.log(`MongoDB: finding ${id}`); }
}

// Implementation 3 (for testing)
class InMemoryDatabase extends Database {
  constructor() { super(); this.store = new Map(); }
  save(data) { this.store.set(data.id, data); }
  find(id) { return this.store.get(id); }
}

// OrderService phụ thuộc vào ABSTRACTION (Database interface)
class OrderService {
  constructor(database) { // ← Inject dependency
    this.db = database;
  }

  createOrder(order) {
    // business logic...
    this.db.save(order);
  }
}

// Sử dụng - dễ dàng swap implementation
const service1 = new OrderService(new MySQLDatabase());
const service2 = new OrderService(new MongoDatabase());
const serviceTest = new OrderService(new InMemoryDatabase()); // Easy testing!
```

---

## 3. Dependency Injection Patterns

### 3.1. Constructor Injection (phổ biến nhất)

```javascript
class UserService {
  constructor(userRepo, emailService, logger) {
    this.userRepo = userRepo;
    this.emailService = emailService;
    this.logger = logger;
  }

  register(userData) {
    const user = this.userRepo.create(userData);
    this.emailService.sendWelcome(user.email);
    this.logger.info(`User registered: ${user.email}`);
    return user;
  }
}

// Inject dependencies
const service = new UserService(
  new PostgresUserRepo(),
  new SendGridEmailService(),
  new WinstonLogger()
);
```

### 3.2. Setter Injection

```javascript
class NotificationService {
  setChannel(channel) {
    this.channel = channel;
  }

  notify(message) {
    this.channel.send(message);
  }
}

const service = new NotificationService();
service.setChannel(new EmailChannel());
service.notify('Hello!');
service.setChannel(new SMSChannel()); // Đổi runtime
service.notify('Hello again!');
```

### 3.3. Function Parameter Injection

```javascript
// Functional style - phổ biến trong JS
function createOrderHandler(db, mailer, logger) {
  return async function handleOrder(orderData) {
    const order = await db.save(orderData);
    await mailer.sendConfirmation(order);
    logger.info('Order created', order.id);
    return order;
  };
}

// Inject
const handleOrder = createOrderHandler(
  new PostgresDB(),
  new NodeMailer(),
  new PinoLogger()
);

await handleOrder({ item: 'Book', price: 29.99 });
```

---

## 4. DIP trong NestJS

NestJS built-in Dependency Injection:

```typescript
// Interface (abstraction)
interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<User>;
}

// Implementation
@Injectable()
class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>
  ) {}

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async save(user: User) {
    return this.repo.save(user);
  }
}

// Service phụ thuộc vào abstraction
@Injectable()
class UserService {
  constructor(
    @Inject('IUserRepository')
    private userRepo: IUserRepository // ← Abstraction, không phải concrete class
  ) {}

  async getUser(id: string) {
    return this.userRepo.findById(id);
  }
}

// Module wire up
@Module({
  providers: [
    UserService,
    { provide: 'IUserRepository', useClass: UserRepository }
  ]
})
class UserModule {}
```

---

## 5. DIP giúp Testing dễ dàng

```javascript
// Production code
class OrderService {
  constructor(paymentGateway, inventory, notifier) {
    this.paymentGateway = paymentGateway;
    this.inventory = inventory;
    this.notifier = notifier;
  }

  async placeOrder(order) {
    await this.paymentGateway.charge(order.total);
    await this.inventory.reserve(order.items);
    await this.notifier.send(`Order ${order.id} placed`);
    return { success: true };
  }
}

// Test - inject mocks dễ dàng
describe('OrderService', () => {
  it('should place order successfully', async () => {
    const mockPayment = { charge: jest.fn().mockResolvedValue(true) };
    const mockInventory = { reserve: jest.fn().mockResolvedValue(true) };
    const mockNotifier = { send: jest.fn().mockResolvedValue(true) };

    const service = new OrderService(mockPayment, mockInventory, mockNotifier);
    const result = await service.placeOrder({ id: '1', total: 100, items: ['A'] });

    expect(result.success).toBe(true);
    expect(mockPayment.charge).toHaveBeenCalledWith(100);
    expect(mockInventory.reserve).toHaveBeenCalledWith(['A']);
    expect(mockNotifier.send).toHaveBeenCalled();
  });
});
```

---

## 6. Simple DI Container

```javascript
class Container {
  constructor() {
    this.services = new Map();
  }

  register(name, factory) {
    this.services.set(name, factory);
  }

  resolve(name) {
    const factory = this.services.get(name);
    if (!factory) throw new Error(`Service ${name} not found`);
    return factory(this);
  }
}

// Đăng ký
const container = new Container();
container.register('logger', () => new ConsoleLogger());
container.register('database', () => new PostgresDB());
container.register('userRepo', (c) => new UserRepository(c.resolve('database')));
container.register('userService', (c) =>
  new UserService(c.resolve('userRepo'), c.resolve('logger'))
);

// Sử dụng
const userService = container.resolve('userService');
userService.getUser('123');
```

---

## 7. Bài tập

### Bài 1: Refactor phụ thuộc trực tiếp
```javascript
// Refactor để tuân thủ DIP
class WeatherApp {
  constructor() {
    this.api = new OpenWeatherMapAPI(); // ❌ Hard-coded
    this.cache = new RedisCache();      // ❌ Hard-coded
    this.logger = new FileLogger();     // ❌ Hard-coded
  }

  async getWeather(city) {
    const cached = this.cache.get(city);
    if (cached) return cached;

    this.logger.log(`Fetching weather for ${city}`);
    const data = await this.api.fetch(city);
    this.cache.set(city, data);
    return data;
  }
}
```

### Bài 2: Tạo hệ thống notification với DI
```javascript
// Tạo NotificationService nhận dependencies qua constructor
// - MessageFormatter (format message)
// - DeliveryChannel (gửi message: email, SMS, push)
// - Logger (ghi log)
// Viết test với mock dependencies
```
