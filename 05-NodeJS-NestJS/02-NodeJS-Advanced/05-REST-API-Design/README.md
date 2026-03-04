# REST API Design

## Muc luc

- [1. REST la gi?](#1-rest-la-gi)
- [2. Cac nguyen tac REST (REST Constraints)](#2-cac-nguyen-tac-rest-rest-constraints)
- [3. Resource Naming Conventions](#3-resource-naming-conventions)
- [4. HTTP Methods Mapping](#4-http-methods-mapping)
- [5. HTTP Status Codes Best Practices](#5-http-status-codes-best-practices)
- [6. Request va Response Format](#6-request-va-response-format)
- [7. Pagination](#7-pagination)
- [8. Filtering, Sorting va Searching](#8-filtering-sorting-va-searching)
- [9. API Versioning](#9-api-versioning)
- [10. HATEOAS](#10-hateoas)
- [11. Rate Limiting](#11-rate-limiting)
- [12. API Documentation voi Swagger/OpenAPI](#12-api-documentation-voi-swaggeropenapi)
- [13. Request Validation](#13-request-validation)
- [14. Error Response Format thong nhat](#14-error-response-format-thong-nhat)
- [15. Code Example: Full REST API voi Express](#15-code-example-full-rest-api-voi-express)
- [16. Sai lam thuong gap](#16-sai-lam-thuong-gap)
- [17. Best Practices tong hop](#17-best-practices-tong-hop)
- [18. Bai tap thuc hanh](#18-bai-tap-thuc-hanh)

---

## 1. REST la gi?

**REST** (Representational State Transfer) la mot **kien truc phan mem** (architectural style) duoc Roy Fielding gioi thieu trong luan van tien si cua ong nam 2000. REST khong phai la mot giao thuc (protocol) hay thu vien, ma la mot **tap hop cac rang buoc thiet ke** (constraints) de xay dung cac he thong phan tan (distributed systems), dac biet la cac web service.

### Tai sao REST pho bien?

| Ly do | Giai thich |
|-------|------------|
| **Don gian** | Su dung HTTP methods co san (GET, POST, PUT, DELETE) |
| **Stateless** | Moi request doc lap, server khong luu trang thai client |
| **Scalable** | De dang mo rong do tinh stateless |
| **Flexible** | Ho tro nhieu dinh dang du lieu (JSON, XML, v.v.) |
| **Cong dong lon** | Hang ngan tools, thu vien ho tro |

### REST vs SOAP vs GraphQL

| Tieu chi | REST | SOAP | GraphQL |
|----------|------|------|---------|
| **Dinh dang** | JSON (chu yeu) | XML (bat buoc) | JSON |
| **Giao thuc** | HTTP | HTTP, SMTP, TCP | HTTP |
| **Do phuc tap** | Thap | Cao | Trung binh |
| **Over-fetching** | Co the xay ra | Co the xay ra | Khong |
| **Caching** | Co san (HTTP cache) | Kho | Kho |
| **Learning curve** | Thap | Cao | Trung binh |

---

## 2. Cac nguyen tac REST (REST Constraints)

REST dinh nghia **6 rang buoc chinh**. Mot API chi duoc goi la RESTful khi tuan thu tat ca cac rang buoc nay.

### 2.1. Client-Server (Phan tach Client va Server)

Client va Server hoat dong doc lap. Client chi biet URI cua resource va khong can biet cach server luu tru du lieu. Server chi tra ve du lieu khi duoc yeu cau.

```
Client (React, Mobile App, ...)
    |
    | HTTP Request
    v
Server (Express API)
    |
    | HTTP Response
    v
Client nhan du lieu va hien thi
```

**Loi ich:**
- Client va Server co the phat trien doc lap
- Co the thay doi frontend ma khong anh huong backend va nguoc lai
- De dang tao nhieu loai client khac nhau (web, mobile, desktop)

### 2.2. Stateless (Khong trang thai)

Moi request tu client phai chua **tat ca thong tin** can thiet de server xu ly. Server **khong luu bat ky trang thai nao** cua client giua cac request.

```javascript
// SAI - Server luu trang thai (stateful)
let currentUser = null;

app.post('/login', (req, res) => {
  currentUser = findUser(req.body.email); // Luu vao bien - SAI!
  res.json({ message: 'Logged in' });
});

app.get('/profile', (req, res) => {
  res.json(currentUser); // Dung bien da luu - SAI!
});

// DUNG - Stateless: Moi request tu mang thong tin xac thuc
app.get('/profile', authenticateToken, (req, res) => {
  // Token JWT trong header Authorization chua thong tin user
  const user = req.user; // Lay tu token, khong phai tu server state
  res.json(user);
});
```

**Loi ich:**
- De dang scale horizontal (them nhieu server instances)
- Khong can sticky session
- Moi server instance deu co the xu ly bat ky request nao

### 2.3. Uniform Interface (Giao dien thong nhat)

Day la rang buoc **quan trong nhat** cua REST. No bao gom 4 nguyen tac con:

**a) Identification of Resources:** Moi resource duoc dinh danh boi mot URI duy nhat.

```
GET /users/123        -> User co id 123
GET /posts/456        -> Post co id 456
GET /users/123/posts  -> Tat ca posts cua user 123
```

**b) Manipulation through Representations:** Client thao tac voi resource thong qua cac "bieu dien" (representation) cua no, thuong la JSON.

```javascript
// Client gui representation cua resource de tao moi
POST /users
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "a@example.com"
}
```

**c) Self-descriptive Messages:** Moi message phai chua du thong tin de hieu cach xu ly no.

```
GET /users HTTP/1.1
Host: api.example.com
Accept: application/json         <- Client muon nhan JSON
Authorization: Bearer <token>    <- Thong tin xac thuc
```

**d) HATEOAS:** Server tra ve cac link lien quan de client biet cac hanh dong tiep theo (se noi chi tiet o phan 10).

### 2.4. Cacheable (Co the cache)

Response tu server phai chi ro co the cache duoc hay khong. Dieu nay giup giam tai cho server va tang toc do cho client.

```javascript
// Response co the cache
app.get('/api/products', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=3600', // Cache 1 gio
    'ETag': '"v1-products-hash"'
  });
  res.json(products);
});

// Response KHONG nen cache
app.get('/api/users/me', authenticateToken, (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  });
  res.json(req.user);
});
```

### 2.5. Layered System (He thong phan lop)

Client khong biet no dang giao tiep truc tiep voi server hay thong qua cac lop trung gian (load balancer, CDN, API gateway, v.v.).

```
Client -> CDN -> Load Balancer -> API Gateway -> Application Server -> Database
```

### 2.6. Code on Demand (Tuy chon)

Day la rang buoc **duy nhat khong bat buoc**. Server co the gui executable code (nhu JavaScript) cho client de mo rong chuc nang.

---

## 3. Resource Naming Conventions

### Nguyen tac dat ten Resource

| Quy tac | Dung | Sai |
|---------|------|-----|
| Dung **danh tu so nhieu** | `/users` | `/getUsers`, `/user` |
| Dung **chu thuong** | `/blog-posts` | `/BlogPosts`, `/Blog_Posts` |
| Dung **hyphen (-)** de ngan cach | `/blog-posts` | `/blog_posts`, `/blogPosts` |
| Khong dung **dong tu** | `/users` | `/createUser`, `/deleteUser` |
| The hien **quan he phan cap** | `/users/123/posts` | `/getUserPosts?userId=123` |
| Khong dung **duoi file** | `/users` | `/users.json` |

### Cau truc URL mau

```
# Collection (tap hop resources)
GET    /api/users              -> Lay tat ca users
POST   /api/users              -> Tao user moi

# Document (mot resource cu the)
GET    /api/users/123           -> Lay user co id 123
PUT    /api/users/123           -> Cap nhat toan bo user 123
PATCH  /api/users/123           -> Cap nhat mot phan user 123
DELETE /api/users/123           -> Xoa user 123

# Sub-collection (tap hop con)
GET    /api/users/123/posts     -> Lay tat ca posts cua user 123
POST   /api/users/123/posts     -> Tao post moi cho user 123

# Sub-document
GET    /api/users/123/posts/456 -> Lay post 456 cua user 123

# Khong nen qua 3 cap
# SAI:  /api/users/123/posts/456/comments/789/likes
# DUNG: /api/comments/789/likes (hoac /api/likes?commentId=789)
```

### Vi du cau truc routes cho ung dung E-commerce

```javascript
// routes/product.routes.js
const express = require('express');
const router = express.Router();

// Products
router.get('/products', productController.getAll);
router.get('/products/:id', productController.getById);
router.post('/products', productController.create);
router.put('/products/:id', productController.replace);
router.patch('/products/:id', productController.update);
router.delete('/products/:id', productController.remove);

// Product reviews (sub-resource)
router.get('/products/:id/reviews', reviewController.getByProduct);
router.post('/products/:id/reviews', reviewController.create);

// Product categories (sub-resource)
router.get('/products/:id/categories', categoryController.getByProduct);

// Categories (top-level resource)
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.get('/categories/:id/products', productController.getByCategory);

module.exports = router;
```

---

## 4. HTTP Methods Mapping

### Cac HTTP Method chinh

| Method | Hanh dong | Idempotent | Safe | Co Body? |
|--------|-----------|------------|------|----------|
| **GET** | Doc (Read) | Co | Co | Khong |
| **POST** | Tao (Create) | Khong | Khong | Co |
| **PUT** | Thay the (Replace) | Co | Khong | Co |
| **PATCH** | Cap nhat mot phan (Update) | Khong* | Khong | Co |
| **DELETE** | Xoa (Remove) | Co | Khong | Khong |
| **HEAD** | Nhu GET nhung chi tra header | Co | Co | Khong |
| **OPTIONS** | Lay thong tin ve endpoint | Co | Co | Khong |

> **Idempotent**: Goi nhieu lan cho cung ket qua nhu goi 1 lan
> **Safe**: Khong thay doi trang thai server

### Chi tiet tung Method

#### GET - Doc du lieu

```javascript
// Lay danh sach users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Khong the lay danh sach nguoi dung'
    });
  }
});

// Lay mot user theo ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Khong tim thay user voi id ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

#### POST - Tao du lieu moi

```javascript
// Tao user moi
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiem tra user da ton tai chua
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email da ton tai trong he thong'
      });
    }

    const user = await User.create({ name, email, password });

    // Tra ve 201 Created voi resource vua tao
    res.status(201).json({
      success: true,
      data: user,
      message: 'Tao nguoi dung thanh cong'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Du lieu khong hop le',
      errors: error.errors
    });
  }
});
```

#### PUT - Thay the toan bo resource

```javascript
// PUT thay the TOAN BO resource
// Tat ca cac truong khong gui se bi set ve null/default
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Validate tat ca required fields phai co mat
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'PUT yeu cau tat ca required fields: name, email'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone: phone || null, address: address || null },
      { new: true, runValidators: true, overwrite: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay user'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Du lieu khong hop le'
    });
  }
});
```

#### PATCH - Cap nhat mot phan resource

```javascript
// PATCH chi cap nhat nhung truong duoc gui len
app.patch('/api/users/:id', async (req, res) => {
  try {
    // Chi cap nhat nhung truong co trong request body
    const allowedFields = ['name', 'email', 'phone', 'address'];
    const updateData = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Khong co truong hop le nao de cap nhat'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay user'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Cap nhat thanh cong'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Du lieu khong hop le'
    });
  }
});
```

#### DELETE - Xoa resource

```javascript
// Xoa user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay user de xoa'
      });
    }

    // 204 No Content - Xoa thanh cong, khong tra ve body
    res.status(204).send();

    // HOAC tra ve thong bao thanh cong
    // res.status(200).json({
    //   success: true,
    //   message: 'Xoa user thanh cong',
    //   data: null
    // });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi khi xoa user'
    });
  }
});
```

### So sanh PUT vs PATCH

```javascript
// Du lieu hien tai cua user:
// { name: "Phong", email: "phong@mail.com", phone: "0123", address: "HN" }

