# 07 - SOLID & Clean Code

## Tổng quan

SOLID là 5 nguyên tắc thiết kế hướng đối tượng giúp code **dễ bảo trì, mở rộng và test**.
Clean Code là tập hợp các best practices giúp code **dễ đọc, dễ hiểu và dễ thay đổi**.

## Cấu trúc

```
07-SOLID-Clean-Code/
├── 01-Single-Responsibility-Principle/   # SRP - Mỗi class/function 1 nhiệm vụ
├── 02-Open-Closed-Principle/             # OCP - Mở cho mở rộng, đóng cho sửa đổi
├── 03-Liskov-Substitution-Principle/     # LSP - Subtype thay thế được base type
├── 04-Interface-Segregation-Principle/   # ISP - Interface nhỏ, chuyên biệt
├── 05-Dependency-Inversion-Principle/    # DIP - Phụ thuộc vào abstraction
├── 06-DRY-KISS-YAGNI/                   # Các nguyên tắc clean code cơ bản
├── 07-Clean-Functions/                   # Viết hàm sạch
├── 08-Clean-Naming/                      # Đặt tên biến, hàm, class
├── 09-Code-Smells-and-Refactoring/       # Nhận biết và sửa code xấu
└── 10-Practice/                          # Bài tập thực hành
```

## SOLID là gì?

| Chữ cái | Nguyên tắc | Ý nghĩa |
|---------|-----------|---------|
| **S** | Single Responsibility | Mỗi class chỉ có MỘT lý do để thay đổi |
| **O** | Open/Closed | Mở cho mở rộng, đóng cho sửa đổi |
| **L** | Liskov Substitution | Subtype phải thay thế được base type |
| **I** | Interface Segregation | Không ép implement interface không cần |
| **D** | Dependency Inversion | Phụ thuộc vào abstraction, không phụ thuộc concrete |

## Clean Code là gì?

> "Any fool can write code that a computer can understand.
> Good programmers write code that humans can understand."
> — Martin Fowler

### Các nguyên tắc chính:
1. **DRY** - Don't Repeat Yourself
2. **KISS** - Keep It Simple, Stupid
3. **YAGNI** - You Aren't Gonna Need It
4. **Clean Functions** - Hàm nhỏ, làm 1 việc, tên rõ ràng
5. **Clean Naming** - Tên biến/hàm phải reveal intent
6. **No Code Smells** - Nhận biết và loại bỏ code xấu

## Lộ trình học

### Phase 1: Nền tảng Clean Code
1. Clean Naming (08)
2. Clean Functions (07)
3. DRY / KISS / YAGNI (06)

### Phase 2: SOLID Principles
4. SRP (01) → dễ nhất, áp dụng ngay
5. OCP (02) → cần hiểu polymorphism
6. LSP (03) → cần hiểu inheritance
7. ISP (04) → cần hiểu interface design
8. DIP (05) → cần hiểu dependency injection

### Phase 3: Refactoring
9. Code Smells & Refactoring (09)
10. Practice (10)

## Tài liệu tham khảo

- **Clean Code** - Robert C. Martin
- **Refactoring** - Martin Fowler
- **Design Principles and Design Patterns** - Robert C. Martin
