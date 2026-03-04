# Variables & Data Types

## Biến (Variables) là gì?

Biến là một **hộp chứa** dùng để lưu trữ dữ liệu trong chương trình. Khi bạn tạo một biến, JavaScript sẽ cấp phát một vùng nhớ và gán tên cho vùng nhớ đó, giúp bạn truy cập và thay đổi dữ liệu dễ dàng.

JavaScript có 3 cách khai báo biến: `var`, `let`, và `const`.

---

## var

`var` là cách khai báo biến cũ nhất trong JavaScript (ES5 trở về trước). Nó có 2 đặc điểm quan trọng:

**Function-scoped**: Biến `var` chỉ bị giới hạn trong hàm chứa nó, không bị giới hạn bởi block `{}`.

```js
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — vẫn truy cập được vì var là function-scoped
}
```

**Hoisting**: Khai báo `var` được "kéo lên" đầu hàm, nhưng **chỉ khai báo**, không phải giá trị.

```js
console.log(name); // undefined (không lỗi, vì khai báo đã được hoisting)
var name = 'Phong';
// JavaScript hiểu đoạn trên như:
// var name;
// console.log(name); → undefined
// name = 'Phong';
```

**Nhược điểm**: Vì không có block scope, `var` dễ gây ra bug khó phát hiện, đặc biệt trong vòng lặp. Vì vậy, **không nên dùng `var`** trong code hiện đại.

---

## let

`let` được giới thiệu trong ES6 (2015) để khắc phục nhược điểm của `var`.

**Block-scoped**: Biến `let` bị giới hạn trong block `{}` gần nhất chứa nó.

```js
if (true) {
  let y = 20;
  console.log(y); // 20
}
// console.log(y); // ReferenceError — y không tồn tại ngoài block
```

**Không hoisting giá trị**: `let` vẫn được hoisting nhưng nằm trong **Temporal Dead Zone (TDZ)** — vùng từ đầu block đến dòng khai báo. Truy cập biến trong TDZ sẽ gây lỗi.

```js
// console.log(z); // ReferenceError: Cannot access 'z' before initialization
let z = 30;
```

**Có thể reassign** (gán lại giá trị):

```js
let count = 1;
count = 2; // OK
```

---

## const

`const` cũng được giới thiệu trong ES6, dùng cho các giá trị **không thay đổi**.

**Block-scoped** giống `let`.

**Không thể reassign**: Sau khi gán giá trị, không thể gán lại.

```js
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable
```

**Lưu ý quan trọng**: `const` ngăn việc **gán lại reference**, nhưng nội dung bên trong object/array vẫn có thể thay đổi (mutable).

```js
const user = { name: 'Phong' };
user.name = 'Minh'; // OK — thay đổi property bên trong
user.age = 25;       // OK — thêm property mới
// user = {};         // TypeError — không thể gán lại biến

const arr = [1, 2, 3];
arr.push(4);          // OK — [1, 2, 3, 4]
// arr = [5, 6];      // TypeError — không thể gán lại
```

---

## Nên dùng gì?

| | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Có (undefined) | Có (TDZ) | Có (TDZ) |
| Reassign | Có | Có | Không |
| Redeclare | Có | Không | Không |

**Quy tắc thực tế:**
1. **Mặc định dùng `const`** — vì hầu hết biến không cần reassign
2. **Dùng `let` khi cần reassign** — như biến đếm trong vòng lặp
3. **Không bao giờ dùng `var`** — trừ khi maintain code cũ

---

## Kiểu dữ liệu (Data Types)

JavaScript có 2 nhóm kiểu dữ liệu chính: **Primitive** (nguyên thủy) và **Reference** (tham chiếu).

### Primitive Types (Kiểu nguyên thủy)

Giá trị nguyên thủy là **bất biến** (immutable) — khi bạn thay đổi giá trị, JS tạo một giá trị mới thay vì sửa giá trị cũ. Chúng được **lưu trực tiếp trên Stack**.

#### Number

JavaScript chỉ có một kiểu số duy nhất (không phân biệt int/float như các ngôn ngữ khác). Số trong JS tuân theo chuẩn **IEEE 754 (64-bit floating point)**.

```js
const integer = 42;
const float = 3.14;
const negative = -10;
const hex = 0xFF;        // 255 (hệ 16)
const binary = 0b1010;   // 10 (hệ 2)
const octal = 0o17;      // 15 (hệ 8)
```

