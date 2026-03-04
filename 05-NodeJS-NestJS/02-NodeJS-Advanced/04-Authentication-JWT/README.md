# Authentication & JWT trong Express.js

## Mục lục

- [1. Authentication vs Authorization](#1-authentication-vs-authorization)
- [2. Session-based Authentication](#2-session-based-authentication)
- [3. JWT (JSON Web Token)](#3-jwt-json-web-token)
- [4. JWT Flow: Login, Verify, Refresh](#4-jwt-flow-login-verify-refresh)
- [5. Access Token và Refresh Token](#5-access-token-và-refresh-token)
- [6. Password Hashing với bcrypt](#6-password-hashing-với-bcrypt)
- [7. Passport.js](#7-passportjs)
- [8. OAuth 2.0](#8-oauth-20)
- [9. Cookie vs localStorage vs httpOnly Cookie](#9-cookie-vs-localstorage-vs-httponly-cookie)
- [10. Security Best Practices](#10-security-best-practices)
- [11. Rate Limiting](#11-rate-limiting)
- [12. Code Example: Full Auth Flow](#12-code-example-full-auth-flow)
- [13. Sai lầm thường gặp](#13-sai-lầm-thường-gặp)
- [14. Bài tập thực hành](#14-bài-tập-thực-hành)

---

## 1. Authentication vs Authorization

### Phân biệt

| | Authentication (Xác thực) | Authorization (Phân quyền) |
|---|---|---|
| **Câu hỏi** | "Bạn là AI?" | "Bạn được phép làm gì?" |
| **Mục đích** | Xác minh danh tính người dùng | Kiểm tra quyền truy cập |
| **Thứ tự** | Chạy TRƯỚC | Chạy SAU authentication |
| **Ví dụ** | Đăng nhập bằng email/password | Admin mới được xóa user |
| **HTTP Code** | 401 Unauthorized | 403 Forbidden |

### Luồng xử lý

```
Client Request
    │
    ▼
┌─────────────────────────┐
│  1. AUTHENTICATION       │  → Kiểm tra: "Người này là ai?"
│  - Kiểm tra token/session│     → 401 nếu chưa đăng nhập
│  - Xác minh danh tính    │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  2. AUTHORIZATION        │  → Kiểm tra: "Người này có quyền không?"
│  - Kiểm tra role/permission│  → 403 nếu không có quyền
│  - Kiểm tra ownership    │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  3. ROUTE HANDLER        │  → Xử lý business logic
└─────────────────────────┘
```

---

## 2. Session-based Authentication

### Khái niệm

Session-based auth lưu trạng thái đăng nhập trên **server**. Khi user đăng nhập, server tạo session và gửi session ID cho client qua cookie.

```
[Login Flow]
1. Client gửi username/password
2. Server xác thực → Tạo session (lưu trên server)
3. Server gửi session ID qua cookie → Client
4. Client gửi cookie mỗi request → Server
5. Server dùng session ID tìm session → Xác thực user
```

### Triển khai với express-session

```bash
npm install express-session connect-mongo
```

```javascript
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
app.use(express.json());

// ===== Cấu hình Session =====
app.use(session({
  secret: 'my-super-secret-key-12345',   // Secret để sign session ID
  resave: false,                           // Không save lại nếu session không thay đổi
  saveUninitialized: false,                // Không tạo session cho anonymous users
  name: 'sessionId',                       // Tên cookie (mặc định: connect.sid)

  cookie: {
    httpOnly: true,       // JavaScript không truy cập được cookie
    secure: false,        // true trong production (chỉ HTTPS)
    sameSite: 'strict',   // Chống CSRF
    maxAge: 24 * 60 * 60 * 1000  // 24 giờ
  },

  // Lưu session vào MongoDB (production)
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/myapp',
    ttl: 24 * 60 * 60,    // Session expires sau 24h
    autoRemove: 'native'   // Tự động xóa sessions hết hạn
  })
}));

// ===== Login =====
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Tìm user và verify password (giả lập)
  const user = { id: 1, name: 'Phong', email, role: 'admin' };

  // Lưu thông tin user vào session
  req.session.userId = user.id;
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    user: req.session.user
  });
});

// ===== Middleware kiểm tra session =====
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập'
    });
  }
  next();
};

// ===== Protected Route =====
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
});

// ===== Logout =====
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi khi đăng xuất' });
    }
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Đăng xuất thành công' });
  });
});
```

### Session vs JWT - So sánh

| Tiêu chí | Session-based | JWT (Token-based) |
|-----------|--------------|-------------------|
| **State** | Stateful (server lưu session) | Stateless (token chứa thông tin) |
| **Storage** | Server (memory/DB/Redis) | Client (localStorage/cookie) |
| **Scalability** | Khó scale (cần shared session) | Dễ scale (không cần server state) |
| **Mobile** | Khó dùng | Dễ dùng |
| **Revoke** | Dễ (xóa session) | Khó (token valid đến khi hết hạn) |
| **Performance** | Cần đọc DB mỗi request | Chỉ cần verify signature |
| **Khi nào dùng** | Traditional web app, SSR | SPA, Mobile app, Microservices |

---

## 3. JWT (JSON Web Token)

### 3.1 JWT là gì?

JWT là một chuẩn mở (RFC 7519) cho phép truyền thông tin an toàn giữa các bên dưới dạng JSON object. Token được ký (signed) để đảm bảo tính toàn vẹn.

### 3.2 Cấu trúc JWT

JWT gồm 3 phần, ngăn cách bởi dấu chấm (`.`):

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature (Chữ ký)
  │      └── Payload (Dữ liệu)
  └── Header (Tiêu đề)
```

**1. Header:**

```json
{
  "alg": "HS256",    // Algorithm (HMAC SHA256)
  "typ": "JWT"       // Token type
}
// → Base64Url encoded: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

**2. Payload (Claims):**

```json
{
  // Registered claims (chuẩn)
  "iss": "myapp.com",           // Issuer - ai tạo token
  "sub": "user123",             // Subject - đối tượng token
  "aud": "myapp.com",           // Audience - ai nhận token
  "exp": 1700000000,            // Expiration time (UNIX timestamp)
  "iat": 1699996400,            // Issued at (thời điểm tạo)
  "nbf": 1699996400,            // Not before (token chưa valid trước thời điểm này)
  "jti": "unique-id-123",       // JWT ID (unique identifier)

  // Custom claims (tùy chỉnh)
  "userId": "507f1f77bcf86cd799439011",
  "email": "phong@gmail.com",
  "role": "admin"
}
// → Base64Url encoded: eyJ1c2VySWQiOiI1MDdmMWY3...
```

**3. Signature:**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**QUAN TRONG:** JWT **KHÔNG** mã hóa dữ liệu! Bất kỳ ai cũng có thể decode payload. JWT chỉ đảm bảo dữ liệu không bị thay đổi (integrity). Tuyệt đối **KHÔNG** lưu thông tin nhạy cảm (password, credit card) trong JWT payload.

### 3.3 Tạo và Verify JWT

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-min-32-chars';

// ===== Tạo Token =====
const createToken = (userId, role) => {
  const payload = {
    sub: userId,         // Subject
    role: role,          // Custom claim
    iat: Date.now()      // Issued at
  };

  const options = {
    expiresIn: '15m',           // Hết hạn sau 15 phút
    // expiresIn: '1h'          // 1 giờ
    // expiresIn: '7d'          // 7 ngày
    // expiresIn: 60 * 15       // 15 phút (seconds)
    issuer: 'myapp.com',
    audience: 'myapp.com'
  };

  return jwt.sign(payload, SECRET_KEY, options);
};

// ===== Verify Token =====
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      issuer: 'myapp.com',
      audience: 'myapp.com'
    });
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// ===== Decode Token (không verify) =====
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
  // Trả về { header, payload, signature }
  // CẢNH BÁO: Không verify signature! Dùng cho debugging
};

// Ví dụ sử dụng
const token = createToken('user123', 'admin');
console.log('Token:', token);

const result = verifyToken(token);
console.log('Verify:', result);
// { valid: true, decoded: { sub: 'user123', role: 'admin', iat: ..., exp: ... } }
```

---

## 4. JWT Flow: Login, Verify, Refresh

### 4.1 Login Flow

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';

// Giả lập database
const users = [
  {
    id: '1',
    email: 'phong@gmail.com',
    // password: '123456' (đã hash)
    password: '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    name: 'Phong',
    role: 'admin'
  }
];

// Lưu refresh tokens (trong thực tế dùng Redis hoặc DB)
const refreshTokens = new Set();

// ===== ĐĂNG NHẬP =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // 2. So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // 3. Tạo Access Token (ngắn hạn)
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 4. Tạo Refresh Token (dài hạn)
    const refreshToken = jwt.sign(
      { sub: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Lưu refresh token
    refreshTokens.add(refreshToken);

    // 6. Gửi response
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});
```

### 4.2 Verify Middleware

```javascript
// middlewares/auth.middleware.js
const authenticate = (req, res, next) => {
  try {
    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token không được cung cấp'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Gắn thông tin user vào request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Xác thực thất bại'
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' không có quyền. Yêu cầu: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

### 4.3 Refresh Token

```javascript
// ===== REFRESH TOKEN =====
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  // 1. Kiểm tra refresh token có tồn tại
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token không hợp lệ'
    });
  }

  try {
    // 2. Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // 3. Tìm user
    const user = users.find(u => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // 4. Tạo access token mới
    const newAccessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 5. (Tùy chọn) Tạo refresh token mới (Token Rotation)
    refreshTokens.delete(refreshToken);
    const newRefreshToken = jwt.sign(
      { sub: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    refreshTokens.add(newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    // Refresh token hết hạn → user phải đăng nhập lại
    refreshTokens.delete(refreshToken);
    return res.status(401).json({
      success: false,
      message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }
});

// ===== LOGOUT =====
app.post('/api/auth/logout', authenticate, (req, res) => {
  const { refreshToken } = req.body;

  // Xóa refresh token
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});
```

---

## 5. Access Token và Refresh Token

### Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    ACCESS TOKEN                             │
│  - Thời hạn NGẮN: 15 phút - 1 giờ                        │
│  - Chứa thông tin user (id, role, email)                   │
│  - Gửi trong Authorization header mỗi request              │
│  - Nếu bị đánh cắp → thiệt hại giới hạn (hết hạn nhanh)  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   REFRESH TOKEN                             │
│  - Thời hạn DÀI: 7 ngày - 30 ngày                         │
│  - Chỉ chứa user ID                                        │
│  - Chỉ dùng để lấy access token mới                        │
│  - Lưu trữ an toàn (httpOnly cookie / secure storage)       │
│  - Có thể revoke từ server                                  │
└────────────────────────────────────────────────────────────┘
```

### Token Rotation (Khuyến nghị)

```javascript
// Mỗi lần dùng refresh token → tạo refresh token MỚI
// Refresh token cũ bị vô hiệu hóa

// Lợi ích:
// - Nếu refresh token bị đánh cắp, kẻ tấn công chỉ dùng được 1 lần
// - Khi user hợp lệ dùng refresh token (đã bị revoke) → phát hiện bị hack
// - Tự động "đẩy" kẻ tấn công ra khi user thật refresh

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // 1. Kiểm tra token có trong danh sách hợp lệ
  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken) {
    // Token không tồn tại → có thể đã bị dùng rồi (reuse detection)
    // Xóa TẤT CẢ refresh tokens của user (bắt buộc đăng nhập lại)
    const decoded = jwt.decode(refreshToken);
    if (decoded) {
      await RefreshToken.deleteMany({ userId: decoded.sub });
    }

    return res.status(401).json({
      success: false,
      message: 'Refresh token đã bị sử dụng. Tất cả sessions đã bị đăng xuất.',
      code: 'TOKEN_REUSE_DETECTED'
    });
  }

  // 2. Verify token
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

  // 3. XÓA token cũ
  await RefreshToken.deleteOne({ token: refreshToken });

  // 4. Tạo token mới (cả access và refresh)
  const newAccessToken = generateAccessToken(decoded.sub);
  const newRefreshToken = generateRefreshToken(decoded.sub);

  // 5. Lưu refresh token mới
  await RefreshToken.create({
    token: newRefreshToken,
    userId: decoded.sub,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
});
```

### Token Blacklist (Revocation)

```javascript
// Khi cần vô hiệu hóa token trước khi hết hạn
// VD: User đăng xuất, đổi mật khẩu, bị ban

// Dùng Redis để lưu blacklisted tokens
const Redis = require('ioredis');
const redis = new Redis();

// Blacklist một token
const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000); // Thời gian còn lại

  if (ttl > 0) {
    await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  }
};

// Kiểm tra token có bị blacklist
const isBlacklisted = async (token) => {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
};

// Middleware kiểm tra blacklist
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp' });
  }

  // Kiểm tra blacklist
  if (await isBlacklisted(token)) {
    return res.status(401).json({ message: 'Token đã bị vô hiệu hóa' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Logout - blacklist access token
app.post('/api/auth/logout', authenticate, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await blacklistToken(token);

  // Xóa refresh token
  await RefreshToken.deleteMany({ userId: req.user.sub });

  res.json({ message: 'Đăng xuất thành công' });
});
```

---

## 6. Password Hashing với bcrypt

### 6.1 Tại sao phải hash password?

**TUYỆT ĐỐI KHÔNG** lưu password dạng plain text! Nếu database bị hack, tất cả password sẽ bị lộ.

```javascript
// SAI - NGUY HIỂM!
const user = {
  email: 'phong@gmail.com',
  password: '123456'  // Plain text → ai cũng đọc được
};

// ĐÚNG
const user = {
  email: 'phong@gmail.com',
  password: '$2b$10$X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3X3' // Hash
};
```

### 6.2 bcrypt

```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');

// ===== Hash Password =====
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;  // Số rounds tạo salt (10-12 khuyến nghị)

  // Cách 1: Auto-generate salt
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
  // '$2b$10$X3X3X3X3...' (60 ký tự)

  // Cách 2: Manual salt
  const salt = await bcrypt.genSalt(saltRounds);
  const hashed = await bcrypt.hash(plainPassword, salt);
  return hashed;
};

// ===== Compare Password =====
const comparePassword = async (plainPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch; // true hoặc false
};

// ===== Ví dụ sử dụng =====
const demo = async () => {
  const password = 'mySecurePassword123';

  // Hash
  const hashed = await hashPassword(password);
  console.log('Hashed:', hashed);
  // $2b$10$YourSaltHereXXXXXXXXXXXYourHashHere...

  // Compare
  const isValid = await comparePassword('mySecurePassword123', hashed);
  console.log('Valid:', isValid); // true

  const isInvalid = await comparePassword('wrongPassword', hashed);
  console.log('Invalid:', isInvalid); // false
};
```

### 6.3 Trong Mongoose Model

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Không trả về password khi query
  },
  passwordChangedAt: Date
});

// ===== Pre-save hook: Hash password trước khi lưu =====
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password thay đổi
  if (!this.isModified('password')) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Ghi lại thời điểm đổi password
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // -1s để đảm bảo token tạo sau
  }

  next();
});

// ===== Method so sánh password =====
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ===== Method kiểm tra password đã đổi sau khi token được tạo =====
userSchema.methods.changedPasswordAfter = function(tokenIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return tokenIssuedAt < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
```

### Salt Rounds - Chọn bao nhiêu?

| Salt Rounds | Thời gian hash | Bảo mật | Khuyến nghị |
|-------------|----------------|---------|-------------|
| 8 | ~40ms | Thấp | Không khuyến nghị |
| 10 | ~100ms | Tốt | Ứng dụng thông thường |
| 12 | ~300ms | Rất tốt | Dữ liệu nhạy cảm |
| 14 | ~1s | Xuất sắc | Hệ thống ngân hàng |

**Quy tắc:** Chọn rounds cao nhất mà server chịu được (hash < 250ms).

---

## 7. Passport.js

### 7.1 Giới thiệu

Passport.js là middleware xác thực phổ biến nhất cho Node.js, hỗ trợ 500+ strategies (cách thức xác thực).

```bash
npm install passport passport-local passport-jwt
```

### 7.2 Local Strategy (Email/Password)

```javascript
// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// ===== LOCAL STRATEGY (đăng nhập bằng email/password) =====
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',      // Field chứa username (mặc định: 'username')
    passwordField: 'password',   // Field chứa password (mặc định: 'password')
    session: false               // Không dùng session
  },
  async (email, password, done) => {
    try {
      // 1. Tìm user
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return done(null, false, { message: 'Email không tồn tại' });
      }

      // 2. So sánh password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return done(null, false, { message: 'Mật khẩu không đúng' });
      }

      // 3. Thành công
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// ===== JWT STRATEGY (xác thực bằng JWT token) =====
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ Authorization header
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'myapp.com',
    audience: 'myapp.com'
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.sub);

      if (!user) {
        return done(null, false, { message: 'User không tồn tại' });
      }

      // Kiểm tra password đã đổi sau khi token được tạo
      if (user.changedPasswordAfter(payload.iat)) {
        return done(null, false, { message: 'Password đã thay đổi. Vui lòng đăng nhập lại.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;
```

### 7.3 Sử dụng trong routes

```javascript
// app.js
const passport = require('./config/passport');
app.use(passport.initialize());

// routes/auth.routes.js
const passport = require('passport');
const jwt = require('jsonwebtoken');

// ===== LOGIN với Passport Local =====
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Đăng nhập thất bại'
      });
    }

    // Tạo JWT token
    const accessToken = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        accessToken
      }
    });
  })(req, res, next);
});

