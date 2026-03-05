# State Pattern

## 1. Khái niệm

Object thay đổi **behavior** khi **internal state** thay đổi. Nhìn bên ngoài như thể object đổi class.

```
Context ──→ State (current)
             ├── StateA: handle() → chuyển sang StateB
             ├── StateB: handle() → chuyển sang StateC
             └── StateC: handle() → chuyển sang StateA
```

---

## 2. Bad vs Good

```javascript
// ❌ Bad: Switch statements khắp nơi
class Order {
  constructor() { this.status = 'pending'; }

  process() {
    switch (this.status) {
      case 'pending':
        console.log('Processing...');
        this.status = 'processing';
        break;
      case 'processing':
        console.log('Shipping...');
        this.status = 'shipped';
        break;
      case 'shipped':
        console.log('Delivered!');
        this.status = 'delivered';
        break;
      case 'delivered':
        throw new Error('Already delivered');
    }
  }

  cancel() {
    switch (this.status) {
      case 'pending':
      case 'processing':
        this.status = 'cancelled';
        break;
      default:
        throw new Error('Cannot cancel');
    }
  }
}
```

```javascript
// ✅ Good: State pattern
class OrderState {
  process(order) { throw new Error('Cannot process'); }
  cancel(order) { throw new Error('Cannot cancel'); }
  getName() { throw new Error('Must implement'); }
}

class PendingState extends OrderState {
  process(order) {
    console.log('Processing order...');
    order.setState(new ProcessingState());
  }
  cancel(order) {
    console.log('Order cancelled');
    order.setState(new CancelledState());
  }
  getName() { return 'PENDING'; }
}

class ProcessingState extends OrderState {
  process(order) {
    console.log('Shipping order...');
    order.setState(new ShippedState());
  }
  cancel(order) {
    console.log('Order cancelled');
    order.setState(new CancelledState());
  }
  getName() { return 'PROCESSING'; }
}

class ShippedState extends OrderState {
  process(order) {
    console.log('Order delivered!');
    order.setState(new DeliveredState());
  }
  getName() { return 'SHIPPED'; }
}

class DeliveredState extends OrderState {
  getName() { return 'DELIVERED'; }
}

class CancelledState extends OrderState {
  getName() { return 'CANCELLED'; }
}

class Order {
  #state;

  constructor() {
    this.#state = new PendingState();
  }

  setState(state) { this.#state = state; }
  getStatus() { return this.#state.getName(); }

  process() { this.#state.process(this); }
  cancel() { this.#state.cancel(this); }
}

// Sử dụng
const order = new Order();
console.log(order.getStatus()); // PENDING
order.process();                // Processing order...
console.log(order.getStatus()); // PROCESSING
order.process();                // Shipping order...
order.cancel();                 // Error: Cannot cancel (shipped)
```

---

## 3. Ví dụ: Traffic Light

```javascript
class TrafficLight {
  #state;

  constructor() { this.#state = new RedLight(); }

  setState(state) { this.#state = state; }
  change() { this.#state.change(this); }
  getColor() { return this.#state.color; }
}

class RedLight {
  color = 'RED';
  change(light) { light.setState(new GreenLight()); }
}

class GreenLight {
  color = 'GREEN';
  change(light) { light.setState(new YellowLight()); }
}

class YellowLight {
  color = 'YELLOW';
  change(light) { light.setState(new RedLight()); }
}

const light = new TrafficLight();
light.getColor(); // RED
light.change();   // → GREEN
light.change();   // → YELLOW
light.change();   // → RED
```

---

## 4. Khi nào dùng

- Object có nhiều trạng thái, behavior khác nhau theo state
- Code có nhiều switch/if-else dựa trên state
- State machine: Order, Payment, Game character, UI components

---

## 5. Bài tập

```javascript
// Tạo VendingMachine với states:
// - IdleState: insert coin → HasMoneyState
// - HasMoneyState: select product → DispensingState, refund → IdleState
// - DispensingState: dispense → IdleState
// Methods: insertCoin(), selectProduct(), dispense(), refund()
```
