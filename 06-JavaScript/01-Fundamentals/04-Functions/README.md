# Functions (Hàm)

Hàm là một **khối code có thể tái sử dụng** — bạn định nghĩa một lần và gọi nhiều lần. Hàm là một trong những khái niệm quan trọng nhất trong JavaScript vì JS là ngôn ngữ **lấy hàm làm trung tâm** (function-first language).

Trong JavaScript, hàm là **first-class citizen** — nghĩa là hàm được đối xử như một giá trị: có thể gán vào biến, truyền làm argument, hoặc return từ hàm khác.

---

## 1. Các cách khai báo hàm

### Function Declaration (Khai báo hàm)

Cách truyền thống nhất. Được **hoisting** toàn bộ — có thể gọi trước khi khai báo.

```js
// Có thể gọi trước khi khai báo nhờ hoisting
greet('Phong'); // 'Hello, Phong!'

function greet(name) {
  return `Hello, ${name}!`;
}
```

### Function Expression (Biểu thức hàm)

Gán hàm vào một biến. **Không được hoisting** (hoặc chính xác hơn, biến được hoisting nhưng ở TDZ nếu dùng `const`/`let`).

```js
// greet('Phong'); // ReferenceError — không thể gọi trước khai báo

const greet = function(name) {
  return `Hello, ${name}!`;
};

greet('Phong'); // 'Hello, Phong!'
```

### Arrow Function (ES6)

Cú pháp ngắn gọn hơn, nhưng có **khác biệt quan trọng** so với function thường:

```js
// Đầy đủ
const add = (a, b) => {
  return a + b;
};

// Ngắn gọn: 1 dòng, tự return
const add = (a, b) => a + b;

// 1 tham số: bỏ dấu ngoặc
const double = x => x * 2;

// Không tham số
const sayHi = () => 'Hi!';

// Return object literal: cần bọc trong ()
const createUser = (name) => ({ name, createdAt: Date.now() });
```

**Khác biệt với function thường:**

| | Regular Function | Arrow Function |
|---|---|---|
| `this` | Dynamic (phụ thuộc cách gọi) | Lexical (từ scope bên ngoài) |
| `arguments` | Có | Không |
| `new` | Có thể dùng làm constructor | Không |
| `prototype` | Có | Không |
| Hoisting | Có (declaration) | Không |

```js
const obj = {
  name: 'Phong',
  // Regular function: this = obj
  greet() {
    return `Hi, ${this.name}`;
  },
  // Arrow function: this = scope ngoài (window/global), KHÔNG phải obj
  greetArrow: () => {
    return `Hi, ${this.name}`; // undefined!
  },
};
```

**Khi nào dùng arrow function?**
- Callbacks ngắn: `arr.map(x => x * 2)`
- Khi muốn giữ `this` từ scope bên ngoài
- **Không dùng** cho object methods hoặc constructor

---

## 2. Parameters & Arguments

### Tham số mặc định (Default Parameters)

```js
function greet(name = 'World', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

greet();              // 'Hello, World!'
greet('Phong');       // 'Hello, Phong!'
greet('Phong', 'Hi'); // 'Hi, Phong!'
```

Default parameter chỉ áp dụng khi argument là `undefined` (không phải `null` hay `0`):

```js
greet(undefined); // 'Hello, World!' — dùng default
greet(null);      // 'Hello, null!' — null KHÔNG trigger default
```

### Rest Parameters (...rest)

Gom **tất cả argument còn lại** vào một array. Phải là tham số **cuối cùng**.

```js
function sum(first, ...rest) {
  console.log(first); // 1
  console.log(rest);  // [2, 3, 4, 5]
  return rest.reduce((total, num) => total + num, first);
}

sum(1, 2, 3, 4, 5); // 15
```

### Arguments object (cũ)

Trước khi có rest parameters, `arguments` là cách duy nhất truy cập tất cả argument. Nó là **array-like** (có `.length`, truy cập bằng index) nhưng **không phải array** thật.

```js
function oldStyle() {
  console.log(arguments);        // { '0': 1, '1': 2, '2': 3 }
  console.log(arguments.length); // 3
  // arguments.map(...) // TypeError! Không phải array
  const arr = Array.from(arguments); // Chuyển thành array thật
}
```

**Arrow function không có `arguments`** — dùng rest parameters thay thế.

---

## 3. Return

Mỗi hàm **luôn trả về một giá trị**. Nếu không có `return` hoặc `return` không có giá trị, hàm trả về `undefined`.

```js
function noReturn() {
  console.log('Hello');
  // return undefined; (ngầm)
}

const result = noReturn(); // undefined
```

Hàm **dừng ngay** khi gặp `return`:

```js
function findFirst(arr, target) {
  for (const item of arr) {
    if (item === target) return item; // Dừng và trả về ngay
  }
  return null; // Chỉ chạy nếu không tìm thấy
}
```

---

## 4. Function là First-Class Citizen

Trong JS, hàm là giá trị — có thể lưu vào biến, truyền qua, trả về.

### Gán vào biến
```js
const calculate = function(a, b) { return a + b; };
```

### Truyền làm argument (Callback)
```js
function doTwice(fn, value) {
  return fn(fn(value));
}
doTwice(x => x * 2, 5); // 20 (5 → 10 → 20)
```

### Trả về từ hàm khác
```js
function createGreeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const hiGreeter = createGreeter('Hi');
hiGreeter('Phong'); // 'Hi, Phong!'
```

### Lưu trong cấu trúc dữ liệu
```js
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};

operations.add(3, 4); // 7
```

---

## 5. Pure Functions vs Impure Functions

**Pure Function** — cùng input luôn cho cùng output, không có side effect:

```js
// Pure
function add(a, b) {
  return a + b;
}

// Pure
function formatName(first, last) {
  return `${first} ${last}`;
}
```

**Impure Function** — kết quả phụ thuộc vào bên ngoài hoặc thay đổi state bên ngoài:

```js
// Impure — phụ thuộc biến ngoài
let count = 0;
function increment() {
  return ++count; // Thay đổi state bên ngoài
}

// Impure — side effect
function logAndReturn(value) {
  console.log(value); // Side effect (I/O)
  return value;
}
```

**Ưu tiên viết pure function** vì chúng dễ test, dễ debug, và dễ suy luận hơn.