// ===== PROTECTED ROUTE với Passport JWT =====
router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
);
```

---

## 8. OAuth 2.0

### 8.1 Khái niệm

OAuth 2.0 là framework ủy quyền (authorization framework) cho phép ứng dụng bên thứ ba truy cập tài nguyên của user mà không cần biết password.

### 8.2 Các roles trong OAuth 2.0

```
┌─────────────────┐
│  Resource Owner  │  → User (người sở hữu tài nguyên)
└─────────────────┘
        │
        │ Ủy quyền
        ▼
┌─────────────────┐     ┌─────────────────────┐
│     Client       │ ──→ │ Authorization Server │
│  (Ứng dụng)     │ ←── │    (Google, FB,...)  │
└─────────────────┘     └─────────────────────┘
        │                          │
        │                          │
        ▼                          ▼
┌─────────────────────────────────────────┐
│           Resource Server                │
│  (Chứa tài nguyên: profile, email,...) │
└─────────────────────────────────────────┘
```

### 8.3 Authorization Code Flow

```
1. User click "Đăng nhập bằng Google"
2. App redirect đến Google Authorization Server
3. User đăng nhập Google và cho phép ứng dụng truy cập
4. Google redirect về app kèm authorization code
5. App gửi code + client_secret đến Google để lấy access token
6. App dùng access token lấy thông tin user từ Google
7. App tạo account/session cho user
```

### 8.4 Triển khai Google OAuth với Passport

```bash
npm install passport-google-oauth20
```

```javascript
// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Tìm user với Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Tạo user mới
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));
```

```javascript
// routes/auth.routes.js

