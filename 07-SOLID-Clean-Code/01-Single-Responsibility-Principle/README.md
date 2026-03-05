# Single Responsibility Principle (SRP)

## 1. Khái niệm

> "Một class chỉ nên có **MỘT lý do duy nhất** để thay đổi."
> — Robert C. Martin

Mỗi class/function/module chỉ nên đảm nhận **MỘT nhiệm vụ**. Nếu một class có nhiều lý do để thay đổi, nghĩa là nó đang vi phạm SRP.

```
❌ Vi phạm SRP:
┌──────────────────────────┐
│         User             │
├──────────────────────────┤
│ - name                   │
│ - email                  │
├──────────────────────────┤
│ + validate()             │  ← Logic validation
│ + save()                 │  ← Logic database
│ + sendEmail()            │  ← Logic email
│ + generateReport()       │  ← Logic báo cáo
└──────────────────────────┘
4 lý do để thay đổi = Vi phạm SRP!

✅ Tuân thủ SRP:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    User      │  │ UserValidator│  │UserRepository│  │  UserMailer  │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ - name       │  │ + validate() │  │ + save()     │  │ + sendEmail()│
│ - email      │  │              │  │ + findById() │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
Mỗi class 1 nhiệm vụ!
```

---

## 2. Ví dụ Bad vs Good

### Bad: Class làm quá nhiều việc

```javascript
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }

  // Nhiệm vụ 1: Business logic
  calculatePay() {
    return this.salary * 1.1; // bonus 10%
  }

  // Nhiệm vụ 2: Persistence (database)
  save() {
    const data = JSON.stringify(this);
    fs.writeFileSync('employees.json', data);
  }

  // Nhiệm vụ 3: Reporting
  generateReport() {
    return `Employee: ${this.name}, Pay: ${this.calculatePay()}`;
  }

  // Nhiệm vụ 4: Logging
  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}
```

**Vấn đề:**
- Thay đổi cách lưu DB → sửa class Employee
- Thay đổi format report → sửa class Employee
- Thay đổi cách tính lương → sửa class Employee
- Khó test từng phần riêng biệt

### Good: Tách thành nhiều class

```javascript
// Chỉ chứa data và business logic liên quan
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
}

// Chỉ xử lý tính lương
class PayCalculator {
  calculate(employee) {
    return employee.salary * 1.1;
  }
}

// Chỉ xử lý lưu trữ
class EmployeeRepository {
  save(employee) {
    const data = JSON.stringify(employee);
    fs.writeFileSync('employees.json', data);
  }

  findByName(name) {
    const data = JSON.parse(fs.readFileSync('employees.json'));
    return data.find(e => e.name === name);
  }
}

// Chỉ xử lý báo cáo
class EmployeeReporter {
  constructor(payCalculator) {
    this.payCalculator = payCalculator;
  }

  generate(employee) {
    const pay = this.payCalculator.calculate(employee);
    return `Employee: ${employee.name}, Pay: ${pay}`;
  }
}
```

---

## 3. SRP với Functions

```javascript
// ❌ Bad: Function làm nhiều việc
function processOrder(order) {
  // Validate
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customer) throw new Error('No customer');

  // Calculate total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
    if (item.quantity > 10) total *= 0.9; // discount
  }

  // Save to DB
  db.orders.insert({ ...order, total, createdAt: new Date() });

  // Send email
  mailer.send(order.customer.email, `Order confirmed! Total: ${total}`);

  return { success: true, total };
}

// ✅ Good: Mỗi function 1 việc
function validateOrder(order) {
  if (!order.items.length) throw new Error('Empty order');
  if (!order.customer) throw new Error('No customer');
}

function calculateTotal(items) {
  return items.reduce((total, item) => {
    const subtotal = item.price * item.quantity;
    return total + (item.quantity > 10 ? subtotal * 0.9 : subtotal);
  }, 0);
}

function saveOrder(order, total) {
  return db.orders.insert({ ...order, total, createdAt: new Date() });
}

function notifyCustomer(email, total) {
  mailer.send(email, `Order confirmed! Total: ${total}`);
}

function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order.items);
  saveOrder(order, total);
  notifyCustomer(order.customer.email, total);
  return { success: true, total };
}
```

