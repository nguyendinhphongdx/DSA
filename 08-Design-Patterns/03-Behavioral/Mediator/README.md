# Mediator Pattern

## 1. Khái niệm

Giảm coupling bằng cách **các object không giao tiếp trực tiếp** với nhau, mà thông qua **mediator** (trung gian).

```
Không có Mediator:          Có Mediator:
A ←→ B                     A ──→ ┌──────────┐ ←── B
│ ╲╱ │                          │ Mediator │
│ ╱╲ │                          └────┬─────┘
C ←→ D                     C ──→    ↑     ←── D
(mọi object nói chuyện      (chỉ nói qua mediator)
 với nhau → phức tạp)
```

---

## 2. Ví dụ: Chat Room

```javascript
class ChatRoom {
  #users = new Map();

  join(user) {
    this.#users.set(user.name, user);
    user.setChatRoom(this);
    this.broadcast(`${user.name} joined the room`, user);
  }

  leave(user) {
    this.#users.delete(user.name);
    this.broadcast(`${user.name} left the room`, user);
  }

  sendMessage(message, from, to) {
    if (to) {
      // Private message
      const recipient = this.#users.get(to);
      if (recipient) recipient.receive(message, from.name);
    } else {
      // Broadcast
      this.broadcast(message, from);
    }
  }

  broadcast(message, sender) {
    for (const [name, user] of this.#users) {
      if (user !== sender) {
        user.receive(message, sender?.name || 'System');
      }
    }
  }
}

class User {
  #chatRoom;

  constructor(name) {
    this.name = name;
    this.messages = [];
  }

  setChatRoom(room) { this.#chatRoom = room; }

  send(message, to) {
    console.log(`${this.name} sends: ${message}`);
    this.#chatRoom.sendMessage(message, this, to);
  }

  receive(message, from) {
    const msg = `[${from} → ${this.name}]: ${message}`;
    this.messages.push(msg);
    console.log(msg);
  }
}

// Sử dụng
const room = new ChatRoom();
const phong = new User('Phong');
const minh = new User('Minh');
const an = new User('An');

room.join(phong);
room.join(minh);
room.join(an);

phong.send('Hello everyone!');        // Broadcast
minh.send('Hi Phong!', 'Phong');      // Private message
```

---

## 3. Ví dụ: Form Mediator

```javascript
class FormMediator {
  #components = {};

  register(name, component) {
    this.#components[name] = component;
    component.setMediator(this);
  }

  notify(sender, event, data) {
    if (event === 'countryChanged') {
      // Khi country thay đổi → update city dropdown
      this.#components.city?.updateOptions(data);
      this.#components.zipCode?.reset();
    }
    if (event === 'dateChanged') {
      this.#components.submitBtn?.setEnabled(!!data);
    }
  }
}
```

---

## 4. Mediator trong thực tế

```javascript
// Express middleware = mediator pattern
// Request đi qua chain of middleware (mediator giữa request và response)

// Event bus = mediator
// Components giao tiếp qua events thay vì trực tiếp
```

---

## 5. Bài tập

```javascript
// Tạo AirTrafficController (mediator):
// - Quản lý nhiều Airplane
// - Airplane xin phép hạ cánh/cất cánh
// - Controller kiểm tra runway và cho phép/từ chối
// - Airplane không biết về nhau, chỉ biết Controller
```
