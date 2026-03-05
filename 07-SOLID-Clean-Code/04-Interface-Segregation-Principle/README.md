# Interface Segregation Principle (ISP)

## 1. Khái niệm

> "Clients should not be forced to depend on interfaces they do not use."
> — Robert C. Martin

Không nên ép một class implement interface mà nó **không cần dùng**. Thay vào đó, tách thành nhiều interface nhỏ, chuyên biệt.

```
❌ Vi phạm ISP:                       ✅ Tuân thủ ISP:
┌──────────────────┐                 ┌──────────┐ ┌──────────┐ ┌──────────┐
│    «interface»   │                 │ Workable │ │ Eatable  │ │Sleepable │
│      Worker      │                 │+ work()  │ │+ eat()   │ │+ sleep() │
├──────────────────┤                 └────┬─────┘ └────┬─────┘ └────┬─────┘
│ + work()         │                      │            │            │
│ + eat()          │                 ┌────┴────────────┴────────────┴────┐
│ + sleep()        │                 │              Human                │
└────────┬─────────┘                 │ + work() + eat() + sleep()       │
    ┌────┴────┐                      └──────────────────────────────────┘
    │  Robot  │
    │ + work()│                      ┌──────────┐
    │ + eat() │ ← ???                │  Robot   │
    │ +sleep()│ ← ???                │ + work() │  ← Chỉ implement cái cần!
    └─────────┘                      └──────────┘
```

---

## 2. Ví dụ Bad vs Good

### Bad: Interface quá lớn (Fat Interface)

```javascript
// Interface quá rộng
class Animal {
  fly() { throw new Error('Must implement'); }
  swim() { throw new Error('Must implement'); }
  run() { throw new Error('Must implement'); }
  climb() { throw new Error('Must implement'); }
}

class Dog extends Animal {
  fly() { throw new Error('Dogs cannot fly!'); }   // ❌ Ép implement vô nghĩa
  swim() { return 'Dog swimming'; }
  run() { return 'Dog running'; }
  climb() { throw new Error('Dogs cannot climb!'); } // ❌
}

class Fish extends Animal {
  fly() { throw new Error('Fish cannot fly!'); }    // ❌
  swim() { return 'Fish swimming'; }
  run() { throw new Error('Fish cannot run!'); }    // ❌
  climb() { throw new Error('Fish cannot climb!'); } // ❌
}
```

### Good: Tách interface nhỏ

```javascript
// Mixin pattern trong JS
const Flyable = {
  fly() { return `${this.name} is flying`; }
};

const Swimmable = {
  swim() { return `${this.name} is swimming`; }
};

const Runnable = {
  run() { return `${this.name} is running`; }
};

class Dog {
  constructor(name) { this.name = name; }
}
Object.assign(Dog.prototype, Swimmable, Runnable);

class Eagle {
  constructor(name) { this.name = name; }
}
Object.assign(Eagle.prototype, Flyable, Runnable);

class Fish {
  constructor(name) { this.name = name; }
}
Object.assign(Fish.prototype, Swimmable);

const dog = new Dog('Rex');
dog.swim(); // 'Rex is swimming'
dog.run();  // 'Rex is running'
// dog.fly → undefined (không bị ép implement!)
```

---

## 3. ISP với TypeScript

```typescript
// ❌ Bad: Fat interface
interface SmartDevice {
  call(number: string): void;
  takePicture(): void;
  browseWeb(url: string): void;
  playMusic(song: string): void;
  sendMessage(msg: string): void;
}

// Điện thoại cũ phải implement hết?
class OldPhone implements SmartDevice {
  call(number: string) { /* OK */ }
  takePicture() { throw new Error('No camera!'); }
  browseWeb(url: string) { throw new Error('No browser!'); }
  playMusic(song: string) { throw new Error('No player!'); }
  sendMessage(msg: string) { /* OK */ }
}

// ✅ Good: Tách interface nhỏ
interface Callable {
  call(number: string): void;
}

interface Messageable {
  sendMessage(msg: string): void;
}

interface Camera {
  takePicture(): void;
}

interface WebBrowsable {
  browseWeb(url: string): void;
}

interface MusicPlayer {
  playMusic(song: string): void;
}

// Điện thoại cũ chỉ implement cái cần
class OldPhone implements Callable, Messageable {
  call(number: string) { console.log(`Calling ${number}`); }
  sendMessage(msg: string) { console.log(`SMS: ${msg}`); }
}

// Smartphone implement nhiều hơn
class SmartPhone implements Callable, Messageable, Camera, WebBrowsable, MusicPlayer {
  call(number: string) { console.log(`Calling ${number}`); }
  sendMessage(msg: string) { console.log(`Message: ${msg}`); }
  takePicture() { console.log('📸 Click!'); }
  browseWeb(url: string) { console.log(`Opening ${url}`); }
  playMusic(song: string) { console.log(`Playing ${song}`); }
}
```

