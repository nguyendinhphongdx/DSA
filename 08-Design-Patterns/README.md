# 08 - Design Patterns

## Tổng quan

Design Patterns là các **giải pháp mẫu** cho các vấn đề thiết kế phần mềm thường gặp.
Không phải là code cụ thể, mà là **blueprint** để giải quyết vấn đề.

> "Design patterns are typical solutions to commonly occurring problems in software design."
> — Gang of Four (GoF)

## Cấu trúc

```
08-Design-Patterns/
├── 01-Creational/          # Patterns tạo object
│   ├── Singleton/
│   ├── Factory-Method/
│   ├── Abstract-Factory/
│   ├── Builder/
│   └── Prototype/
│
├── 02-Structural/          # Patterns tổ chức cấu trúc
│   ├── Adapter/
│   ├── Decorator/
│   ├── Facade/
│   ├── Proxy/
│   ├── Composite/
│   └── Bridge/
│
├── 03-Behavioral/          # Patterns giao tiếp giữa objects
│   ├── Observer/
│   ├── Strategy/
│   ├── Command/
│   ├── Iterator/
│   ├── State/
│   ├── Mediator/
│   └── Template-Method/
│
└── 04-Practice/            # Bài tập tổng hợp
```

## 3 nhóm Design Patterns

### 1. Creational Patterns - Tạo object
Kiểm soát **cách tạo** object.

| Pattern | Mục đích | Ví dụ thực tế |
|---------|---------|---------------|
| Singleton | Chỉ 1 instance duy nhất | Database connection, Logger |
| Factory Method | Tạo object qua method | NotificationFactory |
| Abstract Factory | Tạo family of objects | UI Theme (Dark/Light) |
| Builder | Xây object phức tạp step-by-step | QueryBuilder, FormBuilder |
| Prototype | Clone object | Config templates |

### 2. Structural Patterns - Tổ chức cấu trúc
Kiểm soát **cách tổ chức** class/object.

| Pattern | Mục đích | Ví dụ thực tế |
|---------|---------|---------------|
| Adapter | Chuyển đổi interface | API adapter, XMLToJSON |
| Decorator | Thêm behavior động | Logger, Cache, Auth middleware |
| Facade | Interface đơn giản cho hệ thống phức tạp | jQuery, API Client |
| Proxy | Kiểm soát truy cập | Lazy loading, Rate limiter |
| Composite | Cấu trúc cây | File system, Menu |
| Bridge | Tách abstraction khỏi implementation | Shape + Color |

### 3. Behavioral Patterns - Giao tiếp
Kiểm soát **cách giao tiếp** giữa objects.

| Pattern | Mục đích | Ví dụ thực tế |
|---------|---------|---------------|
| Observer | Thông báo khi state thay đổi | EventEmitter, Redux |
| Strategy | Đổi thuật toán runtime | Sorting, Payment methods |
| Command | Đóng gói request thành object | Undo/Redo, Task queue |
| Iterator | Duyệt collection | for...of, generators |
| State | Thay đổi behavior theo state | Order status, Traffic light |
| Mediator | Giao tiếp qua trung gian | Chat room, Express middleware |
| Template Method | Skeleton algorithm | Data parsers |

## Lộ trình học

### Phase 1: Patterns phổ biến nhất
1. **Singleton** → đơn giản, gặp nhiều nhất
2. **Observer** → EventEmitter, DOM events
3. **Factory** → tạo object linh hoạt
4. **Strategy** → thay thế if/else chains

### Phase 2: Patterns thực dụng
5. **Decorator** → middleware, HOF
6. **Facade** → đơn giản hóa API
7. **Proxy** → JS Proxy, lazy loading
8. **Command** → undo/redo

### Phase 3: Patterns nâng cao
9. **Builder** → fluent API
10. **Composite** → tree structures
11. **State** → state machine
12. **Mediator** → decouple components

### Phase 4: Còn lại
13. Abstract Factory, Bridge, Iterator, Template Method, Prototype

## Design Patterns trong JavaScript thực tế

```
Module Pattern     → ES Modules (import/export)
Singleton          → Module scope
Observer           → EventEmitter, addEventListener
Iterator           → for...of, Symbol.iterator, generators
Proxy              → Proxy object (ES6)
Decorator          → Higher-Order Functions, TC39 decorators
Strategy           → Functions as first-class citizens
Factory            → Constructor functions, Object.create
Middleware         → Express middleware chain (Chain of Responsibility)
```

## Tài liệu tham khảo

- **Design Patterns: Elements of Reusable OO Software** - Gang of Four
- **Head First Design Patterns** - Freeman & Robson
- **JavaScript Design Patterns** - Addy Osmani
- [Refactoring Guru](https://refactoring.guru/design-patterns)
