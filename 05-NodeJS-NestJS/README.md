# Node.js & NestJS - Học & Ôn tập trọn bộ

## Cấu trúc

```
05-NodeJS-NestJS/
├── 01-NodeJS-Core/                   # Node.js nền tảng
│   ├── 01-Modules-and-CommonJS
│   ├── 02-Event-Loop-and-Async
│   ├── 03-File-System
│   ├── 04-Streams-and-Buffers
│   ├── 05-HTTP-and-Networking
│   └── 06-Process-and-Child-Process
│
├── 02-NodeJS-Advanced/               # Node.js nâng cao
│   ├── 01-Express-Fundamentals
│   ├── 02-Middleware-and-Routing
│   ├── 03-Error-Handling
│   ├── 04-Authentication-JWT
│   ├── 05-REST-API-Design
│   └── 06-WebSocket-and-Realtime
│
├── 03-NestJS-Fundamentals/           # NestJS nền tảng
│   ├── 01-Introduction-and-Setup
│   ├── 02-Modules
│   ├── 03-Controllers
│   ├── 04-Providers-and-Services
│   ├── 05-Dependency-Injection
│   ├── 06-Pipes-and-Validation
│   └── 07-Exception-Filters
│
├── 04-NestJS-Advanced/               # NestJS nâng cao
│   ├── 01-Guards-and-Authorization
│   ├── 02-Interceptors
│   ├── 03-Custom-Decorators
│   ├── 04-Microservices
│   ├── 05-WebSocket-Gateway
│   └── 06-Task-Scheduling-and-Queues
│
├── 05-Database-and-ORM/              # Database & ORM
│   ├── 01-TypeORM
│   ├── 02-Prisma
│   ├── 03-MongoDB-Mongoose
│   └── 04-Redis-and-Caching
│
├── 06-Testing-and-Deployment/        # Testing & Deploy
│   ├── 01-Unit-Testing
│   ├── 02-E2E-Testing
│   ├── 03-Docker
│   └── 04-CI-CD
│
└── 07-Practice/                      # Thực hành
    ├── Mini-Exercises/
    └── Projects/
```

## Lộ trình học

### Phase 1: Node.js Core (2-3 tuần)
1. Module system (CommonJS, ES Modules)
2. Event Loop & Asynchronous (Callbacks, Promises, async/await)
3. File System (fs module)
4. Streams & Buffers
5. HTTP module & Networking
6. Process & Child Process

### Phase 2: Node.js Nâng cao (2-3 tuần)
7. Express.js fundamentals
8. Middleware & Routing
9. Error Handling patterns
10. Authentication & JWT
11. REST API Design best practices
12. WebSocket & Realtime (Socket.io)

### Phase 3: NestJS Fundamentals (2-3 tuần)
13. NestJS Introduction & Setup
14. Modules
15. Controllers & Request handling
16. Providers & Services
17. Dependency Injection
18. Pipes & Validation (class-validator)
19. Exception Filters

### Phase 4: NestJS Advanced (2-3 tuần)
20. Guards & Authorization (RBAC, CASL)
21. Interceptors
22. Custom Decorators
23. Microservices (TCP, RabbitMQ, Kafka)
24. WebSocket Gateway
25. Task Scheduling & Queues (Bull)

### Phase 5: Database & ORM (2-3 tuần)
26. TypeORM (Relations, Migrations, QueryBuilder)
27. Prisma (Schema, Client, Migrations)
28. MongoDB & Mongoose
29. Redis & Caching strategies

### Phase 6: Testing & Deployment (1-2 tuần)
30. Unit Testing (Jest)
31. E2E Testing (Supertest)
32. Docker & Docker Compose
33. CI/CD (GitHub Actions)

### Phase 7: Thực hành
34. Mini exercises cho từng concept
35. Full projects (REST API, Realtime Chat, E-commerce...)

## Cách sử dụng

Mỗi thư mục chứa `README.md` dạng **bài giảng** với:
- Lý thuyết chi tiết + giải thích
- Code demo chạy được
- Common mistakes & best practices
- Bài tập luyện tập

Chạy file Node.js:
```bash
node <đường-dẫn-file>.js
```

Tạo project NestJS:
```bash
npm i -g @nestjs/cli
nest new my-project
cd my-project && npm run start:dev
```
