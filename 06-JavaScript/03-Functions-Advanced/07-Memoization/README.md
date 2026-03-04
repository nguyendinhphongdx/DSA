# Memoization (Ghi nhớ kết quả)

## Memoization là gì?

Memoization là kỹ thuật **tối ưu hiệu suất** bằng cách lưu cache kết quả của hàm. Khi hàm được gọi với **cùng tham số** mà đã tính trước đó, thay vì tính lại, hàm trả về kết quả từ cache ngay lập tức.

Memoization phù hợp cho:
- Hàm **tính toán tốn kém** (nặng CPU)
- Hàm **pure** (cùng input luôn cho cùng output)
- Hàm được **gọi nhiều lần** với cùng input

---

## 1. Ví dụ trực quan

### Không có memoization

```js
function expensiveCalculation(n) {
  console.log(`Computing for ${n}...`);
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

expensiveCalculation(10); // "Computing for 10..." → tính 10 triệu lần
expensiveCalculation(10); // "Computing for 10..." → tính lại 10 triệu lần!
expensiveCalculation(10); // "Computing for 10..." → tính lại lần nữa!
```

### Có memoization

```js
function memoizedCalculation(n) {
  // Kiểm tra cache
  if (memoizedCalculation.cache.has(n)) {
    console.log(`Cache hit for ${n}`);
    return memoizedCalculation.cache.get(n);
  }

  console.log(`Computing for ${n}...`);
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += Math.sqrt(i);
  }

  // Lưu vào cache
  memoizedCalculation.cache.set(n, result);
  return result;
}
memoizedCalculation.cache = new Map();

memoizedCalculation(10); // "Computing for 10..." → tính 10 triệu lần
memoizedCalculation(10); // "Cache hit for 10" → trả về ngay!
memoizedCalculation(10); // "Cache hit for 10" → trả về ngay!
```

---

## 2. Generic Memoize Function

Thay vì thêm logic cache vào từng hàm, tạo một hàm `memoize` tổng quát:

### Cơ bản (1 tham số)

```js
function memoize(fn) {
  const cache = new Map();

  return function(arg) {
    if (cache.has(arg)) return cache.get(arg);

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

const memoizedSqrt = memoize(Math.sqrt);
memoizedSqrt(144); // Tính → 12
memoizedSqrt(144); // Cache hit → 12
```

### Nhiều tham số

```js
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args); // Chuyển args thành string key

    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const add = memoize((a, b) => {
  console.log('Computing...');
  return a + b;
});

add(1, 2); // "Computing..." → 3
add(1, 2); // Cache hit → 3
add(2, 3); // "Computing..." → 5
```

**Lưu ý:** `JSON.stringify` có hạn chế — không phân biệt được `undefined` vs key không tồn tại, mất function/Symbol, chậm với object lớn.

### Với giới hạn cache size (LRU-like)

```js
function memoize(fn, maxSize = 100) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Di chuyển lên đầu (Map duy trì insertion order)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn.apply(this, args);

    // Xóa entry cũ nhất nếu quá giới hạn
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, result);
    return result;
  };
}
```

---

## 3. Memoization cho Recursive Functions

Memoization đặc biệt mạnh với đệ quy vì **loại bỏ các lần tính lại trùng lặp**.

### Fibonacci không memo: O(2^n)

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2) ← tính 2 lần
│   │   └── fib(1)
│   └── fib(2) ← tính 2 lần
└── fib(3) ← tính 2 lần
    ├── fib(2) ← tính 2 lần
    └── fib(1)
```

### Fibonacci với memo: O(n)

```js
const fibonacci = memoize(function(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(50);  // 12586269025 — tính trong milliseconds
fibonacci(100); // 354224848179261915075n — cần BigInt cho số lớn thế này
```

Mỗi giá trị `fib(k)` chỉ tính **một lần**, các lần sau lấy từ cache → từ O(2^n) xuống O(n).

---

## 4. Khi nào KHÔNG nên Memoize

### Hàm impure

```js
// ❌ Kết quả phụ thuộc thời gian
const getTime = memoize(() => Date.now());
getTime(); // 1704067200000
getTime(); // 1704067200000 — sai! Luôn trả về kết quả lần đầu

// ❌ Kết quả phụ thuộc random
const getRandomCached = memoize(() => Math.random());
```

### Hàm với side effects

```js
// ❌ Side effect sẽ bị bỏ qua ở lần gọi cache hit
const fetchUser = memoize(async (id) => {
  console.log('Loading...'); // Side effect — không chạy khi cache hit
  return await fetch(`/api/users/${id}`);
});
```

### Khi input space quá lớn

```js
// ❌ Quá nhiều key khác nhau → cache chiếm nhiều bộ nhớ
const process = memoize((obj) => { /* ... */ });
// Mỗi object tạo 1 entry cache, có thể gây memory leak
```

---

## 5. Memoization trong thực tế

### React: useMemo & useCallback

```js
// useMemo — memoize giá trị tính toán
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]); // Chỉ tính lại khi a hoặc b thay đổi

// useCallback — memoize function
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Selector pattern (Redux/Reselect)

```js
import { createSelector } from 'reselect';

const getVisibleTodos = createSelector(
  [getTodos, getFilter],
  (todos, filter) => todos.filter(todo => /* ... */)
  // Chỉ tính lại khi todos hoặc filter thay đổi
);
```

### API caching

```js
const apiCache = new Map();

async function cachedFetch(url, ttl = 60000) {
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data; // Cache hit, chưa hết hạn
  }

  const response = await fetch(url);
  const data = await response.json();
  apiCache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

---

## 6. Tổng kết

| Tiêu chí | Nên memoize | Không nên |
|----------|------------|-----------|
| Pure function | ✅ | |
| Tính toán nặng | ✅ | |
| Gọi nhiều lần cùng input | ✅ | |
| Hàm impure (random, time) | | ❌ |
| Input space vô hạn | | ❌ |
| Hàm rất nhanh | | ❌ (overhead cache > benefit) |
