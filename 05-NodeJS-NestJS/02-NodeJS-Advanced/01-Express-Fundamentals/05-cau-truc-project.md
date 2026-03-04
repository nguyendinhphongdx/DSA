# Cấu trúc ứng dụng Express (MVC)

## 9. Cấu trúc ứng dụng Express (MVC)

### 9.1 Cấu trúc thư mục chuẩn MVC

```
project/
├── src/
│   ├── app.js                  # Entry point, khởi tạo Express app
│   ├── server.js               # Khởi động server (tách riêng khỏi app)
│   ├── config/
│   │   ├── database.js         # Kết nối database
│   │   ├── env.js              # Biến môi trường
│   │   └── index.js            # Export tất cả config
│   ├── controllers/
│   │   ├── user.controller.js  # Xử lý logic cho user routes
│   │   ├── auth.controller.js
│   │   └── product.controller.js
│   ├── models/
│   │   ├── user.model.js       # Schema/model cho User
│   │   ├── product.model.js
│   │   └── index.js
│   ├── routes/
│   │   ├── user.routes.js      # Định nghĩa routes cho user
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── index.js            # Gom tất cả routes
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Xác thực
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── services/
│   │   ├── user.service.js     # Business logic
│   │   ├── email.service.js
│   │   └── auth.service.js
│   ├── utils/
│   │   ├── helpers.js          # Hàm tiện ích
│   │   ├── logger.js
│   │   └── AppError.js
│   └── validators/
│       ├── user.validator.js   # Validation rules
│       └── auth.validator.js
├── public/                     # Static files
├── views/                      # Template files
├── tests/                      # Test files
├── .env                        # Biến môi trường
├── .gitignore
└── package.json
```

### 9.2 Triển khai MVC chi tiết

**Model (models/user.model.js):**

```javascript
// Ví dụ với Mongoose (MongoDB)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true,
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false  // Không trả về password khi query
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Tự động thêm createdAt, updatedAt
});

module.exports = mongoose.model('User', userSchema);
```

**Controller (controllers/user.controller.js):**

```javascript
const userService = require('../services/user.service');

class UserController {
  // GET /api/users
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, search } = req.query;
      const result = await userService.getAll({ page, limit, sort, search });

      res.json({
        success: true,
        count: result.users.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        data: result.users
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/:id
  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/users
  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/users/:id
  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Cập nhật user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/users/:id
  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Xóa user thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
```

**Service (services/user.service.js):**

```javascript
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

class UserService {
  async getAll({ page = 1, limit = 10, sort = '-createdAt', search = '' }) {
    const query = {};

    // Tìm kiếm theo tên hoặc email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    return {
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }
    return user;
  }

  async create(data) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email đã được sử dụng', 400);
    }
    return await User.create(data);
  }

  async update(id, data) {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,         // Trả về document sau khi update
      runValidators: true // Chạy validation khi update
    });
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }
    return user;
  }

  async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }
    return user;
  }
}

module.exports = new UserService();
```

**Routes (routes/user.routes.js):**

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateCreateUser, validateUpdateUser } = require('../validators/user.validator');

router.route('/')
  .get(userController.getAll)
  .post(authenticate, authorize('admin'), validateCreateUser, userController.create);

router.route('/:id')
  .get(userController.getById)
  .put(authenticate, authorize('admin'), validateUpdateUser, userController.update)
  .delete(authenticate, authorize('admin'), userController.delete);

module.exports = router;
```

**Gom routes (routes/index.js):**

```javascript
const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

module.exports = router;
```

**App (app.js):**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// ===== Global Middleware =====
app.use(helmet());              // Bảo mật headers
app.use(cors());                // Cross-Origin
app.use(morgan('dev'));         // Logging
app.use(express.json());       // Parse JSON
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====
app.use('/api', routes);

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== 404 Handler =====
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.method} ${req.originalUrl}`
  });
});

