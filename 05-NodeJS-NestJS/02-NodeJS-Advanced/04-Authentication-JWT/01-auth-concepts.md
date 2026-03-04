# Authentication vs Authorization & Session-based Authentication

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
