# Custom Error Classes

## 5. Custom Error Classes

### 5.1 AppError - Base Error Class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Danh dau la operational error

    // Capture stack trace, loai bo constructor call khoi stack
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

**Su dung:**

```javascript
const AppError = require('../utils/AppError');

// Trong controller hoac service
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('Khong tim thay user voi ID nay', 404);
  }

  res.json({ success: true, data: user });
}));
```

### 5.2 Cac Error Classes cu the

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request
class BadRequestError extends AppError {
  constructor(message = 'Yeu cau khong hop le') {
    super(message, 400);
  }
}

// 401 - Unauthorized
class UnauthorizedError extends AppError {
  constructor(message = 'Chua xac thuc. Vui long dang nhap.') {
    super(message, 401);
  }
}

// 403 - Forbidden
class ForbiddenError extends AppError {
  constructor(message = 'Khong co quyen truy cap tai nguyen nay') {
    super(message, 403);
  }
}

// 404 - Not Found
class NotFoundError extends AppError {
  constructor(resource = 'Tai nguyen', id = '') {
    super(`${resource}${id ? ` voi ID '${id}'` : ''} khong tim thay`, 404);
  }
}

// 409 - Conflict
class ConflictError extends AppError {
  constructor(message = 'Du lieu da ton tai') {
    super(message, 409);
  }
}

// 422 - Unprocessable Entity
class ValidationError extends AppError {
  constructor(errors = []) {
    super('Du lieu khong hop le', 422);
    this.errors = errors;
  }
}

// 429 - Too Many Requests
class TooManyRequestsError extends AppError {
  constructor(message = 'Qua nhieu yeu cau. Vui long thu lai sau.') {
    super(message, 429);
  }
}

// 500 - Internal Server Error
class InternalError extends AppError {
  constructor(message = 'Loi he thong. Vui long thu lai sau.') {
    super(message, 500);
    this.isOperational = false; // Loi he thong, khong phai operational
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalError
};
```

**Su dung trong code:**

```javascript
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  ValidationError
} = require('../utils/errors');

class UserService {
  async getById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
      // Message: "User voi ID '123' khong tim thay"
    }
    return user;
  }

  async create(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError(`Email '${data.email}' da duoc su dung`);
    }
    return await User.create(data);
  }

  async updatePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) throw new NotFoundError('User', userId);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new BadRequestError('Mat khau hien tai khong dung');
    }

    if (newPassword.length < 6) {
      throw new ValidationError([
        { field: 'newPassword', message: 'Mat khau moi phai co it nhat 6 ky tu' }
      ]);
    }

    user.password = newPassword;
    await user.save();
    return user;
  }
}
```

---
