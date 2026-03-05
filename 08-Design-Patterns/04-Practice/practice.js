/**
 * Design Patterns - Bài tập thực hành
 *
 * Implement các design patterns cho các bài toán dưới đây.
 */

// ============================================================
// BÀI 1: Singleton - Logger
// ============================================================
// Tạo Logger singleton:
// - log(level, message): ghi log với timestamp
// - getLogs(): trả về tất cả logs
// - clear(): xóa logs
// - Levels: 'info', 'warn', 'error'
// Đảm bảo chỉ có 1 instance trong toàn app

// Viết code ở đây:

// ============================================================
// BÀI 2: Observer - EventBus
// ============================================================
// Tạo EventBus:
// - on(event, callback): đăng ký listener
// - off(event, callback): hủy đăng ký
// - emit(event, ...args): phát sự kiện
// - once(event, callback): listener chỉ chạy 1 lần

// Viết code ở đây:

// ============================================================
// BÀI 3: Strategy - Sorting
// ============================================================
// Tạo SortingContext với các strategies:
// - BubbleSortStrategy
// - QuickSortStrategy
// - MergeSortStrategy
// SortingContext.setStrategy(strategy) để đổi runtime
// SortingContext.sort(array) để sắp xếp

// Viết code ở đây:

// ============================================================
// BÀI 4: Builder - Query Builder
// ============================================================
// Tạo QueryBuilder hỗ trợ:
// .select('name', 'email')
// .from('users')
// .where('age > 18')
// .where('status = "active"')
// .orderBy('name', 'ASC')
// .limit(10)
// .offset(20)
// .build() → trả về SQL string

// Viết code ở đây:

// ============================================================
// BÀI 5: Command - Calculator với Undo/Redo
// ============================================================
// Tạo Calculator:
// - add(value), subtract(value), multiply(value), divide(value)
// - Mỗi operation là 1 Command object
// - undo(): hoàn tác operation cuối
// - redo(): làm lại operation đã undo
// - getResult(): trả về kết quả hiện tại

// Viết code ở đây:

// ============================================================
// BÀI 6: Composite - File System
// ============================================================
// Tạo File và Folder:
// - File(name, size)
// - Folder(name): có thể chứa File và Folder con
// - getSize(): tổng size (recursive cho Folder)
// - display(indent): hiển thị cây thư mục
// - find(name): tìm file/folder theo tên

// Viết code ở đây:

// ============================================================
// BÀI 7: Decorator - API Service
// ============================================================
// Tạo APIService cơ bản: fetch(url)
// Decorators:
// - withLogging(service): log mỗi request
// - withCache(service, ttlMs): cache response
// - withRetry(service, maxRetries): retry khi fail
// - withAuth(service, token): thêm auth header
// Compose: withCache(withRetry(withLogging(withAuth(baseService, token)), 3), 60000)

// Viết code ở đây:

console.log("Implement các bài tập ở trên. Viết lời giải vào solution.js");