// Bước 1: Redirect đến Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Bước 2: Google callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  (req, res) => {
    // Tạo JWT token
    const token = jwt.sign(
      { sub: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Redirect về frontend kèm token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);
```

---

## 9. Cookie vs localStorage vs httpOnly Cookie

### So sánh chi tiết

| Tiêu chí | localStorage | Regular Cookie | httpOnly Cookie |
|-----------|-------------|----------------|-----------------|
| **JavaScript truy cập** | Có | Có | **Không** |
| **Tự động gửi** | Không | Có (mỗi request) | Có (mỗi request) |
| **Dung lượng** | 5-10MB | 4KB | 4KB |
| **XSS vulnerable** | **Có** | **Có** | **Không** |
| **CSRF vulnerable** | Không | **Có** | **Có** |
| **Server truy cập** | Không | Có | Có |

### 9.1 localStorage

```javascript
// Client-side (Frontend)
// Lưu token sau khi đăng nhập
localStorage.setItem('accessToken', 'eyJhbGciOi...');

// Gửi token mỗi request
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

// XÓA khi đăng xuất
localStorage.removeItem('accessToken');

// NHƯỢC ĐIỂM:
// - Dễ bị XSS tấn công (JavaScript có thể đọc token)
// - Phải tự gửi token mỗi request
```

### 9.2 httpOnly Cookie (Khuyến nghị cho web apps)

```javascript
// Server-side
app.post('/api/auth/login', async (req, res) => {
  // ... xác thực user ...

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Gửi access token qua httpOnly cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,        // JavaScript KHÔNG THỂ truy cập
    secure: true,          // Chỉ gửi qua HTTPS
    sameSite: 'strict',    // Chống CSRF
    maxAge: 15 * 60 * 1000, // 15 phút
    path: '/',
    domain: '.myapp.com'   // Áp dụng cho tất cả subdomain
  });

  // Refresh token cũng dùng httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    path: '/api/auth/refresh'  // Chỉ gửi khi gọi refresh endpoint
  });

  res.json({
    success: true,
    user: { id: user.id, name: user.name }
    // KHÔNG gửi token trong body!
  });
});

