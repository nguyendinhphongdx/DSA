# 8. Path module chi tiet

## 8.1. Cac function thuong dung

```js
const path = require('path');

// === join() - Noi cac phan cua duong dan ===
// Tu dong xu ly separator va '..'
console.log(path.join('/home', 'user', 'docs', 'file.txt'));
// /home/user/docs/file.txt

console.log(path.join('/home', 'user', '..', 'admin', 'docs'));
// /home/admin/docs

console.log(path.join('src', 'utils', 'helpers.js'));
// src/utils/helpers.js (duong dan tuong doi)

// === resolve() - Tao duong dan tuyet doi ===
// Giong nhu 'cd' vao tung argument tu trai sang phai
console.log(path.resolve('src', 'utils', 'helpers.js'));
// /current/working/dir/src/utils/helpers.js

console.log(path.resolve('/home', 'user', 'docs'));
// /home/user/docs

console.log(path.resolve('/home', '/etc', 'config'));
// /etc/config (bat dau lai tu /)

// === So sanh join() vs resolve() ===
console.log(path.join('a', 'b', 'c'));     // a/b/c (tuong doi)
console.log(path.resolve('a', 'b', 'c'));  // /cwd/a/b/c (tuyet doi)

console.log(path.join('/a', 'b', 'c'));    // /a/b/c
console.log(path.resolve('/a', 'b', 'c')); // /a/b/c (giong nhau khi bat dau bang /)

// === basename() - Lay ten file ===
console.log(path.basename('/home/user/photo.jpg'));       // photo.jpg
console.log(path.basename('/home/user/photo.jpg', '.jpg')); // photo
console.log(path.basename('/home/user/archive.tar.gz', '.gz')); // archive.tar

// === dirname() - Lay thu muc chua ===
console.log(path.dirname('/home/user/docs/report.pdf')); // /home/user/docs
console.log(path.dirname('/home/user/docs'));             // /home/user

// === extname() - Lay phan mo rong ===
console.log(path.extname('photo.jpg'));     // .jpg
console.log(path.extname('archive.tar.gz')); // .gz
console.log(path.extname('.gitignore'));    // '' (khong co extension)
console.log(path.extname('README'));        // '' (khong co extension)

// === parse() va format() ===
const parsed = path.parse('/home/user/documents/report.pdf');
console.log(parsed);
// {
//   root: '/',
//   dir: '/home/user/documents',
//   base: 'report.pdf',
//   ext: '.pdf',
//   name: 'report'
// }

const formatted = path.format({
  dir: '/home/user/documents',
  name: 'report',
  ext: '.pdf',
});
console.log(formatted); // /home/user/documents/report.pdf

// === relative() - Tinh duong dan tuong doi giua 2 path ===
console.log(path.relative('/home/user/src', '/home/user/docs'));
// ../docs

console.log(path.relative('/home/user/src/utils', '/home/user/src/models'));
// ../models

// === normalize() - Chuan hoa duong dan ===
console.log(path.normalize('/home/user/../admin/./docs//file.txt'));
// /home/admin/docs/file.txt

// === isAbsolute() ===
console.log(path.isAbsolute('/home/user'));  // true
console.log(path.isAbsolute('./src'));        // false
console.log(path.isAbsolute('src'));          // false

// === sep va delimiter ===
console.log(path.sep);       // '/' (Linux/Mac) hoac '\\' (Windows)
console.log(path.delimiter); // ':' (Linux/Mac) hoac ';' (Windows)

// Xu ly PATH environment variable
const pathDirs = process.env.PATH.split(path.delimiter);
console.log('PATH directories:', pathDirs);
```

## 8.2. Pattern thuong dung

```js
const path = require('path');

// Lay duong dan tuyet doi cua file hien tai
const currentFile = __filename; // /home/user/project/src/app.js
const currentDir = __dirname; // /home/user/project/src

// Duong dan den file cung thu muc
const configPath = path.join(__dirname, 'config.json');

// Duong dan len thu muc cha
const projectRoot = path.join(__dirname, '..');

// Duong dan vao thu muc con
const modelsDir = path.join(__dirname, 'models');

// Thay doi extension cua file
function changeExtension(filePath, newExt) {
  const parsed = path.parse(filePath);
  return path.format({ ...parsed, base: undefined, ext: newExt });
}

console.log(changeExtension('/home/user/data.csv', '.json'));
// /home/user/data.json

// Tao unique filename
function uniqueFilename(dir, baseName, ext) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return path.join(dir, `${baseName}-${timestamp}-${random}${ext}`);
}

console.log(uniqueFilename('/tmp', 'upload', '.jpg'));
// /tmp/upload-1709456789012-a1b2c3.jpg
```
