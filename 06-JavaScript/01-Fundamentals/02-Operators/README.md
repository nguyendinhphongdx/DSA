# Operators (Toán tử)

Toán tử là các ký hiệu đặc biệt dùng để thực hiện phép tính trên giá trị (operand). JavaScript có nhiều loại toán tử khác nhau.

---

## 1. Toán tử số học (Arithmetic Operators)

Dùng để thực hiện các phép tính toán học cơ bản.

| Toán tử | Mô tả | Ví dụ | Kết quả |
|---------|-------|-------|---------|
| `+` | Cộng | `5 + 3` | `8` |
| `-` | Trừ | `5 - 3` | `2` |
| `*` | Nhân | `5 * 3` | `15` |
| `/` | Chia | `10 / 3` | `3.333...` |
| `%` | Chia lấy dư | `10 % 3` | `1` |
| `**` | Lũy thừa | `2 ** 3` | `8` |

**Toán tử tăng/giảm:**

```js
let a = 5;
a++;    // Post-increment: trả về 5, sau đó a = 6
++a;    // Pre-increment: a = 7, trả về 7
a--;    // Post-decrement: trả về 7, sau đó a = 6
--a;    // Pre-decrement: a = 5, trả về 5
```

Sự khác biệt giữa **pre** và **post** rất quan trọng khi dùng trong biểu thức:

```js
let x = 5;
let y = x++;  // y = 5, x = 6 (gán trước, tăng sau)
let z = ++x;  // x = 7, z = 7 (tăng trước, gán sau)
```

---

## 2. Toán tử gán (Assignment Operators)

Dùng để gán giá trị cho biến. Ngoài `=` cơ bản, còn có các toán tử gán kết hợp.

```js
let x = 10;     // Gán
x += 5;         // x = x + 5  → 15
x -= 3;         // x = x - 3  → 12
x *= 2;         // x = x * 2  → 24
x /= 4;         // x = x / 4  → 6
x %= 4;         // x = x % 4  → 2
x **= 3;        // x = x ** 3 → 8

// ES2021: Logical assignment
x ||= 5;        // x = x || 5 (gán nếu x falsy)
x &&= 10;       // x = x && 10 (gán nếu x truthy)
x ??= 7;        // x = x ?? 7 (gán nếu x null/undefined)
```

---

## 3. Toán tử so sánh (Comparison Operators)

Trả về giá trị `boolean` (`true` hoặc `false`).

### == vs === (Quan trọng!)

Đây là một trong những điểm **gây nhầm lẫn nhất** trong JavaScript.

**`==` (Loose Equality)** — So sánh **có ép kiểu** (type coercion). JS sẽ cố gắng chuyển đổi 2 giá trị về cùng kiểu trước khi so sánh.

```js
5 == '5';          // true — '5' được chuyển thành số 5
0 == false;        // true — false được chuyển thành số 0
'' == false;       // true — '' và false đều chuyển thành 0
null == undefined; // true — quy tắc đặc biệt
1 == true;         // true — true chuyển thành 1
```

**`===` (Strict Equality)** — So sánh **không ép kiểu**. Cả kiểu và giá trị phải giống nhau.

```js
5 === '5';          // false — khác kiểu (number vs string)
0 === false;        // false — khác kiểu (number vs boolean)
null === undefined; // false — khác kiểu
1 === true;         // false — khác kiểu
5 === 5;            // true — cùng kiểu, cùng giá trị
```

**Quy tắc**: Luôn dùng `===` và `!==`. Chỉ dùng `==` khi bạn **chủ ý** muốn ép kiểu (rất hiếm).

### Các toán tử so sánh khác

```js
5 > 3;     // true
5 < 3;     // false
5 >= 5;    // true
5 <= 4;    // false
5 !== '5'; // true (strict not equal)
```

---

## 4. Toán tử logic (Logical Operators)

### && (AND)

Trả về giá trị **falsy đầu tiên** gặp được, hoặc giá trị **cuối cùng** nếu tất cả truthy. Đây gọi là **short-circuit evaluation** (đánh giá ngắn mạch).

```js
true && true;     // true
true && false;    // false
false && true;    // false (dừng ngay tại false, không kiểm tra tiếp)

// Ứng dụng thực tế:
'hello' && 42;    // 42 (cả hai truthy → trả về giá trị cuối)
0 && 'hello';     // 0 (gặp falsy đầu tiên → dừng, trả về 0)
null && 'hello';  // null

// Dùng thay thế if ngắn:
isLoggedIn && showDashboard(); // Chỉ gọi showDashboard nếu isLoggedIn truthy
```

