# Error Logging (Winston, Pino)

## 9. Error Logging (Winston, Pino)

### 9.1 Winston

```bash
npm install winston
```

```javascript
// utils/logger.js
const winston = require('winston');
const path = require('path');

// Định nghĩa format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Format cho console (có màu sắc)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Tạo logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'my-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Ghi tất cả log vào file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,       // Giữ tối đa 5 file
    }),

    // Ghi chỉ error vào file riêng
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],

  // Xử lý khi logger gặp lỗi (VD: không ghi được file)
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
});

// Thêm console output trong development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

module.exports = logger;
```

**Sử dụng logger:**

```javascript
const logger = require('../utils/logger');

// Các level: error, warn, info, http, verbose, debug, silly
logger.error('Lỗi kết nối database', { host: 'localhost', port: 27017 });
logger.warn('Sắp hết dung lượng', { disk: '90%' });
logger.info('User đăng nhập thành công', { userId: '123', ip: '192.168.1.1' });
logger.debug('Query result', { count: 10, duration: '50ms' });

// Trong error middleware
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    stack: err.stack,
    body: req.body
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'Lỗi hệ thống'
  });
};

// Thay thế morgan bằng Winston
const morganMiddleware = require('morgan');
const morganStream = {
  write: (message) => logger.http(message.trim())
};
app.use(morganMiddleware('combined', { stream: morganStream }));
```

### 9.2 Pino (Nhanh hơn Winston)

```bash
npm install pino pino-pretty pino-http
```

```javascript
// utils/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // Development: Pretty print
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      }
    }
  }),

  // Production: JSON output
  ...(process.env.NODE_ENV === 'production' && {
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  // Base metadata
  base: {
    service: 'my-api',
    env: process.env.NODE_ENV
  },

  // Redact sensitive data
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.creditCard'],
    remove: true
  }
});

module.exports = logger;
```

```javascript
// Sử dụng pino-http middleware
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');

app.use(pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed with ${err.message}`;
  }
}));
```

### So sánh Winston vs Pino

| Tiêu chí | Winston | Pino |
|-----------|---------|------|
| **Tốc độ** | Chậm hơn | Nhanh hơn 5-10 lần |
| **Output** | Flexible (file, console, HTTP,...) | JSON (dùng transports riêng) |
| **Pretty print** | Built-in | Cần pino-pretty |
| **Ecosystem** | Rất lớn | Đang phát triển |
| **Sử dụng** | Đa năng | Tối ưu cho production |
| **Khi nào dùng** | General purpose, nhiều transports | High-performance APIs |

---
