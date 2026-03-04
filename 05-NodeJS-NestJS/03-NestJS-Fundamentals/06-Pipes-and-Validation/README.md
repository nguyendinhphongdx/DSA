# Bai 6: Pipes va Validation trong NestJS

## Muc luc

- [1. Pipe la gi?](#1-pipe-la-gi)
  - [1.1. Khai niem](#11-khai-niem)
  - [1.2. Hai chuc nang chinh cua Pipe](#12-hai-chuc-nang-chinh-cua-pipe)
  - [1.3. Pipe execution order](#13-pipe-execution-order)
- [2. Built-in Pipes](#2-built-in-pipes)
  - [2.1. ParseIntPipe](#21-parseintpipe)
  - [2.2. ParseFloatPipe](#22-parsefloatpipe)
  - [2.3. ParseBoolPipe](#23-parseboolpipe)
  - [2.4. ParseUUIDPipe](#24-parseuuidpipe)
  - [2.5. ParseArrayPipe](#25-parsearraypipe)
  - [2.6. ParseEnumPipe](#26-parseenumpipe)
  - [2.7. DefaultValuePipe](#27-defaultvaluepipe)
  - [2.8. Ket hop nhieu Pipes](#28-ket-hop-nhieu-pipes)
- [3. ValidationPipe Setup](#3-validationpipe-setup)
  - [3.1. Cai dat thu vien](#31-cai-dat-thu-vien)
  - [3.2. Cau hinh ValidationPipe](#32-cau-hinh-validationpipe)
  - [3.3. Tao DTO voi class-validator](#33-tao-dto-voi-class-validator)
- [4. class-validator Decorators Chi Tiet](#4-class-validator-decorators-chi-tiet)
  - [4.1. Type Validation](#41-type-validation)
  - [4.2. String Validation](#42-string-validation)
  - [4.3. Number Validation](#43-number-validation)
  - [4.4. Array Validation](#44-array-validation)
  - [4.5. Object/Nested Validation](#45-objectnested-validation)
  - [4.6. Date Validation](#46-date-validation)
  - [4.7. Conditional Validation](#47-conditional-validation)
- [5. ValidationPipe Options Chi Tiet](#5-validationpipe-options-chi-tiet)
  - [5.1. whitelist](#51-whitelist)
  - [5.2. forbidNonWhitelisted](#52-forbidnonwhitelisted)
  - [5.3. transform](#53-transform)
  - [5.4. transformOptions](#54-transformoptions)
  - [5.5. Tat ca options](#55-tat-ca-options)
- [6. Custom Pipes](#6-custom-pipes)
  - [6.1. PipeTransform Interface](#61-pipetransform-interface)
  - [6.2. Validation Pipe tu lam](#62-validation-pipe-tu-lam)
  - [6.3. Transformation Pipe](#63-transformation-pipe)
  - [6.4. Async Pipe](#64-async-pipe)
- [7. Pipe Binding Levels](#7-pipe-binding-levels)
  - [7.1. Parameter-level](#71-parameter-level)
  - [7.2. Method-level](#72-method-level)
  - [7.3. Controller-level](#73-controller-level)
  - [7.4. Global-level](#74-global-level)
- [8. Validation Groups](#8-validation-groups)
- [9. Custom Validation Decorators](#9-custom-validation-decorators)
  - [9.1. registerDecorator](#91-registerdecorator)
  - [9.2. ValidatorConstraint](#92-validatorconstraint)
  - [9.3. Async Custom Validator](#93-async-custom-validator)
- [10. Mapped Types](#10-mapped-types)
  - [10.1. PartialType](#101-partialtype)
  - [10.2. PickType](#102-picktype)
  - [10.3. OmitType](#103-omittype)
  - [10.4. IntersectionType](#104-intersectiontype)
  - [10.5. Ket hop Mapped Types](#105-ket-hop-mapped-types)
- [11. Loi Thuong Gap](#11-loi-thuong-gap)
- [12. Best Practices](#12-best-practices)
- [13. Vi du Thuc Te Hoan Chinh](#13-vi-du-thuc-te-hoan-chinh)
- [14. Bai Tap](#14-bai-tap)

---

## 1. Pipe la gi?

### 1.1. Khai niem

**Pipe** trong NestJS la mot class duoc danh dau voi `@Injectable()` decorator va implement interface `PipeTransform`. Pipe hoat dong o giua giai doan **nhan request** va **xu ly boi route handler**.

```
    LUONG XU LY REQUEST TRONG NestJS
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │  Client Request                                         │
    │       │                                                 │
    │       ▼                                                 │
    │  ┌─────────┐                                            │
    │  │ Guards   │  Kiem tra quyen truy cap                   │
    │  └────┬────┘                                            │
    │       ▼                                                 │
    │  ┌──────────────┐                                       │
    │  │ Interceptors │  Xu ly truoc (before)                 │
    │  └──────┬───────┘                                       │
    │         ▼                                               │
    │  ┌───────────┐                                          │
    │  │  PIPES    │  ◄── VALIDATE & TRANSFORM data           │
    │  └─────┬─────┘                                          │
    │        ▼                                                │
    │  ┌──────────────┐                                       │
    │  │ Route Handler │  Xu ly business logic                │
    │  └──────┬───────┘                                       │
    │         ▼                                               │
    │  ┌──────────────┐                                       │
    │  │ Interceptors │  Xu ly sau (after)                    │
    │  └──────┬───────┘                                       │
    │         ▼                                               │
    │  ┌──────────────────┐                                   │
    │  │ Exception Filters │  Xu ly loi (neu co)              │
    │  └──────────────────┘                                   │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

### 1.2. Hai chuc nang chinh cua Pipe

```
    PIPE CO 2 CHUC NANG CHINH
    ┌───────────────────────────────────────────────────┐
    │                                                   │
    │  1. TRANSFORMATION (Chuyen doi du lieu)           │
    │     Input data → Transform → Output data          │
    │                                                   │
    │     Vi du: String "123" → ParseIntPipe → Number 123│
    │            String "true" → ParseBoolPipe → true   │
    │            Plain object → class instance          │
    │                                                   │
    │  2. VALIDATION (Xac thuc du lieu)                 │
    │     Input data → Validate → Pass/Throw Error      │
    │                                                   │
    │     Vi du: email: "abc" → @IsEmail → Throw Error  │
    │            age: 150 → @Max(120) → Throw Error     │
    │            name: "" → @IsNotEmpty → Throw Error   │
    │                                                   │
    └───────────────────────────────────────────────────┘
```

### 1.3. Pipe execution order

```typescript
// Pipes chay TRUOC route handler
// Neu pipe throw exception, route handler SE KHONG DUOC GOI

@Controller('users')
export class UserController {
  @Post()
  create(
    @Body(new ValidationPipe()) body: CreateUserDto, // Pipe chay truoc
  ) {
    // Method nay CHI chay khi pipe KHONG throw error
    return this.userService.create(body);
  }
}

// Thu tu chay khi co nhieu pipes:
@Get(':id')
findOne(
  @Param('id', ParseIntPipe, CustomPipe) id: number,
  // 1. ParseIntPipe chay truoc: "123" → 123
  // 2. CustomPipe chay sau: 123 → processed value
) {
  return this.userService.findOne(id);
}
```

---

## 2. Built-in Pipes

NestJS cung cap 8 built-in pipes:

```
    BUILT-IN PIPES
    ┌────────────────────┬──────────────────────────────────┐
    │ Pipe               │ Chuc nang                        │
    ├────────────────────┼──────────────────────────────────┤
    │ ParseIntPipe       │ String → Integer                 │
    │ ParseFloatPipe     │ String → Float                   │
    │ ParseBoolPipe      │ String → Boolean                 │
    │ ParseUUIDPipe      │ Validate UUID format             │
    │ ParseArrayPipe     │ String → Array                   │
    │ ParseEnumPipe      │ Validate enum value              │
    │ DefaultValuePipe   │ Set gia tri mac dinh             │
    │ ValidationPipe     │ Validate DTO voi class-validator │
    └────────────────────┴──────────────────────────────────┘
```

### 2.1. ParseIntPipe

Chuyen doi string thanh integer. Throw `BadRequestException` neu khong phai so.

```typescript
import { Controller, Get, Param, Query, ParseIntPipe, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UserController {
  // === Su dung co ban ===
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // GET /users/123 → id = 123 (number)
    // GET /users/abc → 400 Bad Request: "Validation failed (numeric string is expected)"
    console.log(typeof id); // 'number'
    return this.userService.findOne(id);
  }

  // === Custom error status ===
  @Get(':id/details')
  findOneDetails(
    @Param('id', new ParseIntPipe({
      errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE, // 406 thay vi 400
    }))
    id: number,
  ) {
    return this.userService.findOneDetails(id);
  }

  // === Custom error message ===
  @Get(':id/profile')
  findProfile(
    @Param('id', new ParseIntPipe({
      exceptionFactory: (error) => {
        throw new BadRequestException(`ID phai la mot so nguyen hop le. Nhan duoc: "${error}"`);
      },
    }))
    id: number,
  ) {
    return this.userService.findProfile(id);
  }

  // === Voi Query params ===
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    // GET /users?page=1&limit=10
    return this.userService.findAll(page, limit);
  }

  // === Optional query param voi DefaultValuePipe ===
  @Get('search')
  search(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // GET /users/search → page=1, limit=10 (default)
    // GET /users/search?page=2&limit=20 → page=2, limit=20
    return this.userService.search(page, limit);
  }
}
```

### 2.2. ParseFloatPipe

Chuyen doi string thanh floating-point number.

```typescript
import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';

@Controller('products')
export class ProductController {
  @Get('filter')
  filterByPrice(
    @Query('minPrice', ParseFloatPipe) minPrice: number,
    @Query('maxPrice', ParseFloatPipe) maxPrice: number,
  ) {
    // GET /products/filter?minPrice=9.99&maxPrice=99.99
    // minPrice = 9.99 (number), maxPrice = 99.99 (number)
    console.log(typeof minPrice); // 'number'
    return this.productService.filterByPrice(minPrice, maxPrice);
  }

  @Get('calculate')
  calculateDiscount(
    @Query('price', ParseFloatPipe) price: number,
    @Query('discount', new ParseFloatPipe({ optional: true })) discount?: number,
  ) {
    // GET /products/calculate?price=100.50&discount=0.15
    const finalPrice = price * (1 - (discount ?? 0));
    return { originalPrice: price, discount, finalPrice };
  }
}
```

### 2.3. ParseBoolPipe

Chuyen doi string thanh boolean. Chap nhan: 'true'/'false', '1'/'0'.

```typescript
import { Controller, Get, Query, ParseBoolPipe } from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  @Get()
  findAll(
    @Query('published', ParseBoolPipe) published: boolean,
  ) {
    // GET /articles?published=true → published = true (boolean)
    // GET /articles?published=false → published = false (boolean)
    // GET /articles?published=1 → published = true
    // GET /articles?published=abc → 400 Bad Request
    console.log(typeof published); // 'boolean'
    return this.articleService.findAll({ published });
  }

  @Get('filter')
  filter(
    @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean,
    @Query('featured', new DefaultValuePipe(false), ParseBoolPipe) featured: boolean,
  ) {
    return this.articleService.filter({ active, featured });
  }
}
```

### 2.4. ParseUUIDPipe

Validate dinh dang UUID (Universally Unique Identifier).

```typescript
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

@Controller('orders')
export class OrderController {
  // === UUID v4 (mac dinh) ===
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    // GET /orders/550e8400-e29b-41d4-a716-446655440000 → OK
    // GET /orders/not-a-uuid → 400 Bad Request
    return this.orderService.findOne(id);
  }

  // === Chi dinh version ===
  @Get('v3/:id')
  findOneV3(
    @Param('id', new ParseUUIDPipe({ version: '3' })) id: string,
  ) {
    return this.orderService.findOne(id);
  }

  @Get('v4/:id')
  findOneV4(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.orderService.findOne(id);
  }

  // === Custom error ===
  @Get('detail/:id')
  findDetail(
    @Param('id', new ParseUUIDPipe({
      exceptionFactory: () => {
        throw new BadRequestException('ID don hang phai co dinh dang UUID hop le');
      },
    }))
    id: string,
  ) {
    return this.orderService.findDetail(id);
  }
}
```

### 2.5. ParseArrayPipe

Parse string thanh array, co the ket hop voi validation.

```typescript
import { Controller, Get, Query, Body, Post, ParseArrayPipe } from '@nestjs/common';

@Controller('tags')
export class TagController {
  // === Parse query string thanh array ===
  @Get('filter')
  filterByTags(
    @Query('tags', new ParseArrayPipe({
      items: String,       // Kieu cua cac items
      separator: ',',      // Ky tu phan cach
    }))
    tags: string[],
  ) {
    // GET /tags/filter?tags=nestjs,typescript,nodejs
    // tags = ['nestjs', 'typescript', 'nodejs']
    return this.tagService.filterByTags(tags);
  }

  // === Parse array cua numbers ===
  @Get('products')
  findProducts(
    @Query('ids', new ParseArrayPipe({
      items: Number,
      separator: ',',
    }))
    ids: number[],
  ) {
    // GET /tags/products?ids=1,2,3,4,5
    // ids = [1, 2, 3, 4, 5]
    return this.productService.findByIds(ids);
  }

  // === Validate array trong body ===
  @Post('bulk')
  createBulk(
    @Body(new ParseArrayPipe({
      items: CreateTagDto,    // Validate moi item la CreateTagDto
      whitelist: true,
      forbidNonWhitelisted: true,
    }))
    tags: CreateTagDto[],
  ) {
    // POST /tags/bulk
    // Body: [{ "name": "nestjs" }, { "name": "typescript" }]
    return this.tagService.createBulk(tags);
  }

  // === Optional array ===
  @Get('search')
  search(
    @Query('categories', new ParseArrayPipe({
      items: String,
      separator: ',',
      optional: true,
    }))
    categories?: string[],
  ) {
    return this.tagService.search(categories);
  }
}
```

### 2.6. ParseEnumPipe

Validate gia tri thuoc ve mot enum cu the.

```typescript
import { Controller, Get, Param, Query, ParseEnumPipe } from '@nestjs/common';

// Dinh nghia enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

@Controller()
export class AppController {
  // === Validate role ===
  @Get('users/role/:role')
  findByRole(
    @Param('role', new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    // GET /users/role/admin → OK
    // GET /users/role/superadmin → 400 Bad Request
    return this.userService.findByRole(role);
  }

  // === Validate order status ===
  @Get('orders/status/:status')
  findByStatus(
    @Param('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
  ) {
    // GET /orders/status/pending → OK
    // GET /orders/status/unknown → 400 Bad Request
    return this.orderService.findByStatus(status);
  }

  // === Ket hop voi query ===
  @Get('products')
  findProducts(
    @Query('sort', new DefaultValuePipe(SortDirection.ASC), new ParseEnumPipe(SortDirection))
    sort: SortDirection,
  ) {
    return this.productService.findAll(sort);
  }

  // === Custom error message ===
  @Get('filter/:status')
  filter(
    @Param('status', new ParseEnumPipe(OrderStatus, {
      exceptionFactory: (value) => {
        const validValues = Object.values(OrderStatus).join(', ');
        throw new BadRequestException(
          `"${value}" khong phai trang thai hop le. Cac gia tri hop le: ${validValues}`,
        );
      },
    }))
    status: OrderStatus,
  ) {
    return this.orderService.filter(status);
  }
}
```

### 2.7. DefaultValuePipe

Cung cap gia tri mac dinh khi parameter la `undefined` hoac `null`.

```typescript
import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';

@Controller('products')
export class ProductController {
  @Get()
  findAll(
    // Gia tri mac dinh cho pagination
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(20), ParseIntPipe)
    limit: number,

    // Gia tri mac dinh cho sorting
    @Query('sortBy', new DefaultValuePipe('createdAt'))
    sortBy: string,

    @Query('sortOrder', new DefaultValuePipe('DESC'))
    sortOrder: string,

    // Gia tri mac dinh cho filtering
    @Query('active', new DefaultValuePipe(true), ParseBoolPipe)
    active: boolean,

    // Optional search
    @Query('search', new DefaultValuePipe(''))
    search: string,
  ) {
    // GET /products → page=1, limit=20, sortBy='createdAt', sortOrder='DESC', active=true
    // GET /products?page=2&limit=50&sortBy=price → page=2, limit=50, sortBy='price'
    return this.productService.findAll({
      page,
      limit,
      sortBy,
      sortOrder,
      active,
      search,
    });
  }
}
```

### 2.8. Ket hop nhieu Pipes

```typescript
@Controller('api')
export class ApiController {
  @Get('data')
  getData(
    // Chain nhieu pipes: DefaultValue → ParseInt
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('active', new DefaultValuePipe('true'), ParseBoolPipe)
    active: boolean,

    @Query('category', new DefaultValuePipe('all'))
    category: string,
  ) {
    return { page, limit, active, category };
  }

  // Pipe chay tuan tu trai → phai
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe, PositiveNumberPipe) // ParseInt truoc, roi kiem tra > 0
    id: number,
  ) {
    return this.service.findOne(id);
  }
}
```

---

## 3. ValidationPipe Setup

### 3.1. Cai dat thu vien

```bash
# Cai dat class-validator va class-transformer
npm install class-validator class-transformer
```

`class-validator` cung cap cac decorators de validate properties. `class-transformer` chuyen doi plain objects thanh class instances.

### 3.2. Cau hinh ValidationPipe

```typescript
// === main.ts: Cau hinh global ValidationPipe ===
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      // Loai bo cac properties khong co trong DTO
      whitelist: true,

      // Throw error neu co properties khong cho phep
      forbidNonWhitelisted: true,

      // Tu dong chuyen doi types (string → number, plain object → class instance)
      transform: true,

      // Options cho class-transformer
      transformOptions: {
        enableImplicitConversion: true, // Tu dong chuyen kieu
      },

      // Tra ve tat ca loi (khong dung sau loi dau tien)
      stopAtFirstError: false,

      // Custom error messages
      validationError: {
        target: false,  // Khong tra ve target object trong error
        value: false,   // Khong tra ve gia tri sai trong error
      },

      // Custom exception factory
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = Object.values(error.constraints || {});
          return {
            field: error.property,
            errors: constraints,
          };
        });
        return new BadRequestException({
          statusCode: 400,
          message: 'Du lieu khong hop le',
          errors: messages,
        });
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

### 3.3. Tao DTO voi class-validator

```typescript
// dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateUserDto {
  @IsString({ message: 'Ho ten phai la chuoi ky tu' })
  @IsNotEmpty({ message: 'Ho ten khong duoc de trong' })
  @MinLength(2, { message: 'Ho ten phai co it nhat 2 ky tu' })
  @MaxLength(100, { message: 'Ho ten khong duoc qua 100 ky tu' })
  name: string;

  @IsEmail({}, { message: 'Email khong hop le' })
  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mat khau phai co it nhat 8 ky tu' })
  @MaxLength(50, { message: 'Mat khau khong duoc qua 50 ky tu' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: 'Mat khau phai chua it nhat 1 chu hoa, 1 chu thuong, 1 so va 1 ky tu dac biet' },
  )
  password: string;

  @IsOptional()
  @IsInt({ message: 'Tuoi phai la so nguyen' })
  @Min(1, { message: 'Tuoi phai lon hon 0' })
  @Max(150, { message: 'Tuoi khong hop le' })
  age?: number;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gioi tinh phai la male, female hoac other' })
  gender?: Gender;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'So dien thoai Viet Nam khong hop le' })
  phone?: string;
}

// Su dung trong controller
@Controller('users')
export class UserController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // Neu validation fail, tu dong tra ve 400 Bad Request
    // Neu validation pass, createUserDto la instance cua CreateUserDto
    return this.userService.create(createUserDto);
  }
}
```

---

## 4. class-validator Decorators Chi Tiet

### 4.1. Type Validation

```typescript
import {
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsDate,
  IsArray,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class TypeExampleDto {
  // === STRING ===
  @IsString({ message: 'title phai la string' })
  title: string;

  // === NUMBER (bao gom ca integer va float) ===
  @IsNumber(
    { maxDecimalPlaces: 2 },  // Toi da 2 chu so thap phan
    { message: 'price phai la so voi toi da 2 chu so thap phan' },
  )
  price: number;

  // === INTEGER (chi so nguyen) ===
  @IsInt({ message: 'quantity phai la so nguyen' })
  quantity: number;

  // === BOOLEAN ===
  @IsBoolean({ message: 'active phai la true hoac false' })
  active: boolean;

  // === DATE ===
  @IsDate({ message: 'createdAt phai la Date object' })
  @Type(() => Date)  // Can class-transformer de chuyen string → Date
  createdAt: Date;

  // === ARRAY ===
  @IsArray({ message: 'tags phai la mang' })
  tags: string[];

  // === OBJECT ===
  @IsObject({ message: 'metadata phai la object' })
  metadata: Record<string, any>;

  // === ENUM ===
  @IsEnum(Priority, {
    message: `priority phai la mot trong: ${Object.values(Priority).join(', ')}`,
  })
  priority: Priority;
}
```

### 4.2. String Validation

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmpty,
  MinLength,
  MaxLength,
  Length,
  Matches,
  IsEmail,
  IsUrl,
  IsUUID,
  IsDateString,
  IsISO8601,
  IsMobilePhone,
  IsPhoneNumber,
  IsIP,
  IsCreditCard,
  IsHexColor,
  IsAlpha,
  IsAlphanumeric,
  IsAscii,
  Contains,
  NotContains,
  IsUppercase,
  IsLowercase,
  IsJSON,
  IsJWT,
  IsMACAddress,
  IsMongoId,
  IsPostalCode,
  IsMilitaryTime,
} from 'class-validator';

export class StringValidationDto {
  // === Kiem tra khong rong ===
  @IsNotEmpty({ message: 'Ten khong duoc de trong (khong duoc la "", null, undefined)' })
  @IsString()
  name: string;

  // === Do dai ===
  @MinLength(2, { message: 'Username phai co it nhat 2 ky tu' })
  @MaxLength(30, { message: 'Username khong duoc qua 30 ky tu' })
  username: string;

  @Length(6, 20, { message: 'Password phai tu 6 den 20 ky tu' })
  password: string;

  // === Email ===
  @IsEmail(
    { allow_display_name: false, allow_utf8_local_part: true },
    { message: 'Email khong dung dinh dang' },
  )
  email: string;

  // === URL ===
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Website phai la URL hop le (bat dau bang http:// hoac https://)' },
  )
  website: string;

  // === UUID ===
  @IsUUID('4', { message: 'ID phai la UUID version 4' })
  id: string;

  // === Date String ===
  @IsDateString({}, { message: 'Ngay phai co dinh dang ISO 8601 (YYYY-MM-DD)' })
  birthDate: string;

  // === ISO 8601 (day du hon IsDateString) ===
  @IsISO8601({ strict: true }, { message: 'Thoi gian phai co dinh dang ISO 8601' })
  eventTime: string;

  // === So dien thoai ===
  @IsPhoneNumber('VN', { message: 'So dien thoai Viet Nam khong hop le' })
  phone: string;

  // === Regex Pattern ===
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'Slug chi duoc chua chu thuong, so, gach ngang va gach duoi',
  })
  slug: string;

  // === Alphanumeric ===
  @IsAlphanumeric('en-US', { message: 'Code chi duoc chua chu cai va so' })
  code: string;

  // === Contains / NotContains ===
  @Contains('hello', { message: 'Greeting phai chua tu "hello"' })
  greeting: string;

  @NotContains('admin', { message: 'Bio khong duoc chua tu "admin"' })
  bio: string;

  // === IP Address ===
  @IsIP('4', { message: 'Server IP phai la IPv4 hop le' })
  serverIp: string;

  // === Credit Card ===
  @IsCreditCard({ message: 'So the tin dung khong hop le' })
  cardNumber: string;

  // === Hex Color ===
  @IsHexColor({ message: 'Mau phai la ma hex hop le (#FF0000)' })
  favoriteColor: string;

  // === JSON string ===
  @IsJSON({ message: 'Config phai la JSON string hop le' })
  configJson: string;

  // === MongoDB ObjectId ===
  @IsMongoId({ message: 'Document ID phai la MongoDB ObjectId hop le' })
  documentId: string;
}
```

### 4.3. Number Validation

```typescript
import {
  IsNumber,
  IsInt,
  IsPositive,
  IsNegative,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
  IsDivisibleBy,
} from 'class-validator';

export class NumberValidationDto {
  // === Khoang gia tri ===
  @IsInt({ message: 'Tuoi phai la so nguyen' })
  @Min(0, { message: 'Tuoi phai lon hon hoac bang 0' })
  @Max(150, { message: 'Tuoi phai nho hon hoac bang 150' })
  age: number;

  // === So duong ===
  @IsPositive({ message: 'Gia phai la so duong' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Gia phai co toi da 2 so thap phan' })
  price: number;

  // === So am ===
  @IsNegative({ message: 'Giam gia phai la so am' })
  discount: number;

  // === Toa do ===
  @IsLatitude({ message: 'Vi do khong hop le (-90 den 90)' })
  latitude: number;

  @IsLongitude({ message: 'Kinh do khong hop le (-180 den 180)' })
  longitude: number;

  // === Chia het ===
  @IsDivisibleBy(5, { message: 'So luong phai chia het cho 5' })
  quantity: number;

  // === Ket hop nhieu dieu kien ===
  @IsNumber()
  @Min(0.01, { message: 'So tien toi thieu la 0.01' })
  @Max(1000000, { message: 'So tien toi da la 1,000,000' })
  amount: number;
}
```

### 4.4. Array Validation

```typescript
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayContains,
  ArrayNotContains,
  ArrayUnique,
  IsString,
  IsInt,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO cho nested object
export class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class ArrayValidationDto {
  // === Mang khong rong ===
  @IsArray({ message: 'tags phai la mang' })
  @ArrayNotEmpty({ message: 'tags khong duoc rong' })
  @IsString({ each: true, message: 'Moi tag phai la string' }) // each: true validate tung phan tu
  tags: string[];

  // === Kich thuoc mang ===
  @IsArray()
  @ArrayMinSize(1, { message: 'Phai co it nhat 1 nguoi nhan' })
  @ArrayMaxSize(50, { message: 'Toi da 50 nguoi nhan' })
  @IsEmail({}, { each: true, message: 'Moi email trong danh sach phai hop le' })
  recipients: string[];

  // === Mang co gia tri bat buoc ===
  @ArrayContains(['read'], { message: 'Quyen phai bao gom "read"' })
  permissions: string[];

  // === Mang khong chua gia tri ===
  @ArrayNotContains(['admin'], { message: 'Khong duoc co quyen "admin"' })
  userPermissions: string[];

  // === Mang phai unique ===
  @IsArray()
  @ArrayUnique({ message: 'Cac category khong duoc trung nhau' })
  @IsString({ each: true })
  categories: string[];

  // === Mang so nguyen ===
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true, message: 'Moi ID phai la so nguyen' })
  productIds: number[];

  // === Mang nested objects ===
  @IsArray()
  @ArrayMinSize(1, { message: 'Don hang phai co it nhat 1 san pham' })
  @ValidateNested({ each: true }) // Validate tung object trong mang
  @Type(() => OrderItemDto)       // class-transformer: chuyen plain → OrderItemDto
  items: OrderItemDto[];
}
```

### 4.5. Object/Nested Validation

```typescript
import {
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

// Nested DTO: Dia chi
export class AddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Duong khong duoc de trong' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'Thanh pho khong duoc de trong' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Tinh/Thanh khong duoc de trong' })
  province: string;

  @IsString()
  @IsNotEmpty({ message: 'Ma buu chinh khong duoc de trong' })
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}

// Nested DTO: Thong tin cong ty
export class CompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

// DTO chinh: Tao user voi nested objects
export class CreateUserWithAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  // === Nested object (bat buoc) ===
  @ValidateNested()
  @Type(() => AddressDto) // BAT BUOC: class-transformer can biet kieu
  @IsNotEmpty({ message: 'Dia chi khong duoc de trong' })
  address: AddressDto;

  // === Nested object (khong bat buoc) ===
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  // === Nested object co dieu kien ===
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDto)
  company?: CompanyDto;

  // === Nhieu nested objects ===
  @IsOptional()
  @ValidateNested({ each: true }) // each: true cho array
  @Type(() => AddressDto)
  alternateAddresses?: AddressDto[];
}

// Controller
@Controller('users')
export class UserController {
  @Post()
  create(@Body() dto: CreateUserWithAddressDto) {
    // Request body:
    // {
    //   "name": "Nguyen Van A",
    //   "email": "a@example.com",
    //   "address": {
    //     "street": "123 Le Loi",
    //     "city": "Ho Chi Minh",
    //     "province": "Ho Chi Minh",
    //     "postalCode": "70000"
    //   },
    //   "company": {
    //     "name": "TechCorp",
    //     "address": {
    //       "street": "456 Nguyen Hue",
    //       "city": "Ho Chi Minh",
    //       "province": "Ho Chi Minh",
    //       "postalCode": "70000"
    //     }
    //   }
    // }
    return this.userService.create(dto);
  }
}
```

### 4.6. Date Validation

```typescript
import {
  IsDate,
  IsDateString,
  IsISO8601,
  MinDate,
  MaxDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // === Date object (can @Type de transform) ===
  @IsDate({ message: 'startDate phai la ngay hop le' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'startDate phai la ngay trong tuong lai' })
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  // === ISO 8601 string ===
  @IsISO8601({ strict: true }, { message: 'deadline phai la ISO 8601 string' })
  deadline: string;
  // Hop le: "2024-12-31", "2024-12-31T23:59:59Z", "2024-12-31T23:59:59+07:00"

  // === Date string (nen dung ISO) ===
  @IsDateString({}, { message: 'birthDate phai la date string' })
  birthDate: string;
  // Hop le: "2000-01-15", "2000-01-15T00:00:00.000Z"
}
```

### 4.7. Conditional Validation

```typescript
import {
  ValidateIf,
  IsOptional,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  BOTH = 'both',
}

export class ContactDto {
  @IsEnum(ContactMethod)
  contactMethod: ContactMethod;

  // Chi validate email NEU contactMethod la EMAIL hoac BOTH
  @ValidateIf(o => o.contactMethod === ContactMethod.EMAIL || o.contactMethod === ContactMethod.BOTH)
  @IsEmail({}, { message: 'Email khong hop le' })
  @IsNotEmpty({ message: 'Email bat buoc khi chon lien he qua email' })
  email?: string;

  // Chi validate phone NEU contactMethod la PHONE hoac BOTH
  @ValidateIf(o => o.contactMethod === ContactMethod.PHONE || o.contactMethod === ContactMethod.BOTH)
  @IsPhoneNumber('VN', { message: 'So dien thoai khong hop le' })
  @IsNotEmpty({ message: 'SDT bat buoc khi chon lien he qua dien thoai' })
  phone?: string;
}

// Vi du khac: Validate dua tren role
export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(['personal', 'business'])
  accountType: string;

  // Chi yeu cau companyName khi accountType la 'business'
  @ValidateIf(o => o.accountType === 'business')
  @IsString()
  @IsNotEmpty({ message: 'Ten cong ty bat buoc voi tai khoan doanh nghiep' })
  companyName?: string;

  // Chi yeu cau taxId khi accountType la 'business'
  @ValidateIf(o => o.accountType === 'business')
  @IsString()
  @IsNotEmpty({ message: 'Ma so thue bat buoc voi tai khoan doanh nghiep' })
  taxId?: string;

  // @IsDefined: khac voi @IsNotEmpty, IsDefined chi kiem tra !== undefined
  @IsDefined({ message: 'Terms phai duoc xac nhan (true hoac false)' })
  acceptTerms: boolean;
}
```

---

## 5. ValidationPipe Options Chi Tiet

### 5.1. whitelist

Loai bo cac properties khong co trong DTO (khong co decorator nao).

```typescript
// DTO chi co 2 properties
export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;
}

// Khong co whitelist:
// POST /cats body: { "name": "Tom", "age": 3, "isAdmin": true, "role": "superadmin" }
// => createCatDto = { name: "Tom", age: 3, isAdmin: true, role: "superadmin" }
// isAdmin va role KHONG BI LOAI BO => NGUY HIEM!

// Co whitelist:
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
// POST /cats body: { "name": "Tom", "age": 3, "isAdmin": true, "role": "superadmin" }
// => createCatDto = { name: "Tom", age: 3 }
// isAdmin va role BI LOAI BO => AN TOAN!
```

### 5.2. forbidNonWhitelisted

Throw error khi co properties khong cho phep (phai dung cung whitelist).

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
}));

// POST /cats body: { "name": "Tom", "age": 3, "isAdmin": true }
// => 400 Bad Request:
// {
//   "statusCode": 400,
//   "message": ["property isAdmin should not exist"],
//   "error": "Bad Request"
// }
```

### 5.3. transform

Tu dong chuyen doi types va plain objects thanh class instances.

```typescript
app.useGlobalPipes(new ValidationPipe({ transform: true }));

// KHONG CO transform:
@Get(':id')
findOne(@Param('id') id: string) {
  console.log(typeof id); // 'string' - KHONG tu dong chuyen
}

// CO transform:
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id); // 'number' - TU DONG chuyen doi!
}

// Voi DTO:
// KHONG CO transform: body la plain object { name: "Tom" }
// CO transform: body la instance cua CreateCatDto
@Post()
create(@Body() dto: CreateCatDto) {
  console.log(dto instanceof CreateCatDto); // true (khi co transform)
  // Co the goi methods cua DTO
}
```

### 5.4. transformOptions

Cau hinh cho class-transformer.

```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  transformOptions: {
    // Tu dong chuyen kieu dua tren TypeScript type
    enableImplicitConversion: true,

    // Chi expose cac properties co @Expose() decorator
    excludeExtraneousValues: false,

    // Chuyen doi groups
    groups: ['admin'],
  },
}));

// Voi enableImplicitConversion: true
export class QueryDto {
  // String "10" tu dong chuyen thanh number 10
  page: number;

  // String "true" tu dong chuyen thanh boolean true
  active: boolean;

  // String "2024-01-01" tu dong chuyen thanh Date
  date: Date;
}

@Get()
findAll(@Query() query: QueryDto) {
  console.log(typeof query.page);   // 'number'
  console.log(typeof query.active); // 'boolean'
  console.log(query.date instanceof Date); // true
}
```

### 5.5. Tat ca options

```typescript
new ValidationPipe({
  // === WHITELIST ===
  whitelist: true,                    // Loai bo properties khong khai bao
  forbidNonWhitelisted: true,         // Throw error khi co extra properties
  forbidUnknownValues: true,          // Throw error khi validate unknown objects

  // === TRANSFORM ===
  transform: true,                    // Tu dong chuyen kieu
  transformOptions: {
    enableImplicitConversion: true,   // Implicit type conversion
    excludeExtraneousValues: false,   // Chi giu properties co @Expose()
    exposeDefaultValues: true,        // Expose default values
    exposeUnsetFields: false,         // Khong expose undefined fields
  },

  // === VALIDATION ===
  skipMissingProperties: false,       // Khong bo qua properties thieu
  skipNullProperties: false,          // Khong bo qua properties null
  skipUndefinedProperties: false,     // Khong bo qua properties undefined
  stopAtFirstError: false,            // Tra ve tat ca loi
  enableDebugMessages: false,         // Debug messages (dev only)

  // === ERROR HANDLING ===
  disableErrorMessages: false,        // Tat error messages (production)
  dismissDefaultMessages: false,      // Khong hien thi default messages
  validationError: {
    target: false,                    // Khong tra ve object goc trong error
    value: false,                     // Khong tra ve gia tri loi
  },

  // === ERROR STATUS ===
  errorHttpStatusCode: 400,           // HTTP status code cho validation errors

  // === CUSTOM EXCEPTION ===
  exceptionFactory: (errors) => {
    return new UnprocessableEntityException(errors);
  },

  // === VALIDATION GROUPS ===
  groups: [],                         // Validation groups
  always: false,                      // Luon validate (ke ca khong co groups)

  // === EXPECTED TYPE ===
  expectedType: undefined,            // Expected DTO type
})
```

---

## 6. Custom Pipes

### 6.1. PipeTransform Interface

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

// PipeTransform interface:
// interface PipeTransform<T = any, R = any> {
//   transform(value: T, metadata: ArgumentMetadata): R;
// }

// ArgumentMetadata:
// interface ArgumentMetadata {
//   type: 'body' | 'query' | 'param' | 'custom';
//   metatype?: Type<any>;  // DTO class
//   data?: string;         // Property name (vd: 'id' trong @Param('id'))
// }

// === PIPE DON GIAN: Trim whitespace ===
@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim();
  }
}

// Su dung:
@Post()
create(@Body('name', TrimPipe) name: string) {
  // "  Nguyen Van A  " → "Nguyen Van A"
}

// === PIPE: Validate positive number ===
@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new BadRequestException(`"${value}" khong phai la so hop le`);
    }
    if (num <= 0) {
      throw new BadRequestException(`"${value}" phai la so duong`);
    }
    return num;
  }
}

@Get(':id')
findOne(@Param('id', PositiveIntPipe) id: number) {
  // "5" → 5 (OK)
  // "0" → Error: "0" phai la so duong
  // "-1" → Error: "-1" phai la so duong
  // "abc" → Error: "abc" khong phai la so hop le
}
```

### 6.2. Validation Pipe tu lam

```typescript
// === Custom Validation Pipe voi Joi ===
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,    // Tra ve tat ca loi
      allowUnknown: false,  // Khong cho phep properties la
      stripUnknown: true,   // Loai bo properties la
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return validatedValue;
  }
}

// Dinh nghia schema
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Ten phai co it nhat 2 ky tu',
      'string.max': 'Ten khong duoc qua 100 ky tu',
      'any.required': 'Ten la bat buoc',
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email khong hop le',
      'any.required': 'Email la bat buoc',
    }),
  age: Joi.number().integer().min(1).max(150).optional()
    .messages({
      'number.min': 'Tuoi phai lon hon 0',
      'number.max': 'Tuoi khong duoc qua 150',
    }),
});

// Su dung
@Post()
@UsePipes(new JoiValidationPipe(createUserSchema))
create(@Body() body: any) {
  return this.userService.create(body);
}
```

### 6.3. Transformation Pipe

```typescript
// === Pipe chuyen doi slug ===
@Injectable()
export class SlugPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string') return value;

    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loai bo dau tieng Viet
      .replace(/[^a-z0-9\s-]/g, '')    // Chi giu chu, so, space, dau gach
      .replace(/\s+/g, '-')            // Thay space bang dau gach
      .replace(/-+/g, '-')             // Gop nhieu dau gach
      .replace(/^-|-$/g, '');          // Bo dau gach dau/cuoi
  }
}

@Post()
create(@Body('title', SlugPipe) slug: string) {
  // "Hello World" → "hello-world"
  // "NestJS la Framework" → "nestjs-la-framework"
  // "Xin chao Viet Nam!" → "xin-chao-viet-nam"
}

// === Pipe chuyen doi file size ===
@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  constructor(private readonly maxSize: number) {} // max size in bytes

  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('File is required');
    }

    if (value.size > this.maxSize) {
      const maxMB = (this.maxSize / 1024 / 1024).toFixed(1);
      const fileMB = (value.size / 1024 / 1024).toFixed(1);
      throw new BadRequestException(
        `File qua lon: ${fileMB}MB. Kich thuoc toi da: ${maxMB}MB`,
      );
    }

    return value;
  }
}

// === Pipe loai bo HTML tags ===
@Injectable()
export class StripHtmlPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '').trim();
  }
}

// === Pipe chuyen doi object keys sang camelCase ===
@Injectable()
export class CamelCaseKeysPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value !== 'object' || value === null) return value;

    return Object.keys(value).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value[key];
      return result;
    }, {} as Record<string, any>);
  }
}

@Post()
create(@Body(CamelCaseKeysPipe) body: any) {
  // { "first_name": "Phong", "last_name": "Dinh" }
  // → { "firstName": "Phong", "lastName": "Dinh" }
}
```

### 6.4. Async Pipe

```typescript
// === Async Pipe: Kiem tra uniqueness tu database ===
@Injectable()
export class UniqueEmailPipe implements PipeTransform {
  constructor(private readonly userRepository: UserRepository) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.type !== 'body' || !value.email) {
      return value;
    }

    const existingUser = await this.userRepository.findByEmail(value.email);
    if (existingUser) {
      throw new ConflictException(`Email "${value.email}" da duoc su dung`);
    }

    return value;
  }
}

// === Async Pipe: Resolve entity tu ID ===
@Injectable()
export class ParseUserPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: string, metadata: ArgumentMetadata): Promise<User> {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      throw new BadRequestException('User ID phai la so nguyen');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} khong ton tai`);
    }

    return user;
  }
}

@Controller('users')
export class UserController {
  // Pipe tu dong tim user tu database
  @Get(':id')
  findOne(@Param('id', ParseUserPipe) user: User) {
    // user da la entity tu database, khong phai ID nua
    return user;
  }

  @Put(':id')
  update(
    @Param('id', ParseUserPipe) user: User,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.update(user, updateDto);
  }
}
```

---

## 7. Pipe Binding Levels

### 7.1. Parameter-level

```typescript
@Controller('users')
export class UserController {
  // Pipe chi ap dung cho 1 parameter cu the
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,                    // Pipe cho 'id'
    @Query('include', new DefaultValuePipe(''), TrimPipe) include: string, // Pipe cho 'include'
  ) {
    return this.userService.findOne(id);
  }

  @Post()
  create(
    @Body('name', TrimPipe, StripHtmlPipe) name: string,       // 2 pipes cho 'name'
    @Body('email', new ToLowerCasePipe()) email: string,       // Pipe cho 'email'
  ) {
    return this.userService.create({ name, email });
  }
}
```

### 7.2. Method-level

```typescript
@Controller('users')
export class UserController {
  // Pipe ap dung cho toan bo method
  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Pipe voi options
  @Put(':id')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    groups: ['update'], // Chi validate nhom 'update'
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // Nhieu pipes cho method
  @Post('import')
  @UsePipes(TrimPipe, StripHtmlPipe, ValidationPipe)
  import(@Body() importDto: ImportDto) {
    return this.userService.import(importDto);
  }
}
```

### 7.3. Controller-level

```typescript
// Pipe ap dung cho tat ca methods trong controller
@Controller('products')
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
}))
export class ProductController {
  @Get()
  findAll(@Query() query: FindProductsDto) {
    // ValidationPipe tu dong validate
    return this.productService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    // ValidationPipe tu dong validate
    return this.productService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    // ValidationPipe tu dong validate
    return this.productService.update(id, dto);
  }
}
```

### 7.4. Global-level

```typescript
// === Cach 1: Trong main.ts (KHONG inject dependencies duoc) ===
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3000);
}

// === Cach 2: Trong Module (CO the inject dependencies) ===
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useFactory: (configService: ConfigService) => {
        return new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: configService.get('STRICT_VALIDATION'),
          transform: true,
          disableErrorMessages: configService.get('NODE_ENV') === 'production',
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

**Thu tu uu tien khi co nhieu levels:**

```
    Parameter Pipe > Method Pipe > Controller Pipe > Global Pipe
    (Cao nhat)                                       (Thap nhat)
```

---

## 8. Validation Groups

Validation groups cho phep ap dung cac quy tac validation khac nhau cho cac tinh huong khac nhau (create vs update).

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

// Dinh nghia DTO voi groups
export class UserDto {
  @IsInt({ groups: ['update'] })
  @Min(1, { groups: ['update'] })
  id?: number; // Chi validate khi update

  @IsString({ always: true }) // always: true = validate trong MOI group
  @IsNotEmpty({ groups: ['create'] }) // Chi bat buoc khi create
  name: string;

  @IsEmail({}, { groups: ['create'] }) // Chi validate khi create
  @IsNotEmpty({ groups: ['create'] })
  email: string;

  @IsString({ groups: ['create'] })
  @MinLength(8, { groups: ['create'] })
  password?: string; // Chi bat buoc khi create

  @IsOptional({ groups: ['update'] })
  @IsString({ groups: ['update'] })
  bio?: string; // Chi cho phep khi update
}

// Controller su dung groups
@Controller('users')
export class UserController {
  @Post()
  @UsePipes(new ValidationPipe({
    groups: ['create'],         // Chi ap dung rules cua group 'create'
    whitelist: true,
    transform: true,
  }))
  create(@Body() dto: UserDto) {
    // Validate: name (required), email (required), password (required, min 8)
    // KHONG validate: id, bio
    return this.userService.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({
    groups: ['update'],         // Chi ap dung rules cua group 'update'
    whitelist: true,
    transform: true,
    skipMissingProperties: true, // Bo qua properties thieu (partial update)
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserDto,
  ) {
    // Validate: id (required, > 0), name (string), bio (string)
    // KHONG validate: email, password
    return this.userService.update(id, dto);
  }
}
```

---

## 9. Custom Validation Decorators

### 9.1. registerDecorator

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// === Custom decorator: Kiem tra mat khau khop ===
export function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: `${propertyName} phai khop voi ${property}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

// === Custom decorator: Kiem tra tuoi toi thieu ===
export function IsOldEnough(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOldEnough',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minAge],
      options: {
        message: `Phai du ${minAge} tuoi tro len`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          const [minAge] = args.constraints;
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= minAge;
        },
      },
    });
  };
}

// === Custom decorator: Kiem tra ko chua tu cam ===
export function NoBadWords(validationOptions?: ValidationOptions) {
  const badWords = ['spam', 'scam', 'fake', 'hack'];

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'noBadWords',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} chua tu cam`,
        ...validationOptions,
      },
      validator: {
        validate(value: string) {
          if (typeof value !== 'string') return true;
          const lowerValue = value.toLowerCase();
          return !badWords.some(word => lowerValue.includes(word));
        },
      },
    });
  };
}

// Su dung trong DTO
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @NoBadWords({ message: 'Ten khong duoc chua tu cam' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsEqualTo('password', { message: 'Mat khau xac nhan khong khop' })
  confirmPassword: string;

  @IsDateString()
  @IsOldEnough(18, { message: 'Ban phai du 18 tuoi de dang ky' })
  birthDate: string;
}
```

### 9.2. ValidatorConstraint

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

// === Dinh nghia validator constraint ===
@ValidatorConstraint({ name: 'isVietnamesePhoneNumber', async: false })
export class IsVietnamesePhoneNumberConstraint implements ValidatorConstraintInterface {
  // Regex cho so dien thoai VN
  private readonly phoneRegex = /^(\+84|84|0)(3[2-9]|5[2|5|6|8|9]|7[0|6|7|8|9]|8[1-9]|9[0-9])\d{7}$/;

  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    const cleaned = value.replace(/[\s.-]/g, ''); // Loai bo khoang trang, dau cham, dau gach
    return this.phoneRegex.test(cleaned);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} khong phai so dien thoai Viet Nam hop le`;
  }
}

// Su dung truc tiep voi @Validate
export class ContactInfoDto {
  @Validate(IsVietnamesePhoneNumberConstraint, {
    message: 'So dien thoai khong hop le. Vi du: 0912345678, +84912345678',
  })
  phone: string;
}

// Hoac tao custom decorator tu constraint
export function IsVietnamesePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsVietnamesePhoneNumberConstraint,
    });
  };
}

// Su dung nhu decorator binh thuong
export class ContactDto {
  @IsVietnamesePhone({ message: 'SDT phai la so Viet Nam hop le' })
  phone: string;
}

// === Validator voi nhieu dieu kien phuc tap ===
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string') return false;
    if (value.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  defaultMessage(): string {
    return 'Mat khau phai co it nhat 8 ky tu, bao gom chu hoa, chu thuong, so va ky tu dac biet';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
```

### 9.3. Async Custom Validator

```typescript
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// === Async validator: Kiem tra email unique tu database ===
@ValidatorConstraint({ name: 'isEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    if (!email) return true;

    const user = await this.userRepository.findByEmail(email);
    return !user; // true neu email chua ton tai
  }

  defaultMessage(args: ValidationArguments): string {
    return `Email "${args.value}" da duoc su dung`;
  }
}

// Tao decorator
export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}

// === Async validator: Kiem tra entity ton tai ===
@ValidatorConstraint({ name: 'entityExists', async: true })
@Injectable()
export class EntityExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {}

  async validate(id: number, args: ValidationArguments): Promise<boolean> {
    const [entityClass] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);
    const entity = await repository.findOneBy({ id });
    return !!entity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    return `${entityClass.name} voi ID ${args.value} khong ton tai`;
  }
}

export function EntityExists(entityClass: Function, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass],
      validator: EntityExistsConstraint,
    });
  };
}

