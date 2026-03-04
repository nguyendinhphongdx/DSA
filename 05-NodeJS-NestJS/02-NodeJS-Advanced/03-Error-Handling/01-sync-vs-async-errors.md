# Synchronous vs Asynchronous Errors

## 1. Tổng quan về Error Handling

### Tại sao Error Handling quan trọng?

Error handling là một trong những khía cạnh quan trọng nhất khi xây dựng ứng dụng production. Nếu không xử lý lỗi đúng cách:

1. **Server crash**: Một lỗi chưa xử lý có thể làm sập toàn bộ server
2. **Rò rỉ thông tin**: Stack traces có thể lộ cấu trúc code, đường dẫn server
3. **Trải nghiệm người dùng kém**: Client nhận được response không rõ ràng
4. **Khó debug**: Không biết lỗi xảy ra ở đâu, khi nào, vì sao

### Nguyên tắc cốt lõi

| Nguyên tắc | Mô tả |
|-------------|--------|
| **Fail gracefully** | Ứng dụng phải xử lý lỗi mượt mà, không crash |
| **Centralized** | Xử lý lỗi tại một nơi, không rải rác khắp code |
| **Informative** | Trả về thông tin hữu ích cho client, chi tiết cho developer |
| **Secure** | Không lộ thông tin nhạy cảm (stack trace, DB credentials, ...) |
| **Logged** | Mọi lỗi phải được ghi log để debug |

---

## 2. Synchronous vs Asynchronous Errors

### 2.1 Synchronous Errors

Express tự động bắt lỗi synchronous và chuyển cho error middleware.

```javascript
// Express TỰ ĐỘNG bắt synchronous errors
app.get('/api/sync-error', (req, res) => {
  throw new Error('Lỗi đồng bộ!');
  // Express sẽ tự động gọi next(error) → error middleware
});

// Ví dụ khác
app.get('/api/parse', (req, res) => {
  const data = JSON.parse('invalid json'); // Throw SyntaxError
  // Express bắt được lỗi này
  res.json(data);
});

// Error middleware sẽ nhận được lỗi
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});
```

### 2.2 Asynchronous Errors

Express **KHÔNG TỰ ĐỘNG** bắt lỗi asynchronous. Đây là nguồn gốc của rất nhiều bug.

```javascript
// SAI - Express KHÔNG bắt được lỗi này!
app.get('/api/users', (req, res) => {
  setTimeout(() => {
    throw new Error('Lỗi trong callback');
    // Lỗi này sẽ crash server!
  }, 100);
});

// SAI - Promise rejection không được bắt
app.get('/api/users', (req, res) => {
  User.find().then(users => {
    res.json(users);
  });
  // Nếu User.find() reject, lỗi sẽ không được xử lý!
});

// SAI - async/await không có try/catch
app.get('/api/users', async (req, res) => {
  const users = await User.find(); // Nếu lỗi → UnhandledPromiseRejection
  res.json(users);
});
```

**Giải pháp:**

```javascript
// ĐÚNG 1: try/catch
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error); // Chuyển cho error middleware
  }
});

// ĐÚNG 2: Promise .catch()
app.get('/api/users', (req, res, next) => {
  User.find()
    .then(users => res.json(users))
    .catch(next); // Shorthand cho .catch(err => next(err))
});

// ĐÚNG 3: Async handler wrapper (KHUYẾN NGHỊ)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

---

## 3. try/catch trong Async Handlers

### 3.1 Pattern cơ bản

```javascript
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
```

### 3.2 Async Handler Wrapper

Pattern phổ biến nhất để tránh lặp try/catch:

```javascript
// utils/asyncHandler.js

// Cách 1: Simple
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Cách 2: Với thêm tính năng
const asyncHandler = (fn) => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch((error) => {
      // Thêm thông tin context vào error
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
  };
};

module.exports = asyncHandler;
```

```javascript
// Sử dụng - Không cần try/catch!
const asyncHandler = require('../utils/asyncHandler');

// Trước (với try/catch)
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Sau (với asyncHandler) - Gọn hơn nhiều
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

// Nếu User.find() throw error, asyncHandler sẽ tự động gọi next(error)
```

### 3.3 try/catch cho nhiều operations

```javascript
app.post('/api/orders', asyncHandler(async (req, res) => {
  // Nhiều operations có thể fail
  const user = await User.findById(req.body.userId);
  if (!user) throw new AppError('User không tồn tại', 404);

  const product = await Product.findById(req.body.productId);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  if (product.stock < req.body.quantity) {
    throw new AppError('Không đủ hàng trong kho', 400);
  }

  // Tạo order
  const order = await Order.create({
    user: user._id,
    product: product._id,
    quantity: req.body.quantity,
    totalPrice: product.price * req.body.quantity
  });

  // Cập nhật stock
  product.stock -= req.body.quantity;
  await product.save();

  // Gửi email
  await sendOrderConfirmation(user.email, order);

  res.status(201).json({ success: true, data: order });
  // Bất kỳ lỗi nào trong các operations trên đều được asyncHandler bắt
}));
```

---
