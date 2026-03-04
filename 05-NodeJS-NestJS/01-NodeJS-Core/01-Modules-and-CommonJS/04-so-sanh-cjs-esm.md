# 4. So sánh CommonJS và ES Modules

## Bảng so sánh chi tiết

| Tiêu chí | CommonJS | ES Modules |
|----------|----------|------------|
| **Cú pháp** | `require()` / `module.exports` | `import` / `export` |
| **Loading** | Synchronous (đồng bộ) | Asynchronous (bất đồng bộ) |
| **Thời điểm parse** | Runtime (chạy đến đâu load đến đó) | Compile time (phân tích trước khi chạy) |
| **Tree-shaking** | Không hỗ trợ | Hỗ trợ (loại bỏ code không dùng) |
| **Top-level await** | Không | Có |
| **Dynamic import** | `require()` (đồng bộ) | `import()` (trả về Promise) |
| **`this` ở top level** | `module.exports` | `undefined` |
| **File extension** | `.js`, `.cjs` | `.mjs`, hoặc `.js` + `"type":"module"` |
| **`__dirname`** | Có sẵn | Phải tự tạo |
| **Strict mode** | Không mặc định | Luôn strict mode |
| **Binding** | Copy giá trị | Live binding (tham chiếu trực tiếp) |

## Live binding vs Copy

```js
// === CommonJS - Copy giá trị ===
// counter-cjs.js
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// app-cjs.js
const counter = require('./counter-cjs');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 (vẫn 0! vì count đã được copy)

// === ES Modules - Live binding ===
// counter-esm.js
export let count = 0;
export function increment() {
  count++;
}

// app-esm.js
import { count, increment } from './counter-esm.js';
console.log(count); // 0
increment();
console.log(count); // 1 (cập nhật! vì là live binding)
```

## Sử dụng CJS trong ESM và ngược lại

```js
// Trong ESM file, import CJS module
import cjsModule from './legacy-module.cjs'; // Default import
// KHÔNG thể dùng named import cho CJS module
// import { foo } from './legacy.cjs'; // Có thể lỗi

// Workaround: destructure sau khi import
import cjsDefault from './legacy-module.cjs';
const { foo, bar } = cjsDefault;

// Trong CJS file, import ESM module
// KHÔNG thể dùng require() cho ESM
// const esm = require('./modern.mjs'); // LỖI!

// Phải dùng dynamic import
async function main() {
  const esmModule = await import('./modern.mjs');
  console.log(esmModule.default);
}
main();
```
