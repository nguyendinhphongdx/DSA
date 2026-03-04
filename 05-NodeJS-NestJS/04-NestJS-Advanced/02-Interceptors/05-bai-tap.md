# Bai tap - Interceptors

## 13. Bai tap

### Bai tap 1: Logging Interceptor
Tao mot `RequestLogInterceptor` ghi lai thong tin:
- Method, URL, IP cua client
- Thoi gian xu ly request (tinh bang ms)
- Status code cua response
- Kich thuoc response body (bytes)

**Yeu cau:**
- Su dung `Logger` cua NestJS
- Log o muc INFO cho request binh thuong, WARN cho request > 1s, ERROR cho request loi
- Bind global trong AppModule

### Bai tap 2: Response Wrapper
Tao `ApiResponseInterceptor` boc tat ca response trong format:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/users"
}
```

**Yeu cau:**
- Xu ly ca truong hop tra ve array va object
- Khong boc `StreamableFile`
- Khong boc response da co format roi (kiem tra `data.success !== undefined`)

### Bai tap 3: Cache Interceptor voi Redis
Tao `RedisCacheInterceptor`:
- Chi cache GET requests
- Cache key = method + url + query params + user ID (neu co)
- TTL co the tuy chinh qua decorator `@CacheTTL(60)`
- Co endpoint de xoa cache (cache invalidation)
- Su dung Redis lam cache store

### Bai tap 4: Rate Limiting Interceptor
Tao `RateLimitInterceptor`:
- Gioi han moi IP chi duoc gui 100 request / phut
- Tra ve header `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Khi vuot gioi han, tra ve 429 Too Many Requests
- Co the tuy chinh limit qua decorator `@RateLimit(50)`

### Bai tap 5: Interceptor Pipeline
Xay dung pipeline gom nhieu interceptor lam viec cung nhau:
1. `CorrelationIdInterceptor` - Tao/doc correlation ID tu header
2. `LoggingInterceptor` - Log voi correlation ID
3. `TransformInterceptor` - Boc response
4. `TimeoutInterceptor` - Timeout 10s (tuy chinh duoc)

Bind tat ca global theo dung thu tu va test voi mot CRUD controller.

---

## Tai lieu tham khao

- [NestJS Interceptors Documentation](https://docs.nestjs.com/interceptors)
- [RxJS Documentation](https://rxjs.dev/)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [NestJS Streaming Files](https://docs.nestjs.com/techniques/streaming-files)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
