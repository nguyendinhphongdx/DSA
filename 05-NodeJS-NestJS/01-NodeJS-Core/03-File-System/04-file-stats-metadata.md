# 6. File stats va metadata

## 6.1. stat - Lay thong tin file/thu muc

```js
const fsPromises = require('fs/promises');

async function getFileInfo(filePath) {
  const stats = await fsPromises.stat(filePath);

  console.log('=== Thong tin file ===');
  console.log('La file:', stats.isFile());
  console.log('La thu muc:', stats.isDirectory());
  console.log('La symbolic link:', stats.isSymbolicLink());
  console.log('Kich thuoc:', formatSize(stats.size));
  console.log('Tao luc:', stats.birthtime.toLocaleString('vi-VN'));
  console.log('Sua lan cuoi:', stats.mtime.toLocaleString('vi-VN'));
  console.log('Truy cap lan cuoi:', stats.atime.toLocaleString('vi-VN'));
  console.log('Thay doi metadata:', stats.ctime.toLocaleString('vi-VN'));
  console.log('Quyen:', stats.mode.toString(8)); // Octal format
  console.log('Inode:', stats.ino);
  console.log('Hard links:', stats.nlink);
  console.log('UID:', stats.uid);
  console.log('GID:', stats.gid);

  return stats;
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

// Su dung
await getFileInfo('./package.json');

// lstat - Giong stat nhung tra ve thong tin cua symbolic link (khong follow link)
const lstats = await fsPromises.lstat('./symlink');
console.log('La symlink:', lstats.isSymbolicLink());
```

## 6.2. access - Kiem tra quyen truy cap

```js
const { constants } = require('fs');

async function checkAccess(filePath) {
  try {
    // Kiem tra file ton tai
    await fsPromises.access(filePath, constants.F_OK);
    console.log(`${filePath}: ton tai`);

    // Kiem tra quyen doc
    await fsPromises.access(filePath, constants.R_OK);
    console.log(`${filePath}: co quyen doc`);

    // Kiem tra quyen ghi
    await fsPromises.access(filePath, constants.W_OK);
    console.log(`${filePath}: co quyen ghi`);

    // Kiem tra quyen thuc thi
    await fsPromises.access(filePath, constants.X_OK);
    console.log(`${filePath}: co quyen thuc thi`);
  } catch (err) {
    console.error(`${filePath}: ${err.message}`);
  }
}

// Helper: Kiem tra file ton tai (khong nen dung de kiem tra truoc khi doc/ghi)
async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// LUU Y: Khong nen kiem tra truoc roi moi thao tac (race condition!)
// SAI:
if (await fileExists('./data.txt')) {
  const data = await fsPromises.readFile('./data.txt'); // File co the bi xoa giua 2 dong nay!
}

// DUNG: Thu truc tiep, bat loi neu co
try {
  const data = await fsPromises.readFile('./data.txt', 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('File khong ton tai');
  }
}
```

## 6.3. chmod, chown - Thay doi quyen va chu so huu

```js
// Thay doi quyen file
await fsPromises.chmod('./script.sh', 0o755); // rwxr-xr-x (thuc thi duoc)
await fsPromises.chmod('./config.json', 0o644); // rw-r--r-- (chi doc cho others)
await fsPromises.chmod('./secret.key', 0o600); // rw------- (chi owner doc/ghi)

// Thay doi chu so huu (can quyen root)
// await fsPromises.chown('./file.txt', uid, gid);

// Thay doi thoi gian truy cap va sua doi
const newAccessTime = new Date('2026-01-01');
const newModifyTime = new Date('2026-06-15');
await fsPromises.utimes('./file.txt', newAccessTime, newModifyTime);
```

## 6.4. Ung dung: Tinh kich thuoc thu muc

```js
async function getDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;

  async function walk(currentPath) {
    const entries = await fsPromises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const stats = await fsPromises.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  }

  await walk(dirPath);
  return { totalSize, fileCount, formatted: formatSize(totalSize) };
}

// Su dung
const info = await getDirectorySize('./node_modules');
console.log(`node_modules: ${info.formatted} (${info.fileCount} files)`);
// node_modules: 156.32 MB (25431 files)
```

