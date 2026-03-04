# Prototypes & Prototype Chain

## Prototype là gì?

Trong JavaScript, mọi object đều có một **liên kết ẩn** (internal link) đến một object khác gọi là **prototype**. Khi bạn truy cập một property trên object mà property đó không tồn tại, JavaScript sẽ **tự động tìm** property đó trên prototype — và cứ thế đi lên cho đến khi tìm thấy hoặc gặp `null`.

Cơ chế này gọi là **Prototype Chain** (chuỗi prototype) — đây là **nền tảng của kế thừa** trong JavaScript, khác biệt hoàn toàn so với class-based inheritance của Java/C++.

---

## 1. Prototype Chain hoạt động thế nào?

```js
const animal = {
  isAlive: true,
  eat() { return 'eating...'; },
};

const dog = Object.create(animal); // dog có prototype là animal
dog.bark = function() { return 'Woof!'; };

const myDog = Object.create(dog); // myDog có prototype là dog
myDog.name = 'Rex';
```

```
myDog                    dog                    animal               Object.prototype
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ name: 'Rex'  │───→│ bark()       │───→│ isAlive: true│───→│ toString()       │───→ null
│              │    │              │    │ eat()        │    │ hasOwnProperty() │
└──────────────┘    └──────────────┘    └──────────────┘    │ ...              │
                                                            └──────────────────┘
```

```js
myDog.name;     // 'Rex'    — tìm thấy trên myDog
myDog.bark();   // 'Woof!'  — không có trên myDog → tìm trên dog → có!
myDog.eat();    // 'eating' — không có trên myDog, dog → tìm trên animal → có!
myDog.toString(); // '[object Object]' — tìm đến Object.prototype
myDog.fly;      // undefined — tìm hết chain, không có → undefined
```

---

## 2. __proto__ vs prototype

Hai thuật ngữ rất dễ nhầm lẫn:

### `__proto__` (dunder proto)

Mọi **object** đều có `__proto__` — đó là **liên kết đến prototype** của object đó. Đây là cách JavaScript engine kết nối prototype chain.

```js
const obj = {};
obj.__proto__ === Object.prototype; // true

const arr = [];
arr.__proto__ === Array.prototype; // true
```

**Lưu ý:** `__proto__` là legacy property. Cách chuẩn để truy cập prototype:

```js
Object.getPrototypeOf(obj);        // Đọc prototype
Object.setPrototypeOf(obj, proto); // Gán prototype (tránh dùng — chậm)
```

### `prototype` property

Chỉ có trên **function** (và class). Đó là object sẽ trở thành `__proto__` của các instance được tạo bởi `new`.

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function() {
  return `${this.name} says Woof!`;
};

const rex = new Dog('Rex');

// rex.__proto__ === Dog.prototype
// Dog.prototype.__proto__ === Object.prototype
// Object.prototype.__proto__ === null
```

### Hình dung rõ hơn

```
Dog (function)
├── prototype ──→ Dog.prototype (object)
│                 ├── bark()
│                 ├── constructor ──→ Dog
│                 └── __proto__ ──→ Object.prototype
│
rex (instance)
├── name: 'Rex'
└── __proto__ ──→ Dog.prototype
```

---

## 3. Property Lookup & Shadowing

### Lookup (Tìm kiếm)

JavaScript tìm property theo thứ tự:
1. Tìm trên object → nếu có → trả về
2. Tìm trên `__proto__` → nếu có → trả về
3. Tiếp tục lên chain...
4. Đến `null` → `undefined`

### Shadowing (Che khuất)

Khi object có property cùng tên với prototype, property trên object **che khuất** (shadow) property trên prototype.

```js
const parent = { greeting: 'Hello from parent' };
const child = Object.create(parent);

console.log(child.greeting); // 'Hello from parent' — từ prototype

child.greeting = 'Hello from child'; // Tạo property MỚI trên child
console.log(child.greeting); // 'Hello from child' — shadowed!
console.log(parent.greeting); // 'Hello from parent' — KHÔNG bị thay đổi
```

---

## 4. Kiểm tra prototype

```js
function Dog(name) { this.name = name; }
Dog.prototype.bark = function() {};
const rex = new Dog('Rex');

// instanceof — kiểm tra prototype chain
rex instanceof Dog;    // true
rex instanceof Object; // true

// isPrototypeOf
Dog.prototype.isPrototypeOf(rex);    // true
Object.prototype.isPrototypeOf(rex); // true

// hasOwnProperty — chỉ own property (không tính prototype)
rex.hasOwnProperty('name');  // true
rex.hasOwnProperty('bark');  // false — bark ở prototype

// Object.hasOwn (ES2022) — cách hiện đại hơn
Object.hasOwn(rex, 'name');  // true
Object.hasOwn(rex, 'bark');  // false

// Liệt kê own properties
Object.keys(rex);             // ['name'] — chỉ own enumerable
Object.getOwnPropertyNames(rex); // ['name'] — own (kể cả non-enumerable)
```

---

## 5. Tại sao cần hiểu Prototype?

Mặc dù ES6 có `class` syntax, bên dưới JS vẫn **chạy bằng prototype**. `class` chỉ là syntactic sugar.

```js
// Class syntax
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} speaks`; }
}

// Tương đương prototype-based
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { return `${this.name} speaks`; };
```

Hiểu prototype giúp bạn:
- **Debug** các vấn đề liên quan đến kế thừa
- **Hiểu** cách `this`, `instanceof`, `hasOwnProperty` hoạt động
- **Mở rộng** built-in objects (không khuyến khích nhưng cần hiểu)
- **Tối ưu** bộ nhớ — methods trên prototype được **chia sẻ**, không tạo bản sao cho mỗi instance