// Su dung
export class CreateOrderDto {
  @IsEmailUnique({ message: 'Email nay da ton tai trong he thong' })
  email: string;

  @IsInt()
  @EntityExists(Product, { message: 'San pham khong ton tai' })
  productId: number;

  @IsInt()
  @EntityExists(User, { message: 'Nguoi dung khong ton tai' })
  userId: number;
}

// QUAN TRONG: Phai dang ky constraint trong Module
@Module({
  providers: [
    IsEmailUniqueConstraint,
    EntityExistsConstraint,
  ],
})
export class ValidationModule {}

// Va phai dung useContainer trong main.ts
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cho phep class-validator su dung NestJS DI container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3000);
}
```

---

## 10. Mapped Types

NestJS cung cap utility types de tao DTO moi tu DTO co san.

### 10.1. PartialType

Tao DTO moi voi tat ca properties la optional.

```typescript
import { PartialType } from '@nestjs/mapped-types';
// Hoac: import { PartialType } from '@nestjs/swagger'; (neu dung Swagger)

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  @Min(1)
  age: number;
}

// UpdateUserDto: tat ca properties tro thanh optional
// Giong nhu Partial<CreateUserDto> nhung GIU LAI validation decorators
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Tuong duong voi:
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @IsNotEmpty()
//   name?: string;
//
//   @IsOptional()
//   @IsEmail()
//   email?: string;
//
//   @IsOptional()
//   @IsString()
//   @MinLength(8)
//   password?: string;
//
//   @IsOptional()
//   @IsInt()
//   @Min(1)
//   age?: number;
// }

