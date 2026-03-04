# Bai 05: HTTP va Networking trong Node.js

## Muc luc

- [1. Tong quan ve HTTP trong Node.js](#1-tong-quan-ve-http-trong-nodejs)
- [2. http.createServer() chi tiet](#2-httpcreateserver-chi-tiet)
- [3. Request Object](#3-request-object)
  - [3.1. Cac thuoc tinh cua Request](#31-cac-thuoc-tinh-cua-request)
  - [3.2. Doc request body](#32-doc-request-body)
- [4. Response Object](#4-response-object)
  - [4.1. Cac phuong thuc cua Response](#41-cac-phuong-thuc-cua-response)
  - [4.2. Headers](#42-headers)
- [5. HTTP Methods va Status Codes](#5-http-methods-va-status-codes)
  - [5.1. HTTP Methods](#51-http-methods)
  - [5.2. Status Codes](#52-status-codes)
- [6. Routing thu cong](#6-routing-thu-cong)
- [7. Parsing Request Body](#7-parsing-request-body)
  - [7.1. JSON body](#71-json-body)
  - [7.2. URL-encoded body](#72-url-encoded-body)
  - [7.3. Multipart form-data (concept)](#73-multipart-form-data-concept)
- [8. Serving Static Files](#8-serving-static-files)
- [9. URL Module](#9-url-module)
  - [9.1. new URL()](#91-new-url)
  - [9.2. URLSearchParams](#92-urlsearchparams)
- [10. HTTPS va SSL/TLS](#10-https-va-ssltls)
  - [10.1. Tao self-signed certificate](#101-tao-self-signed-certificate)
  - [10.2. https.createServer()](#102-httpscreateserver)
- [11. HTTP Client - http.request() va http.get()](#11-http-client---httprequest-va-httpget)
- [12. net Module - TCP Server/Client](#12-net-module---tcp-serverclient)
- [13. Build Simple REST Server](#13-build-simple-rest-server)
- [14. Cac loi thuong gap](#14-cac-loi-thuong-gap)
- [15. Best Practices](#15-best-practices)
- [16. Bai tap thuc hanh](#16-bai-tap-thuc-hanh)

---

## 1. Tong quan ve HTTP trong Node.js

### HTTP la gi?

HTTP (HyperText Transfer Protocol) la giao thuc truyen tai du lieu tren web. Moi tuong tac tren web deu dua tren mo hinh **Request - Response**:

```
Client (Browser/App)          Server (Node.js)
      |                              |
      |  --- HTTP Request -------->  |
      |  (method, url, headers,      |
      |   body)                      |
      |                              |  Xu ly request
      |                              |
      |  <--- HTTP Response -------  |
      |  (status code, headers,      |
      |   body)                      |
```

### Module http trong Node.js

Node.js co module `http` built-in (khong can cai dat them) de tao HTTP server va client.

```js
const http = require('http');

// Tao server don gian nhat
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Xin chao! Day la server Node.js');
});

server.listen(3000, () => {
  console.log('Server dang chay tai http://localhost:3000');
});
```

**Cac thanh phan chinh:**
- `http.createServer()` - Tao HTTP server
- `http.request()` - Tao HTTP request (client)
- `http.get()` - Shortcut cho GET request
- `http.Server` - Class dai dien cho server
- `http.IncomingMessage` - Class dai dien cho request (Readable Stream)
- `http.ServerResponse` - Class dai dien cho response (Writable Stream)

---

## 2. http.createServer() chi tiet

### Cu phap co ban

```js
const http = require('http');

// Cach 1: Truyen request handler truc tiep
const server1 = http.createServer((req, res) => {
  res.end('Hello');
});

// Cach 2: Dung event 'request'
const server2 = http.createServer();
server2.on('request', (req, res) => {
  res.end('Hello');
});

// Cach 3: Voi options (Node.js 13+)
const server3 = http.createServer(
  {
    // Options
    keepAlive: true,
    keepAliveTimeout: 72000, // 72 giay
    maxHeaderSize: 8192,     // Max header size (bytes)
    // insecureHTTPParser: false, // Tat parser khong an toan
  },
  (req, res) => {
    res.end('Hello');
  }
);
```

### server.listen() - Cac cach listen

```js
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello');
});

// === Cach 1: Listen tren port ===
server.listen(3000, () => {
  console.log('Chay tren port 3000');
});

// === Cach 2: Listen tren port va host cu the ===
server.listen(3000, '0.0.0.0', () => {
  // '0.0.0.0' = nhan ket noi tu moi network interface
  // '127.0.0.1' = chi nhan ket noi tu localhost
  console.log('Chay tren 0.0.0.0:3000');
});

// === Cach 3: Listen voi backlog ===
server.listen(3000, '0.0.0.0', 511, () => {
  // 511 = so luong ket noi doi toi da (pending connections)
  console.log('Chay voi backlog 511');
});

// === Cach 4: Listen tren port ngau nhien ===
server.listen(0, () => {
  const { port } = server.address();
  console.log(`Chay tren port ngau nhien: ${port}`);
});

// === Cach 5: Listen tren Unix socket ===
// server.listen('/tmp/my-server.sock', () => {
//   console.log('Chay tren Unix socket');
// });
```

### Server Events

```js
const http = require('http');
const server = http.createServer();

// 'request' - Moi khi co HTTP request moi
server.on('request', (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.end('OK');
});

// 'connection' - Moi khi co TCP connection moi
server.on('connection', (socket) => {
  console.log('Ket noi moi tu:', socket.remoteAddress);
});

// 'close' - Khi server dong
server.on('close', () => {
  console.log('Server da dong');
});

// 'error' - Khi co loi (vi du: port da bi chiem)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port da bi su dung!`);
  } else {
    console.error('Server error:', err);
  }
});

// 'listening' - Khi server bat dau listen
server.on('listening', () => {
  const addr = server.address();
  console.log(`Server dang listen tren ${addr.address}:${addr.port}`);
});

// 'upgrade' - Khi client request upgrade (WebSocket)
server.on('upgrade', (req, socket, head) => {
  console.log('Upgrade request:', req.headers.upgrade);
});

// 'clientError' - Khi client gui request loi
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(3000);
```

### Dong server

```js
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello');
});

server.listen(3000);

// Dong server (doi tat ca connection hien tai dong)
// server.close(() => {
//   console.log('Server da dong');
// });

// Dong server NGAY LAP TUC (ngat het connection)
// server.closeAllConnections();
// server.close();

// Dong server va chi doi cac connection dang xu ly
// server.closeIdleConnections();
// server.close();

// === Graceful shutdown ===
process.on('SIGTERM', () => {
  console.log('Nhan SIGTERM, dang dong server...');
  server.close(() => {
    console.log('Server da dong sach');
    process.exit(0);
  });

  // Force close sau 10 giay neu van con connection
  setTimeout(() => {
    console.error('Force close sau 10s');
    process.exit(1);
  }, 10000);
});
```

---

## 3. Request Object

### 3.1. Cac thuoc tinh cua Request

`req` (http.IncomingMessage) la mot **Readable Stream** chua thong tin ve HTTP request.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // === HTTP Method ===
  console.log('Method:', req.method);
  // 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'

  // === URL (chi phan path + query string) ===
  console.log('URL:', req.url);
  // '/api/users?page=1&limit=10'

  // === HTTP Version ===
  console.log('HTTP Version:', req.httpVersion);
  // '1.1' hoac '2.0'

  // === Headers ===
  console.log('Headers:', req.headers);
  // {
  //   'host': 'localhost:3000',
  //   'user-agent': 'Mozilla/5.0...',
  //   'accept': 'text/html',
  //   'accept-language': 'vi-VN,vi;q=0.9',
  //   'accept-encoding': 'gzip, deflate',
  //   'connection': 'keep-alive',
  //   'content-type': 'application/json',
  //   'content-length': '42',
  //   'authorization': 'Bearer abc123...',
  //   'cookie': 'session=xyz'
  // }

  // Luu y: Header name LUON la lowercase trong req.headers
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Authorization:', req.headers['authorization']);

  // === Raw Headers (giu nguyen ten goc) ===
  console.log('Raw Headers:', req.rawHeaders);
  // ['Content-Type', 'application/json', 'Host', 'localhost:3000', ...]
  // Mang xen ke [name, value, name, value, ...]

  // === Socket info ===
  console.log('Client IP:', req.socket.remoteAddress);
  console.log('Client Port:', req.socket.remotePort);

  // === Parse URL chi tiet ===
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log('Pathname:', url.pathname);     // '/api/users'
  console.log('Search:', url.search);         // '?page=1&limit=10'
  console.log('Page:', url.searchParams.get('page')); // '1'

  res.end('OK');
});

server.listen(3000);
```

### 3.2. Doc request body

Request body KHONG co san nhu mot thuoc tinh. Vi `req` la **Readable Stream**, ban phai doc du lieu tu stream.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // === Cach 1: Dung events 'data' va 'end' ===
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
    // chunk la Buffer, phai chuyen sang string

    // Gioi han kich thuoc body de tranh tan cong DOS
    if (body.length > 1e6) {
      // 1MB
      req.destroy();
      res.writeHead(413, { 'Content-Type': 'text/plain' });
      res.end('Request body qua lon');
      return;
    }
  });

  req.on('end', () => {
    console.log('Body:', body);
    // Parse JSON neu Content-Type la application/json
    if (req.headers['content-type'] === 'application/json') {
      try {
        const data = JSON.parse(body);
        console.log('Parsed JSON:', data);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('JSON khong hop le');
        return;
      }
    }
    res.end('Da nhan body');
  });

  req.on('error', (err) => {
    console.error('Loi doc body:', err);
    res.writeHead(500);
    res.end('Server Error');
  });
});

server.listen(3000);

// === Cach 2: Viet ham helper voi Promise ===
function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    const MAX_SIZE = 1024 * 1024; // 1MB

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        reject(new Error('Body qua lon'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString());
    });

    req.on('error', reject);
  });
}

// Su dung:
const server2 = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST') {
      const body = await getBody(req);
      const data = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: data }));
    } else {
      res.end('Send a POST request');
    }
  } catch (err) {
    res.writeHead(400);
    res.end(err.message);
  }
});

// === Cach 3: Dung for await...of (Node.js 10+) ===
const server3 = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    console.log('Body:', body);
  }
  res.end('OK');
});
```

---

## 4. Response Object

### 4.1. Cac phuong thuc cua Response

`res` (http.ServerResponse) la mot **Writable Stream** dung de gui response ve client.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // === writeHead() - Set status code VA headers cung luc ===
  // Chi co the goi MOT LAN, TRUOC khi goi write() hoac end()
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Custom-Header': 'My Value',
    'Cache-Control': 'no-cache',
  });

  // === statusCode - Set/Get status code ===
  res.statusCode = 200;
  // Hoac set message
  res.statusMessage = 'Everything is fine';

  // === setHeader() - Set tung header rieng le ===
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-Id', '12345');
  res.setHeader('Set-Cookie', ['session=abc; HttpOnly', 'lang=vi']);
  // Set-Cookie co the nhan mang (nhieu cookie)

  // === getHeader() - Lay gia tri header da set ===
  console.log(res.getHeader('Content-Type'));
  // 'application/json'

  // === getHeaders() - Lay tat ca headers ===
  console.log(res.getHeaders());
  // { 'content-type': 'application/json', ... }

  // === getHeaderNames() - Lay ten headers ===
  console.log(res.getHeaderNames());
  // ['content-type', 'x-request-id', 'set-cookie']

  // === hasHeader() - Kiem tra header ton tai ===
  console.log(res.hasHeader('Content-Type')); // true

  // === removeHeader() - Xoa header ===
  res.removeHeader('X-Request-Id');

  // === write() - Ghi body (co the goi NHIEU LAN) ===
  res.write('Phan dau cua body. ');
  res.write('Phan giua cua body. ');
  res.write('Phan cuoi cua body.');

  // === end() - Ket thuc response ===
  // Co the ghi phan du lieu cuoi cung
  res.end('\nHet!');
  // Sau end(), KHONG THE ghi them!

  // === Kiem tra trang thai ===
  console.log('Headers da gui:', res.headersSent); // true
  console.log('Da ket thuc:', res.writableEnded);  // true
});

server.listen(3000);
```

### 4.2. Headers

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // === Content-Type thuong dung ===
  // Text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Type', 'text/css');

  // Application
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Type', 'application/octet-stream'); // Binary

  // Image
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Type', 'image/svg+xml');

  // === CORS Headers ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Hoac chi dinh cu the:
  res.setHeader('Access-Control-Allow-Origin', 'https://example.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24h

  // === Cache Headers ===
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 nam
  res.setHeader('Cache-Control', 'no-store, no-cache');       // Khong cache
  res.setHeader('ETag', '"abc123"');                           // Versioning
  res.setHeader('Last-Modified', new Date().toUTCString());

  // === Security Headers ===
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // === Cookie ===
  res.setHeader('Set-Cookie', [
    'session=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400',
    'lang=vi; Path=/; Max-Age=31536000',
  ]);

  res.end('Headers set!');
});

server.listen(3000);
```

### Gui cac loai response

```js
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  switch (req.url) {
    // === Text response ===
    case '/text':
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Day la plain text');
      break;

    // === HTML response ===
    case '/html':
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>Trang web</title></head>
          <body>
            <h1>Xin chao!</h1>
            <p>Day la trang HTML tu Node.js</p>
          </body>
        </html>
      `);
      break;

    // === JSON response ===
    case '/json':
      const data = { message: 'Xin chao', users: [{ id: 1, name: 'A' }] };
      const json = JSON.stringify(data);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json),
      });
      res.end(json);
      break;

    // === Redirect ===
    case '/old-page':
      res.writeHead(301, { Location: '/new-page' });
      res.end();
      break;

    case '/new-page':
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Day la trang moi!');
      break;

    // === Stream file ===
    case '/file':
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      const stream = fs.createReadStream('data.txt');
      stream.on('error', () => {
        res.writeHead(404);
        res.end('File not found');
      });
      stream.pipe(res);
      break;

    // === Download file ===
    case '/download':
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="report.pdf"',
      });
      fs.createReadStream('report.pdf').pipe(res);
      break;

    // === 404 Not Found ===
    default:
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Khong tim thay trang');
  }
});

server.listen(3000);
```

---

## 5. HTTP Methods va Status Codes

### 5.1. HTTP Methods

```
+=========+==========================+==================+===============+
| Method  | Muc dich                 | Co Body?         | Idempotent?   |
+=========+==========================+==================+===============+
| GET     | Lay du lieu              | Khong            | Co            |
| POST    | Tao moi du lieu          | Co               | Khong         |
| PUT     | Thay the toan bo         | Co               | Co            |
| PATCH   | Cap nhat 1 phan          | Co               | Khong (*)     |
| DELETE  | Xoa du lieu              | Co the co        | Co            |
| HEAD    | Nhu GET nhung khong body | Khong            | Co            |
| OPTIONS | Lay thong tin server     | Khong            | Co            |
+=========+==========================+==================+===============+

(*) PATCH co the idempotent tuy vao cach implement

Idempotent: Goi nhieu lan ket qua giong nhu goi 1 lan.
Vi du: DELETE /users/1 goi 3 lan -> user 1 van bi xoa 1 lan.
       POST /users goi 3 lan -> tao 3 users!
```

### 5.2. Status Codes

```js
// === 2xx - Thanh cong ===
const STATUS_CODES = {
  200: 'OK',                    // Request thanh cong
  201: 'Created',               // Da tao moi (dung voi POST)
  204: 'No Content',            // Thanh cong nhung khong co body (dung voi DELETE)

  // === 3xx - Redirect ===
  301: 'Moved Permanently',     // URL da thay doi vinh vien
  302: 'Found',                 // Redirect tam thoi
  304: 'Not Modified',          // Resource chua thay doi (cache)
  307: 'Temporary Redirect',    // Redirect tam thoi, giu nguyen method
  308: 'Permanent Redirect',    // Redirect vinh vien, giu nguyen method

  // === 4xx - Loi tu Client ===
  400: 'Bad Request',           // Request khong hop le (sai format, thieu field...)
  401: 'Unauthorized',          // Chua xac thuc (khong co token/sai token)
  403: 'Forbidden',             // Khong co quyen (da xac thuc nhung khong duoc phep)
  404: 'Not Found',             // Khong tim thay resource
  405: 'Method Not Allowed',    // Method khong duoc phep (vi du: POST len /users/:id)
  409: 'Conflict',              // Xung dot (vi du: tao user da ton tai)
  413: 'Payload Too Large',     // Body qua lon
  415: 'Unsupported Media Type',// Content-Type khong duoc ho tro
  422: 'Unprocessable Entity',  // Du lieu hop le ve format nhung sai ve logic
  429: 'Too Many Requests',     // Rate limit - qua nhieu request

  // === 5xx - Loi tu Server ===
  500: 'Internal Server Error', // Loi server (catch-all)
  501: 'Not Implemented',       // Tinh nang chua duoc implement
  502: 'Bad Gateway',           // Proxy/gateway nhan response loi tu upstream
  503: 'Service Unavailable',   // Server tam thoi khong kha dung
  504: 'Gateway Timeout',       // Proxy/gateway timeout khi doi upstream
};

// Dung trong code:
const http = require('http');

http.createServer((req, res) => {
  // Thanh cong
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: 'ok' }));

  // Tao moi thanh cong
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id: 1, name: 'New User' }));

  // Xoa thanh cong (khong can body)
  res.writeHead(204);
  res.end();

  // Loi client
  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Thieu truong email' }));

  // Chua xac thuc
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Vui long dang nhap' }));

  // Khong co quyen
  res.writeHead(403, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ban khong co quyen truy cap' }));

  // Khong tim thay
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Khong tim thay user' }));

  // Loi server
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Loi he thong' }));
});
```

---

## 6. Routing thu cong

### Routing don gian voi if/else

```js
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Set header chung
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // === Routing voi if/else ===
  if (method === 'GET' && url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Trang chu' }));
  } else if (method === 'GET' && url === '/api/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users: [{ id: 1, name: 'A' }] }));
  } else if (method === 'POST' && url === '/api/users') {
    // Doc body
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const user = JSON.parse(body);
      res.writeHead(201);
      res.end(JSON.stringify({ message: 'Tao user thanh cong', user }));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route khong ton tai' }));
  }
});

server.listen(3000);
```

### Router class don gian

```js
const http = require('http');
const url = require('url');

// === Tao Router class ===
class Router {
  constructor() {
    this.routes = [];
  }

  // Dang ky route
  addRoute(method, path, handler) {
    // Chuyen path pattern thanh regex
    // Vi du: '/users/:id' -> /^\/users\/([^\/]+)$/
    const paramNames = [];
    const regexStr = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexStr}$`);

    this.routes.push({ method, regex, paramNames, handler });
  }

  // Shortcut methods
  get(path, handler) {
    this.addRoute('GET', path, handler);
  }
  post(path, handler) {
    this.addRoute('POST', path, handler);
  }
  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }
  patch(path, handler) {
    this.addRoute('PATCH', path, handler);
  }
  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }

  // Tim va thuc thi route phu hop
  async handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    for (const route of this.routes) {
      if (req.method !== route.method) continue;

      const match = pathname.match(route.regex);
      if (!match) continue;

      // Parse params
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });

      // Parse query string
      const query = Object.fromEntries(parsedUrl.searchParams);

      // Gan vao req
      req.params = params;
      req.query = query;

      try {
        await route.handler(req, res);
      } catch (err) {
        console.error('Route error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
      }
      return;
    }

    // Khong tim thay route
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Cannot ${req.method} ${pathname}` }));
  }
}

// === Helper: Doc body ===
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on('error', reject);
  });
}

// === Helper: Gui JSON response ===
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

// === Su dung Router ===
const router = new Router();

// Du lieu mau (in-memory database)
let users = [
  { id: 1, name: 'Nguyen Van A', email: 'a@example.com' },
  { id: 2, name: 'Tran Thi B', email: 'b@example.com' },
];
let nextId = 3;

// GET /api/users - Lay tat ca users
router.get('/api/users', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const start = (page - 1) * limit;
  const paginatedUsers = users.slice(start, start + Number(limit));
  sendJson(res, 200, {
    data: paginatedUsers,
    total: users.length,
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/users/:id - Lay user theo id
router.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) {
    return sendJson(res, 404, { error: 'Khong tim thay user' });
  }
  sendJson(res, 200, { data: user });
});

// POST /api/users - Tao user moi
router.post('/api/users', async (req, res) => {
  const body = await parseBody(req);
  if (!body || !body.name || !body.email) {
    return sendJson(res, 400, { error: 'Thieu truong name hoac email' });
  }

  const newUser = { id: nextId++, name: body.name, email: body.email };
  users.push(newUser);
  sendJson(res, 201, { data: newUser });
});

// PUT /api/users/:id - Cap nhat toan bo user
router.put('/api/users/:id', async (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) {
    return sendJson(res, 404, { error: 'Khong tim thay user' });
  }

  const body = await parseBody(req);
  if (!body || !body.name || !body.email) {
    return sendJson(res, 400, { error: 'Thieu truong name hoac email' });
  }

  users[index] = { id: users[index].id, name: body.name, email: body.email };
  sendJson(res, 200, { data: users[index] });
});

// PATCH /api/users/:id - Cap nhat 1 phan user
router.patch('/api/users/:id', async (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) {
    return sendJson(res, 404, { error: 'Khong tim thay user' });
  }

  const body = await parseBody(req);
  users[index] = { ...users[index], ...body };
  sendJson(res, 200, { data: users[index] });
});

// DELETE /api/users/:id - Xoa user
router.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) {
    return sendJson(res, 404, { error: 'Khong tim thay user' });
  }

  users.splice(index, 1);
  sendJson(res, 204, null);
});

// Tao server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Xu ly preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  router.handleRequest(req, res);
});

// server.listen(3000, () => {
//   console.log('Server chay tai http://localhost:3000');
// });
```

