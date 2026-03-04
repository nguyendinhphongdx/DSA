# @Controller, route handling, decorators

## 1. Controller la gi?

**Controller** la thanh phan chiu trach nhiem **nhan HTTP requests** tu client va **tra ve HTTP responses**. Controller dong vai tro la "cua ngo" (gateway) cua ung dung, tiep nhan request, goi service xu ly logic, va tra ket qua.

```
Client ──HTTP Request──> Controller ──> Service ──> Database
                              │
Client <──HTTP Response──────┘
```

### Nguyen tac quan trong

- Controller **CHI** xu ly routing va request/response
- **KHONG** chua business logic (logic nghiep vu nam o Service)
- **KHONG** truy cap truc tiep database
- Moi controller thuong tuong ung voi mot resource (users, products, orders...)

```typescript
// SAI - Logic nam trong controller
@Controller('users')
export class UsersController {
  @Get()
  async findAll() {
    // KHONG NEN: Business logic trong controller
    const users = await this.userRepository.find();
    const activeUsers = users.filter(u => u.isActive);
    const result = activeUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
    return result;
  }
}

// DUNG - Controller chi routing, logic nam o service
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAllActive();
  }
}
```

---

## 2. @Controller() Decorator

### 2.1. Cu phap co ban

```typescript
import { Controller, Get } from '@nestjs/common';

// Route prefix: /cats
@Controller('cats')
export class CatsController {
  @Get()          // GET /cats
  findAll(): string {
    return 'This action returns all cats';
  }

  @Get('breeds')  // GET /cats/breeds
  findBreeds(): string {
    return 'This action returns cat breeds';
  }
}
```

### 2.2. Khong co prefix

```typescript
// Route prefix: / (root)
@Controller()
export class AppController {
  @Get()         // GET /
  getHello(): string {
    return 'Hello World!';
  }

  @Get('health') // GET /health
  healthCheck() {
    return { status: 'ok' };
  }
}
```

### 2.3. Nested route prefix

```typescript
// Route prefix: /api/v1/users
@Controller('api/v1/users')
export class UsersV1Controller {
  @Get()                // GET /api/v1/users
  findAll() {}

  @Get(':id')           // GET /api/v1/users/:id
  findOne() {}
}

// Tot hon: Dung global prefix + controller prefix
// main.ts: app.setGlobalPrefix('api/v1');
// Controller: @Controller('users')
// Ket qua tuong tu: /api/v1/users
```

### 2.4. Versioning

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI, // /v1/users, /v2/users
  });

  await app.listen(3000);
}

// users-v1.controller.ts
@Controller({
  path: 'users',
  version: '1', // GET /v1/users
})
export class UsersV1Controller {
  @Get()
  findAll() {
    return 'V1: All users';
  }
}

// users-v2.controller.ts
@Controller({
  path: 'users',
  version: '2', // GET /v2/users
})
export class UsersV2Controller {
  @Get()
  findAll() {
    return 'V2: All users with pagination';
  }
}
```

---

## 3. Route Handling (HTTP Methods)

### 3.1. Cac HTTP Method Decorators

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Options,
  Head,
  All,
} from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()          // GET /products - Lay danh sach
  findAll() {
    return 'Get all products';
  }

  @Get(':id')     // GET /products/:id - Lay chi tiet
  findOne() {
    return 'Get one product';
  }

  @Post()         // POST /products - Tao moi
  create() {
    return 'Create a product';
  }

  @Put(':id')     // PUT /products/:id - Cap nhat toan bo
  update() {
    return 'Update entire product';
  }

  @Patch(':id')   // PATCH /products/:id - Cap nhat mot phan
  partialUpdate() {
    return 'Partially update product';
  }

  @Delete(':id')  // DELETE /products/:id - Xoa
  remove() {
    return 'Delete a product';
  }

  @Options()      // OPTIONS /products - CORS preflight
  options() {
    return '';
  }

  @Head()         // HEAD /products - Giong GET nhung khong co body
  head() {
    return '';
  }

  @All('test')    // ALL /products/test - Bat tat ca HTTP methods
  handleAll() {
    return 'Handle any HTTP method';
  }
}
```

### 3.2. Route path patterns

```typescript
@Controller('products')
export class ProductsController {
  // Path tinh
  @Get('featured')           // GET /products/featured
  getFeatured() {}

  // Path voi parameter
  @Get(':id')                // GET /products/123
  getById() {}

  // Nhieu parameters
  @Get(':categoryId/:productId') // GET /products/electronics/456
  getByCategoryAndId() {}

  // Nested paths
  @Get(':id/reviews')        // GET /products/123/reviews
  getReviews() {}

  @Get(':id/reviews/:reviewId') // GET /products/123/reviews/789
  getReviewById() {}
}
```

### 3.3. Async handlers

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Cach 1: Tra ve Promise
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Cach 2: Tra ve Observable (RxJS)
  @Get('stream')
  findAllStream(): Observable<User[]> {
    return this.usersService.findAllAsObservable();
  }

  // Cach 3: Tra ve gia tri dong bo
  @Get('count')
  getCount(): number {
    return 42;
  }
}
```
