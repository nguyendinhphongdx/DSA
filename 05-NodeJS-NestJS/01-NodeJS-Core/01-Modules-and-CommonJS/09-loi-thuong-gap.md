# 10. Các lỗi thường gặp

## Lỗi 1: Nhầm lẫn exports và module.exports

```js
// SAI
exports = { foo: 'bar' }; // Phá vỡ tham chiếu, require() nhận {}

// ĐÚNG
module.exports = { foo: 'bar' };
// hoặc
exports.foo = 'bar';
```

## Lỗi 2: Quên extension khi import ESM

```js
// SAI
import { helper } from './utils'; // Error: Cannot find module

// ĐÚNG
import { helper } from './utils.js'; // ESM yêu cầu phải có extension
```

## Lỗi 3: require() trong ESM

```js
// SAI - trong file .mjs hoặc "type": "module"
const fs = require('fs'); // ReferenceError: require is not defined

// ĐÚNG
import fs from 'fs';
// hoặc
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const legacyModule = require('./legacy.cjs');
```

## Lỗi 4: import trong CommonJS

```js
// SAI - trong file .js (mặc định CommonJS)
import express from 'express';
// SyntaxError: Cannot use import statement in a module

// ĐÚNG
const express = require('express');
// Hoặc đổi sang ESM: thêm "type": "module" trong package.json
```

## Lỗi 5: Top-level await trong CommonJS

```js
// SAI - CJS
const data = await fetchData(); // SyntaxError: await is only valid in async functions

// ĐÚNG - CJS: wrap trong async IIFE
(async () => {
  const data = await fetchData();
})();

// Hoặc chuyển sang ESM (hỗ trợ top-level await)
const data = await fetchData(); // OK trong ESM
```

## Lỗi 6: __dirname trong ESM

```js
// SAI - trong ESM
console.log(__dirname); // ReferenceError: __dirname is not defined

// ĐÚNG
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
```