---

## 7. Parsing Request Body

### 7.1. JSON body

```js
const http = require('http');

// === Parser cho JSON body ===
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    // Kiem tra Content-Type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return reject(new Error('Content-Type phai la application/json'));
    }

    const chunks = [];
    let totalSize = 0;
    const MAX_SIZE = 1024 * 1024; // 1MB limit

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        req.destroy();
        return reject(new Error('Body qua lon (max 1MB)'));
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw) return resolve(null);
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (err) {
        reject(new Error('JSON khong hop le: ' + err.message));
      }
    });

    req.on('error', reject);
  });
}

// Su dung:
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/data') {
    try {
      const body = await parseJsonBody(req);
      console.log('Parsed JSON:', body);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: body }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

// server.listen(3000);

// Test voi curl:
// curl -X POST http://localhost:3000/api/data \
//   -H "Content-Type: application/json" \
//   -d '{"name":"Nguyen Van A","age":25}'
```

### 7.2. URL-encoded body

```js
const http = require('http');
const querystring = require('querystring');

// === Parser cho URL-encoded body ===
// Content-Type: application/x-www-form-urlencoded
// Body: name=Nguyen+Van+A&age=25&city=Ha+Noi

function parseUrlEncodedBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/x-www-form-urlencoded')) {
      return reject(new Error('Content-Type phai la application/x-www-form-urlencoded'));
    }

    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();

      // Cach 1: Dung querystring (deprecated nhung van hoat dong)
      // const parsed = querystring.parse(raw);

      // Cach 2: Dung URLSearchParams (khuyen dung)
      const params = new URLSearchParams(raw);
      const parsed = Object.fromEntries(params);

      resolve(parsed);
    });
    req.on('error', reject);
  });
}

// Su dung:
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/login') {
    try {
      const body = await parseUrlEncodedBody(req);
      console.log('Username:', body.username);
      console.log('Password:', body.password);

      // Xu ly dang nhap...
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Dang nhap voi user: ${body.username}`);
    } catch (err) {
      res.writeHead(400);
      res.end(err.message);
    }
    return;
  }

  // Form HTML
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Dang nhap</button>
    </form>
  `);
});

// server.listen(3000);

// Test voi curl:
// curl -X POST http://localhost:3000/login \
//   -d "username=admin&password=123456"
```

