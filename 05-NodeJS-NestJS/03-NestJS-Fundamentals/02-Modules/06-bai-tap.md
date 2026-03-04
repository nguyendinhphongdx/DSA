# Bai tap

## 12. Bai tap

### Bai tap 1: Feature Modules (Co ban)

Tao mot ung dung NestJS quan ly thu vien sach voi cac module:

1. `BooksModule` - Quan ly sach (CRUD)
2. `AuthorsModule` - Quan ly tac gia (CRUD)
3. `CategoriesModule` - Quan ly the loai (CRUD)

Yeu cau:
- Moi module co controller va service rieng
- Import tat ca vao `AppModule`
- Du lieu luu trong memory (array)

### Bai tap 2: Shared Module (Co ban)

Tao `SharedModule` chua:

1. `PaginationService` - Phan trang du lieu
2. `SlugService` - Tao slug tu tieu de

Import `SharedModule` vao `BooksModule` va `CategoriesModule`, su dung cac services.

```typescript
// PaginationService
interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// SlugService
// Input: "Lap trinh NestJS co ban"
// Output: "lap-trinh-nestjs-co-ban"
```

### Bai tap 3: Dynamic Module (Trung binh)

Tao `MailModule` dynamic module voi:

1. `forRoot(options)` - Nhan cau hinh SMTP
2. `forRootAsync(asyncOptions)` - Nhan cau hinh tu ConfigService
3. `MailService` - Gui email (gia lap console.log)

```typescript
// Su dung:
MailModule.forRoot({
  host: 'smtp.gmail.com',
  port: 587,
  user: 'test@gmail.com',
  password: 'secret',
})

// Hoac:
MailModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    host: config.get('MAIL_HOST'),
    port: config.get('MAIL_PORT'),
    user: config.get('MAIL_USER'),
    password: config.get('MAIL_PASSWORD'),
  }),
  inject: [ConfigService],
})
```

### Bai tap 4: Module Dependencies (Trung binh)

Xay dung he thong don hang:

1. `ProductsModule` export `ProductsService`
2. `CustomersModule` export `CustomersService`
3. `OrdersModule` import ca hai module tren
4. `OrdersService` inject `ProductsService` va `CustomersService`

Yeu cau:
- `OrdersService.createOrder(customerId, productId, quantity)` phai kiem tra customer va product ton tai

### Bai tap 5: Global Module (Nang cao)

Tao `CoreModule` global chua:

1. `LoggerService` - Log voi levels (info, warn, error, debug)
2. `ConfigService` - Quan ly config tu object

Yeu cau:
- Su dung `@Global()` decorator
- Chi import `CoreModule` mot lan o `AppModule`
- Su dung `LoggerService` trong tat ca feature modules ma khong can import `CoreModule`

### Bai tap 6: Tong hop (Nang cao)

Xay dung ung dung blog hoan chinh voi:

1. `CoreModule` (@Global) - Config, Logger
2. `CommonModule` (Shared) - Pagination, Slug
3. `AuthModule` - Login, Register
4. `UsersModule` - CRUD users
5. `PostsModule` - CRUD posts (can UsersService)
6. `CommentsModule` - CRUD comments (can UsersService va PostsService)
7. `TagsModule` - CRUD tags

Ve so do dependency giua cac modules truoc khi code.
