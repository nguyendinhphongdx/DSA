# Express Router & Modular Routing

## 7. Express Router (Modular Routing)

Express Router cho phép tổ chức routes thành các module riêng biệt, giúp code dễ quản lý hơn.

### 7.1 Tạo Router cơ bản

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();

// Middleware chỉ cho router này
router.use((req, res, next) => {
  console.log('User router middleware');
  next();
});

// GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Lấy tất cả users' });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Lấy user ${req.params.id}` });
});

// POST /api/users
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Tạo user mới', data: req.body });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Cập nhật user ${req.params.id}` });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Xóa user ${req.params.id}` });
});

module.exports = router;
```

```javascript
// routes/product.routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Lấy tất cả sản phẩm' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Lấy sản phẩm ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Tạo sản phẩm mới' });
});

module.exports = router;
```

### 7.2 Mount routers vào app

```javascript
// app.js
const express = require('express');
const app = express();

const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');

app.use(express.json());

// Mount routers với prefix
app.use('/api/users', userRoutes);       // /api/users, /api/users/:id
app.use('/api/products', productRoutes); // /api/products, /api/products/:id
app.use('/api/auth', authRoutes);        // /api/auth/login, /api/auth/register

app.listen(3000);
```

### 7.3 Nested Routers

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const postRouter = require('./post.routes');

// GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Users list' });
});

// Nest post router: /api/users/:userId/posts
router.use('/:userId/posts', postRouter);

module.exports = router;
```

```javascript
// routes/post.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // QUAN TRỌNG: mergeParams: true

// GET /api/users/:userId/posts
router.get('/', (req, res) => {
  res.json({
    message: `Lấy tất cả bài viết của user ${req.params.userId}`
  });
});

// GET /api/users/:userId/posts/:postId
router.get('/:postId', (req, res) => {
  res.json({
    message: `Lấy bài viết ${req.params.postId} của user ${req.params.userId}`
  });
});

// POST /api/users/:userId/posts
router.post('/', (req, res) => {
  res.status(201).json({
    message: `Tạo bài viết mới cho user ${req.params.userId}`
  });
});

module.exports = router;
```

**Lưu ý:** `mergeParams: true` cho phép router con truy cập params từ router cha. Nếu không có option này, `req.params.userId` sẽ là `undefined` trong post router.

---

## 8. Route Grouping và Prefix

### 8.1 Grouping routes theo chức năng

```javascript
// routes/index.js - Central route file
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');

// Middleware imports
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// ===== PUBLIC ROUTES (không cần đăng nhập) =====
router.use('/auth', authRoutes);

// ===== PROTECTED ROUTES (cần đăng nhập) =====
router.use('/users', authenticate, userRoutes);
router.use('/products', productRoutes); // GET public, POST/PUT/DELETE protected (xử lý trong route file)
router.use('/orders', authenticate, orderRoutes);

// ===== ADMIN ROUTES (cần quyền admin) =====
router.use('/admin', authenticate, authorize('admin'), adminRoutes);

module.exports = router;
```

```javascript
// app.js
const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());

// Tất cả routes có prefix /api/v1
app.use('/api/v1', routes);

// Kết quả:
// /api/v1/auth/login
// /api/v1/auth/register
// /api/v1/users
// /api/v1/users/:id
// /api/v1/products
// /api/v1/orders
// /api/v1/admin/dashboard

app.listen(3000);
```

### 8.2 API Versioning với routes

```javascript
// routes/v1/index.js
const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));

module.exports = router;
```

```javascript
// routes/v2/index.js
const express = require('express');
const router = express.Router();

// V2 có thể có routes khác hoặc logic khác
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/analytics', require('./analytics.routes')); // Chỉ có ở v2

module.exports = router;
```

```javascript
// app.js
const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2');

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// /api/v1/users   -> v1 handlers
// /api/v2/users   -> v2 handlers
// /api/v2/analytics -> chỉ v2
```

### 8.3 Grouping middleware cho nhiều routes

