# RxJS Operators trong Interceptors

## 8. RxJS Operators trong Interceptors

Interceptor su dung RxJS Observable, nen ban co the dung bat ky RxJS operator nao. Duoi day la cac operator thuong dung nhat:

### map - Bien doi du lieu

```typescript
import { map } from 'rxjs/operators';

// Chuyen tat ca response thanh uppercase
return next.handle().pipe(
  map((data) => {
    if (typeof data === 'string') {
      return data.toUpperCase();
    }
    return data;
  }),
);

// Boc response trong wrapper
return next.handle().pipe(
  map((data) => ({
    success: true,
    data,
    timestamp: Date.now(),
  })),
);
```

### tap - Side effect (khong thay doi data)

```typescript
import { tap } from 'rxjs/operators';

// Logging, tracking, analytics
return next.handle().pipe(
  tap({
    next: (data) => {
      console.log('Response:', data);
      // Gui analytics event
      // Ghi vao audit log
    },
    error: (error) => {
      console.error('Error:', error.message);
      // Gui alert
    },
    complete: () => {
      console.log('Request hoan tat');
    },
  }),
);
```

### catchError - Xu ly loi

```typescript
import { catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

// Cach 1: Nem loi moi
return next.handle().pipe(
  catchError((error) =>
    throwError(() => new BadRequestException('Co loi xay ra')),
  ),
);

// Cach 2: Tra ve gia tri mac dinh thay vi loi
return next.handle().pipe(
  catchError((error) => {
    console.error('Loi nhung tra ve gia tri mac dinh:', error.message);
    return of({ data: [], message: 'Khong co du lieu' });
  }),
);
```

### timeout - Gioi han thoi gian

```typescript
import { timeout, catchError } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';

return next.handle().pipe(
  timeout(5000), // 5 giay
  catchError((err) => {
    if (err instanceof TimeoutError) {
      return throwError(() => new RequestTimeoutException());
    }
    return throwError(() => err);
  }),
);
```

### mergeMap / switchMap - Goi them async operations

```typescript
import { mergeMap } from 'rxjs/operators';
import { from } from 'rxjs';

// Sau khi handler tra ve, goi them mot async operation
return next.handle().pipe(
  mergeMap(async (data) => {
    // Goi API ben ngoai hoac xu ly them
    const enrichedData = await this.enrichService.enrich(data);
    return enrichedData;
  }),
);
```

### retry - Tu dong thu lai

```typescript
import { retry, catchError, delay } from 'rxjs/operators';
import { throwError } from 'rxjs';

return next.handle().pipe(
  retry({
    count: 3,     // Thu lai toi da 3 lan
    delay: 1000,  // Doi 1 giay giua moi lan thu
  }),
  catchError((error) => {
    return throwError(() => new HttpException(
      'That bai sau 3 lan thu',
      HttpStatus.SERVICE_UNAVAILABLE,
    ));
  }),
);
```

### Ket hop nhieu operators

```typescript
@Injectable()
export class CompleteInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      // 1. Timeout sau 10 giay
      timeout(10000),

      // 2. Thu lai neu loi (toi da 2 lan)
      retry({ count: 2, delay: 500 }),

      // 3. Bien doi response
      map((data) => ({
        success: true,
        data,
      })),

      // 4. Log thong tin
      tap(() => {
        console.log(`Request xu ly trong ${Date.now() - start}ms`);
      }),

      // 5. Xu ly loi cuoi cung
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => error);
      }),
    );
  }
}
```

---

## 11. Cac use cases nang cao

### Audit Log Interceptor

```typescript
// interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Chi audit cho cac thao tac thay doi du lieu
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap({
          next: (responseData) => {
            this.auditService.log({
              userId: user?.id,
              action: method,
              resource: url,
              requestBody: body,
              responseData,
              timestamp: new Date(),
              status: 'success',
            });
          },
          error: (error) => {
            this.auditService.log({
              userId: user?.id,
              action: method,
              resource: url,
              requestBody: body,
              error: error.message,
              timestamp: new Date(),
              status: 'failed',
            });
          },
        }),
      );
    }

    return next.handle();
  }
}
```

### Pagination Interceptor

```typescript
// interceptors/pagination.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    return next.handle().pipe(
      map((data) => {
        // Handler tra ve { items: T[], total: number }
        if (data && data.items && typeof data.total === 'number') {
          const totalPages = Math.ceil(data.total / limit);

          return {
            data: data.items,
            meta: {
              total: data.total,
              page,
              limit,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          } as PaginatedResult<any>;
        }

        return data;
      }),
    );
  }
}
```

---

## 12. Loi thuong gap

### Loi 1: Quen goi next.handle()

```typescript
// SAI - Handler se KHONG BAO GIO chay!
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  console.log('Truoc handler');
  return of('Gia tri mac dinh'); // Khong goi next.handle()!
}

// DUNG
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  console.log('Truoc handler');
  return next.handle(); // Phai goi de handler chay
}
```

### Loi 2: Khong return Observable

```typescript
// SAI - Loi runtime
intercept(context: ExecutionContext, next: CallHandler) {
  next.handle(); // Thieu return!
}

// DUNG
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle(); // Phai return Observable
}
```

### Loi 3: Bien doi StreamableFile

```typescript
// SAI - Se lam hong file download
map((data) => ({ success: true, data })) // Wrap ca StreamableFile!

// DUNG
map((data) => {
  if (data instanceof StreamableFile) return data;
  return { success: true, data };
})
```

### Loi 4: Khong xu ly async dung cach

```typescript
// SAI - Promise khong duoc unwrap
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
    map(async (data) => {
      const result = await someAsyncOperation(data);
      return result;
    }),
    // map tra ve Observable<Promise<T>> thay vi Observable<T>!
  );
}

// DUNG - Dung mergeMap/switchMap cho async
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
    mergeMap(async (data) => {
      const result = await someAsyncOperation(data);
      return result;
    }),
  );
}
```

### Loi 5: Memory leak voi cache interceptor

```typescript
// SAI - Cache khong bao gio duoc don dep
private cache = new Map<string, any>();

// DUNG - Co TTL va kich thuoc toi da
private cache = new Map<string, { data: any; expiry: number }>();
private readonly MAX_SIZE = 1000;

// Don dep cache het han dinh ky
private cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of this.cache.entries()) {
    if (value.expiry < now) {
      this.cache.delete(key);
    }
  }
}
```
