# State Libraries

## 1. Tổng quan

Khi app lớn lên, **Context + useReducer** có thể không đủ (performance, boilerplate, devtools). Đây là lúc cần **state management libraries**.

```
Mức độ phức tạp tăng dần:

useState          → Component đơn lẻ
Lifting State Up  → 2-3 components share
Context API       → Tránh prop drilling, low-frequency updates
Zustand           → Simple global state, ít boilerplate
Redux Toolkit     → Complex state, middleware, devtools mạnh
Jotai             → Atomic state, fine-grained reactivity
```

---

## 2. Redux Toolkit (RTK)

Redux là library state management lâu đời nhất. **Redux Toolkit** là cách viết Redux hiện đại, giảm boilerplate.

### Cài đặt

```bash
npm install @reduxjs/toolkit react-redux
```

### Concepts

```
Action  →  Reducer  →  Store  →  UI
 (what)    (how)      (state)   (render)

User clicks "Add to cart"
  → dispatch({ type: "cart/addItem", payload: item })
  → reducer xử lý action, trả về state mới
  → Store cập nhật
  → Components subscribe → re-render
```

### createSlice

```jsx
// features/counter/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0, history: [] },

  reducers: {
    increment(state) {
      state.value += 1;  // RTK dùng Immer → mutate OK!
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
      state.history.push(action.payload);
    },
    reset(state) {
      state.value = 0;
      state.history = [];
    },
  },
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

### configureStore

```jsx
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import todosReducer from "../features/todos/todosSlice";

const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

export default store;
```

### Provider

```jsx
// main.jsx
import { Provider } from "react-redux";
import store from "./app/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### Sử dụng trong Component

```jsx
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, incrementByAmount } from "./counterSlice";

function Counter() {
  const count = useSelector(state => state.counter.value);
  const history = useSelector(state => state.counter.history);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <p>History: {history.join(", ")}</p>
    </div>
  );
}
```

### Async: createAsyncThunk

```jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async action
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Component
function UserList() {
  const { list, loading, error } = useSelector(state => state.users);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {list.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

---

## 3. Zustand

Zustand là library **minimal**, không cần Provider, không cần boilerplate. Rất phổ biến cho dự án vừa và nhỏ.

### Cài đặt

```bash
npm install zustand
```

### Tạo Store

```jsx
import { create } from "zustand";

// Tạo store = 1 function call!
const useCounterStore = create((set, get) => ({
  // State
  count: 0,
  history: [],

  // Actions
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),

  incrementBy: (amount) => set(state => ({
    count: state.count + amount,
    history: [...state.history, amount],
  })),

  reset: () => set({ count: 0, history: [] }),

  // Computed (dùng get())
  getTotal: () => get().history.reduce((sum, n) => sum + n, 0),
}));
```

### Sử dụng

```jsx
function Counter() {
  // Chỉ subscribe vào count → chỉ re-render khi count đổi
  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  const decrement = useCounterStore(state => state.decrement);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}