```javascript
const express = require('express');
const router = express.Router();

// Tạo middleware group cho các routes cần xác thực
const authRequired = [authenticate, checkActive];

// Tạo middleware group cho admin
const adminRequired = [...authRequired, authorize('admin')];

// Áp dụng middleware group
router.get('/profile', ...authRequired, getProfile);
router.put('/profile', ...authRequired, updateProfile);

router.get('/admin/users', ...adminRequired, getAllUsers);
router.delete('/admin/users/:id', ...adminRequired, deleteUser);

module.exports = router;
```

---

## 9. Middleware Execution Order

### 9.1 Thứ tự thực thi

Middleware được thực thi theo thứ tự khai báo trong code. Đây là quy tắc quan trọng nhất cần nhớ.

```javascript
const express = require('express');
const app = express();

// Middleware 1 (chạy đầu tiên cho mọi request)
app.use((req, res, next) => {
  console.log('1. Global middleware');
  next();
});

// Middleware 2
app.use(express.json()); // 2. Parse JSON body
console.log('2. express.json()');

// Middleware 3 (chỉ cho /api)
app.use('/api', (req, res, next) => {
  console.log('3. API middleware');
  next();
});

// Route handler
app.get('/api/users', (req, res) => {
  console.log('4. Route handler');
  res.json({ users: [] });
});

// Error handler (chạy cuối cùng, chỉ khi có lỗi)
app.use((err, req, res, next) => {
  console.log('5. Error handler');
  res.status(500).json({ error: err.message });
});

// Request: GET /api/users
// Output:
// 1. Global middleware
// 3. API middleware
// 4. Route handler
```

### 9.2 Minh họa middleware pipeline chi tiết

```javascript
const express = require('express');
const app = express();

// Tạo middleware factory để minh họa thứ tự
const createMiddleware = (name) => (req, res, next) => {
  console.log(`→ ENTER: ${name}`);

  // Ghi lại thời điểm sau khi response được gửi
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    console.log(`← EXIT: ${name}`);
    return originalJson(body);
  };

  next();
};

app.use(createMiddleware('Middleware 1 - Global'));
app.use(createMiddleware('Middleware 2 - JSON Parser'));
app.use('/api', createMiddleware('Middleware 3 - API only'));

app.get('/api/users',
  createMiddleware('Middleware 4 - Route specific'),
  (req, res) => {
    console.log('★ Route Handler executed');
    res.json({ users: [] });
  }
);

// GET /api/users
// → ENTER: Middleware 1 - Global
// → ENTER: Middleware 2 - JSON Parser
// → ENTER: Middleware 3 - API only
// → ENTER: Middleware 4 - Route specific
// ★ Route Handler executed
// ← EXIT: Middleware 4 - Route specific
```

### 9.3 next() và luồng điều khiển

```javascript
// ===== next() - Chuyển cho middleware tiếp theo =====
app.use((req, res, next) => {
  console.log('Middleware A');
  next(); // → Chuyển cho middleware B
  console.log('Sau next() của A'); // Vẫn chạy! Nhưng response có thể đã gửi
});

app.use((req, res, next) => {
  console.log('Middleware B');
  next();
});

// ===== next('route') - Bỏ qua các middleware còn lại của route =====
app.get('/api/users',
  (req, res, next) => {
    if (req.query.skip) {
      return next('route'); // Bỏ qua middleware 2 và route handler
    }
    next(); // Đi đến middleware 2
  },
  (req, res, next) => {
    console.log('Middleware 2 - sẽ bị bỏ qua nếu skip=true');
    next();
  },
  (req, res) => {
    res.json({ message: 'Route handler 1' });
  }
);

// Route handler thay thế (khi next('route') được gọi)
app.get('/api/users', (req, res) => {
  res.json({ message: 'Route handler 2 (skipped)' });
});

// ===== next(error) - Chuyển cho error handler =====
app.get('/api/fail', (req, res, next) => {
  const error = new Error('Something went wrong');
  error.statusCode = 500;
  next(error); // Bỏ qua tất cả middleware thường, đi thẳng đến error handler
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});
```

### Tóm tắt thứ tự ưu tiên

```
1. app.use() middleware (theo thứ tự khai báo)
2. app.use('/path') middleware (path-specific)
3. router.use() middleware
4. Route-specific middleware (truyền vào route handler)
5. Route handler
6. Error-handling middleware (4 params)
```

---
