# Builder Pattern

## 1. Khái niệm

Xây dựng object phức tạp **step by step**. Cho phép tạo các biến thể khác nhau của cùng 1 object.

```
┌──────────┐    step1()    step2()    step3()    ┌──────────┐
│  Client  │ ──────────→──────────→──────────→   │  Product │
└──────────┘    Builder    Builder    build()     └──────────┘
```

---

## 2. Implementation

### Query Builder

```javascript
class QueryBuilder {
  #table = '';
  #conditions = [];
  #columns = ['*'];
  #orderBy = '';
  #limit = 0;

  from(table) {
    this.#table = table;
    return this; // Method chaining
  }

  select(...columns) {
    this.#columns = columns;
    return this;
  }

  where(condition) {
    this.#conditions.push(condition);
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.#orderBy = `${column} ${direction}`;
    return this;
  }

  limit(n) {
    this.#limit = n;
    return this;
  }

  build() {
    let query = `SELECT ${this.#columns.join(', ')} FROM ${this.#table}`;
    if (this.#conditions.length) {
      query += ` WHERE ${this.#conditions.join(' AND ')}`;
    }
    if (this.#orderBy) query += ` ORDER BY ${this.#orderBy}`;
    if (this.#limit) query += ` LIMIT ${this.#limit}`;
    return query;
  }
}

// Sử dụng - fluent API
const query = new QueryBuilder()
  .from('users')
  .select('name', 'email', 'age')
  .where('age > 18')
  .where('status = "active"')
  .orderBy('name')
  .limit(10)
  .build();

// SELECT name, email, age FROM users WHERE age > 18 AND status = "active" ORDER BY name LIMIT 10
```

### HTTP Request Builder

```javascript
class RequestBuilder {
  #url = '';
  #method = 'GET';
  #headers = {};
  #body = null;
  #timeout = 5000;

  setUrl(url) { this.#url = url; return this; }
  setMethod(method) { this.#method = method; return this; }
  setHeader(key, value) { this.#headers[key] = value; return this; }
  setBody(body) { this.#body = body; return this; }
  setTimeout(ms) { this.#timeout = ms; return this; }

  setJSON(data) {
    this.#headers['Content-Type'] = 'application/json';
    this.#body = JSON.stringify(data);
    return this;
  }

  setAuth(token) {
    this.#headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  async build() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.#timeout);

    try {
      const response = await fetch(this.#url, {
        method: this.#method,
        headers: this.#headers,
        body: this.#body,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Sử dụng
const response = await new RequestBuilder()
  .setUrl('/api/users')
  .setMethod('POST')
  .setAuth(token)
  .setJSON({ name: 'Phong', email: 'phong@mail.com' })
  .setTimeout(10000)
  .build();
```

---

## 3. Builder vs Constructor

```javascript
// ❌ Constructor với quá nhiều params
const user = new User('Phong', 'phong@mail.com', 25, '0901234567',
  'Ha Noi', 'Vietnam', 'admin', true, false, 'dark');

// ✅ Builder - rõ ràng hơn
const user = new UserBuilder()
  .setName('Phong')
  .setEmail('phong@mail.com')
  .setAge(25)
  .setRole('admin')
  .setTheme('dark')
  .build();
```

---

## 4. Khi nào dùng

- Object có nhiều optional parameters
- Muốn tạo các biến thể khác nhau của cùng 1 object
- Muốn fluent API (method chaining)
- Object construction phức tạp, nhiều bước

---

## 5. Bài tập

```javascript
// Tạo HTMLBuilder:
// - createElement(tag)
// - addClass(className)
// - setAttribute(key, value)
// - setContent(text)
// - addChild(childBuilder)
// - build() → trả về HTML string
//
// Ví dụ:
// new HTMLBuilder()
//   .createElement('div')
//   .addClass('container')
//   .addChild(new HTMLBuilder().createElement('h1').setContent('Hello'))
//   .addChild(new HTMLBuilder().createElement('p').setContent('World'))
//   .build()
// → '<div class="container"><h1>Hello</h1><p>World</p></div>'
```