// PUT /api/users/1 - Body: { name: "Phong Updated", email: "phong@mail.com" }
// Ket qua: { name: "Phong Updated", email: "phong@mail.com", phone: null, address: null }
// => phone va address bi mat vi PUT thay the TOAN BO

// PATCH /api/users/1 - Body: { name: "Phong Updated" }
// Ket qua: { name: "Phong Updated", email: "phong@mail.com", phone: "0123", address: "HN" }
// => Chi name thay doi, cac truong khac giu nguyen
```

---

## 5. HTTP Status Codes Best Practices

### Nhom Status Codes

| Nhom | Y nghia | Vi du |
|------|---------|-------|
| **1xx** | Informational | 100 Continue |
| **2xx** | Thanh cong | 200, 201, 204 |
| **3xx** | Chuyen huong | 301, 302, 304 |
| **4xx** | Loi tu Client | 400, 401, 403, 404 |
| **5xx** | Loi tu Server | 500, 502, 503 |

### Cac Status Code thuong dung trong REST API

#### 2xx - Thanh cong

```javascript
// 200 OK - Request thanh cong (dung cho GET, PUT, PATCH)
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, data: users });
});

// 201 Created - Tao resource thanh cong (dung cho POST)
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// 204 No Content - Thanh cong nhung khong co body tra ve (dung cho DELETE)
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send(); // Khong gui body
});
```

#### 4xx - Loi Client

```javascript
// 400 Bad Request - Request khong hop le (thieu truong, sai format, v.v.)
app.post('/api/users', (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: 'Thieu truong bat buoc',
      errors: [{ field: 'email', message: 'Email la bat buoc' }]
    });
  }
});