---

# 7. Watch files

## 7.1. fs.watch() - Built-in

```js
const fs = require('fs');
const path = require('path');

// Theo doi thay doi cua file
const watcher = fs.watch('./src', { recursive: true }, (eventType, filename) => {
  console.log(`[${eventType}] ${filename}`);
  // eventType: 'rename' (tao/xoa/doi ten) hoac 'change' (noi dung thay doi)
});

// Xu ly loi
watcher.on('error', (err) => {
  console.error('Watch error:', err);
});

// Dung theo doi
// watcher.close();

// Theo doi voi AbortController
const ac = new AbortController();

fs.watch('./src', { recursive: true, signal: ac.signal }, (eventType, filename) => {
  console.log(`[${eventType}] ${filename}`);
});

// Dung theo doi sau 60 giay
setTimeout(() => ac.abort(), 60000);

// Dung async iterator (Node.js 18.11+)
async function watchDirectory(dir) {
  const watcher = fs.promises.watch(dir, { recursive: true });

  for await (const event of watcher) {
    console.log(`[${event.eventType}] ${event.filename}`);
  }
}
```

**Han che cua fs.watch():**
- Khong nhat quan giua cac OS (Linux, macOS, Windows)
- Doi khi emit nhieu event cho 1 thay doi
- Khong bao cao loai thay doi cu the
- `recursive: true` khong ho tro tren tat ca OS

## 7.2. chokidar - Thu vien ben thu ba (uu tien dung)

```bash
npm install chokidar
```

```js
const chokidar = require('chokidar');

// Theo doi thu muc
const watcher = chokidar.watch('./src', {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true,
  ignoreInitial: true, // Khong emit event cho file da ton tai
  depth: 5, // Do sau de quy
  awaitWriteFinish: {
    stabilityThreshold: 500, // Doi 500ms sau khi ghi xong
    pollInterval: 100,
  },
});

// Event handlers
watcher
  .on('add', (filePath) => {
    console.log(`File duoc tao: ${filePath}`);
  })
  .on('change', (filePath) => {
    console.log(`File thay doi: ${filePath}`);
  })
  .on('unlink', (filePath) => {
    console.log(`File bi xoa: ${filePath}`);
  })
  .on('addDir', (dirPath) => {
    console.log(`Thu muc duoc tao: ${dirPath}`);
  })
  .on('unlinkDir', (dirPath) => {
    console.log(`Thu muc bi xoa: ${dirPath}`);
  })
  .on('error', (error) => {
    console.error('Watcher error:', error);
  })
  .on('ready', () => {
    console.log('Da san sang theo doi');
  });

// Dung theo doi
// await watcher.close();
```

## 7.3. Ung dung: Auto-reload server

```js
const chokidar = require('chokidar');
const { fork } = require('child_process');
const path = require('path');

class DevServer {
  constructor(scriptPath) {
    this.scriptPath = path.resolve(scriptPath);
    this.process = null;
  }

  start() {
    console.log(`Khoi dong: ${this.scriptPath}`);
    this.process = fork(this.scriptPath);

    this.process.on('exit', (code) => {
      console.log(`Process thoat voi code: ${code}`);
    });
  }

  restart() {
    console.log('\nPhat hien thay doi, dang restart...');

    if (this.process) {
      this.process.kill('SIGTERM');
    }

    this.start();
  }

  watch(dirs) {
    const watcher = chokidar.watch(dirs, {
      ignored: /node_modules/,
      ignoreInitial: true,
    });

    let debounceTimer;
    watcher.on('all', (event, filePath) => {
      console.log(`[${event}] ${filePath}`);

      // Debounce: doi 300ms sau thay doi cuoi cung moi restart
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.restart(), 300);
    });

    this.start();
    console.log('Dang theo doi thay doi...');
  }
}

// Su dung
// const dev = new DevServer('./src/server.js');
// dev.watch(['./src']);
```
