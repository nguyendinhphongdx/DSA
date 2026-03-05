# Facade Pattern

## 1. Khái niệm

Cung cấp **interface đơn giản** cho một hệ thống con phức tạp.

```
         ┌──────────┐
Client ──│  Facade   │
         │ (simple)  │
         └─────┬─────┘
         ┌─────┼─────┐
    SubsysA  SubsysB  SubsysC
    (complex internals)
```

---

## 2. Ví dụ

### Home Theater Facade

```javascript
class TV { on() {} off() {} setInput(input) {} }
class SoundSystem { on() {} off() {} setVolume(v) {} }
class StreamingPlayer { on() {} off() {} play(movie) {} }
class Lights { dim(level) {} on() {} }

// Facade - 1 method thay vì 10 bước
class HomeTheaterFacade {
  constructor(tv, sound, player, lights) {
    this.tv = tv;
    this.sound = sound;
    this.player = player;
    this.lights = lights;
  }

  watchMovie(movie) {
    this.lights.dim(20);
    this.tv.on();
    this.tv.setInput('HDMI1');
    this.sound.on();
    this.sound.setVolume(50);
    this.player.on();
    this.player.play(movie);
    console.log(`🎬 Playing: ${movie}`);
  }

  endMovie() {
    this.player.off();
    this.sound.off();
    this.tv.off();
    this.lights.on();
  }
}

// Client chỉ cần 1 dòng!
const theater = new HomeTheaterFacade(new TV(), new SoundSystem(), new StreamingPlayer(), new Lights());
theater.watchMovie('Inception');
```

### API Client Facade

```javascript
class APIFacade {
  #baseURL;
  #token;

  constructor(baseURL) {
    this.#baseURL = baseURL;
    this.#token = null;
  }

  async login(email, password) {
    const res = await fetch(`${this.#baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    this.#token = data.token;
    return data;
  }

  async getUsers() {
    return this.#request('GET', '/users');
  }

  async createUser(userData) {
    return this.#request('POST', '/users', userData);
  }

  async #request(method, path, body) {
    const res = await fetch(`${this.#baseURL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.#token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
}

// Client - đơn giản!
const api = new APIFacade('https://api.example.com');
await api.login('admin@mail.com', 'password');
const users = await api.getUsers();
```

---

## 3. Khi nào dùng

- Hệ thống phức tạp cần interface đơn giản cho client
- Tích hợp nhiều subsystem/library
- Tạo API wrapper cho third-party service

---

## 4. Bài tập

```javascript
// Tạo OrderFacade cho e-commerce:
// - placeOrder(cart, paymentInfo, shippingAddress)
//   Bên trong: validate → calculate → charge → createOrder → sendConfirmation
// Client chỉ gọi 1 method!
```
