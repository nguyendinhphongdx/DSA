# 1. Tong quan ve fs module

`fs` (File System) la module built-in cua Node.js cho phep lam viec voi he thong file: doc, ghi, xoa, doi ten, tao thu muc, v.v.

## Import fs module

```js
// CommonJS
const fs = require('fs');
const fsPromises = require('fs').promises;
// hoac
const fsPromises = require('fs/promises'); // Node.js 14+

// ES Modules
import fs from 'fs';
import fsPromises from 'fs/promises';
import { readFile, writeFile } from 'fs/promises';
```

---

# 2. Ba API cua fs: Sync, Callback, Promises

Node.js cung cap **3 cach** su dung moi function trong fs module:

| API | Vi du | Dac diem |
|-----|-------|----------|
| **Synchronous** | `fs.readFileSync()` | Block thread, tra ve gia tri truc tiep |
| **Callback** | `fs.readFile(path, cb)` | Non-blocking, ket qua qua callback |
| **Promises** | `fs.promises.readFile()` | Non-blocking, tra ve Promise |

## So sanh

```js
const fs = require('fs');
const fsPromises = require('fs/promises');

// === 1. Synchronous - Block thread ===
try {
  const data = fs.readFileSync('./data.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error('Loi:', err.message);
}
// Dung khi: khoi dong app, doc config, script nho
// KHONG dung trong: server handler, vong lap xu ly request

// === 2. Callback - Non-blocking ===
fs.readFile('./data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Loi:', err.message);
    return;
  }
  console.log(data);
});
// Dung khi: can tuong thich Node.js cu, legacy code

// === 3. Promises - Non-blocking, modern ===
async function readData() {
  try {
    const data = await fsPromises.readFile('./data.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Loi:', err.message);
  }
}
readData();
// Dung khi: code moi, async/await, sach va de doc
```

## Khi nao dung API nao?

```
┌────────────────────────────────────────────────────┐
│                  CHON API NAO?                     │
├────────────────────────┬───────────────────────────┤
│ Script CLI don gian    │ → Sync (don gian, nhanh)  │
│ Khoi dong app (config) │ → Sync (chi chay 1 lan)   │
├────────────────────────┼───────────────────────────┤
│ HTTP server handler    │ → Promises (async/await)  │
│ Code async phuc tap    │ → Promises (async/await)  │
├────────────────────────┼───────────────────────────┤
│ Legacy code            │ → Callback               │
│ Stream-based           │ → Callback events         │
└────────────────────────┴───────────────────────────┘
```
