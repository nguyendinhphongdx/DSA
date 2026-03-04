# 05 - Async JavaScript

## 1. Event Loop

```
┌─────────────────────────┐
│       Call Stack         │  ← Thực thi code đồng bộ
├─────────────────────────┤
│                         │
│   Web APIs / Node APIs  │  ← setTimeout, fetch, DOM events...
│                         │
├─────────────────────────┤
│   Microtask Queue       │  ← Promise.then, queueMicrotask, MutationObserver
│   (ưu tiên cao hơn)     │
├─────────────────────────┤
│   Macrotask Queue       │  ← setTimeout, setInterval, I/O
│   (Task Queue)          │
└─────────────────────────┘
```

### Thứ tự thực thi
```js
console.log('1');                    // 1. Sync

setTimeout(() => console.log('2'), 0); // 4. Macrotask

Promise.resolve().then(() => {
  console.log('3');                  // 2. Microtask
});

queueMicrotask(() => console.log('4')); // 3. Microtask

console.log('5');                    // Sync

// Output: 1, 5, 3, 4, 2
```

## 2. Callbacks

```js
// Callback pattern
function fetchData(url, callback) {
  // giả lập async
  setTimeout(() => {
    callback(null, { data: 'result' });
  }, 1000);
}

// Callback Hell (Pyramid of Doom)
getUser(id, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getProduct(orders[0].productId, (err, product) => {
      // Nested hell...
    });
  });
});
```

## 3. Promises

```js
// Tạo Promise
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) resolve('Done!');
  else reject(new Error('Failed!'));
});

// Sử dụng
promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Cleanup'));

// Chaining
fetch('/api/users')
  .then(res => res.json())
  .then(users => fetch(`/api/users/${users[0].id}`))
  .then(res => res.json())
  .then(user => console.log(user))
  .catch(err => console.error(err));
```

### Promise States
- **Pending**: Đang chờ
- **Fulfilled**: Thành công (resolve)
- **Rejected**: Thất bại (reject)
- **Settled**: Đã hoàn thành (fulfilled hoặc rejected)

## 4. Async/Await

```js
// Async function luôn trả về Promise
async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    return users;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Top-level await (trong ES modules)
const data = await fetch('/api').then(r => r.json());
```

## 5. Error Handling bất đồng bộ

```js
// try/catch với async/await
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError) {
      console.error('Network error');
    } else {
      console.error('Request failed:', err.message);
    }
    return null;
  }
}

// Utility: wrap async function
function tryCatch(fn) {
  return async (...args) => {
    try {
      return [await fn(...args), null];
    } catch (error) {
      return [null, error];
    }
  };
}

const [data, error] = await tryCatch(fetchUsers)();
```

## 6. Generators & Iterators

```js
// Generator function
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Infinite generator
function* idGenerator() {
  let id = 1;
  while (true) yield id++;
}

// Async generator
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}`);
    const data = await res.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

for await (const page of fetchPages('/api/items')) {
  console.log(page);
}
```

## 7. Promise Combinators

```js
const p1 = fetch('/api/users');
const p2 = fetch('/api/posts');
const p3 = fetch('/api/comments');

// Promise.all - Tất cả phải thành công
const [users, posts, comments] = await Promise.all([p1, p2, p3]);

// Promise.allSettled - Chờ tất cả, không throw
const results = await Promise.allSettled([p1, p2, p3]);
// [{ status: 'fulfilled', value }, { status: 'rejected', reason }]

// Promise.race - Lấy kết quả đầu tiên (fulfilled hoặc rejected)
const fastest = await Promise.race([p1, p2, p3]);

// Promise.any - Lấy fulfilled đầu tiên (bỏ qua rejected)
const firstSuccess = await Promise.any([p1, p2, p3]);
```
