# Error Handling trong Async JavaScript

## Tại sao xử lý lỗi async khác?

Lỗi trong code đồng bộ được bắt bởi `try/catch` thông thường. Nhưng lỗi trong code bất đồng bộ xảy ra ở **thời điểm khác** — khi callback/promise được xử lý — nên `try/catch` thông thường **không bắt được**.

```js
// ❌ try/catch KHÔNG bắt được lỗi async
try {
  setTimeout(() => {
    throw new Error('Async error!');
  }, 1000);
} catch (err) {
  // KHÔNG BAO GIỜ chạy đến đây!
  console.error(err);
}
// → Uncaught Error: Async error!
```

---

## 1. Xử lý lỗi với Promises

### .catch()

```js
fetch('/api/data')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => processData(data))
  .catch(err => {
    // Bắt lỗi từ BẤT KỲ .then() nào phía trên
    console.error('Error:', err.message);
  });
```

### Vị trí .catch() quan trọng

```js
// Catch cuối: bắt tất cả
step1().then(step2).then(step3).catch(handleError);

// Catch giữa: khôi phục rồi tiếp tục
step1()
  .catch(err => fallbackValue)  // Khôi phục step1
  .then(step2)                   // Vẫn chạy
  .catch(handleError);           // Bắt lỗi step2
```

---

## 2. Xử lý lỗi với async/await

### try/catch cơ bản

```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`User not found (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error('Failed to load user:', error.message);
    return null; // Fallback value
  }
}
```

### Phân loại lỗi

```js
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error (offline, DNS fail, CORS)
      console.error('Network error — check your connection');
    } else if (error instanceof HttpError) {
      // HTTP error (4xx, 5xx)
      if (error.status === 404) console.error('Resource not found');
      else if (error.status === 401) console.error('Unauthorized');
      else console.error(`Server error: ${error.status}`);
    } else if (error instanceof SyntaxError) {
      // JSON parse error
      console.error('Invalid JSON response');
    } else {
      // Unknown error
      throw error; // Re-throw nếu không biết xử lý
    }
  }
}

// Custom Error class
class HttpError extends Error {
  constructor(status, statusText) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
  }
}
```

---

## 3. Global Error Handlers

### Browser

```js
// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  // Gửi lên error tracking service
  event.preventDefault(); // Ngăn console error mặc định
});

// Uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});
```

### Node.js

```js
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); // Nên thoát vì state có thể bị hỏng
});
```

---

## 4. Patterns thực tế

### Error boundary (React-style)

```js
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error('Error caught by boundary:', error);
    return typeof fallback === 'function' ? fallback(error) : fallback;
  }
}

const user = await withErrorBoundary(
  () => fetchUser(1),
  { name: 'Guest', role: 'anonymous' } // Fallback value
);
```

### Retry with backoff

```js
async function retry(fn, { maxAttempts = 3, baseDelay = 1000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const delay = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const data = await retry(() => fetch('/api/data').then(r => r.json()));
```

---

## 5. Best Practices

1. **Luôn xử lý lỗi** — mọi Promise chain cần `.catch()`, mọi `await` cần `try/catch`
2. **Không nuốt lỗi im lặng** — ít nhất phải log, tốt nhất là báo cho user
3. **Phân loại lỗi** — xử lý khác nhau cho network error, validation error, server error
4. **Re-throw lỗi không xử lý được** — đừng catch rồi bỏ qua lỗi bạn không hiểu
5. **Dùng custom Error classes** — chứa thêm context (statusCode, field name...)
6. **Đặt global error handlers** — bắt những lỗi lọt lưới
7. **Cleanup trong finally** — đóng connection, ẩn loading, giải phóng resources