// Middleware đọc token từ cookie
const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken; // Đọc từ cookie

  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Logout - xóa cookie
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Đăng xuất thành công' });
});
```

```javascript
// Client-side (Frontend) - Cần gửi credentials
fetch('/api/users', {
  credentials: 'include'  // GỬI COOKIES cross-origin
});

// Hoặc với Axios
axios.defaults.withCredentials = true;
```

### Khuyến nghị

- **SPA (React, Vue, Angular)**: httpOnly Cookie cho token
- **Mobile App**: Secure Storage (Keychain/Keystore)
- **Server-to-Server**: Authorization Header

---

## 10. Security Best Practices

### 10.1 Chống CSRF (Cross-Site Request Forgery)

```bash
npm install csurf
```

```javascript
// CSRF Protection
const csrf = require('csurf');

// Với cookie-based tokens
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
}));

// Gửi CSRF token cho client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Hoặc dùng SameSite cookie (đơn giản hơn)
res.cookie('token', accessToken, {
  sameSite: 'strict'  // Không gửi cookie cross-origin → chống CSRF
});
```

### 10.2 Chống XSS (Cross-Site Scripting)

```javascript
const helmet = require('helmet');

app.use(helmet()); // Set security headers

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));

// Sanitize input
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // Chống NoSQL injection

