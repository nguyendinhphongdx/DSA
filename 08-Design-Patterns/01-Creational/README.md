# Creational Patterns - Patterns tạo Object

## Tổng quan

Creational patterns kiểm soát **cách tạo object**, giúp code linh hoạt và tái sử dụng hơn.

| Pattern | Mục đích | Khi nào dùng |
|---------|---------|-------------|
| **Singleton** | 1 instance duy nhất | DB connection, Logger, Config |
| **Factory Method** | Tạo object qua method | Khi client không cần biết concrete class |
| **Abstract Factory** | Tạo family of objects | UI themes, cross-platform |
| **Builder** | Xây object step-by-step | Object phức tạp, nhiều optional params |
| **Prototype** | Clone object | Config templates, game objects |

```
Singleton:    Chỉ 1 instance
Factory:      Tạo 1 object từ method
Abs Factory:  Tạo family objects
Builder:      Xây từng bước
Prototype:    Clone từ mẫu
```