// ===== Error Handler =====
app.use(errorMiddleware);

module.exports = app;
```

**Server (server.js):**

```javascript
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Kết nối database và khởi động server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Kết nối database thành công');

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
      console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
};

startServer();
```

---

## 10. Code Examples tổng hợp

### Ví dụ hoàn chỉnh: API Quản lý sách (In-Memory)

```javascript
// book-api.js
const express = require('express');
const app = express();

app.use(express.json());

// ===== "Database" trong memory =====
let books = [
  { id: 1, title: 'Lập trình JavaScript', author: 'Nguyễn Văn A', price: 150000, category: 'programming' },
  { id: 2, title: 'Node.js cho người mới', author: 'Trần Văn B', price: 200000, category: 'programming' },
  { id: 3, title: 'Tiếng Anh giao tiếp', author: 'Lê Thị C', price: 120000, category: 'language' },
];
let nextId = 4;

// ===== MIDDLEWARE: Logging =====
app.use((req, res, next) => {
  const start = Date.now();

  // Ghi log sau khi response hoàn tất
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// ===== GET /api/books - Lấy danh sách sách =====
app.get('/api/books', (req, res) => {
  let result = [...books];

  // Lọc theo category
  if (req.query.category) {
    result = result.filter(b => b.category === req.query.category);
  }

  // Tìm kiếm theo title
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(b => b.title.toLowerCase().includes(search));
  }

  // Sắp xếp
  if (req.query.sort) {
    const sortField = req.query.sort;
    const order = req.query.order === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * order;
      if (a[sortField] > b[sortField]) return 1 * order;
      return 0;
    });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResult = result.slice(startIndex, endIndex);

  res.json({
    success: true,
    count: paginatedResult.length,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit),
    data: paginatedResult
  });
});

// ===== GET /api/books/:id - Lấy sách theo ID =====
app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sách với ID: ${id}`
    });
  }

  res.json({ success: true, data: book });
});

// ===== POST /api/books - Tạo sách mới =====
app.post('/api/books', (req, res) => {
  const { title, author, price, category } = req.body;

  // Validate
  const errors = [];
  if (!title) errors.push('Title là bắt buộc');
  if (!author) errors.push('Author là bắt buộc');
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('Price phải là số dương');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
    price: price || 0,
    category: category || 'uncategorized'
  };

  books.push(newBook);

  res.status(201).json({
    success: true,
    message: 'Tạo sách thành công',
    data: newBook
  });
});

// ===== PUT /api/books/:id - Cập nhật sách =====
app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sách với ID: ${id}`
    });
  }

  const { title, author, price, category } = req.body;
  books[index] = { id, title, author, price, category };

  res.json({
    success: true,
    message: 'Cập nhật sách thành công',
    data: books[index]
  });
});

// ===== DELETE /api/books/:id - Xóa sách =====
app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sách với ID: ${id}`
    });
  }

  const deleted = books.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'Xóa sách thành công',
    data: deleted
  });
});

// ===== GET /api/books/stats/summary - Thống kê =====
app.get('/api/stats/books', (req, res) => {
  const stats = {
    totalBooks: books.length,
    totalValue: books.reduce((sum, b) => sum + b.price, 0),
    averagePrice: books.length > 0
      ? Math.round(books.reduce((sum, b) => sum + b.price, 0) / books.length)
      : 0,
    categories: [...new Set(books.map(b => b.category))],
    byCategory: books.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {})
  };

  res.json({ success: true, data: stats });
});

// ===== Khởi động server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Book API server running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  GET    /api/books          - Lấy danh sách sách');
  console.log('  GET    /api/books/:id       - Lấy sách theo ID');
  console.log('  POST   /api/books          - Tạo sách mới');
  console.log('  PUT    /api/books/:id       - Cập nhật sách');
  console.log('  DELETE /api/books/:id       - Xóa sách');
  console.log('  GET    /api/stats/books     - Thống kê');
});
```

---