### 7.3. Multipart form-data (concept)

Multipart form-data dung de upload file. Day la format phuc tap nhat.

```js
// Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
//
// Body:
// ------WebKitFormBoundary7MA4YWxkTrZu0gW
// Content-Disposition: form-data; name="username"
//
// NguyenVanA
// ------WebKitFormBoundary7MA4YWxkTrZu0gW
// Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
// Content-Type: image/jpeg
//
// <binary data>
// ------WebKitFormBoundary7MA4YWxkTrZu0gW--

const http = require('http');

// === Parser multipart don gian (chi cho text fields) ===
// TRONG THUC TE, dung thu vien nhu 'busboy', 'multer', 'formidable'
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return reject(new Error('Khong phai multipart/form-data'));
    }

    // Lay boundary
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return reject(new Error('Khong tim thay boundary'));
    }
    const boundary = boundaryMatch[1];

    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      const parts = body.split(`--${boundary}`);
      const fields = {};

      for (const part of parts) {
        if (part === '--\r\n' || part === '--' || !part.trim()) continue;

        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const header = part.substring(0, headerEnd);
        const content = part.substring(headerEnd + 4).replace(/\r\n$/, '');

        const nameMatch = header.match(/name="([^"]+)"/);
        if (nameMatch) {
          const filenameMatch = header.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            // Day la file upload
            fields[nameMatch[1]] = {
              filename: filenameMatch[1],
              data: content,
              // Trong thuc te can xu ly binary data dung cach
            };
          } else {
            fields[nameMatch[1]] = content.trim();
          }
        }
      }

      resolve(fields);
    });
    req.on('error', reject);
  });
}

// LUU Y: Parser tren chi la DEMO.
// Trong du an thuc te, LUON dung thu vien:
// - busboy (stream-based, hieu qua)
// - multer (middleware cho Express)
// - formidable (doc lap, day du tinh nang)
```

