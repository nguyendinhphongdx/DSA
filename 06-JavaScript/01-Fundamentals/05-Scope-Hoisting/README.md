# Scope & Hoisting

## Scope (Phạm vi) là gì?

Scope xác định **phạm vi truy cập** của biến — biến có thể được đọc/ghi ở đâu trong code. Hiểu scope là nền tảng để viết JavaScript đúng và tránh bug.

JavaScript có 3 loại scope chính.

---

## 1. Global Scope

Biến khai báo **ngoài tất cả hàm và block** thuộc global scope. Mọi code trong file đều truy cập được.

```js
const appName = 'My App'; // Global scope

function showApp() {
  console.log(appName); // Truy cập được
}

if (true) {
  console.log(appName); // Truy cập được
}
```

Trong browser, biến `var` ở global scope trở thành property của `window`:

```js
var globalVar = 'hello';
console.log(window.globalVar); // 'hello'

let globalLet = 'world';
console.log(window.globalLet); // undefined — let/const KHÔNG gắn vào window
```

**Tránh dùng quá nhiều biến global** vì dễ gây xung đột tên (name collision) và khó quản lý.

---

## 2. Function Scope

Mỗi hàm tạo ra một **scope riêng**. Biến khai báo bên trong hàm **không truy cập được từ bên ngoài**.

```js
function calculateArea(width, height) {
  const area = width * height; // Chỉ tồn tại trong hàm này
  return area;
}

calculateArea(5, 3); // 15
// console.log(area); // ReferenceError — area không tồn tại ở đây
```

**`var` chỉ có function scope**, không có block scope:

```js
function example() {
  if (true) {
    var x = 10; // var: function scope → thoát khỏi block if
  }
  console.log(x); // 10 — vẫn truy cập được!
}
```

---

## 3. Block Scope (ES6)

Block scope được giới hạn bởi cặp ngoặc nhọn `{}`. `let` và `const` tuân theo block scope.

```js
if (true) {
  let a = 1;
  const b = 2;
  var c = 3;
}

// console.log(a); // ReferenceError — let có block scope
// console.log(b); // ReferenceError — const có block scope
console.log(c);    // 3 — var KHÔNG có block scope
```

Block scope áp dụng cho: `if`, `for`, `while`, `switch`, và bất kỳ `{}` nào:

```js
{
  let secret = 'hidden';
  console.log(secret); // 'hidden'
}
// console.log(secret); // ReferenceError
```

---

## 4. Lexical Scope (Scope lồng nhau)

JavaScript dùng **lexical scoping** (static scoping) — scope được xác định dựa trên **vị trí code được viết**, không phải nơi hàm được gọi.

Hàm bên trong có thể truy cập biến của **tất cả scope bên ngoài** nó (scope chain).

```js
const globalVar = 'global';

function outer() {
  const outerVar = 'outer';

  function middle() {
    const middleVar = 'middle';

    function inner() {
      const innerVar = 'inner';
      // inner có thể truy cập TẤT CẢ biến phía trên:
      console.log(innerVar);   // 'inner'    — scope riêng
      console.log(middleVar);  // 'middle'   — scope cha
      console.log(outerVar);   // 'outer'    — scope ông
      console.log(globalVar);  // 'global'   — scope toàn cục
    }
    inner();
    // console.log(innerVar); // ReferenceError — không truy cập scope con
  }
  middle();
}
```

**Scope Chain**: Khi JS tìm biến, nó tìm từ scope hiện tại → scope cha → scope ông → ... → global. Nếu không tìm thấy ở đâu → `ReferenceError`.

---

## 5. Hoisting

Hoisting là hành vi của JavaScript khi **"kéo" khai báo lên đầu scope** trước khi thực thi code. Tuy nhiên, chỉ **khai báo** được hoisting, không phải giá trị.

### var Hoisting

`var` được hoisting với giá trị `undefined`:

```js
console.log(name); // undefined (không lỗi!)
var name = 'Phong';

// JavaScript hiểu đoạn trên như:
var name;                 // Khai báo được kéo lên đầu
console.log(name);        // undefined
name = 'Phong';           // Gán giá trị vẫn ở chỗ cũ
```

### let / const Hoisting (Temporal Dead Zone)

`let` và `const` **cũng được hoisting** nhưng nằm trong **Temporal Dead Zone (TDZ)** — khoảng từ đầu block đến dòng khai báo. Truy cập biến trong TDZ sẽ gây `ReferenceError`.

```js
// --- TDZ bắt đầu cho 'age' ---
// console.log(age); // ReferenceError: Cannot access 'age' before initialization
// --- TDZ cho 'age' ---
let age = 25;       // TDZ kết thúc tại đây
console.log(age);   // 25
```

TDZ tồn tại để **bắt lỗi sớm** — nếu bạn truy cập biến trước khai báo, đó gần như luôn là bug.

### Function Hoisting

**Function Declaration** được hoisting **toàn bộ** (cả khai báo lẫn nội dung):

```js
sayHello(); // 'Hello!' — hoạt động vì được hoisting toàn bộ

function sayHello() {
  console.log('Hello!');
}
```

**Function Expression** KHÔNG được hoisting (vì bản chất là gán giá trị vào biến):

```js
// sayHi(); // TypeError: sayHi is not a function
var sayHi = function() {
  console.log('Hi!');
};

// greet(); // ReferenceError: Cannot access 'greet' before initialization
const greet = function() {
  console.log('Greet!');
};
```

---

## 6. Tổng kết & Best Practices

### Bảng so sánh

| | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Có → `undefined` | Có → TDZ | Có → TDZ |
| Reassign | Có | Có | Không |
| Redeclare (cùng scope) | Có | Không | Không |

### Best Practices

1. **Dùng `const` mặc định** — phần lớn biến không cần thay đổi
2. **Dùng `let` khi cần reassign** — ví dụ biến đếm trong loop
3. **Không dùng `var`** — tránh bug từ function scope và hoisting
4. **Khai báo biến ở đầu scope** — code dễ đọc hơn
5. **Tránh biến global** — dùng module hoặc IIFE để tạo scope riêng
6. **Đặt tên biến có ý nghĩa** — `userCount` thay vì `x`
