# Arrays

## Array là gì?

Array (mảng) là một **danh sách có thứ tự** các giá trị, được đánh chỉ số (index) bắt đầu từ 0. Trong JavaScript, array thực chất là **object đặc biệt** — key là các số (index) và có property `length`.

Array có thể chứa **bất kỳ kiểu dữ liệu nào**, kể cả trộn lẫn các kiểu khác nhau (nhưng nên tránh để code rõ ràng).

---

## 1. Tạo Array

```js
// Array literal (phổ biến nhất)
const fruits = ['Apple', 'Banana', 'Cherry'];

// Array constructor (ít dùng)
const arr = new Array(3);     // [empty × 3] — tạo mảng 3 phần tử rỗng
const arr2 = new Array(1, 2); // [1, 2]

// Array.from() — tạo array từ iterable hoặc array-like
Array.from('hello');              // ['h', 'e', 'l', 'l', 'o']
Array.from({ length: 5 }, (_, i) => i);  // [0, 1, 2, 3, 4]
Array.from(new Set([1, 2, 2]));   // [1, 2]

// Array.of() — tạo array từ arguments
Array.of(1, 2, 3); // [1, 2, 3]

// Fill
new Array(5).fill(0);        // [0, 0, 0, 0, 0]
new Array(3).fill({ x: 0 }); // ⚠️ 3 phần tử trỏ cùng 1 object!
```

---

## 2. Truy cập & Cơ bản

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

arr[0];          // 'a' — phần tử đầu
arr[arr.length - 1]; // 'e' — phần tử cuối
arr.at(-1);      // 'e' — ES2022, index âm = đếm từ cuối
arr.at(-2);      // 'd'

arr.length;      // 5

// Kiểm tra array
Array.isArray(arr);   // true
Array.isArray({});     // false
```

---

## 3. Mutating Methods (Thay đổi mảng gốc)

Các method này **sửa trực tiếp** mảng ban đầu. Cần cẩn thận khi dùng, đặc biệt trong React/functional programming.

### Thêm / Xóa phần tử

```js
const arr = [1, 2, 3];

// Thêm cuối — trả về length mới
arr.push(4);         // arr = [1, 2, 3, 4], return 4
arr.push(5, 6);      // arr = [1, 2, 3, 4, 5, 6]

// Xóa cuối — trả về phần tử bị xóa
arr.pop();           // arr = [1, 2, 3, 4, 5], return 6

// Thêm đầu — trả về length mới
arr.unshift(0);      // arr = [0, 1, 2, 3, 4, 5], return 6

// Xóa đầu — trả về phần tử bị xóa
arr.shift();         // arr = [1, 2, 3, 4, 5], return 0
```

**Hiệu suất:** `push`/`pop` nhanh hơn `unshift`/`shift` vì không cần dịch chuyển tất cả phần tử.

### splice() — Dao quân đội Thụy Sĩ

`splice(startIndex, deleteCount, ...itemsToAdd)` — xóa và/hoặc thêm phần tử tại vị trí bất kỳ.

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

// Xóa 2 phần tử từ index 1
arr.splice(1, 2);           // return ['b', 'c'], arr = ['a', 'd', 'e']

// Thêm tại index 1 (không xóa)
arr.splice(1, 0, 'x', 'y'); // arr = ['a', 'x', 'y', 'd', 'e']

// Thay thế 1 phần tử tại index 2
arr.splice(2, 1, 'z');      // arr = ['a', 'x', 'z', 'd', 'e']
```

### sort() — Sắp xếp

**Cẩn thận:** Mặc định sort chuyển sang **string** rồi sắp xếp theo Unicode. Điều này gây sai khi sắp xếp số.

```js
// SAI — sort mặc định sắp xếp theo string
[10, 9, 2, 100].sort();     // [10, 100, 2, 9] — sai!

// ĐÚNG — truyền compare function
[10, 9, 2, 100].sort((a, b) => a - b); // [2, 9, 10, 100] — tăng dần
[10, 9, 2, 100].sort((a, b) => b - a); // [100, 10, 9, 2] — giảm dần

// Sắp xếp string theo tiếng Việt
['Ba', 'An', 'Cường'].sort((a, b) => a.localeCompare(b, 'vi'));
```

**Compare function trả về:**
- Số **âm** → a đứng trước b
- **0** → giữ nguyên
- Số **dương** → b đứng trước a

### reverse()

```js
[1, 2, 3].reverse(); // [3, 2, 1] — thay đổi mảng gốc
```

---

## 4. Non-Mutating Methods (Trả về kết quả mới)

Các method này **không thay đổi** mảng gốc, trả về giá trị mới. Rất quan trọng trong functional programming và React.

### map() — Biến đổi từng phần tử

Trả về **mảng mới** có cùng length, mỗi phần tử được biến đổi qua callback.

```js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
// doubled = [2, 4, 6, 8]
// numbers vẫn = [1, 2, 3, 4]

const users = [{ name: 'A', age: 20 }, { name: 'B', age: 30 }];
const names = users.map(user => user.name);
// ['A', 'B']
```

