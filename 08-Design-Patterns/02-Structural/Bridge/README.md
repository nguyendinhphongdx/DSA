# Bridge Pattern

## 1. Khái niệm

Tách **abstraction** khỏi **implementation** để cả hai có thể thay đổi độc lập.

```
     Abstraction ──────→ Implementation
       /     \              /      \
  Refined  Refined     ImplA    ImplB
```

Tránh "class explosion" khi có nhiều biến thể.

---

## 2. Vấn đề: Class Explosion

```
Không có Bridge:
RedCircle, BlueCircle, GreenCircle,
RedSquare, BlueSquare, GreenSquare,
RedTriangle, BlueTriangle, GreenTriangle
→ 9 classes! (3 shapes × 3 colors)

Có Bridge:
3 Shapes + 3 Colors = 6 classes
```

---

## 3. Implementation

```javascript
// Implementation interface
class Color {
  fill() { throw new Error('Must implement'); }
}

class Red extends Color {
  fill() { return 'red'; }
}

class Blue extends Color {
  fill() { return 'blue'; }
}

// Abstraction
class Shape {
  constructor(color) {
    this.color = color; // Bridge!
  }

  draw() { throw new Error('Must implement'); }
}

class Circle extends Shape {
  constructor(radius, color) {
    super(color);
    this.radius = radius;
  }

  draw() {
    return `Drawing circle (r=${this.radius}) with color ${this.color.fill()}`;
  }
}

class Square extends Shape {
  constructor(side, color) {
    super(color);
    this.side = side;
  }

  draw() {
    return `Drawing square (${this.side}x${this.side}) with color ${this.color.fill()}`;
  }
}

// Combine thoải mái!
const redCircle = new Circle(5, new Red());
const blueSquare = new Square(10, new Blue());
console.log(redCircle.draw());  // Drawing circle (r=5) with color red
console.log(blueSquare.draw()); // Drawing square (10x10) with color blue
```

---

## 4. Ví dụ: Device + Remote

```javascript
// Implementation
class Device {
  isEnabled() {}
  enable() {}
  disable() {}
  getVolume() {}
  setVolume(v) {}
}

class TV extends Device {
  #on = false; #volume = 50;
  isEnabled() { return this.#on; }
  enable() { this.#on = true; }
  disable() { this.#on = false; }
  getVolume() { return this.#volume; }
  setVolume(v) { this.#volume = Math.max(0, Math.min(100, v)); }
}

class Radio extends Device {
  #on = false; #volume = 30;
  isEnabled() { return this.#on; }
  enable() { this.#on = true; }
  disable() { this.#on = false; }
  getVolume() { return this.#volume; }
  setVolume(v) { this.#volume = Math.max(0, Math.min(100, v)); }
}

// Abstraction
class Remote {
  constructor(device) { this.device = device; } // Bridge
  togglePower() { this.device.isEnabled() ? this.device.disable() : this.device.enable(); }
  volumeUp() { this.device.setVolume(this.device.getVolume() + 10); }
  volumeDown() { this.device.setVolume(this.device.getVolume() - 10); }
}

class AdvancedRemote extends Remote {
  mute() { this.device.setVolume(0); }
}

// Combine
const tvRemote = new AdvancedRemote(new TV());
const radioRemote = new Remote(new Radio());
```

---

## 5. Bridge vs Strategy

| Bridge | Strategy |
|--------|----------|
| Tách cấu trúc (what) khỏi triển khai (how) | Đổi thuật toán runtime |
| Thiết kế từ đầu | Refactor if/else chains |
| Abstraction + Implementation | Context + Strategy |

---

## 6. Bài tập

```javascript
// Tạo Notification system với Bridge:
// Abstraction: UrgentNotification, RegularNotification
// Implementation: EmailSender, SMSSender, PushSender
// → UrgentNotification + EmailSender = urgent email
// → RegularNotification + PushSender = normal push
```
