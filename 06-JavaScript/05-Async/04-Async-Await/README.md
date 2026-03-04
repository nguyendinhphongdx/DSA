# Async/Await

## Async/Await là gì?

Async/Await (ES2017) là **syntax sugar** cho Promises — giúp viết code bất đồng bộ trông giống code đồng bộ, dễ đọc và dễ hiểu hơn rất nhiều.

- `async` biến hàm thành hàm trả về **Promise**
- `await` **tạm dừng** hàm cho đến khi Promise settle, rồi trả về giá trị

---

## 1. Cú pháp cơ bản

### async function

```js
// Hàm async LUÔN trả về Promise
async function greet() {
  return 'Hello'; // Tự bọc trong Promise.resolve('Hello')
}

greet().then(msg => console.log(msg)); // 'Hello'

// Tương đương:
function greet() {
  return Promise.resolve('Hello');
}
```

### await

`await` chỉ dùng được **bên trong async function**. Nó tạm dừng hàm cho đến khi Promise fulfilled, rồi trả về giá trị resolved.

```js
async function fetchUser() {
  const response = await fetch('/api/user'); // Chờ fetch xong
  const user = await response.json();        // Chờ parse JSON xong
  return user;
}
```

### So sánh Promise chain vs async/await

```js
// Promise chain
function getUserPosts(userId) {
  return getUser(userId)
    .then(user => getPosts(user.id))
    .then(posts => posts.filter(p => p.published))
    .catch(err => console.error(err));
}

// async/await — dễ đọc hơn nhiều
async function getUserPosts(userId) {
  try {
    const user = await getUser(userId);
    const posts = await getPosts(user.id);
    return posts.filter(p => p.published);
  } catch (err) {
    console.error(err);
  }
}
```

---

## 2. Xử lý lỗi

### try/catch

```js
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Bắt lỗi từ fetch (network) VÀ throw (HTTP status)
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request failed:', error.message);
    }
    return null;
  } finally {
    hideLoadingSpinner();
  }
}
```

### Wrapper function (Error-first tuple)

Tránh try/catch lặp đi lặp lại:

```js
async function to(promise) {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    return [null, error];
  }
}

// Sử dụng
const [user, error] = await to(fetchUser(1));
if (error) {
  console.error('Failed:', error.message);
  return;
}
console.log('User:', user);
```

---

## 3. Tuần tự vs Song song

### Tuần tự (Sequential) — chờ từng cái

```js
// ❌ Chậm — mỗi request chờ cái trước xong mới bắt đầu
async function loadData() {
  const users = await fetch('/api/users').then(r => r.json());  // 1s
  const posts = await fetch('/api/posts').then(r => r.json());  // 1s
  const comments = await fetch('/api/comments').then(r => r.json()); // 1s
  // Tổng: ~3 giây
  return { users, posts, comments };
}
```

### Song song (Parallel) — chạy cùng lúc

```js
// ✅ Nhanh — tất cả requests chạy đồng thời
async function loadData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),    // 1s ┐
    fetch('/api/posts').then(r => r.json()),    // 1s ├─ Song song
    fetch('/api/comments').then(r => r.json()), // 1s ┘
  ]);
  // Tổng: ~1 giây (thời gian request lâu nhất)
  return { users, posts, comments };
}
```

### Khi nào tuần tự, khi nào song song?

- **Tuần tự**: Khi request sau **phụ thuộc** vào kết quả request trước
- **Song song**: Khi các requests **độc lập** với nhau

```js
async function example() {
  // Song song — user và settings không liên quan
  const [user, settings] = await Promise.all([
    fetchUser(id),
    fetchSettings(),
  ]);

  // Tuần tự — orders phụ thuộc vào user
  const orders = await fetchOrders(user.id);
  const details = await fetchOrderDetails(orders[0].id);
}
```

---

## 4. Async/Await với vòng lặp

### ❌ forEach KHÔNG hoạt động với await

```js
// ❌ Sai! forEach không chờ await
const ids = [1, 2, 3];
ids.forEach(async (id) => {
  const user = await fetchUser(id);
  console.log(user); // Thứ tự không đảm bảo, code ngoài forEach không chờ
});
console.log('Done'); // Chạy TRƯỚC khi các fetchUser hoàn thành!
```

### ✅ for...of — Tuần tự

```js
for (const id of ids) {
  const user = await fetchUser(id); // Chờ từng cái
  console.log(user);
}
console.log('Done'); // Chạy SAU khi tất cả hoàn thành
```

### ✅ Promise.all + map — Song song

```js
const users = await Promise.all(
  ids.map(id => fetchUser(id))
);
console.log(users); // Tất cả users, chạy song song
```

### ✅ for await...of — Async Iterables

```js
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

for await (const pageData of fetchPages('/api/items')) {
  console.log('Page:', pageData);
}
```

---

## 5. Top-level await (ES2022)

Trước đây, `await` chỉ dùng trong `async function`. Từ ES2022, dùng được ở **top level** trong ES Modules.

```js
// module.js (ES Module)
const config = await fetch('/config.json').then(r => r.json());
export default config;

// Trước ES2022, phải dùng async IIFE
(async () => {
  const config = await fetch('/config.json').then(r => r.json());
  // ...
})();
```

---

## 6. Patterns thường dùng

### Retry

```js
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
```

### Timeout

```js
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Concurrent limit

```js
async function parallelLimit(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const promise = task().then(result => {
      executing.delete(promise);
      return result;
    });
    executing.add(promise);
    results.push(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Tối đa 3 requests cùng lúc
await parallelLimit(
  urls.map(url => () => fetch(url)),
  3
);
```
