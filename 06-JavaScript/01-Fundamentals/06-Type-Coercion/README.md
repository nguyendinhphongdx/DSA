# Type Coercion (Ép kiểu)

## Type Coercion là gì?

Type Coercion là việc JavaScript **tự động chuyển đổi kiểu dữ liệu** khi gặp các toán tử hoặc so sánh giữa các kiểu khác nhau. Đây là một trong những tính năng gây nhiều nhầm lẫn nhất trong JS, nhưng hiểu rõ nó sẽ giúp bạn tránh được rất nhiều bug.

Có 2 loại:
- **Implicit coercion** (ép kiểu ngầm): JS tự chuyển đổi
- **Explicit coercion** (ép kiểu tường minh): Lập trình viên chủ động chuyển đổi

---

## 1. Implicit Coercion (Ép kiểu ngầm)

### String Coercion

Khi dùng toán tử `+` với ít nhất một string, JS chuyển giá trị kia thành string:

```js
'5' + 3;        // '53' — số 3 → chuỗi '3'
'5' + true;     // '5true'
'5' + null;     // '5null'
'5' + undefined; // '5undefined'
'5' + {};       // '5[object Object]'
'5' + [];       // '5'  — [] → '' (chuỗi rỗng)
'5' + [1, 2];   // '51,2'
```

**Tại sao?** Toán tử `+` có 2 chức năng: cộng số và nối chuỗi. Khi có string, JS ưu tiên nối chuỗi.

### Number Coercion

Các toán tử `-`, `*`, `/`, `%` **luôn** chuyển về number:

```js
'5' - 3;        // 2 — '5' → 5
'5' * 2;        // 10
'10' / 2;       // 5
'5' % 2;        // 1
true - 1;       // 0 — true → 1
false + 1;      // 1 — false → 0
null + 1;       // 1 — null → 0
undefined + 1;  // NaN — undefined → NaN
```

### Boolean Coercion

Xảy ra trong các **ngữ cảnh boolean**: `if`, `while`, `&&`, `||`, `!`, ternary `?`.

**Falsy values** — 8 giá trị được coi là `false`:

| Giá trị | Kiểu |
|---------|------|
| `false` | Boolean |
| `0` | Number |
| `-0` | Number |
| `0n` | BigInt |
| `""` (chuỗi rỗng) | String |
| `null` | Null |
| `undefined` | Undefined |
| `NaN` | Number |

**Tất cả giá trị khác đều là truthy**, bao gồm cả:
- `"0"` (chuỗi chứa số 0)
- `"false"` (chuỗi chứa chữ "false")
- `[]` (mảng rỗng)
- `{}` (object rỗng)
- `function(){}` (hàm)

```js
if ('0') console.log('truthy!');   // Chạy! '0' là truthy
if ([]) console.log('truthy!');    // Chạy! [] là truthy
if (0) console.log('truthy!');     // KHÔNG chạy — 0 là falsy
```

---

## 2. Các quy tắc ép kiểu với == (Loose Equality)

Toán tử `==` có **bộ quy tắc phức tạp** khi so sánh 2 kiểu khác nhau:

### Quy tắc chính:

1. **Cùng kiểu** → so sánh trực tiếp
2. **null == undefined** → `true` (và chỉ bằng nhau, không bằng gì khác)
3. **Number vs String** → String chuyển thành Number
4. **Boolean vs bất kỳ** → Boolean chuyển thành Number trước
5. **Object vs Primitive** → Object chuyển thành Primitive (gọi `valueOf()` hoặc `toString()`)

```js
// Ví dụ từng quy tắc:
null == undefined;  // true  — quy tắc 2
null == 0;          // false — null chỉ == undefined

'5' == 5;           // true  — quy tắc 3: '5' → 5
'' == 0;            // true  — quy tắc 3: '' → 0

true == 1;          // true  — quy tắc 4: true → 1
false == 0;         // true  — quy tắc 4: false → 0
true == '1';        // true  — true → 1, '1' → 1

[] == false;        // true  — [] → '' → 0, false → 0
[1] == 1;           // true  — [1] → '1' → 1
```

