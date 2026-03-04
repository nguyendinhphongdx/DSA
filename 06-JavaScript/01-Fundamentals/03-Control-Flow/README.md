# Control Flow (Luồng điều khiển)

Luồng điều khiển quyết định **thứ tự thực thi** code. Mặc định, JavaScript chạy code từ trên xuống dưới. Nhưng với các câu lệnh điều khiển, bạn có thể rẽ nhánh, lặp lại, hoặc bỏ qua các đoạn code.

---

## 1. Câu lệnh điều kiện (Conditional Statements)

### if / else if / else

Dùng khi cần kiểm tra một hoặc nhiều điều kiện.

```js
const temperature = 35;

if (temperature > 30) {
  console.log('Trời nóng');
} else if (temperature > 20) {
  console.log('Trời mát');
} else if (temperature > 10) {
  console.log('Trời lạnh');
} else {
  console.log('Trời rất lạnh');
}
```

**Lưu ý:** JavaScript kiểm tra từ trên xuống và **dừng ngay** khi gặp điều kiện đúng đầu tiên. Các `else if` phía sau sẽ bị bỏ qua.

**Falsy values** — Các giá trị được coi là `false` khi dùng trong điều kiện:
- `false`, `0`, `-0`, `0n` (BigInt zero)
- `""` (chuỗi rỗng)
- `null`, `undefined`, `NaN`

Tất cả giá trị khác đều là **truthy** (kể cả `[]`, `{}`, `"0"`, `"false"`).

```js
if ([]) console.log('Array rỗng là truthy!');     // Chạy!
if ({}) console.log('Object rỗng là truthy!');     // Chạy!
if ('0') console.log('Chuỗi "0" là truthy!');      // Chạy!
```

### switch

Dùng khi cần so sánh **một biến** với **nhiều giá trị cụ thể**. `switch` dùng `===` để so sánh.

```js
const day = 'Monday';

switch (day) {
  case 'Monday':
  case 'Tuesday':
  case 'Wednesday':
  case 'Thursday':
  case 'Friday':
    console.log('Ngày làm việc');
    break; // Bắt buộc! Nếu không có break, code sẽ "rơi xuống" case tiếp
  case 'Saturday':
  case 'Sunday':
    console.log('Cuối tuần');
    break;
  default:
    console.log('Ngày không hợp lệ');
}
```

**Fall-through**: Nếu quên `break`, code sẽ tiếp tục chạy vào case tiếp theo. Đôi khi đây là hành vi mong muốn (như nhóm Monday-Friday ở trên), nhưng thường là bug.

**Khi nào dùng switch thay if/else?**
- Khi so sánh một biến với **nhiều giá trị cố định** (3+ giá trị)
- Khi các giá trị là **hằng số**, không phải biểu thức phức tạp
- `if/else` linh hoạt hơn khi cần kiểm tra **khoảng giá trị** hoặc **nhiều điều kiện** khác nhau

---

## 2. Vòng lặp (Loops)

Vòng lặp cho phép thực thi một đoạn code **nhiều lần**. JavaScript có nhiều loại vòng lặp, mỗi loại phù hợp với tình huống khác nhau.

### for

Vòng lặp cơ bản nhất, gồm 3 phần: **khởi tạo**, **điều kiện**, và **cập nhật**.

```js
// Cú pháp: for (khởi_tạo; điều_kiện; cập_nhật)
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
```

**Cách hoạt động:**
1. `let i = 0` — Chạy **một lần** lúc bắt đầu
2. `i < 5` — Kiểm tra **trước mỗi lần lặp**. Nếu `false` → dừng
3. Thực thi code trong `{}`
4. `i++` — Chạy **sau mỗi lần lặp**
5. Quay lại bước 2

### while

Lặp khi **điều kiện còn đúng**. Dùng khi không biết trước số lần lặp.

```js
let input = '';
while (input !== 'quit') {
  input = prompt('Nhập lệnh (quit để thoát):');
  console.log('Bạn nhập:', input);
}
```

**Cẩn thận vòng lặp vô hạn!** Nếu điều kiện không bao giờ `false`, chương trình sẽ treo.

### do...while

Giống `while` nhưng **luôn chạy ít nhất 1 lần** vì kiểm tra điều kiện **sau** khi thực thi.

```js
let number;
do {
  number = Math.floor(Math.random() * 10);
  console.log('Số:', number);
} while (number !== 7);
// Luôn chạy ít nhất 1 lần, lặp cho đến khi ra số 7
```

### for...of (ES6)

Duyệt qua các **giá trị** của iterable (array, string, Map, Set...). Đây là cách duyệt array hiện đại nhất.

```js
const fruits = ['Apple', 'Banana', 'Cherry'];

for (const fruit of fruits) {
  console.log(fruit); // 'Apple', 'Banana', 'Cherry'
}

// Duyệt chuỗi
for (const char of 'Hello') {
  console.log(char); // 'H', 'e', 'l', 'l', 'o'
}

// Lấy index kèm giá trị
for (const [index, fruit] of fruits.entries()) {
  console.log(`${index}: ${fruit}`);
}
```

### for...in

Duyệt qua các **key** (property name) của object. **Không nên dùng cho array** vì thứ tự không đảm bảo và có thể duyệt cả prototype properties.

```js
const person = { name: 'Phong', age: 25, city: 'HCM' };

for (const key in person) {
  console.log(`${key}: ${person[key]}`);
  // 'name: Phong', 'age: 25', 'city: HCM'
}
```

### So sánh các vòng lặp

| Vòng lặp | Dùng cho | Trả về |
|----------|----------|--------|
| `for` | Khi cần index, kiểm soát chi tiết | - |
| `while` | Không biết số lần lặp | - |
| `for...of` | Array, String, Map, Set (iterable) | Giá trị |
| `for...in` | Object (enumerable properties) | Key |

---

## 3. Điều khiển vòng lặp

### break

Thoát **hoàn toàn** khỏi vòng lặp.

```js
for (let i = 0; i < 100; i++) {
  if (i === 5) break;     // Dừng ngay khi i = 5
  console.log(i);          // 0, 1, 2, 3, 4
}
```

### continue

Bỏ qua **lần lặp hiện tại**, nhảy sang lần lặp tiếp theo.

```js
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue; // Bỏ qua số chẵn
  console.log(i);              // 1, 3, 5, 7, 9
}
```

### Label (hiếm dùng)

Đặt tên cho vòng lặp, dùng khi cần `break`/`continue` vòng lặp ngoài từ bên trong vòng lặp lồng nhau.

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // Thoát cả 2 vòng lặp
    console.log(i, j);
  }
}
// 0,0  0,1  0,2  1,0  (dừng tại 1,1)
```

---

## 4. Xử lý ngoại lệ (Exception Handling)

`try...catch` cho phép "bắt" lỗi mà không làm chương trình dừng lại.

```js
try {
  const data = JSON.parse('invalid json');
} catch (error) {
  console.error('Lỗi:', error.message);
  // Chương trình vẫn tiếp tục chạy
} finally {
  // Luôn chạy dù có lỗi hay không
  console.log('Đã xử lý xong');
}
```

`throw` — Ném ra lỗi tùy chỉnh:

```js
function divide(a, b) {
  if (b === 0) throw new Error('Không thể chia cho 0');
  return a / b;
}

try {
  divide(10, 0);
} catch (e) {
  console.error(e.message); // 'Không thể chia cho 0'
}
```