const xss = require('xss-clean');
app.use(xss()); // Sanitize user input

// Validate và sanitize mọi input
const { body } = require('express-validator');
app.post('/api/comments',
  body('content').trim().escape(), // Escape HTML
  handler
);
```

### 10.3 Các best practices khác

```javascript
// 1. HTTPS only
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// 2. Rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 lần đăng nhập / 15 phút
  message: 'Quá nhiều lần đăng nhập. Thử lại sau 15 phút.'
}));

// 3. Password policy
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .messages({
    'string.pattern.base': 'Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt'
  });

// 4. JWT Secret đủ mạnh (ít nhất 256 bits)
// Tạo: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

// 5. Không log sensitive data
// SAI:
console.log('Login:', { email, password });
// ĐÚNG:
console.log('Login attempt:', { email });

// 6. Timing-safe comparison cho tokens
const crypto = require('crypto');
const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// 7. Account lockout sau nhiều lần login thất bại
userSchema.add({
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
});

userSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock 30 phút
  }
  await this.save();
};
```

---

## 11. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

// ===== Global Rate Limiter =====
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 100,                    // 100 requests / 15 phút
  message: {
    success: false,
    message: 'Quá nhiều request. Vui lòng thử lại sau.',
    retryAfter: 900  // seconds
  },
  standardHeaders: true,  // `RateLimit-*` headers
  legacyHeaders: false,   // Tắt `X-RateLimit-*` headers
  keyGenerator: (req) => {
    return req.ip; // Rate limit theo IP
  }
});

app.use('/api', globalLimiter);

// ===== Login Rate Limiter (nghiêm ngặt hơn) =====
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Thử lại sau 15 phút.',
    code: 'RATE_LIMIT_LOGIN'
  },
  skipSuccessfulRequests: true  // Chỉ đếm request thất bại
});

app.use('/api/auth/login', loginLimiter);

// ===== API Key based rate limiting =====
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 1000,
  keyGenerator: (req) => {
    return req.get('X-API-Key') || req.ip;
  }
});

// ===== Slow Down (giảm tốc thay vì block) =====
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,     // Bắt đầu delay sau 50 requests
  delayMs: (hits) => hits * 100,  // Delay tăng dần: 100ms, 200ms, 300ms, ...
  maxDelayMs: 5000     // Delay tối đa 5 giây
});

app.use('/api', speedLimiter);
```

