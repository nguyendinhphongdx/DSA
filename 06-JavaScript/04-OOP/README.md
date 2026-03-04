# 04 - OOP trong JavaScript

## 1. Prototypes

Mọi object trong JS đều có một prototype chain.

```js
// Prototype chain
const arr = [1, 2, 3];
// arr → Array.prototype → Object.prototype → null

// __proto__ vs prototype
function Dog(name) { this.name = name; }
Dog.prototype.bark = function() { return `${this.name} barks!`; };

const dog = new Dog('Rex');
dog.bark();                          // 'Rex barks!'
dog.__proto__ === Dog.prototype;     // true
Dog.prototype.__proto__ === Object.prototype; // true

// Object.getPrototypeOf (cách chuẩn)
Object.getPrototypeOf(dog) === Dog.prototype; // true
```

## 2. Constructor Functions

```js
function Person(name, age) {
  // new tạo: this = {}
  this.name = name;
  this.age = age;
  // return this (ngầm)
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const p = new Person('Phong', 25);
p instanceof Person; // true
```

## 3. ES6 Classes

```js
class Animal {
  // Private field
  #sound;

  // Static property
  static count = 0;

  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
    Animal.count++;
  }

  // Method
  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  // Getter/Setter
  get info() {
    return `${this.name} (${this.#sound})`;
  }

  set sound(value) {
    this.#sound = value;
  }

  // Static method
  static getCount() {
    return Animal.count;
  }
}
```

## 4. Inheritance (Kế thừa)

```js
class Dog extends Animal {
  #breed;

  constructor(name, breed) {
    super(name, 'Woof'); // Gọi constructor cha
    this.#breed = breed;
  }

  // Override method
  speak() {
    return `${super.speak()}! (${this.#breed})`;
  }

  fetch(item) {
    return `${this.name} fetches ${item}`;
  }
}

const dog = new Dog('Rex', 'Labrador');
dog.speak();    // "Rex says Woof! (Labrador)"
dog instanceof Dog;    // true
dog instanceof Animal; // true
```

## 5. Encapsulation (Đóng gói)

```js
class BankAccount {
  #balance = 0;       // Private field
  #owner;

  constructor(owner, initialBalance) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Invalid amount');
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    return this.#balance;
  }

  get balance() {
    return this.#balance;
  }
}
```

## 6. Polymorphism (Đa hình)

```js
class Shape {
  area() { throw new Error('Must implement area()'); }
  describe() { return `Area: ${this.area()}`; }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(w, h) { super(); this.width = w; this.height = h; }
  area() { return this.width * this.height; }
}

// Cùng interface, khác implementation
const shapes = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach(s => console.log(s.describe()));
```

## 7. Design Patterns

### Singleton
```js
class Database {
  static #instance;
  constructor() {
    if (Database.#instance) return Database.#instance;
    Database.#instance = this;
  }
}
```

### Factory
```js
class UserFactory {
  static create(type, name) {
    switch (type) {
      case 'admin': return new Admin(name);
      case 'user': return new User(name);
      default: throw new Error('Unknown type');
    }
  }
}
```

### Observer
```js
class EventEmitter {
  #events = {};
  on(event, fn) { (this.#events[event] ??= []).push(fn); }
  off(event, fn) { this.#events[event] = this.#events[event]?.filter(f => f !== fn); }
  emit(event, ...args) { this.#events[event]?.forEach(fn => fn(...args)); }
}
```