### Các trường hợp gây bất ngờ:

```js
'' == false;      // true
'0' == false;     // true
'' == '0';        // false  — cùng kiểu string, so sánh trực tiếp

[] == 0;          // true   — [] → '' → 0
[] == '';         // true   — [] → ''
[] == false;      // true   — [] → '' → 0, false → 0
[null] == '';     // true   — [null] → ''
[undefined] == ''; // true  — [undefined] → ''

NaN == NaN;       // false  — NaN không bằng bất kỳ gì, kể cả chính nó
```

**Bài học: Luôn dùng `===`** để tránh tất cả sự phức tạp này.

---

## 3. Explicit Coercion (Ép kiểu tường minh)

Khi bạn **chủ ý** chuyển đổi kiểu dữ liệu.

### Chuyển sang Number

```js
Number('42');        // 42
Number('');          // 0
Number(' ');         // 0
Number('hello');     // NaN
Number(true);        // 1
Number(false);       // 0
Number(null);        // 0
Number(undefined);   // NaN

parseInt('42px');     // 42 — đọc số từ đầu chuỗi, dừng khi gặp ký tự không phải số
parseInt('0xFF', 16); // 255 — hệ 16
parseInt('hello');    // NaN
parseFloat('3.14m'); // 3.14

// Shorthand
+'42';               // 42 — unary + chuyển về number
+true;               // 1
+'';                  // 0
```

### Chuyển sang String

```js
String(42);          // '42'
String(true);        // 'true'
String(null);        // 'null'
String(undefined);   // 'undefined'
String([1, 2]);      // '1,2'
String({});          // '[object Object]'

// Shorthand
42 + '';             // '42'
(42).toString();     // '42'
(255).toString(16);  // 'ff' — chuyển sang hệ 16
```

### Chuyển sang Boolean

```js
Boolean(1);          // true
Boolean(0);          // false
Boolean('hello');    // true
Boolean('');         // false
Boolean(null);       // false
Boolean([]);         // true — mảng rỗng là truthy!
Boolean({});         // true — object rỗng là truthy!

// Shorthand
!!'hello';           // true — double NOT
!!0;                 // false
!!null;              // false
```

---

## 4. Object to Primitive Coercion

Khi JS cần chuyển object thành primitive, nó gọi các phương thức theo thứ tự:

### Hint "number" (khi cần number):
1. Gọi `valueOf()` → nếu trả về primitive → dùng
2. Gọi `toString()` → nếu trả về primitive → dùng
3. TypeError

### Hint "string" (khi cần string):
1. Gọi `toString()` → nếu trả về primitive → dùng
2. Gọi `valueOf()` → nếu trả về primitive → dùng
3. TypeError

```js
const obj = {
  valueOf() { return 42; },
  toString() { return 'hello'; },
};

obj + 0;     // 42 — hint "number": gọi valueOf()
`${obj}`;    // 'hello' — hint "string": gọi toString()
obj + '';    // '42' — hint "default" (tương tự number): gọi valueOf() → 42 → '42'
```

### Symbol.toPrimitive (ES6) — Kiểm soát hoàn toàn

```js
const price = {
  amount: 100,
  currency: 'VND',
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    if (hint === 'string') return `${this.amount} ${this.currency}`;
    return this.amount; // default
  },
};

+price;        // 100
`${price}`;    // '100 VND'
price + 50;    // 150
```

---

## 5. Best Practices

1. **Luôn dùng `===` thay `==`** — tránh ép kiểu ngầm trong so sánh
2. **Ép kiểu tường minh** — dùng `Number()`, `String()`, `Boolean()` cho rõ ràng
3. **Cẩn thận với `+`** — khi trộn string và number
4. **Kiểm tra `NaN` bằng `Number.isNaN()`** — không dùng `=== NaN`
5. **Biết rõ falsy values** — tránh bug khi dùng `if`, `||`, `&&`
