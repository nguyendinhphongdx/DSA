# 5. Quan ly thu muc

## 5.1. Tao thu muc

```js
// Tao 1 thu muc
await fsPromises.mkdir('./new-folder');

// Tao thu muc long nhau (recursive)
await fsPromises.mkdir('./a/b/c/d', { recursive: true });
// Tao tat ca thu muc cha neu chua ton tai

// Tao thu muc tam
const tmpDir = await fsPromises.mkdtemp('./tmp-');
console.log(tmpDir); // './tmp-abc123' (ten ngau nhien)

// Tao trong thu muc tam cua OS
const os = require('os');
const path = require('path');
const tmpDir2 = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'myapp-'));
console.log(tmpDir2); // '/tmp/myapp-abc123'
```

## 5.2. Doc danh sach file trong thu muc

```js
// Doc danh sach file (chi ten)
const files = await fsPromises.readdir('./src');
console.log(files); // ['index.js', 'utils.js', 'components']

// Doc voi thong tin chi tiet (dirent objects)
const entries = await fsPromises.readdir('./src', { withFileTypes: true });

entries.forEach((entry) => {
  const type = entry.isFile()
    ? 'FILE'
    : entry.isDirectory()
    ? 'DIR'
    : entry.isSymbolicLink()
    ? 'LINK'
    : 'OTHER';
  console.log(`[${type}] ${entry.name}`);
});
// [FILE] index.js
// [FILE] utils.js
// [DIR] components

// Doc de quy (recursive) - Node.js 18.17+
const allFiles = await fsPromises.readdir('./src', { recursive: true });
console.log(allFiles);
// ['index.js', 'utils.js', 'components', 'components/Button.js', ...]

// Tu viet recursive readdir (cho Node.js cu hon)
async function readDirRecursive(dirPath) {
  const result = [];
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // De quy vao thu muc con
      const subFiles = await readDirRecursive(fullPath);
      result.push(...subFiles);
    } else {
      result.push(fullPath);
    }
  }

  return result;
}

const allFilePaths = await readDirRecursive('./src');
console.log(allFilePaths);
// ['/src/index.js', '/src/utils.js', '/src/components/Button.js', ...]
```

## 5.3. Xoa thu muc

```js
// Xoa thu muc rong
await fsPromises.rmdir('./empty-folder');

// Xoa thu muc co noi dung (recursive) - Node.js 14.14+
await fsPromises.rm('./folder-with-content', { recursive: true, force: true });
// force: true → khong loi neu thu muc khong ton tai

// Cach cu (deprecated tu Node.js 16):
// await fsPromises.rmdir('./folder', { recursive: true });

// An toan: Kiem tra truoc khi xoa
async function safeRemoveDir(dirPath) {
  try {
    const stats = await fsPromises.stat(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`${dirPath} khong phai la thu muc`);
    }

    const entries = await fsPromises.readdir(dirPath);
    if (entries.length > 0) {
      console.warn(`Canh bao: Thu muc ${dirPath} co ${entries.length} muc`);
      // Hoi xac nhan truoc khi xoa?
    }

    await fsPromises.rm(dirPath, { recursive: true });
    console.log(`Da xoa: ${dirPath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Thu muc khong ton tai: ${dirPath}`);
    } else {
      throw err;
    }
  }
}
```

## 5.4. Ung dung: Project scaffold

```js
const path = require('path');
const fsPromises = require('fs/promises');

async function createProject(projectName) {
  const projectDir = path.resolve(projectName);

  // Cau truc thu muc
  const directories = [
    'src',
    'src/controllers',
    'src/models',
    'src/services',
    'src/middlewares',
    'src/utils',
    'src/config',
    'tests',
    'tests/unit',
    'tests/integration',
    'public',
    'public/css',
    'public/js',
    'public/images',
  ];

  // Tao thu muc
  for (const dir of directories) {
    await fsPromises.mkdir(path.join(projectDir, dir), { recursive: true });
    console.log(`Tao thu muc: ${dir}/`);
  }

  // Tao cac file mau
  const files = {
    'package.json': JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        main: 'src/index.js',
        scripts: {
          start: 'node src/index.js',
          dev: 'nodemon src/index.js',
          test: 'jest',
        },
      },
      null,
      2
    ),
    'src/index.js': `const app = require('./app');\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Server chay tai port \${PORT}\`));\n`,
    '.gitignore': 'node_modules/\n.env\n*.log\ndist/\n',
    '.env.example': 'PORT=3000\nDATABASE_URL=\nJWT_SECRET=\n',
  };

  for (const [filePath, content] of Object.entries(files)) {
    await fsPromises.writeFile(path.join(projectDir, filePath), content);
    console.log(`Tao file: ${filePath}`);
  }

  console.log(`\nProject "${projectName}" da duoc tao thanh cong!`);
  console.log(`cd ${projectName} && npm install`);
}

// createProject('my-api');
```
