# Encapsulation (Đóng gói)

## Đóng gói là gì?

Encapsulation là nguyên tắc **ẩn giấu chi tiết bên trong** và chỉ **expose giao diện công khai** (public interface) cho bên ngoài sử dụng. Mục đích:

1. **Bảo vệ dữ liệu**: Ngăn truy cập/sửa đổi trực tiếp dữ liệu nhạy cảm
2. **Kiểm soát**: Mọi thay đổi đều đi qua methods — có thể validate, log, v.v.
3. **Giảm coupling**: Bên ngoài không phụ thuộc vào chi tiết implementation bên trong
4. **Dễ refactor**: Thay đổi nội bộ mà không ảnh hưởng code bên ngoài

---

## 1. Các mức độ truy cập trong JavaScript

### Public (Mặc định)

Tất cả properties và methods mặc định là **public** — truy cập được từ mọi nơi.

```js
class User {
  constructor(name) {
    this.name = name;      // Public property
    this.role = 'user';    // Public property
  }

  greet() {               // Public method
    return `Hi, I'm ${this.name}`;
  }
}

const user = new User('Phong');
user.name;        // 'Phong' — đọc được
user.name = '';    // Gán được — không có validation!
user.role = 'admin'; // Nguy hiểm! Ai cũng có thể thay đổi role
```

### Private (#) — ES2022

Dùng `#` prefix để tạo **private thật sự**. Chỉ truy cập được **bên trong class body**.

```js
class User {
  #password;
  #loginAttempts = 0;

  constructor(name, password) {
    this.name = name;
    this.#password = this.#hashPassword(password);
  }

  #hashPassword(pwd) { // Private method
    return `hashed_${pwd}`;
  }

  #resetAttempts() {
    this.#loginAttempts = 0;
  }

  login(password) {
    if (this.#loginAttempts >= 3) {
      throw new Error('Account locked');
    }

    if (this.#hashPassword(password) === this.#password) {
      this.#resetAttempts();
      return true;
    }

    this.#loginAttempts++;
    return false;
  }
}

const user = new User('Phong', 'secret');
user.login('wrong');  // false
user.login('secret'); // true
// user.#password;    // SyntaxError!
// user.#hashPassword(); // SyntaxError!
```

### Convention _prefix (Trước ES2022)

Dùng `_` prefix để **đánh dấu** "private" — nhưng vẫn truy cập được. Đây chỉ là **convention**, không phải cơ chế ngôn ngữ.

```js
class User {
  constructor(name) {
    this._name = name;     // "Private" theo convention
  }

  getName() {
    return this._name;
  }
}

const user = new User('Phong');
user._name; // 'Phong' — vẫn truy cập được! Chỉ là lời nhắc "đừng truy cập"
```

---

## 2. Getters & Setters — Kiểm soát truy cập

Getter/Setter tạo ra **interface** giữa code bên ngoài và dữ liệu bên trong. Bên ngoài nghĩ rằng đang truy cập property, nhưng thực tế đang gọi method.

```js
class Temperature {
  #celsius;

  constructor(celsius) {
    this.celsius = celsius; // Gọi setter → có validate
  }

  // Getter: đọc giá trị
  get celsius() {
    return this.#celsius;
  }

  // Setter: ghi giá trị với validation
  set celsius(value) {
    if (typeof value !== 'number') throw new TypeError('Must be a number');
    if (value < -273.15) throw new RangeError('Below absolute zero');
    this.#celsius = value;
  }

  // Computed property: Fahrenheit tính từ Celsius
  get fahrenheit() {
    return this.#celsius * 9/5 + 32;
  }

  set fahrenheit(value) {
    this.celsius = (value - 32) * 5/9; // Gọi setter celsius → validate
  }
}

const temp = new Temperature(100);
temp.celsius;      // 100
temp.fahrenheit;   // 212
temp.fahrenheit = 32;
temp.celsius;      // 0
// temp.celsius = -300; // RangeError: Below absolute zero
```

---

## 3. Encapsulation với Closure (Pre-ES2022)

Trước khi có `#privateField`, closure là cách tạo private data:

```js
function createUser(name, password) {
  // Private data — không ai truy cập được từ ngoài
  let _password = password;
  let _loginAttempts = 0;

  // Public interface
  return {
    name, // Public

    login(pwd) {
      if (_loginAttempts >= 3) throw new Error('Locked');
      if (pwd === _password) {
        _loginAttempts = 0;
        return true;
      }
      _loginAttempts++;
      return false;
    },

    changePassword(oldPwd, newPwd) {
      if (oldPwd !== _password) throw new Error('Wrong password');
      _password = newPwd;
    },
  };
}

const user = createUser('Phong', 'secret');
user.login('secret');  // true
// Không thể truy cập _password, _loginAttempts
```

---

## 4. Readonly Properties

Tạo property chỉ đọc, không thể thay đổi từ bên ngoài.

```js
class Order {
  #id;
  #createdAt;
  #items;

  constructor(items) {
    this.#id = crypto.randomUUID();
    this.#createdAt = new Date();
    this.#items = [...items]; // Copy để tránh mutation từ ngoài
  }

  // Chỉ có getter, KHÔNG có setter → readonly
  get id() { return this.#id; }
  get createdAt() { return this.#createdAt; }
  get items() { return [...this.#items]; } // Trả về copy

  get total() {
    return this.#items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

const order = new Order([{ name: 'Book', price: 100, qty: 2 }]);
order.id;         // 'abc-123...'
// order.id = 'x'; // Im lặng hoặc TypeError trong strict mode
order.items.push({ name: 'Hack' }); // Không ảnh hưởng bản gốc vì trả về copy
```

---

## 5. Tổng kết Best Practices

1. **Mặc định private** — chỉ expose những gì bên ngoài cần
2. **Dùng getter/setter** — để validate, tính toán, hoặc log khi truy cập data
3. **Trả về copy** — khi expose collection (array, object), trả về copy thay vì reference
4. **Immutable khi có thể** — dùng `Object.freeze` hoặc chỉ có getter cho readonly data
5. **Interface ổn định** — thay đổi implementation bên trong thoải mái, giữ public API không đổi
