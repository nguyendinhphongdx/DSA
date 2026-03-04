# Error-handling Middleware

## 6. Error-handling Middleware

Error-handling middleware có **4 tham số**: `(err, req, res, next)`. Express nhận biết đây là error middleware nhờ có đủ 4 tham số.

### 6.1 Cơ bản

```javascript
// Route handler có lỗi
app.get('/api/error', (req, res, next) => {
  // Cách 1: Throw error (chỉ cho synchronous code)
  throw new Error('Lỗi đồng bộ!');

  // Cách 2: Gọi next(error) (cho cả sync và async)
  const error = new Error('Something went wrong');
  error.statusCode = 500;
  next(error);
});

// Async route handler
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error); // Chuyển lỗi cho error middleware
  }
});

// Error-handling middleware (PHẢI đặt sau tất cả routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Chỉ hiện stack trace trong development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 6.2 Nhiều error handlers

```javascript
// Error handler 1: Log error
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
  console.error(err.stack);
  next(err); // Chuyển cho error handler tiếp theo
});

// Error handler 2: Xử lý lỗi cụ thể
app.use((err, req, res, next) => {
  // Lỗi validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Lỗi duplicate key (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} đã tồn tại`
    });
  }

  // Lỗi cast (ID không hợp lệ - MongoDB)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `ID không hợp lệ: ${err.value}`
    });
  }

  next(err); // Chuyển cho error handler mặc định
});

// Error handler 3: Default (cuối cùng)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ'
  });
});
```

---