### filter() — Lọc theo điều kiện

Trả về **mảng mới** chỉ chứa các phần tử mà callback trả về `true`.

```js
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6]

// Lọc bỏ falsy values
const mixed = [0, 'hello', '', null, 42, undefined, true];
const truthy = mixed.filter(Boolean);
// ['hello', 42, true]
```

### reduce() — Gom tất cả thành 1 giá trị

Method mạnh nhất nhưng cũng khó hiểu nhất. Duyệt qua từng phần tử, "tích lũy" kết quả vào **accumulator**.

```js
// reduce(callback, initialValue)
// callback nhận: (accumulator, currentValue, index, array)

// Tính tổng
const sum = [1, 2, 3, 4].reduce((acc, num) => acc + num, 0);
// Bước 1: acc=0, num=1 → 0+1=1
// Bước 2: acc=1, num=2 → 1+2=3
// Bước 3: acc=3, num=3 → 3+3=6
// Bước 4: acc=6, num=4 → 6+4=10
// Kết quả: 10

// Đếm số lần xuất hiện
const fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
// { apple: 3, banana: 2, cherry: 1 }

// Flatten mảng lồng nhau
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.reduce((acc, arr) => [...acc, ...arr], []);
// [1, 2, 3, 4, 5]
```

**Luôn truyền initialValue** (tham số thứ 2 của reduce) — nếu không, reduce dùng phần tử đầu tiên làm accumulator ban đầu, có thể gây lỗi khi mảng rỗng.

### find() / findIndex()

```js
const users = [
  { id: 1, name: 'An' },
  { id: 2, name: 'Bình' },
  { id: 3, name: 'Cường' },
];

// find — trả về phần tử ĐẦU TIÊN match, hoặc undefined
users.find(u => u.id === 2);       // { id: 2, name: 'Bình' }
users.find(u => u.id === 99);      // undefined

// findIndex — trả về INDEX đầu tiên match, hoặc -1
users.findIndex(u => u.id === 2);  // 1
users.findIndex(u => u.id === 99); // -1
```

### some() / every()

```js
const numbers = [1, 2, 3, 4, 5];

// some — có ÍT NHẤT 1 phần tử thỏa mãn?
numbers.some(n => n > 4);   // true (có 5)
numbers.some(n => n > 10);  // false

// every — TẤT CẢ phần tử thỏa mãn?
numbers.every(n => n > 0);  // true
numbers.every(n => n > 3);  // false
```

### slice() — Cắt mảng

Trả về mảng con, **không thay đổi** mảng gốc. Khác với `splice`!

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

arr.slice(1, 3);    // ['b', 'c'] — từ index 1 đến 3 (không bao gồm 3)
arr.slice(2);       // ['c', 'd', 'e'] — từ index 2 đến hết
arr.slice(-2);      // ['d', 'e'] — 2 phần tử cuối
arr.slice();        // ['a', 'b', 'c', 'd', 'e'] — shallow copy
```

### flat() / flatMap()

```js
// flat — làm phẳng mảng lồng nhau
[1, [2, [3, [4]]]].flat();         // [1, 2, [3, [4]]] — mặc định depth=1
[1, [2, [3, [4]]]].flat(2);        // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4] — phẳng hoàn toàn

// flatMap — map rồi flat(1)
const sentences = ['Hello world', 'Foo bar'];
sentences.flatMap(s => s.split(' '));
// ['Hello', 'world', 'Foo', 'bar']
```

### includes() / indexOf()

```js
const arr = [1, 2, 3, NaN];

arr.includes(2);    // true
arr.includes(99);   // false
arr.includes(NaN);  // true — includes tìm được NaN!

arr.indexOf(2);     // 1
arr.indexOf(99);    // -1
arr.indexOf(NaN);   // -1 — indexOf KHÔNG tìm được NaN!
```

---

## 5. Method chaining

Kết hợp nhiều method liên tiếp — rất phổ biến và mạnh mẽ:

```js
const products = [
  { name: 'Phone', price: 1000, inStock: true },
  { name: 'Laptop', price: 2000, inStock: false },
  { name: 'Tablet', price: 500, inStock: true },
  { name: 'Watch', price: 300, inStock: true },
];

// Lấy tên các sản phẩm còn hàng, giá > 400, sắp xếp theo giá
const result = products
  .filter(p => p.inStock)           // Lọc còn hàng
  .filter(p => p.price > 400)       // Lọc giá > 400
  .sort((a, b) => a.price - b.price) // Sắp xếp tăng dần
  .map(p => p.name);                 // Lấy tên

// ['Tablet', 'Phone']
```

---

## 6. Loại bỏ trùng lặp

```js
const arr = [1, 2, 2, 3, 3, 4];

// Cách 1: Set (nhanh, đơn giản)
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// Cách 2: filter + indexOf
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);

// Với object array: lọc theo field
const users = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 1, name: 'A' },
];
const uniqueUsers = users.filter(
  (user, index, self) => index === self.findIndex(u => u.id === user.id)
);
```