---

## 8. Serving Static Files

```js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

// === MIME types ===
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
};

// === Static file server ===
function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    // Chi cho phep GET va HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    // Parse URL
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    // Mac dinh serve index.html
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // QUAN TRONG: Chong Directory Traversal Attack
    // req.url co the la '/../../../etc/passwd'
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(rootDir, safePath);

    // Kiem tra file co nam trong rootDir khong
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // Kiem tra file ton tai
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - Khong tim thay file');
        return;
      }

      // Xac dinh MIME type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // ETag (don gian dung mtime + size)
      const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304);
        res.end();
        return;
      }

      // Last-Modified
      const lastModified = stats.mtime.toUTCString();
      if (req.headers['if-modified-since'] === lastModified) {
        res.writeHead(304);
        res.end();
        return;
      }

      // Set headers
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'ETag': etag,
        'Last-Modified': lastModified,
        'Cache-Control': 'public, max-age=3600', // Cache 1 gio
      });

      // HEAD request khong can body
      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      // Stream file
      pipeline(
        fs.createReadStream(filePath),
        res,
        (err) => {
          if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
            console.error('Stream error:', err);
          }
        }
      );
    });
  });
}

// Su dung:
// const server = createStaticServer(path.join(__dirname, 'public'));
// server.listen(3000, () => {
//   console.log('Static server tai http://localhost:3000');
// });

// === Static file server voi Gzip ===
const zlib = require('zlib');

function createStaticServerWithGzip(rootDir) {
  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;
    if (pathname === '/') pathname = '/index.html';

    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        return res.end('Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Kiem tra client co ho tro gzip khong
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const compressibleTypes = [
        'text/', 'application/json', 'application/javascript',
        'application/xml', 'image/svg+xml',
      ];
      const shouldCompress = compressibleTypes.some((t) =>
        contentType.includes(t)
      );

      if (shouldCompress && acceptEncoding.includes('gzip')) {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Encoding': 'gzip',
          'Vary': 'Accept-Encoding',
        });

        pipeline(
          fs.createReadStream(filePath),
          zlib.createGzip(),
          res,
          (err) => {
            if (err) console.error('Gzip error:', err);
          }
        );
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
        });

        pipeline(
          fs.createReadStream(filePath),
          res,
          (err) => {
            if (err) console.error('Stream error:', err);
          }
        );
      }
    });
  });
}
```

