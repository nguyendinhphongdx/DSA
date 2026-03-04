# JSX Deep Dive - Cách React render hoạt động bên trong

## Virtual DOM là gì?

React không thao tác **DOM thật** trực tiếp (vì chậm). Thay vào đó dùng **Virtual DOM** — một bản sao nhẹ (plain JS object) của DOM.

```
   Bạn viết JSX          React tạo Virtual DOM         So sánh & cập nhật DOM thật
┌──────────────┐      ┌───────────────────┐        ┌──────────────────┐
│ <div>        │      │ { type: "div",    │        │ document         │
│   <h1>Hi</h1>│  →   │   children: [     │   →    │   .createElement │
│   <p>Text</p>│      │     { type: "h1"} │        │   .textContent   │
│ </div>       │      │     { type: "p" } │        │   ...            │
└──────────────┘      │   ]              }│        └──────────────────┘
                      └───────────────────┘
```

### Reconciliation (Diffing Algorithm)

Khi state/props thay đổi, React:
1. Tạo Virtual DOM **mới**
2. So sánh với Virtual DOM **cũ** (diffing)
3. Chỉ cập nhật **phần khác** trong DOM thật

```jsx
// Render 1: count = 0
<div>
  <h1>Counter</h1>
  <p>Count: 0</p>      ← chỉ phần này thay đổi
  <button>+1</button>
</div>

// Render 2: count = 1
<div>
  <h1>Counter</h1>
  <p>Count: 1</p>      ← React chỉ update textContent "0" → "1"
  <button>+1</button>  ← KHÔNG đụng vào
</div>
```

### Quy tắc Diffing:

1. **Khác type** → xóa cây cũ, tạo cây mới hoàn toàn
```jsx
// Render 1
<div><Counter /></div>
// Render 2
<span><Counter /></span>
// → Xóa <div> + <Counter>, tạo lại <span> + <Counter> (mất state!)
```

2. **Cùng type** → giữ DOM node, chỉ update attributes
```jsx
// Render 1
<div className="old" />
// Render 2
<div className="new" />
// → Chỉ update className, KHÔNG xóa/tạo lại div
```

3. **List** → dùng `key` để React biết element nào thay đổi

---

## createElement vs JSX

JSX chỉ là **syntactic sugar**. Bạn hoàn toàn có thể viết React không dùng JSX:

```jsx
// JSX
const element = (
  <div className="app">
    <h1>Hello</h1>
    <p>Welcome to {name}'s page</p>
  </div>
);

// Không có JSX (createElement)
const element = React.createElement(
  "div",
  { className: "app" },
  React.createElement("h1", null, "Hello"),
  React.createElement("p", null, "Welcome to ", name, "'s page")
);

// Cả hai tạo cùng object:
{
  type: "div",
  props: {
    className: "app",
    children: [
      { type: "h1", props: { children: "Hello" } },
      { type: "p", props: { children: ["Welcome to ", "Phong", "'s page"] } }
    ]
  }
}
```

---

## Rendering behavior chi tiết

### Khi nào React KHÔNG render?

```jsx
function App() {
  const [count, setCount] = useState(0);

  // React sẽ SKIP re-render nếu state mới === state cũ
  const handleClick = () => {
    setCount(0); // state vẫn = 0 → KHÔNG re-render
  };

  // Object/Array: so sánh REFERENCE, không phải value
  const [user, setUser] = useState({ name: "Phong" });
  const handleUpdate = () => {
    setUser(user); // cùng reference → KHÔNG re-render
    setUser({ name: "Phong" }); // KHÁC reference → CÓ re-render (dù value giống!)
  };
}
```

### Strict Mode (Development)

```jsx
// main.jsx
<React.StrictMode>
  <App />
</React.StrictMode>

// Strict Mode gọi component 2 LẦN trong development
// để phát hiện side effects không mong muốn.
// Đây là bình thường, không xảy ra trong production.
```

---

## Fragments chi tiết

```jsx
// Fragment đầy đủ (có thể truyền key)
import { Fragment } from "react";

function Glossary({ items }) {
  return (
    <dl>
      {items.map(item => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

// Short syntax (KHÔNG truyền được key)
<>
  <dt>React</dt>
  <dd>A JS library</dd>
</>
```

> **Khi nào dùng Fragment?**
> - Khi cần return nhiều element mà không muốn thêm DOM node thừa (div wrapper)
> - Khi cần `key` trong list → dùng `<Fragment key={id}>`

---

## Portals - Render ra ngoài parent DOM

```jsx
import { createPortal } from "react-dom";

function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  // Render children vào #modal-root thay vì parent DOM
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

// Sử dụng
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      <Modal isOpen={showModal}>
        <h2>Hello from Portal!</h2>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  );
}
```

> **Tại sao dùng Portal?** Modal, tooltip, dropdown cần render **trên cùng** (z-index, overflow) mà không bị ảnh hưởng bởi CSS của parent.
