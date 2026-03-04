# Lists & Keys

## 1. Render danh sách với map()

```jsx
function FruitList() {
  const fruits = ["Apple", "Banana", "Cherry"];

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}

// Kết quả:
// • Apple
// • Banana
// • Cherry
```

---

## 2. Key là gì? Tại sao cần?

`key` giúp React **nhận diện** element nào thay đổi, thêm, hoặc xóa trong list.

```jsx
// Không có key: React phải re-render TOÀN BỘ list
// Có key: React chỉ update element thay đổi

// ❌ Dùng index làm key (có thể gây bug khi list thay đổi)
{items.map((item, index) => <li key={index}>{item}</li>)}

// ✅ Dùng ID unique
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

### Tại sao index làm key gây bug?

```jsx
// List ban đầu:
// key=0: Apple    key=1: Banana    key=2: Cherry

// Xóa "Apple" (index 0):
// key=0: Banana   key=1: Cherry
//   ↑ React nghĩ key=0 đổi content, key=2 bị xóa
//   → SAI! Thực ra key=0 (Apple) bị xóa

// Với unique ID:
// key="a": Apple  key="b": Banana  key="c": Cherry
// Xóa Apple:
// key="b": Banana  key="c": Cherry
// → React biết chính xác key="a" bị xóa ✓
```

**Quy tắc:**
- Dùng `item.id` từ database/API
- Nếu không có id → dùng `crypto.randomUUID()` khi tạo item
- Chỉ dùng index khi: list **tĩnh**, **không sắp xếp lại**, **không xóa**

---

## 3. Ví dụ thực tế: Todo List

```jsx
import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", completed: false },
    { id: 2, text: "Build project", completed: false },
  ]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, {
      id: Date.now(), // unique ID
      text: input,
      completed: false,
    }]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <div>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{
            textDecoration: todo.completed ? "line-through" : "none"
          }}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>×</button>
          </li>
        ))}
      </ul>
      <p>{todos.filter(t => !t.completed).length} remaining</p>
    </div>
  );
}
```

---

## 4. Render danh sách phức tạp

### Nested Lists

```jsx
function CategoryList({ categories }) {
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <ul>
            {category.items.map(item => (
              <li key={item.id}>{item.name} - ${item.price}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Data
const categories = [
  { id: 1, name: "Fruits", items: [
    { id: 101, name: "Apple", price: 1.5 },
    { id: 102, name: "Banana", price: 0.75 },
  ]},
  { id: 2, name: "Vegetables", items: [
    { id: 201, name: "Carrot", price: 2.0 },
  ]},
];
```

### Filter + Sort + Render

```jsx
function UserList({ users }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

  return (
    <div>
      <input
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
      </select>

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {filteredUsers.map(user => (
            <li key={user.id}>{user.name} ({user.email})</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 5. Empty States & Loading

```jsx
function PostList({ posts, isLoading, error }) {
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (posts.length === 0) return <p>No posts yet. Create one!</p>;

  return (
    <ul>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  );
}
```

---

## 6. Bài tập

1. Render danh sách sản phẩm với filter theo category và search bar
2. Tạo Kanban board đơn giản (3 cột: Todo, In Progress, Done) với drag-drop (move between columns)
3. Tạo table users có sort (click header), filter (search input), pagination