---

## 9. URL Module

### 9.1. new URL()

```js
// === new URL() - WHATWG URL API (khuyen dung) ===
const myUrl = new URL('https://user:pass@example.com:8080/path/page?q=hello&lang=vi#section1');

console.log(myUrl.href);       // 'https://user:pass@example.com:8080/path/page?q=hello&lang=vi#section1'
console.log(myUrl.protocol);   // 'https:'
console.log(myUrl.username);   // 'user'
console.log(myUrl.password);   // 'pass'
console.log(myUrl.host);       // 'example.com:8080'
console.log(myUrl.hostname);   // 'example.com'
console.log(myUrl.port);       // '8080'
console.log(myUrl.pathname);   // '/path/page'
console.log(myUrl.search);     // '?q=hello&lang=vi'
console.log(myUrl.hash);       // '#section1'
console.log(myUrl.origin);     // 'https://example.com:8080'

// === Dung trong HTTP server ===
const http = require('http');

http.createServer((req, res) => {
  // req.url chi chua path + query string
  // Can tao URL day du bang cach them base URL
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log('Pathname:', url.pathname);          // '/api/users'
  console.log('Search params:', url.searchParams); // URLSearchParams object
  console.log('Page:', url.searchParams.get('page')); // '1'

  res.end('OK');
}).listen(3000);

// === Tao URL tu cac phan ===
const url = new URL('https://example.com');
url.pathname = '/api/data';
url.searchParams.set('key', 'abc123');
url.searchParams.set('format', 'json');
console.log(url.href);
// 'https://example.com/api/data?key=abc123&format=json'

// === Resolve URL tuong doi ===
const base = new URL('https://example.com/docs/guide/');
const relative = new URL('./chapter1', base);
console.log(relative.href); // 'https://example.com/docs/guide/chapter1'

const up = new URL('../tutorial', base);
console.log(up.href); // 'https://example.com/docs/tutorial'
```

### 9.2. URLSearchParams

```js
// === Tao URLSearchParams ===

// Tu string
const params1 = new URLSearchParams('q=hello&lang=vi&page=1');

// Tu object
const params2 = new URLSearchParams({
  q: 'hello',
  lang: 'vi',
  page: '1',
});

// Tu array of pairs
const params3 = new URLSearchParams([
  ['q', 'hello'],
  ['tag', 'nodejs'],
  ['tag', 'javascript'], // Co the trung key
]);

// === Cac phuong thuc ===

// get() - Lay gia tri (dau tien)
console.log(params1.get('q'));    // 'hello'
console.log(params1.get('xxx')); // null

// getAll() - Lay tat ca gia tri cua 1 key
console.log(params3.getAll('tag')); // ['nodejs', 'javascript']

// has() - Kiem tra ton tai
console.log(params1.has('q'));    // true
console.log(params1.has('xxx')); // false

// set() - Set gia tri (thay the tat ca gia tri cu)
params1.set('q', 'world');
console.log(params1.get('q')); // 'world'

// append() - Them gia tri (khong thay the)
params1.append('tag', 'nodejs');
params1.append('tag', 'stream');
console.log(params1.getAll('tag')); // ['nodejs', 'stream']

// delete() - Xoa key
params1.delete('tag');
console.log(params1.has('tag')); // false

// sort() - Sap xep theo ten key
params1.sort();

// toString() - Chuyen thanh query string
console.log(params1.toString()); // 'lang=vi&page=1&q=world'

// === Iteration ===
for (const [key, value] of params2) {
  console.log(`${key} = ${value}`);
}

// entries(), keys(), values()
console.log([...params2.entries()]);
console.log([...params2.keys()]);
console.log([...params2.values()]);

// forEach
params2.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// === Chuyen sang object ===
const paramsObj = Object.fromEntries(params2);
console.log(paramsObj);
// { q: 'hello', lang: 'vi', page: '1' }
// LUU Y: Neu co key trung, chi giu gia tri cuoi cung!

// === URL encode/decode tu dong ===
const special = new URLSearchParams();
special.set('query', 'xin chao Viet Nam!');
special.set('special', 'a&b=c d');
console.log(special.toString());
// 'query=xin+chao+Viet+Nam%21&special=a%26b%3Dc+d'
// Ky tu dac biet duoc tu dong encode!
```

---

## 10. HTTPS va SSL/TLS

### 10.1. Tao self-signed certificate

```bash
# === Tao self-signed SSL certificate de test ===
# Chay lenh nay trong terminal:

# Tao private key va certificate cung luc
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=VN/ST=HoChiMinh/L=HCM/O=MyCompany/CN=localhost"

# Giai thich:
# -x509: Tao self-signed cert (khong can CA)
# -newkey rsa:4096: Tao RSA key 4096 bit
# -keyout key.pem: File private key
# -out cert.pem: File certificate
# -days 365: Co hieu luc 365 ngay
# -nodes: Khong dat password cho private key
# -subj: Thong tin certificate

# Kiem tra certificate
openssl x509 -in cert.pem -text -noout
```

### 10.2. https.createServer()

```js
const https = require('https');
const fs = require('fs');

// === Tao HTTPS server ===
const options = {
  key: fs.readFileSync('key.pem'),   // Private key
  cert: fs.readFileSync('cert.pem'), // Certificate

  // Options them (optional):
  // ca: fs.readFileSync('ca.pem'),  // Certificate Authority (cho production)
  // passphrase: 'my-password',       // Neu key co password
  // minVersion: 'TLSv1.2',          // Phien ban TLS toi thieu
  // ciphers: 'HIGH:!aNULL:!MD5',    // Cipher suites
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Xin chao! Day la HTTPS server an toan!');
});

server.listen(443, () => {
  console.log('HTTPS server chay tai https://localhost');
});

// === HTTP redirect sang HTTPS ===
const http = require('http');

// Server HTTP redirect sang HTTPS
http.createServer((req, res) => {
  const httpsUrl = `https://${req.headers.host}${req.url}`;
  res.writeHead(301, { Location: httpsUrl });
  res.end();
}).listen(80);

