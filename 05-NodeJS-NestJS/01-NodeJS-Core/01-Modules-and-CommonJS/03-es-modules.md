# 3. ES Modules (ESM)

ES Modules là chuẩn module chính thức của JavaScript (ECMAScript), được Node.js hỗ trợ ổn định từ phiên bản 14+.

## 3.1. Named Export / Import

```js
// utils.js
// Named export - export từng giá trị với tên cụ thể
export const PI = 3.14159265359;

export function calculateArea(radius) {
  return PI * radius * radius;
}

export function calculateCircumference(radius) {
  return 2 * PI * radius;
}

export class Circle {
  constructor(radius) {
    this.radius = radius;
  }

  get area() {
    return calculateArea(this.radius);
  }

  get circumference() {
    return calculateCircumference(this.radius);
  }
}

// Hoặc export ở cuối file
const EULER = 2.71828;
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export { EULER, factorial };
```

```js
// app.mjs (hoặc app.js với "type": "module" trong package.json)

// Import named exports
import { PI, calculateArea, Circle } from './utils.js'; // PHẢI có .js extension

// Import với alias (đổi tên)
import { calculateCircumference as calcCirc } from './utils.js';

// Import tất cả vào một namespace object
import * as MathUtils from './utils.js';

console.log(PI); // 3.14159265359
console.log(calculateArea(5)); // 78.539...
console.log(calcCirc(5)); // 31.415...
console.log(MathUtils.factorial(5)); // 120

const circle = new Circle(10);
console.log(circle.area); // 314.159...
```

## 3.2. Default Export / Import

Mỗi module chỉ có **một default export**.

```js
// database.js
export default class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
  }

  async connect() {
    console.log(`Đang kết nối đến: ${this.connectionString}`);
    // Giả lập kết nối
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.connected = true;
    console.log('Kết nối thành công!');
  }

  async query(sql, params = []) {
    if (!this.connected) throw new Error('Chưa kết nối database');
    console.log(`Thực thi SQL: ${sql}`, params);
    // Giả lập query
    return { rows: [], rowCount: 0 };
  }

  async disconnect() {
    this.connected = false;
    console.log('Đã ngắt kết nối');
  }
}

// Có thể kết hợp default và named exports
export const DEFAULT_PORT = 5432;
export const DEFAULT_HOST = 'localhost';
```

```js
// app.js
// Import default export - tên tuỳ ý, không cần {}
import Database from './database.js';
// Import cả default lẫn named exports
import DB, { DEFAULT_PORT, DEFAULT_HOST } from './database.js';

const db = new Database(`postgresql://${DEFAULT_HOST}:${DEFAULT_PORT}/mydb`);
await db.connect();
```

## 3.3. Dynamic Import

`import()` trả về một Promise, cho phép load module theo điều kiện hoặc lazy loading.

```js
// dynamic-import.js
async function loadModule(moduleName) {
  try {
    const module = await import(`./${moduleName}.js`);
    return module;
  } catch (err) {
    console.error(`Không thể load module: ${moduleName}`, err.message);
    return null;
  }
}

// Sử dụng trong điều kiện
async function getFormatter(format) {
  switch (format) {
    case 'json':
      return await import('./formatters/json.js');
    case 'csv':
      return await import('./formatters/csv.js');
    case 'xml':
      return await import('./formatters/xml.js');
    default:
      throw new Error(`Format không được hỗ trợ: ${format}`);
  }
}

// Lazy loading cho tính năng ít dùng
async function generateReport(data) {
  // Chỉ load thư viện nặng khi cần
  const { default: PDFDocument } = await import('pdfkit');
  const doc = new PDFDocument();
  // ... tạo PDF
}

// Top-level await (ESM cho phép await ở top level)
const config = await import('./config.js');
console.log(config.default);
```

## 3.4. Re-export Pattern

```js
// models/user.js
export class User { /* ... */ }

// models/product.js
export class Product { /* ... */ }

// models/order.js
export class Order { /* ... */ }

// models/index.js - Barrel file (re-export tất cả)
export { User } from './user.js';
export { Product } from './product.js';
export { Order } from './order.js';

// Hoặc re-export default as named
export { default as UserService } from './user-service.js';

// Re-export tất cả
export * from './helpers.js';
// Lưu ý: export * KHÔNG re-export default export
```

```js
// Sử dụng - import gọn gàng từ một nơi
import { User, Product, Order } from './models/index.js';
```
