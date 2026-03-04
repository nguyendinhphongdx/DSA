# Higher-Order Functions (Hàm bậc cao)

## Higher-Order Function là gì?

Một Higher-Order Function (HOF) là hàm thỏa mãn **ít nhất một** trong hai điều kiện:
1. **Nhận hàm** làm tham số (argument)
2. **Trả về hàm** mới

HOF là nền tảng của **functional programming** trong JavaScript. Chúng giúp code ngắn gọn, tái sử dụng, và dễ kết hợp (composable).

Thực tế, bạn đã dùng HOF rất nhiều mà có thể không nhận ra: `map`, `filter`, `reduce`, `forEach`, `addEventListener`, `setTimeout`... đều là HOF.

---

## 1. Nhận hàm làm tham số

### Ví dụ cơ bản

```js
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log);           // 0, 1, 2
repeat(3, i => console.log(i * i)); // 0, 1, 4
```

Ở đây `repeat` là HOF vì nó nhận `action` (một hàm) làm tham số. Điều này cho phép `repeat` **linh hoạt** — cùng một hàm lặp nhưng hành vi khác nhau tùy theo hàm được truyền vào.

### Array HOFs (quan trọng nhất)

```js
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map: biến đổi từng phần tử
numbers.map(n => n * 2);           // [2, 4, 6, ...]

// filter: lọc theo điều kiện
numbers.filter(n => n % 2 === 0);   // [2, 4, 6, 8, 10]

// reduce: gom thành 1 giá trị
numbers.reduce((sum, n) => sum + n, 0); // 55

// find: tìm phần tử đầu tiên thỏa mãn
numbers.find(n => n > 5);           // 6

// some: có ít nhất 1 phần tử thỏa mãn?
numbers.some(n => n > 9);           // true

// every: tất cả thỏa mãn?
numbers.every(n => n > 0);          // true

// sort: sắp xếp (nhận compare function)
numbers.sort((a, b) => b - a);      // [10, 9, 8, ...]
```

### Tự viết Array HOF

Hiểu cách `map` và `filter` hoạt động bên trong:

```js
function myMap(arr, transform) {
  const result = [];
  for (const item of arr) {
    result.push(transform(item));
  }
  return result;
}

function myFilter(arr, predicate) {
  const result = [];
  for (const item of arr) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

function myReduce(arr, reducer, initialValue) {
  let accumulator = initialValue;
  for (const item of arr) {
    accumulator = reducer(accumulator, item);
  }
  return accumulator;
}

myMap([1, 2, 3], x => x * 10);      // [10, 20, 30]
myFilter([1, 2, 3, 4], x => x > 2); // [3, 4]
myReduce([1, 2, 3], (a, b) => a + b, 0); // 6
```

---

## 2. Trả về hàm

### Function Factory

Tạo các hàm chuyên biệt từ pattern chung:

```js
function createValidator(rule) {
  return function(value) {
    return rule(value);
  };
}

// Tạo các validator cụ thể
const isPositive = createValidator(n => n > 0);
const isEven = createValidator(n => n % 2 === 0);
const isLongEnough = createValidator(s => s.length >= 8);

isPositive(5);         // true
isEven(7);             // false
isLongEnough('hello'); // false
```

### Wrapper Functions

Bọc thêm logic xung quanh một hàm mà không sửa hàm gốc:

```js
// Logger wrapper
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name}(${args.join(', ')})`);
    const result = fn(...args);
    console.log(`→ Result: ${result}`);
    return result;
  };
}

function add(a, b) { return a + b; }

const loggedAdd = withLogging(add);
loggedAdd(3, 4);
// "Calling add(3, 4)"
// "→ Result: 7"
```

```js
// Timing wrapper
function withTiming(fn) {
  return function(...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${fn.name} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
}
```

```js
// Once — chỉ cho phép gọi 1 lần
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (called) return result;
    called = true;
    result = fn(...args);
    return result;
  };
}

const initialize = once(() => {
  console.log('Initializing...');
  return { ready: true };
});

initialize(); // 'Initializing...' → { ready: true }
initialize(); // Không log gì → { ready: true } (kết quả cached)
```

---

## 3. Function Composition

Kết hợp nhiều hàm nhỏ thành một hàm lớn. Mỗi hàm nhận output của hàm trước làm input.

```js
// compose: thực thi từ PHẢI sang TRÁI
function compose(...fns) {
  return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
}

// pipe: thực thi từ TRÁI sang PHẢI (dễ đọc hơn)
function pipe(...fns) {
  return (value) => fns.reduce((acc, fn) => fn(acc), value);
}

// Các hàm nhỏ, đơn giản
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const replaceSpaces = str => str.replace(/\s+/g, '-');

// Kết hợp thành hàm lớn
const slugify = pipe(trim, toLowerCase, replaceSpaces);

slugify('  Hello World  '); // 'hello-world'
```

### Ví dụ thực tế: Data Pipeline

```js
const processUsers = pipe(
  users => users.filter(u => u.active),           // Lọc active
  users => users.map(u => ({ ...u, name: u.name.toUpperCase() })), // Upper name
  users => users.sort((a, b) => a.age - b.age),   // Sort by age
  users => users.slice(0, 5),                       // Top 5
);

const result = processUsers([
  { name: 'Phong', age: 25, active: true },
  { name: 'Minh', age: 30, active: false },
  { name: 'An', age: 22, active: true },
  // ...
]);
```

---

## 4. Tại sao HOF quan trọng?

### Trước HOF (Imperative — ra lệnh từng bước)

```js
// Lọc số chẵn, nhân đôi, tính tổng
const numbers = [1, 2, 3, 4, 5, 6];
let sum = 0;
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    sum += numbers[i] * 2;
  }
}
// sum = 24
```

### Với HOF (Declarative — mô tả kết quả muốn đạt)

```js
const sum = [1, 2, 3, 4, 5, 6]
  .filter(n => n % 2 === 0)  // Lọc số chẵn [2, 4, 6]
  .map(n => n * 2)             // Nhân đôi [4, 8, 12]
  .reduce((a, b) => a + b, 0); // Tính tổng 24
```

Code declarative **dễ đọc hơn** vì bạn thấy **ý định** (filter, map, reduce) thay vì **chi tiết cài đặt** (for, if, +=).