---

## 12. Code Example: Full Auth Flow

### Hệ thống xác thực hoàn chỉnh

```javascript
// ===============================================
// config/env.js
// ===============================================
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-min-32-characters-long',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  JWT_ACCESS_EXPIRATION: '15m',
  JWT_REFRESH_EXPIRATION: '7d',
  BCRYPT_SALT_ROUNDS: 10
};

// ===============================================
// utils/token.js
// ===============================================
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRATION }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRATION }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

// ===============================================
// services/auth.service.js
// ===============================================
const bcrypt = require('bcrypt');
const config = require('../config/env');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { UnauthorizedError, BadRequestError, ConflictError } = require('../utils/errors');

// Giả lập database
const users = [];
const refreshTokenStore = new Map(); // userId -> Set of refresh tokens

class AuthService {
  async register({ name, email, password }) {
    // Kiểm tra email trùng
    const existing = users.find(u => u.email === email);
    if (existing) {
      throw new ConflictError('Email đã được đăng ký');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

    // Tạo user
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Tạo tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token
    this._storeRefreshToken(user.id, refreshToken);

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    // Tìm user
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra active
    if (!user.isActive) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    this._storeRefreshToken(user.id, refreshToken);

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(oldRefreshToken) {
    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch (error) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra token có trong store
    const userTokens = refreshTokenStore.get(decoded.sub);
    if (!userTokens || !userTokens.has(oldRefreshToken)) {
      // Token không tồn tại → có thể bị reuse
      // Xóa tất cả tokens của user (bắt buộc đăng nhập lại)
      refreshTokenStore.delete(decoded.sub);
      throw new UnauthorizedError('Refresh token đã bị sử dụng. Vui lòng đăng nhập lại.');
    }

    // Tìm user
    const user = users.find(u => u.id === decoded.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Token rotation: xóa token cũ, tạo token mới
    userTokens.delete(oldRefreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    this._storeRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(userId, refreshToken) {
    const userTokens = refreshTokenStore.get(userId);
    if (userTokens) {
      userTokens.delete(refreshToken);
      if (userTokens.size === 0) {
        refreshTokenStore.delete(userId);
      }
    }
  }

  async logoutAll(userId) {
    refreshTokenStore.delete(userId);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new NotFoundError('User');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Mật khẩu hiện tại không đúng');
    }

    user.password = await bcrypt.hash(newPassword, config.BCRYPT_SALT_ROUNDS);

    // Invalidate tất cả refresh tokens (bắt buộc đăng nhập lại trên các device khác)
    refreshTokenStore.delete(userId);

    // Tạo token mới cho session hiện tại
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    this._storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  getUserById(id) {
    const user = users.find(u => u.id === id);
    return user ? this._sanitizeUser(user) : null;
  }

  _storeRefreshToken(userId, token) {
    if (!refreshTokenStore.has(userId)) {
      refreshTokenStore.set(userId, new Set());
    }
    refreshTokenStore.get(userId).add(token);
  }

  _sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();

// ===============================================
// controllers/auth.controller.js
// ===============================================
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: result
    });
  });

  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token là bắt buộc'
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: tokens
    });
  });

  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id, req.body.refreshToken);

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  });

  logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user.id);

    res.json({
      success: true,
      message: 'Đã đăng xuất khỏi tất cả thiết bị'
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const tokens = await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
      data: tokens
    });
  });
}

module.exports = new AuthController();

// ===============================================
// routes/auth.routes.js
// ===============================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
```