// 401 Unauthorized - Chua xac thuc (khong co token hoac token het han)
app.get('/api/profile', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: 'Vui long dang nhap de truy cap'
    });
  }
});

// 403 Forbidden - Da xac thuc nhung KHONG co quyen truy cap
app.delete('/api/users/:id', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Ban khong co quyen thuc hien hanh dong nay'
    });
  }
});

// 404 Not Found - Resource khong ton tai
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Khong tim thay user voi id ${req.params.id}`
    });
  }
});

// 409 Conflict - Xung dot (vd: email da ton tai, version conflict)
app.post('/api/users', async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Email da duoc su dung boi tai khoan khac'
    });
  }
});

// 422 Unprocessable Entity - Du lieu dung format nhung khong hop le ve logic
app.post('/api/orders', (req, res) => {
  if (req.body.quantity < 0) {
    return res.status(422).json({
      success: false,
      message: 'Du lieu khong hop le',
      errors: [{ field: 'quantity', message: 'So luong phai lon hon 0' }]
    });
  }
});

// 429 Too Many Requests - Qua nhieu request (rate limit)
app.use('/api/', (req, res) => {
  return res.status(429).json({
    success: false,
    message: 'Qua nhieu request. Vui long thu lai sau 60 giay',
    retryAfter: 60
  });
});
```

#### 5xx - Loi Server

```javascript
// 500 Internal Server Error - Loi server khong xac dinh
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server noi bo. Vui long thu lai sau'
    });
  }
});

// 503 Service Unavailable - Server tam thoi khong kha dung
app.get('/api/health', (req, res) => {
  if (!isDatabaseConnected) {
    return res.status(503).json({
      success: false,
      message: 'Dich vu tam thoi khong kha dung',
      retryAfter: 30
    });
  }
  res.json({ success: true, message: 'Server dang hoat dong' });
});
```

### Bang tom tat khi nao dung status code nao

| Tinh huong | Status Code |
|------------|-------------|
| Lay du lieu thanh cong | 200 OK |
| Tao moi thanh cong | 201 Created |
| Xoa thanh cong (khong tra body) | 204 No Content |
| Cap nhat thanh cong | 200 OK |
| Request thieu du lieu / sai format | 400 Bad Request |
| Chua dang nhap | 401 Unauthorized |
| Khong co quyen | 403 Forbidden |
| Resource khong ton tai | 404 Not Found |
| Trung lap du lieu | 409 Conflict |
| Du lieu dung format nhung sai logic | 422 Unprocessable Entity |
| Qua nhieu request | 429 Too Many Requests |
| Loi server | 500 Internal Server Error |

---

## 6. Request va Response Format

### Content-Type va Accept Headers

```javascript
const express = require('express');
const app = express();

// Middleware parse JSON body
app.use(express.json());

// Middleware parse URL-encoded body (form data)
app.use(express.urlencoded({ extended: true }));

// Kiem tra Accept header de tra ve dung format
app.get('/api/users', async (req, res) => {
  const users = await User.find();

  // Kiem tra client muon nhan format nao
  const acceptHeader = req.get('Accept');

  if (acceptHeader === 'application/xml') {
    // Tra ve XML (can thu vien nhu js2xmlparser)
    const xml = js2xmlparser.parse('users', users);
    res.set('Content-Type', 'application/xml');
    return res.send(xml);
  }

  // Mac dinh tra ve JSON
  res.set('Content-Type', 'application/json');
  res.json({
    success: true,
    data: users
  });
});
```

### Cau truc Response chuan

```javascript
// Response thanh cong - Lay danh sach
{
  "success": true,
  "data": [
    { "id": 1, "name": "Nguyen Van A", "email": "a@mail.com" },
    { "id": 2, "name": "Tran Van B", "email": "b@mail.com" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}

// Response thanh cong - Lay 1 item
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@mail.com"
  }
}

// Response loi
{
  "success": false,
  "message": "Du lieu khong hop le",
  "errors": [
    { "field": "email", "message": "Email khong dung dinh dang" },
    { "field": "password", "message": "Mat khau phai co it nhat 8 ky tu" }
  ]
}
```

### Response Helper

```javascript
// utils/response.js
class ApiResponse {
  static success(res, data, statusCode = 200, message = 'Thanh cong') {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data, message = 'Tao thanh cong') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  }

  static error(res, statusCode, message, errors = null) {
    const response = {
      success: false,
      message
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;

// Su dung trong controller
const ApiResponse = require('../utils/response');

exports.getUsers = async (req, res) => {
  const users = await User.find();
  return ApiResponse.success(res, users);
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  return ApiResponse.created(res, user, 'Tao nguoi dung thanh cong');
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return ApiResponse.noContent(res);
};
```

---

## 7. Pagination

Khi API tra ve danh sach lon, ban **phai** phan trang de tranh tra ve qua nhieu du lieu trong mot lan.

### 7.1. Offset-based Pagination (Phan trang theo trang)

Day la cach phan trang **pho bien nhat**, su dung `page` va `limit` (hoac `skip` va `take`).

```javascript
// GET /api/users?page=2&limit=10
app.get('/api/users', async (req, res) => {
  try {
    // Lay params tu query string, dat gia tri mac dinh
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Gioi han limit toi da de tranh query qua lon
    const maxLimit = 100;
    const safeLimit = Math.min(limit, maxLimit);

    // Tinh so record can skip
    const skip = (page - 1) * safeLimit;

    // Query database
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(safeLimit).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

**Uu diem:**
- Don gian, de hieu
- Co the nhay den bat ky trang nao
- Phu hop voi hau het truong hop

**Nhuoc diem:**
- Khong on dinh khi du lieu thay doi (them/xoa giua cac trang)
- Hieu suat giam khi offset lon (skip nhieu record)

### 7.2. Cursor-based Pagination (Phan trang theo con tro)

Su dung mot truong duy nhat (thuong la `_id` hoac `createdAt`) lam "con tro" de xac dinh vi tri bat dau.

```javascript
// GET /api/users?cursor=507f1f77bcf86cd799439011&limit=10
app.get('/api/users', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const cursor = req.query.cursor;

    // Xay dung query
    let query = {};
    if (cursor) {
      // Lay cac record co _id NHO HON cursor (tuc la cu hon)
      query = { _id: { $lt: cursor } };
    }

    // Lay limit + 1 de biet co trang tiep theo hay khong
    const users = await User.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);

    // Kiem tra co trang tiep theo khong
    const hasNextPage = users.length > limit;
    if (hasNextPage) {
      users.pop(); // Bo record thua
    }

    // Cursor cho trang tiep theo la _id cua record cuoi cung
    const nextCursor = hasNextPage ? users[users.length - 1]._id : null;

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        limit,
        hasNextPage,
        nextCursor
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

