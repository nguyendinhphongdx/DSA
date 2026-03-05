# Factory Method Pattern

## 1. Khái niệm

Định nghĩa interface để tạo object, nhưng để **subclass quyết định** class nào sẽ được tạo.

```
┌─────────────────┐         ┌──────────────┐
│    Creator       │         │   Product    │
│ (abstract)       │         │ (interface)  │
├─────────────────┤         ├──────────────┤
│ + createProduct()│────────→│ + use()      │
│ + doSomething()  │         └──────┬───────┘
└────────┬────────┘            ┌────┴────┐
    ┌────┴─────┐           ProductA  ProductB
CreatorA   CreatorB
```

---

## 2. Simple Factory vs Factory Method

### Simple Factory (không phải pattern chính thức)

```javascript
class NotificationFactory {
  static create(type) {
    switch (type) {
      case 'email': return new EmailNotification();
      case 'sms': return new SMSNotification();
      case 'push': return new PushNotification();
      default: throw new Error(`Unknown type: ${type}`);
    }
  }
}

const notification = NotificationFactory.create('email');
notification.send('Hello!');
```

### Factory Method

```javascript
// Product interface
class Notification {
  send(message) { throw new Error('Must implement'); }
}

class EmailNotification extends Notification {
  send(message) { console.log(`📧 Email: ${message}`); }
}

class SMSNotification extends Notification {
  send(message) { console.log(`📱 SMS: ${message}`); }
}

class PushNotification extends Notification {
  send(message) { console.log(`🔔 Push: ${message}`); }
}

// Creator với factory method
class NotificationService {
  // Factory method - subclass sẽ override
  createNotification() {
    throw new Error('Must implement');
  }

  notify(message) {
    const notification = this.createNotification();
    notification.send(message);
  }
}

class EmailService extends NotificationService {
  createNotification() { return new EmailNotification(); }
}

class SMSService extends NotificationService {
  createNotification() { return new SMSNotification(); }
}

// Sử dụng
const service = new EmailService();
service.notify('Hello World!'); // 📧 Email: Hello World!
```

---

## 3. Ví dụ thực tế

### UI Component Factory

```javascript
class Button {
  render() { throw new Error('Must implement'); }
}

class DarkButton extends Button {
  render() { return '<button class="dark-btn">Click</button>'; }
}

class LightButton extends Button {
  render() { return '<button class="light-btn">Click</button>'; }
}

class Dialog {
  // Factory method
  createButton() { throw new Error('Must implement'); }

  render() {
    const button = this.createButton();
    return `<div class="dialog">${button.render()}</div>`;
  }
}

class DarkDialog extends Dialog {
  createButton() { return new DarkButton(); }
}

class LightDialog extends Dialog {
  createButton() { return new LightButton(); }
}
```

### Functional Factory (JS-style)

```javascript
// Factory functions - phổ biến hơn trong JS
function createLogger(type) {
  const loggers = {
    console: (msg) => console.log(msg),
    file: (msg) => fs.appendFileSync('app.log', msg + '\n'),
    remote: (msg) => fetch('/api/logs', { method: 'POST', body: msg }),
  };

  const logFn = loggers[type];
  if (!logFn) throw new Error(`Unknown logger: ${type}`);

  return {
    info: (msg) => logFn(`[INFO] ${msg}`),
    error: (msg) => logFn(`[ERROR] ${msg}`),
    warn: (msg) => logFn(`[WARN] ${msg}`),
  };
}

const logger = createLogger('console');
logger.info('App started');
```

---

## 4. Khi nào dùng

- Không biết trước exact type cần tạo
- Muốn cho phép extend/customize object creation
- Tách logic tạo object ra khỏi logic sử dụng

---

## 5. Bài tập

```javascript
// Tạo DocumentFactory:
// - createDocument('pdf') → PDFDocument
// - createDocument('word') → WordDocument
// - createDocument('excel') → ExcelDocument
// Mỗi document có: open(), save(), print()
```