---

## 13. Sai lầm thường gặp

### Sai lầm 1: Lưu password dạng plain text

```javascript
// SAI - NGUY HIỂM CỰC KỲ!
const user = { email: 'a@b.com', password: '123456' };
await User.create(user);

// ĐÚNG
const hashedPassword = await bcrypt.hash('123456', 10);
const user = { email: 'a@b.com', password: hashedPassword };
await User.create(user);
```

### Sai lầm 2: JWT Secret quá yếu

```javascript
// SAI
const JWT_SECRET = 'secret';      // Quá ngắn, dễ đoán
const JWT_SECRET = 'password123'; // Quá đơn giản

// ĐÚNG - Ít nhất 256 bits (32 bytes)
// Tạo bằng: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
const JWT_SECRET = 'a1b2c3d4e5f6...rất_dài_và_random';
```

### Sai lầm 3: Lưu thông tin nhạy cảm trong JWT payload

```javascript
// SAI
const token = jwt.sign({
  userId: user.id,
  password: user.password,      // KHÔNG!
  creditCard: user.creditCard,  // KHÔNG!
  ssn: user.ssn                 // KHÔNG!
}, secret);

// ĐÚNG - Chỉ lưu thông tin tối thiểu
const token = jwt.sign({
  sub: user.id,
  role: user.role
}, secret);
```

