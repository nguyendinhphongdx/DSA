# JWT Deep Dive

## 3. JWT (JSON Web Token)

### 3.1 JWT la gi?

JWT la mot chuan mo (RFC 7519) cho phep truyen thong tin an toan giua cac ben duoi dang JSON object. Token duoc ky (signed) de dam bao tinh toan ven.

### 3.2 Cau truc JWT

JWT gom 3 phan, ngan cach boi dau cham (`.`):

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature (Chu ky)
  │      └── Payload (Du lieu)
  └── Header (Tieu de)
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
  // Registered claims (chuan)
  "iss": "myapp.com",           // Issuer - ai tao token
  "sub": "user123",             // Subject - doi tuong token
  "aud": "myapp.com",           // Audience - ai nhan token
  "exp": 1700000000,            // Expiration time (UNIX timestamp)
  "iat": 1699996400,            // Issued at (thoi diem tao)
  "nbf": 1699996400,            // Not before (token chua valid truoc thoi diem nay)
  "jti": "unique-id-123",       // JWT ID (unique identifier)

  // Custom claims (tuy chinh)
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

**QUAN TRONG:** JWT **KHONG** ma hoa du lieu! Bat ky ai cung co the decode payload. JWT chi dam bao du lieu khong bi thay doi (integrity). Tuyet doi **KHONG** luu thong tin nhay cam (password, credit card) trong JWT payload.

### 3.3 Tao va Verify JWT

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-min-32-chars';

// ===== Tao Token =====
const createToken = (userId, role) => {
  const payload = {
    sub: userId,         // Subject
    role: role,          // Custom claim
    iat: Date.now()      // Issued at
  };

  const options = {
    expiresIn: '15m',           // Het han sau 15 phut
    // expiresIn: '1h'          // 1 gio
    // expiresIn: '7d'          // 7 ngay
    // expiresIn: 60 * 15       // 15 phut (seconds)
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

// ===== Decode Token (khong verify) =====
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
  // Tra ve { header, payload, signature }
  // CANH BAO: Khong verify signature! Dung cho debugging
};

// Vi du su dung
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

// Gia lap database
const users = [
  {
    id: '1',
    email: 'phong@gmail.com',
    // password: '123456' (da hash)
    password: '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    name: 'Phong',
    role: 'admin'
  }
];

// Luu refresh tokens (trong thuc te dung Redis hoac DB)
const refreshTokens = new Set();

// ===== DANG NHAP =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tim user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung'
      });
    }

    // 2. So sanh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung'
      });
    }

    // 3. Tao Access Token (ngan han)
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 4. Tao Refresh Token (dai han)
    const refreshToken = jwt.sign(
      { sub: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Luu refresh token
    refreshTokens.add(refreshToken);

    // 6. Gui response
    res.json({
      success: true,
      message: 'Dang nhap thanh cong',
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
    res.status(500).json({ success: false, message: 'Loi server' });
  }
});
```

### 4.2 Verify Middleware

```javascript
// middlewares/auth.middleware.js
const authenticate = (req, res, next) => {
  try {
    // 1. Lay token tu header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token khong duoc cung cap'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Gan thong tin user vao request
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
        message: 'Token da het han',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token khong hop le',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Xac thuc that bai'
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' khong co quyen. Yeu cau: ${roles.join(', ')}`
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

  // 1. Kiem tra refresh token co ton tai
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token khong hop le'
    });
  }

  try {
    // 2. Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // 3. Tim user
    const user = users.find(u => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User khong ton tai'
      });
    }

    // 4. Tao access token moi
    const newAccessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 5. (Tuy chon) Tao refresh token moi (Token Rotation)
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
    // Refresh token het han → user phai dang nhap lai
    refreshTokens.delete(refreshToken);
    return res.status(401).json({
      success: false,
      message: 'Refresh token da het han. Vui long dang nhap lai.'
    });
  }
});

// ===== LOGOUT =====
app.post('/api/auth/logout', authenticate, (req, res) => {
  const { refreshToken } = req.body;

  // Xoa refresh token
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({
    success: true,
    message: 'Dang xuat thanh cong'
  });
});
```

---

## 5. Access Token va Refresh Token

### Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    ACCESS TOKEN                             │
│  - Thoi han NGAN: 15 phut - 1 gio                        │
│  - Chua thong tin user (id, role, email)                   │
│  - Gui trong Authorization header moi request              │
│  - Neu bi danh cap → thiet hai gioi han (het han nhanh)  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   REFRESH TOKEN                             │
│  - Thoi han DAI: 7 ngay - 30 ngay                         │
│  - Chi chua user ID                                        │
│  - Chi dung de lay access token moi                        │
│  - Luu tru an toan (httpOnly cookie / secure storage)       │
│  - Co the revoke tu server                                  │
└────────────────────────────────────────────────────────────┘
```

### Token Rotation (Khuyen nghi)

```javascript
// Moi lan dung refresh token → tao refresh token MOI
// Refresh token cu bi vo hieu hoa

// Loi ich:
// - Neu refresh token bi danh cap, ke tan cong chi dung duoc 1 lan
// - Khi user hop le dung refresh token (da bi revoke) → phat hien bi hack
// - Tu dong "day" ke tan cong ra khi user that refresh

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // 1. Kiem tra token co trong danh sach hop le
  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken) {
    // Token khong ton tai → co the da bi dung roi (reuse detection)
    // Xoa TAT CA refresh tokens cua user (bat buoc dang nhap lai)
    const decoded = jwt.decode(refreshToken);
    if (decoded) {
      await RefreshToken.deleteMany({ userId: decoded.sub });
    }

    return res.status(401).json({
      success: false,
      message: 'Refresh token da bi su dung. Tat ca sessions da bi dang xuat.',
      code: 'TOKEN_REUSE_DETECTED'
    });
  }

  // 2. Verify token
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

  // 3. XOA token cu
  await RefreshToken.deleteOne({ token: refreshToken });

  // 4. Tao token moi (ca access va refresh)
  const newAccessToken = generateAccessToken(decoded.sub);
  const newRefreshToken = generateRefreshToken(decoded.sub);

  // 5. Luu refresh token moi
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
// Khi can vo hieu hoa token truoc khi het han
// VD: User dang xuat, doi mat khau, bi ban

// Dung Redis de luu blacklisted tokens
const Redis = require('ioredis');
const redis = new Redis();

// Blacklist mot token
const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000); // Thoi gian con lai

  if (ttl > 0) {
    await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  }
};

// Kiem tra token co bi blacklist
const isBlacklisted = async (token) => {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
};

// Middleware kiem tra blacklist
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token khong duoc cung cap' });
  }

  // Kiem tra blacklist
  if (await isBlacklisted(token)) {
    return res.status(401).json({ message: 'Token da bi vo hieu hoa' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token khong hop le' });
  }
};

// Logout - blacklist access token
app.post('/api/auth/logout', authenticate, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await blacklistToken(token);

  // Xoa refresh token
  await RefreshToken.deleteMany({ userId: req.user.sub });

  res.json({ message: 'Dang xuat thanh cong' });
});
```

---
