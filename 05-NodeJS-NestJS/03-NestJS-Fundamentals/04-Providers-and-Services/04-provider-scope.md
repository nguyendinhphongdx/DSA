# Provider scope (DEFAULT, REQUEST, TRANSIENT)

## 5. Provider Scope

### 5.1. Cac loai Scope

NestJS ho tro 3 loai scope cho providers:

| Scope | Mo ta | Lifetime |
|-------|--------|----------|
| `DEFAULT` | Singleton - 1 instance cho toan bo app | Suot vong doi app |
| `REQUEST` | 1 instance moi cho moi request | Trong 1 request |
| `TRANSIENT` | 1 instance moi moi khi inject | Moi lan inject |

### 5.2. DEFAULT Scope (Singleton)

```typescript
// Mac dinh: Singleton
// Tat ca controllers/services dung chung 1 instance
@Injectable() // scope: Scope.DEFAULT (mac dinh)
export class CatsService {
  private cats: Cat[] = [];

  // CANH BAO: Vi la singleton, state duoc chia se giua tat ca requests!
  // Dieu nay co the gay ra race condition trong concurrent requests
  addCat(cat: Cat) {
    this.cats.push(cat); // Tat ca requests deu thay cung danh sach cats
  }
}
```

### 5.3. REQUEST Scope

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  constructor(@Inject(REQUEST) private readonly request: Request) {
    // Moi request tao instance moi
    // Co the truy cap request object
    console.log(`New instance for: ${request.url}`);
  }

  getCurrentUser() {
    return this.request['user']; // Lay user tu request (sau khi qua auth middleware/guard)
  }

  getRequestId() {
    return this.request.headers['x-request-id'];
  }
}

// Khai bao trong module:
@Module({
  providers: [RequestScopedService],
})
export class UsersModule {}
```

**Luu y quan trong ve REQUEST scope:**

```typescript
// Khi mot provider co scope REQUEST, tat ca providers
// phu thuoc vao no CUNG se tro thanh REQUEST scope!

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}

@Injectable() // Se TU DONG tro thanh REQUEST scope
export class UsersService {
  constructor(
    private readonly auditService: AuditService, // AuditService la REQUEST scope
    // => UsersService cung se la REQUEST scope
  ) {}
}

// Dieu nay anh huong den PERFORMANCE vi moi request
// deu tao instance moi cho UsersService
```

### 5.4. TRANSIENT Scope

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private instanceId = Math.random().toString(36).substr(2, 9);

  constructor() {
    console.log(`TransientService created: ${this.instanceId}`);
  }

  getId() {
    return this.instanceId;
  }
}

// Moi consumer nhan instance rieng:
@Injectable()
export class ServiceA {
  constructor(private transientService: TransientService) {
    // transientService co instanceId = 'abc123'
  }
}

@Injectable()
export class ServiceB {
  constructor(private transientService: TransientService) {
    // transientService co instanceId = 'xyz789' (KHAC voi ServiceA)
  }
}
```

### 5.5. Khi nao dung scope nao?

```typescript
// DEFAULT (Singleton) - Mac dinh, nen dung cho hau het truong hop
// ✅ Stateless services
// ✅ Services ket noi database
// ✅ Services dung chung (Email, Logger, Cache)
@Injectable()
export class EmailService {} // Singleton - 1 instance

// REQUEST - Khi can truy cap request-specific data
// ✅ Audit logging (can biet ai goi)
// ✅ Multi-tenancy (moi request thuoc tenant khac)
// ✅ Request-scoped caching
// ⚠️ Anh huong performance
@Injectable({ scope: Scope.REQUEST })
export class TenantService {} // Moi request tao moi

// TRANSIENT - Khi moi consumer can instance rieng
// ✅ Stateful services (co internal state khac nhau cho moi consumer)
// ✅ Logger voi context rieng
@Injectable({ scope: Scope.TRANSIENT })
export class ContextLogger {} // Moi inject tao moi
```
