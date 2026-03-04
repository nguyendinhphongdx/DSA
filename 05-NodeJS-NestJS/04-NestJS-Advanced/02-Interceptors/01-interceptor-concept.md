# Interceptor la gi - NestInterceptor va CallHandler

## 1. Interceptor la gi?

**Interceptor** la mot lop (class) duoc danh dau bang `@Injectable()` va implement interface `NestInterceptor`. Interceptor co kha nang **can thiep vao ca truoc va sau** khi route handler duoc thuc thi.

### Vi tri trong Request Lifecycle

```
Client Request
    |
    v
Middleware
    |
    v
Guards
    |
    v
Interceptors (TRUOC handler)  <-- Phan truoc
    |
    v
Pipes
    |
    v
Route Handler
    |
    v
Interceptors (SAU handler)    <-- Phan sau
    |
    v
Exception Filters (neu co loi)
    |
    v
Response
```

### Nhung gi Interceptor co the lam

1. **Them logic truoc/sau** method handler (logging, timing, ...)
2. **Bien doi** ket qua tra ve tu handler (response transformation)
3. **Bien doi** exception tu handler
4. **Mo rong** hanh vi co ban cua function
5. **Override hoan toan** function trong dieu kien nhat dinh (vi du: caching)
6. **Timeout** - huy request neu qua lau

### So sanh voi Middleware

| Dac diem | Middleware | Interceptor |
|----------|-----------|-------------|
| Truy cap request/response | Co | Co (thong qua ExecutionContext) |
| Can thiep truoc handler | Co | Co |
| Can thiep sau handler | Khong | **Co** (thong qua RxJS Observable) |
| Bien doi response data | Kho | **De dang** |
| Biet handler nao se chay | Khong | Co |
| Ho tro RxJS | Khong | **Co** |

---

## 2. NestInterceptor Interface va CallHandler

### Cau truc co ban

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // CODE O DAY chay TRUOC handler
    console.log('Truoc khi handler chay...');

    // next.handle() goi handler va tra ve Observable
    return next.handle();
    // Sau khi Observable emit => CODE SAU handler
  }
}
```

### Giai thich tung thanh phan

**ExecutionContext:**
- Ke thua tu `ArgumentsHost`
- Cung cap thong tin ve request hien tai
- Co the chuyen doi giua HTTP, WebSocket, RPC context
- Truy cap handler method va controller class

```typescript
// Lay thong tin tu ExecutionContext
const request = context.switchToHttp().getRequest();
const response = context.switchToHttp().getResponse();
const handlerName = context.getHandler().name;
const className = context.getClass().name;
const type = context.getType(); // 'http', 'ws', 'rpc'
```

**CallHandler:**
- Co duy nhat mot method: `handle()`
- `handle()` tra ve mot `Observable`
- **Neu khong goi `next.handle()`**, route handler se **KHONG BAO GIO** duoc thuc thi
- Observable chua gia tri tra ve tu route handler

```typescript
// next.handle() la diem chia giua "truoc" va "sau"
return next.handle().pipe(
  // Cac RxJS operators o day tac dong len RESPONSE
  // (chay SAU handler)
);
```

### Minh hoa dong chay

```typescript
@Injectable()
export class DemoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // === TRUOC HANDLER ===
    const now = Date.now();
    console.log(`[1] Request den luc: ${new Date().toISOString()}`);

    return next.handle().pipe(
      // === SAU HANDLER ===
      tap((data) => {
        console.log(`[2] Response gui di luc: ${new Date().toISOString()}`);
        console.log(`[3] Thoi gian xu ly: ${Date.now() - now}ms`);
        console.log(`[4] Du lieu tra ve:`, data);
      }),
    );
  }
}
```
