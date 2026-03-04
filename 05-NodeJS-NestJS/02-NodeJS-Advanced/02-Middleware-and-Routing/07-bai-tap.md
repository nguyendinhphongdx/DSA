# Bài tập thực hành

## 12. Bài tập thực hành

### Bài tập 1: Xây dựng Custom Middleware (Cơ bản)

Tạo các middleware sau:

1. **Request Logger**: Log `[timestamp] METHOD /url - IP` cho mỗi request
2. **Request Timer**: Đo thời gian xử lý và thêm header `X-Response-Time`
3. **API Key Validator**: Kiểm tra header `X-API-Key`, trả về 401 nếu thiếu hoặc sai
4. **Request ID Generator**: Tạo unique ID cho mỗi request, gắn vào `req.id` và header `X-Request-Id`

### Bài tập 2: Modular Routing (Trung bình)

Tổ chức lại app theo cấu trúc:

```
src/
├── app.js
├── routes/
│   ├── index.js
│   ├── auth.routes.js      # POST /login, POST /register
│   ├── user.routes.js      # CRUD /users
│   ├── product.routes.js   # CRUD /products
│   └── category.routes.js  # CRUD /categories
├── middlewares/
│   ├── logger.middleware.js
│   ├── auth.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
└── controllers/
    ├── auth.controller.js
    ├── user.controller.js
    ├── product.controller.js
    └── category.controller.js
```

Yêu cầu:
- Tất cả routes có prefix `/api/v1`
- Routes `/api/v1/auth/*` public
- Routes `/api/v1/users/*`, `/api/v1/products/*`, `/api/v1/categories/*` yêu cầu authentication (giả lập)
- Routes DELETE yêu cầu role admin

### Bài tập 3: Rate Limiter Middleware (Nâng cao)

Xây dựng rate limiter middleware với các tính năng:

1. Giới hạn requests theo IP
2. Cấu hình `windowMs` và `max` requests
3. Trả về headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
4. Response 429 khi vượt quá giới hạn
5. Hỗ trợ whitelist IPs (không bị limit)
6. Tự động dọn dẹp data cũ (memory management)

```javascript
// Mục tiêu sử dụng:
const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 100,                    // 100 requests / 15 phút
  message: 'Quá nhiều request',
  whitelist: ['127.0.0.1'],
  keyGenerator: (req) => req.ip  // Custom key
});

app.use('/api', rateLimiter);
```

### Bài tập 4: Middleware Chain Challenge (Nâng cao)

Xây dựng một hệ thống middleware hoàn chỉnh cho một E-commerce API:

1. **CORS middleware**: Chỉ cho phép domains trong whitelist
2. **Security headers middleware**: Thêm các security headers
3. **Body parser middleware**: Parse JSON với giới hạn size
4. **Authentication middleware**: Verify JWT token (giả lập)
5. **Authorization middleware factory**: Kiểm tra role
6. **Validation middleware factory**: Validate request body theo schema
7. **Cache middleware**: Cache GET responses trong memory
8. **Error handling middleware**: Xử lý tập trung tất cả errors

Áp dụng cho API với routes:
- `POST /api/auth/login` - Public
- `GET /api/products` - Public, có cache
- `POST /api/products` - Admin only, có validation
- `GET /api/orders` - Authenticated users
- `POST /api/orders` - Authenticated users, có validation

---

> **Tiếp theo:** [03 - Error Handling](../03-Error-Handling/README.md) - Xử lý lỗi chuyên nghiệp trong Express.js.