### || (OR)

Trả về giá trị **truthy đầu tiên** gặp được, hoặc giá trị **cuối cùng** nếu tất cả falsy.

```js
true || false;    // true (gặp truthy đầu tiên → dừng)
false || true;    // true
false || false;   // false

// Ứng dụng: giá trị mặc định
const name = userInput || 'Anonymous';
// Nếu userInput là falsy ('', 0, null...) → dùng 'Anonymous'

// Chuỗi ||
const value = null || undefined || '' || 'fallback';
// → 'fallback' (3 giá trị đầu đều falsy)
```

### ! (NOT)

Đảo ngược giá trị boolean.

```js
!true;      // false
!0;         // true (0 là falsy)
!'hello';   // false ('hello' là truthy)

// Double NOT (!!) — chuyển đổi về boolean
!!'hello';  // true
!!0;        // false
!!null;     // false
```

### ?? (Nullish Coalescing — ES2020)

Giống `||` nhưng **chỉ check `null` và `undefined`**, không check các falsy khác như `0`, `''`, `false`.

```js
// || coi 0, '', false là falsy → dùng fallback
0 || 'default';     // 'default' (có thể không mong muốn!)
'' || 'default';    // 'default'

// ?? chỉ check null/undefined
0 ?? 'default';     // 0 (giữ nguyên vì 0 không phải null/undefined)
'' ?? 'default';    // '' (giữ nguyên)
null ?? 'default';  // 'default'
undefined ?? 'default'; // 'default'
```

**Khi nào dùng `??` thay `||`?** Khi `0`, `''`, hoặc `false` là giá trị hợp lệ mà bạn muốn giữ.

---

## 5. Toán tử chuỗi

Toán tử `+` khi dùng với string sẽ thực hiện **nối chuỗi** (concatenation).

```js
'Hello' + ' ' + 'World'; // 'Hello World'

// Khi trộn string với kiểu khác, JS ép kiểu về string
'Age: ' + 25;    // 'Age: 25'
'5' + 3;         // '53' (không phải 8!)
'5' - 3;         // 2 (toán tử - không nối chuỗi, nên ép về number)
```

---

## 6. Toán tử điều kiện (Ternary)

Cách viết tắt cho `if...else`, có dạng: `điều_kiện ? giá_trị_true : giá_trị_false`

```js
const age = 20;
const status = age >= 18 ? 'Adult' : 'Minor';
// Tương đương:
// if (age >= 18) { status = 'Adult'; } else { status = 'Minor'; }

// Có thể lồng nhau (nhưng nên hạn chế vì khó đọc)
const grade = score >= 90 ? 'A'
            : score >= 80 ? 'B'
            : score >= 70 ? 'C'
            : 'F';
```

---

## 7. Toán tử typeof và instanceof

```js
// typeof — kiểm tra kiểu primitive
typeof 42;         // 'number'
typeof 'hello';    // 'string'
typeof true;       // 'boolean'
typeof undefined;  // 'undefined'
typeof null;       // 'object' (bug lịch sử!)
typeof {};         // 'object'
typeof [];         // 'object' (array cũng là object)

// instanceof — kiểm tra object thuộc class/constructor nào
[] instanceof Array;       // true
{} instanceof Object;      // true (cần dùng trong expression)
new Date() instanceof Date; // true
```

---

## 8. Thứ tự ưu tiên (Operator Precedence)

JavaScript thực hiện các toán tử theo thứ tự ưu tiên. Từ cao đến thấp:

1. `()` — Nhóm
2. `!`, `typeof`, `++`, `--` — Unary
3. `**` — Lũy thừa
4. `*`, `/`, `%` — Nhân, chia
5. `+`, `-` — Cộng, trừ
6. `<`, `>`, `<=`, `>=` — So sánh
7. `===`, `!==` — Bằng/khác
8. `&&` — AND
9. `||` — OR
10. `??` — Nullish coalescing
11. `=`, `+=`, `-=`... — Gán

```js
// Ví dụ:
2 + 3 * 4;       // 14 (nhân trước cộng)
(2 + 3) * 4;     // 20 (nhóm trước)
true || false && false; // true (&& ưu tiên hơn ||)
```

Khi không chắc chắn, **hãy dùng dấu ngoặc `()`** để code rõ ràng hơn.
