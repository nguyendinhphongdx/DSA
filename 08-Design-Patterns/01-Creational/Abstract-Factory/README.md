# Abstract Factory Pattern

## 1. Khái niệm

Cung cấp interface để tạo **family of related objects** mà không cần biết concrete class.
"Factory of Factories."

```
┌──────────────────┐
│ «interface»      │
│ UIFactory        │
├──────────────────┤      ┌──────────┐  ┌────────────┐
│ + createButton() │─────→│  Button  │  │  Checkbox  │
│ + createCheckbox()│     └─────┬────┘  └─────┬──────┘
└────────┬─────────┘       ┌────┴────┐   ┌────┴─────┐
    ┌────┴────┐          Win  Mac     Win   Mac
 Windows   Mac           Btn  Btn     Chk   Chk
 Factory   Factory
```

---

## 2. Implementation

```javascript
// Abstract products
class Button {
  render() { throw new Error('Must implement'); }
}

class Checkbox {
  render() { throw new Error('Must implement'); }
}

// Windows family
class WindowsButton extends Button {
  render() { return '[====Windows Btn====]'; }
}

class WindowsCheckbox extends Checkbox {
  render() { return '[☑] Windows Checkbox'; }
}

// Mac family
class MacButton extends Button {
  render() { return '( Mac Button )'; }
}

class MacCheckbox extends Checkbox {
  render() { return '⬛ Mac Checkbox'; }
}

// Abstract Factory
class UIFactory {
  createButton() { throw new Error('Must implement'); }
  createCheckbox() { throw new Error('Must implement'); }
}

class WindowsUIFactory extends UIFactory {
  createButton() { return new WindowsButton(); }
  createCheckbox() { return new WindowsCheckbox(); }
}

class MacUIFactory extends UIFactory {
  createButton() { return new MacButton(); }
  createCheckbox() { return new MacCheckbox(); }
}

// Client code - không biết concrete class!
function renderUI(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  console.log(button.render());
  console.log(checkbox.render());
}

// Chọn factory dựa trên platform
const factory = process.platform === 'darwin'
  ? new MacUIFactory()
  : new WindowsUIFactory();

renderUI(factory);
```

---

## 3. Ví dụ: Theme System

```javascript
// Light theme family
const LightTheme = {
  createHeader: () => ({ bg: '#fff', color: '#333', border: '1px solid #ddd' }),
  createCard: () => ({ bg: '#f9f9f9', color: '#333', shadow: '0 2px 4px rgba(0,0,0,0.1)' }),
  createButton: () => ({ bg: '#007bff', color: '#fff', hover: '#0056b3' }),
};

// Dark theme family
const DarkTheme = {
  createHeader: () => ({ bg: '#1a1a2e', color: '#eee', border: '1px solid #333' }),
  createCard: () => ({ bg: '#16213e', color: '#eee', shadow: '0 2px 4px rgba(0,0,0,0.5)' }),
  createButton: () => ({ bg: '#e94560', color: '#fff', hover: '#c81e45' }),
};

function buildPage(themeFactory) {
  return {
    header: themeFactory.createHeader(),
    card: themeFactory.createCard(),
    button: themeFactory.createButton(),
  };
}

const page = buildPage(DarkTheme);
```

---

## 4. Factory Method vs Abstract Factory

| | Factory Method | Abstract Factory |
|-|---------------|-----------------|
| Tạo | 1 product | Family of products |
| Dùng | Inheritance | Composition |
| Mở rộng | Thêm subclass | Thêm factory mới |

---

## 5. Bài tập

```javascript
// Tạo Abstract Factory cho Database:
// - MySQLFactory: createConnection(), createQueryBuilder(), createMigration()
// - MongoFactory: createConnection(), createQueryBuilder(), createMigration()
// Client code dùng factory mà không biết cụ thể là MySQL hay Mongo
```
