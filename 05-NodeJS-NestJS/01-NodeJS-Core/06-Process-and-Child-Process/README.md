# Bai 06: Process va Child Process trong Node.js

## Muc luc

- [1. process Object chi tiet](#1-process-object-chi-tiet)
  - [1.1. Thong tin co ban](#11-thong-tin-co-ban)
  - [1.2. process.argv - Tham so dong lenh](#12-processargv---tham-so-dong-lenh)
  - [1.3. process.env - Bien moi truong](#13-processenv---bien-moi-truong)
  - [1.4. process.cwd() va process.chdir()](#14-processcwd-va-processchdir)
  - [1.5. process.exit()](#15-processexit)
- [2. Environment Variables](#2-environment-variables)
  - [2.1. process.env](#21-processenv)
  - [2.2. NODE_ENV va cac bien pho bien](#22-node_env-va-cac-bien-pho-bien)
  - [2.3. dotenv pattern](#23-dotenv-pattern)
- [3. Standard I/O](#3-standard-io)
  - [3.1. process.stdout](#31-processstdout)
  - [3.2. process.stderr](#32-processstderr)
  - [3.3. process.stdin](#33-processstdin)
- [4. process Events](#4-process-events)
  - [4.1. exit va beforeExit](#41-exit-va-beforeexit)
  - [4.2. uncaughtException](#42-uncaughtexception)
  - [4.3. unhandledRejection](#43-unhandledrejection)
  - [4.4. warning](#44-warning)
  - [4.5. Signal events (SIGTERM, SIGINT)](#45-signal-events-sigterm-sigint)
- [5. child_process Module](#5-child_process-module)
  - [5.1. exec() - Chay command shell](#51-exec---chay-command-shell)
  - [5.2. execFile() - Chay file truc tiep](#52-execfile---chay-file-truc-tiep)
  - [5.3. spawn() - Streaming cho output lon](#53-spawn---streaming-cho-output-lon)
  - [5.4. fork() - Tao Node.js process moi voi IPC](#54-fork---tao-nodejs-process-moi-voi-ipc)
  - [5.5. So sanh exec vs spawn vs fork](#55-so-sanh-exec-vs-spawn-vs-fork)
- [6. Cluster Module](#6-cluster-module)
  - [6.1. Master/Worker pattern](#61-masterworker-pattern)
  - [6.2. Load Balancing](#62-load-balancing)
  - [6.3. PM2 concept](#63-pm2-concept)
- [7. Worker Threads](#7-worker-threads)
  - [7.1. Tao Worker Thread](#71-tao-worker-thread)
  - [7.2. workerData va parentPort](#72-workerdata-va-parentport)
  - [7.3. MessageChannel](#73-messagechannel)
  - [7.4. SharedArrayBuffer](#74-sharedarraybuffer)
  - [7.5. So sanh Cluster vs Worker Threads](#75-so-sanh-cluster-vs-worker-threads)
- [8. Memory Management](#8-memory-management)
  - [8.1. process.memoryUsage()](#81-processmemoryusage)
  - [8.2. Phat hien Memory Leak](#82-phat-hien-memory-leak)
- [9. Performance Hooks](#9-performance-hooks)
  - [9.1. perf_hooks module](#91-perf_hooks-module)
  - [9.2. PerformanceObserver](#92-performanceobserver)
  - [9.3. Do performance cua function](#93-do-performance-cua-function)
- [10. Cac loi thuong gap](#10-cac-loi-thuong-gap)
- [11. Best Practices](#11-best-practices)
- [12. Bai tap thuc hanh](#12-bai-tap-thuc-hanh)

---

## 1. process Object chi tiet

`process` la mot global object trong Node.js, cung cap thong tin va dieu khien process (tien trinh) hien tai. Ban KHONG can `require` no.

### 1.1. Thong tin co ban

```js
// === Thong tin process ===
console.log('PID:', process.pid);           // Process ID (vi du: 12345)
console.log('PPID:', process.ppid);         // Parent Process ID
console.log('Title:', process.title);       // Ten process (hien thi trong `ps`)
console.log('Platform:', process.platform); // 'linux', 'darwin' (macOS), 'win32'
console.log('Architecture:', process.arch); // 'x64', 'arm64', 'arm'

// === Phien ban ===
console.log('Node version:', process.version);   // 'v20.10.0'
console.log('Versions:', process.versions);
// {
//   node: '20.10.0',
//   v8: '11.3.244.8',
//   uv: '1.46.0',        // libuv
//   zlib: '1.2.13.1',
//   brotli: '1.0.9',
//   ares: '1.22.1',      // c-ares (DNS)
//   modules: '115',
//   napi: '9',
//   nghttp2: '1.58.0',
//   openssl: '3.0.12',
//   icu: '74.1',
//   unicode: '15.1',
//   ...
// }

// === Thoi gian hoat dong ===
console.log('Uptime:', process.uptime(), 'giay');
// Thoi gian tinh tu khi process bat dau

// === CPU Usage ===
const startUsage = process.cpuUsage();
// Lam gi do...
const diff = process.cpuUsage(startUsage);
console.log('CPU User:', diff.user, 'microseconds');
console.log('CPU System:', diff.system, 'microseconds');

// === High Resolution Time ===
// Chinh xac den nanosecond, dung de do performance
const start = process.hrtime.bigint();
// Lam gi do...
const end = process.hrtime.bigint();
console.log(`Thoi gian: ${(end - start) / 1000000n}ms`);

// Cach cu (van dung duoc):
const [seconds, nanoseconds] = process.hrtime();

// === process.config ===
// Cau hinh compile cua Node.js (it khi can)
// console.log(process.config);

// === process.release ===
console.log('Release:', process.release);
// { name: 'node', sourceUrl: '...', headersUrl: '...', ... }

// === Kiem tra debug mode ===
console.log('Debug port:', process.debugPort); // Mac dinh: 9229
```

### 1.2. process.argv - Tham so dong lenh

```js
// Khi chay: node app.js --name "Nguyen Van A" --age 25 --verbose

console.log(process.argv);
// [
//   '/usr/local/bin/node',           // argv[0]: duong dan den node
//   '/home/user/app.js',            // argv[1]: duong dan den script
//   '--name',                       // argv[2]: tham so
//   'Nguyen Van A',                 // argv[3]: gia tri
//   '--age',                        // argv[4]
//   '25',                           // argv[5]
//   '--verbose'                     // argv[6]
// ]

// === Parse arguments thu cong ===
function parseArgs(argv) {
  const args = {};
  const rawArgs = argv.slice(2); // Bo qua node va script path

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = rawArgs[i + 1];

      // Kiem tra gia tri tiep theo co phai la option khong
      if (nextArg && !nextArg.startsWith('--') && !nextArg.startsWith('-')) {
        args[key] = nextArg;
        i++; // Bo qua gia tri o vong lap tiep
      } else {
        args[key] = true; // Flag khong co gia tri
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      args[key] = true;
    }
  }

  return args;
}

const args = parseArgs(process.argv);
console.log(args);
// { name: 'Nguyen Van A', age: '25', verbose: true }

// === Su dung parseArgs cua Node.js (tu Node 18.3+) ===
const { parseArgs: nodeParseArgs } = require('util');

try {
  const { values, positionals } = nodeParseArgs({
    options: {
      name: { type: 'string', short: 'n' },
      age: { type: 'string', short: 'a' },
      verbose: { type: 'boolean', short: 'v', default: false },
    },
    allowPositionals: true,
  });
  console.log('Values:', values);
  console.log('Positionals:', positionals);
} catch (err) {
  console.error('Tham so khong hop le:', err.message);
}

// === Vi du: CLI tool don gian ===
function main() {
  const args = parseArgs(process.argv);

  if (args.help || args.h) {
    console.log(`
Su dung: node app.js [options]

Options:
  --name, -n     Ten nguoi dung
  --age, -a      Tuoi
  --verbose, -v  Hien thi chi tiet
  --help, -h     Hien thi huong dan
    `);
    process.exit(0);
  }

  if (!args.name) {
    console.error('Loi: Thieu tham so --name');
    process.exit(1);
  }

  console.log(`Xin chao ${args.name}!`);
  if (args.age) {
    console.log(`Ban ${args.age} tuoi`);
  }
}

// main();
```

### 1.3. process.env - Bien moi truong

```js
// === Doc bien moi truong ===
console.log('PATH:', process.env.PATH);
console.log('HOME:', process.env.HOME);
console.log('USER:', process.env.USER);
console.log('SHELL:', process.env.SHELL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// === Set bien moi truong (chi trong process hien tai) ===
process.env.MY_VAR = 'hello';
console.log(process.env.MY_VAR); // 'hello'

// LUU Y: Gia tri LUON la string!
process.env.PORT = 3000; // Tu dong chuyen thanh '3000'
console.log(typeof process.env.PORT); // 'string'
console.log(process.env.PORT === 3000); // false!
console.log(process.env.PORT === '3000'); // true!

// === Xoa bien moi truong ===
delete process.env.MY_VAR;
console.log(process.env.MY_VAR); // undefined

// === Kiem tra bien moi truong an toan ===
function getEnv(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (defaultValue === undefined) {
      throw new Error(`Bien moi truong ${key} bat buoc nhung chua duoc set`);
    }
    return defaultValue;
  }
  return value;
}

function getEnvInt(key, defaultValue) {
  const value = getEnv(key, String(defaultValue));
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Bien moi truong ${key} phai la so nguyen`);
  }
  return parsed;
}

function getEnvBool(key, defaultValue) {
  const value = getEnv(key, String(defaultValue));
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

// Su dung:
const config = {
  port: getEnvInt('PORT', 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  dbHost: getEnv('DB_HOST', 'localhost'),
  dbPort: getEnvInt('DB_PORT', 5432),
  debug: getEnvBool('DEBUG', false),
};

console.log('Config:', config);
```

### 1.4. process.cwd() va process.chdir()

```js
// === process.cwd() - Lay thu muc hien tai ===
console.log('Thu muc hien tai:', process.cwd());
// '/home/user/my-project'

// CWD KHAC voi __dirname!
// __dirname: Thu muc chua FILE hien tai (khong doi)
// process.cwd(): Thu muc ma LENH NODE duoc chay (co the doi)

// Vi du:
// File: /home/user/my-project/src/app.js
// Chay tu: /home/user/my-project
// __dirname = '/home/user/my-project/src'
// process.cwd() = '/home/user/my-project'

// Chay tu: /home/user
// __dirname = '/home/user/my-project/src' (KHONG DOI)
// process.cwd() = '/home/user' (DOI!)

// === process.chdir() - Doi thu muc hien tai ===
console.log('Truoc:', process.cwd());
process.chdir('/tmp');
console.log('Sau:', process.cwd()); // '/tmp'

// Loi neu thu muc khong ton tai
try {
  process.chdir('/khong-ton-tai');
} catch (err) {
  console.error('Khong the doi thu muc:', err.message);
  // ENOENT: no such file or directory
}
```

### 1.5. process.exit()

```js
// === process.exit([code]) ===
// code 0 = thanh cong (mac dinh)
// code 1 = loi chung
// code > 0 = cac loai loi khac nhau

// Exit thanh cong
// process.exit(0);
// Hoac chi: process.exit();

// Exit voi loi
// process.exit(1);

// === exitCode - Set exit code ma khong exit ngay ===
process.exitCode = 1; // Se dung code nay khi process ket thuc tu nhien

// === CANH BAO: process.exit() la NGUY HIEM! ===
// No KHONG doi async operations hoan thanh!

// SAI - Data co the chua duoc ghi xuong file!
const fs = require('fs');
fs.writeFile('data.txt', 'Hello', () => {
  console.log('Da ghi');
});
// process.exit(0); // writeFile co the chua hoan thanh!

// DUNG - Doi async operation xong roi moi exit
fs.writeFile('data.txt', 'Hello', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Da ghi');
  process.exit(0);
});

// TOT HON - Dung process.exitCode va de process tu ket thuc
process.exitCode = 0;
// Process se ket thuc khi event loop trong

// === Exit codes pho bien ===
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENT: 2,
  INTERNAL_ERROR: 3,
  FATAL_SIGNAL: 128, // 128 + signal number
  // Vi du: SIGKILL = 128 + 9 = 137
  //        SIGTERM = 128 + 15 = 143
};
```

---

## 2. Environment Variables

### 2.1. process.env

```js
// === Set bien moi truong khi chay Node ===
// Cach 1: Inline (Linux/macOS)
// NODE_ENV=production PORT=3000 node app.js

// Cach 2: export (Linux/macOS)
// export NODE_ENV=production
// export PORT=3000
// node app.js

// Cach 3: Windows CMD
// set NODE_ENV=production
// set PORT=3000
// node app.js

// Cach 4: Windows PowerShell
// $env:NODE_ENV="production"
// $env:PORT="3000"
// node app.js

// Cach 5: cross-env (chay tren moi OS)
// npx cross-env NODE_ENV=production PORT=3000 node app.js

// === Liet ke tat ca bien moi truong ===
function printEnvVars() {
  const sortedKeys = Object.keys(process.env).sort();
  for (const key of sortedKeys) {
    console.log(`${key}=${process.env[key]}`);
  }
}
// printEnvVars();
```

### 2.2. NODE_ENV va cac bien pho bien

```js
// === NODE_ENV ===
// 'development' - Moi truong phat trien (mac dinh)
// 'production'  - Moi truong san pham
// 'test'        - Moi truong chay test
// 'staging'     - Moi truong thu nghiem

const NODE_ENV = process.env.NODE_ENV || 'development';

const isDev = NODE_ENV === 'development';
const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

// Cau hinh theo moi truong
const config = {
  development: {
    port: 3000,
    db: 'mongodb://localhost:27017/myapp_dev',
    logLevel: 'debug',
    cors: '*',
  },
  production: {
    port: process.env.PORT || 8080,
    db: process.env.DATABASE_URL,
    logLevel: 'error',
    cors: process.env.ALLOWED_ORIGINS,
  },
  test: {
    port: 3001,
    db: 'mongodb://localhost:27017/myapp_test',
    logLevel: 'warn',
    cors: '*',
  },
};

const currentConfig = config[NODE_ENV];
console.log('Config:', currentConfig);

// === Cac bien moi truong pho bien ===
/*
PORT          - Port cua server
HOST          - Host cua server
DATABASE_URL  - Connection string database
REDIS_URL     - Connection string Redis
JWT_SECRET    - Secret cho JWT
API_KEY       - API key
AWS_ACCESS_KEY_ID     - AWS credentials
AWS_SECRET_ACCESS_KEY - AWS credentials
SMTP_HOST     - Email server
SMTP_PORT     - Email port
SMTP_USER     - Email user
SMTP_PASS     - Email password
LOG_LEVEL     - Muc do log (debug, info, warn, error)
*/
```

### 2.3. dotenv pattern

```js
// === dotenv - Doc bien moi truong tu file .env ===
// Cai dat: npm install dotenv

// File .env (KHONG commit file nay vao git!):
// PORT=3000
// NODE_ENV=development
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=myapp
// DB_USER=postgres
// DB_PASS=secret123
// JWT_SECRET=my-super-secret-key
// API_KEY=abc123def456

// Su dung:
// require('dotenv').config(); // Doc file .env va set vao process.env
// console.log(process.env.DB_HOST); // 'localhost'

// === Tu implement dotenv (de hieu cach no hoat dong) ===
const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  const filePath = envPath || path.resolve(process.cwd(), '.env');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Bo qua comment va dong trong
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Parse key=value
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;

      const key = trimmed.slice(0, equalIndex).trim();
      let value = trimmed.slice(equalIndex + 1).trim();

      // Bo ngoac kep/ngoac don
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Xu ly escape characters
      value = value.replace(/\\n/g, '\n');
      value = value.replace(/\\r/g, '\r');
      value = value.replace(/\\t/g, '\t');

      // Chi set neu chua co (khong ghi de bien moi truong da ton tai)
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    console.log(`Da load ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`File ${filePath} khong ton tai`);
    } else {
      throw err;
    }
  }
}

// loadEnv(); // Load .env tu thu muc hien tai
// loadEnv('.env.local'); // Load tu file cu the

// === .gitignore - LUON LUON them .env ===
// .env
// .env.local
// .env.*.local

// === .env.example - Commit file nay de huong dan ===
// # Copy file nay thanh .env va dien gia tri that
// PORT=3000
// DB_HOST=
// DB_PORT=
// DB_NAME=
// DB_USER=
// DB_PASS=
// JWT_SECRET=
```

---

## 3. Standard I/O

### 3.1. process.stdout

```js
// process.stdout la Writable Stream ket noi voi terminal output

// === write() - Ghi truc tiep (khong them \n) ===
process.stdout.write('Hello ');
process.stdout.write('World');
process.stdout.write('\n');
// Output: Hello World

// console.log() thuc ra la wrapper cua process.stdout.write()
// console.log('Hello') tuong duong:
// process.stdout.write('Hello' + '\n');

// === Ghi ra stdout voi format ===
process.stdout.write(`PID: ${process.pid}\n`);

// === Kiem tra stdout co phai terminal khong ===
if (process.stdout.isTTY) {
  // Dang chay trong terminal
  console.log('Chay trong terminal');
  console.log('So cot:', process.stdout.columns);
  console.log('So dong:', process.stdout.rows);
} else {
  // Output dang bi pipe vao file/process khac
  // Vi du: node app.js > output.txt
  // Hoac: node app.js | grep "error"
  console.log('Output dang bi redirect');
}

// === Progress bar don gian ===
function showProgress(percent) {
  const width = 40;
  const filled = Math.round(width * percent / 100);
  const empty = width - filled;
  const bar = '#'.repeat(filled) + '-'.repeat(empty);
  process.stdout.write(`\r[${bar}] ${percent}%`);
  if (percent >= 100) process.stdout.write('\n');
}

// Demo progress
// let p = 0;
// const timer = setInterval(() => {
//   p += 5;
//   showProgress(p);
//   if (p >= 100) clearInterval(timer);
// }, 200);

// === Spinner animation ===
function createSpinner(message) {
  const frames = ['|', '/', '-', '\\'];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${message}`);
    i = (i + 1) % frames.length;
  }, 100);

  return {
    stop(finalMessage) {
      clearInterval(interval);
      process.stdout.write(`\r${finalMessage || message}\n`);
    },
  };
}

// const spinner = createSpinner('Dang xu ly...');
// setTimeout(() => spinner.stop('Da hoan thanh!'), 3000);
```

### 3.2. process.stderr

```js
// process.stderr la Writable Stream cho error output
// KHAC voi stdout: stderr KHONG bi buffer (ghi ngay lap tuc)

// === Ghi ra stderr ===
process.stderr.write('Loi: Khong the ket noi database\n');

// console.error() la wrapper cua process.stderr.write()
console.error('Loi nghiem trong!');

// === Tai sao tach stdout va stderr? ===
// De co the redirect rieng:
// node app.js > output.log 2> error.log
// stdout -> output.log
// stderr -> error.log

// Hoac chi xem error:
// node app.js > /dev/null 2>&1 | grep ERROR

// === Logger don gian ===
class Logger {
  static info(message) {
    process.stdout.write(`[INFO] ${new Date().toISOString()} ${message}\n`);
  }

  static warn(message) {
    process.stderr.write(`[WARN] ${new Date().toISOString()} ${message}\n`);
  }

  static error(message) {
    process.stderr.write(`[ERROR] ${new Date().toISOString()} ${message}\n`);
  }

  static debug(message) {
    if (process.env.DEBUG) {
      process.stdout.write(`[DEBUG] ${new Date().toISOString()} ${message}\n`);
    }
  }
}

Logger.info('Server started');
Logger.warn('Deprecated API called');
Logger.error('Database connection failed');
Logger.debug('Query: SELECT * FROM users');
```

### 3.3. process.stdin

```js
// process.stdin la Readable Stream doc input tu terminal

// === Doc tung dong tu terminal ===
process.stdin.setEncoding('utf8');

process.stdin.on('data', (data) => {
  const input = data.trim();
  console.log(`Ban nhap: "${input}"`);

  if (input === 'quit' || input === 'exit') {
    console.log('Tam biet!');
    process.exit(0);
  }
});

// === Doc input voi readline module ===
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Hoi 1 cau hoi
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function interview() {
  const name = await ask('Ten ban la gi? ');
  const age = await ask('Ban bao nhieu tuoi? ');
  const job = await ask('Nghe nghiep? ');

  console.log(`\nKet qua:`);
  console.log(`Ten: ${name}`);
  console.log(`Tuoi: ${age}`);
  console.log(`Nghe nghiep: ${job}`);

  rl.close();
}

// interview();

// === Interactive menu ===
function showMenu() {
  console.log('\n=== MENU ===');
  console.log('1. Xem danh sach');
  console.log('2. Them moi');
  console.log('3. Xoa');
  console.log('0. Thoat');
  console.log('============');
}

async function interactiveApp() {
  const items = [];

  while (true) {
    showMenu();
    const choice = await ask('Chon: ');

    switch (choice) {
      case '1':
        if (items.length === 0) {
          console.log('Danh sach trong');
        } else {
          items.forEach((item, i) => console.log(`${i + 1}. ${item}`));
        }
        break;
      case '2':
        const newItem = await ask('Nhap ten: ');
        items.push(newItem);
        console.log(`Da them: ${newItem}`);
        break;
      case '3':
        const index = parseInt(await ask('Nhap so thu tu: '), 10);
        if (index >= 1 && index <= items.length) {
          const removed = items.splice(index - 1, 1);
          console.log(`Da xoa: ${removed}`);
        } else {
          console.log('So thu tu khong hop le');
        }
        break;
      case '0':
        console.log('Tam biet!');
        rl.close();
        return;
      default:
        console.log('Lua chon khong hop le');
    }
  }
}

// interactiveApp();

// === Pipe stdin vao xu ly ===
// echo "Hello World" | node app.js
// cat input.txt | node app.js

if (!process.stdin.isTTY) {
  // Input tu pipe, khong phai terminal
  const chunks = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => {
    const input = Buffer.concat(chunks).toString('utf8');
    console.log('Nhan tu pipe:', input.trim());
    // Xu ly input...
  });
}
```

---

## 4. process Events

### 4.1. exit va beforeExit

```js
// === 'exit' event ===
// Emit khi process sap ket thuc
// KHONG THE chay async code trong handler nay!

process.on('exit', (code) => {
  console.log(`Process ket thuc voi code: ${code}`);
  // Chi co the chay synchronous code o day!

  // KHONG hoat dong:
  // setTimeout(() => console.log('Se khong bao gio chay'), 1000);
  // await someAsyncFn(); // Loi: khong the dung await
});

// === 'beforeExit' event ===
// Emit khi event loop trong TRUOC KHI exit
// CO THE chay async code (nhung can than infinite loop!)

process.on('beforeExit', (code) => {
  console.log(`beforeExit voi code: ${code}`);
  // Co the schedule them async work o day
  // NHUNG: neu schedule, event loop se chay tiep
  // va beforeExit co the emit lai -> INFINITE LOOP!
});

// LUU Y: 'beforeExit' KHONG emit khi:
// - Goi process.exit()
// - uncaughtException
// - unhandled signal

// === Vi du: Graceful cleanup ===
process.on('exit', (code) => {
  // Dong ket noi database (synchronous)
  // dbConnection.closeSync();

  // Ghi log cuoi cung
  const fs = require('fs');
  fs.appendFileSync('app.log',
    `[${new Date().toISOString()}] Process exited with code ${code}\n`
  );
});
```

### 4.2. uncaughtException

```js
// === 'uncaughtException' - Exception khong duoc catch ===
// Day la "luoi bao ve cuoi cung" truoc khi process crash

process.on('uncaughtException', (err, origin) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('Origin:', origin);
  // origin co the la:
  // 'uncaughtException' - Exception tu synchronous code
  // 'unhandledRejection' - Neu --unhandled-rejections=throw

  // QUAN TRONG: Sau uncaughtException, ung dung co the o trang thai
  // KHONG ON DINH. Nen:
  // 1. Log error
  // 2. Dong tai nguyen
  // 3. EXIT process

  // Ghi log
  const fs = require('fs');
  fs.appendFileSync('crash.log',
    `[${new Date().toISOString()}] ${err.stack}\n`
  );

  // Exit (bat buoc!)
  process.exit(1);
});

// Vi du tao uncaught exception:
// setTimeout(() => {
//   throw new Error('Loi bat ngo!');
// }, 1000);

// === CANH BAO ===
// KHONG BAO GIO tiep tuc chay ung dung sau uncaughtException!
// Ung dung co the o trang thai hong, data co the bi sai

// SAI:
process.on('uncaughtException', (err) => {
  console.error(err);
  // Khong exit => NGUY HIEM!
});

// DUNG:
process.on('uncaughtException', (err) => {
  console.error(err);
  // Cleanup va exit
  process.exit(1);
});
```

### 4.3. unhandledRejection

```js
// === 'unhandledRejection' - Promise bi reject ma khong co catch ===

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  // reason co the la Error object hoac bat ky gia tri nao

  // Tuong tu uncaughtException, nen exit
  // Tu Node.js 15+, unhandled rejection se TU DONG crash process
});

// Vi du tao unhandled rejection:
// Promise.reject(new Error('Promise loi!'));
// Hoac:
// async function foo() { throw new Error('Async loi!'); }
// foo(); // Khong co .catch() hoac try/catch

// === Xu ly dung cach ===
// Cach 1: Luon dung try/catch voi async/await
async function safeOperation() {
  try {
    await riskyAsyncFn();
  } catch (err) {
    console.error('Caught:', err.message);
  }
}

// Cach 2: Luon dung .catch() voi Promise
// riskyPromise().catch(err => console.error(err));

// === 'rejectionHandled' - Khi rejection duoc xu ly muon ===
process.on('rejectionHandled', (promise) => {
  console.log('Rejection da duoc xu ly (muon)');
});
```

### 4.4. warning

```js
// === 'warning' event ===
// Node.js phát ra cảnh bao khi co van de tiem an

process.on('warning', (warning) => {
  console.warn('=== CANH BAO ===');
  console.warn('Name:', warning.name);
  console.warn('Message:', warning.message);
  console.warn('Stack:', warning.stack);
});

// === Tao warning ===
process.emitWarning('Day la canh bao', 'MyWarning');
// Hoac chi tiet hon:
process.emitWarning('API nay se bi xoa trong v2.0', {
  type: 'DeprecationWarning',
  code: 'DEP0001',
  detail: 'Dung API moi thay the',
});

// === Cac loai warning pho bien ===
// DeprecationWarning - Dung API/tinh nang sap bi xoa
// ExperimentalWarning - Dung tinh nang thu nghiem
// MaxListenersExceededWarning - Event emitter co qua nhieu listeners
// TimeoutOverflowWarning - setTimeout/setInterval voi gia tri qua lon

// === Tat warning cu the ===
// node --no-warnings app.js            // Tat tat ca warnings
// node --no-deprecation app.js         // Tat deprecation warnings
// NODE_NO_WARNINGS=1 node app.js       // Tuong tu
```

### 4.5. Signal events (SIGTERM, SIGINT)

```js
// === Signals la gi? ===
// Signals la cach OS gui thong bao cho process
// Thuong dung de dieu khien lifecycle cua ung dung

// SIGINT (Signal Interrupt) - Ctrl+C trong terminal
process.on('SIGINT', () => {
  console.log('\nNhan SIGINT (Ctrl+C)');
  console.log('Dang dong ung dung...');

  // Cleanup
  // closeDatabase();
  // closeServer();

  process.exit(0);
});

// SIGTERM (Signal Terminate) - Kill "binh thuong"
// Docker, Kubernetes, PM2 gui SIGTERM khi can dung ung dung
process.on('SIGTERM', () => {
  console.log('Nhan SIGTERM');
  console.log('Graceful shutdown...');

  // Dong server truoc
  // server.close(() => {
  //   // Dong database
  //   db.close();
  //   process.exit(0);
  // });

  // Force exit sau 10 giay neu khong dong duoc
  setTimeout(() => {
    console.error('Force exit sau 10s');
    process.exit(1);
  }, 10000);
});

// SIGHUP (Signal Hangup) - Terminal dong hoac reload config
process.on('SIGHUP', () => {
  console.log('Nhan SIGHUP - Reload config');
  // reloadConfig();
});

// SIGUSR1, SIGUSR2 - User-defined signals
process.on('SIGUSR1', () => {
  console.log('SIGUSR1 - Custom action');
  // Vi du: In debug info
  console.log('Memory:', process.memoryUsage());
  console.log('Uptime:', process.uptime());
});

// === Vi du: Graceful shutdown day du ===
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello');
});

server.listen(3000, () => {
  console.log('Server chay tren port 3000');
});

function gracefulShutdown(signal) {
  console.log(`\nNhan ${signal}. Bat dau graceful shutdown...`);

  // 1. Ngung nhan ket noi moi
  server.close(() => {
    console.log('HTTP server da dong');

    // 2. Dong cac ket noi khac (DB, Redis, etc.)
    // await db.close();
    // await redis.quit();

    console.log('Da dong tat ca tai nguyen');
    process.exit(0);
  });

  // 3. Force exit neu mat qua lau
  const forceExitTimer = setTimeout(() => {
    console.error('Khong the dong sach. Force exit.');
    process.exit(1);
  }, 15000);

  // Khong de timer nay giu process song
  forceExitTimer.unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// === Gui signal tu ben ngoai ===
// kill -SIGTERM <pid>    # SIGTERM
// kill -SIGINT <pid>     # SIGINT
// kill -SIGUSR1 <pid>    # SIGUSR1
// kill -9 <pid>          # SIGKILL (KHONG BAT DUOC! Process bi kill ngay)

// === LUU Y ===
// SIGKILL va SIGSTOP KHONG THE bat duoc
// Windows KHONG ho tro signals nhu Linux/macOS
// Tren Windows: SIGTERM, SIGINT duoc gia lap
```

---

## 5. child_process Module

Module `child_process` cho phep tao va quan ly cac process con tu Node.js.

### 5.1. exec() - Chay command shell

`exec()` chay command trong **shell** (/bin/sh tren Linux, cmd.exe tren Windows), **buffer TOAN BO output** trong RAM roi tra ve callback.

```js
const { exec } = require('child_process');

// === Cu phap co ban ===
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error('Loi:', error.message);
    console.error('Exit code:', error.code);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  console.log('Output:', stdout);
});

// === Voi options ===
exec('ls -la', {
  cwd: '/home',              // Thu muc chay command
  env: { ...process.env, FOO: 'bar' }, // Bien moi truong
  shell: '/bin/bash',        // Shell cu the
  timeout: 10000,            // Timeout 10 giay
  maxBuffer: 1024 * 1024,    // Max buffer size (1MB, mac dinh)
  encoding: 'utf8',          // Encoding output
  // uid: 1000,              // User ID (Linux)
  // gid: 1000,              // Group ID (Linux)
}, (error, stdout, stderr) => {
  console.log(stdout);
});

// === Promise wrapper ===
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr) console.warn('Stderr:', stderr);
    return stdout.trim();
  } catch (err) {
    console.error(`Command that bai: ${cmd}`);
    console.error('Error:', err.message);
    throw err;
  }
}

// Su dung:
async function systemInfo() {
  const hostname = await runCommand('hostname');
  const uptime = await runCommand('uptime');
  const diskUsage = await runCommand('df -h /');

  console.log('Hostname:', hostname);
  console.log('Uptime:', uptime);
  console.log('Disk:', diskUsage);
}

// systemInfo();

// === CANH BAO VE BAO MAT ===
// exec() chay QUA SHELL => Co the bi COMMAND INJECTION!

// SAI - NGUY HIEM!
const userInput = 'hello; rm -rf /'; // Input doc hai!
// exec(`echo ${userInput}`);
// Se chay: echo hello; rm -rf / => XOA HET!

// DUNG - Dung execFile() hoac sanitize input
const { execFile } = require('child_process');
// execFile('echo', [userInput]); // An toan vi khong qua shell
```

### 5.2. execFile() - Chay file truc tiep

`execFile()` chay file truc tiep, **KHONG qua shell**, an toan hon `exec()`.

```js
const { execFile } = require('child_process');

// === Cu phap co ban ===
execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    console.error('Loi:', error.message);
    return;
  }
  console.log('Node version:', stdout.trim());
});

// === Chay script ===
execFile('node', ['script.js', '--flag', 'value'], {
  cwd: __dirname,
  timeout: 30000,
}, (error, stdout) => {
  console.log('Output:', stdout);
});

// === Promise wrapper ===
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

async function getGitInfo() {
  try {
    const { stdout: branch } = await execFileAsync('git', ['branch', '--show-current']);
    const { stdout: lastCommit } = await execFileAsync('git', ['log', '-1', '--oneline']);
    const { stdout: status } = await execFileAsync('git', ['status', '--porcelain']);

    return {
      branch: branch.trim(),
      lastCommit: lastCommit.trim(),
      isDirty: status.trim().length > 0,
    };
  } catch (err) {
    console.error('Khong phai git repo:', err.message);
    return null;
  }
}

// getGitInfo().then(console.log);

// === So sanh exec vs execFile ===
/*
| Dac diem     | exec()                     | execFile()             |
|-------------|---------------------------|-------------------------|
| Shell       | Chay QUA shell             | KHONG qua shell        |
| Bao mat     | Co nguy co injection       | An toan hon            |
| Pipe, &&    | Ho tro (vi co shell)       | Khong ho tro           |
| Performance | Cham hon (tao shell truoc) | Nhanh hon              |
| Khi nao dung| Can shell features         | Chay binary/script     |
*/
```

### 5.3. spawn() - Streaming cho output lon

`spawn()` tao child process va tra ve **streams** (khong buffer toan bo output). Phu hop cho command co output lon.

```js
const { spawn } = require('child_process');

// === Cu phap co ban ===
const child = spawn('ls', ['-la', '/home']);

// stdout la Readable Stream
child.stdout.on('data', (data) => {
  console.log('stdout:', data.toString());
});

// stderr la Readable Stream
child.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

// Khi process ket thuc
child.on('close', (code) => {
  console.log('Exit code:', code);
});

// Khi co loi khoi tao process
child.on('error', (err) => {
  console.error('Khong the chay command:', err.message);
});

// === spawn() voi options ===
const child2 = spawn('node', ['server.js'], {
  cwd: '/path/to/project',
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'pipe', // Mac dinh: pipe stdout/stderr
  // stdio: 'inherit', // Chia se stdin/stdout/stderr voi parent
  // stdio: 'ignore',  // Bo qua tat ca I/O
  // stdio: ['pipe', 'pipe', 'pipe'], // Chi tiet cho [stdin, stdout, stderr]
  shell: false, // Mac dinh: false (an toan)
  detached: false, // Mac dinh: false
});

// === Pipe output vao file ===
const fs = require('fs');
const output = fs.createWriteStream('output.log');
const errorLog = fs.createWriteStream('error.log');

const process3 = spawn('node', ['long-running-task.js']);
process3.stdout.pipe(output);
process3.stderr.pipe(errorLog);

// === Real-time output (inherit stdio) ===
// Output cua child hien thi TRUC TIEP tren terminal cua parent
const child4 = spawn('npm', ['install'], {
  stdio: 'inherit',
  cwd: '/path/to/project',
});

child4.on('close', (code) => {
  console.log('npm install hoan thanh voi code:', code);
});

// === Gui input vao child process ===
const child5 = spawn('cat'); // cat doc tu stdin

child5.stdout.on('data', (data) => {
  console.log('Cat output:', data.toString());
});

// Ghi vao stdin cua child
child5.stdin.write('Hello\n');
child5.stdin.write('World\n');
child5.stdin.end(); // Dong stdin

// === Chay command dai (video encoding) ===
function encodeVideo(input, output) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', input,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '22',
      '-y', // Ghi de file cu
      output,
    ]);

    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg ghi progress vao stderr
      const str = data.toString();
      const match = str.match(/time=(\d+:\d+:\d+\.\d+)/);
      if (match) {
        process.stdout.write(`\rProgress: ${match[1]}`);
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('\nEncode thanh cong!');
        resolve();
      } else {
        reject(new Error(`ffmpeg exit code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

// encodeVideo('input.mp4', 'output.mp4');

// === Kill child process ===
const longProcess = spawn('sleep', ['100']);

// Kill sau 5 giay
setTimeout(() => {
  longProcess.kill('SIGTERM'); // Graceful kill
  // longProcess.kill('SIGKILL'); // Force kill
}, 5000);

longProcess.on('close', (code, signal) => {
  console.log(`Process ket thuc: code=${code}, signal=${signal}`);
  // code=null, signal='SIGTERM'
});
```

### 5.4. fork() - Tao Node.js process moi voi IPC

`fork()` la cach dac biet cua `spawn()` danh rieng cho **Node.js**. No tu dong thiet lap kenh **IPC (Inter-Process Communication)** de parent va child co the gui message cho nhau.

```js
// ============================
// parent.js (Process cha)
// ============================
const { fork } = require('child_process');
const path = require('path');

// Fork tao 1 Node.js process moi chay file worker.js
const child = fork(path.join(__dirname, 'worker.js'));

// Gui message cho child
child.send({ type: 'TASK', data: { numbers: [1, 2, 3, 4, 5] } });

// Nhan message tu child
child.on('message', (message) => {
  console.log('[Parent] Nhan tu child:', message);

  if (message.type === 'RESULT') {
    console.log('[Parent] Ket qua:', message.data);
    child.kill(); // Dong child khi xong
  }
});

child.on('error', (err) => {
  console.error('[Parent] Child error:', err.message);
});

child.on('exit', (code) => {
  console.log('[Parent] Child exit voi code:', code);
});

// ============================
// worker.js (Process con)
// ============================
// process.on('message', (message) => {
//   console.log('[Worker] Nhan tu parent:', message);
//
//   if (message.type === 'TASK') {
//     // Tinh toan nang (chay trong process rieng, khong block parent)
//     const sum = message.data.numbers.reduce((a, b) => a + b, 0);
//
//     // Gui ket qua ve parent
//     process.send({ type: 'RESULT', data: sum });
//   }
// });

// === Vi du: Worker Pool voi fork() ===
class WorkerPool {
  constructor(workerScript, numWorkers) {
    this.workerScript = workerScript;
    this.workers = [];
    this.available = [];
    this.taskQueue = [];

    for (let i = 0; i < numWorkers; i++) {
      this.addWorker();
    }
  }

  addWorker() {
    const worker = fork(this.workerScript);
    worker.id = this.workers.length;

    worker.on('message', (result) => {
      // Worker hoan thanh, tra ket qua va nhan task moi
      if (worker.currentResolve) {
        worker.currentResolve(result);
        worker.currentResolve = null;
      }

      // Kiem tra co task cho khong
      if (this.taskQueue.length > 0) {
        const { task, resolve, reject } = this.taskQueue.shift();
        this.runOnWorker(worker, task, resolve, reject);
      } else {
        this.available.push(worker);
      }
    });

    worker.on('error', (err) => {
      console.error(`Worker ${worker.id} error:`, err.message);
      if (worker.currentReject) {
        worker.currentReject(err);
      }
    });

    this.workers.push(worker);
    this.available.push(worker);
  }

  runOnWorker(worker, task, resolve, reject) {
    worker.currentResolve = resolve;
    worker.currentReject = reject;
    worker.send(task);
  }

  execute(task) {
    return new Promise((resolve, reject) => {
      if (this.available.length > 0) {
        const worker = this.available.shift();
        this.runOnWorker(worker, task, resolve, reject);
      } else {
        // Khong co worker ranh, xep hang doi
        this.taskQueue.push({ task, resolve, reject });
      }
    });
  }

  async close() {
    for (const worker of this.workers) {
      worker.kill();
    }
  }
}

// Su dung:
// const pool = new WorkerPool('./heavy-task.js', 4); // 4 workers
// const result = await pool.execute({ input: 'data' });
// await pool.close();

// === fork() voi options ===
const child2 = fork('worker.js', ['arg1', 'arg2'], {
  cwd: __dirname,
  env: { ...process.env, WORKER_ID: '1' },
  execArgv: ['--max-old-space-size=512'], // V8 options cho child
  silent: false, // true = pipe stdout/stderr thay vi inherit
});
```

### 5.5. So sanh exec vs spawn vs fork

```
+===========+================+================+==================+
| Dac diem  | exec()         | spawn()        | fork()            |
+===========+================+================+==================+
| Output    | Buffer toan bo | Stream         | Stream + IPC      |
| Shell     | Co             | Khong (mac dinh)| Khong             |
| Muc dich  | Command ngan   | Command dai    | Node.js worker    |
| Max output| maxBuffer (1MB)| Khong gioi han | Khong gioi han    |
| IPC       | Khong          | Khong          | Co (tu dong)      |
| Bao mat   | Injection risk | An toan hon    | An toan           |
+===========+================+================+==================+

Khi nao dung gi?

exec():
  - Chay command don gian, output nho
  - Can shell features (pipe, &&, ||, *, ~)
  - Vi du: exec('ls -la | grep ".js"')

spawn():
  - Command co output lon (log, video encode)
  - Can real-time output
  - Can stream du lieu
  - Vi du: spawn('ffmpeg', [...args])

fork():
  - Chay Node.js script rieng
  - Can giao tiep 2 chieu (IPC)
  - CPU-intensive tasks
  - Worker pool
  - Vi du: fork('./compute-heavy-task.js')
```

```js
// === Tong hop vi du ===
const { exec, execFile, spawn, fork } = require('child_process');

// exec - Chay command shell don gian
exec('echo "Hello" && date', (err, stdout) => {
  console.log('exec:', stdout.trim());
});

// execFile - Chay binary/script truc tiep
execFile('node', ['--version'], (err, stdout) => {
  console.log('execFile:', stdout.trim());
});

// spawn - Stream output
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => {
  console.log('spawn:', data.toString());
});

// fork - Node.js worker voi IPC
// const worker = fork('./worker.js');
// worker.send({ task: 'compute' });
// worker.on('message', (result) => console.log('fork:', result));
```

---

## 6. Cluster Module

### 6.1. Master/Worker pattern

Node.js la **single-threaded**. Cluster module cho phep tao nhieu process cung lang nghe tren 1 port, tan dung **nhieu CPU cores**.

```js
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  // === MASTER PROCESS ===
  console.log(`Master ${process.pid} dang chay`);
  console.log(`So CPU cores: ${numCPUs}`);

  // Fork workers (1 worker cho moi CPU core)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Khi worker bi crash, tao worker moi thay the
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} da chet (code: ${code}, signal: ${signal})`);
    console.log('Tao worker moi...');
    cluster.fork();
  });

  // Theo doi worker online
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} da san sang`);
  });

  // Nhan message tu worker
  cluster.on('message', (worker, message) => {
    console.log(`Master nhan tu worker ${worker.process.pid}:`, message);
  });

  console.log('Tong workers:', Object.keys(cluster.workers).length);

} else {
  // === WORKER PROCESS ===
  // Moi worker la 1 process rieng biet, co the xu ly request doc lap

  const server = http.createServer((req, res) => {
    // Moi request duoc xu ly boi 1 worker bat ky
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      pid: process.pid,
      message: 'Hello tu worker!',
    }));
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} dang listen tren port 3000`);
  });

  // Gui message cho master
  process.send({ type: 'READY', pid: process.pid });
}
```

### 6.2. Load Balancing

```js
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} khoi dong ${numCPUs} workers`);

  // Tao workers
  const workers = [];
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork({ WORKER_ID: i });
    workers.push(worker);
  }

  // === Graceful Restart (Zero Downtime) ===
  function restartWorkers() {
    let i = 0;

    function restartNext() {
      if (i >= workers.length) return;

      const worker = workers[i];
      console.log(`Restarting worker ${worker.process.pid}...`);

      // Tao worker moi TRUOC
      const newWorker = cluster.fork({ WORKER_ID: i });
      workers[i] = newWorker;

      newWorker.on('listening', () => {
        // Worker moi da san sang, tat worker cu
        worker.kill('SIGTERM');
        i++;
        restartNext();
      });
    }

    restartNext();
  }

  // Restart khi nhan SIGUSR2
  process.on('SIGUSR2', () => {
    console.log('Nhan SIGUSR2 - Restart workers...');
    restartWorkers();
  });

  // Thay the worker crash
  cluster.on('exit', (worker, code, signal) => {
    if (signal !== 'SIGTERM') {
      // Chi restart neu khong phai kill co y dinh
      console.log(`Worker ${worker.process.pid} crash. Restarting...`);
      const index = workers.indexOf(worker);
      if (index !== -1) {
        workers[index] = cluster.fork({ WORKER_ID: index });
      }
    }
  });

  // === Thong ke ===
  setInterval(() => {
    const workerPids = Object.values(cluster.workers).map(w => w.process.pid);
    console.log(`Active workers: ${workerPids.join(', ')}`);
  }, 30000);

} else {
  // Worker
  const workerId = process.env.WORKER_ID;

  http.createServer((req, res) => {
    // Gia lap xu ly nang
    let sum = 0;
    for (let i = 0; i < 1e6; i++) sum += i;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      worker: workerId,
      pid: process.pid,
      sum,
    }));
  }).listen(3000);

  console.log(`Worker ${workerId} (PID: ${process.pid}) san sang`);
}
```

### 6.3. PM2 concept

PM2 la process manager cho Node.js, cung cap cluster mode + nhieu tinh nang quan ly.

```js
// === Cai dat PM2 ===
// npm install -g pm2

// === Su dung co ban ===
// pm2 start app.js                    # Chay 1 instance
// pm2 start app.js -i max             # Cluster mode (tat ca CPU cores)
// pm2 start app.js -i 4               # 4 instances
// pm2 start app.js --name "my-app"    # Dat ten

// === Quan ly ===
// pm2 list                            # Xem danh sach process
// pm2 stop my-app                     # Dung
// pm2 restart my-app                  # Restart
// pm2 reload my-app                   # Zero-downtime restart
// pm2 delete my-app                   # Xoa

// === Monitoring ===
// pm2 monit                           # Dashboard realtime
// pm2 logs                            # Xem logs
// pm2 logs --lines 100                # 100 dong log cuoi

// === ecosystem.config.js ===
// Tao file cau hinh cho PM2
module.exports = {
  apps: [
    {
      name: 'my-api',
      script: './src/server.js',
      instances: 'max',              // Hoac so cu the: 4
      exec_mode: 'cluster',         // Cluster mode
      watch: false,                  // Khong watch file changes
      max_memory_restart: '1G',     // Restart neu dung > 1GB RAM
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      // Log
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

// Chay:
// pm2 start ecosystem.config.js
// pm2 start ecosystem.config.js --env production
```

---

## 7. Worker Threads

### 7.1. Tao Worker Thread

Worker Threads cho phep chay JavaScript trong **thread rieng** (cung process), chia se bo nho qua SharedArrayBuffer. Nhe hon cluster vi khong tao process moi.

```js
// ============================
// main.js
// ============================
const { Worker, isMainThread, workerData } = require('worker_threads');
const path = require('path');

if (isMainThread) {
  // Main thread
  console.log('Main thread PID:', process.pid);

  // Tao worker thread
  const worker = new Worker(path.join(__dirname, 'thread-worker.js'), {
    workerData: {
      start: 1,
      end: 1000000,
    },
  });

  // Nhan message tu worker
  worker.on('message', (result) => {
    console.log('Ket qua tu worker:', result);
  });

  // Worker co loi
  worker.on('error', (err) => {
    console.error('Worker error:', err.message);
  });

  // Worker ket thuc
  worker.on('exit', (code) => {
    console.log('Worker exit voi code:', code);
    if (code !== 0) {
      console.error('Worker that bai');
    }
  });
}

// ============================
// thread-worker.js
// ============================
// const { parentPort, workerData } = require('worker_threads');
//
// const { start, end } = workerData;
//
// // Tinh toan nang (chay trong thread rieng)
// let sum = 0;
// for (let i = start; i <= end; i++) {
//   sum += i;
// }
//
// // Gui ket qua ve main thread
// parentPort.postMessage({ sum, range: `${start}-${end}` });
```

### 7.2. workerData va parentPort

```js
// ============================
// main.js - Truyen du lieu va giao tiep 2 chieu
// ============================
const { Worker } = require('worker_threads');
const path = require('path');

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'processor.js'), {
      workerData: data,
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exit code ${code}`));
      }
    });
  });
}

// Su dung:
async function main() {
  console.log('Bat dau xu ly...');

  // Chay nhieu worker song song
  const results = await Promise.all([
    runWorker({ task: 'fibonacci', n: 40 }),
    runWorker({ task: 'primes', limit: 1000000 }),
    runWorker({ task: 'sort', data: Array.from({ length: 1000000 }, () => Math.random()) }),
  ]);

  console.log('Tat ca ket qua:', results);
}

// main();

// ============================
// processor.js - Worker xu ly nhieu loai task
// ============================
const { parentPort, workerData } = require('worker_threads');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function findPrimes(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i <= Math.sqrt(limit); i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  return sieve.filter(Boolean).length;
}

// Xu ly theo loai task
const { task } = workerData;

switch (task) {
  case 'fibonacci':
    parentPort.postMessage({
      task,
      result: fibonacci(workerData.n),
    });
    break;

  case 'primes':
    parentPort.postMessage({
      task,
      result: findPrimes(workerData.limit),
    });
    break;

  case 'sort':
    const sorted = workerData.data.sort((a, b) => a - b);
    parentPort.postMessage({
      task,
      result: `Sorted ${sorted.length} items`,
    });
    break;

  default:
    parentPort.postMessage({ error: `Unknown task: ${task}` });
}

// ============================
// Giao tiep 2 chieu (ongoing communication)
// ============================
// main.js
const { Worker: W } = require('worker_threads');

// const worker = new W('./calculator.js');
//
// // Gui nhieu phep tinh
// worker.postMessage({ op: 'add', a: 10, b: 20 });
// worker.postMessage({ op: 'multiply', a: 5, b: 6 });
// worker.postMessage({ op: 'done' });
//
// worker.on('message', (result) => {
//   if (result.done) {
//     console.log('Worker hoan thanh');
//     worker.terminate();
//   } else {
//     console.log(`${result.op}: ${result.result}`);
//   }
// });

// calculator.js
// const { parentPort } = require('worker_threads');
//
// parentPort.on('message', (msg) => {
//   if (msg.op === 'done') {
//     parentPort.postMessage({ done: true });
//     return;
//   }
//
//   let result;
//   switch (msg.op) {
//     case 'add': result = msg.a + msg.b; break;
//     case 'multiply': result = msg.a * msg.b; break;
//     default: result = 'Unknown operation';
//   }
//
//   parentPort.postMessage({ op: msg.op, result });
// });
```

### 7.3. MessageChannel

```js
const { Worker, MessageChannel } = require('worker_threads');

// MessageChannel tao 1 cap port de giao tiep truc tiep
// giua 2 worker (khong can qua main thread)

// main.js
function createConnectedWorkers() {
  const { port1, port2 } = new MessageChannel();

  // Worker 1 gui du lieu qua port1
  const worker1 = new Worker(`
    const { parentPort, workerData } = require('worker_threads');
    const port = workerData.port;

    // Nhan du lieu tu main thread
    parentPort.on('message', (msg) => {
      // Xu ly va gui ket qua qua MessageChannel den worker2
      port.postMessage({ processed: msg.data * 2 });
    });
  `, {
    eval: true,
    workerData: { port: port1 },
    transferList: [port1], // Transfer ownership cua port1
  });

  // Worker 2 nhan du lieu tu port2
  const worker2 = new Worker(`
    const { parentPort, workerData } = require('worker_threads');
    const port = workerData.port;

    // Nhan du lieu truc tiep tu worker1 (qua MessageChannel)
    port.on('message', (msg) => {
      parentPort.postMessage({ finalResult: msg.processed + 10 });
    });
  `, {
    eval: true,
    workerData: { port: port2 },
    transferList: [port2],
  });

  return { worker1, worker2 };
}

// const { worker1, worker2 } = createConnectedWorkers();
// worker1.postMessage({ data: 5 });
// worker2.on('message', (result) => {
//   console.log('Final result:', result); // { finalResult: 20 }
//   // 5 * 2 = 10 (worker1) + 10 = 20 (worker2)
// });
```

### 7.4. SharedArrayBuffer

```js
const { Worker, isMainThread } = require('worker_threads');

// SharedArrayBuffer cho phep NHIEU THREAD chia se bo nho
// CANH BAO: Can tu xu ly synchronization (race conditions)

if (isMainThread) {
  // Tao vung nho chia se (4 so Int32 = 16 bytes)
  const sharedBuffer = new SharedArrayBuffer(16);
  const sharedArray = new Int32Array(sharedBuffer);

  // Khoi tao gia tri
  sharedArray[0] = 0; // Counter

  console.log('Truoc:', sharedArray[0]);

  // Tao 4 workers, moi worker tang counter 1000 lan
  const workers = [];
  for (let i = 0; i < 4; i++) {
    const worker = new Worker(`
      const { workerData } = require('worker_threads');
      const sharedArray = new Int32Array(workerData.sharedBuffer);

      for (let i = 0; i < 1000; i++) {
        // Dung Atomics de tranh race condition
        Atomics.add(sharedArray, 0, 1);
      }
    `, {
      eval: true,
      workerData: { sharedBuffer },
    });
    workers.push(worker);
  }

  // Doi tat ca workers hoan thanh
  Promise.all(workers.map(w => new Promise(r => w.on('exit', r)))).then(() => {
    console.log('Sau:', sharedArray[0]); // CHINH XAC: 4000
    // Neu khong dung Atomics, ket qua co the < 4000 (race condition)
  });
}

// === Atomics API ===
// const sharedArray = new Int32Array(sharedBuffer);
// Atomics.add(sharedArray, index, value)     // array[index] += value
// Atomics.sub(sharedArray, index, value)     // array[index] -= value
// Atomics.load(sharedArray, index)           // Doc gia tri
// Atomics.store(sharedArray, index, value)   // Ghi gia tri
// Atomics.compareExchange(arr, i, expected, replacement)
// Atomics.wait(sharedArray, index, value)    // Block cho den khi thay doi
// Atomics.notify(sharedArray, index, count)  // Danh thuc thread dang wait
```

### 7.5. So sanh Cluster vs Worker Threads

```
+=================+========================+==========================+
| Dac diem        | Cluster                | Worker Threads           |
+=================+========================+==========================+
| Don vi          | Process (nang)         | Thread (nhe)             |
| Bo nho          | Rieng biet             | Co the chia se (Shared)  |
| Giao tiep       | IPC (cham hon)         | postMessage (nhanh hon)  |
| Crash           | Khong anh huong nhau   | Co the anh huong nhau    |
| Port sharing    | Nhieu process 1 port   | Khong tu dong            |
| Use case        | HTTP server scaling    | CPU-intensive tasks      |
| npm support     | PM2, cluster module    | worker_threads module    |
+=================+========================+==========================+

Khi nao dung Cluster:
  - Scale HTTP server tren nhieu CPU
  - Can process isolation (crash 1 worker khong anh huong worker khac)
  - Dung voi PM2

Khi nao dung Worker Threads:
  - CPU-intensive computation (image processing, crypto, data processing)
  - Can chia se bo nho (SharedArrayBuffer)
  - Khong can process isolation
  - Task ngan nhung nang (parse JSON lon, sort, encrypt)
```

```js
// === Vi du: So sanh performance ===
const { Worker, isMainThread } = require('worker_threads');
const cluster = require('cluster');

// CPU-intensive task
function heavyTask(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }
  return sum;
}

// === Chay tuan tu (khong parallel) ===
function sequential() {
  console.time('Sequential');
  for (let i = 0; i < 4; i++) {
    heavyTask(10000000);
  }
  console.timeEnd('Sequential');
}

// === Chay voi Worker Threads (parallel) ===
async function withWorkerThreads() {
  console.time('Worker Threads');

  const workers = Array.from({ length: 4 }, () =>
    new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        let sum = 0;
        for (let i = 0; i < 10000000; i++) {
          sum += Math.sqrt(i) * Math.sin(i);
        }
        parentPort.postMessage(sum);
      `, { eval: true });

      worker.on('message', resolve);
      worker.on('error', reject);
    })
  );

  await Promise.all(workers);
  console.timeEnd('Worker Threads');
}

// sequential();      // ~2000ms
// withWorkerThreads(); // ~600ms (tren may 4 cores)
```

---

## 8. Memory Management

### 8.1. process.memoryUsage()

```js
// === process.memoryUsage() ===
const memory = process.memoryUsage();
console.log(memory);
// {
//   rss: 30000000,        // Resident Set Size - Tong RAM process dung
//   heapTotal: 7000000,   // Tong bo nho V8 heap da cap phat
//   heapUsed: 5000000,    // Bo nho V8 heap dang su dung
//   external: 1000000,    // Bo nho cua C++ objects (vd: Buffers)
//   arrayBuffers: 500000  // Bo nho cua SharedArrayBuffer/ArrayBuffer
// }

// === Hien thi dep hon ===
function formatMemory(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function logMemory(label = '') {
  const mem = process.memoryUsage();
  console.log(`\n=== Memory ${label} ===`);
  console.log(`RSS:          ${formatMemory(mem.rss)}`);
  console.log(`Heap Total:   ${formatMemory(mem.heapTotal)}`);
  console.log(`Heap Used:    ${formatMemory(mem.heapUsed)}`);
  console.log(`External:     ${formatMemory(mem.external)}`);
  console.log(`ArrayBuffers: ${formatMemory(mem.arrayBuffers)}`);
}

logMemory('Ban dau');

// === Giai thich ===
/*
RSS (Resident Set Size):
  - TONG bo nho RAM ma process su dung
  - Bao gom: heap, stack, code, shared libraries
  - Day la con so OS nhin thay

Heap Total:
  - Tong bo nho V8 da YEU CAU tu OS cho heap
  - Co the LON HON heapUsed (vi co phan chua dung)

Heap Used:
  - Bo nho V8 heap DANG SU DUNG
  - Chua JavaScript objects, strings, closures
  - Day la con so quan trong nhat de theo doi

External:
  - Bo nho cap phat boi C++ code
  - Chu yeu la Buffer objects
  - Khong nam trong V8 heap

ArrayBuffers:
  - Bo nho cua ArrayBuffer va SharedArrayBuffer
  - Subset cua External
*/

// === Theo doi memory theo thoi gian ===
function monitorMemory(intervalMs = 5000) {
  let prevHeapUsed = process.memoryUsage().heapUsed;

  const timer = setInterval(() => {
    const mem = process.memoryUsage();
    const diff = mem.heapUsed - prevHeapUsed;
    const sign = diff >= 0 ? '+' : '';

    console.log(
      `[Memory] Heap: ${formatMemory(mem.heapUsed)} (${sign}${formatMemory(diff)}) | ` +
      `RSS: ${formatMemory(mem.rss)}`
    );

    prevHeapUsed = mem.heapUsed;
  }, intervalMs);

  return () => clearInterval(timer); // Tra ve ham de dung monitor
}

// const stopMonitor = monitorMemory(3000);
// setTimeout(stopMonitor, 60000); // Dung sau 60 giay

// === V8 heap statistics chi tiet ===
const v8 = require('v8');

function logHeapStats() {
  const stats = v8.getHeapStatistics();
  console.log('\n=== V8 Heap Statistics ===');
  console.log(`Total heap size:      ${formatMemory(stats.total_heap_size)}`);
  console.log(`Used heap size:       ${formatMemory(stats.used_heap_size)}`);
  console.log(`Heap size limit:      ${formatMemory(stats.heap_size_limit)}`);
  console.log(`Total available:      ${formatMemory(stats.total_available_size)}`);
  console.log(`Malloced memory:      ${formatMemory(stats.malloced_memory)}`);
  console.log(`Peak malloced:        ${formatMemory(stats.peak_malloced_memory)}`);
  console.log(`GC collections:       ${stats.number_of_native_contexts}`);
  // heap_size_limit mac dinh ~1.7GB tren 64-bit
  // Tang bang: node --max-old-space-size=4096 app.js (4GB)
}

logHeapStats();
```

### 8.2. Phat hien Memory Leak

```js
// === Cac dau hieu memory leak ===
// 1. heapUsed tang lien tuc theo thoi gian
// 2. RSS tang va khong giam sau GC
// 3. "JavaScript heap out of memory" error

// === Nguyen nhan pho bien ===

// 1. Global variables
// SAI:
// global.cache = {}; // Cache tang mai!

// 2. Event listeners khong bi xoa
// SAI:
// setInterval(() => {
//   eventEmitter.on('data', handler); // Them listener moi moi 1 giay!
// }, 1000);

// 3. Closures giu reference
function createLeak() {
  const bigData = new Array(1000000).fill('x');
  return function() {
    // Closure giu reference den bigData
    // bigData khong bao gio duoc GC
    console.log(bigData.length);
  };
}

// 4. Chua clear timers
// const timers = [];
// for (let i = 0; i < 1000; i++) {
//   timers.push(setInterval(() => {}, 1000));
//   // Phai clear: timers.forEach(clearInterval)
// }

// === Tool phat hien ===

// 1. Dung --inspect va Chrome DevTools
// node --inspect app.js
// Mo chrome://inspect trong Chrome
// Chon "Open dedicated DevTools for Node"
// Tab Memory -> Take heap snapshot -> So sanh

// 2. Dung process.memoryUsage() + alerting
function memoryLeakDetector(options = {}) {
  const {
    checkInterval = 30000,  // Kiem tra moi 30 giay
    heapGrowthThreshold = 50 * 1024 * 1024, // Bao dong neu tang > 50MB
    rssThreshold = 500 * 1024 * 1024, // Bao dong neu RSS > 500MB
  } = options;

  let lastHeapUsed = process.memoryUsage().heapUsed;
  let consecutiveGrowth = 0;

  const timer = setInterval(() => {
    const mem = process.memoryUsage();
    const growth = mem.heapUsed - lastHeapUsed;

    if (growth > 0) {
      consecutiveGrowth++;
    } else {
      consecutiveGrowth = 0;
    }

    // Canh bao neu heap tang lien tuc
    if (consecutiveGrowth >= 5) {
      console.warn(`[MEMORY WARNING] Heap tang lien tuc ${consecutiveGrowth} lan`);
      console.warn(`  Heap: ${formatMemory(mem.heapUsed)}`);
    }

    // Canh bao neu tang nhieu
    if (growth > heapGrowthThreshold) {
      console.warn(`[MEMORY WARNING] Heap tang ${formatMemory(growth)} trong ${checkInterval}ms`);
    }

    // Canh bao neu RSS qua lon
    if (mem.rss > rssThreshold) {
      console.error(`[MEMORY CRITICAL] RSS = ${formatMemory(mem.rss)} > ${formatMemory(rssThreshold)}`);
    }

    lastHeapUsed = mem.heapUsed;
  }, checkInterval);

  return () => clearInterval(timer);
}

// const stopDetector = memoryLeakDetector();

// 3. Force Garbage Collection (chi dung de debug)
// Chay: node --expose-gc app.js
// if (global.gc) {
//   global.gc(); // Force GC
//   logMemory('Sau GC');
// }

function formatMemory(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
```

---

## 9. Performance Hooks

### 9.1. perf_hooks module

```js
const {
  performance,
  PerformanceObserver,
  monitorEventLoopDelay,
} = require('perf_hooks');

// === performance.now() - Thoi gian chinh xac ===
const start = performance.now();
// Lam gi do...
let sum = 0;
for (let i = 0; i < 1000000; i++) sum += i;
const end = performance.now();
console.log(`Thoi gian: ${(end - start).toFixed(3)}ms`);

// === performance.mark() va performance.measure() ===
// Tao "marks" (moc thoi gian) va "measures" (do khoang cach)

performance.mark('start-task');

// Task 1
for (let i = 0; i < 500000; i++) Math.sqrt(i);
performance.mark('after-task1');

// Task 2
for (let i = 0; i < 500000; i++) Math.sin(i);
performance.mark('after-task2');

// Do thoi gian
performance.measure('Task 1', 'start-task', 'after-task1');
performance.measure('Task 2', 'after-task1', 'after-task2');
performance.measure('Total', 'start-task', 'after-task2');

// Lay ket qua
const measures = performance.getEntriesByType('measure');
for (const entry of measures) {
  console.log(`${entry.name}: ${entry.duration.toFixed(3)}ms`);
}

// Don dep
performance.clearMarks();
performance.clearMeasures();
```

### 9.2. PerformanceObserver

```js
const { performance, PerformanceObserver } = require('perf_hooks');

// === PerformanceObserver - Theo doi performance events ===
const obs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  for (const entry of entries) {
    console.log(`[Perf] ${entry.name}: ${entry.duration.toFixed(3)}ms`);
  }
});

// Theo doi measures
obs.observe({ entryTypes: ['measure'], buffered: true });

// Tao marks va measures
performance.mark('A');
setTimeout(() => {
  performance.mark('B');
  performance.measure('A to B', 'A', 'B');
}, 100);

// === Theo doi GC (Garbage Collection) ===
const gcObs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  for (const entry of entries) {
    console.log(`[GC] ${entry.kind === 1 ? 'Minor' : 'Major'} GC: ${entry.duration.toFixed(3)}ms`);
    // kind: 1 = Scavenge (minor), 2 = Mark-Sweep-Compact (major)
  }
});

// Chu y: Can --perf-basic-prof hoac PerformanceObserver
try {
  gcObs.observe({ entryTypes: ['gc'] });
} catch (err) {
  // Khong ho tro tren moi phien ban
}

// === Monitor Event Loop Delay ===
const { monitorEventLoopDelay: monitorELD } = require('perf_hooks');

const h = monitorELD({ resolution: 20 }); // Do moi 20ms
h.enable();

setInterval(() => {
  console.log('\n=== Event Loop Delay ===');
  console.log(`Min:     ${(h.min / 1e6).toFixed(3)}ms`);   // Nanoseconds -> ms
  console.log(`Max:     ${(h.max / 1e6).toFixed(3)}ms`);
  console.log(`Mean:    ${(h.mean / 1e6).toFixed(3)}ms`);
  console.log(`Stddev:  ${(h.stddev / 1e6).toFixed(3)}ms`);
  console.log(`P50:     ${(h.percentile(50) / 1e6).toFixed(3)}ms`);
  console.log(`P99:     ${(h.percentile(99) / 1e6).toFixed(3)}ms`);

  // Canh bao neu event loop bi delay
  if (h.mean / 1e6 > 100) {
    console.warn('CANH BAO: Event loop delay > 100ms!');
  }

  h.reset(); // Reset de do chu ky tiep
}, 10000);
```

### 9.3. Do performance cua function

```js
const { performance, PerformanceObserver } = require('perf_hooks');

// === timerify() - Tu dong do thoi gian cua function ===
function slowFunction() {
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.random();
  }
  return result;
}

// Wrap function voi timerify
const timedFn = performance.timerify(slowFunction);

// Observer se tu dong log thoi gian
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(3)}ms`);
  }
});
obs.observe({ entryTypes: ['function'] });

timedFn(); // Tu dong log thoi gian

// === Custom performance measurement utility ===
function measureAsync(name, fn) {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      console.log(`[Perf] ${name}: ${duration.toFixed(3)}ms`);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      console.log(`[Perf] ${name}: ${duration.toFixed(3)}ms (FAILED)`);
      throw err;
    }
  };
}

function measureSync(name, fn) {
  return (...args) => {
    const start = performance.now();
    try {
      const result = fn(...args);
      const duration = performance.now() - start;
      console.log(`[Perf] ${name}: ${duration.toFixed(3)}ms`);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      console.log(`[Perf] ${name}: ${duration.toFixed(3)}ms (FAILED)`);
      throw err;
    }
  };
}

// Su dung:
const measuredSort = measureSync('Array.sort', (arr) => arr.sort());
const bigArray = Array.from({ length: 1000000 }, () => Math.random());
measuredSort(bigArray);

// === Benchmark utility ===
function benchmark(name, fn, iterations = 1000) {
  // Warm up
  for (let i = 0; i < 10; i++) fn();

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const total = times.reduce((s, t) => s + t, 0);

  console.log(`\n=== Benchmark: ${name} ===`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Total:      ${total.toFixed(3)}ms`);
  console.log(`Mean:       ${(total / iterations).toFixed(3)}ms`);
  console.log(`Median:     ${times[Math.floor(iterations / 2)].toFixed(3)}ms`);
  console.log(`Min:        ${times[0].toFixed(3)}ms`);
  console.log(`Max:        ${times[iterations - 1].toFixed(3)}ms`);
  console.log(`P95:        ${times[Math.floor(iterations * 0.95)].toFixed(3)}ms`);
  console.log(`P99:        ${times[Math.floor(iterations * 0.99)].toFixed(3)}ms`);
  console.log(`Ops/sec:    ${Math.round(1000 / (total / iterations))}`);
}

// So sanh 2 cach noi string
benchmark('String concat (+)', () => {
  let s = '';
  for (let i = 0; i < 100; i++) s += 'hello';
}, 10000);

benchmark('Array.join', () => {
  const arr = [];
  for (let i = 0; i < 100; i++) arr.push('hello');
  arr.join('');
}, 10000);
```

---

## 10. Cac loi thuong gap

### Loi 1: Khong bat uncaughtException

```js
// SAI - Process crash ma khong biet tai sao
setTimeout(() => {
  throw new Error('Loi bat ngo');
}, 1000);
// => Process crash, khong co log!

// DUNG
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err);
  // Log, alert, roi exit
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
```

### Loi 2: Dung process.exit() qua som

```js
// SAI - Async operations chua hoan thanh
const fs = require('fs');
fs.writeFile('data.txt', 'Important data', () => {
  console.log('Da ghi');
});
process.exit(0); // writeFile chua chay xong!

// DUNG
fs.writeFile('data.txt', 'Important data', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Da ghi');
  process.exit(0);
});
```

### Loi 3: exec() voi input tu user (Command Injection)

```js
const { exec, execFile } = require('child_process');

// SAI - NGUY HIEM!
const filename = 'file.txt; rm -rf /';
// exec(`cat ${filename}`);
// Chay: cat file.txt; rm -rf /  => XOA HET!

// DUNG - Dung execFile (khong qua shell)
execFile('cat', [filename], (err, stdout) => {
  // An toan: "cat" nhan "file.txt; rm -rf /" nhu 1 ten file
  // => Error: No such file => Khong nguy hiem
});
```

### Loi 4: Khong xu ly worker errors

```js
const { Worker } = require('worker_threads');

// SAI - Khong bat error
const worker = new Worker('./task.js');
// Neu task.js throw error => unhandled

// DUNG
const worker2 = new Worker('./task.js');
worker2.on('error', (err) => {
  console.error('Worker error:', err.message);
});
worker2.on('exit', (code) => {
  if (code !== 0) {
    console.error('Worker exit with code:', code);
  }
});
```

### Loi 5: Memory leak voi event listeners

```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

// SAI - Them listener trong vong lap
// setInterval(() => {
//   emitter.on('data', (data) => console.log(data));
//   // Moi 1 giay them 1 listener => LEAK!
// }, 1000);
// => Warning: MaxListenersExceededWarning

// DUNG
const handler = (data) => console.log(data);
emitter.on('data', handler); // Chi them 1 lan

// Hoac dung once neu chi can 1 lan
emitter.once('data', handler);
```

### Loi 6: Quen tat timer/interval

```js
// SAI - interval tiep tuc chay du khong can nua
// const timer = setInterval(() => {
//   console.log('Running...');
// }, 1000);
// // Quen clearInterval(timer) => process khong bao gio thoat!

// DUNG
const timer = setInterval(() => {
  console.log('Running...');
}, 1000);

// Dung khi can
process.on('SIGTERM', () => {
  clearInterval(timer);
  process.exit(0);
});

// Hoac dung unref() de khong giu process song
// timer.unref();
```

---

## 11. Best Practices

### 1. Graceful shutdown

```js
async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  // 1. Ngung nhan request moi
  server.close();

  // 2. Doi request hien tai hoan thanh (timeout 10s)
  await Promise.race([
    new Promise(r => server.on('close', r)),
    new Promise(r => setTimeout(r, 10000)),
  ]);

  // 3. Dong ket noi database
  // await db.close();

  // 4. Dong cac tai nguyen khac
  // await redis.quit();

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 2. Environment configuration

```js
// Tao file config.js de quan ly tat ca config
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'myapp',
  },
};

// Validate config khi khoi dong
function validateConfig(cfg) {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME'];
  if (cfg.nodeEnv === 'production') {
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Thieu bien moi truong: ${key}`);
      }
    }
  }
}

// validateConfig(config);
module.exports = config;
```

### 3. Su dung Worker Threads cho CPU-intensive tasks

```js
// Dung co chay CPU-intensive code trong main thread
// => Block event loop => Ung dung khong respond duoc!

// SAI
app.get('/fibonacci/:n', (req, res) => {
  const result = fibonacci(parseInt(req.params.n)); // BLOCK!
  res.json({ result });
});

// DUNG
const { Worker } = require('worker_threads');
app.get('/fibonacci/:n', async (req, res) => {
  const result = await runInWorker(parseInt(req.params.n));
  res.json({ result });
});
```

### 4. Monitor process health

```js
// Health check endpoint
function getHealthInfo() {
  const mem = process.memoryUsage();
  return {
    status: 'ok',
    uptime: process.uptime(),
    pid: process.pid,
    memory: {
      rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
    },
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}
```

### 5. Dung cluster cho production

```js
// Luon chay cluster mode trong production
// Hoac don gian hon: dung PM2
// pm2 start app.js -i max --name "my-app"
```

---

## 12. Bai tap thuc hanh

### Bai tap 1: System Info CLI (De)

Viet chuong trinh hien thi thong tin he thong:
1. OS name, platform, architecture
2. CPU info (model, so cores, toc do)
3. Memory info (total, free, used %)
4. Node.js version
5. Process uptime
6. Current working directory

```js
// Goi y: Dung os module va process object
const os = require('os');
```

### Bai tap 2: Environment Config Manager (Trung binh)

Viet module quan ly config:
1. Doc tu file .env
2. Validate cac bien bat buoc
3. Type conversion (string -> number, boolean)
4. Default values
5. Hien thi canh bao neu thieu bien

### Bai tap 3: CLI Todo App (Trung binh)

Viet ung dung Todo qua terminal:
1. Doc input tu process.stdin (dung readline)
2. Them, xoa, toggle, list todos
3. Luu vao file JSON
4. Hien thi menu dep (co mau bang ANSI codes)

```js
// ANSI color codes:
// \x1b[31m - Do
// \x1b[32m - Xanh la
// \x1b[33m - Vang
// \x1b[0m  - Reset
```

### Bai tap 4: Process Monitor (Trung binh)

Viet chuong trinh theo doi memory va CPU:
1. Log memory usage moi 5 giay
2. Canh bao khi heapUsed tang > 10MB/phut
3. Canh bao khi RSS > threshold
4. Ghi log ra file
5. Ho tro graceful shutdown (SIGTERM/SIGINT)

### Bai tap 5: Task Runner voi spawn (Kho)

Viet task runner don gian (giong npm scripts):
1. Doc tasks tu file config (JSON/YAML)
2. Chay tasks tuan tu hoac song song
3. Hien thi output realtime (stream)
4. Xu ly error (task fail)
5. Hien thi thoi gian chay

```js
// Vi du config:
const tasks = {
  build: 'tsc && node build.js',
  test: 'jest --coverage',
  lint: 'eslint src/',
  deploy: ['build', 'test', 'upload'], // Chay tuan tu
};
```

### Bai tap 6: Worker Thread Pool (Kho)

Implement Worker Thread Pool:
1. Tao N worker threads khi khoi tao
2. Queue tasks khi tat ca workers ban
3. Tu dong assign task cho worker ranh
4. Ho tro cancel task (timeout)
5. Ho tro dynamic scaling (them/bot workers)

```js
// Interface mong muon:
// const pool = new ThreadPool(4);
// const result = await pool.execute({ type: 'fibonacci', n: 40 });
// await pool.terminate();
```

### Bai tap 7: Simple PM2 Clone (Nang cao)

Viet process manager don gian:
1. Start/Stop/Restart ung dung
2. Cluster mode (fork nhieu workers)
3. Auto-restart khi crash
4. Log management
5. Hien thi trang thai (list processes)

```js
// Vi du lenh:
// node pm.js start app.js --instances 4
// node pm.js stop app
// node pm.js restart app
// node pm.js list
// node pm.js logs app
```

### Bai tap 8: Chat System voi fork() va IPC (Nang cao)

Tao he thong chat:
1. Master process quan ly clients
2. Moi chat room la 1 child process (fork)
3. Master forward messages giua client va room
4. Room process luu lich su chat
5. Ho tro tao/xoa room dong

```js
// Architecture:
// Client <-> Master Process <-> Room Process 1
//                           <-> Room Process 2
//                           <-> Room Process 3
// IPC communication giua master va room processes
```

---

> **Quay lai**: [Bai 05 - HTTP va Networking](../05-HTTP-and-Networking/README.md)
