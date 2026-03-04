# 11. Bài tập

## Bài tập 1: Module quản lý sản phẩm (CommonJS)

Tạo một hệ thống quản lý sản phẩm với cấu trúc:

```
product-manager/
├── models/
│   └── product.js        # Class Product
├── services/
│   └── productService.js # CRUD operations
├── utils/
│   ├── validator.js      # Validate dữ liệu
│   └── formatter.js      # Format hiển thị
└── app.js                # File chính
```

**Yêu cầu:**
- `Product` class có: id, name, price, category, createdAt
- `productService` có: add, remove, update, getById, getAll, searchByName, filterByCategory
- `validator` có: validateProduct, validatePrice, validateName
- `formatter` có: formatCurrency, formatProductInfo, formatProductList
- Sử dụng CommonJS `module.exports` / `require()`

## Bài tập 2: Module quản lý người dùng (ES Modules)

Viết lại bài 1 nhưng dùng ES Modules (import/export). Tạo `package.json` với `"type": "module"`.

**Yêu cầu thêm:**
- Sử dụng named exports và default export
- Tạo barrel file (index.js) cho mỗi thư mục
- Sử dụng dynamic import cho tính năng "báo cáo" (chỉ load khi cần)

## Bài tập 3: Viết CLI tool sử dụng built-in modules

Viết một CLI tool hiển thị thông tin hệ thống:

```bash
node sysinfo.js              # Hiển thị tất cả
node sysinfo.js --cpu        # Chỉ thông tin CPU
node sysinfo.js --memory     # Chỉ thông tin RAM
node sysinfo.js --network    # Chỉ thông tin mạng
node sysinfo.js --disk       # Chỉ thông tin đĩa
```

**Sử dụng:** `os`, `path`, `process.argv`, `util.format()`

## Bài tập 4: Module loader tự viết

Viết một hàm `customRequire(modulePath)` mô phỏng cách `require()` hoạt động:
- Đọc file JavaScript
- Wrap code trong function
- Thực thi và trả về module.exports
- Implement caching (không load lại module đã load)

**Gợi ý:** Sử dụng `fs.readFileSync()`, `new Function()` hoặc `vm.runInNewContext()`

## Bài tập 5: Plugin system

Tạo một hệ thống plugin đơn giản:

```js
const app = new PluginManager();

// Load plugins từ thư mục
await app.loadPlugins('./plugins/');

// Mỗi plugin export: { name, version, init(app) }
// Plugin được load dynamic bằng import()
```

**Yêu cầu:**
- Tự động scan thư mục plugins
- Load mỗi plugin bằng dynamic import
- Gọi `init()` cho mỗi plugin
- Xử lý lỗi khi plugin lỗi (không crash toàn bộ app)
- In danh sách plugins đã load

---

## Tham khảo

- [Node.js Modules Documentation](https://nodejs.org/api/modules.html)
- [Node.js ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js Built-in Modules](https://nodejs.org/api/)