// === Chay ca HTTP va HTTPS tren cung ung dung ===
function requestHandler(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    protocol: req.socket.encrypted ? 'https' : 'http',
    message: 'Xin chao!',
  }));
}

// HTTPS server (port 443)
https.createServer(options, requestHandler).listen(443);

// HTTP server redirect sang HTTPS (port 80)
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

---

## 11. HTTP Client - http.request() va http.get()

### http.get() - GET request don gian

```js
const http = require('http');
const https = require('https');

// === http.get() - Shortcut cho GET request ===
https.get('https://jsonplaceholder.typicode.com/users/1', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const user = JSON.parse(data);
    console.log('User:', user.name);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});

// === Wrapper voi Promise ===
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    lib.get(url, (res) => {
      // Xu ly redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume(); // Tieu thu data de giai phong bo nho
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data); // Tra ve raw string neu khong phai JSON
        }
      });
    }).on('error', reject);
  });
}

// Su dung:
// httpGet('https://jsonplaceholder.typicode.com/posts')
//   .then(posts => console.log(`Co ${posts.length} posts`))
//   .catch(err => console.error(err));
```

### http.request() - Request day du

```js
const http = require('http');
const https = require('https');

// === POST request ===
function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(data);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let responseData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(responseData),
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);

    // Timeout
    req.setTimeout(10000, () => {
      req.destroy(new Error('Request timeout'));
    });

    // Gui body
    req.write(body);
    req.end();
  });
}

// Su dung:
// httpPost('https://jsonplaceholder.typicode.com/posts', {
//   title: 'Bai viet moi',
//   body: 'Noi dung bai viet',
//   userId: 1,
// })
//   .then(res => console.log('Created:', res.data))
//   .catch(err => console.error(err));

// === HTTP Client day du hon ===
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = options.body ? JSON.stringify(options.body) : null;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'NodeJS-Client/1.0',
        ...options.headers,
      },
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawData = Buffer.concat(chunks).toString();
        let parsedData;
        try {
          parsedData = JSON.parse(rawData);
        } catch {
          parsedData = rawData;
        }

        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: parsedData,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(options.timeout || 30000, () => {
      req.destroy(new Error('Request timeout'));
    });

    if (body) req.write(body);
    req.end();
  });
}

// === Vi du su dung ===
async function apiExamples() {
  // GET
  const users = await httpRequest('https://jsonplaceholder.typicode.com/users');
  console.log('Users:', users.data.length);

  // POST
  const newPost = await httpRequest('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: { title: 'Bai viet', body: 'Noi dung', userId: 1 },
  });
  console.log('New post:', newPost.data);

  // PUT
  const updated = await httpRequest('https://jsonplaceholder.typicode.com/posts/1', {
    method: 'PUT',
    body: { title: 'Da cap nhat', body: 'Noi dung moi', userId: 1 },
  });
  console.log('Updated:', updated.data);

  // DELETE
  const deleted = await httpRequest('https://jsonplaceholder.typicode.com/posts/1', {
    method: 'DELETE',
  });
  console.log('Deleted, status:', deleted.statusCode);
}

// apiExamples();
```

---

## 12. net Module - TCP Server/Client

Module `net` cung cap API cap thap de lam viec voi TCP (va IPC).

```js
const net = require('net');

// ============================================
// TCP SERVER
// ============================================
const server = net.createServer((socket) => {
  console.log('Client ket noi:', socket.remoteAddress, socket.remotePort);

  // Gui loi chao
  socket.write('Chao mung den TCP server!\n');

  // Nhan du lieu tu client
  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log('Nhan tu client:', message);

    // Echo lai client
    socket.write(`Server nhan: "${message}"\n`);

    // Dong ket noi neu client gui 'quit'
    if (message.toLowerCase() === 'quit') {
      socket.write('Tam biet!\n');
      socket.end();
    }
  });

  // Client ngat ket noi
  socket.on('end', () => {
    console.log('Client da ngat ket noi');
  });

  // Loi
  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });

  // Timeout (60 giay khong co hoat dong)
  socket.setTimeout(60000);
  socket.on('timeout', () => {
    console.log('Socket timeout');
    socket.end('Timeout - ngat ket noi\n');
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port da bi su dung');
  } else {
    throw err;
  }
});

// server.listen(8080, () => {
//   console.log('TCP server chay tren port 8080');
// });

// ============================================
// TCP CLIENT
// ============================================
function createTcpClient(host, port) {
  const client = net.createConnection({ host, port }, () => {
    console.log('Da ket noi den server');
  });

  client.on('data', (data) => {
    console.log('Server noi:', data.toString().trim());
  });

  client.on('end', () => {
    console.log('Da ngat ket noi');
  });

  client.on('error', (err) => {
    console.error('Connection error:', err.message);
  });

  return client;
}

// const client = createTcpClient('localhost', 8080);
// client.write('Hello Server!\n');
// setTimeout(() => client.write('quit\n'), 3000);

// ============================================
// CHAT SERVER DON GIAN
// ============================================
function createChatServer(port) {
  const clients = new Set();

  const server = net.createServer((socket) => {
    socket.name = `${socket.remoteAddress}:${socket.remotePort}`;
    clients.add(socket);

    // Thong bao co nguoi moi
    broadcast(`[${socket.name}] da tham gia chat\n`, socket);
    socket.write(`Chao ${socket.name}! Co ${clients.size} nguoi dang online\n`);

    socket.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        broadcast(`[${socket.name}]: ${message}\n`, socket);
      }
    });

    socket.on('end', () => {
      clients.delete(socket);
      broadcast(`[${socket.name}] da roi khoi chat\n`);
    });

    socket.on('error', () => {
      clients.delete(socket);
    });
  });

  function broadcast(message, excludeSocket) {
    for (const client of clients) {
      if (client !== excludeSocket && !client.destroyed) {
        client.write(message);
      }
    }
  }

  server.listen(port, () => {
    console.log(`Chat server chay tren port ${port}`);
    console.log('Ket noi bang: telnet localhost ' + port);
  });

  return server;
}

// createChatServer(8080);
// Test: Mo nhieu terminal va chay: telnet localhost 8080
```

---

## 13. Build Simple REST Server

Day la mot vi du day du ve REST API server KHONG dung bat ky framework nao.

