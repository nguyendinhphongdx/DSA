# 10. Cac loi thuong gap

## Loi 1: ENOENT - File khong ton tai

```js
// SAI - khong xu ly loi
const data = fs.readFileSync('./khong-ton-tai.txt', 'utf8');
// Error: ENOENT: no such file or directory

// DUNG
try {
  const data = fs.readFileSync('./data.txt', 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('File chua ton tai, tao file moi...');
    fs.writeFileSync('./data.txt', '', 'utf8');
  } else {
    throw err;
  }
}
```

## Loi 2: EACCES - Khong co quyen

```js
// Kiem tra quyen truoc khi thao tac
try {
  await fsPromises.access('./file.txt', fs.constants.W_OK);
  await fsPromises.writeFile('./file.txt', 'data');
} catch (err) {
  if (err.code === 'EACCES') {
    console.error('Khong co quyen ghi file. Hay chay: chmod 644 file.txt');
  }
}
```

## Loi 3: Dung duong dan tuong doi sai

```js
// SAI - duong dan tuong doi phu thuoc vao CWD (thu muc chay lenh node)
const data = fs.readFileSync('./config.json'); // Co the loi neu chay tu thu muc khac

// DUNG - dung __dirname (luon la thu muc chua file hien tai)
const data = fs.readFileSync(path.join(__dirname, 'config.json'));
```

## Loi 4: Quen dong file descriptor

```js
// SAI - quen dong fd khi co loi
const fd = await fsPromises.open('./data.txt', 'r');
const content = await fd.readFile('utf8'); // Neu loi o day → fd khong duoc dong

// DUNG - dung try/finally
const fd = await fsPromises.open('./data.txt', 'r');
try {
  const content = await fd.readFile('utf8');
  console.log(content);
} finally {
  await fd.close(); // LUON dong file
}
```

## Loi 5: Race condition khi nhieu process ghi cung file

```js
// SAI - 2 process doc file cung luc → mat du lieu
// Process 1: doc file → them record → ghi file
// Process 2: doc file → them record → ghi file (ghi de thay doi cua Process 1)

// DUNG - dung file locking (lockfile package)
// hoac dung database thay vi JSON file cho multi-process
```

---

# 11. Bai tap

## Bai tap 1: File Manager CLI

Viet CLI tool quan ly file voi cac lenh:

```bash
node fm.js ls [dir]              # Liet ke file trong thu muc
node fm.js cat <file>            # Hien thi noi dung file
node fm.js cp <src> <dest>       # Copy file
node fm.js mv <src> <dest>       # Di chuyen/doi ten file
node fm.js rm <file>             # Xoa file
node fm.js mkdir <dir>           # Tao thu muc
node fm.js find <dir> <pattern>  # Tim file theo ten (glob pattern)
node fm.js size <path>           # Tinh kich thuoc file/thu muc
node fm.js tree <dir> [depth]    # Hien thi cay thu muc
```

## Bai tap 2: Log File Analyzer

Viet chuong trinh phan tich file log:

```bash
node log-analyzer.js ./server.log
```

Yeu cau:
- Doc file log theo dong (su dung stream, khong doc toan bo vao RAM)
- Dem so request theo status code (200, 404, 500, ...)
- Tim 10 URL duoc truy cap nhieu nhat
- Thong ke request theo gio
- Xuat ket qua ra file report.json

## Bai tap 3: Config Manager

Viet class `ConfigManager`:
- Doc/ghi config tu file JSON
- Ho tro nhieu environment (development, staging, production)
- Merge config: default → environment-specific → local overrides
- Watch file config va auto-reload khi thay doi
- Validate config voi schema

```js
const config = new ConfigManager({
  baseDir: './config',
  env: process.env.NODE_ENV || 'development',
  watch: true,
});

await config.load();
console.log(config.get('database.host')); // Lay gia tri nested
config.set('cache.ttl', 3600); // Set gia tri
await config.save(); // Luu thay doi
```

## Bai tap 4: File Sync Tool

Viet tool dong bo 2 thu muc:
- So sanh file dua tren size va modified time
- Copy file moi/thay doi tu source sang destination
- Xoa file trong destination ma khong co trong source
- Che do dry-run (chi hien thi thay doi, khong thuc hien)
- Hien thi progress va thong ke

```bash
node file-sync.js ./source ./backup --dry-run
node file-sync.js ./source ./backup --delete
```

## Bai tap 5: Markdown Blog Engine

Tao mot he thong blog don gian doc tu file Markdown:
- Doc tat ca file `.md` trong thu muc `posts/`
- Parse metadata (front matter: title, date, tags)
- Chuyen markdown sang HTML (dung thu vien `marked`)
- Tao trang index voi danh sach bai viet
- Watch thu muc posts va tu dong rebuild

---

## Tham khao

- [Node.js fs Documentation](https://nodejs.org/api/fs.html)
- [Node.js path Documentation](https://nodejs.org/api/path.html)
- [chokidar npm package](https://www.npmjs.com/package/chokidar)
