# Parallel & Concurrency

## Concurrency vs Parallelism

Hai khái niệm thường bị nhầm lẫn:

- **Concurrency** (Đồng thời): Xử lý **nhiều tác vụ** trong cùng khoảng thời gian bằng cách **chuyển đổi** giữa chúng. Giống một đầu bếp nấu 3 món — luân phiên chú ý mỗi món.

- **Parallelism** (Song song): **Nhiều tác vụ** chạy **cùng lúc** trên **nhiều luồng/CPU**. Giống 3 đầu bếp mỗi người nấu 1 món.

**JavaScript single-thread** → chỉ có **concurrency**, không có parallelism (trừ khi dùng Web Workers).

---

## 1. Promise.all() — Chạy tất cả, cần tất cả thành công

Bắt đầu tất cả promises **cùng lúc**, chờ **tất cả** hoàn thành. **Fail fast**: nếu bất kỳ promise nào rejected → reject ngay, không chờ các promise khác.

```js
async function loadDashboard() {
  const [users, stats, notifications] = await Promise.all([
    fetchUsers(),        // ~500ms
    fetchStats(),        // ~800ms
    fetchNotifications() // ~300ms
  ]);
  // Tổng thời gian: ~800ms (thời gian promise LÂU NHẤT)
  // Nếu tuần tự: ~1600ms (500 + 800 + 300)

  return { users, stats, notifications };
}
```

**Khi nào dùng:** Cần TẤT CẢ kết quả, và nếu bất kỳ request nào thất bại thì cả tác vụ coi như thất bại.

---

## 2. Promise.allSettled() — Chạy tất cả, chấp nhận cả thất bại

Chờ **tất cả** promises settle, trả về mảng kết quả bất kể thành công hay thất bại.

```js
async function loadWithFallbacks() {
  const results = await Promise.allSettled([
    fetchUsers(),
    fetchStats(),         // Có thể fail
    fetchNotifications(), // Có thể fail
  ]);

  const data = {};
  results.forEach((result, index) => {
    const keys = ['users', 'stats', 'notifications'];
    if (result.status === 'fulfilled') {
      data[keys[index]] = result.value;
    } else {
      data[keys[index]] = null; // Fallback
      console.warn(`${keys[index]} failed:`, result.reason.message);
    }
  });

  return data;
}
```

**Khi nào dùng:** Muốn lấy kết quả tốt nhất có thể, chấp nhận một số thất bại.

---

## 3. Promise.race() — Ai nhanh hơn thắng

Trả về kết quả của promise **settle đầu tiên** (fulfilled HOẶC rejected).

```js
// Timeout pattern
async function fetchWithTimeout(url, ms = 5000) {
  return Promise.race([
    fetch(url).then(r => r.json()),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

// Cache race: lấy từ cache hoặc network, ai nhanh hơn
async function cacheFirst(url) {
  return Promise.race([
    caches.match(url).then(r => r?.json()),
    fetch(url).then(r => r.json()),
  ]);
}
```

**Khi nào dùng:** Timeout, lấy kết quả nhanh nhất từ nhiều nguồn.

---

## 4. Promise.any() — Lấy thành công đầu tiên

Trả về promise **fulfilled đầu tiên**. Chỉ reject khi **TẤT CẢ** rejected (AggregateError).

```js
// Lấy từ CDN nhanh nhất
async function fetchFromFastestCDN(path) {
  return Promise.any([
    fetch(`https://cdn1.example.com${path}`),
    fetch(`https://cdn2.example.com${path}`),
    fetch(`https://cdn3.example.com${path}`),
  ]);
}

// Xử lý khi tất cả thất bại
try {
  const result = await Promise.any([p1, p2, p3]);
} catch (error) {
  // error là AggregateError
  console.log(error.errors); // Array of all rejection reasons
}
```

**Khi nào dùng:** Cần ít nhất 1 thành công từ nhiều nguồn.

---

## 5. So sánh nhanh

| Method | Resolves khi | Rejects khi | Dùng khi |
|--------|-------------|-------------|----------|
| `Promise.all` | **Tất cả** fulfilled | **Bất kỳ** rejected | Cần tất cả kết quả |
| `Promise.allSettled` | **Tất cả** settled | Không bao giờ reject | OK với một số thất bại |
| `Promise.race` | **Bất kỳ** settled | **Bất kỳ** rejected (nếu nhanh nhất) | Timeout, fastest wins |
| `Promise.any` | **Bất kỳ** fulfilled | **Tất cả** rejected | Cần ít nhất 1 thành công |

---

## 6. Controlled Concurrency

Đôi khi bạn có hàng trăm requests nhưng không muốn gửi **tất cả cùng lúc** (server quá tải, rate limiting). Cần giới hạn số requests đồng thời.

```js
async function parallelLimit(tasks, concurrency) {
  const results = [];
  const executing = [];

  for (const [index, task] of tasks.entries()) {
    const promise = Promise.resolve().then(() => task());
    results[index] = promise;

    const cleanup = promise.then(() => {
      executing.splice(executing.indexOf(cleanup), 1);
    });
    executing.push(cleanup);

    if (executing.length >= concurrency) {
      await Promise.race(executing); // Chờ 1 task xong trước khi thêm task mới
    }
  }

  return Promise.all(results);
}

// Fetch 100 URLs, tối đa 5 cùng lúc
const urls = Array.from({ length: 100 }, (_, i) => `/api/item/${i}`);
const tasks = urls.map(url => () => fetch(url).then(r => r.json()));

const results = await parallelLimit(tasks, 5);
```

---

## 7. Web Workers — Parallelism thật sự

Để chạy code **thật sự song song** (trên thread riêng), dùng Web Workers.

```js
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ type: 'calculate', data: largeArray });

worker.onmessage = (event) => {
  console.log('Result from worker:', event.data);
};

// worker.js
self.onmessage = (event) => {
  const { type, data } = event.data;
  if (type === 'calculate') {
    const result = heavyCalculation(data); // Chạy trên thread riêng
    self.postMessage(result);
  }
};
```

**Khi nào dùng Web Workers:**
- Tính toán nặng CPU (image processing, parsing, encryption)
- Không muốn block UI thread
- Tác vụ không cần truy cập DOM