### Sai lầm 4: Không set expiration cho JWT

```javascript
// SAI - Token sống mãi mãi
const token = jwt.sign({ sub: user.id }, secret);

// ĐÚNG
const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '15m' });
```

### Sai lầm 5: Trả message khác nhau cho email sai vs password sai

```javascript
// SAI - Cho phép kẻ tấn công biết email nào tồn tại (user enumeration)
if (!user) return res.status(401).json({ message: 'Email không tồn tại' });
if (!isMatch) return res.status(401).json({ message: 'Mật khẩu sai' });

// ĐÚNG - Message chung chung
if (!user || !isMatch) {
  return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
}
```

---

## 14. Bài tập thực hành

### Bài tập 1: Hệ thống Auth cơ bản (Trung bình)

Xây dựng API authentication với:

1. **POST /api/auth/register** - Đăng ký (name, email, password)
   - Validate email format, password min 8 ký tự
   - Hash password với bcrypt
   - Trả về user info + JWT token
2. **POST /api/auth/login** - Đăng nhập
   - Trả về access token (15 phút) + refresh token (7 ngày)
3. **POST /api/auth/refresh** - Làm mới token
   - Token rotation
4. **POST /api/auth/logout** - Đăng xuất
5. **GET /api/auth/me** - Lấy thông tin user (protected)
6. **POST /api/auth/change-password** - Đổi mật khẩu (protected)

### Bài tập 2: Role-based Access Control (Nâng cao)

Mở rộng bài tập 1 với:

1. Roles: `user`, `editor`, `admin`
2. Permissions:
   - `user`: Đọc tất cả, sửa/xóa của mình
   - `editor`: Đọc/sửa tất cả, xóa của mình
   - `admin`: Full quyền
3. Routes:
   - `GET /api/users` - Admin only
   - `DELETE /api/users/:id` - Admin only
   - `PUT /api/posts/:id` - Editor + Admin + Owner
   - `DELETE /api/posts/:id` - Admin + Owner
4. Middleware `authorize(roles)` và `checkOwnership(model)`

### Bài tập 3: Multi-device Session Management (Nâng cao)

1. Theo dõi user đăng nhập trên nhiều thiết bị
2. Mỗi lần login → tạo session mới với device info
3. **GET /api/auth/sessions** - Xem tất cả sessions
4. **DELETE /api/auth/sessions/:sessionId** - Đăng xuất 1 thiết bị
5. **DELETE /api/auth/sessions** - Đăng xuất tất cả
6. Lưu thông tin: device, IP, last active, login time

**Test với curl:**

```bash
# Đăng ký
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Phong", "email": "phong@gmail.com", "password": "SecurePass123!"}'

# Đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "phong@gmail.com", "password": "SecurePass123!"}'

# Truy cập protected route
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<REFRESH_TOKEN>"}'
```

---

> **Tiếp theo:** [05 - REST API Design](../05-REST-API-Design/README.md) - Thiết kế REST API chuyên nghiệp theo chuẩn.
