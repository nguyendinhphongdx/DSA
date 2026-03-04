# Bai 7: Exception Filters trong NestJS

## Muc luc

- [1. Exception Handling trong NestJS](#1-exception-handling-trong-nestjs)
  - [1.1. Tong quan](#11-tong-quan)
  - [1.2. Luong xu ly exception](#12-luong-xu-ly-exception)
  - [1.3. Default exception response](#13-default-exception-response)
- [2. Built-in HTTP Exceptions](#2-built-in-http-exceptions)
  - [2.1. HttpException co ban](#21-httpexception-co-ban)
  - [2.2. Danh sach day du cac Built-in Exceptions](#22-danh-sach-day-du-cac-built-in-exceptions)
  - [2.3. Su dung tung loai exception](#23-su-dung-tung-loai-exception)
- [3. Custom Exception Classes](#3-custom-exception-classes)
  - [3.1. Tao custom exception](#31-tao-custom-exception)
  - [3.2. Exception voi error codes](#32-exception-voi-error-codes)
  - [3.3. Domain-specific exceptions](#33-domain-specific-exceptions)
- [4. Exception Filters](#4-exception-filters)
  - [4.1. ExceptionFilter Interface](#41-exceptionfilter-interface)
  - [4.2. HttpExceptionFilter](#42-httpexceptionfilter)
  - [4.3. Custom Exception Filter](#43-custom-exception-filter)
  - [4.4. Catch-all Exception Filter](#44-catch-all-exception-filter)
- [5. Binding Filters](#5-binding-filters)
  - [5.1. Method-level (@UseFilters)](#51-method-level-usefilters)
  - [5.2. Controller-level](#52-controller-level)
  - [5.3. Global-level](#53-global-level)
  - [5.4. APP_FILTER Provider](#54-app_filter-provider)
- [6. BaseExceptionFilter (Ke thua)](#6-baseexceptionfilter-ke-thua)
- [7. Chuan hoa Error Response Format](#7-chuan-hoa-error-response-format)
  - [7.1. Error Response Interface](#71-error-response-interface)
  - [7.2. Unified Error Response Filter](#72-unified-error-response-filter)
- [8. Logging Errors trong Filter](#8-logging-errors-trong-filter)
  - [8.1. Su dung NestJS Logger](#81-su-dung-nestjs-logger)
  - [8.2. Tich hop voi external logging service](#82-tich-hop-voi-external-logging-service)
- [9. Exception Filters cho cac truong hop dac biet](#9-exception-filters-cho-cac-truong-hop-dac-biet)
  - [9.1. Database Exception Filter](#91-database-exception-filter)
  - [9.2. Validation Exception Filter](#92-validation-exception-filter)
  - [9.3. Rate Limiting Exception Filter](#93-rate-limiting-exception-filter)
- [10. Vi du Thuc Te Hoan Chinh](#10-vi-du-thuc-te-hoan-chinh)
- [11. Loi Thuong Gap](#11-loi-thuong-gap)
- [12. Best Practices](#12-best-practices)
- [13. Bai Tap](#13-bai-tap)

---

## 1. Exception Handling trong NestJS

### 1.1. Tong quan

NestJS co mot **exception layer** tich hop san, chiu trach nhiem xu ly tat ca cac exceptions chua duoc xu ly trong ung dung. Khi mot exception khong duoc bat boi code cua ban, no se duoc exception layer bat va tu dong gui response phu hop cho client.

```
    EXCEPTION HANDLING ARCHITECTURE
    ┌────────────────────────────────────────────────────┐
    │                                                    │
    │  Client Request                                    │
    │       │                                            │
    │       ▼                                            │
    │  ┌──────────────┐                                  │
    │  │ Middleware    │                                  │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────┐                                  │
    │  │ Guards       │──── throw → Exception Filter     │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────┐                                  │
    │  │ Interceptors │──── throw → Exception Filter     │
    │  │ (before)     │                                  │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────┐                                  │
    │  │ Pipes        │──── throw → Exception Filter     │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────┐                                  │
    │  │ Route Handler│──── throw → Exception Filter     │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────┐                                  │
    │  │ Interceptors │──── throw → Exception Filter     │
    │  │ (after)      │                                  │
    │  └──────┬───────┘                                  │
    │         ▼                                          │
    │  ┌──────────────────┐                              │
    │  │ Exception Filter │  ← BAT TAT CA EXCEPTIONS    │
    │  │                  │  ← Format response           │
    │  │                  │  ← Ghi log                   │
    │  └──────────────────┘                              │
    │         ▼                                          │
    │     Error Response → Client                        │
    │                                                    │
    └────────────────────────────────────────────────────┘
```

### 1.2. Luong xu ly exception

```typescript
// Khi exception xay ra trong bat ky phan nao cua request pipeline
@Controller('users')
export class UserController {
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Neu ParseIntPipe throw BadRequestException
    // => Exception Filter se bat va tra ve response loi

    const user = await this.userService.findById(id);
    if (!user) {
      // Throw exception tu route handler
      throw new NotFoundException(`Khong tim thay user voi id ${id}`);
      // => Exception Filter se bat va tra ve response loi
    }
    return user;
  }
}
```

### 1.3. Default exception response

NestJS mac dinh tra ve JSON response khi exception xay ra:

```typescript
// HttpException response format mac dinh
{
  "statusCode": 404,
  "message": "Khong tim thay user voi id 999",
  "error": "Not Found"
}

// Validation error (tu ValidationPipe)
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request"
}

// Unknown exception (500)
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 2. Built-in HTTP Exceptions

### 2.1. HttpException co ban

`HttpException` la base class cho tat ca HTTP exceptions trong NestJS.

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('demo')
export class DemoController {
  // === Cach 1: String response ===
  @Get('error1')
  throwError1() {
    throw new HttpException('Co loi xay ra', HttpStatus.BAD_REQUEST);
    // Response:
    // {
    //   "statusCode": 400,
    //   "message": "Co loi xay ra"
    // }
  }

  // === Cach 2: Object response ===
  @Get('error2')
  throwError2() {
    throw new HttpException(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Ban khong co quyen truy cap tai nguyen nay',
        error: 'Forbidden',
        details: {
          resource: '/admin/dashboard',
          requiredRole: 'admin',
          currentRole: 'user',
        },
      },
      HttpStatus.FORBIDDEN,
    );
    // Response:
    // {
    //   "statusCode": 403,
    //   "message": "Ban khong co quyen truy cap tai nguyen nay",
    //   "error": "Forbidden",
    //   "details": {
    //     "resource": "/admin/dashboard",
    //     "requiredRole": "admin",
    //     "currentRole": "user"
    //   }
    // }
  }

  // === Cach 3: Voi options (cause) ===
  @Get('error3')
  throwError3() {
    try {
      // Some operation
      throw new Error('Database connection failed');
    } catch (error) {
      throw new HttpException(
        'Khong the ket noi co so du lieu',
        HttpStatus.SERVICE_UNAVAILABLE,
        {
          cause: error, // Luu nguyen nhan goc de debug
          description: 'Database is down',
        },
      );
    }
  }
}
```

### 2.2. Danh sach day du cac Built-in Exceptions

```
    BUILT-IN HTTP EXCEPTIONS
    ┌──────────────────────────────────┬──────┬───────────────────────────┐
    │ Exception Class                  │ Code │ Khi nao su dung           │
    ├──────────────────────────────────┼──────┼───────────────────────────┤
    │ BadRequestException              │ 400  │ Request sai format/data   │
    │ UnauthorizedException            │ 401  │ Chua dang nhap            │
    │ ForbiddenException               │ 403  │ Khong du quyen            │
    │ NotFoundException                │ 404  │ Tai nguyen khong ton tai  │
    │ MethodNotAllowedException        │ 405  │ HTTP method sai           │
    │ NotAcceptableException           │ 406  │ Content type khong hop le │
    │ RequestTimeoutException          │ 408  │ Request qua thoi gian     │
    │ ConflictException                │ 409  │ Xung dot du lieu          │
    │ GoneException                    │ 410  │ Tai nguyen da bi xoa      │
    │ PayloadTooLargeException         │ 413  │ Request body qua lon      │
    │ UnsupportedMediaTypeException    │ 415  │ Content-Type khong ho tro │
    │ UnprocessableEntityException     │ 422  │ Du lieu khong xu ly duoc  │
    │ InternalServerErrorException     │ 500  │ Loi server noi bo         │
    │ NotImplementedException          │ 501  │ Tinh nang chua implement  │
    │ BadGatewayException              │ 502  │ Loi tu upstream server    │
    │ ServiceUnavailableException      │ 503  │ Service tam thoi khong kha dung │
    │ GatewayTimeoutException          │ 504  │ Upstream server timeout   │
    │ HttpVersionNotSupportedException │ 505  │ HTTP version khong ho tro │
    └──────────────────────────────────┴──────┴───────────────────────────┘
```

### 2.3. Su dung tung loai exception

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  NotImplementedException,
  GoneException,
  PayloadTooLargeException,
  UnprocessableEntityException,
  ServiceUnavailableException,
  RequestTimeoutException,
} from '@nestjs/common';

@Injectable()
export class UserService {
  // 400 - Bad Request
  validateInput(data: any) {
    if (!data.email || !data.name) {
      throw new BadRequestException('Email va ten la bat buoc');
    }
    if (data.age && (data.age < 0 || data.age > 150)) {
      throw new BadRequestException({
        message: 'Tuoi khong hop le',
        field: 'age',
        constraints: { min: 0, max: 150, received: data.age },
      });
    }
  }

  // 401 - Unauthorized
  verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token khong duoc cung cap');
    }
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token khong hop le hoac da het han');
    }
  }

  // 403 - Forbidden
  checkPermission(user: User, resource: string) {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        `Ban khong co quyen truy cap ${resource}. Yeu cau quyen admin.`,
      );
    }
  }

  // 404 - Not Found
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        message: `Nguoi dung voi ID ${id} khong ton tai`,
        error: 'User Not Found',
        suggestion: 'Vui long kiem tra lai ID hoac su dung GET /users de xem danh sach',
      });
    }
    return user;
  }

  // 409 - Conflict
  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException({
        message: `Email ${dto.email} da duoc su dung`,
        field: 'email',
        suggestion: 'Hay su dung email khac hoac dang nhap voi tai khoan da co',
      });
    }
    return this.userRepository.save(dto);
  }

  // 410 - Gone
  async getDeletedUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (user?.deletedAt) {
      throw new GoneException(
        `Nguoi dung #${id} da bi xoa vao ${user.deletedAt.toISOString()}`,
      );
    }
  }

  // 413 - Payload Too Large
  validateFileSize(file: Express.Multer.File) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new PayloadTooLargeException(
        `File qua lon: ${(file.size / 1024 / 1024).toFixed(2)}MB. Toi da cho phep: 5MB`,
      );
    }
  }

  // 422 - Unprocessable Entity
  processData(data: any) {
    if (data.startDate > data.endDate) {
      throw new UnprocessableEntityException(
        'Ngay bat dau khong the sau ngay ket thuc',
      );
    }
  }

  // 500 - Internal Server Error
  async processPayment(orderId: number) {
    try {
      return await this.paymentGateway.charge(orderId);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Loi xu ly thanh toan. Vui long thu lai sau.',
        errorId: `ERR_${Date.now()}`, // ID de tra cuu log
      });
    }
  }

  // 501 - Not Implemented
  exportToPdf() {
    throw new NotImplementedException(
      'Tinh nang xuat PDF dang duoc phat trien. Du kien hoan thanh: Q2 2025',
    );
  }

  // 503 - Service Unavailable
  async checkServiceHealth() {
    const isDbConnected = await this.checkDatabase();
    if (!isDbConnected) {
      throw new ServiceUnavailableException({
        message: 'He thong dang bao tri. Vui long thu lai sau 5 phut.',
        retryAfter: 300, // seconds
      });
    }
  }

  // 408 - Request Timeout
  async longRunningTask() {
    const timeout = 30000;
    const result = await Promise.race([
      this.heavyComputation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout),
      ),
    ]).catch(() => {
      throw new RequestTimeoutException(
        `Yeu cau da vuot qua thoi gian cho (${timeout / 1000}s). Vui long thu lai.`,
      );
    });
    return result;
  }
}
```

---

## 3. Custom Exception Classes

### 3.1. Tao custom exception

```typescript
// exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

// Custom exception co ban
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode,
        message,
        error: 'Business Error',
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// Custom exception voi error code
export class AppException extends HttpException {
  public readonly errorCode: string;

  constructor(
    errorCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
    this.errorCode = errorCode;
  }
}

// Su dung
@Injectable()
export class PaymentService {
  async processPayment(amount: number) {
    if (amount <= 0) {
      throw new AppException(
        'PAYMENT_INVALID_AMOUNT',
        'So tien thanh toan phai lon hon 0',
        HttpStatus.BAD_REQUEST,
        { amount, minimumAmount: 1000 },
      );
    }

    if (amount > 100000000) {
      throw new AppException(
        'PAYMENT_LIMIT_EXCEEDED',
        'So tien vuot qua gioi han giao dich',
        HttpStatus.UNPROCESSABLE_ENTITY,
        { amount, maxAmount: 100000000 },
      );
    }
  }
}
```

### 3.2. Exception voi error codes

```typescript
// constants/error-codes.ts
export const ErrorCodes = {
  // Auth errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Email hoac mat khau khong dung',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_002',
    message: 'Token da het han. Vui long dang nhap lai.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTH_003',
    message: 'Ban khong co quyen thuc hien hanh dong nay',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 'AUTH_004',
    message: 'Tai khoan da bi khoa do dang nhap sai qua nhieu lan',
    status: HttpStatus.FORBIDDEN,
  },

  // User errors (USER_xxx)
  USER_NOT_FOUND: {
    code: 'USER_001',
    message: 'Nguoi dung khong ton tai',
    status: HttpStatus.NOT_FOUND,
  },
  USER_EMAIL_EXISTS: {
    code: 'USER_002',
    message: 'Email da duoc su dung',
    status: HttpStatus.CONFLICT,
  },
  USER_PHONE_EXISTS: {
    code: 'USER_003',
    message: 'So dien thoai da duoc su dung',
    status: HttpStatus.CONFLICT,
  },

  // Order errors (ORDER_xxx)
  ORDER_NOT_FOUND: {
    code: 'ORDER_001',
    message: 'Don hang khong ton tai',
    status: HttpStatus.NOT_FOUND,
  },
  ORDER_ALREADY_CANCELLED: {
    code: 'ORDER_002',
    message: 'Don hang da bi huy truoc do',
    status: HttpStatus.CONFLICT,
  },
  ORDER_CANNOT_CANCEL: {
    code: 'ORDER_003',
    message: 'Khong the huy don hang da duoc giao',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  ORDER_INSUFFICIENT_STOCK: {
    code: 'ORDER_004',
    message: 'San pham khong du so luong ton kho',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  // Payment errors (PAY_xxx)
  PAYMENT_FAILED: {
    code: 'PAY_001',
    message: 'Thanh toan that bai',
    status: HttpStatus.PAYMENT_REQUIRED,
  },
  PAYMENT_INSUFFICIENT_FUNDS: {
    code: 'PAY_002',
    message: 'So du tai khoan khong du',
    status: HttpStatus.PAYMENT_REQUIRED,
  },
} as const;

// Type helper
export type ErrorCode = keyof typeof ErrorCodes;

// Custom exception su dung error codes
export class AppException extends HttpException {
  constructor(
    errorCode: ErrorCode,
    additionalMessage?: string,
    details?: any,
  ) {
    const errorDef = ErrorCodes[errorCode];
    const message = additionalMessage
      ? `${errorDef.message}. ${additionalMessage}`
      : errorDef.message;

    super(
      {
        statusCode: errorDef.status,
        errorCode: errorDef.code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      errorDef.status,
    );
  }
}

// Su dung rat sach va gon gang
@Injectable()
export class UserService {
  async findById(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new AppException('USER_NOT_FOUND', `ID: ${id}`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new AppException('USER_EMAIL_EXISTS', undefined, {
        email: dto.email,
      });
    }
    return this.repo.save(dto);
  }
}
```

### 3.3. Domain-specific exceptions

```typescript
// exceptions/domain/index.ts

// Base domain exception
export abstract class DomainException extends HttpException {
  abstract readonly domain: string;

  constructor(message: string, status: HttpStatus, details?: any) {
    super(
      {
        statusCode: status,
        domain: (new.target as any).prototype.domain || 'Unknown',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

// User domain exceptions
export class UserNotFoundException extends DomainException {
  readonly domain = 'User';
  constructor(identifier: string | number) {
    super(`Nguoi dung "${identifier}" khong ton tai`, HttpStatus.NOT_FOUND);
  }
}

export class UserEmailAlreadyExistsException extends DomainException {
  readonly domain = 'User';
  constructor(email: string) {
    super(
      `Email "${email}" da duoc dang ky`,
      HttpStatus.CONFLICT,
      { email },
    );
  }
}

export class UserAccountLockedException extends DomainException {
  readonly domain = 'User';
  constructor(userId: number, lockUntil: Date) {
    super(
      `Tai khoan bi khoa den ${lockUntil.toISOString()}`,
      HttpStatus.FORBIDDEN,
      { userId, lockUntil },
    );
  }
}

// Order domain exceptions
export class OrderNotFoundException extends DomainException {
  readonly domain = 'Order';
  constructor(orderId: string) {
    super(`Don hang "${orderId}" khong ton tai`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientStockException extends DomainException {
  readonly domain = 'Inventory';
  constructor(productId: number, requested: number, available: number) {
    super(
      `San pham #${productId}: yeu cau ${requested}, con ${available}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { productId, requested, available },
    );
  }
}

// Su dung - rat ro rang va tu tai lieu hoa
@Injectable()
export class OrderService {
  async createOrder(userId: number, items: OrderItem[]): Promise<Order> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundException(userId);

    for (const item of items) {
      const stock = await this.inventoryService.getStock(item.productId);
      if (stock < item.quantity) {
        throw new InsufficientStockException(item.productId, item.quantity, stock);
      }
    }

    // ... tao don hang
  }
}
```

---

## 4. Exception Filters

### 4.1. ExceptionFilter Interface

```typescript
// Interface ma moi exception filter phai implement
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

// ExceptionFilter<T> interface:
// interface ExceptionFilter<T = any> {
//   catch(exception: T, host: ArgumentsHost): any;
// }

// ArgumentsHost cho phep truy cap request/response objects
// Phuong thuc chinh:
// - host.switchToHttp()   → { getRequest(), getResponse(), getNext() }
// - host.switchToWs()     → { getClient(), getData(), getPattern() }
// - host.switchToRpc()    → { getContext(), getData() }
// - host.getType()        → 'http' | 'ws' | 'rpc'
// - host.getArgs()        → [request, response, next] (cho HTTP)
```

### 4.2. HttpExceptionFilter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Filter chi bat HttpException (va cac class con cua no)
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Xu ly response (co the la string hoac object)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message,
      error:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).error
          : undefined,
    };

    // Log error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorResponse.message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
```

### 4.3. Custom Exception Filter

```typescript
// === Filter cho mot loai exception cu the ===
@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);

  catch(exception: BusinessException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      success: false,
      statusCode: status,
      errorCode: exception.errorCode,
      message: exception.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `Business Error: ${exception.errorCode} - ${exception.message}`,
    );

    response.status(status).json(errorResponse);
  }
}

// === Filter bat nhieu loai exception ===
@Catch(HttpException, BusinessException)
export class CombinedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | BusinessException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: any;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      errorResponse = {
        type: 'BusinessError',
        errorCode: exception.errorCode,
        message: exception.message,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exRes = exception.getResponse();
      errorResponse = {
        type: 'HttpError',
        message: typeof exRes === 'string' ? exRes : (exRes as any).message,
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        type: 'UnknownError',
        message: 'Loi khong xac dinh',
      };
    }

    response.status(status).json({
      ...errorResponse,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 4.4. Catch-all Exception Filter

```typescript
// Filter bat TAT CA exceptions (ke ca non-HTTP exceptions)
@Catch() // Khong truyen tham so = bat tat ca
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Xac dinh status code
    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      // HTTP Exception (bao gom tat ca built-in exceptions)
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
        error = 'Error';
      } else {
        message = (exResponse as any).message || exception.message;
        error = (exResponse as any).error || 'Error';
      }
    } else if (exception instanceof Error) {
      // JavaScript Error thong thuong
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = exception.name;

      // Log stack trace cho server errors
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Exception la gi do khac (string, number, v.v.)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Loi he thong khong xac dinh';
      error = 'Internal Server Error';

      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
    }

    // Khong tra ve chi tiet loi trong production
    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: isProduction && status === 500
        ? 'Loi he thong. Vui long thu lai sau.'
        : message,
      error: isProduction && status === 500
        ? 'Internal Server Error'
        : error,
      // Chi tra ve stack trace trong development
      ...(isProduction ? {} : {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
```

---

## 5. Binding Filters

### 5.1. Method-level (@UseFilters)

```typescript
import { UseFilters } from '@nestjs/common';

@Controller('users')
export class UserController {
  // Ap dung filter cho 1 method
  @Get(':id')
  @UseFilters(HttpExceptionFilter)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  // Ap dung nhieu filters (chay tu phai sang trai)
  @Post()
  @UseFilters(BusinessExceptionFilter, HttpExceptionFilter)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // Truyen instance (co the cau hinh)
  @Delete(':id')
  @UseFilters(new HttpExceptionFilter())
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
```

### 5.2. Controller-level

```typescript
// Ap dung filter cho TAT CA methods trong controller
@Controller('orders')
@UseFilters(AllExceptionsFilter)
export class OrderController {
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }
  // Tat ca methods deu duoc bao ve boi AllExceptionsFilter
}
```

### 5.3. Global-level

```typescript
// Trong main.ts - KHONG inject dependencies duoc
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Nhieu global filters (chay tu cuoi len dau)
  app.useGlobalFilters(
    new AllExceptionsFilter(),      // Chay cuoi cung (catch-all)
    new HttpExceptionFilter(),      // Chay thu 2
    new BusinessExceptionFilter(),  // Chay dau tien
  );

  await app.listen(3000);
}
```

### 5.4. APP_FILTER Provider

```typescript
// Trong module - CO the inject dependencies
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    // Filter co the inject LoggerService, ConfigService, v.v.
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Nhieu filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BusinessExceptionFilter,
    },
  ],
})
export class AppModule {}

// AllExceptionsFilter co the inject dependencies
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,         // Inject duoc!
    private readonly configService: ConfigService,  // Inject duoc!
    private readonly alertService: AlertService,    // Inject duoc!
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Ghi log chi tiet
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    // Gui alert cho team khi co loi 500 tren production
    if (isProduction && this.getStatus(exception) >= 500) {
      this.alertService.sendAlert({
        level: 'critical',
        message: `Server Error: ${exception}`,
      });
    }

    // ... tra ve response
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) return exception.getStatus();
    return 500;
  }
}
```

**Thu tu uu tien:**

```
    Method Filter > Controller Filter > Global Filter
    (Chay dau tien)                    (Chay cuoi cung)

    Neu Method Filter xu ly exception thanh cong,
    Controller va Global Filters se KHONG chay.
```

---

## 6. BaseExceptionFilter (Ke thua)

NestJS cung cap `BaseExceptionFilter` de ke thua va mo rong behavior mac dinh.

```typescript
import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

// Ke thua BaseExceptionFilter thay vi implement ExceptionFilter
@Catch()
export class ExtendedExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // Them logic truoc khi xu ly
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Ghi log
    console.error(`[${new Date().toISOString()}] Error at ${request.method} ${request.url}`);

    if (exception instanceof Error) {
      console.error(`Message: ${exception.message}`);
      console.error(`Stack: ${exception.stack}`);
    }

    // Gui alert khi loi 500
    if (!(exception instanceof HttpException) || exception.getStatus() >= 500) {
      this.sendErrorAlert(exception, request);
    }

    // Goi super.catch() de su dung xu ly mac dinh cua NestJS
    super.catch(exception, host);
  }

  private sendErrorAlert(exception: unknown, request: any): void {
    // Gui alert qua Slack, email, v.v.
    console.error('ALERT: Server error occurred!', {
      url: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.message : 'Unknown error',
    });
  }
}

// Dang ky global
// Trong main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExtendedExceptionFilter(httpAdapter));
  await app.listen(3000);
}

// Hoac trong module (khuyen dung)
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExtendedExceptionFilter,
    },
  ],
})
export class AppModule {}
```

---

## 7. Chuan hoa Error Response Format

### 7.1. Error Response Interface

```typescript
// interfaces/error-response.interface.ts
export interface ErrorResponse {
  success: false;
  statusCode: number;
  errorCode?: string;
  message: string | string[];
  details?: any;
  path: string;
  method: string;
  timestamp: string;
  requestId?: string;
  // Chi co trong development
  stack?: string;
  cause?: string;
}

// interfaces/api-response.interface.ts
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### 7.2. Unified Error Response Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    const { status, message, errorCode, details, stack } = this.parseException(exception);

    // Log error
    this.logError(requestId, request, exception, status);

    // Build response
    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId,
      ...(errorCode && { errorCode }),
      ...(details && { details }),
      ...(!this.isProduction && stack && { stack }),
    };

    // An thong tin nhay cam trong production
    if (this.isProduction && status >= 500) {
      errorResponse.message = 'Loi he thong. Vui long thu lai sau.';
      delete errorResponse.details;
    }

    response.status(status).json(errorResponse);
  }

  private parseException(exception: unknown): {
    status: number;
    message: string | string[];
    errorCode?: string;
    details?: any;
    stack?: string;
  } {
    // HttpException (NestJS built-in)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        return {
          status,
          message: exResponse,
          stack: exception.stack,
        };
      }

      const responseObj = exResponse as Record<string, any>;
      return {
        status,
        message: responseObj.message || exception.message,
        errorCode: responseObj.errorCode || responseObj.code,
        details: responseObj.details,
        stack: exception.stack,
      };
    }

    // AppException (custom)
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        message: exception.message,
        errorCode: exception.errorCode,
        details: (exception.getResponse() as any).details,
        stack: exception.stack,
      };
    }

    // TypeORM errors
    if (exception instanceof Error && exception.constructor.name === 'QueryFailedError') {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Loi truy van co so du lieu',
        errorCode: 'DB_QUERY_FAILED',
        stack: exception.stack,
      };
    }

    // Standard Error
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        stack: exception.stack,
      };
    }

    // Unknown
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Loi khong xac dinh',
    };
  }

  private logError(
    requestId: string,
    request: Request,
    exception: unknown,
    status: number,
  ): void {
    const logMessage = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: (request as any).user?.id,
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${JSON.stringify(logMessage)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(`Client Error: ${JSON.stringify(logMessage)}`);
    }
  }
}
```

---

## 8. Logging Errors trong Filter

### 8.1. Su dung NestJS Logger

```typescript
import { Logger } from '@nestjs/common';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log levels khac nhau theo severity
    if (status >= 500) {
      // Loi server: log.error voi stack trace
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
        'ServerError',
      );
    } else if (status >= 400) {
      // Loi client: log.warn
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${
          exception instanceof HttpException ? exception.message : 'Unknown'
        }`,
        'ClientError',
      );
    }

    // Log request details
    this.logger.debug(
      JSON.stringify({
        url: request.url,
        method: request.method,
        headers: {
          'user-agent': request.headers['user-agent'],
          'content-type': request.headers['content-type'],
        },
        query: request.query,
        body: request.body, // Can than voi thong tin nhay cam
        params: request.params,
        ip: request.ip,
      }),
      'RequestDetails',
    );

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' ? (message as any).message : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 8.2. Tich hop voi external logging service

```typescript
// Tich hop voi Winston, Sentry, hoac ELK Stack
@Catch()
export class ProductionExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService, // Custom logger (Winston)
    @Inject('SENTRY_CLIENT') private readonly sentry: any,
    @Inject('METRICS_SERVICE') private readonly metrics: MetricsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    // 1. Ghi log chi tiet voi Winston
    this.logger.error({
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      request: {
        url: request.url,
        method: request.method,
        ip: request.ip,
        userId: (request as any).user?.id,
      },
      statusCode: status,
      timestamp: new Date().toISOString(),
    });

    // 2. Gui loi len Sentry (chi loi 500)
    if (status >= 500 && exception instanceof Error) {
      this.sentry.captureException(exception, {
        extra: {
          url: request.url,
          method: request.method,
          userId: (request as any).user?.id,
        },
        tags: {
          statusCode: status.toString(),
        },
      });
    }

    // 3. Cap nhat metrics
    this.metrics.incrementCounter('http_errors_total', {
      status_code: status.toString(),
      method: request.method,
      path: request.route?.path || request.url,
    });

    // 4. Tra ve response
    const errorResponse = {
      statusCode: status,
      message: status >= 500
        ? 'Loi he thong. Vui long thu lai sau.'
        : (exception instanceof HttpException
            ? (exception.getResponse() as any).message || exception.message
            : 'Unknown error'),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
```

---

## 9. Exception Filters cho cac truong hop dac biet

### 9.1. Database Exception Filter

```typescript
// Bat loi tu TypeORM / database operations
@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Kiem tra neu la loi TypeORM
    if (exception.constructor?.name === 'QueryFailedError') {
      const dbError = this.handleQueryError(exception);
      response.status(dbError.status).json({
        ...dbError,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Neu khong phai loi DB, throw lai de filter khac xu ly
    throw exception;
  }

  private handleQueryError(exception: any): {
    status: number;
    message: string;
    errorCode: string;
  } {
    const code = exception.code || exception.driverError?.code;

    switch (code) {
      // PostgreSQL error codes
      case '23505': // unique_violation
        const detail = exception.detail || '';
        const match = detail.match(/Key \((\w+)\)=\((.+)\)/);
        const field = match ? match[1] : 'unknown';
        const value = match ? match[2] : 'unknown';
        return {
          status: HttpStatus.CONFLICT,
          message: `Gia tri "${value}" cua truong "${field}" da ton tai`,
          errorCode: 'DB_UNIQUE_VIOLATION',
        };

      case '23503': // foreign_key_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tham chieu khong hop le. Ban ghi lien quan khong ton tai.',
          errorCode: 'DB_FOREIGN_KEY_VIOLATION',
        };

      case '23502': // not_null_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Truong bat buoc khong duoc de trong',
          errorCode: 'DB_NOT_NULL_VIOLATION',
        };

      case '22001': // string_data_right_truncation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Du lieu vuot qua do dai cho phep',
          errorCode: 'DB_STRING_TOO_LONG',
        };

      default:
        this.logger.error(`Database error: ${code}`, exception.stack);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Loi co so du lieu. Vui long thu lai sau.',
          errorCode: 'DB_UNKNOWN_ERROR',
        };
    }
  }
}
```

### 9.2. Validation Exception Filter

```typescript
// Tuy chinh format loi validation
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exResponse = exception.getResponse() as any;

    // Kiem tra xem co phai validation error khong
    const isValidationError = Array.isArray(exResponse.message);

    if (!isValidationError) {
      // Khong phai validation error, tra ve binh thuong
      response.status(status).json({
        success: false,
        statusCode: status,
        message: exResponse.message || exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Format validation errors dep hon
    const formattedErrors = this.formatValidationErrors(exResponse.message);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: 'Du lieu nhap vao khong hop le',
      errors: formattedErrors,
      totalErrors: formattedErrors.length,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatValidationErrors(messages: string[]): Array<{
    field: string;
    message: string;
  }> {
    return messages.map(msg => {
      // Phan tich message de tach field va message
      // VD: "name must be a string" → { field: "name", message: "must be a string" }
      const parts = msg.split(' ');
      const field = parts[0];
      const message = parts.slice(1).join(' ');

      return { field, message: msg };
    });
  }
}
```

### 9.3. Rate Limiting Exception Filter

```typescript
@Catch(ThrottlerException)
export class RateLimitExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const retryAfter = 60; // seconds

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .header('Retry-After', retryAfter.toString())
      .header('X-RateLimit-Limit', '100')
      .header('X-RateLimit-Remaining', '0')
      .json({
        success: false,
        statusCode: 429,
        message: 'Qua nhieu yeu cau. Vui long thu lai sau.',
        retryAfter: retryAfter,
        retryAfterFormatted: `${retryAfter} giay`,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

---

## 10. Vi du Thuc Te Hoan Chinh

```typescript
// === TOAN BO SETUP EXCEPTION HANDLING CHO PRODUCTION APP ===

// === 1. Custom Exceptions ===
// exceptions/app.exception.ts
export class AppException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    statusCode: HttpStatus,
    public readonly details?: any,
  ) {
    super(
      { statusCode, errorCode, message, details },
      statusCode,
    );
  }
}

// exceptions/domain/user.exceptions.ts
export class UserNotFoundException extends AppException {
  constructor(userId: number | string) {
    super(
      'USER_NOT_FOUND',
      `Nguoi dung #${userId} khong ton tai`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserEmailExistsException extends AppException {
  constructor(email: string) {
    super(
      'USER_EMAIL_EXISTS',
      `Email "${email}" da duoc su dung`,
      HttpStatus.CONFLICT,
      { email },
    );
  }
}

export class InvalidCredentialsException extends AppException {
  constructor() {
    super(
      'AUTH_INVALID_CREDENTIALS',
      'Email hoac mat khau khong chinh xac',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountLockedException extends AppException {
  constructor(unlockAt: Date) {
    super(
      'AUTH_ACCOUNT_LOCKED',
      `Tai khoan bi khoa. Thu lai luc ${unlockAt.toLocaleString('vi-VN')}`,
      HttpStatus.FORBIDDEN,
      { unlockAt },
    );
  }
}

// === 2. Global Exception Filter ===
// filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  constructor(
    @Optional() @Inject('ALERT_SERVICE') private readonly alertService?: AlertService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // Ho tro nhieu transport types
    if (host.getType() === 'http') {
      this.handleHttpException(exception, host);
    }
    // Co the them ws, rpc...
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    const errorInfo = this.extractErrorInfo(exception);

    // Logging
    this.logError(requestId, request, errorInfo, exception);

    // Alerting (chi cho loi nghiem trong)
    if (errorInfo.status >= 500) {
      this.sendAlert(requestId, request, errorInfo);
    }

    // Response
    const isProduction = process.env.NODE_ENV === 'production';
    response.status(errorInfo.status).json({
      success: false,
      statusCode: errorInfo.status,
      errorCode: errorInfo.errorCode,
      message: isProduction && errorInfo.status >= 500
        ? 'Loi he thong. Vui long thu lai sau.'
        : errorInfo.message,
      details: isProduction && errorInfo.status >= 500
        ? undefined
        : errorInfo.details,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractErrorInfo(exception: unknown): {
    status: number;
    message: string | string[];
    errorCode?: string;
    details?: any;
  } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        message: exception.message,
        errorCode: exception.errorCode,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      return {
        status: exception.getStatus(),
        message: res.message || exception.message,
        errorCode: res.errorCode,
        details: res.details,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        errorCode: 'INTERNAL_ERROR',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Loi khong xac dinh',
      errorCode: 'UNKNOWN_ERROR',
    };
  }

  private logError(
    requestId: string,
    request: Request,
    errorInfo: any,
    exception: unknown,
  ): void {
    const logData = {
      requestId,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userId: (request as any).user?.id,
      statusCode: errorInfo.status,
      errorCode: errorInfo.errorCode,
      message: errorInfo.message,
    };

    if (errorInfo.status >= 500) {
      this.logger.error(
        JSON.stringify(logData),
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(JSON.stringify(logData));
    }
  }

  private sendAlert(requestId: string, request: Request, errorInfo: any): void {
    this.alertService?.sendAlert({
      level: 'critical',
      title: `Server Error ${errorInfo.status}`,
      message: `${request.method} ${request.url} - ${errorInfo.message}`,
      metadata: { requestId },
    });
  }
}

// === 3. Service su dung exceptions ===
@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION = 30 * 60 * 1000; // 30 phut

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Kiem tra tai khoan bi khoa
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AccountLockedException(user.lockedUntil);
    }

    // Kiem tra mat khau
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new InvalidCredentialsException();
    }

    // Reset login attempts
    await this.userService.resetLoginAttempts(user.id);

    // Tao token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken: token };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const attempts = user.loginAttempts + 1;

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCK_DURATION);
      await this.userService.lockAccount(user.id, lockUntil);
    } else {
      await this.userService.incrementLoginAttempts(user.id);
    }
  }
}

// === 4. Module setup ===
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
```

---

## 11. Loi Thuong Gap

### Loi 1: Quen dang ky filter

```typescript
// ❌ LOI: Filter khong duoc dang ky
@Catch(HttpException)
export class MyFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) { /* ... */ }
}
// Filter nay se KHONG chay!

// ✅ DUNG: Phai dang ky o 1 trong cac levels
// Method: @UseFilters(MyFilter)
// Controller: @UseFilters(MyFilter)
// Global: app.useGlobalFilters(new MyFilter())
// Module: { provide: APP_FILTER, useClass: MyFilter }
```

### Loi 2: Exception bi nuot (swallowed)

```typescript
// ❌ LOI: Bat exception nhung khong throw lai
@Injectable()
export class UserService {
  async findById(id: number) {
    try {
      return await this.repo.findOne({ where: { id } });
    } catch (error) {
      console.log('Error:', error);
      // KHONG throw lai => client nhan duoc undefined thay vi loi!
    }
  }
}

// ✅ DUNG: Throw HttpException tu try/catch
@Injectable()
export class UserService {
  async findById(id: number) {
    try {
      const user = await this.repo.findOne({ where: { id } });
      if (!user) throw new NotFoundException(`User #${id} not found`);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error; // Re-throw HTTP exceptions
      throw new InternalServerErrorException('Loi khi truy van database');
    }
  }
}
```

### Loi 3: Lo thong tin nhay cam trong error response

```typescript
// ❌ NGUY HIEM: Lo thong tin nhay cam
@Catch()
export class BadFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(500).json({
      message: exception.message, // Co the chua thong tin nhay cam
      stack: exception.stack,      // Lo stack trace tren production!
      query: exception.query,      // Lo SQL query!
    });
  }
}

// ✅ AN TOAN: An thong tin nhay cam tren production
@Catch()
export class SafeFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const isProduction = process.env.NODE_ENV === 'production';

    response.status(500).json({
      message: isProduction ? 'Loi he thong' : exception.message,
      ...(isProduction ? {} : { stack: exception.stack }),
    });
  }
}
```

### Loi 4: Filter khong xu ly tat ca exception types

```typescript
// ❌ LOI: Chi bat HttpException, bo sot loi khac
@Catch(HttpException)
export class OnlyHttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) { /* ... */ }
}
// TypeError, RangeError, Database errors... se dung default handler

// ✅ DUNG: Dung ca 2 filters
@Catch(HttpException)
export class HttpFilter implements ExceptionFilter { /* ... */ }

@Catch()
export class CatchAllFilter implements ExceptionFilter { /* ... */ }

// Dang ky dung thu tu
app.useGlobalFilters(
  new CatchAllFilter(),  // Catch-all (chay cuoi cung)
  new HttpFilter(),       // Http-specific (chay truoc)
);
```

---

## 12. Best Practices

### 1. Su dung custom exception classes co y nghia

```typescript
// ✅ Ro rang, tu tai lieu hoa
throw new UserNotFoundException(userId);
throw new InsufficientStockException(productId, requested, available);
throw new InvalidCredentialsException();

// ❌ Chung chung, kho hieu
throw new BadRequestException('Error');
throw new HttpException('Something went wrong', 400);
```

### 2. Luon co global catch-all filter

```typescript
// ✅ Dam bao khong exception nao thoat khoi ung dung ma khong duoc xu ly
@Module({
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
```

### 3. Phan biet loi client va loi server trong log

```typescript
// ✅ Log khac nhau theo severity
if (status >= 500) {
  this.logger.error(message, stack); // ERROR level
} else if (status >= 400) {
  this.logger.warn(message);         // WARN level
}
```

### 4. Khong lo thong tin nhay cam

```typescript
// ✅ An chi tiet loi tren production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && status >= 500) {
  errorResponse.message = 'Loi he thong. Vui long thu lai sau.';
  delete errorResponse.stack;
  delete errorResponse.details;
}
```

### 5. Su dung error codes de client xu ly

```typescript
// ✅ Client co the lap trinh xu ly dua tren error code
{
  "errorCode": "USER_EMAIL_EXISTS",
  "message": "Email da ton tai"
}
// Client: if (error.errorCode === 'USER_EMAIL_EXISTS') { showEmailExistsDialog(); }
```

### 6. Them request ID de trace loi

```typescript
// ✅ De dang trace loi giua client va server logs
const requestId = request.headers['x-request-id'] || uuidv4();
response.header('X-Request-ID', requestId);
errorResponse.requestId = requestId;
```

---

## 13. Bai Tap

### Bai tap 1: Built-in Exceptions (De)

Tao UserService voi cac methods sau, su dung dung loai exception:
- `findById(id)` - NotFoundException khi khong tim thay
- `create(dto)` - ConflictException khi email trung
- `update(id, dto)` - NotFoundException + BadRequestException
- `delete(id)` - NotFoundException + ForbiddenException (khong duoc xoa admin)
- `login(email, password)` - UnauthorizedException

### Bai tap 2: Custom Exceptions (Trung binh)

Tao he thong error codes va custom exceptions cho ung dung e-commerce:
- Dinh nghia error codes cho: User, Product, Order, Payment, Inventory
- Tao base AppException class
- Tao it nhat 10 domain-specific exception classes
- Moi exception co errorCode, message, details phu hop

### Bai tap 3: Exception Filters (Trung binh)

Tao cac exception filters:
- `HttpExceptionFilter` - format lai response cho tat ca HTTP errors
- `ValidationExceptionFilter` - format dep cho validation errors
- `DatabaseExceptionFilter` - xu ly loi database (unique, foreign key, v.v.)
- Dang ky tat ca filters dung thu tu uu tien

### Bai tap 4: Production-ready Error Handling (Kho)

Xay dung he thong xu ly loi hoan chinh:
- Global exception filter voi logging
- Error response format chuan (co requestId, timestamp, errorCode)
- An thong tin nhay cam tren production
- Ghi log phan biet theo severity (error, warn, info)
- Custom exceptions cho it nhat 3 domains
- Unit tests cho tat ca filters va exceptions

### Bai tap 5: Tong hop (Nang cao)

Xay dung API quan ly san pham voi error handling day du:
- CRUD endpoints voi dung exception types
- Custom domain exceptions (ProductNotFoundException, DuplicateSkuException, InsufficientStockException, InvalidPriceException...)
- Global exception filter tich hop voi Winston logger
- Database exception filter cho TypeORM errors
- Rate limiting exception filter
- Error response chuan hoa cho ca REST va WebSocket
- Viet integration tests kiem tra error responses

---

## Tong ket

```
    EXCEPTION HANDLING TRONG NestJS - TONG QUAN
    ┌───────────────────────────────────────────────────────┐
    │                                                       │
    │  BUILT-IN EXCEPTIONS                                  │
    │  ├── 4xx: BadRequest, Unauthorized, Forbidden,        │
    │  │        NotFound, Conflict, Unprocessable...         │
    │  └── 5xx: InternalServer, NotImplemented,             │
    │           ServiceUnavailable, GatewayTimeout...       │
    │                                                       │
    │  CUSTOM EXCEPTIONS                                    │
    │  ├── extends HttpException                            │
    │  ├── Error codes (APP_001, USER_002...)               │
    │  └── Domain exceptions (UserNotFound, StockInsufficient)│
    │                                                       │
    │  EXCEPTION FILTERS                                    │
    │  ├── @Catch(ExceptionType) decorator                  │
    │  ├── ExceptionFilter interface                        │
    │  ├── BaseExceptionFilter (ke thua)                    │
    │  └── Catch-all filter (@Catch() khong tham so)        │
    │                                                       │
    │  BINDING LEVELS                                       │
    │  ├── Method: @UseFilters(Filter)                      │
    │  ├── Controller: @UseFilters(Filter)                  │
    │  ├── Global: app.useGlobalFilters()                   │
    │  └── Module: APP_FILTER provider                      │
    │                                                       │
    │  BEST PRACTICES                                       │
    │  ├── Custom exceptions co y nghia                     │
    │  ├── Error codes cho client                           │
    │  ├── Log phan biet theo severity                      │
    │  ├── An thong tin nhay cam tren production            │
    │  └── Request ID de trace loi                          │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

> **Tiep theo:** [Bai 1: Guards va Authorization](../../04-NestJS-Advanced/01-Guards-and-Authorization/README.md) - Tim hieu cach bao ve routes voi guards trong NestJS.