@Controller('users')
export class UserController {
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Body co the la {} rong, hoac chi co 1 vai fields
    // PATCH /users/1 body: { "name": "New Name" } → OK
    // PATCH /users/1 body: {} → OK
    return this.userService.update(id, updateUserDto);
  }
}
```

### 10.2. PickType

Tao DTO moi chi voi mot so properties duoc chon.

```typescript
import { PickType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsOptional()
  bio?: string;
}

// Chi lay email va password
export class LoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
// Tuong duong: { email: string; password: string; }

// Chi lay name va email
export class UserContactDto extends PickType(CreateUserDto, ['name', 'email'] as const) {}
// Tuong duong: { name: string; email: string; }

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    // Chi validate email va password
    return this.authService.login(loginDto);
  }
}
```

### 10.3. OmitType

Tao DTO moi bo di mot so properties.

```typescript
import { OmitType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsOptional()
  bio?: string;
}

// Bo di password (vi du: khi tra ve thong tin user)
export class UserResponseDto extends OmitType(CreateUserDto, ['password'] as const) {}
// Tuong duong: { name, email, age, bio }

// Bo di nhieu fields
export class PublicUserDto extends OmitType(CreateUserDto, ['password', 'email', 'age'] as const) {}
// Tuong duong: { name, bio }