**Uu diem:**
- Hieu suat tot hon voi du lieu lon
- On dinh khi du lieu thay doi
- Phu hop cho infinite scroll

**Nhuoc diem:**
- Khong the nhay den trang bat ky
- Phuc tap hon offset-based

### So sanh Offset vs Cursor

| Tieu chi | Offset-based | Cursor-based |
|----------|--------------|--------------|
| Do phuc tap | Thap | Trung binh |
| Hieu suat | Giam khi offset lon | Luon tot |
| On dinh | Khong on dinh | On dinh |
| Nhay trang | Duoc | Khong |
| Use case | Admin panel, danh sach nho | Feed, timeline, danh sach lon |

---

## 8. Filtering, Sorting va Searching

### 8.1. Filtering (Loc du lieu)

```javascript
// GET /api/products?status=active&category=electronics&minPrice=100&maxPrice=1000

app.get('/api/products', async (req, res) => {
  try {
    const {
      status,
      category,
      minPrice,
      maxPrice,
      brand,
      inStock
    } = req.query;

    // Xay dung object filter
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (brand) {
      // Ho tro nhieu brands: ?brand=apple,samsung
      filter.brand = { $in: brand.split(',') };
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

### Advanced Filter - Su dung MongoDB operators

```javascript
// GET /api/products?price[gte]=100&price[lte]=500&rating[gte]=4

app.get('/api/products', async (req, res) => {
  try {
    // Chuyen doi query string thanh MongoDB operators
    let queryStr = JSON.stringify(req.query);

    // Them dau $ vao truoc cac operators
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|ne|regex)\b/g,
      match => `$${match}`
    );

    const filter = JSON.parse(queryStr);

    // Loai bo cac truong khong phai filter
    const excludeFields = ['page', 'limit', 'sort', 'fields', 'q'];
    excludeFields.forEach(field => delete filter[field]);

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

### 8.2. Sorting (Sap xep)

```javascript
// GET /api/products?sort=price:asc,createdAt:desc
// GET /api/products?sort=-price,createdAt  (dau - la desc)

app.get('/api/products', async (req, res) => {
  try {
    let sortOption = {};

    if (req.query.sort) {
      // Cach 1: sort=price:asc,createdAt:desc
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        const [key, order] = field.split(':');
        sortOption[key] = order === 'desc' ? -1 : 1;
      });

      // Cach 2: sort=-price,createdAt (dau - la desc)
      // const sortBy = req.query.sort.split(',').join(' ');
      // query = query.sort(sortBy);
    } else {
      // Mac dinh sap xep theo ngay tao moi nhat
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find().sort(sortOption);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

### 8.3. Searching (Tim kiem)

```javascript
// GET /api/products?q=iphone

app.get('/api/products', async (req, res) => {
  try {
    let filter = {};

    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { brand: searchRegex }
        ]
      };
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});

// Full-text search voi MongoDB text index
// Truoc tien can tao text index trong schema
// productSchema.index({ name: 'text', description: 'text' });

app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Tham so tim kiem (q) la bat buoc'
      });
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

### 8.4. Field Selection (Chon truong tra ve)

```javascript
// GET /api/users?fields=name,email,avatar
// Chi tra ve cac truong duoc chon, giam kich thuoc response

app.get('/api/users', async (req, res) => {
  try {
    let selectFields = '';

    if (req.query.fields) {
      // Chuyen "name,email,avatar" thanh "name email avatar"
      selectFields = req.query.fields.split(',').join(' ');
    }

    const users = await User.find().select(selectFields);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

### 8.5. Ket hop tat ca: API Features Class

```javascript
// utils/apiFeatures.js
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'fields', 'q'];
    excludeFields.forEach(field => delete queryObj[field]);

    // Chuyen doi operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this; // Return this de chain methods
  }

  // Searching
  search() {
    if (this.queryString.q) {
      const regex = new RegExp(this.queryString.q, 'i');
      this.query = this.query.find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      });
    }
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field selection
  selectFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = Math.min(parseInt(this.queryString.limit) || 10, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.paginationInfo = { page, limit };
    return this;
  }
}

module.exports = APIFeatures;

// Su dung trong controller
// GET /api/products?status=active&price[gte]=100&sort=-price&fields=name,price&page=1&limit=10&q=iphone
app.get('/api/products', async (req, res) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .selectFields()
      .paginate();

    const products = await features.query;
    const total = await Product.countDocuments(features.query.getFilter());

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: features.paginationInfo.page,
        limit: features.paginationInfo.limit,
        total,
        totalPages: Math.ceil(total / features.paginationInfo.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
});
```

---

## 9. API Versioning

Khi API thay doi (breaking changes), ban can version de dam bao cac client cu van hoat dong.

### 9.1. URL Path Versioning (Pho bien nhat)

```javascript
const express = require('express');
const app = express();

// Import route files
const usersV1 = require('./routes/v1/users');
const usersV2 = require('./routes/v2/users');

// Version 1
app.use('/api/v1/users', usersV1);

// Version 2 - co thay doi breaking
app.use('/api/v2/users', usersV2);

// routes/v1/users.js
const router = require('express').Router();

router.get('/', async (req, res) => {
  const users = await User.find();
  // V1: tra ve truc tiep mang users
  res.json(users);
});

module.exports = router;

// routes/v2/users.js
const router = require('express').Router();

router.get('/', async (req, res) => {
  const users = await User.find();
  // V2: tra ve trong wrapper object voi pagination
  res.json({
    success: true,
    data: users,
    pagination: { page: 1, total: users.length }
  });
});

module.exports = router;
```

### 9.2. Header Versioning

```javascript
// Client gui: Accept-Version: v2
// Hoac: Accept: application/vnd.myapi.v2+json

// Middleware xu ly version tu header
function versionMiddleware(req, res, next) {
  // Lay version tu header
  const version = req.headers['accept-version'] || 'v1';

  // Hoac lay tu Accept header
  // const accept = req.headers['accept'];
  // const match = accept && accept.match(/application\/vnd\.myapi\.(v\d+)\+json/);
  // const version = match ? match[1] : 'v1';

  req.apiVersion = version;
  next();
}

app.use(versionMiddleware);

app.get('/api/users', (req, res) => {
  if (req.apiVersion === 'v2') {
    // Logic v2
    return res.json({
      success: true,
      data: users,
      meta: { version: 'v2' }
    });
  }

  // Logic v1 (mac dinh)
  res.json(users);
});
```

### 9.3. Query Parameter Versioning

```javascript
// GET /api/users?version=2

