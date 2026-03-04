# Guard co ban

## 1. Guard la gi?

**Guard** trong NestJS la mot lop (class) duoc danh dau bang decorator `@Injectable()` va implement interface `CanActivate`. Nhiem vu chinh cua Guard la **quyet dinh xem mot request co duoc phep di tiep den route handler hay khong** dua tren cac dieu kien nhat dinh (quyen han, vai tro, xac thuc, ...).

### Tai sao can Guard?

Trong cac ung dung web, viec kiem soat ai duoc phep truy cap tai nguyen nao la cuc ky quan trong. Truoc khi NestJS, ban thuong phai viet middleware de kiem tra authentication/authorization. Guard cung cap mot cach tiep can co cau truc hon, tich hop sau vao lifecycle cua NestJS.

### Guard nam o dau trong Request Lifecycle?

```
Client Request
    |
    v
Middleware
    |
    v
Guards        <-- Guard chay o day
    |
    v
Interceptors (Before)
    |
    v
Pipes
    |
    v
Route Handler
    |
    v
Interceptors (After)
    |
    v
Exception Filters (neu co loi)
    |
    v
Response
```

**Diem quan trong:** Guard chay **sau** middleware nhung **truoc** interceptor va pipe. Dieu nay co nghia la Guard co quyen truy cap vao `ExecutionContext` - cho biet chinh xac handler nao sap duoc goi.

### So sanh Guard voi Middleware

| Dac diem | Middleware | Guard |
|----------|-----------|-------|
| Biet handler nao se xu ly | Khong | Co (thong qua ExecutionContext) |
| Co the doc metadata cua handler | Khong | Co (thong qua Reflector) |
| Tra ve true/false de cho phep/tu choi | Khong | Co |
| Tuong thich voi decorators | Khong | Co |
| Thoi diem chay | Dau tien | Sau middleware |

---

## 2. CanActivate Interface

Moi Guard phai implement interface `CanActivate` voi phuong thuc `canActivate()`.

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SimpleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Tra ve true: cho phep request di tiep
    // Tra ve false: tu choi request (tra ve 403 Forbidden)
    return true;
  }
}
```

### ExecutionContext

`ExecutionContext` ke thua tu `ArgumentsHost` va cung cap them thong tin ve handler hien tai:

```typescript
// Lay thong tin ve controller class
const controllerClass = context.getClass();
// Vi du: UsersController

// Lay thong tin ve handler method
const handlerMethod = context.getHandler();
// Vi du: findAll

// Lay request object (HTTP context)
const request = context.switchToHttp().getRequest();

// Lay response object
const response = context.switchToHttp().getResponse();

// Kiem tra loai context (http, ws, rpc)
const type = context.getType(); // 'http' | 'ws' | 'rpc'
```

### Khi Guard tra ve false

Khi `canActivate()` tra ve `false`, NestJS se tu dong nem ra `ForbiddenException` (HTTP 403):

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

Ban co the tuy chinh response bang cach nem exception rieng:

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CustomGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isValid = this.validateRequest(request);

    if (!isValid) {
      // Tuy chinh exception thay vi mac dinh 403
      throw new UnauthorizedException('Ban chua dang nhap');
    }

    return true;
  }

  private validateRequest(request: any): boolean {
    // Logic kiem tra
    return !!request.headers.authorization;
  }
}
```