// Ket hop OmitType voi them properties moi
export class UpdateProfileDto extends OmitType(CreateUserDto, ['password', 'email'] as const) {
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
// Tuong duong: { name, age, bio, avatarUrl }
```

### 10.4. IntersectionType

Ket hop 2 DTO thanh 1 DTO moi.

```typescript
import { IntersectionType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}

export class AdditionalUserInfo {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  phone?: string;
}

// Ket hop 2 DTO
export class CreateFullUserDto extends IntersectionType(
  CreateUserDto,
  AdditionalUserInfo,
) {}
// Tuong duong: { name, email, bio, website, phone }

// Ket hop nhieu hon 2 DTO
export class TimestampDto {
  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}

// IntersectionType chi nhan 2 DTO, dung nhu sau cho 3+
export class FullUserWithTimestamp extends IntersectionType(
  IntersectionType(CreateUserDto, AdditionalUserInfo),
  TimestampDto,
) {}
```

### 10.5. Ket hop Mapped Types

```typescript
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  role: string;
}

// Ket hop phuc tap:

// 1. Update profile: bo password va role, con lai optional
export class UpdateProfileDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'role'] as const),
) {}

// 2. Admin update: lay tat ca, them fields admin
export class AdminUpdateUserDto extends IntersectionType(
  PartialType(CreateUserDto),
  class AdminFields {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
  },
) {}

