# JSX & Rendering

## 1. JSX là gì?

JSX (JavaScript XML) là cú pháp mở rộng cho phép viết **HTML trong JavaScript**. Nó KHÔNG phải HTML thật — Babel sẽ biên dịch JSX thành `React.createElement()`.

```jsx
// Bạn viết JSX:
const element = <h1 className="title">Hello World</h1>;

// Babel biên dịch thành:
const element = React.createElement("h1", { className: "title" }, "Hello World");

// React tạo ra object (React Element):
{
  type: "h1",
  props: {
    className: "title",
    children: "Hello World"
  }
}
```

> **Tại sao dùng JSX?** Trực quan hơn `createElement()`, dễ đọc, dễ debug. 99% React code dùng JSX.

---

## 2. Quy tắc JSX

### 2.1 Phải return 1 element duy nhất

```jsx
// ❌ SAI: 2 element ngang hàng
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ ĐÚNG: Wrap trong 1 parent
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ ĐÚNG: Dùng Fragment (không tạo DOM thừa)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);
```

### 2.2 Đóng tất cả tags

```jsx
// HTML cho phép:  <img src="...">    <br>    <input>
// JSX bắt buộc:  <img src="..." />  <br />  <input />
```

### 2.3 Dùng camelCase cho attributes

```jsx
// HTML:  class, for, onclick, tabindex
// JSX:   className, htmlFor, onClick, tabIndex

<label htmlFor="name" className="label">
  <input id="name" tabIndex={1} onClick={handleClick} />
</label>
```

### 2.4 JavaScript expressions dùng `{}`

```jsx
const name = "Phong";
const isLoggedIn = true;

return (
  <div>
    <h1>Hello {name}</h1>                    {/* biến */}
    <p>{2 + 3}</p>                           {/* expression */}
    <p>{isLoggedIn ? "Welcome" : "Login"}</p> {/* ternary */}
    <p>{new Date().getFullYear()}</p>         {/* method call */}
  </div>
);
```

---

## 3. Rendering

### 3.1 Root Render

```jsx
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// React sẽ:
// 1. Tạo Virtual DOM từ <App />
// 2. So sánh với DOM thật (diffing)
// 3. Cập nhật chỉ phần thay đổi (reconciliation)
```

### 3.2 Conditional Rendering

Hiển thị UI khác nhau tùy điều kiện:

```jsx
function Greeting({ isLoggedIn, user }) {
  // Cách 1: if/else (return sớm)
  if (!isLoggedIn) {
    return <p>Please login</p>;
  }

  // Cách 2: Ternary (inline)
  return (
    <div>
      <h1>{user.isAdmin ? "Admin Dashboard" : "User Dashboard"}</h1>

      {/* Cách 3: && (render hoặc không render) */}
      {user.notifications > 0 && (
        <span className="badge">{user.notifications}</span>
      )}

      {/* Cách 4: null = không render gì */}
      {user.isBanned ? null : <button>Post</button>}
    </div>
  );
}

// Sử dụng
<Greeting isLoggedIn={true} user={{ isAdmin: false, notifications: 3, isBanned: false }} />
```

> **Cẩn thận với `&&`:**
> `{0 && <Component />}` sẽ render `0` (vì 0 là falsy nhưng React vẫn hiển thị số).
> Fix: `{count > 0 && <Component />}`

---

## 4. Ví dụ thực tế: User Profile Card

```jsx
function ProfileCard({ user }) {
  const { name, avatar, bio, isOnline, posts } = user;

  return (
    <div className="profile-card">
      <img src={avatar} alt={name} />

      <div className="info">
        <h2>
          {name}
          {isOnline && <span className="online-dot">●</span>}
        </h2>

        {bio ? <p className="bio">{bio}</p> : <p className="bio empty">No bio yet</p>}

        <p>{posts.length} posts</p>
      </div>
    </div>
  );
}

// Sử dụng
<ProfileCard
  user={{
    name: "Phong",
    avatar: "/avatar.jpg",
    bio: "Frontend Developer",
    isOnline: true,
    posts: [1, 2, 3]
  }}
/>
```

---

## 5. Style trong JSX

```jsx
// Cách 1: Inline style (object, camelCase)
<div style={{ backgroundColor: "blue", fontSize: "16px", marginTop: 10 }}>
  Hello
</div>

// Cách 2: className + CSS file
import "./App.css";
<div className="container">Hello</div>

// Cách 3: Dynamic className
<div className={`btn ${isActive ? "btn-active" : ""}`}>
  Click me
</div>
```

---

## 6. Common Mistakes

```jsx
// ❌ Quên {} cho expression
<p>Hello name</p>        // render "Hello name"
<p>Hello {name}</p>      // ✅ render "Hello Phong"

// ❌ Dùng class thay vì className
<div class="box">        // Warning!
<div className="box">    // ✅

// ❌ Inline style dùng string
<div style="color: red"> // Error!
<div style={{ color: "red" }}> // ✅

// ❌ Render object trực tiếp
<p>{user}</p>            // Error: Objects are not valid React child
<p>{user.name}</p>       // ✅
<p>{JSON.stringify(user)}</p> // ✅ (debug)
```

---

## 7. Bài tập

1. Tạo component `Greeting` nhận prop `name` và hiển thị "Hello, {name}!"
2. Tạo component `TimeOfDay` hiển thị "Good morning/afternoon/evening" tùy giờ hiện tại
3. Tạo component `ProductCard` với conditional rendering: hiện badge "SALE" nếu `onSale={true}`
4. Tạo component `StatusMessage` render khác nhau cho status: "loading", "error", "success"
