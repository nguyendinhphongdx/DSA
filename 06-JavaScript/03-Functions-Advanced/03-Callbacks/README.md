# Callbacks

## Callback là gì?

Callback là một hàm được **truyền làm argument** cho hàm khác, và sẽ được **gọi lại (called back)** tại một thời điểm nào đó — có thể ngay lập tức (synchronous) hoặc sau này (asynchronous).

Callback là **pattern cơ bản nhất** để xử lý bất đồng bộ trong JavaScript, trước khi có Promise và async/await.

---

## 1. Synchronous Callbacks

Callback được gọi **ngay lập tức** trong quá trình thực thi hàm.

```js
// Array methods dùng synchronous callbacks
[1, 2, 3].forEach(item => console.log(item));     // Callback chạy ngay
[1, 2, 3].map(item => item * 2);                  // Callback chạy ngay
[3, 1, 2].sort((a, b) => a - b);                  // Callback chạy ngay

// Custom function với sync callback
function processArray(arr, callback) {
  const results = [];
  for (const item of arr) {
    results.push(callback(item));
  }
  return results;
}

processArray([1, 2, 3], x => x ** 2);  // [1, 4, 9]
```

---

## 2. Asynchronous Callbacks

Callback được gọi **sau này**, khi một tác vụ bất đồng bộ hoàn thành.

```js
// setTimeout — gọi callback sau n milliseconds
console.log('Bắt đầu');
setTimeout(() => {
  console.log('Sau 2 giây');
}, 2000);
console.log('Tiếp tục'); // Chạy TRƯỚC "Sau 2 giây"
// Output: Bắt đầu → Tiếp tục → (2s) → Sau 2 giây

// Event listeners
document.getElementById('btn').addEventListener('click', () => {
  console.log('Button clicked!'); // Gọi khi user click
});

// File I/O (Node.js)
const fs = require('fs');
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('File content:', data);
});
```

---

## 3. Error-First Callback Pattern

Đây là **convention** trong Node.js: callback luôn nhận `error` làm tham số **đầu tiên**. Nếu không có lỗi, `error` là `null`.

```js
function fetchUser(id, callback) {
  // Giả lập async operation
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error('Invalid ID'), null);  // Lỗi
      return;
    }
    callback(null, { id, name: 'Phong' });      // Thành công
  }, 1000);
}

// Sử dụng
fetchUser(1, (error, user) => {
  if (error) {
    console.error('Failed:', error.message);
    return;
  }
  console.log('User:', user);
});
```

**Tại sao error first?** Vì nếu đặt error sau, lập trình viên có thể lười bỏ qua nó. Đặt error đầu tiên **ép buộc** phải xử lý lỗi trước.

---

## 4. Callback Hell (Pyramid of Doom)

Khi có nhiều tác vụ bất đồng bộ **phụ thuộc nhau**, callbacks lồng vào nhau tạo thành "kim tự tháp" rất khó đọc và maintain.

```js
// ❌ Callback Hell
getUser(userId, (err, user) => {
  if (err) { handleError(err); return; }

  getOrders(user.id, (err, orders) => {
    if (err) { handleError(err); return; }

    getOrderDetails(orders[0].id, (err, details) => {
      if (err) { handleError(err); return; }

      getProduct(details.productId, (err, product) => {
        if (err) { handleError(err); return; }

        getReviews(product.id, (err, reviews) => {
          if (err) { handleError(err); return; }

          console.log('Finally got reviews:', reviews);
          // 5 cấp lồng nhau, rất khó đọc!
        });
      });
    });
  });
});
```

### Vấn đề của Callback Hell

1. **Khó đọc**: Code dịch chuyển sang phải liên tục (pyramid)
2. **Khó maintain**: Thêm/sửa/xóa bước rất phiền
3. **Xử lý lỗi lặp lại**: Mỗi cấp phải check `if (err)` riêng
4. **Khó test**: Logic business trộn lẫn với logic control flow

---

## 5. Giải pháp cho Callback Hell

### Cách 1: Tách thành Named Functions

```js
function handleReviews(err, reviews) {
  if (err) return handleError(err);
  console.log('Reviews:', reviews);
}

function handleProduct(err, product) {
  if (err) return handleError(err);
  getReviews(product.id, handleReviews);
}

function handleDetails(err, details) {
  if (err) return handleError(err);
  getProduct(details.productId, handleProduct);
}

function handleOrders(err, orders) {
  if (err) return handleError(err);
  getOrderDetails(orders[0].id, handleDetails);
}

function handleUser(err, user) {
  if (err) return handleError(err);
  getOrders(user.id, handleOrders);
}

getUser(userId, handleUser);
```

Code phẳng hơn nhưng vẫn **khó theo dõi luồng** vì phải nhảy giữa các hàm.

### Cách 2: Dùng Promises (giải pháp chính)

```js
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => getProduct(details.productId))
  .then(product => getReviews(product.id))
  .then(reviews => console.log('Reviews:', reviews))
  .catch(err => handleError(err));
```

### Cách 3: async/await (giải pháp tốt nhất)

```js
async function getProductReviews(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    const product = await getProduct(details.productId);
    const reviews = await getReviews(product.id);
    return reviews;
  } catch (err) {
    handleError(err);
  }
}
```

---

## 6. Chuyển đổi Callback → Promise (Promisification)

Khi cần dùng async/await với API dùng callback cũ:

```js
// Hàm callback-based cũ
function fetchData(id, callback) {
  setTimeout(() => callback(null, { id, data: 'result' }), 1000);
}

// Chuyển thành Promise
function fetchDataPromise(id) {
  return new Promise((resolve, reject) => {
    fetchData(id, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Hoặc dùng util.promisify (Node.js)
const { promisify } = require('util');
const fetchDataPromise = promisify(fetchData);

// Giờ dùng được async/await
const data = await fetchDataPromise(1);
```

---

## 7. Khi nào vẫn dùng Callback?

Mặc dù Promise/async-await đã thay thế callback cho hầu hết trường hợp bất đồng bộ, callback vẫn phù hợp cho:

1. **Synchronous callbacks**: `map`, `filter`, `sort`, `forEach`...
2. **Event listeners**: `addEventListener`, `on('click', ...)` — vì events có thể fire nhiều lần, không phải "một lần rồi xong" như Promise
3. **Streams** (Node.js): xử lý data từng chunk
4. **Libraries/APIs cũ** chưa hỗ trợ Promise
