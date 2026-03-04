# Generators & Iterators

## 1. Iterator Protocol

Iterator là một object có method `next()` trả về `{ value, done }`. Bất kỳ object nào tuân theo protocol này đều có thể dùng với `for...of`, spread `...`, destructuring.

```js
// Custom iterator
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3, 4, 5
[...range]; // [1, 2, 3, 4, 5]
```

---

## 2. Generator Functions

Generator là cách **đơn giản hơn** để tạo iterator. Dùng `function*` và `yield`.

Khác biệt cơ bản: hàm thường chạy từ đầu đến cuối. Generator có thể **tạm dừng** (yield) và **tiếp tục** (next) nhiều lần.

```js
function* numberGenerator() {
  console.log('Start');
  yield 1;               // Tạm dừng, trả về { value: 1, done: false }
  console.log('After 1');
  yield 2;               // Tạm dừng, trả về { value: 2, done: false }
  console.log('After 2');
  yield 3;               // Tạm dừng, trả về { value: 3, done: false }
  console.log('End');
  // Return → { value: undefined, done: true }
}

const gen = numberGenerator(); // Chưa chạy gì!

gen.next(); // "Start"     → { value: 1, done: false }
gen.next(); // "After 1"   → { value: 2, done: false }
gen.next(); // "After 2"   → { value: 3, done: false }
gen.next(); // "End"        → { value: undefined, done: true }
```

### yield* — Delegate sang generator/iterable khác

```js
function* concat(...iterables) {
  for (const iterable of iterables) {
    yield* iterable; // Yield từng phần tử của iterable
  }
}

[...concat([1, 2], [3, 4], 'ab')]; // [1, 2, 3, 4, 'a', 'b']
```

---

## 3. Giao tiếp 2 chiều

Generator không chỉ **trả ra** giá trị (yield), mà còn có thể **nhận vào** giá trị qua `next(value)`.

```js
function* conversation() {
  const name = yield 'What is your name?';
  const age = yield `Hello ${name}! How old are you?`;
  return `${name} is ${age} years old`;
}

const chat = conversation();
console.log(chat.next());          // { value: 'What is your name?', done: false }
console.log(chat.next('Phong'));   // { value: 'Hello Phong! How old are you?', done: false }
console.log(chat.next(25));        // { value: 'Phong is 25 years old', done: true }
```

**Cách hoạt động:** Giá trị truyền vào `next(value)` trở thành **kết quả** của biểu thức `yield` tại điểm generator đang tạm dừng.

---

## 4. Infinite Generators

Generator có thể tạo **chuỗi vô hạn** — chỉ tính toán khi cần (lazy evaluation).

```js
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Lấy 10 số Fibonacci đầu tiên
function take(n, iterable) {
  const result = [];
  for (const value of iterable) {
    result.push(value);
    if (result.length >= n) break;
  }
  return result;
}

take(10, fibonacci()); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

```js
// ID generator
function* idGenerator(prefix = 'id') {
  let id = 1;
  while (true) {
    yield `${prefix}_${id++}`;
  }
}

const genId = idGenerator('user');
genId.next().value; // 'user_1'
genId.next().value; // 'user_2'
```

---

## 5. Async Generators (ES2018)

Kết hợp generator với async — `yield` các Promise.

```js
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}&limit=10`);
    const data = await res.json();

    if (data.items.length === 0) return; // Hết dữ liệu

    yield data.items;
    page++;
  }
}

// for await...of để duyệt async generator
for await (const items of fetchPages('/api/products')) {
  items.forEach(item => console.log(item.name));
}
```

---

## 6. Ứng dụng thực tế

### Pagination

```js
async function* paginate(fetchFn, pageSize = 20) {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchFn(page, pageSize);
    yield data.items;
    hasMore = data.items.length === pageSize;
    page++;
  }
}
```

### State Machine

```js
function* trafficLight() {
  while (true) {
    yield 'green';
    yield 'yellow';
    yield 'red';
  }
}

const light = trafficLight();
light.next().value; // 'green'
light.next().value; // 'yellow'
light.next().value; // 'red'
light.next().value; // 'green' (lặp lại)
```
