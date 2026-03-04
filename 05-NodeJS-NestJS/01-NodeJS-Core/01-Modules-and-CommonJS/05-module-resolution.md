# 5. Module Resolution Algorithm

Khi bạn gọi `require('something')` hoặc `import 'something'`, Node.js tìm module theo thuật toán sau:

## 5.1. Quy trình tìm kiếm

```
require('X') từ module tại đường dẫn Y:

1. Nếu X là built-in module (fs, path, http, ...):
   → Trả về built-in module. DỪNG.

2. Nếu X bắt đầu bằng './', '../', hoặc '/':
   → Tìm FILE: X, X.js, X.json, X.node
   → Tìm THƯ MỤC: X/index.js, X/index.json, X/index.node
   → Hoặc đọc X/package.json → trường "main"
   DỪNG.

3. Nếu X không bắt đầu bằng './' hay '../':
   → Tìm trong node_modules:
     a. Y/../node_modules/X
     b. Y/../../node_modules/X
     c. ... (đi lên đến root)
   → Tìm trong NODE_PATH (nếu được set)
   → Tìm trong global modules
   DỪNG.

4. Nếu không tìm thấy:
   → Throw "MODULE_NOT_FOUND" error
```

## 5.2. Ví dụ minh hoạ

```
Cấu trúc thư mục:
/project
├── node_modules/
│   └── lodash/
│       ├── package.json  (main: "lodash.js")
│       └── lodash.js
├── src/
│   ├── utils/
│   │   ├── index.js
│   │   └── helpers.js
│   └── app.js
└── package.json
```

```js
// src/app.js

// 1. Built-in module - tìm thấy ngay
const fs = require('fs'); // → Node.js built-in

// 2. Relative path
const helpers = require('./utils/helpers'); // → /project/src/utils/helpers.js
const utils = require('./utils'); // → /project/src/utils/index.js (tìm index.js)

// 3. Module trong node_modules
const _ = require('lodash');
// Tìm: /project/src/node_modules/lodash → không có
// Tìm: /project/node_modules/lodash → TÌM THẤY
// Đọc package.json → main: "lodash.js"
// → /project/node_modules/lodash/lodash.js
```

## 5.3. Xem chi tiết resolution

```js
// Dùng require.resolve() để debug
console.log(require.resolve('fs'));
// → 'fs'

console.log(require.resolve('./utils'));
// → '/project/src/utils/index.js'

console.log(require.resolve('lodash'));
// → '/project/node_modules/lodash/lodash.js'

// Xem tất cả đường dẫn tìm kiếm
console.log(require.resolve.paths('lodash'));
// [
//   '/project/src/node_modules',
//   '/project/node_modules',
//   '/node_modules',
//   '/home/user/.node_modules',
//   ...
// ]
```
