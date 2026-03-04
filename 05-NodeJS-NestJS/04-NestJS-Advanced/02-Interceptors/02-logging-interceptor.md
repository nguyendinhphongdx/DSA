# Logging Interceptor

## 3. Logging Interceptor

Day la use case pho bien nhat - ghi log request/response de debug va monitoring.

### Logging Interceptor co ban

```typescript
// interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;
    const correlationId = request.headers['x-correlation-id'] || this.generateId();

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.log(
      `[${correlationId}] ${method} ${url} - ${className}.${handlerName}() - ` +
      `IP: ${ip} - UserAgent: ${userAgent}`,
    );

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[${correlationId}] Body: ${JSON.stringify(body)}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(
            `[${correlationId}] ${method} ${url} - ${statusCode} - ${duration}ms`,
          );

          // Log response data trong development
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(
              `[${correlationId}] Response: ${JSON.stringify(data).substring(0, 200)}...`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${correlationId}] ${method} ${url} - ERROR - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

### Performance Logging Interceptor

```typescript
// interceptors/performance.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly SLOW_THRESHOLD = 1000; // 1 giay

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = process.hrtime.bigint(); // Do chinh xac hon Date.now()
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000; // Chuyen tu nanosecond sang millisecond

        if (durationMs > this.SLOW_THRESHOLD) {
          this.logger.warn(
            `SLOW REQUEST: ${method} ${url} - ${durationMs.toFixed(2)}ms ` +
            `(vuot nguong ${this.SLOW_THRESHOLD}ms)`,
          );
        } else {
          this.logger.log(`${method} ${url} - ${durationMs.toFixed(2)}ms`);
        }
      }),
    );
  }
}
```
