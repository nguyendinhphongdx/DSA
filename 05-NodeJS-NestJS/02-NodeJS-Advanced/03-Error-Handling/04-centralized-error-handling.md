# Centralized Error Handling

## 6. Centralized Error Handling

### Cấu trúc hoàn chỉnh

```
src/
├── utils/
│   ├── errors.js         # Custom error classes
│   └── asyncHandler.js   # Async wrapper
├── middlewares/
│   └── error.middleware.js  # Centralized error handler
└── app.js
```

### Error Handler hoàn chỉnh

```javascript
// middlewares/error.middleware.js
const { AppError } = require('../utils/errors');

// ===== Xử lý lỗi cụ thể từ MongoDB/Mongoose =====
const handleCastErrorDB = (err) => {
  return new AppError(`Giá trị không hợp lệ '${err.value}' cho trường '${err.path}'`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Giá trị '${value}' cho trường '${field}' đã tồn tại. Vui lòng sử dụng giá trị khác.`, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));
  const error = new AppError('Dữ liệu không hợp lệ', 422);
  error.errors = errors;
  return error;
};

// ===== Xử lý lỗi JWT =====
const handleJWTError = () => {
  return new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
};

// ===== Response cho Development =====
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    errors: err.errors || undefined,
    stack: err.stack
  });
};

// ===== Response cho Production =====
const sendErrorProd = (err, req, res) => {
  // Operational error: gửi message cho client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors || undefined
    });
  }

  // Programming error: không leak chi tiết
  console.error('PROGRAMMING ERROR:', err);
  res.status(500).json({
    success: false,
    status: 'error',
    message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
  });
};

// ===== Main Error Handler =====
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    // Tạo copy để không thay đổi error gốc
    let error = { ...err, message: err.message, name: err.name };

    // Transform các lỗi cụ thể
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

module.exports = errorHandler;
```

---

## 7. Operational Errors vs Programming Errors

### Phân biệt

| | Operational Errors | Programming Errors |
|---|---|---|
| **Nguyên nhân** | Dự đoán được, do hoàn cảnh | Bug trong code |
| **Ví dụ** | Invalid input, DB timeout, File not found | TypeError, null reference, logic error |
| **Xử lý** | Trả lỗi phù hợp cho client | Fix code, restart nếu cần |
| **isOperational** | `true` | `false` |

### Operational Errors (Lỗi vận hành)

```javascript
// Đây là operational errors - xảy ra trong quá trình hoạt động bình thường
// Ta CÓ THỂ dự đoán và xử lý chúng

// 1. Input không hợp lệ
throw new BadRequestError('Email không đúng format');

// 2. Resource không tìm thấy
throw new NotFoundError('User', '507f1f77bcf86cd799439011');

// 3. Không có quyền truy cập
throw new ForbiddenError('Bạn không có quyền xóa user này');

// 4. Database connection timeout
// → Retry hoặc trả về 503 Service Unavailable

// 5. External API down
// → Retry hoặc fallback

// 6. File không tồn tại
// → Trả về 404

// 7. Rate limit exceeded
throw new TooManyRequestsError();
```

### Programming Errors (Lỗi lập trình)

```javascript
// Đây là bugs - KHÔNG nên xảy ra
// Cách xử lý: FIX CODE, không phải xử lý runtime

// 1. TypeError
const user = null;
user.name; // TypeError: Cannot read properties of null

// 2. ReferenceError
console.log(undefinedVariable); // ReferenceError

// 3. Logic error
const discount = price * -1; // Discount âm?

// 4. Quên await
const user = User.findById(id); // Thiếu await, user là Promise object
res.json(user); // Gửi Promise thay vì data

// 5. Sai assertion
assert(user.age > 0); // AssertionError nếu age <= 0
```

### Xử lý khác nhau

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mặc định là operational
    Error.captureStackTrace(this, this.constructor);
  }
}

// Trong error handler
const errorHandler = (err, req, res, next) => {
  // Operational error: Trả message cho client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Programming error: Log chi tiết, trả message chung chung
  console.error('CRITICAL PROGRAMMING ERROR:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Request:', req.method, req.originalUrl);
  console.error('Body:', JSON.stringify(req.body));

  // Gửi alert cho team (email, Slack, ...)
  // alertTeam(err);

  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống. Đội kỹ thuật đã được thông báo.'
  });
};
```

---

## 8. Unhandled Rejection và Uncaught Exception

### 8.1 Unhandled Promise Rejection

Xảy ra khi một Promise bị reject nhưng không có `.catch()` hoặc `try/catch`.

```javascript
// server.js
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===== Xử lý Unhandled Promise Rejection =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);

  // Đóng server gracefully
  server.close(() => {
    process.exit(1); // 1 = failure
  });

  // Force shutdown sau 10 giây nếu graceful shutdown thất bại
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
});
```

### 8.2 Uncaught Exception

Xảy ra khi có synchronous error không được bắt.

```javascript
// ===== Xử lý Uncaught Exception =====
// PHẢI đặt ở ĐẦU file, trước mọi code khác
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error.name);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);

  // PHẢI exit! State của ứng dụng đã không còn đáng tin cậy
  process.exit(1);
});

// Sau đó mới require các module khác
const app = require('./app');
```

### 8.3 SIGTERM và SIGINT

```javascript
// server.js - Hoàn chỉnh
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  gracefulShutdown('UNHANDLED REJECTION');
});

// SIGTERM (Heroku, Docker, Kubernetes gửi signal này khi muốn stop)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  gracefulShutdown('SIGTERM');
});

// SIGINT (Ctrl+C trong terminal)
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  gracefulShutdown('SIGINT');
});

// Hàm graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  // 1. Ngừng nhận request mới
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');

      // 2. Đóng database connections
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      } catch (err) {
        console.error('Error closing MongoDB:', err);
      }

      // 3. Exit
      console.log('Graceful shutdown completed.');
      process.exit(0);
    });
  }

  // Force exit sau 30 giây
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};
```

---