app.get('/api/users', (req, res) => {
  const version = parseInt(req.query.version) || 1;

  switch (version) {
    case 2:
      return res.json({ success: true, data: users });
    case 1:
    default:
      return res.json(users);
  }
});
```

### So sanh cac cach Versioning

| Phuong phap | Uu diem | Nhuoc diem |
|-------------|---------|------------|
| **URL Path** | Don gian, ro rang, de cache | URL thay doi |
| **Header** | URL sach, linh hoat | Kho test trong browser |
| **Query Param** | De implement | De bi quen, kho cache |

> **Khuyen nghi:** Su dung **URL Path Versioning** cho hau het truong hop vi no truc quan va de debug.

---

## 10. HATEOAS

**HATEOAS** (Hypermedia As The Engine Of Application State) la mot rang buoc cua REST, yeu cau server tra ve cac **link hanh dong** cung voi du lieu, giup client biet duoc cac thao tac tiep theo co the thuc hien.

### Vi du HATEOAS

```javascript
// Khong co HATEOAS
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "a@mail.com",
  "status": "active"
}

// Co HATEOAS - client biet duoc cac hanh dong co the lam
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "a@mail.com",
  "status": "active",
  "_links": {
    "self": { "href": "/api/users/1", "method": "GET" },
    "update": { "href": "/api/users/1", "method": "PATCH" },
    "delete": { "href": "/api/users/1", "method": "DELETE" },
    "posts": { "href": "/api/users/1/posts", "method": "GET" },
    "deactivate": { "href": "/api/users/1/deactivate", "method": "POST" }
  }
}
```

### Implementation HATEOAS trong Express

```javascript
// helpers/hateoas.js
function addUserLinks(user) {
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj._links = {
    self: { href: `/api/users/${userObj._id}`, method: 'GET' },
    update: { href: `/api/users/${userObj._id}`, method: 'PATCH' },
    delete: { href: `/api/users/${userObj._id}`, method: 'DELETE' },
    posts: { href: `/api/users/${userObj._id}/posts`, method: 'GET' }
  };
  return userObj;
}

function addCollectionLinks(baseUrl, pagination) {
  const links = {
    self: { href: `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}` }
  };

  if (pagination.hasNextPage) {
    links.next = {
      href: `${baseUrl}?page=${pagination.page + 1}&limit=${pagination.limit}`
    };
  }
  if (pagination.hasPrevPage) {
    links.prev = {
      href: `${baseUrl}?page=${pagination.page - 1}&limit=${pagination.limit}`
    };
  }
  links.first = { href: `${baseUrl}?page=1&limit=${pagination.limit}` };
  links.last = {
    href: `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`
  };

  return links;
}

module.exports = { addUserLinks, addCollectionLinks };

// Su dung trong controller
const { addUserLinks, addCollectionLinks } = require('../helpers/hateoas');

app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments()
  ]);

  const totalPages = Math.ceil(total / limit);
  const usersWithLinks = users.map(addUserLinks);

  res.json({
    success: true,
    data: usersWithLinks,
    pagination: { page, limit, total, totalPages },
    _links: addCollectionLinks('/api/users', {
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    })
  });
});
```

---

## 11. Rate Limiting

Rate Limiting gioi han so luong request ma mot client co the gui trong mot khoang thoi gian, giup bao ve API khoi tan cong DDoS va lam dung.

### 11.1. Su dung express-rate-limit

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter cho toan bo API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phut
  max: 100, // Toi da 100 requests trong 15 phut
  message: {
    success: false,
    message: 'Qua nhieu request tu IP nay. Vui long thu lai sau 15 phut.'
  },
  standardHeaders: true, // Tra ve rate limit info trong headers `RateLimit-*`
  legacyHeaders: false, // Tat headers `X-RateLimit-*`
  // Tuy chinh key - mac dinh la IP
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'];
  }
});

// Ap dung cho tat ca routes bat dau voi /api
app.use('/api', apiLimiter);

// Rate limiter rieng cho dang nhap (nghiem ngat hon)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phut
  max: 5, // Chi 5 lan dang nhap sai trong 15 phut
  message: {
    success: false,
    message: 'Qua nhieu lan dang nhap that bai. Vui long thu lai sau 15 phut.'
  },
  skipSuccessfulRequests: true // Khong dem cac request thanh cong
});

app.use('/api/auth/login', loginLimiter);

// Rate limiter cho tao tai khoan
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 gio
  max: 3, // Chi tao toi da 3 tai khoan moi gio
  message: {
    success: false,
    message: 'Qua nhieu tai khoan duoc tao tu IP nay. Vui long thu lai sau.'
  }
});

app.use('/api/auth/register', createAccountLimiter);
```

### 11.2. Custom Rate Limiter voi Redis