// Hoặc destructure nhiều giá trị
function CounterWithHistory() {
  const { count, history, incrementBy, reset } = useCounterStore();
  // ⚠️ Cách này re-render khi BẤT KỲ state nào đổi

  return (
    <div>
      <p>Count: {count}</p>
      <p>History: {history.join(", ")}</p>
      <button onClick={() => incrementBy(10)}>+10</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Async actions

```jsx
const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      set({ users, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

// Component
function UserList() {
  const { users, loading, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <p>Loading...</p>;
  return users.map(u => <p key={u.id}>{u.name}</p>);
}
```

### Middleware: persist

```jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: "light",
      language: "vi",
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "settings-storage", // key trong localStorage
    }
  )
);

// State tự động persist vào localStorage!
```

### Middleware: devtools

```jsx
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(
        state => ({ count: state.count + 1 }),
        false,
        "increment" // Action name trong devtools
      ),
    }),
    { name: "MyStore" }
  )
);
```

---

## 4. Jotai (Atomic State)

Jotai theo mô hình **atomic** - mỗi piece of state là 1 atom. Components chỉ subscribe vào atoms chúng cần.

### Cài đặt

```bash
npm install jotai
```

### Atoms

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

// Primitive atom
const countAtom = atom(0);
const nameAtom = atom("Phong");

// Derived atom (computed)
const doubleCountAtom = atom(
  (get) => get(countAtom) * 2 // Read-only, tự cập nhật
);

// Writable derived atom
const countWithLogAtom = atom(
  (get) => get(countAtom),
  (get, set, newValue) => {
    console.log(`Count: ${get(countAtom)} → ${newValue}`);
    set(countAtom, newValue);
  }
);

// Async atom
const userAtom = atom(async () => {
  const res = await fetch("/api/user");
  return res.json();
});
```

### Sử dụng

```jsx
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom); // Chỉ đọc

  return (
    <div>
      <p>Count: {count} (Double: {doubleCount})</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}

function NameDisplay() {
  const name = useAtomValue(nameAtom);  // Chỉ đọc, không re-render khi count đổi
  return <p>Name: {name}</p>;
}

function NameEditor() {
  const setName = useSetAtom(nameAtom); // Chỉ write, không re-render khi name đổi
  return <input onChange={e => setName(e.target.value)} />;
}
```

---

## 5. So sánh

| Feature | Redux Toolkit | Zustand | Jotai |
|---------|--------------|---------|-------|
| Boilerplate | Trung bình | Ít | Ít nhất |
| Learning curve | Cao | Thấp | Thấp |
| DevTools | Tốt nhất | Tốt | Cơ bản |
| Bundle size | ~11kb | ~1kb | ~3kb |
| Provider required | Có | Không | Tùy chọn |
| Middleware | Nhiều | Có | Ít |
| Async | createAsyncThunk | Trực tiếp | Async atoms |
| Tốt cho | App lớn, team lớn | App vừa/nhỏ | Fine-grained reactivity |

### Khi nào chọn gì?

```
App nhỏ, state đơn giản?
  → useState + Context

Cần global state, ít boilerplate?
  → Zustand ✅

App lớn, team lớn, cần strict patterns?
  → Redux Toolkit ✅

Cần fine-grained reactivity, atomic?
  → Jotai ✅

Cần server state management?
  → TanStack Query (xem bài Data Fetching)
```

---

## 6. Ví dụ thực tế: Todo App với Zustand

```jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTodoStore = create(
  persist(
    (set, get) => ({
      todos: [],
      filter: "all", // "all" | "active" | "completed"

      addTodo: (text) =>
        set(state => ({
          todos: [
            ...state.todos,
            { id: Date.now(), text, completed: false },
          ],
        })),

      toggleTodo: (id) =>
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),

      removeTodo: (id) =>
        set(state => ({
          todos: state.todos.filter(todo => todo.id !== id),
        })),

      setFilter: (filter) => set({ filter }),

      // Computed
      getFilteredTodos: () => {
        const { todos, filter } = get();
        switch (filter) {
          case "active": return todos.filter(t => !t.completed);
          case "completed": return todos.filter(t => t.completed);
          default: return todos;
        }
      },

      getStats: () => {
        const todos = get().todos;
        return {
          total: todos.length,
          active: todos.filter(t => !t.completed).length,
          completed: todos.filter(t => t.completed).length,
        };
      },
    }),
    { name: "todo-storage" }
  )
);

// Components
function TodoApp() {
  return (
    <div>
      <h1>Todo App</h1>
      <AddTodo />
      <FilterBar />
      <TodoList />
      <Stats />
    </div>
  );
}

function AddTodo() {
  const [text, setText] = useState("");
  const addTodo = useTodoStore(s => s.addTodo);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button>Add</button>
    </form>
  );
}

function TodoList() {
  const getFilteredTodos = useTodoStore(s => s.getFilteredTodos);
  const toggleTodo = useTodoStore(s => s.toggleTodo);
  const removeTodo = useTodoStore(s => s.removeTodo);

  const todos = getFilteredTodos();

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
            {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>×</button>
        </li>
      ))}
    </ul>
  );
}

function FilterBar() {
  const filter = useTodoStore(s => s.filter);
  const setFilter = useTodoStore(s => s.setFilter);

  return (
    <div>
      {["all", "active", "completed"].map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          style={{ fontWeight: filter === f ? "bold" : "normal" }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function Stats() {
  const getStats = useTodoStore(s => s.getStats);
  const { total, active, completed } = getStats();

  return <p>{active} active / {completed} done / {total} total</p>;
}
```

---

## 7. Bài tập

1. Tạo counter app với Redux Toolkit (increment, decrement, incrementByAmount)
2. Tạo todo app với Zustand (add, remove, toggle, filter, persist)
3. Tạo theme + language settings với Jotai atoms
4. Tạo shopping cart store (Zustand): add item, remove, update quantity, total price
5. So sánh: implement cùng 1 feature với Context, Zustand, và RTK
