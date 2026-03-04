# Express Error Middleware Pattern

## 4. Express Error Middleware

### 4.1 Cu phap

Error middleware trong Express co **4 tham so**. Express nhan dien no qua so luong tham so.

```javascript
// PHAI co du 4 tham so, ke ca khi khong dung next
app.use((err, req, res, next) => {
  // Xu ly loi
});
```

### 4.2 Error middleware day du

```javascript
// middlewares/error.middleware.js

const errorHandler = (err, req, res, next) => {
  // 1. Log error
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // 2. Xac dinh status code
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // 3. Xu ly cac loai loi cu the
  // Mongoose CastError (ID khong hop le)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Gia tri khong hop le cho ${err.path}: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join('. ');
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Gia tri '${err.keyValue[field]}' cho truong '${field}' da ton tai`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token khong hop le';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token da het han';
  }

  // SyntaxError (JSON parse error)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON khong hop le trong request body';
  }

  // 4. Gui response
  const response = {
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  };

  // Chi gui stack trace trong development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

### 4.3 Dat error middleware dung vi tri

```javascript
// app.js
const express = require('express');
const app = express();

// 1. Parse middleware
app.use(express.json());

// 2. Cac middleware khac
app.use(cors());
app.use(morgan('dev'));

// 3. Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 4. 404 handler (sau tat ca routes)
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} khong ton tai`, 404));
});

// 5. Error middleware (CUOI CUNG - sau tat ca routes va middleware)
app.use(errorHandler);

module.exports = app;
```

---
