# NestJS là gì? So sánh Express/Fastify

## 1. NestJS là gì?

**NestJS** là một framework Node.js progressive dùng để xây dựng các ứng dụng server-side hiệu quả, đáng tin cậy và có khả năng mở rộng (scalable). NestJS được xây dựng hoàn toàn bằng **TypeScript** (cũng hỗ trợ JavaScript thuần) và kết hợp các yếu tố của:

- **OOP** (Object-Oriented Programming) - Lập trình hướng đối tượng
- **FP** (Functional Programming) - Lập trình hàm
- **FRP** (Functional Reactive Programming) - Lập trình phản ứng hàm

NestJS sử dụng **Express.js** làm HTTP server mặc định (có thể chuyển sang Fastify), đồng thời cung cấp một lớp abstraction phía trên các framework HTTP này.

### Triết lý thiết kế

```
NestJS = TypeScript + Decorators + Dependency Injection + Modular Architecture
```

NestJS giải quyết vấn đề lớn nhất của Node.js ecosystem: **thiếu kiến trúc chuẩn**. Trong khi Express.js cho phép bạn tự do tổ chức code theo bất kỳ cách nào, NestJS cung cấp một kiến trúc rõ ràng, có quy tắc, dễ bảo trì.

---

## 2. Tại sao nên dùng NestJS?

### 2.1. Kiến trúc rõ ràng, có tổ chức

```
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── ...
├── app.module.ts
└── main.ts
```

### 2.2. TypeScript first-class support

NestJS được viết bằng TypeScript và hỗ trợ TypeScript một cách native. Điều này mang lại:

- **Type safety**: Phát hiện lỗi tại compile-time thay vì runtime
- **IntelliSense**: IDE hỗ trợ tốt hơn với autocomplete
- **Refactoring**: Dễ dàng đổi tên biến, hàm trên toàn bộ project

### 2.3. Dependency Injection (DI)

```typescript
// NestJS tự động inject UserService vào controller
@Controller('users')
export class UsersController {
  // NestJS tự tạo instance và inject vào đây
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### 2.4. Ecosystem phong phú

NestJS cung cấp các module chính thức cho:

| Module | Mục đích |
|--------|---------|
| `@nestjs/typeorm` | ORM cho database |
| `@nestjs/mongoose` | MongoDB ODM |
| `@nestjs/graphql` | GraphQL API |
| `@nestjs/websockets` | Real-time communication |
| `@nestjs/microservices` | Microservices architecture |
| `@nestjs/swagger` | API documentation |
| `@nestjs/jwt` | JSON Web Token |
| `@nestjs/passport` | Authentication |
| `@nestjs/config` | Configuration management |
| `@nestjs/cache-manager` | Caching |
| `@nestjs/bull` | Queue management |
| `@nestjs/schedule` | Task scheduling (Cron) |
| `@nestjs/throttler` | Rate limiting |

### 2.5. Testing dễ dàng

```typescript
// NestJS hỗ trợ unit testing và e2e testing built-in
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return an array of users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });
});
```

---

## 3. So sánh NestJS với Express và Fastify

### 3.1. Bảng so sánh tổng quan

| Tiêu chí | Express.js | Fastify | NestJS |
|-----------|-----------|---------|--------|
| **Kiến trúc** | Không có sẵn, tự tổ chức | Không có sẵn, tự tổ chức | Modular, có sẵn kiến trúc rõ ràng |
| **TypeScript** | Cần cấu hình thêm | Hỗ trợ khá tốt | Native support |
| **Learning curve** | Thấp | Thấp | Trung bình - Cao |
| **Performance** | Tốt | Rất tốt (nhanh hơn Express ~2x) | Tốt (dùng Express/Fastify bên dưới) |
| **DI** | Không có | Không có | Built-in |
| **Validation** | Cần thêm thư viện | Có schema validation | Built-in với class-validator |
| **Documentation** | Cộng đồng lớn | Tốt | Rất tốt, chi tiết |
| **Microservices** | Tự implement | Plugin-based | Built-in support |
| **Testing** | Tự setup | Tự setup | Built-in testing utilities |
| **Decorator** | Không có | Không có | Sử dụng rộng rãi |
| **Use case** | API nhỏ, prototype | API cần performance cao | Enterprise, dự án lớn |

### 3.2. Code so sánh

**Express.js:**

```typescript
// express-app.ts
import express from 'express';

const app = express();
app.use(express.json());

// Không có cấu trúc rõ ràng, mọi thứ đều nằm trong 1 file
// hoặc tự tổ chức theo ý muốn
app.get('/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  // Phải tự validate
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  // ...
});

app.listen(3000);
```

**NestJS:**

```typescript
// users.controller.ts - Mỗi concern có file riêng
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll(); // Logic nằm ở service
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Validation tự động qua DTO + ValidationPipe
    return this.usersService.create(createUserDto);
  }
}

// create-user.dto.ts - Validation được định nghĩa rõ ràng
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

### 3.3. Khi nào dùng gì?

- **Express.js**: API nhỏ, prototype nhanh, team ít kinh nghiệm TypeScript
- **Fastify**: API cần performance tối đa, microservices nhẹ
- **NestJS**: Dự án enterprise, team lớn, cần kiến trúc chuẩn, dự án dài hạn