```bash
npm install ioredis
```

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Custom rate limiter middleware
function customRateLimiter(options = {}) {
  const {
    windowMs = 60000,       // 1 phut mac dinh
    max = 60,               // 60 requests/phut mac dinh
    keyPrefix = 'rl:',      // Prefix cho Redis key
    keyGenerator = (req) => req.ip,
    message = 'Qua nhieu request. Vui long thu lai sau.'
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}${keyGenerator(req)}`;
      const windowSec = Math.ceil(windowMs / 1000);

      // Su dung Redis MULTI de dam bao atomic
      const results = await redis.multi()
        .incr(key)
        .expire(key, windowSec)
        .exec();

      const currentCount = results[0][1]; // Ket qua cua INCR
      const remaining = Math.max(0, max - currentCount);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      if (currentCount > max) {
        return res.status(429).json({
          success: false,
          message,
          retryAfter: windowSec
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Neu Redis loi, cho phep request di qua (fail open)
      next();
    }
  };
}

// Su dung
app.use('/api', customRateLimiter({
  windowMs: 60 * 1000,  // 1 phut
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip // Rate limit theo user neu da dang nhap
}));
```

### 11.3. Sliding Window Rate Limiter

```javascript
// Sliding window chinh xac hon fixed window
function slidingWindowRateLimiter(options = {}) {
  const {
    windowMs = 60000,
    max = 60,
    keyPrefix = 'rl:sw:'
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}${req.ip}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      await redis.multi()
        // Xoa cac entries cu hon window
        .zremrangebyscore(key, 0, windowStart)
        // Them request hien tai
        .zadd(key, now, `${now}-${Math.random()}`)
        // Dem so request trong window
        .zcard(key)
        // Set TTL
        .expire(key, Math.ceil(windowMs / 1000))
        .exec()
        .then(results => {
          const requestCount = results[2][1];

          res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': Math.max(0, max - requestCount)
          });

          if (requestCount > max) {
            return res.status(429).json({
              success: false,
              message: 'Qua nhieu request'
            });
          }
          next();
        });
    } catch (error) {
      next();
    }
  };
}
```

---

## 12. API Documentation voi Swagger/OpenAPI

### 12.1. Cai dat

```bash
npm install swagger-jsdoc swagger-ui-express
```

### 12.2. Setup Swagger

```javascript
// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My REST API',
      version: '1.0.0',
      description: 'API documentation cho ung dung cua toi',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'ID tu dong tao'
            },
            name: {
              type: 'string',
              description: 'Ten nguoi dung',
              example: 'Nguyen Van A'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email nguoi dung',
              example: 'a@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'] // Duong dan den cac file route chua JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
```

### 12.3. Tich hop vao Express

```javascript
// app.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Serve Swagger UI tai /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'My API Documentation'
}));

// Endpoint tra ve Swagger JSON (de import vao Postman, v.v.)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
```

### 12.4. Viet JSDoc cho Routes

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quan ly nguoi dung
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lay danh sach nguoi dung
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: So trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: So luong moi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sap xep (vd: -createdAt)"
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Tu khoa tim kiem
 *     responses:
 *       200:
 *         description: Danh sach nguoi dung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Loi server
 */
router.get('/', userController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lay thong tin mot nguoi dung
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nguoi dung
 *     responses:
 *       200:
 *         description: Thong tin nguoi dung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Khong tim thay nguoi dung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tao nguoi dung moi
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: a@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: matkhau123
 *     responses:
 *       201:
 *         description: Tao nguoi dung thanh cong
 *       400:
 *         description: Du lieu khong hop le
 *       409:
 *         description: Email da ton tai
 */
router.post('/', userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Cap nhat thong tin nguoi dung
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Cap nhat thanh cong
 *       401:
 *         description: Chua xac thuc
 *       404:
 *         description: Khong tim thay nguoi dung
 */
router.patch('/:id', auth, userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xoa nguoi dung
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xoa thanh cong
 *       401:
 *         description: Chua xac thuc
 *       403:
 *         description: Khong co quyen
 *       404:
 *         description: Khong tim thay nguoi dung
 */
router.delete('/:id', auth, authorize('admin'), userController.remove);

module.exports = router;
```

---

## 13. Request Validation

### 13.1. Validation voi Joi

```bash
npm install joi
```

```javascript
// validation/user.validation.js
const Joi = require('joi');

const userSchemas = {
  // Schema cho tao user
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Ten phai co it nhat 2 ky tu',
        'string.max': 'Ten khong duoc vuot qua 50 ky tu',
        'any.required': 'Ten la bat buoc'
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email khong dung dinh dang',
        'any.required': 'Email la bat buoc'
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .required()
      .messages({
        'string.min': 'Mat khau phai co it nhat 8 ky tu',
        'string.pattern.base': 'Mat khau phai chua chu hoa, chu thuong, so va ky tu dac biet',
        'any.required': 'Mat khau la bat buoc'
      }),

    phone: Joi.string()
      .pattern(/^(0|\+84)\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': 'So dien thoai khong hop le (VD: 0912345678)'
      }),

    role: Joi.string()
      .valid('user', 'admin')
      .default('user'),

    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }),

  // Schema cho cap nhat user (tat ca truong la optional)
  update: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^(0|\+84)\d{9}$/),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      country: Joi.string()
    })
  }).min(1).messages({
    'object.min': 'Phai co it nhat mot truong de cap nhat'
  }),

  // Schema cho query params
  getAll: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', '-name', 'createdAt', '-createdAt'),
    role: Joi.string().valid('user', 'admin'),
    q: Joi.string().min(1).max(100)
  })
};

module.exports = userSchemas;
```

### Joi Validation Middleware

```javascript
// middleware/validate.js
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source]; // 'body', 'query', 'params'

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,    // Tra ve TAT CA loi, khong dung o loi dau tien
      stripUnknown: true,   // Xoa cac truong khong co trong schema
      allowUnknown: false   // Khong cho phep truong la
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Du lieu khong hop le',
        errors
      });
    }

    // Gan validated data (da duoc strip unknown fields)
    req[source] = value;
    next();
  };
};

module.exports = validate;

// Su dung trong routes
const validate = require('../middleware/validate');
const userSchemas = require('../validation/user.validation');

router.post(
  '/users',
  validate(userSchemas.create, 'body'),
  userController.create
);

router.patch(
  '/users/:id',
  validate(userSchemas.update, 'body'),
  userController.update
);

router.get(
  '/users',
  validate(userSchemas.getAll, 'query'),
  userController.getAll
);
```

### 13.2. Validation voi express-validator

```bash
npm install express-validator
```

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Middleware xu ly ket qua validation
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Du lieu khong hop le',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

// Dinh nghia validation rules
const userValidationRules = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Ten la bat buoc')
      .isLength({ min: 2, max: 50 }).withMessage('Ten phai tu 2-50 ky tu'),

    body('email')
      .trim()
      .notEmpty().withMessage('Email la bat buoc')
      .isEmail().withMessage('Email khong dung dinh dang')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('Mat khau la bat buoc')
      .isLength({ min: 8 }).withMessage('Mat khau phai co it nhat 8 ky tu')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Mat khau phai chua chu hoa, chu thuong va so'),

    body('phone')
      .optional()
      .matches(/^(0|\+84)\d{9}$/)
      .withMessage('So dien thoai khong hop le'),

    handleValidation
  ],

  update: [
    param('id')
      .isMongoId().withMessage('ID khong hop le'),

    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Ten phai tu 2-50 ky tu'),

    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email khong dung dinh dang'),

    handleValidation
  ],

  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page phai la so nguyen duong'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit phai tu 1 den 100'),

    handleValidation
  ]
};

// Su dung trong routes
router.post('/users', userValidationRules.create, userController.create);
router.patch('/users/:id', userValidationRules.update, userController.update);
router.get('/users', userValidationRules.getAll, userController.getAll);
```

### Custom Validator

```javascript
const { body } = require('express-validator');
const User = require('../models/User');

// Custom validator kiem tra email trung lap
const checkUniqueEmail = body('email').custom(async (email, { req }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser._id.toString() !== req.params.id) {
    throw new Error('Email da duoc su dung boi tai khoan khac');
  }
  return true;
});

// Custom validator kiem tra mat khau xac nhan
const checkPasswordConfirm = body('passwordConfirm').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Mat khau xac nhan khong khop');
  }
  return true;
});
```

---

## 14. Error Response Format thong nhat

### 14.1. Custom Error Class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Loi du doan duoc (khong phai bug)
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Cac class con cho tung loai loi
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} khong tim thay`, 404);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Du lieu khong hop le', 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Vui long dang nhap de truy cap') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Ban khong co quyen thuc hien hanh dong nay') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Du lieu bi trung lap') {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};
```

### 14.2. Global Error Handler

