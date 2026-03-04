# @Param, @Query, @Body, @Headers

## 4. Route Parameters (@Param)

### 4.1. Lay tat ca parameters

```typescript
import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Lay tat ca params duoi dang object
  @Get(':id')
  findOne(@Param() params: { id: string }): string {
    console.log(params); // { id: '123' }
    return `User #${params.id}`;
  }
}
```

### 4.2. Lay parameter cu the

```typescript
@Controller('users')
export class UsersController {
  // Lay param cu the bang ten
  @Get(':id')
  findOne(@Param('id') id: string): string {
    console.log(typeof id); // 'string' - luon la string!
    return `User #${id}`;
  }

  // Nhieu params
  @Get(':userId/posts/:postId')
  findUserPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ): string {
    return `Post #${postId} of User #${userId}`;
  }
}
```

### 4.3. Parse parameter (chuyen doi kieu)

```typescript
import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Tu dong chuyen string -> number, tra ve 400 neu khong hop le
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): string {
    console.log(typeof id); // 'number'
    return `User #${id}`;
  }

  // Validate UUID format
  @Get('uuid/:uuid')
  findByUuid(@Param('uuid', ParseUUIDPipe) uuid: string): string {
    return `User with UUID: ${uuid}`;
  }

  // Custom error message
  @Get('v2/:id')
  findOneV2(
    @Param('id', new ParseIntPipe({
      errorHttpStatusCode: 422, // Unprocessable Entity thay vi 400
    }))
    id: number,
  ): string {
    return `User #${id}`;
  }
}
```

---

## 5. Query Parameters (@Query)

### 5.1. Co ban

```typescript
import { Controller, Get, Query } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  // GET /products?page=1&limit=10&sort=name
  @Get()
  findAll(
    @Query('page') page: string,      // '1'
    @Query('limit') limit: string,    // '10'
    @Query('sort') sort: string,      // 'name'
  ): string {
    return `Products: page=${page}, limit=${limit}, sort=${sort}`;
  }

  // Lay tat ca query params
  @Get('search')
  search(@Query() query: any): string {
    console.log(query); // { q: 'laptop', category: 'electronics', minPrice: '100' }
    return `Search: ${JSON.stringify(query)}`;
  }
}
```

### 5.2. Voi DTO va Validation

```typescript
// dto/find-products.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindProductsDto {
  @IsOptional()
  @Type(() => Number) // Chuyen string -> number
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
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}

// products.controller.ts
@Controller('products')
export class ProductsController {
  // GET /products?page=2&limit=20&search=laptop&order=ASC
  @Get()
  findAll(@Query() query: FindProductsDto) {
    // query da duoc validate va transform
    console.log(query.page);   // 2 (number, khong phai string)
    console.log(query.limit);  // 20 (number)
    console.log(query.search); // 'laptop'
    console.log(query.order);  // 'ASC'
    return this.productsService.findAll(query);
  }
}
```

### 5.3. Array trong Query Parameters

```typescript
// GET /products?ids=1&ids=2&ids=3
// hoac GET /products?ids=1,2,3
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  console.log(ids); // [1, 2, 3]
  return this.productsService.findByIds(ids);
}
```

### 5.4. Optional Query Parameters

```typescript
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  findAll(
    // Gia tri mac dinh neu khong truyen
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('active', new DefaultValuePipe(true), ParseBoolPipe)
    active: boolean,
  ) {
    return { page, limit, active };
    // Neu khong truyen: { page: 1, limit: 10, active: true }
  }
}
```

---

## 6. Request Body (@Body)

### 6.1. Co ban

```typescript
import { Controller, Post, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Lay toan bo body
  @Post()
  create(@Body() body: any): string {
    console.log(body);
    // { name: 'John', email: 'john@example.com' }
    return `Created user: ${body.name}`;
  }

  // Lay field cu the tu body
  @Post('simple')
  createSimple(
    @Body('name') name: string,
    @Body('email') email: string,
  ): string {
    return `Created: ${name} (${email})`;
  }
}
```

### 6.2. Voi DTO (Data Transfer Object)

```typescript
// dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  age?: number;
}

// users.controller.ts
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // TypeScript biet createUserDto co cac truong name, email, password, age
    return this.usersService.create(createUserDto);
  }
}
```

### 6.3. Nested body extraction

```typescript
// Body: { user: { name: 'John', email: 'john@example.com' }, role: 'admin' }

@Post()
create(
  @Body('user') user: { name: string; email: string },
  @Body('role') role: string,
) {
  console.log(user);  // { name: 'John', email: 'john@example.com' }
  console.log(role);  // 'admin'
}
```

---

## 7. Headers (@Headers)

### 7.1. Doc Headers

```typescript
import { Controller, Get, Headers } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Lay tat ca headers
  @Get()
  findAll(@Headers() headers: Record<string, string>) {
    console.log(headers);
    // {
    //   'content-type': 'application/json',
    //   'authorization': 'Bearer xxx',
    //   'user-agent': '...',
    //   ...
    // }
    return 'ok';
  }

  // Lay header cu the
  @Get('me')
  getMe(@Headers('authorization') auth: string) {
    console.log(auth); // 'Bearer eyJhbGciOiJIUzI1NiIsInR...'
    return `Token: ${auth}`;
  }

  // Custom header
  @Get('client')
  getClient(
    @Headers('x-client-version') version: string,
    @Headers('x-request-id') requestId: string,
  ) {
    return { version, requestId };
  }
}
```

### 7.2. Set Response Headers

```typescript
import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  // Cach 1: Dung @Header() decorator
  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="report.pdf"')
  download() {
    // return file content...
    return 'file content';
  }

  // Cach 2: Dung @Res() (Express Response object)
  @Get('download-v2')
  downloadV2(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    });
    res.send('file content');
  }
}
```
