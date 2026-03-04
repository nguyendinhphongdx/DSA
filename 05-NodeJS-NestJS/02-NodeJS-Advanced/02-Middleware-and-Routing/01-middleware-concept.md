# Middleware Concept & Execution Order

## 1. Middleware là gì?

### Khái niệm

**Middleware** là các hàm có quyền truy cập vào **request object** (`req`), **response object** (`res`), và hàm **`next()`** trong chu trình request-response của Express. Middleware hoạt động như một pipeline (đường ống): request đi qua từng middleware theo thứ tự, mỗi middleware có thể xử lý, biến đổi request/response, hoặc chuyển tiếp cho middleware tiếp theo.

### Cấu trúc middleware

```javascript
// Middleware cơ bản
const myMiddleware = (req, res, next) => {
  // 1. Thực hiện logic nào đó
  console.log('Middleware đang chạy...');

  // 2. Có thể thay đổi req hoặc res
  req.requestTime = Date.now();

  // 3. Kết thúc request (gửi response) HOẶC gọi next()
  next(); // Chuyển sang middleware/route handler tiếp theo
};

// Error-handling middleware (có 4 tham số)
const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};
```

### Request Pipeline - Luồng xử lý

```
Client Request
    │
    ▼
┌─────────────────────┐
│   express.json()     │  ← Middleware 1: Parse JSON body
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   cors()             │  ← Middleware 2: Xử lý CORS
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   morgan('dev')      │  ← Middleware 3: Logging
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   authMiddleware     │  ← Middleware 4: Kiểm tra xác thực
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Route Handler      │  ← Xử lý request, gửi response
└─────────────────────┘
    │
    ▼ (nếu có lỗi)
┌─────────────────────┐
│   Error Handler      │  ← Xử lý lỗi tập trung
└─────────────────────┘
    │
    ▼
Client Response
```

### Ba hành động middleware có thể làm

1. **Thực thi code bất kỳ**: logging, authentication, validation, ...
2. **Thay đổi request/response objects**: thêm property, set headers, ...
3. **Kết thúc request-response cycle**: gửi response (`res.json()`, `res.send()`, ...)
4. **Gọi `next()`**: chuyển tiếp cho middleware tiếp theo

**Quy tắc quan trọng:** Nếu middleware không kết thúc request-response cycle, nó **PHẢI** gọi `next()`. Nếu không, request sẽ bị treo (hanging).

---

## 2. Application-level Middleware

Application-level middleware được gắn vào instance `app` bằng `app.use()` hoặc `app.METHOD()`.

### 2.1 Middleware cho tất cả routes

```javascript
const express = require('express');
const app = express();

// Middleware này chạy cho MỌI request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Tất cả route bên dưới đều đi qua middleware trên
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users list' });
});

app.get('/api/products', (req, res) => {
  res.json({ message: 'Products list' });
});
```

### 2.2 Middleware cho path cụ thể

```javascript
// Chỉ chạy cho các request bắt đầu bằng /api
app.use('/api', (req, res, next) => {
  console.log('API request detected');
  req.isApiRequest = true;
  next();
});

// Chỉ chạy cho /api/admin/*
app.use('/api/admin', (req, res, next) => {
  // Kiểm tra quyền admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
});
```

### 2.3 Nhiều middleware cho một route

```javascript
// Cách 1: Truyền nhiều hàm
app.get('/api/users',
  authenticate,          // Middleware 1: Xác thực
  validateQuery,         // Middleware 2: Validate query params
  (req, res) => {        // Route handler
    res.json({ users: [] });
  }
);

// Cách 2: Truyền mảng hàm
app.get('/api/users', [authenticate, validateQuery], (req, res) => {
  res.json({ users: [] });
});

// Cách 3: Kết hợp
app.get('/api/users', [authenticate, validateQuery], logRequest, (req, res) => {
  res.json({ users: [] });
});
```

### 2.4 Ví dụ thực tế

```javascript
const express = require('express');
const app = express();

// ===== Middleware: Request Timer =====
app.use((req, res, next) => {
  req.startTime = Date.now();

  // Ghi log sau khi response hoàn tất
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });

  next();
});

// ===== Middleware: Request ID =====
app.use((req, res, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.id = requestId;
  res.set('X-Request-Id', requestId);
  next();
});

// ===== Middleware: API Key Check (cho /api/*) =====
app.use('/api', (req, res, next) => {
  const apiKey = req.get('X-API-Key');

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'API Key không hợp lệ hoặc thiếu'
    });
  }

  next();
});

app.get('/api/data', (req, res) => {
  res.json({ data: 'Secret data', requestId: req.id });
});

app.listen(3000);
```

---

## 3. Router-level Middleware

Router-level middleware hoạt động giống application-level middleware, nhưng được gắn vào instance `express.Router()`. Điều này cho phép tạo các nhóm route có middleware riêng.

```javascript
const express = require('express');
const router = express.Router();

// ===== Middleware cho tất cả routes trong router =====
router.use((req, res, next) => {
  console.log('Router middleware:', req.method, req.url);
  next();
});

// ===== Middleware cho route cụ thể =====
router.use('/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }
  req.resourceId = id;
  next();
});

// Routes
router.get('/', (req, res) => {
  res.json({ message: 'List all' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get item ${req.resourceId}` });
});

// Mount router vào app
const app = express();
app.use('/api/items', router);
```

### Ví dụ: Router middleware cho xác thực

```javascript
const express = require('express');

// Router cho routes công khai
const publicRouter = express.Router();

publicRouter.get('/login', (req, res) => {
  res.json({ message: 'Login page' });
});

publicRouter.get('/register', (req, res) => {
  res.json({ message: 'Register page' });
});

// Router cho routes yêu cầu đăng nhập
const protectedRouter = express.Router();

// Middleware xác thực - chỉ áp dụng cho router này
protectedRouter.use((req, res, next) => {
  const token = req.get('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  // Verify token...
  req.user = { id: 1, name: 'Phong', role: 'user' };
  next();
});

protectedRouter.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

protectedRouter.get('/settings', (req, res) => {
  res.json({ settings: {} });
});

// Router cho routes admin
const adminRouter = express.Router();

// Middleware admin - chạy SAU protectedRouter middleware
adminRouter.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền admin' });
  }
  next();
});

adminRouter.get('/dashboard', (req, res) => {
  res.json({ dashboard: {} });
});

adminRouter.get('/users', (req, res) => {
  res.json({ users: [] });
});

// Mount routers
const app = express();
app.use(express.json());

app.use('/auth', publicRouter);           // /auth/login, /auth/register
app.use('/api', protectedRouter);         // /api/profile, /api/settings
app.use('/api/admin', adminRouter);       // /api/admin/dashboard, /api/admin/users

app.listen(3000);
```

---
