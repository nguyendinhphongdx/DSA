# 3. Doc file (readFile)

## 3.1. Doc toan bo file

```js
const fs = require('fs');
const fsPromises = require('fs/promises');

// === Sync ===
const content = fs.readFileSync('./message.txt', 'utf8');
console.log(content);

// Khong truyen encoding → tra ve Buffer
const buffer = fs.readFileSync('./image.png');
console.log(buffer); // <Buffer 89 50 4e 47 ...>
console.log(buffer.length); // So bytes

// === Callback ===
fs.readFile('./message.txt', 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('File khong ton tai');
    } else if (err.code === 'EACCES') {
      console.error('Khong co quyen doc file');
    } else {
      console.error('Loi khac:', err.message);
    }
    return;
  }
  console.log('Noi dung:', data);
});

// === Promises ===
async function readMessage() {
  try {
    const data = await fsPromises.readFile('./message.txt', 'utf8');
    console.log('Noi dung:', data);
    return data;
  } catch (err) {
    console.error('Loi:', err.code, err.message);
    throw err;
  }
}
```

## 3.2. Doc file voi options

```js
// Options day du
const data = await fsPromises.readFile('./data.txt', {
  encoding: 'utf8', // 'utf8', 'ascii', 'base64', 'hex', 'latin1', ...
  flag: 'r', // 'r' (doc), 'r+' (doc/ghi), 'w' (ghi), 'a' (append)
  signal: AbortSignal.timeout(5000), // Timeout 5 giay (Node.js 16+)
});

// Doc file binary (anh, video, ...)
const imageBuffer = await fsPromises.readFile('./photo.jpg');
const base64Image = imageBuffer.toString('base64');
console.log(`data:image/jpeg;base64,${base64Image}`);

// Doc file voi AbortController
const controller = new AbortController();
const { signal } = controller;

// Huy sau 3 giay
setTimeout(() => controller.abort(), 3000);

try {
  const data = await fsPromises.readFile('./large-file.txt', {
    encoding: 'utf8',
    signal,
  });
  console.log(data);
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Doc file bi huy (timeout)');
  }
}
```

## 3.3. Doc file theo dong

```js
const fs = require('fs');
const readline = require('readline');

// Cach 1: readline interface
async function readFileByLine(filePath) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // Xu ly ca \r\n va \n
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    console.log(`${lineNumber}: ${line}`);
  }

  console.log(`Tong cong ${lineNumber} dong`);
}

readFileByLine('./log.txt');

// Cach 2: Split thu cong
async function readLines(filePath) {
  const content = await fsPromises.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.trim()) {
      // Bo dong trong
      console.log(`${index + 1}: ${line}`);
    }
  });

  return lines;
}
```

---

# 4. Ghi file (writeFile, appendFile)

## 4.1. writeFile - Ghi de toan bo file

```js
const fsPromises = require('fs/promises');

// Ghi text
await fsPromises.writeFile('./output.txt', 'Xin chao Node.js!', 'utf8');

// Ghi voi options
await fsPromises.writeFile('./output.txt', 'Noi dung moi', {
  encoding: 'utf8',
  flag: 'w', // 'w' = ghi de, 'wx' = ghi moi (loi neu file da ton tai)
  mode: 0o644, // Quyen file: owner doc/ghi, group va others chi doc
});

// Ghi buffer (binary data)
const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
await fsPromises.writeFile('./binary.dat', buffer);

// Ghi JSON
const config = {
  host: 'localhost',
  port: 3000,
  database: {
    url: 'mongodb://localhost:27017/myapp',
    poolSize: 10,
  },
};
await fsPromises.writeFile(
  './config.json',
  JSON.stringify(config, null, 2), // Pretty print voi 2 spaces
  'utf8'
);

// An toan hon: Ghi vao file tam truoc, roi rename (atomic write)
const path = require('path');
const tempPath = './config.json.tmp';
const finalPath = './config.json';

await fsPromises.writeFile(tempPath, JSON.stringify(config, null, 2));
await fsPromises.rename(tempPath, finalPath);
// Neu app crash giua chung, file goc van nguyen ven
```

## 4.2. appendFile - Ghi them vao cuoi file

```js
// Ghi them noi dung vao cuoi file (khong xoa noi dung cu)
await fsPromises.appendFile('./log.txt', 'Dong moi 1\n');
await fsPromises.appendFile('./log.txt', 'Dong moi 2\n');

// Ung dung: Simple logger
class SimpleLogger {
  constructor(logFile) {
    this.logFile = logFile;
  }

  async log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    await fsPromises.appendFile(this.logFile, logEntry);
  }

  async info(message) {
    await this.log('INFO', message);
  }

  async error(message) {
    await this.log('ERROR', message);
  }

  async warn(message) {
    await this.log('WARN', message);
  }
}

// Su dung
const logger = new SimpleLogger('./app.log');
await logger.info('Ung dung da khoi dong');
await logger.error('Ket noi database that bai');
await logger.warn('Bo nho dang cao: 85%');

// File app.log:
// [2026-03-03T10:00:00.000Z] [INFO] Ung dung da khoi dong
// [2026-03-03T10:00:01.000Z] [ERROR] Ket noi database that bai
// [2026-03-03T10:00:02.000Z] [WARN] Bo nho dang cao: 85%
```

## 4.3. copyFile, rename, unlink (xoa)

```js
// Copy file
await fsPromises.copyFile('./source.txt', './dest.txt');

// Copy nhung KHONG ghi de neu file dich da ton tai
const { constants } = require('fs');
await fsPromises.copyFile(
  './source.txt',
  './dest.txt',
  constants.COPYFILE_EXCL // Loi neu dest da ton tai
);

// Di chuyen (rename) file
await fsPromises.rename('./old-name.txt', './new-name.txt');

// Di chuyen vao thu muc khac
await fsPromises.rename('./file.txt', './archive/file.txt');

// Xoa file
await fsPromises.unlink('./temp.txt');

// Kiem tra truoc khi xoa
async function safeDelete(filePath) {
  try {
    await fsPromises.access(filePath); // Kiem tra file ton tai
    await fsPromises.unlink(filePath);
    console.log(`Da xoa: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File khong ton tai: ${filePath}`);
    } else {
      throw err;
    }
  }
}

// Xoa nhieu file
async function deleteFiles(filePaths) {
  const results = await Promise.allSettled(
    filePaths.map((fp) => fsPromises.unlink(fp))
  );

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`Da xoa: ${filePaths[i]}`);
    } else {
      console.error(`Loi xoa ${filePaths[i]}: ${result.reason.message}`);
    }
  });
}
```

## 4.4. File Descriptors (cap thap)

```js
// Mo file descriptor de thao tac cap thap
const fd = await fsPromises.open('./data.txt', 'r+'); // Mo de doc va ghi

try {
  // Doc tu vi tri cu the
  const buffer = Buffer.alloc(100);
  const { bytesRead } = await fd.read(buffer, 0, 100, 0); // doc 100 bytes tu vi tri 0
  console.log('Doc duoc:', buffer.toString('utf8', 0, bytesRead));

  // Ghi vao vi tri cu the
  const writeBuffer = Buffer.from('Hello!');
  await fd.write(writeBuffer, 0, writeBuffer.length, 0); // ghi tai vi tri 0

  // Lay thong tin file
  const stats = await fd.stat();
  console.log('Kich thuoc:', stats.size);

  // Truncate file (cat bot)
  await fd.truncate(50); // Giu lai 50 bytes dau

  // Dong bo du lieu xuong disk
  await fd.sync();
} finally {
  await fd.close(); // LUON dong file descriptor
}
```
