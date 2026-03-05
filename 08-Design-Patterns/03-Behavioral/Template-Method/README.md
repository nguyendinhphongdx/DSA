# Template Method Pattern

## 1. Khái niệm

Định nghĩa **skeleton** (bộ khung) của algorithm trong base class, để subclass **override từng bước** mà không thay đổi cấu trúc chung.

```
AbstractClass
├── templateMethod()     ← Không đổi (final)
│   ├── step1()          ← Override
│   ├── step2()          ← Override
│   ├── hook()           ← Optional override
│   └── step3()          ← Override
│
├── ConcreteClassA       ← Implement các steps
└── ConcreteClassB       ← Implement các steps khác
```

---

## 2. Ví dụ: Data Parser

```javascript
class DataParser {
  // Template method - KHÔNG override!
  parse(data) {
    const rawData = this.readData(data);
    const parsed = this.parseData(rawData);
    const validated = this.validate(parsed);

    if (this.shouldLog()) { // Hook
      console.log(`Parsed ${parsed.length} records`);
    }

    return validated;
  }

  // Các bước để subclass implement
  readData(data) { throw new Error('Must implement'); }
  parseData(rawData) { throw new Error('Must implement'); }
  validate(data) { return data; } // Default implementation

  // Hook - optional override
  shouldLog() { return false; }
}

class CSVParser extends DataParser {
  readData(data) { return data.split('\n'); }

  parseData(rows) {
    const headers = rows[0].split(',');
    return rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
    });
  }

  shouldLog() { return true; }
}

class JSONParser extends DataParser {
  readData(data) { return data; }
  parseData(rawData) { return JSON.parse(rawData); }

  validate(data) {
    if (!Array.isArray(data)) throw new Error('Must be array');
    return data;
  }
}

// Sử dụng - cùng interface, khác implementation
const csv = new CSVParser();
csv.parse('name,age\nPhong,25\nMinh,30');

const json = new JSONParser();
json.parse('[{"name":"Phong"},{"name":"Minh"}]');
```

---

## 3. Ví dụ: Build Process

```javascript
class BuildPipeline {
  // Template
  build() {
    this.clean();
    this.install();
    this.compile();
    this.test();

    if (this.shouldDeploy()) {
      this.deploy();
    }
  }

  clean() { console.log('Cleaning...'); }
  install() { throw new Error('Must implement'); }
  compile() { throw new Error('Must implement'); }
  test() { throw new Error('Must implement'); }
  deploy() { console.log('Deploying...'); }

  // Hook
  shouldDeploy() { return false; }
}

class NodeJSBuild extends BuildPipeline {
  install() { console.log('npm install'); }
  compile() { console.log('tsc --build'); }
  test() { console.log('jest --coverage'); }
  shouldDeploy() { return true; }
}

class PythonBuild extends BuildPipeline {
  install() { console.log('pip install -r requirements.txt'); }
  compile() { console.log('No compilation needed'); }
  test() { console.log('pytest'); }
}
```

---

## 4. Template Method vs Strategy

| Template Method | Strategy |
|----------------|----------|
| Dùng inheritance | Dùng composition |
| Override từng bước | Thay toàn bộ algorithm |
| Compile time | Runtime |
| "Skeleton with hooks" | "Pluggable algorithm" |

---

## 5. Bài tập

```javascript
// Tạo ReportGenerator (template):
// Steps: fetchData() → processData() → formatReport() → output()
// Subclasses: HTMLReport, PDFReport, ExcelReport
// Hook: includeHeader(), includeFooter()
```