```js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ============================================
// DATABASE DON GIAN (in-memory + JSON file)
// ============================================
class SimpleDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
    this.load();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      this.data = JSON.parse(raw);
    } catch {
      this.data = {};
    }
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  getCollection(name) {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  findAll(collection) {
    return this.getCollection(collection);
  }

  findById(collection, id) {
    return this.getCollection(collection).find((item) => item.id === id);
  }

  create(collection, item) {
    const items = this.getCollection(collection);
    const maxId = items.reduce((max, i) => Math.max(max, i.id || 0), 0);
    item.id = maxId + 1;
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    items.push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const items = this.getCollection(collection);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return items[index];
  }

  remove(collection, id) {
    const items = this.getCollection(collection);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.save();
    return true;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        req.destroy();
        reject(new Error('Body qua lon'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('JSON khong hop le'));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  const json = data !== null ? JSON.stringify(data, null, 2) : '';
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

// ============================================
// MIDDLEWARE-LIKE FUNCTIONS
// ============================================
function logRequest(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ============================================
// ROUTER
// ============================================
class Router {
  constructor() {
    this.routes = [];
  }

  addRoute(method, pattern, handler) {
    const paramNames = [];
    const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      method,
      regex: new RegExp(`^${regexStr}$`),
      paramNames,
      handler,
    });
  }

  get(p, h) { this.addRoute('GET', p, h); }
  post(p, h) { this.addRoute('POST', p, h); }
  put(p, h) { this.addRoute('PUT', p, h); }
  patch(p, h) { this.addRoute('PATCH', p, h); }
  delete(p, h) { this.addRoute('DELETE', p, h); }

  async resolve(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    for (const route of this.routes) {
      if (req.method !== route.method) continue;
      const match = pathname.match(route.regex);
      if (!match) continue;

      req.params = {};
      route.paramNames.forEach((name, i) => {
        req.params[name] = decodeURIComponent(match[i + 1]);
      });
      req.query = Object.fromEntries(parsedUrl.searchParams);

      try {
        await route.handler(req, res);
      } catch (err) {
        console.error('Handler error:', err);
        if (!res.headersSent) {
          sendError(res, 500, 'Internal Server Error');
        }
      }
      return true;
    }
    return false;
  }
}

// ============================================
// KHOI TAO SERVER
// ============================================
const db = new SimpleDB(path.join(__dirname, 'db.json'));
const router = new Router();

// === PRODUCTS API ===
router.get('/api/products', (req, res) => {
  let products = db.findAll('products');

  // Filter
  if (req.query.category) {
    products = products.filter((p) => p.category === req.query.category);
  }
  if (req.query.minPrice) {
    products = products.filter((p) => p.price >= Number(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    products = products.filter((p) => p.price <= Number(req.query.maxPrice));
  }

  // Search
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(search)
    );
  }

  // Sort
  if (req.query.sort) {
    const [field, order] = req.query.sort.split(':');
    products.sort((a, b) => {
      if (order === 'desc') return b[field] > a[field] ? 1 : -1;
      return a[field] > b[field] ? 1 : -1;
    });
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const paginatedProducts = products.slice(start, start + limit);

  sendJson(res, 200, {
    data: paginatedProducts,
    meta: {
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
    },
  });
});

router.get('/api/products/:id', (req, res) => {
  const product = db.findById('products', Number(req.params.id));
  if (!product) {
    return sendError(res, 404, 'Khong tim thay san pham');
  }
  sendJson(res, 200, { data: product });
});

router.post('/api/products', async (req, res) => {
  const body = await getBody(req);
  if (!body) return sendError(res, 400, 'Body khong duoc trong');

  // Validation
  const errors = [];
  if (!body.name) errors.push('Thieu truong name');
  if (!body.price || isNaN(body.price)) errors.push('Price phai la so');
  if (body.price < 0) errors.push('Price phai lon hon 0');

  if (errors.length > 0) {
    return sendError(res, 400, errors.join(', '));
  }

  const product = db.create('products', {
    name: body.name,
    price: Number(body.price),
    category: body.category || 'uncategorized',
    description: body.description || '',
    inStock: body.inStock !== false,
  });

  sendJson(res, 201, { data: product });
});

router.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = db.findById('products', id);
  if (!existing) return sendError(res, 404, 'Khong tim thay san pham');

  const body = await getBody(req);
  if (!body) return sendError(res, 400, 'Body khong duoc trong');
  if (!body.name) return sendError(res, 400, 'Thieu truong name');
  if (!body.price) return sendError(res, 400, 'Thieu truong price');

  const updated = db.update('products', id, {
    name: body.name,
    price: Number(body.price),
    category: body.category || 'uncategorized',
    description: body.description || '',
    inStock: body.inStock !== false,
  });

  sendJson(res, 200, { data: updated });
});

router.patch('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = db.findById('products', id);
  if (!existing) return sendError(res, 404, 'Khong tim thay san pham');

  const body = await getBody(req);
  if (!body) return sendError(res, 400, 'Body khong duoc trong');

  const updated = db.update('products', id, body);
  sendJson(res, 200, { data: updated });
});

router.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const removed = db.remove('products', id);
  if (!removed) return sendError(res, 404, 'Khong tim thay san pham');
  sendJson(res, 204, null);
});

// === HEALTH CHECK ===
router.get('/api/health', (req, res) => {
  sendJson(res, 200, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// === TAO SERVER ===
const server = http.createServer(async (req, res) => {
  // Log
  logRequest(req);

  // CORS
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Router
  const matched = await router.resolve(req, res);
  if (!matched) {
    sendError(res, 404, `Cannot ${req.method} ${req.url}`);
  }
});

const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`REST API Server chay tai http://localhost:${PORT}`);
//   console.log('Endpoints:');
//   console.log('  GET    /api/products');
//   console.log('  GET    /api/products/:id');
//   console.log('  POST   /api/products');
//   console.log('  PUT    /api/products/:id');
//   console.log('  PATCH  /api/products/:id');
//   console.log('  DELETE /api/products/:id');
//   console.log('  GET    /api/health');
// });

// === TEST VOI CURL ===
// # Lay danh sach san pham
// curl http://localhost:3000/api/products
//
// # Tao san pham moi
// curl -X POST http://localhost:3000/api/products \
//   -H "Content-Type: application/json" \
//   -d '{"name":"iPhone 15","price":999,"category":"phone"}'
//
// # Lay san pham theo id
// curl http://localhost:3000/api/products/1
//
// # Cap nhat san pham
// curl -X PATCH http://localhost:3000/api/products/1 \
//   -H "Content-Type: application/json" \
//   -d '{"price":899}'
//
// # Xoa san pham
// curl -X DELETE http://localhost:3000/api/products/1
//
// # Tim kiem va loc
// curl "http://localhost:3000/api/products?search=iphone&minPrice=500&sort=price:desc&page=1&limit=5"
```

---

## 14. Cac loi thuong gap

### Loi 1: Khong xu ly error event tren server

```js
// SAI - Server crash khi port da bi chiem
const server = http.createServer((req, res) => res.end('OK'));
server.listen(3000); // EADDRINUSE -> crash!

// DUNG
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port 3000 da bi su dung. Thu port khac.`);
    server.listen(3001);
  } else {
    throw err;
  }
});
server.listen(3000);
```

