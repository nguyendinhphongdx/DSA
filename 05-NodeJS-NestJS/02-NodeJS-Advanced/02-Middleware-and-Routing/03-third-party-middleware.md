# Third-party Middleware

## 5. Third-party Middleware

### 5.1 cors - Cross-Origin Resource Sharing

```bash
npm install cors
```

```javascript
const cors = require('cors');

// Cho phép tất cả origins (development)
app.use(cors());

// Cấu hình chi tiết (production)
app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'], // Chỉ cho phép các origins này
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],    // HTTP methods được phép
  allowedHeaders: ['Content-Type', 'Authorization'],       // Headers được phép
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],      // Headers client có thể đọc
  credentials: true,    // Cho phép gửi cookies cross-origin
  maxAge: 86400,         // Preflight cache time (seconds)
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// CORS cho route cụ thể
app.get('/api/public', cors(), (req, res) => {
  res.json({ message: 'Public API' });
});

// CORS động (theo request)
const dynamicCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:3000', 'https://myapp.com'];

    // Cho phép requests không có origin (mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Không được phép bởi CORS'));
    }
  }
};

app.use(cors(dynamicCorsOptions));
```

### 5.2 helmet - Bảo mật HTTP Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

// Bật tất cả bảo mật mặc định
app.use(helmet());

// Cấu hình chi tiết
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },        // Chống clickjacking
  hidePoweredBy: true,                    // Ẩn X-Powered-By header
  hsts: {                                  // HTTP Strict Transport Security
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,                           // Chống MIME sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true                          // Chống XSS
}));
```

**Helmet thêm/sửa các headers sau:**

| Header | Mục đích |
|--------|----------|
| `Content-Security-Policy` | Chống XSS, injection |
| `X-DNS-Prefetch-Control` | Kiểm soát DNS prefetching |
| `X-Frame-Options` | Chống clickjacking |
| `X-Content-Type-Options` | Chống MIME sniffing |
| `Strict-Transport-Security` | Ép dùng HTTPS |
| `X-XSS-Protection` | Chống XSS |
| `Referrer-Policy` | Kiểm soát Referrer header |

### 5.3 morgan - HTTP Request Logger

```bash
npm install morgan
```

```javascript
const morgan = require('morgan');

// Predefined formats
app.use(morgan('dev'));       // :method :url :status :response-time ms
app.use(morgan('combined')); // Apache combined log format
app.use(morgan('common'));   // Apache common log format
app.use(morgan('short'));    // Rút gọn
app.use(morgan('tiny'));     // Tối giản

// Custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Custom tokens
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

app.use(morgan(':method :url :status - :response-time ms - Body: :body - User: :user-id'));

// Ghi log vào file
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' } // append mode
);

// Log tất cả vào file
app.use(morgan('combined', { stream: accessLogStream }));

// Log lỗi vào file, log thường ra console
app.use(morgan('dev')); // Console
app.use(morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400 // Chỉ log lỗi vào file
}));

// Tắt logging trong test
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
```

### 5.4 compression - Nén Response

```bash
npm install compression
```

```javascript
const compression = require('compression');

// Cơ bản - nén tất cả responses
app.use(compression());

// Với options
app.use(compression({
  level: 6,              // Mức nén (0-9, mặc định 6)
  threshold: 1024,        // Chỉ nén response > 1KB
  memLevel: 8,            // Memory level (1-9)

  // Chỉ nén những response phù hợp
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false; // Không nén nếu client yêu cầu
    }
    return compression.filter(req, res); // Mặc định
  }
}));
```

### 5.5 Các middleware phổ biến khác

```javascript
// ===== cookie-parser: Parse cookies =====
const cookieParser = require('cookie-parser');
app.use(cookieParser('secret-key')); // Secret cho signed cookies

// ===== express-rate-limit: Giới hạn request =====
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,                  // Tối đa 100 requests mỗi 15 phút
  message: { error: 'Quá nhiều request, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ===== express-validator: Validate input =====
const { body, validationResult } = require('express-validator');

app.post('/api/users',
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('name').notEmpty().withMessage('Tên là bắt buộc'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Tuổi không hợp lệ'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ message: 'Valid!' });
  }
);

// ===== multer: Upload file =====
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueName}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

app.post('/api/upload', upload.single('avatar'), (req, res) => {
  res.json({ file: req.file });
});
```

---
