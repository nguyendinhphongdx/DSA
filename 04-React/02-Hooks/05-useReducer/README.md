# useReducer

## 1. Khái niệm

`useReducer` là alternative cho `useState` khi state **phức tạp** hoặc có **nhiều action liên quan**.

Lấy cảm hứng từ **Redux pattern**: `(state, action) → newState`

```
useState:     setState(newValue)      → đơn giản, trực tiếp
useReducer:   dispatch({ type: ... }) → có logic tập trung, dễ test
```

---

## 2. Cú pháp

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
//      ↑        ↑                    ↑          ↑
//   state   gửi action        hàm xử lý    giá trị ban đầu
```

### Ví dụ: Counter

```jsx
// Reducer function (pure function)
function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    case "SET":
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+1</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-1</button>
      <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
      <button onClick={() => dispatch({ type: "SET", payload: 100 })}>Set 100</button>
    </div>
  );
}

// Flow:
// 1. Click "+1" → dispatch({ type: "INCREMENT" })
// 2. React gọi counterReducer({ count: 0 }, { type: "INCREMENT" })
// 3. Reducer return { count: 1 }
// 4. React cập nhật state → re-render
```

---

## 3. Ví dụ thực tế: Todo App

```jsx
const initialState = {
  todos: [],
  filter: "all", // "all" | "active" | "completed"
};

function todoReducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false,
        }],
      };

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "CLEAR_COMPLETED":
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };

    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [input, setInput] = useState("");

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === "active") return !todo.completed;
    if (state.filter === "completed") return todo.completed;
    return true;
  });

  const handleAdd = () => {
    if (!input.trim()) return;
    dispatch({ type: "ADD_TODO", payload: input });
    setInput("");
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleAdd}>Add</button>

      <div>
        {["all", "active", "completed"].map(f => (
          <button key={f}
            onClick={() => dispatch({ type: "SET_FILTER", payload: f })}
            style={{ fontWeight: state.filter === f ? "bold" : "normal" }}
          >
            {f}
          </button>
        ))}
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <span
              onClick={() => dispatch({ type: "TOGGLE_TODO", payload: todo.id })}
              style={{ textDecoration: todo.completed ? "line-through" : "none" }}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: "DELETE_TODO", payload: todo.id })}>×</button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}>
        Clear completed
      </button>
    </div>
  );
}
```

---

## 4. useReducer + useContext = Mini Redux

```jsx
// Kết hợp để share complex state across components
const TodoContext = createContext();

function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within TodoProvider");
  return context;
}

// Bất kỳ component nào cũng có thể:
function AddTodo() {
  const { dispatch } = useTodos();
  // dispatch({ type: "ADD_TODO", payload: "..." })
}

function TodoList() {
  const { state } = useTodos();
  // state.todos.map(...)
}
```

---

## 5. useState vs useReducer

| | useState | useReducer |
|--|---------|-----------|
| State đơn giản | ✅ | Overkill |
| State phức tạp (object lồng nhau) | Khó quản lý | ✅ |
| Nhiều action liên quan | Nhiều setter function | ✅ Tập trung |
| Logic cần test | Khó test | ✅ Pure function, dễ test |
| Share state pattern | Không rõ | ✅ useReducer + Context |

**Quy tắc đơn giản:**
- 1-2 state values → `useState`
- 3+ state values liên quan hoặc complex logic → `useReducer`

---

## 6. Bài tập

1. Convert form state (name, email, password, errors) sang useReducer
2. Tạo Shopping Cart với reducer: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART
3. Tạo Undo/Redo functionality dùng useReducer (lưu history)
4. Tạo Chat app state: messages, currentRoom, users dùng useReducer + Context
