# Composite Pattern

## 1. Khái niệm

Tổ chức objects thành **cấu trúc cây** (tree). Client xử lý object đơn lẻ và nhóm objects **theo cùng 1 cách**.

```
          Component
         /         \
      Leaf       Composite
                /    |    \
             Leaf  Leaf  Composite
                         /      \
                       Leaf    Leaf
```

---

## 2. Ví dụ: File System

```javascript
class FileSystemItem {
  constructor(name) { this.name = name; }
  getSize() { throw new Error('Must implement'); }
  display(indent = '') { throw new Error('Must implement'); }
}

class File extends FileSystemItem {
  constructor(name, size) {
    super(name);
    this.size = size;
  }

  getSize() { return this.size; }
  display(indent = '') { console.log(`${indent}📄 ${this.name} (${this.size}KB)`); }
}

class Folder extends FileSystemItem {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(item) { this.children.push(item); return this; }
  remove(item) { this.children = this.children.filter(c => c !== item); }

  getSize() {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  display(indent = '') {
    console.log(`${indent}📁 ${this.name} (${this.getSize()}KB)`);
    this.children.forEach(child => child.display(indent + '  '));
  }
}

// Sử dụng
const root = new Folder('project');
const src = new Folder('src');
src.add(new File('index.js', 5));
src.add(new File('app.js', 10));

const components = new Folder('components');
components.add(new File('Header.jsx', 3));
components.add(new File('Footer.jsx', 2));
src.add(components);

root.add(src);
root.add(new File('package.json', 1));

root.display();
// 📁 project (21KB)
//   📁 src (20KB)
//     📄 index.js (5KB)
//     📄 app.js (10KB)
//     📁 components (5KB)
//       📄 Header.jsx (3KB)
//       📄 Footer.jsx (2KB)
//   📄 package.json (1KB)

root.getSize(); // 21 - tính tổng toàn bộ cây!
```

---

## 3. Ví dụ: Menu System

```javascript
class MenuItem {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
  getTotal() { return this.price; }
}

class MenuCategory {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  add(item) { this.items.push(item); return this; }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
  }
}

const menu = new MenuCategory('Full Menu');
const drinks = new MenuCategory('Drinks');
drinks.add(new MenuItem('Coffee', 35000));
drinks.add(new MenuItem('Tea', 25000));

const food = new MenuCategory('Food');
food.add(new MenuItem('Pho', 50000));
food.add(new MenuItem('Banh Mi', 30000));

menu.add(drinks);
menu.add(food);
menu.getTotal(); // 140000
```

---

## 4. Khi nào dùng

- Cấu trúc dạng cây (tree)
- Client cần xử lý leaf và composite giống nhau
- File system, menu, tổ chức nhân sự, UI components

---

## 5. Bài tập

```javascript
// Tạo Organization chart:
// - Employee (leaf): name, salary
// - Department (composite): name, chứa employees và sub-departments
// Methods: getTotalSalary(), getHeadCount(), display()
```