// 3. Change password: chi can password cu va moi
export class ChangePasswordDto extends PickType(CreateUserDto, ['password'] as const) {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsEqualTo('password')
  confirmPassword: string;
}
```

---

## 11. Loi Thuong Gap

### Loi 1: Quen cai class-validator / class-transformer

```bash
# Loi: @IsString, @IsNotEmpty... khong hoat dong
# Giai phap:
npm install class-validator class-transformer
```

### Loi 2: Quen @Type() khi validate nested objects

```typescript
// ❌ LOI: Nested object khong duoc validate
export class CreateOrderDto {
  @ValidateNested()
  // Thieu @Type(() => AddressDto)
  shippingAddress: AddressDto;
}

// ✅ DUNG:
export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)  // BAT BUOC
  shippingAddress: AddressDto;
}
```

### Loi 3: Dung wrong import cho Mapped Types

```typescript
// ❌ LOI khi dung voi Swagger:
import { PartialType } from '@nestjs/mapped-types';
// Swagger se KHONG doc duoc properties

// ✅ DUNG khi dung Swagger:
import { PartialType } from '@nestjs/swagger';
```

### Loi 4: Khong bat whitelist

```typescript
// ❌ NGUY HIEM: Khong co whitelist
// User co the gui: { "name": "test", "isAdmin": true, "role": "superadmin" }
// va nhung fields nay se duoc truyen thang vao database!

