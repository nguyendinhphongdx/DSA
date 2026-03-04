# Custom Middleware Patterns

## 10. Custom Middleware Patterns

### 10.1 Async Middleware Wrapper

```javascript
// utils/asyncHandler.js
// Pattern phổ biến nhất - wrap async handlers tự động catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// Sử dụng
const asyncHandler = require('./utils/asyncHandler');

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
  // Nếu User.find() throw error, tự động gọi next(error)
}));
```

### 10.2 Middleware Factory (Higher-Order Function)

```javascript
// Middleware factory - tạo middleware với cấu hình tùy chỉnh
// Pattern: function trả về function

// ===== Role-based Authorization =====
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' không có quyền truy cập. Yêu cầu: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Sử dụng
app.delete('/api/users/:id', authenticate, authorize('admin'), deleteUser);
app.put('/api/posts/:id', authenticate, authorize('admin', 'editor'), updatePost);

// ===== Rate Limiter Factory =====
const createRateLimiter = ({ windowMs = 60000, max = 100, message = 'Too many requests' }) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const timestamps = requests.get(key).filter(t => now - t < windowMs);
    timestamps.push(now);
    requests.set(key, timestamps);

    if (timestamps.length > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', max.toString());
    res.set('X-RateLimit-Remaining', (max - timestamps.length).toString());

    next();
  };
};

// Sử dụng với cấu hình khác nhau
app.use('/api', createRateLimiter({ windowMs: 60000, max: 100 }));
app.use('/api/auth/login', createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Quá nhiều lần đăng nhập thất bại. Thử lại sau 15 phút.'
}));
```

### 10.3 Validation Middleware

```javascript
// middlewares/validate.middleware.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,     // Trả về tất cả lỗi, không dừng ở lỗi đầu tiên
      stripUnknown: true     // Loại bỏ fields không có trong schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    req.body = value; // Gán lại body đã được validate và clean
    next();
  };
};

module.exports = validate;
```

```javascript
// validators/user.validator.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'Tên phải có ít nhất 2 ký tự',
      'string.max': 'Tên không được quá 50 ký tự',
      'any.required': 'Tên là bắt buộc'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  age: Joi.number().integer().min(0).max(150)
    .messages({
      'number.min': 'Tuổi phải >= 0',
      'number.max': 'Tuổi phải <= 150'
    }),
  password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

module.exports = { createUserSchema };
```

```javascript
// routes/user.routes.js
const validate = require('../middlewares/validate.middleware');
const { createUserSchema } = require('../validators/user.validator');

router.post('/', validate(createUserSchema), userController.create);
```

### 10.4 Caching Middleware

```javascript
// middlewares/cache.middleware.js
const cache = (duration) => {
  const cacheStore = new Map();

  return (req, res, next) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cacheStore.get(key);

    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      console.log(`Cache HIT: ${key}`);
      return res.json(cached.data);
    }

    console.log(`Cache MISS: ${key}`);

    // Override res.json để capture response data
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cacheStore.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalJson(data);
    };

    next();
  };
};

// Sử dụng
app.get('/api/products', cache(300), (req, res) => {
  // Response sẽ được cache 5 phút (300 giây)
  res.json({ products: [] });
});
```

### 10.5 Logging Middleware nâng cao

```javascript
// middlewares/logger.middleware.js
const requestLogger = (options = {}) => {
  const {
    includeBody = false,
    includeHeaders = false,
    excludePaths = ['/health', '/favicon.ico']
  } = options;

  return (req, res, next) => {
    // Bỏ qua certain paths
    if (excludePaths.includes(req.path)) {
      return next();
    }

    const startTime = Date.now();

    // Capture response body
    const originalJson = res.json.bind(res);
    let responseBody;
    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };

    // Log sau khi response hoàn tất
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      if (includeBody && req.body && Object.keys(req.body).length > 0) {
        logData.requestBody = req.body;
      }

      if (includeHeaders) {
        logData.headers = req.headers;
      }

      // Color-coded output
      const color = res.statusCode >= 500 ? '\x1b[31m'   // Red
                   : res.statusCode >= 400 ? '\x1b[33m'   // Yellow
                   : res.statusCode >= 300 ? '\x1b[36m'   // Cyan
                   : '\x1b[32m';                            // Green
      const reset = '\x1b[0m';

      console.log(
        `${color}${logData.method} ${logData.url} ${logData.status} ${logData.duration}${reset}`
      );
    });

    next();
  };
};

module.exports = requestLogger;
```

---

## 11. Sai lầm thường gặp

### Sai lầm 1: Không gọi next()

```javascript
// SAI - Request sẽ bị treo (hang forever)
app.use((req, res, next) => {
  console.log('Middleware chạy');
  // Quên gọi next()! Request sẽ timeout
});

// ĐÚNG
app.use((req, res, next) => {
  console.log('Middleware chạy');
  next(); // Phải gọi next() hoặc gửi response
});
```

### Sai lầm 2: Gọi next() SAU khi đã gửi response

```javascript
// SAI - Gây lỗi "Cannot set headers after they are sent"
app.use((req, res, next) => {
  res.json({ message: 'Done' });
  next(); // Lỗi! Response đã gửi rồi mà vẫn gọi next
});

// ĐÚNG - Chỉ gọi 1 trong 2: res.json() HOẶC next()
app.use((req, res, next) => {
  if (someCondition) {
    return res.json({ message: 'Done' }); // return để dừng
  }
  next();
});
```

### Sai lầm 3: Đặt error middleware sai vị trí

```javascript
// SAI - Error middleware trước routes
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.get('/api/users', handler); // Error middleware ở trên không catch được lỗi từ route này

// ĐÚNG - Error middleware SAU tất cả routes
app.get('/api/users', handler);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

### Sai lầm 4: Middleware thay đổi global state

```javascript
// SAI - Shared state giữa các requests
let requestCount = 0; // Biến global
app.use((req, res, next) => {
  requestCount++;
  req.requestNumber = requestCount;
  // Trong production với nhiều requests đồng thời, biến này sẽ race condition
  next();
});

// ĐÚNG - State gắn vào request object
app.use((req, res, next) => {
  req.metadata = {
    timestamp: Date.now(),
    id: crypto.randomUUID()
  };
  next();
});
```

### Sai lầm 5: Quên mergeParams khi dùng nested router

```javascript
// SAI
const commentRouter = express.Router();
commentRouter.get('/', (req, res) => {
  console.log(req.params.postId); // undefined!
});

app.use('/posts/:postId/comments', commentRouter);

// ĐÚNG
const commentRouter = express.Router({ mergeParams: true });
commentRouter.get('/', (req, res) => {
  console.log(req.params.postId); // OK!
});

app.use('/posts/:postId/comments', commentRouter);
```

---
