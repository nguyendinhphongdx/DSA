# Promises

## Promise là gì?

Promise là một **object đại diện cho kết quả** của một tác vụ bất đồng bộ — kết quả đó có thể **chưa có** (pending), **thành công** (fulfilled), hoặc **thất bại** (rejected).

Hãy tưởng tượng Promise như **một phiếu đặt hàng**: bạn đặt cà phê → nhận phiếu → có thể làm việc khác trong khi chờ → khi cà phê xong, bạn được gọi lên lấy (fulfilled) hoặc được thông báo hết hàng (rejected).

---

## 1. Ba trạng thái của Promise

```
                    ┌──→ Fulfilled (resolve) → .then()
Pending (chờ) ──────┤
                    └──→ Rejected (reject)   → .catch()

                         └──→ .finally() (luôn chạy)
```

- **Pending**: Đang chờ kết quả (trạng thái ban đầu)
- **Fulfilled**: Thành công — `resolve(value)` được gọi
- **Rejected**: Thất bại — `reject(error)` được gọi
- **Settled**: Đã xong (fulfilled HOẶC rejected) — không thay đổi được nữa

---

## 2. Tạo Promise

```js
const promise = new Promise((resolve, reject) => {
  // Executor function — chạy NGAY LẬP TỨC khi tạo Promise

  const success = true;

  if (success) {
    resolve('Data loaded!');    // → fulfilled
  } else {
    reject(new Error('Failed!')); // → rejected
  }
});
```

### Ví dụ thực tế

```js
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Giả lập API call
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: 'Phong' });
      } else {
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}
```

### Promise tĩnh (Static methods tạo Promise)

```js
// Promise đã fulfilled ngay
Promise.resolve('Done');
Promise.resolve(42);

// Promise đã rejected ngay
Promise.reject(new Error('Oops'));
```

---

## 3. Xử lý kết quả: then, catch, finally

### .then(onFulfilled, onRejected)

Gắn callback khi Promise fulfilled (hoặc rejected).

```js
fetchUserData(1)
  .then(user => {
    console.log('User:', user); // { id: 1, name: 'Phong' }
  });
```

### .catch(onRejected)

Bắt lỗi — tương đương `.then(null, onRejected)` nhưng **dễ đọc hơn**.

```js
fetchUserData(-1)
  .then(user => console.log(user))
  .catch(error => console.error('Error:', error.message));
  // "Error: Invalid user ID"
```

### .finally(onFinally)

Chạy **dù thành công hay thất bại**. Thường dùng để cleanup (ẩn loading spinner, đóng connection...).

```js
showLoadingSpinner();

fetchUserData(1)
  .then(user => displayUser(user))
  .catch(error => showError(error))
  .finally(() => {
    hideLoadingSpinner(); // Luôn chạy
  });
```

---

## 4. Promise Chaining

`.then()` **trả về Promise mới** → có thể nối tiếp nhiều `.then()`. Đây là cách giải quyết callback hell.

```js
// Callback Hell ❌
getUser(id, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getProduct(orders[0].productId, (err, product) => { /* ... */ });
  });
});

// Promise Chaining ✅
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => getProduct(orders[0].productId))
  .then(product => console.log(product))
  .catch(err => console.error(err)); // Bắt lỗi ở BẤT KỲ bước nào
```

### Quy tắc quan trọng:

1. **Return value** từ `.then()` → giá trị đó được bọc trong Promise.resolve() và truyền cho `.then()` tiếp theo
2. **Return Promise** từ `.then()` → `.then()` tiếp theo chờ Promise đó settle
3. **Throw error** trong `.then()` → nhảy đến `.catch()` gần nhất

```js
Promise.resolve(1)
  .then(x => x + 1)           // Return 2
  .then(x => { throw new Error('Oops'); }) // Throw → nhảy đến catch
  .then(x => console.log(x))  // BỊ BỎ QUA
  .catch(err => {
    console.error(err.message); // "Oops"
    return 'recovered';         // Khôi phục → chain tiếp tục
  })
  .then(x => console.log(x)); // "recovered"
```

---

## 5. Xử lý lỗi

### Lỗi tự động bị catch

```js
new Promise((resolve) => {
  throw new Error('Error in executor'); // Tự chuyển thành reject
}).catch(err => console.error(err.message));

Promise.resolve('ok')
  .then(value => {
    throw new Error('Error in then'); // Tự chuyển thành rejected
  })
  .catch(err => console.error(err.message));
```

### Vị trí đặt .catch()

```js
// Catch ở cuối — bắt lỗi từ BẤT KỲ bước nào
step1()
  .then(step2)
  .then(step3)
  .catch(err => console.error(err)); // Bắt lỗi từ step1, step2, hoặc step3

// Catch ở giữa — khôi phục và tiếp tục
step1()
  .catch(err => defaultValue)  // Khôi phục nếu step1 lỗi
  .then(step2)                 // Vẫn chạy với defaultValue
  .catch(err => console.error(err));
```

### Unhandled Rejection — Lỗi nghiêm trọng!

Nếu Promise bị rejected mà **không có `.catch()`**, đó là "unhandled rejection" — có thể crash ứng dụng.

```js
// ❌ Unhandled rejection
Promise.reject(new Error('No catch!')); // Warning/Error trong console

// ✅ Luôn có catch
Promise.reject(new Error('Handled')).catch(() => {});

// Bắt global unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled:', event.reason);
  event.preventDefault();
});
```

---

## 6. Promise Combinators

### Promise.all() — Tất cả phải thành công

Chờ **tất cả** promises fulfilled. Nếu **bất kỳ** promise nào rejected → **reject ngay** (fail fast).

```js
const [users, posts, comments] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json()),
]);
// Tất cả chạy SONG SONG, nhanh hơn chạy tuần tự
```

### Promise.allSettled() — Chờ tất cả, không throw

Chờ **tất cả** promises settle, trả về mảng kết quả (cả fulfilled lẫn rejected).

```js
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/broken'),  // Có thể fail
  fetch('/api/posts'),
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Failed:', result.reason);
  }
});
```

### Promise.race() — Lấy kết quả đầu tiên

Trả về kết quả của promise **settle đầu tiên** (fulfilled HOẶC rejected).

```js
// Timeout pattern
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout!')), timeout)
    ),
  ]);
}
```

### Promise.any() — Lấy thành công đầu tiên

Trả về promise **fulfilled đầu tiên**. Chỉ reject khi **TẤT CẢ** rejected (AggregateError).

```js
// Lấy dữ liệu từ server nhanh nhất
const data = await Promise.any([
  fetch('https://cdn1.example.com/data'),
  fetch('https://cdn2.example.com/data'),
  fetch('https://cdn3.example.com/data'),
]);
```

---

## 7. Anti-patterns

```js
// ❌ Promise constructor anti-pattern
function fetchData() {
  return new Promise((resolve, reject) => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => reject(err));
  });
}

// ✅ Chỉ cần return promise
function fetchData() {
  return fetch('/api/data').then(res => res.json());
}
```

```js
// ❌ Không return trong .then()
getUser(1)
  .then(user => {
    getOrders(user.id); // Quên return! → .then tiếp không chờ kết quả
  })
  .then(orders => {
    console.log(orders); // undefined!
  });

// ✅ Luôn return
getUser(1)
  .then(user => {
    return getOrders(user.id); // Return Promise
  })
  .then(orders => {
    console.log(orders); // Có dữ liệu!
  });
```
