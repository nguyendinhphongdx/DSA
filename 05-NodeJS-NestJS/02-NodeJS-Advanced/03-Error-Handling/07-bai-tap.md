# Bài tập thực hành

## 13. Bài tập thực hành

### Bài tập 1: Custom Error Classes (Cơ bản)

Tạo hệ thống error classes hoàn chỉnh:

1. `AppError` (base class) với `message`, `statusCode`, `isOperational`
2. `BadRequestError` (400)
3. `UnauthorizedError` (401)
4. `ForbiddenError` (403)
5. `NotFoundError` (404) - nhận `resource` và `id`
6. `ValidationError` (422) - nhận mảng `errors`
7. `ConflictError` (409)

Viết centralized error handler xử lý tất cả các loại lỗi trên.

### Bài tập 2: Error Handling Pipeline (Trung bình)

Xây dựng một API có error handling hoàn chỉnh:

```
src/
├── app.js
├── server.js
├── utils/
│   ├── errors.js
│   ├── asyncHandler.js
│   └── logger.js (Winston)
├── middlewares/
│   ├── error.middleware.js
│   └── validate.middleware.js
├── validators/
│   └── product.validator.js (Joi)
├── routes/
│   └── product.routes.js
├── controllers/
│   └── product.controller.js
└── services/
    └── product.service.js
```

Yêu cầu:
1. CRUD API cho products (in-memory)
2. Validation với Joi
3. Custom error classes
4. Centralized error handler
5. Phân biệt dev/production error responses
6. Winston logger ghi log vào file
7. Graceful shutdown

### Bài tập 3: Error Monitoring Dashboard (Nâng cao)

Mở rộng bài tập 2:

1. Tạo endpoint `GET /api/errors/stats` trả về thống kê lỗi
2. Lưu mỗi error vào một mảng in-memory với thông tin: `timestamp`, `method`, `url`, `statusCode`, `message`, `stack` (dev only)
3. Endpoint `GET /api/errors/recent?limit=10` - 10 lỗi gần nhất
4. Endpoint `GET /api/errors/stats/by-status` - Đếm lỗi theo status code
5. Endpoint `GET /api/errors/stats/by-route` - Đếm lỗi theo route

**Gợi ý test errors:**

```bash
# Validation error
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "", "price": -100}'

# Not found error
curl http://localhost:3000/api/products/999

# Invalid JSON
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{invalid json}'

# Route not found
curl http://localhost:3000/api/nonexistent

# Xem thống kê
curl http://localhost:3000/api/errors/stats
curl http://localhost:3000/api/errors/recent?limit=5
```

---

> **Tiếp theo:** [04 - Authentication JWT](../04-Authentication-JWT/README.md) - Xác thực và phân quyền với JWT trong Express.js.