---

## 4. SRP với React Components

```jsx
// ❌ Bad: Component làm quá nhiều việc
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchUser().then(setUser); }, []);
  useEffect(() => { fetchOrders().then(setOrders); }, []);
  useEffect(() => { fetchNotifications().then(setNotifications); }, []);

  return (
    <div>
      {/* User info */}
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      {/* Orders */}
      <ul>{orders.map(o => <li key={o.id}>{o.name}</li>)}</ul>
      {/* Notifications */}
      <div>{notifications.map(n => <span key={n.id}>{n.text}</span>)}</div>
    </div>
  );
}

// ✅ Good: Tách thành components nhỏ
function UserInfo({ user }) {
  return <div><h1>{user.name}</h1><p>{user.email}</p></div>;
}

function OrderList({ orders }) {
  return <ul>{orders.map(o => <li key={o.id}>{o.name}</li>)}</ul>;
}

function NotificationBar({ notifications }) {
  return <div>{notifications.map(n => <span key={n.id}>{n.text}</span>)}</div>;
}

function UserDashboard() {
  const user = useUser();
  const orders = useOrders();
  const notifications = useNotifications();

  return (
    <div>
      <UserInfo user={user} />
      <OrderList orders={orders} />
      <NotificationBar notifications={notifications} />
    </div>
  );
}
```

---

## 5. Lợi ích

| Lợi ích | Giải thích |
|---------|-----------|
| Dễ test | Test từng class/function riêng biệt |
| Dễ maintain | Thay đổi 1 tính năng không ảnh hưởng tính năng khác |
| Dễ tái sử dụng | Class nhỏ dễ dùng lại ở nơi khác |
| Dễ hiểu | Đọc tên class là biết nó làm gì |
| Giảm conflict | Nhiều người làm việc trên các class khác nhau |

---

## 6. Dấu hiệu vi phạm SRP

- Class/function quá dài (>200 dòng)
- Tên class chứa "And" hoặc "Manager" (UserAndOrderManager)
- Class import quá nhiều dependencies
- Khi sửa 1 tính năng, phải sửa nhiều methods trong cùng 1 class
- Khó viết unit test vì phải mock quá nhiều thứ

---

## 7. Bài tập

### Bài 1: Tách class vi phạm SRP
```javascript
// Hãy tách class này thành các class nhỏ hơn
class Invoice {
  constructor(items) {
    this.items = items;
  }

  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  applyTax(rate) {
    return this.calculateTotal() * (1 + rate);
  }

  printInvoice() {
    console.log('=== INVOICE ===');
    this.items.forEach(item => console.log(`${item.name}: $${item.price}`));
    console.log(`Total: $${this.calculateTotal()}`);
  }

  saveToFile(filename) {
    fs.writeFileSync(filename, JSON.stringify(this.items));
  }

  sendByEmail(email) {
    mailer.send(email, 'Your Invoice', this.printInvoice());
  }
}
```

### Bài 2: Refactor function
```javascript
// Tách function này thành nhiều functions nhỏ
function registerUser(userData) {
  // Validate
  if (!userData.email.includes('@')) throw new Error('Invalid email');
  if (userData.password.length < 8) throw new Error('Password too short');

  // Hash password
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(userData.password, salt, 1000, 64, 'sha512');

  // Save to DB
  const user = db.users.create({
    email: userData.email,
    password: hash,
    salt: salt,
    createdAt: new Date()
  });

  // Send welcome email
  mailer.send(userData.email, 'Welcome!', 'Thanks for joining us!');

  // Log
  logger.info(`New user registered: ${userData.email}`);

  return user;
}
```
