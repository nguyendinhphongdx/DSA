# Route wildcards, sub-domain routing

## 9. Route Wildcards

### 9.1. Wildcard patterns

```typescript
@Controller('products')
export class ProductsController {
  // Asterisk wildcard - match bat ky ky tu nao
  @Get('ab*cd')
  // Match: /products/abcd, /products/ab_cd, /products/abXYZcd
  findWildcard() {
    return 'Wildcard route';
  }

  // NestJS dung path-to-regexp
  // Mot so pattern huu ich:

  // Optional character
  @Get('colou?r')
  // Match: /products/color, /products/colour
  findColor() {
    return 'Color or Colour';
  }

  // One or more of the preceding character
  @Get('ab+cd')
  // Match: /products/abcd, /products/abbcd, /products/abbbcd
  findPlus() {
    return 'One or more b';
  }
}
```

### 9.2. Luu y ve thu tu routes

```typescript
@Controller('users')
export class UsersController {
  // QUAN TRONG: Thu tu khai bao routes quan trong!
  // NestJS match route tu tren xuong duoi

  // Route cu the phai dat TRUOC route co parameter
  @Get('profile')     // GET /users/profile - Phai dat truoc :id
  getProfile() {
    return 'User profile';
  }

  @Get('settings')    // GET /users/settings - Phai dat truoc :id
  getSettings() {
    return 'User settings';
  }

  @Get(':id')         // GET /users/:id - Dat SAU cac route cu the
  findOne(@Param('id') id: string) {
    return `User #${id}`;
  }

  // Neu dat :id TRUOC profile:
  // GET /users/profile se match :id voi id = 'profile'
  // Day la loi thuong gap!
}
```

---

## 10. Sub-domain Routing

### 10.1. Co ban

```typescript
// Controller chi handle requests cho sub-domain cu the
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin panel';
  }
}

// Controller cho sub-domain chinh
@Controller({ host: 'api.example.com' })
export class ApiController {
  @Get()
  index(): string {
    return 'API endpoint';
  }
}
```

### 10.2. Dynamic sub-domain

```typescript
// Bat dynamic sub-domain
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  index(@HostParam('account') account: string): string {
    return `Account: ${account}`;
  }
  // GET request to user1.example.com -> "Account: user1"
  // GET request to user2.example.com -> "Account: user2"
}
```

### 10.3. Ket hop host va path

```typescript
@Controller({
  host: 'admin.example.com',
  path: 'users', // /users tren admin.example.com
})
export class AdminUsersController {
  @Get()
  findAll() {
    return 'Admin users list';
  }
}
```

> **Luu y:** Sub-domain routing chi hoat dong khi HTTP adapter (Express/Fastify) ho tro. Voi Express, can dam bao domain/subdomain duoc cau hinh dung (thuong can reverse proxy nhu Nginx).

---

## 14. Vi du hoan chinh: CRUD API

### 14.1. Entity

```typescript
// entities/product.entity.ts
export class Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 14.2. DTOs

```typescript
// dto/create-product.dto.ts
import {
  IsString, IsNotEmpty, IsNumber, IsPositive,
  IsOptional, IsBoolean, Min, MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

// dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// dto/query-product.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
```

### 14.3. Service

```typescript
// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private nextId = 1;

  create(createProductDto: CreateProductDto): Product {
    const product: Product = {
      id: this.nextId++,
      ...createProductDto,
      description: createProductDto.description || '',
      isActive: createProductDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  findAll(query: QueryProductDto): {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    let filtered = [...this.products];

    // Filter by search
    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(search) ||
             p.description.toLowerCase().includes(search),
      );
    }

    // Filter by category
    if (query.category) {
      filtered = filtered.filter(p => p.category === query.category);
    }

    // Sort
    filtered.sort((a, b) => {
      const field = query.sortBy || 'createdAt';
      const order = query.sortOrder === 'asc' ? 1 : -1;
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);

    return { data, total, page, limit, totalPages };
  }

  findOne(id: number): Product {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);
    Object.assign(product, updateProductDto, { updatedAt: new Date() });
    return product;
  }

  remove(id: number): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    this.products.splice(index, 1);
  }
}
```

### 14.4. Controller hoan chinh

```typescript
// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Header,
  Headers,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /products
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // GET /products?search=laptop&category=electronics&page=1&limit=10
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  // GET /products/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PUT /products/:id (toan bo)
  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.update(id, createProductDto);
  }

  // PATCH /products/:id (mot phan)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // DELETE /products/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.productsService.remove(id);
  }

  // GET /products/category/:category
  @Get('category/:category')
  findByCategory(
    @Param('category') category: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll({ ...query, category });
  }
}
```

### 14.5. Module

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export neu modules khac can dung
})
export class ProductsModule {}
```

---

## 15. Loi thuong gap

### 15.1. Route order - Route bi shadowed

```typescript
// LOI: Route 'profile' bi :id bat mat
@Controller('users')
export class UsersController {
  @Get(':id')         // GET /users/profile -> id = 'profile'
  findOne(@Param('id') id: string) {}

  @Get('profile')     // Khong bao gio duoc goi!
  getProfile() {}
}

// DUNG: Dat route cu the TRUOC route co parameter
@Controller('users')
export class UsersController {
  @Get('profile')     // GET /users/profile -> match
  getProfile() {}

  @Get(':id')         // GET /users/123 -> match
  findOne(@Param('id') id: string) {}
}
```

### 15.2. Quen return khi dung @Res()

```typescript
// LOI: Request bi treo (hang) vi khong gui response
@Get()
findAll(@Res() res: Response) {
  const data = [1, 2, 3];
  // Quen goi res.json() hoac res.send()!
}

// DUNG:
@Get()
findAll(@Res() res: Response) {
  const data = [1, 2, 3];
  res.json(data); // Phai gui response
}

// HOAC dung passthrough:
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(200);
  return [1, 2, 3]; // Co the dung return
}
```

### 15.3. Param luon la string

```typescript
// LOI: id la string, khong phai number
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id); // 'string', KHONG phai 'number'!
  if (id === 1) { } // Luon false vi '1' !== 1
}

// DUNG: Dung ParseIntPipe
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  console.log(typeof id); // 'number'
  if (id === 1) { } // Hoat dong dung
}
```

### 15.4. Quen khai bao controller trong module

```typescript
// LOI: Controller khong hoat dong
@Module({
  // controllers: [UsersController], // Quen khai bao!
  providers: [UsersService],
})
export class UsersModule {}

// DUNG:
@Module({
  controllers: [UsersController], // Phai khai bao
  providers: [UsersService],
})
export class UsersModule {}
```

### 15.5. DTO khong validate vi thieu ValidationPipe

```typescript
// DTO co decorators nhung khong validate
// Vi chua enable ValidationPipe!

// DUNG: Enable ValidationPipe trong main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Loai bo properties khong co trong DTO
    forbidNonWhitelisted: true,   // Throw error neu co properties la
    transform: true,              // Tu dong transform types
  }));
  await app.listen(3000);
}
```
