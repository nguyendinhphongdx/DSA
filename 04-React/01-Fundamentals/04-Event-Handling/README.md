# Event Handling (Xử lý sự kiện)

## 1. Cơ bản

React dùng **Synthetic Events** — wrapper chuẩn hóa events trên mọi browser.

```jsx
// HTML thuần:
<button onclick="handleClick()">Click</button>

// React:
<button onClick={handleClick}>Click</button>
//       ↑ camelCase    ↑ function reference (KHÔNG có ())
```

```jsx
function App() {
  // Cách 1: Hàm riêng
  const handleClick = () => {
    console.log("Clicked!");
  };

  // Cách 2: Inline arrow function
  return (
    <div>
      <button onClick={handleClick}>Click 1</button>
      <button onClick={() => console.log("Clicked!")}>Click 2</button>
    </div>
  );
}
```

> **Common mistake:** `onClick={handleClick()}` → gọi hàm **NGAY khi render**, không phải khi click!

---

## 2. Event Object

React truyền **SyntheticEvent** vào handler:

```jsx
function Form() {
  const handleChange = (event) => {
    console.log(event.target.value);  // giá trị input
    console.log(event.target.name);   // tên input
    console.log(event.type);          // "change"

    event.preventDefault();   // ngăn form submit mặc định
    event.stopPropagation();  // ngăn event bubble lên parent
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // QUAN TRỌNG: ngăn trang reload
    console.log("Form submitted!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 3. Truyền tham số cho Event Handler

```jsx
function TodoList() {
  const todos = ["Learn React", "Build app", "Deploy"];

  // ❌ Gọi ngay khi render
  // <button onClick={handleDelete(index)}>Delete</button>

  // ✅ Cách 1: Arrow function wrapper
  const handleDelete = (index) => {
    console.log(`Deleting todo at index ${index}`);
  };

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          {todo}
          <button onClick={() => handleDelete(index)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 4. Các event phổ biến

```jsx
// Mouse events
<button onClick={fn}>Click</button>
<div onDoubleClick={fn}>Double click</div>
<div onMouseEnter={fn} onMouseLeave={fn}>Hover</div>

// Keyboard events
<input onKeyDown={fn} onKeyUp={fn} onKeyPress={fn} />

// Form events
<input onChange={fn} onFocus={fn} onBlur={fn} />
<form onSubmit={fn} />

// Clipboard
<input onCopy={fn} onPaste={fn} onCut={fn} />

// Scroll
<div onScroll={fn}>...</div>
```

### Ví dụ: Keyboard shortcuts

```jsx
function SearchBox() {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Search:", e.target.value);
    }
    if (e.key === "Escape") {
      e.target.value = "";
      e.target.blur();
    }
    // Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      console.log("Open search modal");
    }
  };

  return <input placeholder="Search..." onKeyDown={handleKeyDown} />;
}
```

---

## 5. Event Delegation & Bubbling

React dùng **event delegation** — gắn 1 listener ở root, không phải ở mỗi element.

```jsx
function App() {
  // Event bubble: child → parent
  return (
    <div onClick={() => console.log("div clicked")}>
      <button onClick={(e) => {
        e.stopPropagation(); // ngăn bubble lên div
        console.log("button clicked");
      }}>
        Click me
      </button>
    </div>
  );
}

// Không có stopPropagation:
// Click button → "button clicked" → "div clicked"

// Có stopPropagation:
// Click button → "button clicked" (dừng tại đây)
```

### Ví dụ thực tế: Table với event delegation

```jsx
function UserTable({ users, onEdit, onDelete }) {
  // 1 handler cho toàn bộ table thay vì mỗi button
  const handleClick = (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const userId = button.dataset.userId;
    const action = button.dataset.action;

    if (action === "edit") onEdit(userId);
    if (action === "delete") onDelete(userId);
  };

  return (
    <table onClick={handleClick}>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              <button data-user-id={user.id} data-action="edit">Edit</button>
              <button data-user-id={user.id} data-action="delete">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 6. Bài tập

1. Tạo counter với keyboard: ↑ tăng, ↓ giảm, R reset
2. Tạo component hiển thị vị trí chuột (x, y) theo thời gian thực
3. Tạo form login với validation khi blur (email format, password min length)
4. Tạo color picker: click vào ô màu → đổi background
