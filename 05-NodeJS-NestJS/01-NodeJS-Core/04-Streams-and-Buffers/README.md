# Bai 04: Streams va Buffers trong Node.js

## Muc luc

- [1. Buffer - Xu ly du lieu nhi phan](#1-buffer---xu-ly-du-lieu-nhi-phan)
  - [1.1. Buffer la gi?](#11-buffer-la-gi)
  - [1.2. Tao Buffer](#12-tao-buffer)
  - [1.3. Doc va ghi Buffer](#13-doc-va-ghi-buffer)
  - [1.4. Chuyen doi encoding](#14-chuyen-doi-encoding)
  - [1.5. Cac phuong thuc quan trong cua Buffer](#15-cac-phuong-thuc-quan-trong-cua-buffer)
- [2. Streams - Tong quan](#2-streams---tong-quan)
  - [2.1. Stream la gi?](#21-stream-la-gi)
  - [2.2. Tai sao can Streams?](#22-tai-sao-can-streams)
  - [2.3. Bon loai Stream](#23-bon-loai-stream)
- [3. Readable Streams](#3-readable-streams)
  - [3.1. Flowing mode vs Paused mode](#31-flowing-mode-vs-paused-mode)
  - [3.2. Events cua Readable Stream](#32-events-cua-readable-stream)
  - [3.3. Tao custom Readable Stream](#33-tao-custom-readable-stream)
- [4. Writable Streams](#4-writable-streams)
  - [4.1. Cac phuong thuc cua Writable Stream](#41-cac-phuong-thuc-cua-writable-stream)
  - [4.2. Events cua Writable Stream](#42-events-cua-writable-stream)
  - [4.3. cork() va uncork()](#43-cork-va-uncork)
  - [4.4. Tao custom Writable Stream](#44-tao-custom-writable-stream)
- [5. Duplex va Transform Streams](#5-duplex-va-transform-streams)
  - [5.1. Duplex Stream](#51-duplex-stream)
  - [5.2. Transform Stream](#52-transform-stream)
- [6. pipe() va pipeline()](#6-pipe-va-pipeline)
  - [6.1. pipe()](#61-pipe)
  - [6.2. pipeline()](#62-pipeline)
- [7. Backpressure](#7-backpressure)
  - [7.1. Backpressure la gi?](#71-backpressure-la-gi)
  - [7.2. Co che hoat dong](#72-co-che-hoat-dong)
  - [7.3. Xu ly Backpressure thu cong](#73-xu-ly-backpressure-thu-cong)
- [8. Xu ly file lon voi Streams](#8-xu-ly-file-lon-voi-streams)
  - [8.1. So sanh readFile vs createReadStream](#81-so-sanh-readfile-vs-createreadstream)
  - [8.2. Doc file nhieu GB ma khong het RAM](#82-doc-file-nhieu-gb-ma-khong-het-ram)
- [9. Practical Examples](#9-practical-examples)
  - [9.1. Copy file lon](#91-copy-file-lon)
  - [9.2. Compress va Decompress voi Gzip](#92-compress-va-decompress-voi-gzip)
  - [9.3. CSV parsing tung dong](#93-csv-parsing-tung-dong)
  - [9.4. HTTP streaming response](#94-http-streaming-response)
  - [9.5. Progress bar khi doc file](#95-progress-bar-khi-doc-file)
- [10. Stream Events chi tiet](#10-stream-events-chi-tiet)
- [11. Cac loi thuong gap](#11-cac-loi-thuong-gap)
- [12. Best Practices](#12-best-practices)
- [13. Bai tap thuc hanh](#13-bai-tap-thuc-hanh)

---

## 1. Buffer - Xu ly du lieu nhi phan

### 1.1. Buffer la gi?

Buffer la mot class trong Node.js dung de lam viec voi du lieu nhi phan (binary data). Trong JavaScript phia trinh duyet, chung ta thuong lam viec voi chuoi (string), nhung o phia server, chung ta can xu ly:

- Du lieu tu file (anh, video, PDF...)
- Du lieu tu network (TCP packets, HTTP requests...)
- Du lieu tu database (binary fields...)

Buffer la mot vung nho co dinh (fixed-size memory), duoc cap phat **ngoai V8 heap**, chua mot chuoi cac byte (so nguyen tu 0 den 255).

**Dac diem quan trong:**
- Buffer co kich thuoc co dinh, khong the thay doi sau khi tao
- Buffer luu tru du lieu duoi dang byte (0-255)
- Buffer la subclass cua `Uint8Array`
- Buffer duoc cap phat ngoai V8 JavaScript heap

```
Buffer trong bo nho:
+-----+-----+-----+-----+-----+-----+-----+-----+
| 48  | 65  | 6C  | 6C  | 6F  | 20  | 56  | 4E  |
+-----+-----+-----+-----+-----+-----+-----+-----+
  H     e     l     l     o    ' '    V     N

Moi o la 1 byte (0x00 - 0xFF = 0 - 255)
```

### 1.2. Tao Buffer

Co 3 cach chinh de tao Buffer:

#### Buffer.from() - Tao tu du lieu co san

```js
// === Tao Buffer tu string ===
const buf1 = Buffer.from('Xin chao');
console.log(buf1);
// <Buffer 58 69 6e 20 63 68 c3 a0 6f>
console.log(buf1.toString());
// 'Xin chao'
console.log(buf1.length);
// 10 (so byte, KHONG phai so ky tu vi tieng Viet co dau dung nhieu byte)

// === Tao Buffer tu string voi encoding cu the ===
const buf2 = Buffer.from('Hello', 'utf8');       // Mac dinh la utf8
const buf3 = Buffer.from('48656C6C6F', 'hex');   // Tu hex string
const buf4 = Buffer.from('SGVsbG8=', 'base64');  // Tu base64

console.log(buf2.toString()); // 'Hello'
console.log(buf3.toString()); // 'Hello'
console.log(buf4.toString()); // 'Hello'

// === Tao Buffer tu array ===
const buf5 = Buffer.from([72, 101, 108, 108, 111]);
console.log(buf5.toString()); // 'Hello'

// === Tao Buffer tu mot Buffer khac (copy) ===
const original = Buffer.from('Original');
const copy = Buffer.from(original);
copy[0] = 67; // Thay doi copy khong anh huong original
console.log(original.toString()); // 'Original'
console.log(copy.toString());     // 'Criginal'

// === Tao Buffer tu ArrayBuffer ===
const arrayBuffer = new ArrayBuffer(4);
const view = new Uint8Array(arrayBuffer);
view[0] = 72; view[1] = 105; // 'Hi'
const buf6 = Buffer.from(arrayBuffer);
console.log(buf6.toString()); // 'Hi\x00\x00'
```

#### Buffer.alloc() - Tao Buffer an toan voi kich thuoc co dinh

```js
// Tao Buffer 10 byte, mac dinh dien 0
const buf1 = Buffer.alloc(10);
console.log(buf1);
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// Tao Buffer 10 byte, dien gia tri 1
const buf2 = Buffer.alloc(10, 1);
console.log(buf2);
// <Buffer 01 01 01 01 01 01 01 01 01 01>

// Tao Buffer 10 byte, dien bang ky tu 'a'
const buf3 = Buffer.alloc(10, 'a');
console.log(buf3.toString());
// 'aaaaaaaaaa'

// Tao Buffer voi encoding cu the
const buf4 = Buffer.alloc(15, 'Hello ', 'utf8');
console.log(buf4.toString());
// 'Hello Hello Hel' (lap lai cho den khi day)
```

#### Buffer.allocUnsafe() - Tao Buffer NHANH nhung KHONG an toan

```js
// allocUnsafe KHONG xoa du lieu cu trong vung nho
// => Co the chua du lieu "rac" tu cac process khac
const buf = Buffer.allocUnsafe(10);
console.log(buf);
// <Buffer co the chua bat ky gia tri nao!>

// PHAI tu dien du lieu truoc khi su dung
buf.fill(0); // Xoa sach
// Hoac
buf.write('Hello');

// === Tai sao dung allocUnsafe? ===
// Performance! allocUnsafe nhanh hon alloc vi khong can
// zero-fill vung nho. Dung khi ban BIET se ghi de toan bo buffer.

// Benchmark don gian
console.time('alloc');
for (let i = 0; i < 10000; i++) {
  Buffer.alloc(1024);
}
console.timeEnd('alloc');

console.time('allocUnsafe');
for (let i = 0; i < 10000; i++) {
  Buffer.allocUnsafe(1024);
}
console.timeEnd('allocUnsafe');
// allocUnsafe thuong nhanh hon 2-6 lan
```

**Canh bao bao mat voi allocUnsafe:**

```js
// NGUY HIEM: Du lieu nhay cam co the bi lo
const unsafeBuf = Buffer.allocUnsafe(256);
// Buffer nay co the chua:
// - Mat khau cu
// - Token xac thuc
// - Du lieu ca nhan
// => LUON LUON fill hoac ghi de NGAY sau khi tao!
```

### 1.3. Doc va ghi Buffer

```js
const buf = Buffer.alloc(10);

// === Ghi tung byte ===
buf[0] = 72;  // 'H'
buf[1] = 101; // 'e'
buf[2] = 108; // 'l'
buf[3] = 108; // 'l'
buf[4] = 111; // 'o'
console.log(buf.toString()); // 'Hello\x00\x00\x00\x00\x00'

// === Doc tung byte ===
console.log(buf[0]); // 72
console.log(buf[1]); // 101

// === Ghi string vao Buffer ===
const buf2 = Buffer.alloc(20);
const bytesWritten = buf2.write('Xin chao!');
console.log(bytesWritten);         // So byte da ghi
console.log(buf2.toString());       // 'Xin chao!'

// Ghi voi offset
const buf3 = Buffer.alloc(20);
buf3.write('Hello');
buf3.write(' World', 5); // Ghi tu vi tri byte thu 5
console.log(buf3.toString()); // 'Hello World'

// === Doc/Ghi so nguyen ===
const numBuf = Buffer.alloc(8);

// Ghi so nguyen 8-bit (1 byte, 0-255)
numBuf.writeUInt8(255, 0);
console.log(numBuf.readUInt8(0)); // 255

// Ghi so nguyen 16-bit Big Endian (2 bytes)
numBuf.writeUInt16BE(1000, 1);
console.log(numBuf.readUInt16BE(1)); // 1000

// Ghi so nguyen 32-bit Little Endian (4 bytes)
numBuf.writeUInt32LE(123456, 4);
console.log(numBuf.readUInt32LE(4)); // 123456

// === Doc/Ghi so thuc (float/double) ===
const floatBuf = Buffer.alloc(8);
floatBuf.writeFloatBE(3.14, 0);
console.log(floatBuf.readFloatBE(0)); // 3.140000104904175 (do lam tron float)

floatBuf.writeDoubleBE(3.14, 0);
console.log(floatBuf.readDoubleBE(0)); // 3.14 (chinh xac hon)
```

### 1.4. Chuyen doi encoding

Node.js Buffer ho tro cac encoding sau: `utf8`, `ascii`, `base64`, `base64url`, `hex`, `binary` (latin1), `utf16le` (ucs2).

```js
const text = 'Node.js Streams rat manh!';
const buf = Buffer.from(text, 'utf8');

// === Chuyen doi giua cac encoding ===
console.log(buf.toString('utf8'));    // 'Node.js Streams rat manh!'
console.log(buf.toString('hex'));     // '4e6f64652e6a732053747265616d73...'
console.log(buf.toString('base64')); // 'Tm9kZS5qcyBTdHJlYW1zIHLhuqV0IG3huqFuaCE='

// === Base64 encoding/decoding - Rat hay dung ===
// Encode string sang base64
function toBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

// Decode base64 ve string
function fromBase64(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf8');
}

const encoded = toBase64('Mat khau bi mat');
console.log(encoded); // 'TWLO6dCBIGtoxINVIGLDrSBt4bqtdA=='
console.log(fromBase64(encoded)); // 'Mat khau bi mat'

// === Chuyen doi hex ===
function toHex(str) {
  return Buffer.from(str, 'utf8').toString('hex');
}

function fromHex(hexStr) {
  return Buffer.from(hexStr, 'hex').toString('utf8');
}

console.log(toHex('Hello')); // '48656c6c6f'
console.log(fromHex('48656c6c6f')); // 'Hello'

// === Encoding anh sang base64 (dung trong API) ===
const fs = require('fs');

// Doc file anh va chuyen sang base64
// const imageBuffer = fs.readFileSync('image.png');
// const base64Image = imageBuffer.toString('base64');
// const dataUri = `data:image/png;base64,${base64Image}`;
```

### 1.5. Cac phuong thuc quan trong cua Buffer

```js
// === Buffer.concat() - Noi nhieu Buffer ===
const buf1 = Buffer.from('Hello ');
const buf2 = Buffer.from('World');
const buf3 = Buffer.from('!');
const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString()); // 'Hello World!'

// Gioi han kich thuoc ket qua
const limited = Buffer.concat([buf1, buf2], 8);
console.log(limited.toString()); // 'Hello Wo'

// === Buffer.compare() - So sanh 2 Buffer ===
const a = Buffer.from('abc');
const b = Buffer.from('abd');
const c = Buffer.from('abc');

console.log(Buffer.compare(a, b)); // -1 (a < b)
console.log(Buffer.compare(b, a)); // 1  (b > a)
console.log(Buffer.compare(a, c)); // 0  (a === c)

// === buf.equals() - Kiem tra bang nhau ===
console.log(a.equals(c)); // true
console.log(a.equals(b)); // false

// === buf.slice() / buf.subarray() - Cat Buffer ===
// LUU Y: slice() tra ve REFERENCE, khong phai copy!
const original = Buffer.from('Hello World');
const sliced = original.slice(0, 5); // DEPRECATED, dung subarray
const sub = original.subarray(0, 5);
console.log(sub.toString()); // 'Hello'

// Thay doi sub SE anh huong original (vi cung vung nho)
sub[0] = 74; // 'J'
console.log(original.toString()); // 'Jello World'

// === buf.copy() - Copy du lieu giua cac Buffer ===
const src = Buffer.from('Hello World');
const dest = Buffer.alloc(5);
src.copy(dest, 0, 0, 5); // copy(target, targetStart, sourceStart, sourceEnd)
console.log(dest.toString()); // 'Hello'

// === buf.indexOf() - Tim kiem trong Buffer ===
const searchBuf = Buffer.from('Hello World Hello');
console.log(searchBuf.indexOf('World'));   // 6
console.log(searchBuf.indexOf('Hello'));   // 0
console.log(searchBuf.indexOf('Hello', 1)); // 12 (tim tu vi tri 1)
console.log(searchBuf.indexOf('xyz'));     // -1 (khong tim thay)

// === buf.includes() - Kiem tra ton tai ===
console.log(searchBuf.includes('World')); // true
console.log(searchBuf.includes('xyz'));   // false

// === buf.fill() - Dien du lieu ===
const fillBuf = Buffer.alloc(10);
fillBuf.fill('abc');
console.log(fillBuf.toString()); // 'abcabcabca'

// === buf.swap16(), buf.swap32(), buf.swap64() ===
// Dao thu tu byte (dung cho endian conversion)
const swapBuf = Buffer.from([0x01, 0x02, 0x03, 0x04]);
swapBuf.swap16();
console.log(swapBuf); // <Buffer 02 01 04 03>

// === Buffer.isBuffer() - Kiem tra co phai Buffer khong ===
console.log(Buffer.isBuffer(buf1));      // true
console.log(Buffer.isBuffer('string'));  // false
console.log(Buffer.isBuffer([]));        // false

// === Buffer.byteLength() - Tinh do dai theo byte ===
console.log(Buffer.byteLength('Hello'));     // 5
console.log(Buffer.byteLength('Xin chao')); // 10 (tieng Viet co dau > 1 byte/ky tu)
console.log('Xin chao'.length);              // 8 (do dai string tinh theo ky tu)

// === Iteration ===
const iterBuf = Buffer.from('Hello');
for (const byte of iterBuf) {
  console.log(byte); // 72, 101, 108, 108, 111
}

// entries(), keys(), values()
for (const [index, byte] of iterBuf.entries()) {
  console.log(`${index}: ${byte}`);
}
```

---

## 2. Streams - Tong quan

### 2.1. Stream la gi?

Stream la mot abstract interface trong Node.js dung de xu ly du lieu theo kieu **dong chay lien tuc** (streaming). Thay vi doc TOAN BO du lieu vao bo nho roi xu ly, Stream cho phep xu ly du lieu **tung phan nho (chunk)** khi no den.

```
Khong dung Stream (doc toan bo vao RAM):
+-------------------+         +-------------------+
|   File 2GB        | ------> |   RAM 2GB+        |
|   tren o dia      |  doc    |   chua toan bo    |
+-------------------+  het    +-------------------+

Dung Stream (doc tung phan):
+-------------------+         +--------+         +-------------------+
|   File 2GB        | ------> | 64KB   | ------> |   Xu ly tung      |
|   tren o dia      |  tung   | chunk  |  xu ly  |   phan, RAM it    |
+-------------------+  chunk  +--------+         +-------------------+
```

### 2.2. Tai sao can Streams?

**1. Hieu qua ve bo nho (Memory Efficiency)**

```js
const fs = require('fs');

// KHONG NEN - Doc toan bo file 2GB vao RAM
// fs.readFile('huge-file.txt', (err, data) => {
//   // data chinh la TOAN BO 2GB trong RAM!
//   // => Co the bi "heap out of memory"
// });

// NEN DUNG - Doc tung phan 64KB
const stream = fs.createReadStream('huge-file.txt');
stream.on('data', (chunk) => {
  // Moi chunk chi khoang 64KB
  console.log(`Nhan duoc ${chunk.length} bytes`);
});
```

**2. Hieu qua ve thoi gian (Time Efficiency)**

```js
// Khong dung stream: Phai DOI doc het file ROI MOI gui response
// Client doi rat lau!

// Dung stream: Vua doc vua gui, client nhan du lieu NGAY
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  const stream = fs.createReadStream('big-video.mp4');
  stream.pipe(res); // Vua doc vua gui!
}).listen(3000);
```

**3. Composability (Kha nang ket hop)**

```js
const fs = require('fs');
const zlib = require('zlib');

// Doc file -> Nen gzip -> Ghi ra file
// Tat ca chay SONG SONG, tung chunk mot!
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));
```

### 2.3. Bon loai Stream

| Loai | Mo ta | Vi du |
|------|-------|-------|
| **Readable** | Stream de doc du lieu | `fs.createReadStream()`, `http.IncomingMessage`, `process.stdin` |
| **Writable** | Stream de ghi du lieu | `fs.createWriteStream()`, `http.ServerResponse`, `process.stdout` |
| **Duplex** | Vua doc vua ghi (doc lap) | `net.Socket`, `TCP socket` |
| **Transform** | Duplex nhung output la bien doi cua input | `zlib.createGzip()`, `crypto.createCipher()` |

```
Readable:    [Data Source] ===> [Consumer]
Writable:    [Producer]    ===> [Data Destination]
Duplex:      [Source] <==> [Destination]  (2 chieu doc lap)
Transform:   [Input] ===> [Bien doi] ===> [Output]
```

---

## 3. Readable Streams

### 3.1. Flowing mode vs Paused mode

Readable Stream co 2 che do hoat dong:

**Flowing mode (Che do chay):**
- Du lieu tu dong duoc doc va cung cap qua event `'data'`
- Du lieu chay lien tuc, nhanh nhat co the
- Kich hoat bang: `stream.on('data', ...)`, `stream.resume()`, hoac `stream.pipe()`

**Paused mode (Che do tam dung) - Mac dinh:**
- Du lieu KHONG tu dong chay
- Phai GOI `stream.read()` de doc tung chunk
- Kich hoat bang: `stream.pause()` hoac xoa het data listener

```js
const fs = require('fs');

// === Flowing mode ===
const flowingStream = fs.createReadStream('file.txt', { encoding: 'utf8' });

// Gan event 'data' => tu dong chuyen sang flowing mode
flowingStream.on('data', (chunk) => {
  console.log('Flowing - Nhan chunk:', chunk.length, 'ky tu');
});

flowingStream.on('end', () => {
  console.log('Flowing - Da doc xong!');
});

// === Paused mode ===
const pausedStream = fs.createReadStream('file.txt', { encoding: 'utf8' });

// Dung event 'readable' => o paused mode
pausedStream.on('readable', () => {
  let chunk;
  // Phai goi read() de lay du lieu
  while ((chunk = pausedStream.read()) !== null) {
    console.log('Paused - Nhan chunk:', chunk.length, 'ky tu');
  }
});

pausedStream.on('end', () => {
  console.log('Paused - Da doc xong!');
});
```

**Chuyen doi giua 2 che do:**

```js
const fs = require('fs');
const stream = fs.createReadStream('file.txt');

// Ban dau: paused mode

// Chuyen sang flowing mode
stream.on('data', (chunk) => {
  console.log('Nhan:', chunk.length, 'bytes');

  // Tam dung (chuyen ve paused mode)
  stream.pause();

  // Tiep tuc sau 1 giay
  setTimeout(() => {
    stream.resume(); // Chuyen lai sang flowing mode
  }, 1000);
});
```

### 3.2. Events cua Readable Stream

```js
const fs = require('fs');
const stream = fs.createReadStream('file.txt');

// 'data' - Khi co du lieu san sang
stream.on('data', (chunk) => {
  console.log(`Nhan ${chunk.length} bytes`);
});

// 'end' - Khi khong con du lieu de doc
stream.on('end', () => {
  console.log('Da doc het du lieu');
});

// 'error' - Khi co loi xay ra
stream.on('error', (err) => {
  console.error('Loi doc stream:', err.message);
});

// 'close' - Khi stream va tat ca tai nguyen da dong
stream.on('close', () => {
  console.log('Stream da dong');
});

// 'readable' - Khi co du lieu co the doc bang read()
// (chi dung trong paused mode)
stream.on('readable', () => {
  let data;
  while ((data = stream.read()) !== null) {
    console.log('Doc duoc:', data.length, 'bytes');
  }
});
```

**Thu tu events:**

```
Readable Stream lifecycle:
  'readable' (paused mode) hoac 'data' (flowing mode)
  -> lap lai nhieu lan cho den khi het du lieu
  -> 'end' (khong con du lieu)
  -> 'close' (tai nguyen da giai phong)

Neu co loi:
  -> 'error'
  -> 'close'
```

### 3.3. Tao custom Readable Stream

```js
const { Readable } = require('stream');

// === Cach 1: Ke thua class Readable ===
class CounterStream extends Readable {
  constructor(max, options) {
    super(options);
    this.max = max;
    this.current = 0;
  }

  // _read() duoc goi khi consumer can du lieu
  _read(size) {
    if (this.current <= this.max) {
      const str = String(this.current) + '\n';
      this.push(str); // Day du lieu vao buffer noi bo
      this.current++;
    } else {
      this.push(null); // null = het du lieu (signal EOF)
    }
  }
}

const counter = new CounterStream(5);
counter.on('data', (chunk) => {
  process.stdout.write(chunk.toString());
});
// Output: 0 1 2 3 4 5

// === Cach 2: Dung Readable.from() (don gian hon) ===
const simpleStream = Readable.from(['Hello\n', 'World\n', 'Stream\n']);
simpleStream.on('data', (chunk) => {
  process.stdout.write(chunk.toString());
});

// === Cach 3: Dung constructor voi read function ===
let i = 0;
const myStream = new Readable({
  read(size) {
    if (i < 5) {
      this.push(`Dong ${i}\n`);
      i++;
    } else {
      this.push(null);
    }
  },
});

myStream.pipe(process.stdout);

// === Cach 4: Readable tu async generator ===
async function* generateData() {
  for (let i = 0; i < 5; i++) {
    // Co the await o day (vi du: doc tu database)
    yield `Data ${i}\n`;
  }
}

const asyncStream = Readable.from(generateData());
asyncStream.on('data', (chunk) => {
  process.stdout.write(chunk.toString());
});

// === Object Mode - Stream chua object thay vi Buffer ===
const objectStream = new Readable({
  objectMode: true,
  read() {
    this.push({ id: 1, name: 'Nguyen Van A' });
    this.push({ id: 2, name: 'Tran Thi B' });
    this.push(null);
  },
});

objectStream.on('data', (obj) => {
  console.log('Nhan object:', obj);
  // Nhan object: { id: 1, name: 'Nguyen Van A' }
  // Nhan object: { id: 2, name: 'Tran Thi B' }
});
```

---

## 4. Writable Streams

### 4.1. Cac phuong thuc cua Writable Stream

```js
const fs = require('fs');

// Tao writable stream
const writable = fs.createWriteStream('output.txt');

// === write() - Ghi du lieu ===
// Tra ve true neu buffer con cho, false neu day (backpressure)
const canContinue = writable.write('Hello World\n');
console.log('Co the tiep tuc ghi:', canContinue);

// write() voi callback
writable.write('Dong thu 2\n', 'utf8', (err) => {
  if (err) {
    console.error('Loi ghi:', err);
  } else {
    console.log('Da ghi xong dong 2');
  }
});

// write() voi Buffer
writable.write(Buffer.from('Du lieu nhi phan\n'));

// === end() - Ket thuc stream ===
// Co the ghi them du lieu cuoi cung truoc khi dong
writable.end('Dong cuoi cung\n', 'utf8', () => {
  console.log('Stream da dong!');
});

// SAU KHI goi end(), KHONG THE ghi them
// writable.write('Nay se loi!'); // Error: write after end
```

### 4.2. Events cua Writable Stream

```js
const fs = require('fs');
const writable = fs.createWriteStream('output.txt');

// 'drain' - Buffer da trang, co the ghi tiep
// (rat quan trong cho backpressure)
writable.on('drain', () => {
  console.log('Buffer da trang, co the ghi tiep');
});

// 'finish' - Tat ca du lieu da duoc flush
writable.on('finish', () => {
  console.log('Tat ca du lieu da ghi xuong');
});

// 'close' - Stream da dong hoan toan
writable.on('close', () => {
  console.log('Stream da dong');
});

// 'error' - Co loi xay ra
writable.on('error', (err) => {
  console.error('Loi:', err.message);
});

// 'pipe' - Khi co readable stream pipe vao
writable.on('pipe', (src) => {
  console.log('Co stream dang pipe vao');
});

// 'unpipe' - Khi readable stream ngung pipe
writable.on('unpipe', (src) => {
  console.log('Stream da ngung pipe');
});
```

### 4.3. cork() va uncork()

`cork()` va `uncork()` dung de **gop nhieu lan ghi nho** thanh **mot lan ghi lon**, giam so lan I/O.

```js
const fs = require('fs');
const writable = fs.createWriteStream('output.txt');

// Khong dung cork: Moi write() co the tao 1 system call rieng
writable.write('Dong 1\n');
writable.write('Dong 2\n');
writable.write('Dong 3\n');
// => 3 system calls

// Dung cork: Gop tat ca lai, chi 1 system call
writable.cork();
writable.write('Dong 4\n');
writable.write('Dong 5\n');
writable.write('Dong 6\n');
writable.uncork(); // Flush tat ca cung mot luc
// => 1 system call

// cork() co the long nhau (nested)
writable.cork();
writable.cork();
writable.write('Data A\n');
writable.uncork(); // Van chua flush (vi con 1 cork)
writable.write('Data B\n');
writable.uncork(); // Bay gio moi flush tat ca
// => Data A va Data B duoc ghi cung mot luc

// === Tip: Dung process.nextTick de tu dong uncork ===
writable.cork();
writable.write('Data 1\n');
writable.write('Data 2\n');
process.nextTick(() => writable.uncork());
// uncork se chay sau khi tat ca write() trong tick hien tai hoan thanh
```

### 4.4. Tao custom Writable Stream

```js
const { Writable } = require('stream');

// === Cach 1: Ke thua class Writable ===
class LogStream extends Writable {
  constructor(options) {
    super(options);
    this.logs = [];
  }

  // _write() duoc goi cho MOI chunk
  _write(chunk, encoding, callback) {
    const entry = {
      timestamp: new Date().toISOString(),
      message: chunk.toString().trim(),
    };
    this.logs.push(entry);
    console.log(`[LOG] ${entry.timestamp}: ${entry.message}`);

    // GOI callback() de bao da xu ly xong chunk nay
    // Neu co loi: callback(new Error('...'))
    callback();
  }

  // _writev() - Xu ly nhieu chunk cung luc (optional, tot hon cho performance)
  _writev(chunks, callback) {
    for (const { chunk, encoding } of chunks) {
      const entry = {
        timestamp: new Date().toISOString(),
        message: chunk.toString().trim(),
      };
      this.logs.push(entry);
    }
    console.log(`[LOG] Da ghi ${chunks.length} entries cung luc`);
    callback();
  }

  // _final() - Goi truoc khi stream dong (optional)
  _final(callback) {
    console.log(`[LOG] Tong cong ${this.logs.length} log entries`);
    callback();
  }

  getLogs() {
    return this.logs;
  }
}

const logger = new LogStream();
logger.write('Server started\n');
logger.write('User logged in\n');
logger.write('Request received\n');
logger.end(() => {
  console.log('Tat ca logs:', logger.getLogs());
});

// === Cach 2: Dung constructor don gian ===
const simpleWritable = new Writable({
  write(chunk, encoding, callback) {
    // Xu ly du lieu o day
    console.log('Nhan:', chunk.toString());
    callback();
  },
});

simpleWritable.write('Hello\n');
simpleWritable.write('World\n');
simpleWritable.end();

// === Object mode Writable ===
const dbWriter = new Writable({
  objectMode: true,
  write(record, encoding, callback) {
    // Gia lap ghi vao database
    console.log('Ghi vao DB:', JSON.stringify(record));
    // Trong thuc te: await db.insert(record)
    setTimeout(callback, 100); // Gia lap async
  },
});

dbWriter.write({ id: 1, name: 'Nguyen Van A' });
dbWriter.write({ id: 2, name: 'Tran Thi B' });
dbWriter.end();
```

---

## 5. Duplex va Transform Streams

### 5.1. Duplex Stream

Duplex Stream ket hop ca Readable va Writable. Hai ben **doc lap voi nhau** - du lieu ghi vao KHONG tu dong tro thanh du lieu doc ra.

Vi du thuc te: TCP Socket - ban co the vua gui vua nhan du lieu.

```js
const { Duplex } = require('stream');

// === Custom Duplex Stream ===
class EchoStream extends Duplex {
  constructor(options) {
    super(options);
    this.data = [];
  }

  // Phan Writable: nhan du lieu ghi vao
  _write(chunk, encoding, callback) {
    // Luu du lieu de Readable doc ra sau
    this.data.push(chunk);
    callback();
  }

  // Phan Readable: tra du lieu khi consumer doc
  _read(size) {
    if (this.data.length > 0) {
      this.push(this.data.shift());
    } else {
      // Khong co du lieu, doi write tiep
      // Dung setImmediate de tranh blocking
      setImmediate(() => this._read(size));
    }
  }
}

// === PassThrough Stream (Duplex dac biet) ===
const { PassThrough } = require('stream');
const pass = new PassThrough();

pass.on('data', (chunk) => {
  console.log('PassThrough nhan:', chunk.toString());
});

pass.write('Hello');
pass.write(' World');
pass.end();
// PassThrough chi don gian truyen du lieu qua, khong bien doi

// === Ung dung: Dem so byte di qua ===
class ByteCounter extends Duplex {
  constructor(options) {
    super(options);
    this.byteCount = 0;
  }

  _write(chunk, encoding, callback) {
    this.byteCount += chunk.length;
    this.push(chunk); // Truyen du lieu qua
    callback();
  }

  _read(size) {
    // Du lieu da duoc push trong _write
  }

  _final(callback) {
    console.log(`Tong cong: ${this.byteCount} bytes`);
    this.push(null);
    callback();
  }
}
```

### 5.2. Transform Stream

Transform Stream la Duplex Stream dac biet, trong do **output la phep bien doi cua input**. Day la loai stream THUONG DUNG NHAT.

```js
const { Transform } = require('stream');

// === Vi du 1: Chuyen thanh chu hoa ===
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    // this.push() de day du lieu da bien doi ra
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

const upper = new UpperCaseTransform();
upper.on('data', (chunk) => {
  console.log(chunk.toString()); // 'HELLO WORLD'
});
upper.write('hello world');
upper.end();

// === Vi du 2: JSON parser line by line ===
class JsonLineParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true }); // Output la object
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');

    // Giu dong cuoi (co the chua day du)
    this.buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        try {
          this.push(JSON.parse(line));
        } catch (err) {
          this.emit('error', new Error(`JSON parse error: ${line}`));
        }
      }
    }
    callback();
  }

  _flush(callback) {
    // Xu ly du lieu con lai trong buffer
    if (this.buffer.trim()) {
      try {
        this.push(JSON.parse(this.buffer));
      } catch (err) {
        this.emit('error', new Error(`JSON parse error: ${this.buffer}`));
      }
    }
    callback();
  }
}

// Su dung:
const parser = new JsonLineParser();
parser.on('data', (obj) => {
  console.log('Parsed object:', obj);
});

parser.write('{"name":"Nguyen Van A","age":25}\n');
parser.write('{"name":"Tran Thi B","age":30}\n');
parser.end();
// Parsed object: { name: 'Nguyen Van A', age: 25 }
// Parsed object: { name: 'Tran Thi B', age: 30 }

// === Vi du 3: Filter Transform ===
class FilterTransform extends Transform {
  constructor(filterFn, options) {
    super({ ...options, objectMode: true });
    this.filterFn = filterFn;
  }

  _transform(chunk, encoding, callback) {
    if (this.filterFn(chunk)) {
      this.push(chunk);
    }
    callback();
  }
}

// === Vi du 4: Replace text transform ===
class ReplaceTransform extends Transform {
  constructor(search, replace, options) {
    super(options);
    this.search = search;
    this.replace = replace;
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString();
    this.push(str.replaceAll(this.search, this.replace));
    callback();
  }
}

// Dung de thay the tu trong file
const fs = require('fs');
// fs.createReadStream('input.txt')
//   .pipe(new ReplaceTransform('foo', 'bar'))
//   .pipe(fs.createWriteStream('output.txt'));

// === Vi du 5: Encrypt/Decrypt don gian ===
class CaesarCipher extends Transform {
  constructor(shift, options) {
    super(options);
    this.shift = shift;
  }

  _transform(chunk, encoding, callback) {
    const input = chunk.toString();
    let output = '';
    for (const char of input) {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        output += String.fromCharCode(((code - 65 + this.shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        output += String.fromCharCode(((code - 97 + this.shift) % 26) + 97);
      } else {
        output += char;
      }
    }
    this.push(output);
    callback();
  }
}

const cipher = new CaesarCipher(3);
cipher.on('data', (chunk) => console.log(chunk.toString()));
cipher.write('Hello World'); // 'Khoor Zruog'
cipher.end();
```

---

## 6. pipe() va pipeline()

### 6.1. pipe()

`pipe()` ket noi Readable Stream voi Writable Stream, tu dong xu ly backpressure.

```js
const fs = require('fs');
const zlib = require('zlib');

// === Cu phap co ban ===
// readable.pipe(writable)
const readable = fs.createReadStream('input.txt');
const writable = fs.createWriteStream('output.txt');
readable.pipe(writable);

// === pipe() tra ve destination stream ===
// => Co the chain (noi tiep) nhieu pipe
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())           // Nen
  .pipe(fs.createWriteStream('input.txt.gz')); // Ghi ra file

// === pipe() voi nhieu destination ===
const source = fs.createReadStream('input.txt');
const dest1 = fs.createWriteStream('copy1.txt');
const dest2 = fs.createWriteStream('copy2.txt');

source.pipe(dest1);
source.pipe(dest2); // Du lieu chay vao CA HAI destination

// === Han che cua pipe() ===
// 1. KHONG tu dong xu ly loi (error) tot
// Neu mot stream trong chain bi loi, cac stream khac KHONG tu dong dong
// => Ro ri tai nguyen (resource leak)!

fs.createReadStream('file-khong-ton-tai.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.gz'));
// Neu file khong ton tai -> readable emit 'error'
// Nhung gzip va writable VAN con mo! => LEAK!

// Cach khac phuc (thu cong):
const read = fs.createReadStream('input.txt');
const gzip = zlib.createGzip();
const write = fs.createWriteStream('output.gz');

read.on('error', handleError);
gzip.on('error', handleError);
write.on('error', handleError);

function handleError(err) {
  console.error('Loi:', err.message);
  read.destroy();
  gzip.destroy();
  write.destroy();
}

read.pipe(gzip).pipe(write);
// => Qua nhieu code! => Dung pipeline() thay the
```

### 6.2. pipeline()

`pipeline()` la cach **tot nhat** de ket noi nhieu stream. No tu dong xu ly loi va don dep tai nguyen.

```js
const { pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const zlib = require('zlib');

// === pipeline() voi callback ===
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline that bai:', err);
    } else {
      console.log('Pipeline thanh cong!');
    }
    // Tat ca stream da duoc dong (du thanh cong hay that bai)
  }
);

// === pipeline() voi Promise (khuyen dung) ===
const pipelineAsync = promisify(pipeline);
// Hoac tu Node.js 15+:
// const { pipeline } = require('stream/promises');

async function compressFile(input, output) {
  try {
    await pipelineAsync(
      fs.createReadStream(input),
      zlib.createGzip(),
      fs.createWriteStream(output)
    );
    console.log('Nen file thanh cong!');
  } catch (err) {
    console.error('Loi nen file:', err.message);
  }
}

compressFile('bigfile.txt', 'bigfile.txt.gz');

// === pipeline() voi stream/promises (Node.js 15+) ===
const { pipeline: pipelinePromise } = require('stream/promises');

async function processFile() {
  await pipelinePromise(
    fs.createReadStream('data.json'),
    new Transform({
      transform(chunk, encoding, callback) {
        // Xu ly du lieu
        callback(null, chunk.toString().toUpperCase());
      },
    }),
    fs.createWriteStream('data-upper.json')
  );
}

// === pipeline() voi nhieu Transform ===
const { Transform } = require('stream');

async function multiStepProcessing() {
  const addLineNumbers = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const numbered = lines
        .map((line, i) => `${i + 1}: ${line}`)
        .join('\n');
      callback(null, numbered);
    },
  });

  const addTimestamp = new Transform({
    transform(chunk, encoding, callback) {
      const timestamp = new Date().toISOString();
      callback(null, `[${timestamp}]\n${chunk.toString()}\n`);
    },
  });

  await pipelinePromise(
    fs.createReadStream('input.txt'),
    addLineNumbers,
    addTimestamp,
    fs.createWriteStream('output.txt')
  );
}

// === So sanh pipe() vs pipeline() ===
/*
| Dac diem        | pipe()                    | pipeline()                      |
|----------------|---------------------------|----------------------------------|
| Error handling | Phai tu lam               | Tu dong                          |
| Cleanup        | Phai tu dong stream       | Tu dong dong tat ca stream       |
| Promise        | Khong ho tro              | Ho tro (promisify hoac /promises)|
| Syntax         | readable.pipe(writable)   | pipeline(s1, s2, ..., callback)  |
| Khuyen dung    | Chi cho truong hop don gian| Luon luon                       |
*/
```

---

## 7. Backpressure

### 7.1. Backpressure la gi?

Backpressure (ap luc nguoc) xay ra khi **producer (nguoi tao du lieu) tao du lieu NHANH HON consumer (nguoi tieu thu du lieu) co the xu ly**.

```
Producer (Nhanh)          Consumer (Cham)
+----------+   data    +----------+
|  Doc tu  | ========> |  Ghi ra  |  <= CHAM!
|  SSD     |   nhanh   |  HDD     |
+----------+           +----------+

Neu khong xu ly backpressure:
- Buffer trong RAM tang lien tuc
- => Out of memory
- => Process crash!
```

Vi du thuc te: Doc file tu SSD (500MB/s) va ghi ra HDD (100MB/s). Moi giay, 400MB du lieu bi "ket" trong RAM.

### 7.2. Co che hoat dong

Node.js Streams co co che backpressure **tu dong** thong qua:

1. **`highWaterMark`**: Gioi han kich thuoc buffer noi bo (mac dinh 16KB cho Buffer, 16 objects cho objectMode)
2. **`write()` tra ve `false`**: Bao hieu buffer da day
3. **Event `'drain'`**: Bao hieu buffer da trang, co the ghi tiep

```
1. write() tra ve true  => Buffer con cho, ghi tiep!
2. write() tra ve false => Buffer DAY, DUNG GHI!
3. Event 'drain'         => Buffer da trang, GHI TIEP!

+------------------+
|  Internal Buffer |
|  [####........]  |  <- Con cho => write() = true
|  [############]  |  <- Day!    => write() = false => DUNG!
|  [............]  |  <- Trang!  => emit 'drain' => GHI TIEP
+------------------+
   highWaterMark
```

### 7.3. Xu ly Backpressure thu cong

```js
const fs = require('fs');

// === Vi du: Copy file CO xu ly backpressure ===
function copyFileWithBackpressure(src, dest) {
  return new Promise((resolve, reject) => {
    const readable = fs.createReadStream(src);
    const writable = fs.createWriteStream(dest);

    readable.on('data', (chunk) => {
      // write() tra ve false => buffer day
      const canContinue = writable.write(chunk);

      if (!canContinue) {
        // DUNG doc cho den khi buffer trang
        readable.pause();
        console.log('Backpressure! Tam dung doc...');
      }
    });

    // Khi buffer da trang, tiep tuc doc
    writable.on('drain', () => {
      console.log('Buffer da trang, tiep tuc doc...');
      readable.resume();
    });

    readable.on('end', () => {
      writable.end();
    });

    writable.on('finish', () => {
      console.log('Copy hoan thanh!');
      resolve();
    });

    readable.on('error', reject);
    writable.on('error', reject);
  });
}

// copyFileWithBackpressure('big-file.dat', 'copy-file.dat');

// === Vi du: Ghi nhieu du lieu voi backpressure ===
function writeMillionLines(filePath) {
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(filePath);
    let i = 0;
    const max = 1000000;

    function write() {
      let ok = true;
      while (i < max && ok) {
        i++;
        const data = `Dong thu ${i} - ${Date.now()}\n`;

        if (i === max) {
          // Dong cuoi cung
          writable.write(data, () => {
            writable.end();
          });
        } else {
          // write() tra ve false khi buffer day
          ok = writable.write(data);
        }
      }

      if (i < max) {
        // Buffer day, doi drain event
        writable.once('drain', write);
      }
    }

    writable.on('finish', resolve);
    writable.on('error', reject);

    write(); // Bat dau ghi
  });
}

// writeMillionLines('million-lines.txt')
//   .then(() => console.log('Da ghi 1 trieu dong!'));

// === LUU Y: pipe() va pipeline() TU DONG xu ly backpressure ===
// Nen dung pipe/pipeline thay vi tu lam!
```

**highWaterMark:**

```js
const fs = require('fs');

// Mac dinh highWaterMark = 64 * 1024 (64KB) cho file streams
const stream1 = fs.createReadStream('file.txt');

// Tu dinh highWaterMark
const stream2 = fs.createReadStream('file.txt', {
  highWaterMark: 1024, // 1KB - doc tung chunk 1KB
});

const stream3 = fs.createReadStream('file.txt', {
  highWaterMark: 1024 * 1024, // 1MB - doc tung chunk 1MB
});

// highWaterMark NHO:
// + It RAM hon
// - Nhieu I/O call hon, co the cham hon

// highWaterMark LON:
// + It I/O call, nhanh hon
// - Dung nhieu RAM hon
```

---

## 8. Xu ly file lon voi Streams

### 8.1. So sanh readFile vs createReadStream

```js
const fs = require('fs');

// === readFile - Doc TOAN BO file vao RAM ===
// KHONG nen dung voi file lon!

console.log('--- readFile ---');
console.log('Truoc readFile:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');

fs.readFile('big-file.txt', (err, data) => {
  if (err) throw err;
  console.log('Sau readFile:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
  // Neu file 1GB => RAM tang ~1GB!
  console.log('Kich thuoc data:', data.length / 1024 / 1024, 'MB');
});

// === createReadStream - Doc tung chunk ===
// LUON NEN dung voi file lon!

console.log('\n--- createReadStream ---');
let totalBytes = 0;
const stream = fs.createReadStream('big-file.txt');

stream.on('data', (chunk) => {
  totalBytes += chunk.length;
  // Moi chunk chi ~64KB, RAM KHONG tang nhieu
});

stream.on('end', () => {
  console.log('Tong bytes doc duoc:', totalBytes / 1024 / 1024, 'MB');
  console.log('RAM su dung:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
  // RAM chi tang vai MB du file nhieu GB!
});

/*
Bang so sanh:

| Tieu chi          | readFile()           | createReadStream()      |
|-------------------|----------------------|--------------------------|
| Bo nho            | Doc TOAN BO vao RAM  | Chi giu 1 chunk (~64KB) |
| File 10MB         | OK                   | OK                       |
| File 1GB          | Nguy hiem!           | OK                       |
| File 10GB         | CRASH!               | OK                       |
| Thoi gian bat dau | Doi doc het moi xu ly| Xu ly ngay chunk dau tien|
| Syntax            | Don gian             | Phuc tap hon             |
| Error handling    | Callback don gian    | Can xu ly events         |
| Khi nao dung      | File nho (< 10MB)    | File bat ky kich thuoc   |
*/
```

### 8.2. Doc file nhieu GB ma khong het RAM

```js
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { Transform } = require('stream');

// === Vi du: Dem so dong cua file 10GB ===
async function countLines(filePath) {
  let lineCount = 0;

  const lineCounter = new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString();
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '\n') lineCount++;
      }
      callback(null, chunk); // Truyen du lieu qua (hoac khong truyen)
    },
  });

  const readable = fs.createReadStream(filePath);

  await pipeline(
    readable,
    lineCounter,
    // Ghi vao /dev/null (khong giu du lieu)
    fs.createWriteStream('/dev/null')
  );

  return lineCount;
}

// countLines('huge-file.txt').then(count => {
//   console.log(`File co ${count} dong`);
// });

// === Vi du: Tim kiem trong file lon ===
async function searchInFile(filePath, searchTerm) {
  const results = [];
  let lineNumber = 0;
  let buffer = '';

  const searcher = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Giu dong chua hoan chinh

      for (const line of lines) {
        lineNumber++;
        if (line.includes(searchTerm)) {
          results.push({ line: lineNumber, content: line.trim() });
        }
      }
      callback();
    },
    flush(callback) {
      // Xu ly dong cuoi cung
      if (buffer) {
        lineNumber++;
        if (buffer.includes(searchTerm)) {
          results.push({ line: lineNumber, content: buffer.trim() });
        }
      }
      callback();
    },
  });

  const readable = fs.createReadStream(filePath, { encoding: 'utf8' });

  await pipeline(readable, searcher);
  return results;
}

// searchInFile('huge-log.txt', 'ERROR').then(results => {
//   console.log(`Tim thay ${results.length} ket qua`);
//   results.forEach(r => console.log(`  Dong ${r.line}: ${r.content}`));
// });

// === Vi du: Xu ly file CSV 5GB ===
async function processLargeCSV(filePath) {
  let totalRows = 0;
  let totalAmount = 0;
  let buffer = '';
  let headers = null;

  const csvProcessor = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!headers) {
          headers = line.split(',');
          continue;
        }

        const values = line.split(',');
        const row = {};
        headers.forEach((h, i) => {
          row[h.trim()] = values[i]?.trim();
        });

        totalRows++;
        if (row.amount) {
          totalAmount += parseFloat(row.amount) || 0;
        }

        // Push ket qua (optional)
        this.push(row);
      }
      callback();
    },
  });

  const readable = fs.createReadStream(filePath, { encoding: 'utf8' });

  // Doc va xu ly, khong can luu ket qua
  csvProcessor.on('data', () => {}); // Tieu thu data
  await pipeline(readable, csvProcessor);

  return { totalRows, totalAmount };
}

// processLargeCSV('sales-data.csv').then(result => {
//   console.log(`Tong: ${result.totalRows} dong, $${result.totalAmount}`);
// });
```

---

## 9. Practical Examples

### 9.1. Copy file lon

```js
const fs = require('fs');
const { pipeline } = require('stream/promises');

// === Cach 1: Don gian voi pipeline (KHUYEN DUNG) ===
async function copyFile(src, dest) {
  await pipeline(
    fs.createReadStream(src),
    fs.createWriteStream(dest)
  );
  console.log(`Da copy ${src} -> ${dest}`);
}

// === Cach 2: Voi progress (hien thi % hoan thanh) ===
async function copyFileWithProgress(src, dest) {
  const { Transform } = require('stream');

  // Lay kich thuoc file
  const stat = fs.statSync(src);
  const totalBytes = stat.size;
  let copiedBytes = 0;

  const progressTracker = new Transform({
    transform(chunk, encoding, callback) {
      copiedBytes += chunk.length;
      const percent = ((copiedBytes / totalBytes) * 100).toFixed(1);
      const mb = (copiedBytes / 1024 / 1024).toFixed(1);
      const totalMb = (totalBytes / 1024 / 1024).toFixed(1);

      // Ghi de dong hien tai (\r = carriage return)
      process.stdout.write(`\rCopy: ${mb}MB / ${totalMb}MB (${percent}%)`);

      callback(null, chunk); // Truyen chunk qua
    },
  });

  await pipeline(
    fs.createReadStream(src),
    progressTracker,
    fs.createWriteStream(dest)
  );

  console.log('\nCopy hoan thanh!');
}

// copyFileWithProgress('large-video.mp4', 'backup-video.mp4');

// === Cach 3: Copy nhieu file song song ===
async function copyMultipleFiles(filePairs) {
  const promises = filePairs.map(([src, dest]) =>
    pipeline(
      fs.createReadStream(src),
      fs.createWriteStream(dest)
    )
  );

  await Promise.all(promises);
  console.log(`Da copy ${filePairs.length} files`);
}

// copyMultipleFiles([
//   ['file1.txt', 'backup/file1.txt'],
//   ['file2.txt', 'backup/file2.txt'],
//   ['file3.txt', 'backup/file3.txt'],
// ]);
```

### 9.2. Compress va Decompress voi Gzip

```js
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

// === Nen file voi Gzip ===
async function compressGzip(input, output) {
  await pipeline(
    fs.createReadStream(input),
    zlib.createGzip({
      level: 6, // 1 (nhanh, nen it) -> 9 (cham, nen nhieu). Mac dinh: 6
    }),
    fs.createWriteStream(output || `${input}.gz`)
  );

  const originalSize = fs.statSync(input).size;
  const compressedSize = fs.statSync(output || `${input}.gz`).size;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  console.log(`Nen: ${originalSize} -> ${compressedSize} bytes (giam ${ratio}%)`);
}

// compressGzip('large-log.txt', 'large-log.txt.gz');

// === Giai nen Gzip ===
async function decompressGzip(input, output) {
  const outputPath = output || input.replace('.gz', '');
  await pipeline(
    fs.createReadStream(input),
    zlib.createGunzip(),
    fs.createWriteStream(outputPath)
  );
  console.log(`Giai nen: ${input} -> ${outputPath}`);
}

// decompressGzip('large-log.txt.gz', 'large-log-restored.txt');

// === Nen voi Brotli (nen tot hon Gzip) ===
async function compressBrotli(input, output) {
  await pipeline(
    fs.createReadStream(input),
    zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
        // 0 (nhanh nhat) -> 11 (nen tot nhat)
      },
    }),
    fs.createWriteStream(output || `${input}.br`)
  );
  console.log('Nen Brotli thanh cong!');
}

// === Nen buffer (khong can file) ===
function compressString(str) {
  return new Promise((resolve, reject) => {
    zlib.gzip(str, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function decompressString(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buffer, (err, result) => {
      if (err) reject(err);
      else resolve(result.toString());
    });
  });
}

// Su dung
async function demo() {
  const original = 'Du lieu can nen '.repeat(1000);
  console.log('Original:', original.length, 'bytes');

  const compressed = await compressString(original);
  console.log('Compressed:', compressed.length, 'bytes');

  const decompressed = await decompressString(compressed);
  console.log('Decompressed:', decompressed.length, 'bytes');
  console.log('Giong nhau:', original === decompressed);
}

// demo();

// === Nen voi Deflate ===
async function compressDeflate(input, output) {
  await pipeline(
    fs.createReadStream(input),
    zlib.createDeflate(),
    fs.createWriteStream(output || `${input}.deflate`)
  );
}
```

### 9.3. CSV parsing tung dong

```js
const fs = require('fs');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

// === CSV Line Parser ===
class CSVParser extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    this.headers = null;
    this.delimiter = options.delimiter || ',';
    this.buffer = '';
    this.rowCount = 0;
  }

  _parseCSVLine(line) {
    // Xu ly truong hop co dau phay trong ngoac kep
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Bo qua dau " tiep theo
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === this.delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // Giu dong chua hoan chinh

    for (const line of lines) {
      if (!line.trim()) continue;

      if (!this.headers) {
        this.headers = this._parseCSVLine(line);
        continue;
      }

      const values = this._parseCSVLine(line);
      const row = {};
      this.headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      this.rowCount++;
      this.push(row);
    }

    callback();
  }

  _flush(callback) {
    // Xu ly dong cuoi cung
    if (this.buffer.trim() && this.headers) {
      const values = this._parseCSVLine(this.buffer);
      const row = {};
      this.headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      this.rowCount++;
      this.push(row);
    }
    callback();
  }
}

// === Su dung CSVParser ===
async function processCSV(filePath) {
  const parser = new CSVParser();
  const results = [];

  parser.on('data', (row) => {
    results.push(row);
    // Hoac xu ly tung dong ngay (tot hon cho file lon)
    // console.log('Row:', row);
  });

  await pipeline(
    fs.createReadStream(filePath, { encoding: 'utf8' }),
    parser
  );

  console.log(`Da xu ly ${parser.rowCount} dong`);
  return results;
}

// === Vi du voi file CSV mau ===
// Tao file CSV mau de test
function createSampleCSV(filePath, numRows = 1000) {
  const writable = fs.createWriteStream(filePath);
  writable.write('id,name,email,age,salary\n');

  for (let i = 1; i <= numRows; i++) {
    const line = `${i},"Nguyen Van ${i}",user${i}@email.com,${20 + (i % 40)},${30000 + i * 100}\n`;
    writable.write(line);
  }

  writable.end();
  console.log(`Da tao file CSV voi ${numRows} dong`);
}

// createSampleCSV('sample.csv', 10000);

// === CSV voi loc va thong ke ===
async function analyzeCSV(filePath) {
  const parser = new CSVParser();
  let totalSalary = 0;
  let count = 0;
  let maxSalary = 0;
  let minSalary = Infinity;

  parser.on('data', (row) => {
    const salary = parseFloat(row.salary) || 0;
    totalSalary += salary;
    count++;
    maxSalary = Math.max(maxSalary, salary);
    minSalary = Math.min(minSalary, salary);
  });

  await pipeline(
    fs.createReadStream(filePath, { encoding: 'utf8' }),
    parser
  );

  return {
    totalRows: count,
    avgSalary: (totalSalary / count).toFixed(2),
    maxSalary,
    minSalary,
  };
}

// analyzeCSV('sample.csv').then(console.log);
```

### 9.4. HTTP streaming response

```js
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream');

const server = http.createServer((req, res) => {
  // === Streaming file lon ===
  if (req.url === '/video') {
    const filePath = 'video.mp4';
    const stat = fs.statSync(filePath);

    // Ho tro Range requests (cho video player)
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  // === Streaming JSON lon (array) ===
  if (req.url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write('[');

    let first = true;
    for (let i = 0; i < 100000; i++) {
      const user = JSON.stringify({
        id: i,
        name: `User ${i}`,
        email: `user${i}@email.com`,
      });

      if (!first) res.write(',');
      res.write(user);
      first = false;
    }

    res.write(']');
    res.end();
    return;
  }

  // === Streaming voi Gzip compression ===
  if (req.url === '/api/large-data') {
    const acceptEncoding = req.headers['accept-encoding'] || '';

    res.setHeader('Content-Type', 'application/json');

    let outputStream = res;

    if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      outputStream = zlib.createGzip();
      outputStream.pipe(res);
    } else if (acceptEncoding.includes('deflate')) {
      res.setHeader('Content-Encoding', 'deflate');
      outputStream = zlib.createDeflate();
      outputStream.pipe(res);
    }

    // Ghi du lieu vao outputStream
    outputStream.write('{"data":[');
    for (let i = 0; i < 10000; i++) {
      if (i > 0) outputStream.write(',');
      outputStream.write(JSON.stringify({ id: i, value: Math.random() }));
    }
    outputStream.write(']}');
    outputStream.end();
    return;
  }

  // === Server-Sent Events (SSE) - Streaming su kien ===
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      res.write(`data: ${JSON.stringify({ count: counter, time: Date.now() })}\n\n`);

      if (counter >= 10) {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
    });
    return;
  }

  // === Streaming file voi MIME type ===
  if (req.url.startsWith('/static/')) {
    const filePath = '.' + req.url;
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
    };

    const path = require('path');
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.writeHead(404);
      res.end('File not found');
    });

    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// server.listen(3000, () => console.log('Server chay tren port 3000'));
```

### 9.5. Progress bar khi doc file

```js
const fs = require('fs');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

class ProgressBar extends Transform {
  constructor(totalSize, options = {}) {
    super(options);
    this.totalSize = totalSize;
    this.transferred = 0;
    this.startTime = Date.now();
    this.barLength = options.barLength || 40;
  }

  _transform(chunk, encoding, callback) {
    this.transferred += chunk.length;
    this._render();
    callback(null, chunk);
  }

  _render() {
    const percent = Math.min(this.transferred / this.totalSize, 1);
    const filled = Math.round(this.barLength * percent);
    const empty = this.barLength - filled;
    const bar = '#'.repeat(filled) + '-'.repeat(empty);

    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = this.transferred / elapsed;
    const remaining = (this.totalSize - this.transferred) / speed;

    const mbTransferred = (this.transferred / 1024 / 1024).toFixed(1);
    const mbTotal = (this.totalSize / 1024 / 1024).toFixed(1);
    const mbSpeed = (speed / 1024 / 1024).toFixed(1);

    process.stdout.write(
      `\r[${bar}] ${(percent * 100).toFixed(1)}% | ` +
      `${mbTransferred}/${mbTotal} MB | ` +
      `${mbSpeed} MB/s | ` +
      `ETA: ${remaining.toFixed(0)}s`
    );

    if (this.transferred >= this.totalSize) {
      process.stdout.write('\n');
    }
  }
}

// Su dung:
async function copyWithProgress(src, dest) {
  const stat = fs.statSync(src);
  const progress = new ProgressBar(stat.size);

  await pipeline(
    fs.createReadStream(src),
    progress,
    fs.createWriteStream(dest)
  );

  console.log('Hoan thanh!');
}

// copyWithProgress('large-file.zip', 'backup.zip');
```

---

## 10. Stream Events chi tiet

```
+==========================================+
|            READABLE STREAM               |
+==========================================+
| Event       | Khi nao emit              |
|-------------|---------------------------|
| 'data'      | Co chunk data san sang    |
| 'readable'  | Co data co the doc (read) |
| 'end'       | Khong con data de doc     |
| 'close'     | Stream dong hoan toan     |
| 'error'     | Co loi xay ra             |
| 'pause'     | Stream bi pause           |
| 'resume'    | Stream duoc resume        |
+==========================================+

+==========================================+
|            WRITABLE STREAM               |
+==========================================+
| Event       | Khi nao emit              |
|-------------|---------------------------|
| 'drain'     | Buffer da trang           |
| 'finish'    | Tat ca data da flush      |
| 'close'     | Stream dong hoan toan     |
| 'error'     | Co loi xay ra             |
| 'pipe'      | Readable pipe vao         |
| 'unpipe'    | Readable ngung pipe       |
+==========================================+

Thu tu events cua Readable:
  'readable'/'data' (nhieu lan)
  -> 'end'
  -> 'close'

Thu tu events cua Writable:
  'drain' (nhieu lan, khi buffer day roi trang)
  -> 'finish' (sau khi goi end())
  -> 'close'
```

```js
const fs = require('fs');
const { Writable } = require('stream');

// === Theo doi TAT CA events cua Readable ===
function traceReadable(stream, name = 'ReadStream') {
  stream.on('data', (chunk) => {
    console.log(`[${name}] data: ${chunk.length} bytes`);
  });
  stream.on('readable', () => {
    console.log(`[${name}] readable`);
  });
  stream.on('end', () => {
    console.log(`[${name}] end`);
  });
  stream.on('close', () => {
    console.log(`[${name}] close`);
  });
  stream.on('error', (err) => {
    console.log(`[${name}] error: ${err.message}`);
  });
  stream.on('pause', () => {
    console.log(`[${name}] pause`);
  });
  stream.on('resume', () => {
    console.log(`[${name}] resume`);
  });
  return stream;
}

// === Theo doi TAT CA events cua Writable ===
function traceWritable(stream, name = 'WriteStream') {
  stream.on('drain', () => {
    console.log(`[${name}] drain`);
  });
  stream.on('finish', () => {
    console.log(`[${name}] finish`);
  });
  stream.on('close', () => {
    console.log(`[${name}] close`);
  });
  stream.on('error', (err) => {
    console.log(`[${name}] error: ${err.message}`);
  });
  stream.on('pipe', () => {
    console.log(`[${name}] pipe`);
  });
  stream.on('unpipe', () => {
    console.log(`[${name}] unpipe`);
  });
  return stream;
}

// Su dung:
// const r = traceReadable(fs.createReadStream('input.txt'));
// const w = traceWritable(fs.createWriteStream('output.txt'));
// r.pipe(w);
```

---

## 11. Cac loi thuong gap

### Loi 1: Doc file lon bang readFile

```js
// SAI - Se crash voi file lon
const fs = require('fs');
fs.readFile('file-5gb.log', (err, data) => {
  // FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
  // - JavaScript heap out of memory
});

// DUNG - Dung stream
const stream = fs.createReadStream('file-5gb.log');
stream.on('data', (chunk) => {
  // Xu ly tung chunk 64KB
});
```

### Loi 2: Khong xu ly error event

```js
// SAI - Neu file khong ton tai -> uncaught exception -> crash!
const stream = fs.createReadStream('file-khong-ton-tai.txt');
stream.pipe(process.stdout);

// DUNG - Luon xu ly error
const stream2 = fs.createReadStream('file-khong-ton-tai.txt');
stream2.on('error', (err) => {
  console.error('Loi:', err.message);
});
stream2.pipe(process.stdout);

// TOT NHAT - Dung pipeline()
const { pipeline } = require('stream');
pipeline(
  fs.createReadStream('file-khong-ton-tai.txt'),
  process.stdout,
  (err) => {
    if (err) console.error('Loi:', err.message);
  }
);
```

### Loi 3: Khong xu ly backpressure

```js
// SAI - Ghi lien tuc khong kiem tra backpressure
const writable = fs.createWriteStream('output.txt');
for (let i = 0; i < 10000000; i++) {
  writable.write(`Dong ${i}\n`);
  // Buffer cu tang lien tuc -> ngon het RAM!
}

// DUNG - Kiem tra gia tri tra ve cua write()
const writable2 = fs.createWriteStream('output.txt');
let i = 0;

function write() {
  let ok = true;
  while (i < 10000000 && ok) {
    ok = writable2.write(`Dong ${i}\n`);
    i++;
  }
  if (i < 10000000) {
    writable2.once('drain', write);
  } else {
    writable2.end();
  }
}
write();
```

### Loi 4: Dung pipe() ma khong xu ly loi

```js
// SAI
readable.pipe(transform).pipe(writable);
// Neu transform emit error -> writable VAN MO -> leak!

// DUNG - Dung pipeline()
const { pipeline } = require('stream');
pipeline(readable, transform, writable, (err) => {
  if (err) console.error('Pipeline error:', err);
  // Tat ca streams da duoc dong tu dong
});
```

### Loi 5: Ghi sau khi end()

```js
const writable = fs.createWriteStream('output.txt');
writable.end('Done');
writable.write('More data'); // Error: write after end!

// DUNG - Kiem tra writable.writableEnded truoc khi ghi
if (!writable.writableEnded) {
  writable.write('More data');
}
```

### Loi 6: Quen goi callback trong _transform/_write

```js
// SAI - Stream se TREO vinh vien!
class BadTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    // QUEN goi callback()!
    // => Stream se khong bao gio nhan chunk tiep theo
  }
}

// DUNG
class GoodTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback(); // PHAI goi callback!
  }
}

// Hoac dung shorthand:
class GoodTransform2 extends Transform {
  _transform(chunk, encoding, callback) {
    // callback(error, data) = callback(null, data) + this.push(data)
    callback(null, chunk.toString().toUpperCase());
  }
}
```

### Loi 7: Nham lan Buffer length va string length

```js
const str = 'Xin chao Viet Nam';
console.log(str.length);                    // 17 (ky tu)
console.log(Buffer.byteLength(str, 'utf8')); // 20 (bytes - tieng Viet nhieu byte hon)

const buf = Buffer.from(str);
console.log(buf.length); // 20 (bytes)

// QUAN TRONG khi tinh Content-Length trong HTTP:
// Dung: res.setHeader('Content-Length', Buffer.byteLength(body));
// SAI:  res.setHeader('Content-Length', body.length);
```

---

## 12. Best Practices

### 1. Luon dung pipeline() thay vi pipe()

```js
// KHONG NEN
readable.pipe(transform).pipe(writable);

// NEN
const { pipeline } = require('stream/promises');
await pipeline(readable, transform, writable);
```

### 2. Dung highWaterMark phu hop

```js
// Doc file nho, xu ly nhanh: highWaterMark nho
fs.createReadStream('small.txt', { highWaterMark: 1024 }); // 1KB

// Doc file lon qua mang: highWaterMark lon
fs.createReadStream('huge.bin', { highWaterMark: 1024 * 1024 }); // 1MB
```

### 3. Xu ly encoding dung cach

```js
// SAI - Co the cat giua ky tu multi-byte
stream.on('data', (chunk) => {
  result += chunk.toString(); // chunk co the ket thuc giua ky tu UTF-8!
});

// DUNG - Set encoding tren stream
const stream = fs.createReadStream('file.txt', { encoding: 'utf8' });
stream.on('data', (chunk) => {
  result += chunk; // Da la string, khong bi cat giua ky tu
});

// Hoac dung StringDecoder
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

stream.on('data', (chunk) => {
  result += decoder.write(chunk); // Xu ly multi-byte dung cach
});
stream.on('end', () => {
  result += decoder.end(); // Flush ky tu con lai
});
```

### 4. Don dep tai nguyen

```js
// LUON destroy stream khi khong can nua
const stream = fs.createReadStream('file.txt');

// Khi can huy bo giua chung
stream.destroy();

// Voi AbortController (Node.js 15+)
const controller = new AbortController();
const stream2 = fs.createReadStream('file.txt', {
  signal: controller.signal,
});

// Huy bo khi can
setTimeout(() => {
  controller.abort();
}, 5000);
```

### 5. Object Mode cho du lieu co cau truc

```js
// Khi xu ly du lieu co cau truc (JSON, objects...),
// dung objectMode: true
const transform = new Transform({
  objectMode: true,
  transform(record, encoding, callback) {
    // record la object, khong phai Buffer
    record.processed = true;
    callback(null, record);
  },
});
```

### 6. Error handling dung cach

```js
const { pipeline } = require('stream/promises');

async function processFile(input, output) {
  try {
    await pipeline(
      fs.createReadStream(input),
      new Transform({
        transform(chunk, encoding, callback) {
          try {
            // Xu ly co the throw error
            const processed = riskyOperation(chunk);
            callback(null, processed);
          } catch (err) {
            callback(err); // Truyen error cho pipeline xu ly
          }
        },
      }),
      fs.createWriteStream(output)
    );
  } catch (err) {
    // Pipeline se dong tat ca stream va truyen error ve day
    console.error('Loi xu ly file:', err.message);
  }
}
```

---

## 13. Bai tap thuc hanh

### Bai tap 1: Buffer Basics (De)

Viet chuong trinh thuc hien:
1. Tao Buffer tu string "Hello Node.js"
2. In ra tung byte (dang so va hex)
3. Chuyen Buffer sang base64
4. Tao Buffer moi tu base64 va in ra string

```js
// Goi y:
const buf = Buffer.from('Hello Node.js');
// Dung vong for de duyet tung byte
// Dung buf.toString('base64') va Buffer.from(str, 'base64')
```

### Bai tap 2: File Copy voi Progress (Trung binh)

Viet chuong trinh copy file bat ky voi:
1. Hien thi progress bar
2. Hien thi toc do (MB/s)
3. Hien thi thoi gian con lai (ETA)
4. Xu ly error dung cach

```js
// Goi y: Dung Transform stream de theo doi so bytes da copy
// Dung process.stdout.write('\r...') de cap nhat progress tren 1 dong
```

### Bai tap 3: Log File Analyzer (Trung binh)

Viet chuong trinh doc file log lon (>1GB) va:
1. Dem so dong
2. Dem so lan xuat hien cua cac log level (INFO, WARN, ERROR)
3. Tim 10 dong ERROR gan nhat
4. Tinh kich thuoc trung binh moi dong

```js
// Goi y: Dung createReadStream + Transform
// Xu ly buffer de tach dong dung cach
// Dung _flush() de xu ly dong cuoi cung
```

### Bai tap 4: Simple Gzip CLI Tool (Trung binh)

Viet CLI tool co the:
1. Nen file: `node gzip.js compress input.txt`
2. Giai nen: `node gzip.js decompress input.txt.gz`
3. Hien thi progress
4. Hien thi ty le nen

```js
// Goi y: Dung process.argv de lay tham so
// Dung zlib.createGzip() va zlib.createGunzip()
// Dung pipeline()
```

### Bai tap 5: CSV to JSON Converter (Kho)

Viet chuong trinh:
1. Doc file CSV lon (hang trieu dong)
2. Parse tung dong (xu ly dau phay trong ngoac kep)
3. Chuyen sang JSON
4. Ghi ra file JSON
5. Khong dung thu vien ngoai

```js
// Goi y: Tao CSVParser extend Transform
// Dung objectMode
// Xu ly _flush() cho dong cuoi cung
```

### Bai tap 6: HTTP File Server voi Streaming (Kho)

Viet HTTP server co the:
1. Serve static files voi dung MIME type
2. Ho tro Range requests (de video player co the seek)
3. Ho tro gzip compression
4. Hien thi directory listing

```js
// Goi y: Dung http.createServer
// Parse Range header
// Check Accept-Encoding header
// Dung fs.createReadStream voi options start/end
```

### Bai tap 7: Stream Pipeline Builder (Nang cao)

Tao mot function `buildPipeline` nhan mot mang cac transform options va tao pipeline tu dong:

```js
// Vi du su dung:
const result = await buildPipeline('input.txt', 'output.txt', [
  { type: 'filter', fn: (line) => line.includes('ERROR') },
  { type: 'transform', fn: (line) => line.toUpperCase() },
  { type: 'transform', fn: (line) => `[${new Date().toISOString()}] ${line}` },
]);

// Goi y: Dung Array.map de tao cac Transform stream
// Dung pipeline() voi spread operator
```

### Bai tap 8: Real-time File Watcher voi Tail (Nang cao)

Viet chuong trinh giong lenh `tail -f` trong Linux:
1. Hien thi N dong cuoi cung cua file
2. Tiep tuc theo doi va hien thi dong moi khi file thay doi
3. Ho tro nhieu file cung luc
4. Highlight cac dong ERROR bang mau do

```js
// Goi y: Dung fs.watch() hoac fs.watchFile()
// Dung fs.createReadStream voi options start
// Theo doi file size de biet co du lieu moi khong
```

---

> **Tiep theo**: [Bai 05 - HTTP va Networking](../05-HTTP-and-Networking/README.md)