**Giá trị đặc biệt:**
- `Infinity` / `-Infinity`: Kết quả của phép chia cho 0
- `NaN` (Not a Number): Kết quả của phép tính không hợp lệ

```js
1 / 0;           // Infinity
'hello' * 2;     // NaN
NaN === NaN;     // false (NaN không bằng chính nó!)
Number.isNaN(NaN); // true (cách kiểm tra đúng)
```

**Giới hạn:**
```js
Number.MAX_SAFE_INTEGER; // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER; // -9007199254740991
0.1 + 0.2 === 0.3;      // false! (0.30000000000000004) — lỗi floating point
```

#### String

Chuỗi ký tự, có thể dùng dấu nháy đơn `'...'`, nháy kép `"..."`, hoặc backtick `` `...` `` (template literal).

```js
const single = 'Hello';
const double = "World";
const template = `Hello ${single}`; // Template literal — cho phép nhúng biểu thức

// String là immutable
const str = 'hello';
str[0] = 'H'; // Không có hiệu lực, str vẫn là 'hello'
```

#### Boolean

Chỉ có 2 giá trị: `true` và `false`. Thường dùng trong điều kiện.

```js
const isActive = true;
const isLoggedIn = false;
```

#### Undefined

Biến đã khai báo nhưng **chưa được gán giá trị**. JavaScript tự động gán `undefined`.

```js
let x;
console.log(x); // undefined

function greet(name) {
  console.log(name); // undefined nếu không truyền argument
}
```

#### Null

Đại diện cho **"không có giá trị"** — do lập trình viên chủ động gán. Khác với `undefined` (JS tự gán).

```js
let user = null; // Chủ ý: chưa có user nào
// Sau này: user = { name: 'Phong' };
```

**Lưu ý lịch sử**: `typeof null` trả về `"object"` — đây là bug từ phiên bản đầu tiên của JS và không bao giờ được sửa vì sẽ phá vỡ code cũ.

#### Symbol (ES6)

Giá trị **duy nhất và bất biến**, thường dùng làm key cho object property để tránh xung đột tên.

```js
const id = Symbol('id');
const anotherId = Symbol('id');
id === anotherId; // false — mỗi Symbol là duy nhất

const user = {
  [id]: 123,
  name: 'Phong',
};
```

#### BigInt (ES2020)

Cho phép biểu diễn số nguyên **lớn hơn** `Number.MAX_SAFE_INTEGER`. Thêm `n` vào cuối số.

```js
const big = 9007199254740991n;
const bigger = big + 1n; // 9007199254740992n
// big + 1; // TypeError — không thể trộn BigInt với Number thường
```

### Reference Types (Kiểu tham chiếu)

Kiểu tham chiếu được **lưu trên Heap**, biến chỉ giữ **địa chỉ (reference)** trỏ đến vùng nhớ thực sự. Khi gán biến reference cho biến khác, cả hai cùng trỏ đến một vùng nhớ.

```js
const a = { name: 'Phong' };
const b = a;        // b trỏ đến cùng object
b.name = 'Minh';
console.log(a.name); // 'Minh' — a cũng bị ảnh hưởng!

// So sánh reference
const obj1 = { x: 1 };
const obj2 = { x: 1 };
obj1 === obj2; // false — khác reference dù cùng nội dung
```

Các kiểu tham chiếu: **Object**, **Array**, **Function**, **Date**, **RegExp**, **Map**, **Set**, v.v.

---

## Kiểm tra kiểu dữ liệu

### typeof

```js
typeof 42;          // "number"
typeof 'hello';     // "string"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof null;        // "object" ← bug lịch sử
typeof {};          // "object"
typeof [];          // "object" ← array cũng là object
typeof function(){}; // "function"
typeof Symbol();    // "symbol"
typeof 42n;         // "bigint"
```

### Cách kiểm tra chính xác hơn

```js
// Kiểm tra Array
Array.isArray([1, 2]);       // true
Array.isArray({});            // false

// instanceof (kiểm tra prototype chain)
[] instanceof Array;          // true
new Date() instanceof Date;   // true

// Object.prototype.toString (chính xác nhất)
Object.prototype.toString.call([]);    // "[object Array]"
Object.prototype.toString.call(null);  // "[object Null]"
Object.prototype.toString.call(/regex/); // "[object RegExp]"
```
