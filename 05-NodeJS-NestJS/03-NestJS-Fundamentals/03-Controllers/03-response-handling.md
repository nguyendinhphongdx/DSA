# @Res, @HttpCode, redirect

## 8. Response Handling

### 8.1. Standard approach (khuyen nghi)

NestJS tu dong serialize response va set status code:

```typescript
@Controller('users')
export class UsersController {
  // Return object -> tu dong serialize thanh JSON
  // Status code mac dinh: 200 (GET), 201 (POST)
  @Get()
  findAll(): User[] {
    return [{ id: 1, name: 'John' }];
    // Response: [{"id":1,"name":"John"}]
    // Status: 200
  }

  @Post()
  create(@Body() dto: CreateUserDto): User {
    return { id: 1, ...dto };
    // Status: 201 (POST mac dinh)
  }

  // Return string -> tra ve plain text
  @Get('hello')
  hello(): string {
    return 'Hello World!';
    // Response: Hello World!
    // Content-Type: text/html
  }

  // Return Promise
  @Get('async')
  async findAsync(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users;
  }
}
```

### 8.2. Custom HTTP Status Code

```typescript
import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  // Thay doi status code mac dinh
  @Post('login')
  @HttpCode(200) // POST login tra ve 200 thay vi 201
  login(@Body() loginDto: LoginDto) {
    return { token: 'jwt-token-here' };
  }

  // Dung HttpStatus enum (de doc hon)
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // 201
  register(@Body() registerDto: RegisterDto) {
    return { message: 'User registered successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 - No Content
  remove(@Param('id') id: string) {
    // Khong tra ve gi
    this.usersService.remove(id);
  }
}
```

### 8.3. Library-specific approach (dung @Res)

```typescript
import { Controller, Get, Post, Res, HttpStatus, Body } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  // Dung @Res() de access Express Response object truc tiep
  // LUU Y: Khi dung @Res(), ban PHAI tu gui response
  @Get()
  findAll(@Res() res: Response) {
    const users = [{ id: 1, name: 'John' }];
    res.status(HttpStatus.OK).json(users);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = { id: 1, ...createUserDto };
    res.status(HttpStatus.CREATED).json(user);
  }

  // passthrough: true - van co the dung return
  // NestJS se handle response, ban chi can set them headers/status
  @Get('passthrough')
  findAllPassthrough(@Res({ passthrough: true }) res: Response) {
    res.status(HttpStatus.OK);
    res.header('X-Custom-Header', 'custom-value');
    return [{ id: 1, name: 'John' }]; // Van dung return duoc
  }
}
```

> **Quan trong:** Khi dung `@Res()` ma KHONG co `passthrough: true`, NestJS se **khong** tu dong serialize response. Ban phai tu goi `res.json()` hoac `res.send()`. Neu quen, request se bi treo (hang).

### 8.4. Khi nao dung @Res()?

| Tinh huong | Dung standard approach | Dung @Res() |
|------------|----------------------|-------------|
| Tra ve JSON don gian | V | |
| Set custom headers | V (dung @Header) | V |
| Stream file | | V |
| Set cookies | | V |
| Server-Sent Events | | V |
| Redirect phuc tap | | V |
| Custom response format | | V |

---

## 13. Redirect va HttpRedirectResponse

### 13.1. Static Redirect

```typescript
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  // Redirect vinh vien (301)
  @Get('old-page')
  @Redirect('https://example.com/new-page', 301)
  oldPage() {
    // Ham nay khong can return gi
    // Tu dong redirect den URL trong decorator
  }

  // Redirect tam thoi (302 - mac dinh)
  @Get('google')
  @Redirect('https://google.com')
  goToGoogle() {}
}
```

### 13.2. Dynamic Redirect

```typescript
import { Controller, Get, Query, Redirect, HttpRedirectResponse } from '@nestjs/common';

@Controller()
export class AppController {
  // Dynamic redirect dua tren query parameter
  @Get('redirect')
  @Redirect('https://default.com', 302) // URL mac dinh
  dynamicRedirect(@Query('url') url?: string): HttpRedirectResponse | void {
    if (url) {
      // Override URL va status code
      return { url, statusCode: 301 };
    }
    // Neu khong co query param, dung URL mac dinh tu @Redirect
  }

  // Redirect dua tren version
  @Get('docs')
  @Redirect()
  getDocs(@Query('version') version: string): HttpRedirectResponse {
    const url = version === '5'
      ? 'https://docs.nestjs.com/v5/'
      : 'https://docs.nestjs.com';

    return { url, statusCode: 302 };
  }
}
```

### 13.3. Redirect trong thuc te

```typescript
@Controller('auth')
export class AuthController {
  // Redirect sau khi login thanh cong
  @Post('login')
  @Redirect()
  async login(@Body() loginDto: LoginDto): Promise<HttpRedirectResponse> {
    const result = await this.authService.login(loginDto);

    if (result.success) {
      return { url: '/dashboard', statusCode: 302 };
    }

    return { url: '/login?error=invalid_credentials', statusCode: 302 };
  }

  // Short URL redirect
  @Get('go/:code')
  @Redirect()
  async shortUrl(@Param('code') code: string): Promise<HttpRedirectResponse> {
    const url = await this.urlService.findByCode(code);

    if (!url) {
      return { url: '/404', statusCode: 302 };
    }

    return { url: url.originalUrl, statusCode: 301 };
  }
}
```
