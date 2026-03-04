# Polymorphism (Đa hình)

## Đa hình là gì?

Polymorphism (poly = nhiều, morph = hình dạng) là khả năng các đối tượng khác nhau **phản hồi khác nhau** với cùng một lời gọi method. Nói cách khác: cùng một "giao diện" (interface), nhưng **hành vi thay đổi** tùy theo kiểu đối tượng cụ thể.

Polymorphism giúp bạn viết code **tổng quát** mà vẫn xử lý được nhiều loại đối tượng khác nhau.

---

## 1. Subtype Polymorphism (Phổ biến nhất)

Đây là dạng đa hình qua **kế thừa** — class con override method của class cha.

```js
class Shape {
  area() {
    throw new Error('Subclass must implement area()');
  }

  describe() {
    return `This shape has area: ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }

  area() {
    return 0.5 * this.base * this.height;
  }
}
```

**Sức mạnh**: Code gọi `area()` **không cần biết** đang làm việc với Circle, Rectangle, hay Triangle — nó chỉ cần biết đó là Shape.

```js
const shapes = [
  new Circle(5),
  new Rectangle(4, 6),
  new Triangle(3, 8),
];

// Cùng lời gọi describe(), mỗi shape cho kết quả khác nhau
shapes.forEach(shape => {
  console.log(shape.describe());
});
// "This shape has area: 78.54"
// "This shape has area: 24.00"
// "This shape has area: 12.00"

// Tính tổng diện tích — không cần biết loại shape
const totalArea = shapes.reduce((sum, shape) => sum + shape.area(), 0);
```

---

## 2. Duck Typing

JavaScript là ngôn ngữ **dynamically typed** — không cần khai báo kiểu. Thay vì kiểm tra "đối tượng thuộc class nào", JS kiểm tra "đối tượng có method/property cần thiết không".

> "If it walks like a duck and quacks like a duck, then it's a duck."

```js
// Không cần extends từ cùng class
class Duck {
  swim() { return 'Duck swimming'; }
  quack() { return 'Quack!'; }
}

class Person {
  swim() { return 'Person swimming'; }
  quack() { return 'Person quacking (funny)'; }
}

class RubberDuck {
  swim() { return 'Rubber duck floating'; }
  quack() { return 'Squeak!'; }
}

// Hàm này KHÔNG QUAN TÂM kiểu — chỉ cần có swim() và quack()
function makeItSwimAndQuack(thing) {
  console.log(thing.swim());
  console.log(thing.quack());
}

makeItSwimAndQuack(new Duck());       // OK
makeItSwimAndQuack(new Person());     // OK
makeItSwimAndQuack(new RubberDuck()); // OK
// Cả 3 đều hoạt động vì đều có swim() và quack()
```

### Ứng dụng thực tế: Iterable Protocol

```js
// Bất cứ thứ gì có [Symbol.iterator] đều dùng được với for...of
class NumberRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      },
    };
  }
}

// Hoạt động với for...of nhờ duck typing
for (const n of new NumberRange(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}

// Cũng hoạt động với spread
[...new NumberRange(1, 5)]; // [1, 2, 3, 4, 5]
```

---

## 3. Ad-hoc Polymorphism (Operator Overloading)

JavaScript có hạn chế trong việc overload operators, nhưng bạn có thể tùy chỉnh cách object chuyển thành primitive qua `valueOf`, `toString`, và `Symbol.toPrimitive`.

```js
class Money {
  #amount;
  #currency;

  constructor(amount, currency = 'VND') {
    this.#amount = amount;
    this.#currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number': return this.#amount;
      case 'string': return `${this.#amount.toLocaleString()} ${this.#currency}`;
      default: return this.#amount;
    }
  }
}

const price = new Money(1500000);
console.log(`Price: ${price}`);  // "Price: 1,500,000 VND" — hint string
console.log(price + 500000);     // 2000000 — hint number
console.log(price > 1000000);    // true — hint number
```

---

## 4. Strategy Pattern — Polymorphism qua Composition

Thay vì dùng kế thừa, dùng **composition** để đạt polymorphism:

```js
// Các strategies
const strategies = {
  standard: (price) => price,
  premium: (price) => price * 0.9,  // Giảm 10%
  vip: (price) => price * 0.8,      // Giảm 20%
};

class ShoppingCart {
  #items = [];
  #discountStrategy;

  constructor(customerType = 'standard') {
    this.#discountStrategy = strategies[customerType];
  }

  addItem(item) {
    this.#items.push(item);
  }

  getTotal() {
    const subtotal = this.#items.reduce((sum, item) => sum + item.price, 0);
    return this.#discountStrategy(subtotal);
  }
}

const cart1 = new ShoppingCart('standard');
const cart2 = new ShoppingCart('vip');
// Cùng items, khác giá nhờ polymorphism qua strategy
```

---

## 5. Tại sao Polymorphism quan trọng?

### Không có polymorphism (rất nhiều if/else)

```js
// ❌ Mỗi khi thêm loại shape mới, phải sửa hàm này
function calculateArea(shape) {
  if (shape.type === 'circle') return Math.PI * shape.radius ** 2;
  if (shape.type === 'rectangle') return shape.width * shape.height;
  if (shape.type === 'triangle') return 0.5 * shape.base * shape.height;
  // Thêm loại mới? Sửa ở đây, và ở tất cả hàm tương tự...
}
```

### Có polymorphism (Open/Closed Principle)

```js
// ✅ Thêm loại shape mới? Chỉ cần tạo class mới, KHÔNG sửa code cũ
class Pentagon extends Shape {
  area() { /* ... */ }
}

// Code cũ vẫn hoạt động với Pentagon mà không cần thay đổi
shapes.push(new Pentagon(5));
shapes.forEach(s => console.log(s.describe())); // Tự động hoạt động!
```

Đây là nguyên tắc **Open/Closed** trong SOLID: code nên **mở** cho mở rộng, **đóng** cho sửa đổi.
