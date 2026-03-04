# Constructor Functions (Hàm khởi tạo)

## Constructor Function là gì?

Constructor function là hàm thường nhưng được **gọi với từ khóa `new`** để tạo object mới. Đây là cách tạo object trước khi có `class` syntax trong ES6.

Convention: Tên constructor function luôn viết hoa chữ cái đầu (PascalCase) để phân biệt với hàm thường.

---

## 1. Cách hoạt động của `new`

Khi gọi `new ConstructorFunction()`, JavaScript thực hiện **4 bước** ngầm:

```js
function Person(name, age) {
  // 1. JS tạo object rỗng: this = {}
  // 2. Gán prototype: this.__proto__ = Person.prototype
  this.name = name;  // 3. Gán properties vào this
  this.age = age;
  // 4. Tự động return this (nếu không có return object khác)
}

const phong = new Person('Phong', 25);
// phong = { name: 'Phong', age: 25, __proto__: Person.prototype }
```

Nếu bạn **quên `new`**, `this` sẽ trỏ đến `global`/`window` (hoặc `undefined` trong strict mode) → bug!

```js
const wrong = Person('Phong', 25); // Quên new!
// wrong = undefined (vì hàm không return gì)
// name, age bị gán vào global object → ô nhiễm global!
```

**Cách phòng tránh:**

```js
function Person(name, age) {
  // Kiểm tra nếu quên new
  if (!(this instanceof Person)) {
    return new Person(name, age);
  }
  this.name = name;
  this.age = age;
}

// Hoặc dùng new.target (ES6)
function Person(name, age) {
  if (!new.target) {
    throw new Error('Must use new keyword');
  }
  this.name = name;
  this.age = age;
}
```

---

## 2. Thêm Methods

### ❌ Sai: Thêm method trong constructor

```js
function Person(name) {
  this.name = name;
  this.greet = function() {
    return `Hi, I'm ${this.name}`;
  };
}

const a = new Person('A');
const b = new Person('B');

a.greet === b.greet; // false — mỗi instance có BẢN SAO RIÊNG của greet
// 1000 instances = 1000 bản sao greet → tốn bộ nhớ!
```

### ✅ Đúng: Thêm method vào prototype

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const a = new Person('A');
const b = new Person('B');

a.greet === b.greet; // true — CHIA SẺ cùng 1 function từ prototype
// 1000 instances vẫn chỉ 1 bản greet → tiết kiệm bộ nhớ
```

**Quy tắc:**
- **Properties** (data riêng mỗi instance): Định nghĩa trong **constructor** (`this.prop`)
- **Methods** (logic chung): Định nghĩa trên **prototype** (`Constructor.prototype.method`)

---

## 3. Kế thừa với Constructor Functions

```js
// Parent constructor
function Animal(name, sound) {
  this.name = name;
  this.sound = sound;
}

Animal.prototype.speak = function() {
  return `${this.name} says ${this.sound}`;
};

// Child constructor
function Dog(name, breed) {
  Animal.call(this, name, 'Woof'); // Gọi constructor cha, truyền this
  this.breed = breed;
}

// Thiết lập prototype chain
Dog.prototype = Object.create(Animal.prototype); // Dog.prototype kế thừa Animal.prototype
Dog.prototype.constructor = Dog; // Phục hồi constructor reference

// Thêm method riêng cho Dog
Dog.prototype.fetch = function(item) {
  return `${this.name} fetches ${item}`;
};

const rex = new Dog('Rex', 'Labrador');
rex.speak();  // 'Rex says Woof' — từ Animal.prototype
rex.fetch('ball'); // 'Rex fetches ball' — từ Dog.prototype
rex instanceof Dog;    // true
rex instanceof Animal; // true
```

**Các bước kế thừa:**
1. `Animal.call(this, ...)` — Gọi constructor cha để khởi tạo properties
2. `Dog.prototype = Object.create(Animal.prototype)` — Kết nối prototype chain
3. `Dog.prototype.constructor = Dog` — Phục hồi constructor (bị mất ở bước 2)

---

## 4. Constructor Function vs Class

ES6 `class` chỉ là **syntactic sugar** cho constructor function + prototype:

```js
// Constructor Function
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return `Hi, ${this.name}`;
};

// Tương đương ES6 Class
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, ${this.name}`;
  }
}
```

Tuy nhiên class có một số khác biệt:
- Class **bắt buộc** dùng `new` (không thể gọi như hàm thường)
- Class **không hoisting** (phải khai báo trước khi dùng)
- Class methods **không enumerable** (không xuất hiện trong `for...in`)
- Class luôn chạy trong **strict mode**

**Khuyên dùng:** Class syntax cho code mới, nhưng **hiểu constructor function** để debug và đọc code cũ.
