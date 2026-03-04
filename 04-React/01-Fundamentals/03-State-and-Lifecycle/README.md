# State & Lifecycle

## 1. State là gì?

State là **dữ liệu nội bộ** của component, khi state thay đổi → component **re-render** (UI cập nhật).

**Props vs State:**
| | Props | State |
|--|-------|-------|
| Ai sở hữu? | Parent truyền xuống | Component tự quản lý |
| Thay đổi được? | Read-only | Có (dùng setter) |
| Khi thay đổi? | Parent re-render | Trigger re-render |

```jsx
import { useState } from "react";

function Counter() {
  // Khai báo state: [giá_trị, hàm_cập_nhật]
  const [count, setCount] = useState(0);
  //        ↑        ↑                ↑
  //    state  setter function    giá trị ban đầu

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

---

## 2. Cách React re-render

```
Bước 1: User click button "+1"
Bước 2: setCount(1) được gọi
Bước 3: React lên lịch re-render
Bước 4: Component function chạy lại với count = 1
Bước 5: JSX mới được tạo
Bước 6: React so sánh JSX cũ vs mới (diffing)
Bước 7: Chỉ cập nhật phần thay đổi trong DOM thật

Render 1: <p>Count: 0</p>
Render 2: <p>Count: 1</p>  ← chỉ đổi text "0" → "1"
```

> **Quan trọng:** `setState` là **async** (không cập nhật ngay lập tức).

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // VẪN LÀ 0! (chưa re-render)
  };
}
```

---

## 3. Updater Function

Khi cần tính state mới **dựa trên state cũ**, dùng **updater function**:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ BUG: cả 3 đều đọc count = 0, kết quả chỉ +1
  const handleTripleAdd = () => {
    setCount(count + 1); // 0 + 1 = 1
    setCount(count + 1); // 0 + 1 = 1 (count vẫn = 0!)
    setCount(count + 1); // 0 + 1 = 1
  };

  // ✅ ĐÚNG: dùng updater function
  const handleTripleAdd = () => {
    setCount(prev => prev + 1); // 0 → 1
    setCount(prev => prev + 1); // 1 → 2
    setCount(prev => prev + 1); // 2 → 3
  };

  return <button onClick={handleTripleAdd}>+3</button>;
}
```

> **Quy tắc:** Nếu state mới **phụ thuộc state cũ** → dùng `prev => newValue`.

---

## 4. State với Object & Array

### Object State

```jsx
function Profile() {
  const [user, setUser] = useState({
    name: "Phong",
    age: 25,
    email: "phong@mail.com"
  });

  // ❌ MUTATION (không trigger re-render)
  const handleBad = () => {
    user.name = "New Name"; // mutate trực tiếp
    setUser(user);          // React thấy reference GIỐNG → skip re-render!
  };

  // ✅ Tạo object MỚI (spread operator)
  const handleGood = () => {
    setUser({ ...user, name: "New Name" });
    // spread toàn bộ field cũ, override name
  };

  // ✅ Updater function
  const updateAge = () => {
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };
}
```

### Array State

```jsx
function TodoApp() {
  const [todos, setTodos] = useState(["Learn React", "Build app"]);

  // Thêm
  const addTodo = (text) => {
    setTodos([...todos, text]);         // spread + phần tử mới
    // hoặc: setTodos(prev => [...prev, text]);
  };

  // Xóa
  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  // Cập nhật
  const updateTodo = (index, newText) => {
    setTodos(todos.map((todo, i) => i === index ? newText : todo));
  };

  // ❌ KHÔNG dùng push, splice, pop (mutation!)
  // todos.push("new"); setTodos(todos); ← KHÔNG re-render!
}
```

---

## 5. Lifting State Up

Khi 2 component cần **chia sẻ state** → đưa state lên **parent chung gần nhất**.

```jsx
// ❌ Mỗi component tự quản lý → không đồng bộ
function FahrenheitInput() {
  const [temp, setTemp] = useState(32);
  // ...
}
function CelsiusInput() {
  const [temp, setTemp] = useState(0);
  // ...
}

// ✅ Lifting state lên parent
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  const fahrenheit = celsius * 9 / 5 + 32;

  return (
    <div>
      <label>
        Celsius:
        <input
          type="number"
          value={celsius}
          onChange={e => setCelsius(Number(e.target.value))}
        />
      </label>
      <p>= {fahrenheit.toFixed(1)}°F</p>
    </div>
  );
}
```

---

## 6. Component Lifecycle (vòng đời)

```
1. MOUNTING (tạo mới)
   Component được render lần đầu tiên
   → useEffect(() => { ... }, [])

2. UPDATING (cập nhật)
   State hoặc props thay đổi → re-render
   → useEffect(() => { ... }, [dependency])

3. UNMOUNTING (xóa bỏ)
   Component bị remove khỏi DOM
   → useEffect cleanup: return () => { ... }
```

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Mounting: bắt đầu timer
    const id = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Unmounting: dọn dẹp timer
    return () => clearInterval(id);
  }, []); // [] = chỉ chạy 1 lần khi mount

  return <p>Timer: {seconds}s</p>;
}
```

---

## 7. Batching & Re-render Rules

React 18+ **batch** (gom) nhiều setState thành 1 re-render:

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    setCount(c => c + 1); // không re-render ngay
    setFlag(f => !f);      // không re-render ngay
    // React gom → CHỈ 1 re-render cho cả 2 thay đổi
  };
}
```

**Khi nào component re-render?**
1. State thay đổi
2. Props thay đổi
3. Parent re-render
4. Context thay đổi

---

## 8. Bài tập

1. Tạo `Counter` với +1, -1, reset, và hiển thị "even"/"odd"
2. Tạo `TodoList` với add, delete, toggle complete (dùng array state)
3. Tạo `ProfileEditor` chỉnh sửa name, email, bio (object state)
4. Tạo `TemperatureConverter` chuyển đổi giữa °C, °F, K
