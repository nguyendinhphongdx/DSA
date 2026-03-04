# Best Practices

## 10. HTTP Error Responses Best Practices

### 10.1 Cấu trúc Error Response chuẩn

```javascript
// Cấu trúc response thống nhất
{
  "success": false,
  "status": "fail",           // "fail" (4xx) hoặc "error" (5xx)
  "message": "Mô tả lỗi ngắn gọn, rõ ràng",
  "errors": [                 // Chi tiết lỗi (optional, cho validation)
    {
      "field": "email",
      "message": "Email không hợp lệ",
      "value": "invalid-email"
    }
  ],
  "code": "USER_NOT_FOUND",  // Error code để client xử lý (optional)
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 10.2 HTTP Status Codes thường dùng

```javascript
// ===== 2xx: Success =====
// 200 OK - Request thành công
res.status(200).json({ success: true, data: users });

// 201 Created - Tạo resource thành công
res.status(201).json({ success: true, data: newUser });

// 204 No Content - Thành công nhưng không trả về body (DELETE)
res.status(204).send();

// ===== 4xx: Client Errors =====
// 400 Bad Request - Request không hợp lệ
res.status(400).json({
  success: false,
  message: 'Dữ liệu không hợp lệ',
  errors: [{ field: 'email', message: 'Email không đúng format' }]
});

// 401 Unauthorized - Chưa xác thực
res.status(401).json({
  success: false,
  message: 'Vui lòng đăng nhập để tiếp tục',
  code: 'AUTHENTICATION_REQUIRED'
});

// 403 Forbidden - Không có quyền
res.status(403).json({
  success: false,
  message: 'Bạn không có quyền thực hiện hành động này',
  code: 'PERMISSION_DENIED'
});

// 404 Not Found - Resource không tồn tại
res.status(404).json({
  success: false,
  message: 'Không tìm thấy user với ID: 123',
  code: 'RESOURCE_NOT_FOUND'
});

// 409 Conflict - Xung đột (duplicate)
res.status(409).json({
  success: false,
  message: 'Email này đã được đăng ký',
  code: 'DUPLICATE_RESOURCE'
});

// 422 Unprocessable Entity - Dữ liệu không thể xử lý
res.status(422).json({
  success: false,
  message: 'Không thể xử lý dữ liệu',
  errors: [
    { field: 'age', message: 'Tuổi phải lớn hơn 0', value: -5 }
  ]
});

// 429 Too Many Requests - Rate limit
res.status(429).json({
  success: false,
  message: 'Quá nhiều yêu cầu. Thử lại sau 60 giây.',
  retryAfter: 60
});

// ===== 5xx: Server Errors =====
// 500 Internal Server Error - Lỗi server
res.status(500).json({
  success: false,
  message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
  // KHÔNG bao giờ gửi stack trace trong production!
});

// 502 Bad Gateway - Service bên ngoài lỗi
res.status(502).json({
  success: false,
  message: 'Dịch vụ tạm thời không khả dụng'
});

// 503 Service Unavailable - Server đang bảo trì
res.status(503).json({
  success: false,
  message: 'Server đang bảo trì. Vui lòng thử lại sau.',
  retryAfter: 300
});
```

### 10.3 Error Codes cho Client

```javascript
// utils/errorCodes.js
const ErrorCodes = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Authorization
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ROLE_REQUIRED: 'ROLE_REQUIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

module.exports = ErrorCodes;
```

```javascript
// Sử dụng trong custom errors
const ErrorCodes = require('../utils/errorCodes');

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Ví dụ
throw new AppError(
  'Token đã hết hạn',
  401,
  ErrorCodes.TOKEN_EXPIRED
);

// Response
{
  "success": false,
  "message": "Token đã hết hạn",
  "code": "TOKEN_EXPIRED"  // Client dùng code này để xử lý
}
```

---

## 11. Validation Errors

### 11.1 Validation với Joi

```bash
npm install joi
```

```javascript
// validators/user.validator.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được quá {#limit} ký tự',
      'any.required': 'Tên là bắt buộc'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số',
      'any.required': 'Mật khẩu là bắt buộc'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'any.required': 'Vui lòng xác nhận mật khẩu'
    }),

  age: Joi.number()
    .integer()
    .min(1)
    .max(150)
    .messages({
      'number.base': 'Tuổi phải là số',
      'number.integer': 'Tuổi phải là số nguyên',
      'number.min': 'Tuổi phải lớn hơn 0',
      'number.max': 'Tuổi không hợp lệ'
    }),

  role: Joi.string()
    .valid('user', 'admin', 'editor')
    .default('user'),

  phone: Joi.string()
    .pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (VD: 0912345678)'
    })
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().email().lowercase(),
  age: Joi.number().integer().min(1).max(150),
  phone: Joi.string().pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật'
});

module.exports = { createUserSchema, updateUserSchema };
```

### 11.2 Validation Middleware

```javascript
// middlewares/validate.middleware.js
const { ValidationError } = require('../utils/errors');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source]; // body, query, params

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,      // Trả về TẤT CẢ lỗi
      stripUnknown: true,     // Loại bỏ fields không có trong schema
      allowUnknown: false     // Không cho phép fields không khai báo
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return next(new ValidationError(errors));
    }

    // Gán lại data đã được validate và clean
    req[source] = value;
    next();
  };
};

module.exports = validate;
```

```javascript
// Sử dụng
const validate = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');

router.post('/users', validate(createUserSchema), userController.create);
router.put('/users/:id', validate(updateUserSchema), userController.update);
```

### 11.3 Validation với express-validator

```bash
npm install express-validator
```

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên là bắt buộc')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số'),

  body('age')
    .optional()
    .isInt({ min: 1, max: 150 }).withMessage('Tuổi phải từ 1-150'),
];

// Middleware xử lý kết quả validation
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

// Sử dụng
router.post('/users', createUserValidation, handleValidation, userController.create);
```

---

## 12. Sai lầm thường gặp

### Sai lầm 1: Lộ stack trace trong production

```javascript
// SAI - Lộ thông tin nhạy cảm
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // NGUY HIỂM trong production!
  });
});

// ĐÚNG
app.use((err, req, res, next) => {
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'Lỗi hệ thống'
  };

  // Chỉ show stack trong development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(response);
});
```

### Sai lầm 2: Không catch async errors

```javascript
// SAI - Promise rejection không được bắt
app.get('/api/users', async (req, res) => {
  const users = await User.find(); // UnhandledPromiseRejection nếu lỗi!
  res.json(users);
});

// ĐÚNG
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

### Sai lầm 3: Error handler thiếu tham số

```javascript
// SAI - Express không nhận diện đây là error middleware
app.use((err, req, res) => {  // Thiếu next!
  res.status(500).json({ error: err.message });
});

// ĐÚNG - PHẢI có đủ 4 tham số
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

### Sai lầm 4: Gửi response nhiều lần trong error handler

```javascript
// SAI
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation failed' });
    // Không return! Code tiếp tục chạy
  }

  res.status(500).json({ error: 'Server error' }); // LỖI: Headers already sent
});

// ĐÚNG
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed' }); // return!
  }

  res.status(500).json({ error: 'Server error' });
});
```

### Sai lầm 5: Bỏ qua process-level errors

```javascript
// SAI - Không xử lý unhandled rejections
const server = app.listen(3000);
// Nếu có unhandled promise rejection, Node.js sẽ crash (Node 15+)

// ĐÚNG
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

---
