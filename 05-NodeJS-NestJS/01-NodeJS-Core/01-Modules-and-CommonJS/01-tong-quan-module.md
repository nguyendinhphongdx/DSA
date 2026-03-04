# 1. Tổng quan về Module System

## Module là gì?

Module là một đơn vị code độc lập, đóng gói logic riêng biệt, có thể tái sử dụng trong các phần khác của ứng dụng. Trong Node.js, **mỗi file là một module riêng biệt**.

## Tại sao cần Module?

- **Tổ chức code**: Chia code thành các phần nhỏ, dễ quản lý
- **Tái sử dụng**: Dùng lại code ở nhiều nơi mà không cần copy-paste
- **Đóng gói (Encapsulation)**: Ẩn chi tiết triển khai, chỉ expose API cần thiết
- **Quản lý dependencies**: Khai báo rõ ràng module nào phụ thuộc vào module nào
- **Tránh xung đột tên**: Mỗi module có scope riêng, tránh ô nhiễm global namespace

## Hai hệ thống Module trong Node.js

| Đặc điểm | CommonJS (CJS) | ES Modules (ESM) |
|-----------|----------------|-------------------|
| Cú pháp | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Hỗ trợ | Node.js từ đầu | Node.js 12+ (stable từ 14+) |
| File extension | `.js`, `.cjs` | `.mjs` hoặc `.js` (với `"type": "module"`) |
