# 7. Built-in Modules

Node.js cung cấp nhiều module sẵn có, không cần cài đặt.

## 7.1. path - Xử lý đường dẫn file

```js
const path = require('path');
// hoặc ESM: import path from 'path'; hoặc import path from 'node:path';

// path.join() - Nối đường dẫn (tự xử lý separator)
const filePath = path.join('/home', 'user', 'documents', 'file.txt');
console.log(filePath); // /home/user/documents/file.txt

// path.resolve() - Tạo đường dẫn tuyệt đối
const absolutePath = path.resolve('src', 'utils', 'helpers.js');
console.log(absolutePath); // /current/working/dir/src/utils/helpers.js

// path.basename() - Lấy tên file
console.log(path.basename('/home/user/photo.jpg')); // photo.jpg
console.log(path.basename('/home/user/photo.jpg', '.jpg')); // photo

// path.dirname() - Lấy thư mục chứa
console.log(path.dirname('/home/user/photo.jpg')); // /home/user

// path.extname() - Lấy phần mở rộng
console.log(path.extname('report.pdf')); // .pdf
console.log(path.extname('archive.tar.gz')); // .gz

// path.parse() - Phân tích đường dẫn
console.log(path.parse('/home/user/documents/report.pdf'));
// {
//   root: '/',
//   dir: '/home/user/documents',
//   base: 'report.pdf',
//   ext: '.pdf',
//   name: 'report'
// }

// path.format() - Tạo đường dẫn từ object
const formatted = path.format({
  dir: '/home/user',
  name: 'file',
  ext: '.txt',
});
console.log(formatted); // /home/user/file.txt

// path.isAbsolute() - Kiểm tra đường dẫn tuyệt đối
console.log(path.isAbsolute('/home/user')); // true
console.log(path.isAbsolute('./src')); // false

// path.relative() - Đường dẫn tương đối giữa 2 path
console.log(path.relative('/home/user/src', '/home/user/docs'));
// ../docs

// path.normalize() - Chuẩn hoá đường dẫn
console.log(path.normalize('/home/user/../admin/./docs'));
// /home/admin/docs

// path.sep - Ký tự phân cách (OS-specific)
console.log(path.sep); // / (Linux/Mac) hoặc \ (Windows)
```

## 7.2. os - Thông tin hệ điều hành

```js
const os = require('os');

// Thông tin CPU
console.log('CPU:', os.cpus()[0].model);
console.log('Số lõi CPU:', os.cpus().length);

// Bộ nhớ
console.log('Tổng RAM:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('RAM trống:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');

// Hệ điều hành
console.log('Platform:', os.platform()); // linux, darwin, win32
console.log('Arch:', os.arch()); // x64, arm64
console.log('Hostname:', os.hostname());
console.log('OS Type:', os.type()); // Linux, Darwin, Windows_NT
console.log('OS Release:', os.release());
console.log('Uptime:', (os.uptime() / 3600).toFixed(2), 'giờ');

// Thư mục
console.log('Home dir:', os.homedir()); // /home/user
console.log('Temp dir:', os.tmpdir()); // /tmp

// Network interfaces
const nets = os.networkInterfaces();
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`${name}: ${net.address}`);
    }
  }
}

// End of line
console.log('EOL:', JSON.stringify(os.EOL)); // "\n" (Linux) hoặc "\r\n" (Windows)

// User info
console.log('User:', os.userInfo().username);
```

## 7.3. url - Xử lý URL

```js
const { URL, URLSearchParams } = require('url');

// Tạo URL object
const myUrl = new URL('https://example.com:8080/api/users?page=1&limit=10#section1');

console.log('Protocol:', myUrl.protocol); // https:
console.log('Host:', myUrl.host); // example.com:8080
console.log('Hostname:', myUrl.hostname); // example.com
console.log('Port:', myUrl.port); // 8080
console.log('Pathname:', myUrl.pathname); // /api/users
console.log('Search:', myUrl.search); // ?page=1&limit=10
console.log('Hash:', myUrl.hash); // #section1
console.log('Origin:', myUrl.origin); // https://example.com:8080

// Làm việc với query params
const params = myUrl.searchParams;
console.log('page:', params.get('page')); // 1
console.log('limit:', params.get('limit')); // 10

// Thêm/sửa/xoá params
params.set('sort', 'name');
params.append('filter', 'active');
params.delete('limit');
console.log(myUrl.toString());
// https://example.com:8080/api/users?page=1&sort=name&filter=active#section1

// Duyệt qua params
for (const [key, value] of params) {
  console.log(`${key} = ${value}`);
}

// Tạo URL tương đối
const apiUrl = new URL('/api/v2/products', 'https://example.com');
console.log(apiUrl.href); // https://example.com/api/v2/products

// URLSearchParams riêng
const search = new URLSearchParams({
  q: 'nodejs modules',
  lang: 'vi',
  page: '1',
});
console.log(search.toString()); // q=nodejs+modules&lang=vi&page=1
```

## 7.4. util - Tiện ích

```js
const util = require('util');
const fs = require('fs');

// util.promisify() - Chuyển callback-style sang Promise
const readFileAsync = util.promisify(fs.readFile);

async function readConfig() {
  try {
    const data = await readFileAsync('./config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Lỗi đọc config:', err.message);
  }
}

// util.format() - Format string giống printf
console.log(util.format('Xin chào %s, bạn %d tuổi', 'Phong', 25));
// Xin chào Phong, bạn 25 tuổi

console.log(util.format('Object: %j', { name: 'test' }));
// Object: {"name":"test"}

console.log(util.format('Integer: %i, Float: %f', 42.7, 3.14));
// Integer: 42, Float: 3.14

// util.inspect() - In object chi tiết (hữu ích cho debug)
const complexObj = {
  name: 'App',
  config: {
    database: {
      host: 'localhost',
      port: 5432,
      credentials: { user: 'admin', pass: 'secret' },
    },
    cache: { ttl: 3600, driver: 'redis' },
  },
};

console.log(
  util.inspect(complexObj, {
    depth: Infinity, // Hiển thị mọi cấp (mặc định depth=2)
    colors: true, // Bôi màu trong terminal
    compact: false, // Mỗi property một dòng
  })
);

// util.types - Kiểm tra kiểu
console.log(util.types.isDate(new Date())); // true
console.log(util.types.isRegExp(/abc/)); // true
console.log(util.types.isPromise(Promise.resolve())); // true
console.log(util.types.isGeneratorFunction(function* () {})); // true

// util.deprecate() - Đánh dấu hàm deprecated
const oldFunction = util.deprecate(() => {
  // logic cũ
}, 'oldFunction() đã lỗi thời, dùng newFunction() thay thế');

oldFunction(); // In warning: DeprecationWarning: oldFunction() đã lỗi thời...

// util.callbackify() - Ngược lại promisify, chuyển async thành callback-style
async function fetchData() {
  return { id: 1, name: 'test' };
}
const fetchDataCb = util.callbackify(fetchData);
fetchDataCb((err, data) => {
  if (err) throw err;
  console.log(data);
});
```
