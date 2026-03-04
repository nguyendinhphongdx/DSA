# Currying & Partial Application

## Hai kỹ thuật liên quan nhưng khác nhau

Cả hai đều là cách **biến đổi hàm** — tạo ra hàm mới từ hàm có sẵn bằng cách "cố định" một số tham số. Nhưng cách thức khác nhau.

---

## 1. Currying

### Định nghĩa

Currying biến một hàm nhận **nhiều tham số** thành một chuỗi hàm, mỗi hàm nhận **đúng một tham số**.

```
f(a, b, c) → f(a)(b)(c)
```

### Ví dụ cơ bản

```js
// Hàm thường: nhận 3 tham số cùng lúc
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

// Hàm curried: nhận từng tham số một
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
curriedAdd(1)(2)(3); // 6

// Arrow function (ngắn gọn hơn)
const curriedAdd = a => b => c => a + b + c;
```

### Tại sao cần Currying?

Currying cho phép **tạo hàm chuyên biệt** bằng cách "cố định" dần các tham số:

```js
const multiply = a => b => a * b;

// Tạo các hàm chuyên biệt
const double = multiply(2);    // b => 2 * b
const triple = multiply(3);    // b => 3 * b
const toPercent = multiply(100); // b => 100 * b

double(5);      // 10
triple(5);      // 15
toPercent(0.75); // 75

// Dùng với map
[1, 2, 3].map(double);  // [2, 4, 6]
[1, 2, 3].map(triple);  // [3, 6, 9]
```

### Generic curry function

Tự động currying bất kỳ hàm nào:

```js
function curry(fn) {
  return function curried(...args) {
    // Nếu đủ tham số → gọi hàm gốc
    if (args.length >= fn.length) {
      return fn(...args);
    }
    // Chưa đủ → trả về hàm chờ thêm tham số
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const add = curry((a, b, c) => a + b + c);

// Tất cả các cách gọi sau đều hợp lệ:
add(1)(2)(3);     // 6 — từng cái một
add(1, 2)(3);     // 6 — 2 rồi 1
add(1)(2, 3);     // 6 — 1 rồi 2
add(1, 2, 3);     // 6 — cả 3 cùng lúc
```

### Ứng dụng thực tế

```js
// Logging với prefix
const log = curry((level, category, message) => {
  console.log(`[${level}] [${category}] ${message}`);
});

const error = log('ERROR');           // Cố định level
const dbError = error('DATABASE');    // Cố định category
dbError('Connection failed');         // [ERROR] [DATABASE] Connection failed

const warn = log('WARN');
const apiWarn = warn('API');
apiWarn('Rate limit approaching');    // [WARN] [API] Rate limit approaching
```

```js
// Filtering
const hasProperty = curry((prop, obj) => Object.hasOwn(obj, prop));
const hasName = hasProperty('name');
const hasEmail = hasProperty('email');

const users = [
  { name: 'Phong', email: 'p@mail.com' },
  { name: 'An' },
  { email: 'b@mail.com' },
];

users.filter(hasName);   // [{name:'Phong',...}, {name:'An'}]
users.filter(hasEmail);  // [{name:'Phong',...}, {email:'b@mail.com'}]
```

---

## 2. Partial Application

### Định nghĩa

Partial Application cố định **một số tham số** của hàm và trả về hàm mới nhận **các tham số còn lại**. Khác currying ở chỗ: không nhất thiết phải từng tham số một.

```
f(a, b, c) + partial(f, 1) → g(b, c) // g(b, c) = f(1, b, c)
```

### Ví dụ

```js
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, 'Hello', '!');
sayHello('Phong'); // 'Hello, Phong!'
sayHello('An');    // 'Hello, An!'

const askHowAreYou = partial(greet, 'How are you', '?');
askHowAreYou('Phong'); // 'How are you, Phong?'
```

### Function.prototype.bind()

`bind` cũng thực hiện partial application (ngoài việc bind `this`):

```js
function add(a, b, c) {
  return a + b + c;
}

const add10 = add.bind(null, 10);      // Cố định a = 10
add10(20, 30);  // 60

const add10And20 = add.bind(null, 10, 20); // Cố định a = 10, b = 20
add10And20(30); // 60
```

---

## 3. Currying vs Partial Application

| | Currying | Partial Application |
|---|---|---|
| Cách hoạt động | f(a,b,c) → f(a)(b)(c) | f(a,b,c) + fix(a) → g(b,c) |
| Số tham số mỗi lần | **Luôn 1** | **Bất kỳ** |
| Số hàm trung gian | **N hàm** (N = số tham số) | **1 hàm** mới |
| Tự động | Có (dùng curry helper) | Cần chỉ định tham số cố định |

```js
// Currying: mỗi lần 1 tham số
const curriedAdd = curry((a, b, c) => a + b + c);
const step1 = curriedAdd(1);  // (b) => (c) => 1 + b + c
const step2 = step1(2);       // (c) => 1 + 2 + c
const result = step2(3);      // 6

// Partial: cố định bao nhiêu cũng được
const partialAdd = partial((a, b, c) => a + b + c, 1, 2);
const result = partialAdd(3); // 6
```

---

## 4. Khi nào dùng?

**Dùng Currying khi:**
- Cần tạo nhiều hàm chuyên biệt từ hàm tổng quát
- Làm việc với functional programming, function composition
- Cần truyền hàm vào `map`, `filter`, `reduce`

**Dùng Partial Application khi:**
- Cố định một vài tham số cho hàm có sẵn (event handlers, API calls)
- Cần linh hoạt hơn currying (cố định nhiều tham số cùng lúc)
- Dùng `bind` để fix `this` và một số tham số

**Thực tế:** Hầu hết lập trình viên JS dùng partial application nhiều hơn currying. Currying phổ biến hơn trong các thư viện functional programming như Ramda, lodash/fp.
