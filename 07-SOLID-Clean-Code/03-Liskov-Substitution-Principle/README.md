# Liskov Substitution Principle (LSP)

## 1. Khái niệm

> "Objects of a superclass should be replaceable with objects of its subclasses
> without breaking the application."
> — Barbara Liskov

Nếu `B` là subtype của `A`, thì mọi nơi dùng `A` đều có thể thay bằng `B` mà **không break logic**.

```
✅ Đúng LSP:                    ❌ Vi phạm LSP:
┌──────────┐                    ┌──────────┐
│   Bird   │                    │   Bird   │
│ + fly()  │                    │ + fly()  │
└────┬─────┘                    └────┬─────┘
     │                               │
┌────┴─────┐                    ┌────┴─────┐
│  Eagle   │                    │ Penguin  │
│ + fly()✓ │                    │ + fly()💥│ ← throw Error?!
└──────────┘                    └──────────┘
```

---

## 2. Vi phạm điển hình

### Ví dụ 1: Rectangle → Square

```javascript
// ❌ Vi phạm LSP
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }

  area() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w) {
    this.width = w;
    this.height = w; // Buộc phải đồng bộ!
  }

  setHeight(h) {
    this.width = h;  // Buộc phải đồng bộ!
    this.height = h;
  }
}

// Code dùng Rectangle
function increaseWidth(rect) {
  rect.setWidth(rect.width + 1);
  // Kỳ vọng: chỉ width thay đổi, height giữ nguyên
  // Nhưng nếu rect là Square → height CŨNG thay đổi → BUG!
}

const rect = new Rectangle(5, 10);
increaseWidth(rect);
console.log(rect.area()); // 60 ✓ (6 * 10)

const sq = new Square(5, 5);
increaseWidth(sq);
console.log(sq.area()); // 36 ✗ (6 * 6, kỳ vọng 30 = 6 * 5)
```

### Fix: Thiết kế lại hierarchy

```javascript
// ✅ Tuân thủ LSP
class Shape {
  area() {
    throw new Error('Must implement');
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }
  area() { return this.side * this.side; }
}

// Cả hai đều có thể dùng ở bất kỳ đâu cần Shape
function printArea(shape) {
  console.log(`Area: ${shape.area()}`);
}

printArea(new Rectangle(5, 10)); // Area: 50
printArea(new Square(5));         // Area: 25
```

---

### Ví dụ 2: Bird → Penguin

```javascript
// ❌ Vi phạm LSP
class Bird {
  fly() {
    return 'Flying!';
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly!'); // 💥 Break LSP
  }
}

function makeBirdFly(bird) {
  return bird.fly(); // Kỳ vọng tất cả Bird đều fly được
}

makeBirdFly(new Bird());    // 'Flying!' ✓
makeBirdFly(new Penguin()); // 💥 Error!

// ✅ Fix: Tách interface
class Bird {
  move() {
    throw new Error('Must implement');
  }
}

class FlyingBird extends Bird {
  move() { return 'Flying!'; }
  fly() { return 'Soaring through the sky!'; }
}

class SwimmingBird extends Bird {
  move() { return 'Swimming!'; }
  swim() { return 'Diving into the water!'; }
}

class Eagle extends FlyingBird {}
class Penguin extends SwimmingBird {}

function makeAnimalMove(bird) {
  return bird.move(); // Mọi Bird đều move() được
}

makeAnimalMove(new Eagle());   // 'Flying!' ✓
makeAnimalMove(new Penguin()); // 'Swimming!' ✓
```

---

## 3. Quy tắc LSP

### 3.1. Preconditions (Điều kiện đầu vào)
Subclass **KHÔNG được** yêu cầu điều kiện đầu vào **chặt hơn** base class.

```javascript
// ❌ Vi phạm: Subclass yêu cầu chặt hơn
class Processor {
  process(value) { // Chấp nhận mọi value
    return value * 2;
  }
}

class StrictProcessor extends Processor {
  process(value) {
    if (value < 0) throw new Error('Must be positive!'); // Chặt hơn!
    return value * 2;
  }
}
```

### 3.2. Postconditions (Điều kiện đầu ra)
Subclass **KHÔNG được** trả về kết quả **yếu hơn** base class.

```javascript
// ❌ Vi phạm: Subclass trả về null thay vì object
class UserRepository {
  findById(id) {
    return { id, name: 'User' }; // Luôn trả về object
  }
}

class CachedUserRepository extends UserRepository {
  findById(id) {
    return null; // Có thể trả null! Yếu hơn base class
  }
}
```

### 3.3. Invariants (Bất biến)
Subclass **PHẢI** giữ nguyên các bất biến của base class.

```javascript
// ❌ Vi phạm: Account balance không được âm
class Account {
  constructor(balance) {
    this.balance = balance; // Bất biến: balance >= 0
  }

  withdraw(amount) {
    if (amount > this.balance) throw new Error('Insufficient funds');
    this.balance -= amount;
  }
}

class OverdraftAccount extends Account {
  withdraw(amount) {
    this.balance -= amount; // Cho phép balance âm! Vi phạm bất biến
  }
}
```

---

## 4. LSP với TypeScript

```typescript
// Interface rõ ràng giúp tuân thủ LSP
interface Readable {
  read(): string;
}

interface Writable {
  write(data: string): void;
}

// File system có thể read + write
class FileStorage implements Readable, Writable {
  read(): string { return 'file content'; }
  write(data: string): void { /* save to file */ }
}

// Read-only storage chỉ implement Readable
class ReadOnlyStorage implements Readable {
  read(): string { return 'readonly content'; }
  // Không cần implement write() → Không vi phạm LSP
}

// Function chỉ cần Readable
function displayContent(storage: Readable) {
  console.log(storage.read());
}

displayContent(new FileStorage());      // ✓
displayContent(new ReadOnlyStorage()); // ✓
```

---

## 5. Dấu hiệu vi phạm LSP

- Subclass throw exception ở method mà base class không throw
- Subclass return null/undefined khi base class return value
- Subclass override method rồi để trống (no-op)
- Phải dùng `instanceof` để check type trước khi gọi method
- Subclass thay đổi behavior khiến code dùng base class bị bug

---

## 6. Bài tập

### Bài 1: Fix vi phạm LSP
```javascript
class FileStorage {
  save(data) {
    fs.writeFileSync('data.json', JSON.stringify(data));
  }
  load() {
    return JSON.parse(fs.readFileSync('data.json'));
  }
  delete() {
    fs.unlinkSync('data.json');
  }
}

class ReadOnlyFileStorage extends FileStorage {
  save(data) {
    throw new Error('Cannot save to read-only storage!');
  }
  delete() {
    throw new Error('Cannot delete from read-only storage!');
  }
}
// → Hãy redesign để tuân thủ LSP
```

### Bài 2: Thiết kế Vehicle hierarchy
```javascript
// Vehicle có start(), stop(), refuel()
// ElectricCar không refuel() mà charge()
// Bicycle không có engine
// → Thiết kế class hierarchy tuân thủ LSP
```