### Loi 2: Quen ket thuc response

```js
// SAI - Client se doi mai (hanging request)
http.createServer((req, res) => {
  res.writeHead(200);
  res.write('Hello');
  // QUEN goi res.end()! Client doi mai!
});

// DUNG
http.createServer((req, res) => {
  res.writeHead(200);
  res.write('Hello');
  res.end(); // PHAI goi end()!
});
```

### Loi 3: Set header sau khi da gui

```js
// SAI - Headers da gui, khong the thay doi
http.createServer((req, res) => {
  res.write('Hello'); // headers tu dong gui khi goi write() lan dau
  res.setHeader('X-Custom', 'value'); // Error: Cannot set headers after they are sent!
});

// DUNG - Set header TRUOC khi write/end
http.createServer((req, res) => {
  res.setHeader('X-Custom', 'value');
  res.write('Hello');
  res.end();
});
```

### Loi 4: Content-Length sai voi tieng Viet

```js
// SAI
const body = 'Xin chao Viet Nam!';
res.setHeader('Content-Length', body.length);
// body.length = 18 (so ky tu)
// Nhung byte length > 18 vi ky tu tieng Viet > 1 byte!

// DUNG
res.setHeader('Content-Length', Buffer.byteLength(body));
// Buffer.byteLength = so byte thuc te
```

### Loi 5: Khong xu ly exception trong async handler

```js
// SAI - Unhandled exception crash server
http.createServer(async (req, res) => {
  const data = await someAsyncOperation(); // Throw error!
  res.end(JSON.stringify(data));
  // -> Uncaught exception -> Server crash!
});

// DUNG - try/catch cho async handler
http.createServer(async (req, res) => {
  try {
    const data = await someAsyncOperation();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error('Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});
```

### Loi 6: Directory Traversal Attack

```js
// SAI - Hacker co the doc bat ky file nao tren server!
http.createServer((req, res) => {
  const filePath = './public' + req.url;
  // req.url = '/../../../etc/passwd'
  // filePath = './public/../../../etc/passwd' => Doc duoc /etc/passwd!
  fs.createReadStream(filePath).pipe(res);
});

// DUNG - Validate path
http.createServer((req, res) => {
  const rootDir = path.resolve('./public');
  const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(rootDir, safePath);

  // Kiem tra file PHAI nam trong rootDir
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.createReadStream(filePath).pipe(res);
});
```

---

## 15. Best Practices

### 1. Luon xu ly error

```js
// Server error
server.on('error', handleError);

// Request error
req.on('error', handleError);

// Async handler
try { await handler(req, res); } catch (err) { handleError(err); }
```

### 2. Gioi han request body size

```js
let size = 0;
req.on('data', (chunk) => {
  size += chunk.length;
  if (size > 1024 * 1024) { // 1MB
    req.destroy();
    res.writeHead(413);
    res.end('Payload Too Large');
  }
});
```

### 3. Set timeout cho request

```js
server.timeout = 30000; // 30 giay
// Hoac cho tung request
req.setTimeout(10000, () => {
  res.writeHead(408);
  res.end('Request Timeout');
});
```

### 4. Graceful shutdown

```js
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server dong sach');
    process.exit(0);
  });
});
```

### 5. Dung Content-Type dung

```js
// JSON
res.setHeader('Content-Type', 'application/json; charset=utf-8');

// HTML
res.setHeader('Content-Type', 'text/html; charset=utf-8');

// Luon them charset=utf-8 cho text content
```

### 6. Security headers

```js
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Content-Security-Policy', "default-src 'self'");
```

### 7. Logging

```js
// Log moi request
const start = Date.now();
res.on('finish', () => {
  const duration = Date.now() - start;
  console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
});
```

---

## 16. Bai tap thuc hanh

### Bai tap 1: Hello World Server (De)

Tao HTTP server:
1. GET / -> tra ve HTML "Xin chao!"
2. GET /json -> tra ve JSON { message: "Xin chao" }
3. Bat ky URL khac -> 404

### Bai tap 2: Simple File Server (Trung binh)

Tao static file server:
1. Serve file tu thu muc `public/`
2. Ho tro cac MIME types co ban (html, css, js, images)
3. Tra ve 404 neu file khong ton tai
4. Chong directory traversal attack

### Bai tap 3: REST API CRUD (Trung binh)

Tao REST API cho "Todo List":
1. GET /api/todos - Lay danh sach
2. GET /api/todos/:id - Lay 1 todo
3. POST /api/todos - Tao todo moi (validation: title bat buoc)
4. PATCH /api/todos/:id - Cap nhat (toggle completed)
5. DELETE /api/todos/:id - Xoa
6. Luu du lieu vao file JSON

### Bai tap 4: URL Shortener (Trung binh)

Tao dich vu rut gon URL:
1. POST /api/shorten - Nhan { url: "..." }, tra ve short code
2. GET /:code - Redirect den URL goc
3. GET /api/stats/:code - Thong ke so lan truy cap
4. Luu du lieu vao file JSON

### Bai tap 5: HTTP Proxy Server (Kho)

Tao forward proxy server:
1. Nhan request tu client
2. Forward request den server dich
3. Tra response tu server dich ve client
4. Log tat ca request
5. Ho tro block list (chan 1 so domain)

```js
// Goi y:
// 1. Parse target URL tu request
// 2. Dung http.request() de forward
// 3. pipe() response tu target ve client
```

### Bai tap 6: Chat Server voi HTTP Long Polling (Kho)

Tao chat ung dung chi dung HTTP (khong WebSocket):
1. GET /api/messages?since=timestamp - Lay tin nhan moi
2. POST /api/messages - Gui tin nhan moi
3. Su dung long polling: Server giu request cho den khi co tin nhan moi
4. Tao trang HTML client don gian

```js
// Goi y cho long polling:
// const waitingClients = [];
// Khi co tin nhan moi, respond cho tat ca waiting clients
// Neu khong co tin nhan trong 30s, respond voi mang rong
```

### Bai tap 7: Rate Limiter Middleware (Kho)

Tao rate limiter:
1. Gioi han moi IP chi duoc gui N request trong M giay
2. Tra ve 429 (Too Many Requests) khi vuot qua gioi han
3. Them header X-RateLimit-Remaining va X-RateLimit-Reset
4. Ho tro sliding window algorithm

```js
// Goi y:
// Dung Map de luu request count theo IP
// Key: IP address
// Value: { count, windowStart }
```

### Bai tap 8: Simple API Gateway (Nang cao)

Tao API Gateway:
1. Route /api/users/* -> User Service (port 3001)
2. Route /api/products/* -> Product Service (port 3002)
3. Ho tro health check cho tung service
4. Load balancing (round-robin) giua nhieu instance
5. Circuit breaker (ngung forward khi service down)

---

> **Tiep theo**: [Bai 06 - Process va Child Process](../06-Process-and-Child-Process/README.md)