// ✅ AN TOAN:
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
}));
```

### Loi 5: transform khong hoat dong

```typescript
// ❌ LOI: Query params van la string
@Get()
findAll(@Query('page') page: number) {
  console.log(typeof page); // 'string' - KHONG TU DONG CHUYEN!
}

// ✅ DUNG: Bat transform
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}));
```

---

## 12. Best Practices

### 1. Luon bat global ValidationPipe

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}));
```

### 2. Tao DTO cho moi use case

```typescript
// Khong dung 1 DTO cho nhieu muc dich
// ✅ Tao DTO rieng:
export class CreateUserDto { /* ... */ }
export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UserResponseDto extends OmitType(CreateUserDto, ['password'] as const) {}
export class LoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
```

### 3. Custom error messages bang tieng Viet (hoac ngon ngu phu hop)

```typescript
export class CreateUserDto {
  @IsString({ message: 'Ho ten phai la chuoi ky tu' })
  @IsNotEmpty({ message: 'Ho ten khong duoc de trong' })
  @MinLength(2, { message: 'Ho ten phai co it nhat $constraint1 ky tu' })
  name: string;
}
```

### 4. Su dung constants cho error messages

```typescript
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} la bat buoc`,
  MIN_LENGTH: (field: string, min: number) => `${field} phai co it nhat ${min} ky tu`,
  INVALID_EMAIL: 'Email khong hop le',
  INVALID_PHONE: 'So dien thoai khong hop le',
};

