# ES6 Classes

## Class trong JavaScript

ES6 (2015) giới thiệu `class` syntax để viết OOP **dễ đọc và quen thuộc** hơn cho lập trình viên đến từ Java, C++, Python. Tuy nhiên, bên dưới JS vẫn chạy bằng **prototype** — class chỉ là syntactic sugar.

---

## 1. Cú pháp cơ bản

```js
class User {
  // Constructor: chạy khi tạo instance bằng new
  constructor(name, email) {
    this.name = name;     // Instance property
    this.email = email;
  }

  // Method: tự động thêm vào prototype
  greet() {
    return `Hello, I'm ${this.name}`;
  }

  getInfo() {
    return `${this.name} (${this.email})`;
  }
}

const user = new User('Phong', 'phong@mail.com');
user.greet();    // "Hello, I'm Phong"
user.getInfo();  // "Phong (phong@mail.com)"
```

---

## 2. Static Methods & Properties

`static` thuộc về **class** (không phải instance). Gọi trên class, không gọi trên instance.

Dùng cho: utility functions, factory methods, counters, constants.

```js
class MathUtils {
  static PI = 3.14159;

  static add(a, b) {
    return a + b;
  }

  static isEven(n) {
    return n % 2 === 0;
  }
}

MathUtils.PI;           // 3.14159
MathUtils.add(2, 3);    // 5
MathUtils.isEven(4);    // true

// Không gọi được trên instance
const m = new MathUtils();
// m.add(2, 3); // TypeError: m.add is not a function
```

### Factory Method pattern

```js
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  // Factory methods — cách tạo instances đặc biệt
  static createAdmin(name) {
    return new User(name, 'admin');
  }

  static createGuest() {
    return new User('Guest', 'guest');
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name, data.role);
  }
}

const admin = User.createAdmin('Phong');
const guest = User.createGuest();
const user = User.fromJSON('{"name":"An","role":"user"}');
```

---

## 3. Getter & Setter

Getter/setter trông như **property** nhưng thực chất là **method**. Cho phép kiểm soát cách đọc/ghi giá trị.

```js
class Circle {
  constructor(radius) {
    this.radius = radius; // Gọi setter
  }

  // Getter: truy cập như property, tính toán khi đọc
  get area() {
    return Math.PI * this.radius ** 2;
  }

  get circumference() {
    return 2 * Math.PI * this.radius;
  }

  // Setter: validate khi gán giá trị
  get radius() {
    return this._radius;
  }

  set radius(value) {
    if (value < 0) throw new Error('Radius must be positive');
    this._radius = value;
  }
}

const circle = new Circle(5);
circle.area;           // 78.5398... (gọi getter, KHÔNG cần ())
circle.circumference;  // 31.4159...
circle.radius = 10;    // Gọi setter → validate
// circle.radius = -1; // Error: Radius must be positive
```

---

## 4. Private Fields (#) — ES2022

Trước `#`, JavaScript không có private thật — chỉ có convention dùng `_prefix`. Từ ES2022, dùng `#` để tạo **truly private** fields.

```js
class BankAccount {
  #balance;          // Private field — khai báo bắt buộc
  #owner;
  #transactions = []; // Private với giá trị mặc định

  constructor(owner, initialBalance) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Invalid amount');
    this.#balance += amount;
    this.#logTransaction('deposit', amount);
    return this;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    this.#logTransaction('withdraw', amount);
    return this;
  }

  get balance() {
    return this.#balance;
  }

  // Private method
  #logTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      balance: this.#balance,
      date: new Date(),
    });
  }

  getStatement() {
    return [...this.#transactions]; // Trả về copy
  }
}

const account = new BankAccount('Phong', 1000);
account.deposit(500).withdraw(200); // Method chaining
account.balance;       // 1300
// account.#balance;   // SyntaxError: Private field
// account.#logTransaction(); // SyntaxError
```

### Private vs Convention _prefix

```js
// _prefix: chỉ là convention, vẫn truy cập được
class Old {
  _secret = 'accessible'; // "Private" nhưng không thật sự private
}
new Old()._secret; // 'accessible' — vẫn đọc được!

// #prefix: truly private
class New {
  #secret = 'hidden'; // Thật sự private
}
new New().#secret; // SyntaxError!
```

---

## 5. Class Expression

Tương tự function expression — class cũng có thể là expression:

```js
// Named class expression
const MyClass = class NamedClass {
  greet() { return 'Hello'; }
};

// Anonymous class expression
const Widget = class {
  render() { return '<div>Widget</div>'; }
};

// Dynamic class
function createClass(baseValue) {
  return class {
    getValue() { return baseValue; }
  };
}

const DynamicClass = createClass(42);
new DynamicClass().getValue(); // 42
```

---

## 6. Computed Method Names

```js
const methodName = 'greet';

class Greeter {
  [methodName]() {
    return 'Hello!';
  }

  [Symbol.iterator]() {
    // Custom iterator
  }
}

new Greeter().greet(); // 'Hello!'
```

---

## 7. Class Fields (ES2022)

Khai báo properties trực tiếp trong class body, không cần trong constructor:

```js
class Config {
  // Public fields
  apiUrl = 'https://api.example.com';
  timeout = 5000;
  retries = 3;

  // Private fields
  #secretKey = 'abc123';

  // Static fields
  static version = '1.0.0';
  static #instanceCount = 0;

  constructor() {
    Config.#instanceCount++;
  }

  static getInstanceCount() {
    return Config.#instanceCount;
  }
}
```

---

## 8. Những điều cần nhớ

1. **Class không hoisting** — phải khai báo trước khi dùng (khác function declaration)
2. **Bắt buộc dùng `new`** — không thể gọi class như hàm thường
3. **Strict mode** — code trong class luôn chạy strict mode
4. **Methods không enumerable** — không xuất hiện trong `for...in`
5. **Bên dưới vẫn là prototype** — class chỉ là syntax đẹp hơn cho prototype-based OOP
