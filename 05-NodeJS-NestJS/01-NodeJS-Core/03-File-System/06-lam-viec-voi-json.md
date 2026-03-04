# 9. Lam viec voi JSON files

## 9.1. Doc va ghi JSON

```js
const fsPromises = require('fs/promises');

// === Doc JSON ===
async function readJSON(filePath) {
  try {
    const raw = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`File khong ton tai: ${filePath}`);
      return null;
    }
    if (err instanceof SyntaxError) {
      console.error(`JSON khong hop le trong file: ${filePath}`);
      return null;
    }
    throw err;
  }
}

// === Ghi JSON ===
async function writeJSON(filePath, data, pretty = true) {
  const json = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);
  await fsPromises.writeFile(filePath, json + '\n', 'utf8');
}

// === Cap nhat JSON (doc → sua → ghi) ===
async function updateJSON(filePath, updateFn) {
  const data = await readJSON(filePath);
  if (data === null) return false;

  const updated = updateFn(data);
  await writeJSON(filePath, updated);
  return true;
}

// Su dung
const config = await readJSON('./config.json');
console.log(config);

await writeJSON('./output.json', { name: 'Phong', age: 25 });

// Cap nhat mot truong
await updateJSON('./config.json', (config) => {
  config.version = '2.0.0';
  config.updatedAt = new Date().toISOString();
  return config;
});
```

## 9.2. JSON Database don gian

```js
const fsPromises = require('fs/promises');
const path = require('path');

class JsonDB {
  constructor(dbPath) {
    this.dbPath = path.resolve(dbPath);
    this.data = null;
    this.loaded = false;
  }

  async load() {
    try {
      const raw = await fsPromises.readFile(this.dbPath, 'utf8');
      this.data = JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.data = {};
      } else {
        throw err;
      }
    }
    this.loaded = true;
  }

  async save() {
    const json = JSON.stringify(this.data, null, 2);
    // Atomic write: ghi vao file tam, roi rename
    const tmpPath = this.dbPath + '.tmp';
    await fsPromises.writeFile(tmpPath, json, 'utf8');
    await fsPromises.rename(tmpPath, this.dbPath);
  }

  ensureLoaded() {
    if (!this.loaded) throw new Error('DB chua duoc load. Goi .load() truoc');
  }

  // CRUD cho collections
  getCollection(name) {
    this.ensureLoaded();
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  async insert(collection, record) {
    const col = this.getCollection(collection);
    const newRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...record,
      createdAt: new Date().toISOString(),
    };
    col.push(newRecord);
    await this.save();
    return newRecord;
  }

  findAll(collection) {
    return this.getCollection(collection);
  }

  findById(collection, id) {
    return this.getCollection(collection).find((item) => item.id === id) || null;
  }

  find(collection, predicate) {
    return this.getCollection(collection).filter(predicate);
  }

  async update(collection, id, updates) {
    const col = this.getCollection(collection);
    const index = col.findIndex((item) => item.id === id);
    if (index === -1) return null;

    col[index] = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save();
    return col[index];
  }

  async delete(collection, id) {
    const col = this.getCollection(collection);
    const index = col.findIndex((item) => item.id === id);
    if (index === -1) return false;

    col.splice(index, 1);
    await this.save();
    return true;
  }
}

// Su dung
async function demo() {
  const db = new JsonDB('./database.json');
  await db.load();

  // Insert
  const user1 = await db.insert('users', { name: 'Phong', email: 'phong@mail.com' });
  const user2 = await db.insert('users', { name: 'Lan', email: 'lan@mail.com' });
  console.log('Tao user:', user1);

  // Find all
  const allUsers = db.findAll('users');
  console.log('Tat ca users:', allUsers);

  // Find by ID
  const found = db.findById('users', user1.id);
  console.log('Tim duoc:', found);

  // Find voi dieu kien
  const filtered = db.find('users', (u) => u.name.includes('Ph'));
  console.log('Loc:', filtered);

  // Update
  const updated = await db.update('users', user1.id, { name: 'Phong Dinh' });
  console.log('Cap nhat:', updated);

  // Delete
  const deleted = await db.delete('users', user2.id);
  console.log('Da xoa:', deleted);
}

// demo();
```

## 9.3. Xu ly JSON lon (JSONL - JSON Lines)

```js
const fs = require('fs');
const readline = require('readline');

// JSONL format: moi dong la mot JSON object
// {"id": 1, "name": "Phong"}
// {"id": 2, "name": "Lan"}
// {"id": 3, "name": "Minh"}

// Doc JSONL file (tiet kiem RAM cho file lon)
async function readJSONL(filePath) {
  const results = [];
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    if (!line.trim()) continue; // Bo dong trong

    try {
      results.push(JSON.parse(line));
    } catch (err) {
      console.error(`Loi parse JSON tai dong ${lineNumber}: ${line}`);
    }
  }

  return results;
}

// Ghi JSONL file
async function writeJSONL(filePath, records) {
  const lines = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  await fsPromises.writeFile(filePath, lines, 'utf8');
}

// Append mot record vao JSONL
async function appendJSONL(filePath, record) {
  await fsPromises.appendFile(filePath, JSON.stringify(record) + '\n', 'utf8');
}
```
