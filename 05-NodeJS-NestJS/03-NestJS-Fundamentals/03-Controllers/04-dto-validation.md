# DTO pattern, class-transformer

## 11. Request Payload DTO

### 11.1. DTO la gi?

**DTO (Data Transfer Object)** la object dinh nghia cau truc du lieu duoc truyen giua client va server. DTO giup:

- **Type safety**: Kieu du lieu ro rang
- **Validation**: Ket hop voi `class-validator` de validate input
- **Documentation**: Tu document API (dung voi Swagger)
- **Transformation**: Chuyen doi du lieu (dung voi `class-transformer`)

### 11.2. Tao DTO

```typescript
// === dto/create-user.dto.ts ===
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
  IsBoolean,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Ten khong duoc de trong' })
  @MinLength(2, { message: 'Ten phai co it nhat 2 ky tu' })
  @MaxLength(50, { message: 'Ten khong duoc qua 50 ky tu' })
  name: string;

  @IsEmail({}, { message: 'Email khong hop le' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mat khau phai co it nhat 8 ky tu' })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role phai la admin, user, hoac moderator' })
  role?: UserRole = UserRole.USER;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
```

### 11.3. Update DTO (Partial)

```typescript
// === dto/update-user.dto.ts ===
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType tao DTO moi voi tat ca field la optional
// Ke thua validation rules tu CreateUserDto
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Tuong duong voi viec viet tay:
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name?: string;
//
//   @IsOptional()
//   @IsEmail()
//   email?: string;
//   ... tat ca fields deu optional
// }
```

### 11.4. Mapped Types utilities

```typescript
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';

// PartialType: Tat ca fields optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// PickType: Chi lay mot so fields
export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
// LoginDto chi co: email, password

// OmitType: Loai bo mot so fields
export class CreatePublicUserDto extends OmitType(CreateUserDto, ['role', 'isActive']) {}
// CreatePublicUserDto co: name, email, password, age (KHONG co role, isActive)

// IntersectionType: Ket hop 2 DTO
export class CreateUserWithAddressDto extends IntersectionType(
  CreateUserDto,
  CreateAddressDto,
) {}
// Co tat ca fields tu ca 2 DTO
```

### 11.5. Su dung DTO trong Controller

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // createUserDto da duoc validate (neu co ValidationPipe)
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }
}
```

---

## 12. Class-transformer

`class-transformer` thuong duoc dung cung voi `class-validator` de transform va serialize/deserialize du lieu.

### 12.1. plainToInstance

```typescript
import { plainToInstance } from 'class-transformer';

// Chuyen plain object thanh class instance
const plainUser = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  age: 25,
  extraField: 'this should be ignored',
};

const userDto = plainToInstance(CreateUserDto, plainUser);
// userDto la instance cua CreateUserDto
// Co the validate bang class-validator
```

### 12.2. @Exclude va @Expose

```typescript
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude() // Khong bao gio tra ve password cho client
  password: string;

  @Exclude() // An field noi bo
  internalNote: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose({ name: 'fullName' }) // Doi ten field khi serialize
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

### 12.3. Su dung trong Service

```typescript
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findOne(id: number): UserResponseDto {
    const user = this.users.find(u => u.id === id);

    // Chuyen entity thanh response DTO (loai bo password, etc.)
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true, // Chi giu fields co @Expose()
    });
  }

  findAll(): UserResponseDto[] {
    return this.users.map(user =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
```

### 12.4. ClassSerializerInterceptor (cach tiep can global)

```typescript
// main.ts - Apply globally
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply ClassSerializerInterceptor globally
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  await app.listen(3000);
}

// Sau do, entity/response class co @Exclude se tu dong duoc serialize
// users.entity.ts
import { Exclude } from 'class-transformer';

export class User {
  id: number;
  name: string;
  email: string;

  @Exclude() // Tu dong bi loai bo khoi response
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

// users.controller.ts
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): User {
    // Password se tu dong bi loai bo khoi response
    // nho ClassSerializerInterceptor + @Exclude()
    return this.usersService.findOne(id);
  }
}
```

### 12.5. @Transform decorator

```typescript
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @Transform(({ value }) => value.trim()) // Trim whitespace
  name: string;

  @Transform(({ value }) => value.toLowerCase()) // Lowercase
  sku: string;

  @Transform(({ value }) => parseFloat(value)) // String to number
  price: number;

  @Type(() => Date) // String to Date object
  releaseDate: Date;

  @Transform(({ value }) => {
    // Custom transform logic
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  tags: string[]; // "tag1, tag2, tag3" -> ["tag1", "tag2", "tag3"]
}
```
