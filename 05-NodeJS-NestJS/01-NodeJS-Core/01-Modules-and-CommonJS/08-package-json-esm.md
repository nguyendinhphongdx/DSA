# 8. package.json và "type": "module"

## 8.1. Cấu hình type

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module"
}
```

| `type` | File `.js` | File `.cjs` | File `.mjs` |
|--------|-----------|------------|------------|
| Không set (mặc định) | CommonJS | CommonJS | ESM |
| `"commonjs"` | CommonJS | CommonJS | ESM |
| `"module"` | **ESM** | CommonJS | ESM |

## 8.2. Exports map (Node.js 12+)

```json
{
  "name": "my-library",
  "version": "2.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.mjs",
      "require": "./src/index.cjs",
      "types": "./src/index.d.ts"
    },
    "./utils": {
      "import": "./src/utils.mjs",
      "require": "./src/utils.cjs"
    },
    "./package.json": "./package.json"
  },
  "main": "./src/index.cjs",
  "module": "./src/index.mjs"
}
```

```js
// Người dùng thư viện:
import myLib from 'my-library'; // → ./src/index.mjs
import { helper } from 'my-library/utils'; // → ./src/utils.mjs

const myLib = require('my-library'); // → ./src/index.cjs
```

---

## 9. __dirname và __filename trong ESM

Trong CommonJS, `__dirname` và `__filename` có sẵn. Trong ESM, chúng **không tồn tại** và phải tự tạo.

```js
// === CommonJS ===
// __dirname và __filename tự động có sẵn
console.log(__dirname); // /home/user/project/src
console.log(__filename); // /home/user/project/src/app.js

// === ES Modules ===
// Phải tự tạo từ import.meta.url
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__filename); // /home/user/project/src/app.js
console.log(__dirname); // /home/user/project/src

// import.meta.url trả về URL dạng file://
console.log(import.meta.url);
// file:///home/user/project/src/app.js

// Sử dụng trong thực tế
import { readFileSync } from 'fs';
import { join } from 'path';

// Đọc file template trong cùng thư mục
const template = readFileSync(join(__dirname, 'template.html'), 'utf8');

// Đường dẫn đến thư mục gốc project
const projectRoot = join(__dirname, '..');
```

### Pattern phổ biến: Tạo helper module

```js
// dirname-helper.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function getDirname(importMetaUrl) {
  return dirname(fileURLToPath(importMetaUrl));
}

// Sử dụng ở bất kỳ ESM file nào
import { getDirname } from './dirname-helper.js';
const __dirname = getDirname(import.meta.url);
```