export class CreateUserDto {
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED('Ho ten') })
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN_LENGTH('Ho ten', 2) })
  name: string;
}
```

### 5. Validate environment variables

```typescript
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync, IsEnum } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
```

---

## 13. Vi du Thuc Te Hoan Chinh

```typescript
// === E-Commerce Product API voi day du validation ===

// enums/product.enum.ts
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  BOOKS = 'books',
  OTHER = 'other',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

// dto/product-image.dto.ts
export class ProductImageDto {
  @IsUrl({}, { message: 'URL hinh anh khong hop le' })
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

// dto/product-variant.dto.ts
export class ProductVariantDto {
  @IsString()
  @IsNotEmpty({ message: 'Ten phan loai khong duoc rong' })
  name: string; // VD: "Mau Do - Size L"

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Gia phai la so duong' })
  price: number;

  @IsInt()
  @Min(0, { message: 'So luong ton kho khong duoc am' })
  stock: number;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>; // { color: 'red', size: 'L' }
}

// dto/create-product.dto.ts
export class CreateProductDto {
  @IsString({ message: 'Ten san pham phai la string' })
  @IsNotEmpty({ message: 'Ten san pham khong duoc de trong' })
  @MinLength(3, { message: 'Ten san pham phai co it nhat 3 ky tu' })
  @MaxLength(200, { message: 'Ten san pham khong duoc qua 200 ky tu' })
  @NoBadWords({ message: 'Ten san pham chua tu khong phu hop' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Mo ta phai co it nhat 10 ky tu' })
  @MaxLength(5000, { message: 'Mo ta khong duoc qua 5000 ky tu' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Gia phai la so voi toi da 2 so thap phan' })
  @IsPositive({ message: 'Gia phai la so duong' })
  @Max(999999999, { message: 'Gia khong duoc vuot qua 999,999,999' })
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100, { message: 'Giam gia khong duoc qua 100%' })
  discountPercent?: number;

  @IsEnum(ProductCategory, {
    message: `Danh muc phai la: ${Object.values(ProductCategory).join(', ')}`,
  })
  category: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsArray()
  @ArrayMinSize(1, { message: 'Phai co it nhat 1 hinh anh' })
  @ArrayMaxSize(10, { message: 'Toi da 10 hinh anh' })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20, { message: 'Toi da 20 tags' })
  @IsString({ each: true })
  @ArrayUnique({ message: 'Tags khong duoc trung nhau' })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// dto/update-product.dto.ts
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// dto/query-products.dto.ts
export class QueryProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// pipes/parse-product.pipe.ts
@Injectable()
export class ParseProductPipe implements PipeTransform {
  constructor(private readonly productService: ProductService) {}

  async transform(value: string): Promise<Product> {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Product ID phai la so nguyen');
    }
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException(`San pham #${id} khong ton tai`);
    }
    return product;
  }
}

// controllers/product.controller.ts
@Controller('products')
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
```

---

## 14. Bai Tap

### Bai tap 1: Built-in Pipes (De)

Tao API endpoints sau voi built-in pipes:
- `GET /products/:id` - id phai la so nguyen duong
- `GET /products?page=1&limit=10&active=true` - co default values
- `GET /products/category/:category` - category phai thuoc enum `ProductCategory`
- `GET /products/search?ids=1,2,3,4` - ids la array cua numbers

### Bai tap 2: Validation DTO (Trung binh)

Tao DTO cho he thong dang ky hoc sinh voi validation:
- `CreateStudentDto`: ho ten (2-100 ky tu), email, ngay sinh (phai du 6 tuoi), gioi tinh (enum), so dien thoai phu huynh (VN), dia chi (nested: duong, phuong, quan, thanh pho), lop hoc (1-12)
- `UpdateStudentDto`: tat ca optional
- `QueryStudentsDto`: tim kiem, loc theo lop, pagination, sorting

### Bai tap 3: Custom Pipes (Trung binh)

Tao cac custom pipes sau:
- `TrimAndLowerPipe`: cat khoang trang va chuyen chu thuong
- `ParseDateRangePipe`: nhan string "2024-01-01,2024-12-31" va tra ve object `{ start: Date, end: Date }`
- `FileValidationPipe`: validate file upload (kich thuoc toi da, dinh dang cho phep: jpg, png, pdf)
- `SanitizeHtmlPipe`: loai bo HTML tags nguy hiem (script, iframe, onclick...)

### Bai tap 4: Custom Validators (Kho)

Tao cac custom validator decorators:
- `@IsVietnameseId()`: validate so CMND (9 so) hoac CCCD (12 so)
- `@IsUniqueInDatabase(entity, field)`: async validator kiem tra unique trong database
- `@IsAfterDate(property)`: validate ngay phai sau mot ngay khac trong cung DTO
- `@PasswordStrength(level)`: validate do manh cua mat khau (weak/medium/strong)

### Bai tap 5: Tong hop (Nang cao)

Xay dung API quan ly don hang voi validation day du:
- `CreateOrderDto` voi nested validation (customer info, shipping address, order items)
- Custom pipe `CalculateOrderTotalPipe` tu dong tinh tong tien
- Custom validator `@HasEnoughStock()` kiem tra ton kho
- Validation groups: 'create', 'update', 'cancel'
- Mapped types cho UpdateOrderDto, OrderSummaryDto
- Error messages hoan toan bang tieng Viet
- Unit tests cho tat ca pipes va validators

---

## Tong ket

```
    PIPES & VALIDATION TRONG NestJS - TONG QUAN
    ┌───────────────────────────────────────────────────────┐
    │                                                       │
    │  BUILT-IN PIPES                                       │
    │  ├── ParseIntPipe, ParseFloatPipe, ParseBoolPipe      │
    │  ├── ParseUUIDPipe, ParseArrayPipe, ParseEnumPipe     │
    │  ├── DefaultValuePipe                                 │
    │  └── ValidationPipe (class-validator)                  │
    │                                                       │
    │  VALIDATION (class-validator)                          │
    │  ├── Type: @IsString, @IsNumber, @IsBoolean, @IsEnum  │
    │  ├── String: @IsEmail, @IsUrl, @Matches, @MinLength   │
    │  ├── Number: @Min, @Max, @IsPositive                  │
    │  ├── Array: @IsArray, @ArrayMinSize, @ArrayUnique     │
    │  ├── Nested: @ValidateNested + @Type                  │
    │  └── Conditional: @ValidateIf, @IsOptional            │
    │                                                       │
    │  CUSTOM PIPES                                         │
    │  ├── PipeTransform interface                          │
    │  ├── Transformation pipes                             │
    │  ├── Validation pipes                                 │
    │  └── Async pipes                                      │
    │                                                       │
    │  BINDING LEVELS                                       │
    │  ├── Parameter (@Param('id', Pipe))                   │
    │  ├── Method (@UsePipes(Pipe))                         │
    │  ├── Controller (@UsePipes(Pipe))                     │
    │  └── Global (app.useGlobalPipes / APP_PIPE)           │
    │                                                       │
    │  MAPPED TYPES                                         │
    │  ├── PartialType (tat ca optional)                    │
    │  ├── PickType (chon mot so)                           │
    │  ├── OmitType (bo mot so)                             │
    │  └── IntersectionType (ket hop)                       │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

> **Tiep theo:** [Bai 7: Exception Filters](../07-Exception-Filters/README.md) - Tim hieu cach xu ly loi va exceptions trong NestJS.
