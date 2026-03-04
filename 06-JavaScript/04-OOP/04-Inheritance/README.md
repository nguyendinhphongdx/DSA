# Inheritance (Kế thừa)

## Kế thừa là gì?

Kế thừa cho phép một class **nhận lại** properties và methods từ class khác, giúp **tái sử dụng code** và tạo mối quan hệ phân cấp giữa các đối tượng.

Trong JavaScript, kế thừa hoạt động thông qua **Prototype Chain**. ES6 `class` cung cấp cú pháp `extends` và `super` để kế thừa dễ dàng hơn.

---

## 1. Kế thừa với extends & super

```js
// Parent class (Base class / Superclass)
class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  speak() {
    return `${this.name} says ${this.sound}`;
  }

  sleep() {
    return `${this.name} is sleeping... Zzz`;
  }
}

// Child class (Derived class / Subclass)
class Dog extends Animal {
  constructor(name, breed) {
    super(name, 'Woof!'); // GỌI constructor CHA — bắt buộc trước khi dùng this
    this.breed = breed;    // Property riêng của Dog
  }

  // Method riêng
  fetch(item) {
    return `${this.name} fetches the ${item}!`;
  }
}

const rex = new Dog('Rex', 'Labrador');
rex.speak();     // 'Rex says Woof!' — kế thừa từ Animal
rex.sleep();     // 'Rex is sleeping... Zzz' — kế thừa từ Animal
rex.fetch('ball'); // 'Rex fetches the ball!' — method riêng
rex.breed;       // 'Labrador' — property riêng

rex instanceof Dog;    // true
rex instanceof Animal; // true
```

### `super` keyword

`super` có 2 cách sử dụng:

```js
class Child extends Parent {
  constructor() {
    super();           // 1. Gọi constructor CHA — bắt buộc trong constructor con
    // this chỉ khả dụng SAU super()
  }

  method() {
    super.method();    // 2. Gọi method CHA (khi override)
  }
}
```

**Quy tắc `super()` trong constructor:**
- **Bắt buộc** gọi `super()` trước khi dùng `this` trong constructor của class con
- Nếu class con **không có constructor**, JS tự tạo: `constructor(...args) { super(...args); }`

---

## 2. Method Overriding (Ghi đè method)

Class con có thể **ghi đè** (override) method của class cha bằng cách khai báo method **cùng tên**.

```js
class Shape {
  constructor(color) {
    this.color = color;
  }

  describe() {
    return `A ${this.color} shape`;
  }

  area() {
    throw new Error('area() must be implemented by subclass');
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color);
    this.radius = radius;
  }

  // Override describe — thay thế hoàn toàn
  describe() {
    return `A ${this.color} circle with radius ${this.radius}`;
  }

  // Implement area
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color);
    this.width = width;
    this.height = height;
  }

  // Override describe — mở rộng (gọi super trước, thêm thông tin)
  describe() {
    return `${super.describe()} (${this.width}x${this.height} rectangle)`;
  }

  area() {
    return this.width * this.height;
  }
}

const c = new Circle('red', 5);
c.describe(); // 'A red circle with radius 5'
c.area();     // 78.539...

const r = new Rectangle('blue', 4, 6);
r.describe(); // 'A blue shape (4x6 rectangle)'
r.area();     // 24
```

---

## 3. Kế thừa nhiều tầng

```js
class Animal {
  eat() { return 'eating'; }
}

class Dog extends Animal {
  bark() { return 'woof'; }
}

class Puppy extends Dog {
  play() { return 'playing'; }
}

const puppy = new Puppy();
puppy.play(); // 'playing' — Puppy
puppy.bark(); // 'woof'    — Dog
puppy.eat();  // 'eating'  — Animal

// Prototype chain: puppy → Puppy.prototype → Dog.prototype → Animal.prototype → Object.prototype
```

---

## 4. Mixins — "Kế thừa" từ nhiều nguồn

JavaScript **không hỗ trợ đa kế thừa** (multiple inheritance) — một class chỉ có thể `extends` **một** class duy nhất. Mixins là pattern để giải quyết vấn đề này.

Mixin là object chứa methods mà bạn muốn "trộn" vào class.

```js
// Mixin functions
const Serializable = (Base) => class extends Base {
  toJSON() {
    return JSON.stringify(this);
  }

  static fromJSON(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Validatable = (Base) => class extends Base {
  validate() {
    for (const [key, value] of Object.entries(this)) {
      if (value === null || value === undefined) {
        throw new Error(`${key} is required`);
      }
    }
    return true;
  }
};

// Sử dụng: "trộn" nhiều mixins
class User extends Serializable(Validatable(Object)) {
  constructor(name, email) {
    super();
    this.name = name;
    this.email = email;
  }
}

const user = new User('Phong', 'phong@mail.com');
user.validate();  // true — từ Validatable
user.toJSON();    // '{"name":"Phong","email":"phong@mail.com"}' — từ Serializable
```

---

## 5. Kế thừa Built-in Classes

Có thể extend các class built-in của JavaScript:

```js
class CustomArray extends Array {
  // Thêm method mới
  first() {
    return this[0];
  }

  last() {
    return this[this.length - 1];
  }

  sum() {
    return this.reduce((a, b) => a + b, 0);
  }
}

const arr = new CustomArray(1, 2, 3, 4, 5);
arr.first();  // 1
arr.last();   // 5
arr.sum();    // 15
arr.map(x => x * 2); // CustomArray [2, 4, 6, 8, 10] — vẫn là CustomArray!
```

```js
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

throw new CustomError('Not found', 404);
```

---

## 6. Composition vs Inheritance

**"Favor composition over inheritance"** — ưu tiên kết hợp hơn kế thừa. Đây là nguyên tắc quan trọng trong thiết kế phần mềm.

### Khi nào dùng Inheritance

- Quan hệ **"is-a"**: Dog **is an** Animal, Circle **is a** Shape
- Các class con **thực sự** là dạng đặc biệt của class cha
- Cây kế thừa **nông** (tối đa 2-3 cấp)

### Khi nào dùng Composition

- Quan hệ **"has-a"** hoặc **"can-do"**: Car **has an** Engine, User **can** serialize
- Cần kết hợp nhiều behavior từ nhiều nguồn
- Muốn linh hoạt thay đổi behavior runtime

```js
// Composition: kết hợp các khả năng
class Character {
  constructor(name) {
    this.name = name;
    this.abilities = [];
  }

  addAbility(ability) {
    this.abilities.push(ability);
    return this;
  }

  useAbility(name, ...args) {
    const ability = this.abilities.find(a => a.name === name);
    if (ability) return ability.execute(this, ...args);
    throw new Error(`${this.name} doesn't have ${name}`);
  }
}

const fly = { name: 'fly', execute: (char) => `${char.name} is flying!` };
const shoot = { name: 'shoot', execute: (char, target) => `${char.name} shoots ${target}!` };

const hero = new Character('Hero');
hero.addAbility(fly).addAbility(shoot);
hero.useAbility('fly');          // 'Hero is flying!'
hero.useAbility('shoot', 'enemy'); // 'Hero shoots enemy!'
```