```javascript
// middleware/errorHandler.js
const { AppError } = require('../utils/AppError');

// Xu ly loi tu Mongoose
const handleCastError = (err) => {
  return new AppError(`Gia tri khong hop le cho ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} da ton tai trong he thong`, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message
  }));
  return new AppError('Du lieu khong hop le', 400, errors);
};

const handleJWTError = () => {
  return new AppError('Token khong hop le. Vui long dang nhap lai', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token da het han. Vui long dang nhap lai', 401);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log loi cho developer
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Clone error de khong modify error goc
  let error = { ...err, message: err.message };

  // Chuyen doi cac loi cu the thanh AppError
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Neu la loi da biet (operational error)
  if (error instanceof AppError || err.isOperational) {
    const response = {
      success: false,
      message: error.message || err.message
    };
    if (error.errors || err.errors) {
      response.errors = error.errors || err.errors;
    }
    return res.status(error.statusCode || err.statusCode || 500).json(response);
  }

  // Loi khong xac dinh (programming error / bug)
  // Trong production, khong tra ve chi tiet loi
  const statusCode = 500;
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Loi server noi bo. Vui long thu lai sau'
      : err.message
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

### 14.3. Su dung trong app

```javascript
// app.js
const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/AppError');

const app = express();

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Xu ly route khong ton tai
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Khong tim thay route ${req.originalUrl}`));
});

// Global error handler - PHAI dat cuoi cung
app.use(errorHandler);

module.exports = app;
```

### 14.3. Su dung trong Controller

```javascript
// controllers/userController.js
const {
  NotFoundError,
  ConflictError,
  ForbiddenError
} = require('../utils/AppError');

// Wrapper de bat loi async tu dong
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

exports.getById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('Nguoi dung');
    // Hoac: return next(new NotFoundError('Nguoi dung'));
  }
  res.status(200).json({ success: true, data: user });
});

exports.create = asyncHandler(async (req, res, next) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new ConflictError('Email da duoc su dung');
  }
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.remove = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ForbiddenError();
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new NotFoundError('Nguoi dung');
  }
  res.status(204).send();
});
```

---

## 15. Code Example: Full REST API voi Express

Day la mot ung dung REST API hoan chinh voi tat ca cac best practices da hoc.

### Cau truc thu muc

```
project/
  |- package.json
  |- .env
  |- server.js
  |- app.js
  |- config/
  |    |- database.js
  |    |- swagger.js
  |- models/
  |    |- User.js
  |    |- Post.js
  |- routes/
  |    |- user.routes.js
  |    |- post.routes.js
  |- controllers/
  |    |- user.controller.js
  |    |- post.controller.js
  |- middleware/
  |    |- auth.js
  |    |- validate.js
  |    |- errorHandler.js
  |- validation/
  |    |- user.validation.js
  |- utils/
  |    |- AppError.js
  |    |- apiFeatures.js
  |    |- response.js
  |    |- asyncHandler.js
```

### package.json

```json
{
  "name": "rest-api-example",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "express-rate-limit": "^7.0.0",
    "helmet": "^7.0.0",
    "joi": "^17.9.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.0",
    "morgan": "^1.10.0",
    "swagger-jsdoc": "^6.2.0",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### server.js

```javascript
// server.js
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/database');

// Ket noi database
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server dang chay tai http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});

// Xu ly unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Dang tat server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Xu ly uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Dang tat server...');
  console.error(err.name, err.message);
  process.exit(1);
});
```

### app.js

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/AppError');

const app = express();

// === MIDDLEWARE BAO MAT ===
app.use(helmet()); // Set cac security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Qua nhieu request. Vui long thu lai sau 15 phut.'
  }
});
app.use('/api', limiter);

// === LOGGING ===
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// === BODY PARSING ===
app.use(express.json({ limit: '10kb' })); // Gioi han kich thuoc body
app.use(express.urlencoded({ extended: true }));

// === API DOCS ===
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === ROUTES ===
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server dang hoat dong', timestamp: new Date() });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);

// === 404 HANDLER ===
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Khong tim thay route ${req.method} ${req.originalUrl}`));
});

// === GLOBAL ERROR HANDLER ===
app.use(errorHandler);

module.exports = app;
```

### Model - User.js

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ten la bat buoc'],
    trim: true,
    minlength: [2, 'Ten phai co it nhat 2 ky tu'],
    maxlength: [50, 'Ten khong duoc vuot qua 50 ky tu']
  },
  email: {
    type: String,
    required: [true, 'Email la bat buoc'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Mat khau la bat buoc'],
    minlength: [8, 'Mat khau phai co it nhat 8 ky tu'],
    select: false // Khong tra ve password khi query
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Tu dong tao createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: lay posts cua user (khong luu trong DB)
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// Middleware: Hash password truoc khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: So sanh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Khong tra ve password va __v trong JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

### Controller - user.controller.js

```javascript
// controllers/user.controller.js
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// Lay tat ca users
exports.getAll = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find({ isActive: true }), req.query)
    .search()
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const [users, total] = await Promise.all([
    features.query,
    User.countDocuments({ isActive: true })
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: features.paginationInfo.page,
      limit: features.paginationInfo.limit,
      total,
      totalPages: Math.ceil(total / features.paginationInfo.limit)
    }
  });
});

// Lay user theo ID
exports.getById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('posts');

  if (!user) {
    throw new NotFoundError('Nguoi dung');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Tao user moi
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Kiem tra email trung
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError('Email da duoc su dung boi tai khoan khac');
  }

  const user = await User.create({ name, email, password, phone, role });

  res.status(201).json({
    success: true,
    message: 'Tao nguoi dung thanh cong',
    data: user
  });
});

// Cap nhat user
exports.update = asyncHandler(async (req, res) => {
  // Khong cho phep cap nhat password qua route nay
  const { password, ...updateData } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('Nguoi dung');
  }

  res.status(200).json({
    success: true,
    message: 'Cap nhat nguoi dung thanh cong',
    data: user
  });
});

// Xoa user (soft delete)
exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('Nguoi dung');
  }

  res.status(204).send();
});
```

### Routes - user.routes.js

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const userSchemas = require('../validation/user.validation');
const { auth, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(validate(userSchemas.getAll, 'query'), userController.getAll)
  .post(validate(userSchemas.create, 'body'), userController.create);

router
  .route('/:id')
  .get(userController.getById)
  .patch(auth, validate(userSchemas.update, 'body'), userController.update)
  .delete(auth, authorize('admin'), userController.remove);

module.exports = router;
```

---

## 16. Sai lam thuong gap

### Sai lam 1: Dung dong tu trong URL

```javascript
// SAI
app.get('/api/getUsers', ...);
app.post('/api/createUser', ...);
app.post('/api/deleteUser/:id', ...);

// DUNG - dung HTTP method de the hien hanh dong
app.get('/api/users', ...);      // GET = doc
app.post('/api/users', ...);     // POST = tao
app.delete('/api/users/:id', ...); // DELETE = xoa
```

