# Giới thiệu Express.js

## 1. Express.js là gì?

**Express.js** (thường gọi tắt là Express) là một **web application framework** cho Node.js, được thiết kế để xây dựng các ứng dụng web và API một cách nhanh chóng, dễ dàng. Express cung cấp một lớp mỏng (thin layer) bên trên Node.js HTTP module, giúp ta không phải tự xử lý raw HTTP request/response.

### Đặc điểm chính

| Đặc điểm | Mô tả |
|-----------|--------|
| **Minimalist** | Chỉ cung cấp những thứ cốt lõi, phần còn lại dùng middleware |
| **Unopinionated** | Không ép buộc cấu trúc project cụ thể nào |
| **Middleware-based** | Mọi thứ đều xoay quanh middleware pipeline |
| **Routing** | Hệ thống routing mạnh mẽ, linh hoạt |
| **Cộng đồng lớn** | Hàng nghìn middleware/package trên npm |

### So sánh Node.js thuần vs Express

**Node.js thuần:**

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users: [] }));
  } else if (req.method === 'POST' && req.url === '/api/users') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const user = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

**Express:**

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  res.status(201).json(req.body);
});

app.listen(3000);
```

Rõ ràng Express giúp code gọn gàng, dễ đọc hơn rất nhiều.

---

## 2. Tại sao dùng Express?

### Ưu điểm

1. **Đơn giản, dễ học**: API trực quan, documentation tốt
2. **Linh hoạt**: Không ép cấu trúc, tự do tổ chức code
3. **Hệ sinh thái phong phú**: Hàng nghìn middleware có sẵn trên npm
4. **Performance tốt**: Lightweight, overhead thấp
5. **Cộng đồng lớn nhất**: Framework phổ biến nhất cho Node.js
6. **Nền tảng cho các framework khác**: NestJS, Sails.js, Loopback đều build trên Express

### Nhược điểm

1. **Quá tự do**: Không có convention chuẩn, dễ tạo code lộn xộn
2. **Callback-based gốc**: Cần thêm wrapper cho async/await
3. **Không có cấu trúc sẵn**: Phải tự tổ chức project structure
4. **Thiếu tính năng built-in**: Validation, ORM, Authentication đều phải thêm riêng

### Khi nào nên dùng Express?

- Xây dựng REST API
- Xây dựng server-side rendered web app
- Microservices
- API Gateway
- Real-time application (kết hợp Socket.io)
- Prototype nhanh

---

## 3. Cài đặt và Setup Project

### Khởi tạo project từ đầu

```bash
# Tạo thư mục project
mkdir my-express-app
cd my-express-app

# Khởi tạo package.json
npm init -y

# Cài đặt Express
npm install express

# Cài đặt các package phát triển
npm install -D nodemon
```

### Cấu hình package.json

```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "Express.js learning project",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### File app.js cơ bản

```javascript
// src/app.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware parse JSON body
app.use(express.json());

// Middleware parse URL-encoded body (form data)
app.use(express.urlencoded({ extended: true }));

// Route đơn giản
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với Express.js!',
    version: '1.0.0'
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
```

### Sử dụng ES Modules (import/export)

```json
// package.json - thêm "type": "module"
{
  "type": "module"
}
```

```javascript
// src/app.js (ES Modules)
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello Express with ES Modules!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Sử dụng Express Generator (tạo project nhanh)

```bash
# Cài đặt express-generator globally
npm install -g express-generator

# Tạo project với view engine EJS
express --view=ejs my-app

# Cài dependencies và chạy
cd my-app
npm install
npm start
```

---