---

## 4. ISP trong thực tế

### Ví dụ: Printer System

```typescript
// ❌ Bad
interface Machine {
  print(doc: string): void;
  scan(doc: string): void;
  fax(doc: string): void;
}

// Máy in đơn giản phải implement scan và fax?
class SimplePrinter implements Machine {
  print(doc: string) { console.log(`Printing: ${doc}`); }
  scan(doc: string) { throw new Error('Cannot scan!'); }
  fax(doc: string) { throw new Error('Cannot fax!'); }
}

// ✅ Good
interface Printer {
  print(doc: string): void;
}

interface Scanner {
  scan(doc: string): void;
}

interface Faxer {
  fax(doc: string): void;
}

class SimplePrinter implements Printer {
  print(doc: string) { console.log(`Printing: ${doc}`); }
}

class AllInOneMachine implements Printer, Scanner, Faxer {
  print(doc: string) { console.log(`Printing: ${doc}`); }
  scan(doc: string) { console.log(`Scanning: ${doc}`); }
  fax(doc: string) { console.log(`Faxing: ${doc}`); }
}
```

### Ví dụ: Repository Pattern

```typescript
// ❌ Bad: CRUD interface đầy đủ cho mọi thứ
interface Repository<T> {
  findAll(): T[];
  findById(id: string): T;
  create(entity: T): T;
  update(id: string, entity: T): T;
  delete(id: string): void;
  softDelete(id: string): void;
  restore(id: string): void;
  bulkInsert(entities: T[]): void;
}

// ✅ Good: Tách theo nhu cầu
interface ReadRepository<T> {
  findAll(): T[];
  findById(id: string): T;
}

interface WriteRepository<T> {
  create(entity: T): T;
  update(id: string, entity: T): T;
}

interface DeletableRepository {
  delete(id: string): void;
}

// Report chỉ cần đọc
class ReportRepository implements ReadRepository<Report> {
  findAll() { /* ... */ }
  findById(id: string) { /* ... */ }
}

// User cần CRUD đầy đủ
class UserRepository implements ReadRepository<User>, WriteRepository<User>, DeletableRepository {
  findAll() { /* ... */ }
  findById(id: string) { /* ... */ }
  create(user: User) { /* ... */ }
  update(id: string, user: User) { /* ... */ }
  delete(id: string) { /* ... */ }
}
```

---

## 5. ISP trong JavaScript (Composition)

JS không có interface chính thức, nhưng dùng **composition over inheritance**:

```javascript
// Tạo behaviors riêng biệt
const withLogging = (base) => ({
  ...base,
  log(msg) { console.log(`[LOG] ${msg}`); }
});

const withValidation = (base) => ({
  ...base,
  validate(data) { return Object.keys(data).length > 0; }
});

const withCaching = (base) => ({
  ...base,
  cache: new Map(),
  getFromCache(key) { return this.cache.get(key); },
  setCache(key, value) { this.cache.set(key, value); }
});

// Compose chỉ cái cần
const simpleService = withLogging({
  name: 'SimpleService'
});

const fullService = withCaching(withValidation(withLogging({
  name: 'FullService'
})));
```

---

## 6. Bài tập

### Bài 1: Tách interface
```typescript
// Tách interface này thành nhiều interface nhỏ phù hợp
interface Employee {
  work(): void;
  attendMeeting(): void;
  writeCode(): void;
  designUI(): void;
  manageTeam(): void;
  reviewCode(): void;
}

// Developer chỉ cần: work, writeCode, reviewCode, attendMeeting
// Designer chỉ cần: work, designUI, attendMeeting
// Manager chỉ cần: work, manageTeam, attendMeeting, reviewCode
```

### Bài 2: Refactor payment interface
```javascript
// Tách cho phù hợp với từng loại payment
class PaymentProcessor {
  processCard(cardNumber, amount) { /* ... */ }
  processPayPal(email, amount) { /* ... */ }
  processCrypto(walletAddress, amount) { /* ... */ }
  refundCard(transactionId) { /* ... */ }
  refundPayPal(transactionId) { /* ... */ }
  // Crypto không support refund!
}
```