### Sai lam 2: Luon tra ve status 200

```javascript
// SAI - Luon tra ve 200 ke ca khi loi
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(200).json({ error: 'Khong tim thay' }); // SAI!
  }
  res.status(200).json(user);
});

// DUNG - Su dung dung status code
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Khong tim thay nguoi dung'
    });
  }
  res.status(200).json({ success: true, data: user });
});
```

### Sai lam 3: Khong validate input

```javascript
// SAI - Tin tuong du lieu tu client
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body); // Nguy hiem! Client co the gui bat ky truong nao
  res.json(user);
});

// DUNG - Validate va chi lay cac truong cho phep
app.post('/api/users', validateBody(schema), async (req, res) => {
  const { name, email, password } = req.body; // Chi lay truong can thiet
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, data: user });
});
```

### Sai lam 4: Tra ve qua nhieu du lieu

```javascript
// SAI - Tra ve password, tokens, du lieu nhay cam
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Co the chua password, refreshToken, v.v.
});

// DUNG - Chon loc truong tra ve
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -__v');
  res.json({ success: true, data: user });
});
```

### Sai lam 5: Khong phan trang

```javascript
// SAI - Tra ve tat ca records
app.get('/api/products', async (req, res) => {
  const products = await Product.find(); // Co the la hang trieu records!
  res.json(products);
});

// DUNG - Luon phan trang
app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit),
    Product.countDocuments()
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});
```

### Sai lam 6: Khong co error handling thong nhat

```javascript
// SAI - Moi route xu ly loi khac nhau
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Something went wrong'); // Format khac nhau
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.json({ error: err.message }); // Lai format khac nua
  }
});

// DUNG - Su dung asyncHandler + global error handler
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
}));
// Loi se tu dong duoc bat boi global error handler voi format thong nhat
```

### Sai lam 7: Su dung GET cho thay doi du lieu

```javascript
// SAI - GET khong duoc thay doi du lieu (GET phai safe + idempotent)
app.get('/api/users/:id/delete', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Da xoa' });
});

// DUNG
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
```

---

## 17. Best Practices tong hop

### Checklist cho REST API

1. **Naming**: Su dung danh tu so nhieu, chu thuong, dau gach ngang
2. **HTTP Methods**: Dung dung method cho tung hanh dong
3. **Status Codes**: Tra ve dung status code
4. **Versioning**: Luon version API tu dau
5. **Pagination**: Luon phan trang danh sach
6. **Validation**: Validate moi input tu client
7. **Error Handling**: Format loi thong nhat
8. **Security**: Su dung HTTPS, helmet, CORS, rate limiting
9. **Documentation**: Swagger/OpenAPI tu dong cap nhat
10. **Logging**: Log request/response de debug
11. **Testing**: Viet test cho moi endpoint
12. **Idempotency**: Dam bao PUT va DELETE la idempotent

### Security Checklist

```javascript
// 1. Luon dung HTTPS trong production

// 2. Su dung Helmet
const helmet = require('helmet');
app.use(helmet());

// 3. Cau hinh CORS dung
const cors = require('cors');
app.use(cors({
  origin: ['https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 4. Gioi han kich thuoc body
app.use(express.json({ limit: '10kb' }));

// 5. Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 6. San pham hoa loi - khong tra ve stack trace trong production
if (process.env.NODE_ENV === 'production') {
  // Khong tra ve chi tiet loi
}

// 7. Khong tra ve thong tin nhay cam
// select: false trong schema, hoac dung .select('-field')

// 8. Validate va sanitize input
// Su dung Joi hoac express-validator

// 9. Su dung parameterized queries (chong SQL/NoSQL injection)
// Mongoose tu dong xu ly, nhung can can than voi $where
```

---

## 18. Bai tap thuc hanh

### Bai tap 1: API CRUD co ban

Xay dung REST API cho quan ly **sach** (Books) voi cac yeu cau:

- Model Book: `title`, `author`, `isbn`, `price`, `category`, `publishedDate`, `inStock`
- CRUD endpoints day du (GET, POST, PUT, PATCH, DELETE)
- Validation du lieu dau vao bang Joi
- Error handling thong nhat
- Phan trang, loc, sap xep, tim kiem

**API Endpoints can tao:**
```
GET    /api/v1/books              - Lay danh sach sach (ho tro pagination, filter, sort, search)
GET    /api/v1/books/:id          - Lay thong tin 1 cuon sach
POST   /api/v1/books              - Them sach moi
PUT    /api/v1/books/:id          - Thay the toan bo thong tin sach
PATCH  /api/v1/books/:id          - Cap nhat mot phan thong tin sach
DELETE /api/v1/books/:id          - Xoa sach
GET    /api/v1/books/:id/reviews  - Lay reviews cua sach
POST   /api/v1/books/:id/reviews  - Them review cho sach
```

### Bai tap 2: API voi Authentication va Authorization

Mo rong Bai tap 1, them:

- Dang ky / Dang nhap (JWT)
- Phan quyen: chi admin moi co the tao/sua/xoa sach
- User co the them review
- User chi co the sua/xoa review cua minh

### Bai tap 3: API Documentation

Them Swagger documentation cho API o Bai tap 1 va 2:

- Dinh nghia tat ca schemas (Book, User, Review, Error)
- Document tat ca endpoints voi request/response examples
- Them authentication (Bearer Token) trong Swagger UI
- Test API truc tiep tu Swagger UI

### Bai tap 4: Advanced Features

Them cac tinh nang nang cao:

- Cursor-based pagination cho endpoint GET /books
- Rate limiting rieng cho tung role (admin: 1000 req/15min, user: 100 req/15min)
- HATEOAS links trong response
- API versioning (v1 va v2 voi response format khac nhau)
- Field selection (?fields=title,author,price)

### Bai tap 5: E-commerce API

Xay dung REST API hoan chinh cho ung dung E-commerce:

**Resources:**
- Users (dang ky, dang nhap, profile)
- Products (CRUD, tim kiem, loc theo category/gia)
- Categories (CRUD, lay products theo category)
- Cart (them/xoa/cap nhat san pham trong gio hang)
- Orders (dat hang, xem lich su, cap nhat trang thai)
- Reviews (them review, rating trung binh)

**Yeu cau:**
- Authentication + Authorization (JWT)
- Validation tat ca input
- Pagination, filtering, sorting cho moi danh sach
- Error handling thong nhat
- Swagger documentation
- Rate limiting
- Soft delete cho products va users

---

> **Luu y:** Tat ca code examples tren deu co the chay duoc khi ket hop voi nhau. Hay tao project, cai dat cac dependencies va thuc hanh theo tung phan de hieu sau ve REST API Design.
