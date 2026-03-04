# Bai tap

## 13. Bai tap

### Bai tap 1: Khoi tao project (Co ban)

Tao mot NestJS project moi ten `my-first-nest-app`:

1. Cai dat NestJS CLI
2. Tao project moi
3. Chay project o che do development
4. Truy cap `http://localhost:3000` va xac nhan thay "Hello World!"
5. Thay doi message thanh "Welcome to My First NestJS App!" trong `app.service.ts`

### Bai tap 2: Them route moi (Co ban)

Them cac route sau vao `AppController`:

1. `GET /about` - Tra ve thong tin ve ung dung (ten, phien ban, tac gia)
2. `GET /health` - Tra ve health check status
3. `GET /time` - Tra ve thoi gian hien tai

```typescript
// Ket qua mong doi:
// GET /about => { name: "My App", version: "1.0.0", author: "Your Name" }
// GET /health => { status: "ok", uptime: 12345 }
// GET /time => { currentTime: "2026-03-03T10:00:00.000Z", timezone: "UTC" }
```

### Bai tap 3: Tao Feature Module (Trung binh)

Tao mot feature module `books` voi:

1. `BooksModule`
2. `BooksController` voi cac route:
   - `GET /books` - Lay danh sach sach
   - `GET /books/:id` - Lay sach theo ID
   - `POST /books` - Them sach moi
3. `BooksService` chua business logic (dung array trong memory)
4. Import `BooksModule` vao `AppModule`

```typescript
// Interface cho Book
interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
}
```

### Bai tap 4: Lifecycle Hooks (Nang cao)

1. Implement tat ca lifecycle hooks trong `AppService`
2. Log thu tu cac hooks duoc goi
3. Bat `enableShutdownHooks()` trong `main.ts`
4. Chay app va tat bang `Ctrl+C`, quan sat thu tu log

### Bai tap 5: Custom Decorator (Nang cao)

Tao mot custom method decorator `@LogRoute()` ma:

1. Log ten method va thoi gian thuc thi
2. Log request URL
3. Ap dung decorator cho tat ca route handlers trong `BooksController`

```typescript
// Ket qua mong doi khi goi GET /books:
// [LogRoute] findAll - Started at 2026-03-03T10:00:00.000Z
// [LogRoute] findAll - Completed in 2ms
```
