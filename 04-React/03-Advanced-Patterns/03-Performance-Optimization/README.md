# React Performance Optimization

> **Mục tiêu:** Hiểu nguyên nhân gây chậm trong React app và nắm vững các kỹ thuật tối ưu từ cơ bản đến nâng cao.

---

## 1. Hiểu Re-render Trong React

Một component sẽ **re-render** khi:

- **State** của chính nó thay đổi (`setState`, `useState` setter)
- **Props** truyền vào thay đổi (parent re-render và truyền props mới)
- **Parent re-render** -- kể cả khi props không đổi, child vẫn re-render
- **Context value** mà component subscribe thay đổi

```jsx
// Ví dụ: Child re-render dù props KHÔNG đổi
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {/* ExpensiveChild re-render MỖI LẦN count thay đổi dù không nhận prop nào liên quan */}
      <ExpensiveChild />
    </div>
  );
}

function ExpensiveChild() {
  console.log("ExpensiveChild rendered!"); // log mỗi lần parent re-render
  return <div>Tôi là component nặng</div>;
}
```

**Quy tắc vàng:** Re-render không phải lúc nào cũng xấu. React rất nhanh trong việc reconcile. Chỉ optimize khi bạn **đo được** vấn đề thực sự.

---

## 2. React.memo -- Ngăn Re-render Không Cần Thiết

`React.memo` wrap component lại, chỉ re-render khi **props thực sự thay đổi** (shallow comparison).

### Before -- không dùng memo

```jsx
// Child render lại MỖI LẦN Parent render, dù name không đổi
function UserCard({ name, role }) {
  console.log("UserCard rendered");
  return (
    <div className="card">
      <h3>{name}</h3>
      <span>{role}</span>
    </div>
  );
}
```

### After -- dùng React.memo

```jsx
const UserCard = React.memo(function UserCard({ name, role }) {
  console.log("UserCard rendered");
  return (
    <div className="card">
      <h3>{name}</h3>
      <span>{role}</span>
    </div>
  );
});
// Giờ UserCard chỉ re-render khi name hoặc role THỰC SỰ thay đổi
```

### Custom Comparator -- kiểm soát khi nào re-render

```jsx
const HeavyChart = React.memo(
  function HeavyChart({ data, theme }) {
    // render biểu đồ phức tạp...
    return <canvas id="chart" />;
  },
  (prevProps, nextProps) => {
    // Return true = KHÔNG re-render, false = re-render
    // Chỉ re-render khi data thay đổi, bỏ qua theme
    return prevProps.data.id === nextProps.data.id
        && prevProps.data.updatedAt === nextProps.data.updatedAt;
  }
);
```

> **Lưu ý:** `React.memo` chỉ check **shallow**. Nếu truyền object/array mới mỗi render, memo vô dụng.

---

## 3. useMemo và useCallback -- Ổn Định Reference

### Vấn đề: Object/Function mới mỗi render phá vỡ React.memo

```jsx
// BAD -- style là object MỚI mỗi render => UserCard luôn re-render
function Parent() {
  const [count, setCount] = useState(0);

  const style = { color: "red", fontSize: 16 }; // object mới mỗi render
  const handleClick = () => console.log("clicked"); // function mới mỗi render

  return <UserCard name="Phong" style={style} onClick={handleClick} />;
}
```

### After -- useMemo cho values, useCallback cho functions

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // useMemo: giữ nguyên reference nếu dependencies không đổi
  const style = useMemo(() => ({ color: "red", fontSize: 16 }), []);

  // useCallback: giữ nguyên reference của function
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return <UserCard name="Phong" style={style} onClick={handleClick} />;
}
```

### Khi nào KHÔNG cần useMemo/useCallback

```jsx
// KHÔNG cần -- primitive props không cần memo
<UserCard name="Phong" age={25} />

// KHÔNG cần -- component đơn giản, re-render nhanh
function SimpleText({ text }) {
  return <span>{text}</span>;
}

// KHÔNG cần -- nếu child không được wrap React.memo
// useCallback ở parent vô nghĩa nếu child không dùng memo
```

---

## 4. React.lazy + Suspense -- Code Splitting

Thay vì load toàn bộ app một lần, **tách code theo route/component** để giảm bundle size ban đầu.

### Before -- import tất cả lên đầu

```jsx
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics"; // page nặng, ít dùng

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}
```

### After -- lazy load từng page

```jsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));

function LoadingFallback() {
  return <div className="spinner">Đang tải trang...</div>;
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### Lazy load component cụ thể (không chỉ route)

```jsx
const HeavyEditor = lazy(() => import("./components/HeavyEditor"));

function DocumentPage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Mở Editor</button>
      {showEditor && (
        <Suspense fallback={<p>Đang tải editor...</p>}>
          <HeavyEditor />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 5. Virtualization -- Render Danh Sách Dài Hiệu Quả

Khi có **hàng nghìn items**, không nên render tất cả vào DOM. Chỉ render những gì **đang nhìn thấy** trên viewport.

### Before -- render 10,000 items cùng lúc

```jsx
// DOM có 10,000 div => cực kỳ chậm, lag khi scroll
function ProductList({ products }) {
  return (
    <div className="list">
      {products.map(product => (
        <div key={product.id} className="product-item">
          <h4>{product.name}</h4>
          <p>{product.price.toLocaleString()}đ</p>
        </div>
      ))}
    </div>
  );
}
```

### After -- dùng react-window (virtualization)

```jsx
import { FixedSizeList as List } from "react-window";

function ProductList({ products }) {
  const Row = ({ index, style }) => {
    const product = products[index];
    return (
      <div style={style} className="product-item">
        <h4>{product.name}</h4>
        <p>{product.price.toLocaleString()}đ</p>
      </div>
    );
  };

  return (
    <List
      height={600}           // chiều cao container
      itemCount={products.length}
      itemSize={80}           // chiều cao mỗi item
      width="100%"
    >
      {Row}
    </List>
  );
}
// Chỉ render ~10-15 items visible, dù list có 10,000 items
```

### Dùng react-virtuoso cho dynamic height

```jsx
import { Virtuoso } from "react-virtuoso";

function ChatMessages({ messages }) {
  return (
    <Virtuoso
      data={messages}
      style={{ height: "500px" }}
      itemContent={(index, message) => (
        <div className="chat-bubble">
          <strong>{message.sender}:</strong>
          <p>{message.text}</p>
          {message.image && <img src={message.image} alt="" />}
        </div>
      )}
      followOutput="smooth" // auto-scroll khi có message mới
    />
  );
}
```

---

## 6. Key Optimization -- Tại Sao Key Quan Trọng

React dùng `key` để **identify** element nào đã thay đổi, thêm, hoặc xóa trong list. Key sai dẫn đến re-mount không cần thiết và bug state.

### BAD -- dùng index làm key

```jsx
// Khi xóa item đầu tiên, TẤT CẢ items bên dưới đều bị re-render
// vì index của chúng thay đổi => React tưởng là item mới
function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}> {/* BAD: key = index */}
          <input type="text" defaultValue={todo.text} />
          <button onClick={() => onDelete(todo.id)}>Xóa</button>
        </li>
      ))}
    </ul>
  );
}
```

### GOOD -- dùng unique stable ID

```jsx
// Khi xóa 1 item, chỉ item đó bị unmount, còn lại giữ nguyên
function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}> {/* GOOD: unique, stable ID */}
          <input type="text" defaultValue={todo.text} />
          <button onClick={() => onDelete(todo.id)}>Xóa</button>
        </li>
      ))}
    </ul>
  );
}
```

> **Khi nào dùng index được?** Chỉ khi list **tĩnh**, không bao giờ thêm/xóa/sắp xếp lại, và không có state bên trong item.

---

## 7. State Colocation -- Đặt State Đúng Chỗ

**Nguyên tắc:** Đặt state ở component **gần nhất** với nơi sử dụng nó. Đừng lift state lên quá cao gây re-render cả cây component.

### Before -- state ở quá cao, cả page re-render khi gõ search

```jsx
function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div>
      {/* Khi gõ search, Header và ProductGrid CŨNG re-render */}
      <Header cartCount={cartCount} />
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Tìm sản phẩm..."
      />
      <ProductGrid products={products} searchTerm={searchTerm} />
      <Footer />
    </div>
  );
}
```

### After -- tách SearchBar thành component riêng, co-locate state

```jsx
function ProductPage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div>
      <Header cartCount={cartCount} />
      {/* searchTerm state giờ nằm trong SearchableProductGrid */}
      <SearchableProductGrid products={products} />
      <Footer />
    </div>
  );
}

// State searchTerm co-located ở đây, chỉ component này re-render khi gõ
function SearchableProductGrid({ products }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(
    () => products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Tìm sản phẩm..."
      />
      <ProductGrid products={filtered} />
    </div>
  );
}
```

---

## 8. Debounce / Throttle Trong React

Khi user gõ search hoặc resize window, event fire liên tục. Dùng **debounce** (chờ ngừng gõ) hoặc **throttle** (giới hạn tần suất) để giảm số lần xử lý.

### Before -- gọi API mỗi keystroke

```jsx
function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // GỌI API MỖI LẦN GÕ 1 KÝ TỰ => quá nhiều request
  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    const data = await fetch(`/api/search?q=${value}`).then(r => r.json());
    setResults(data);
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <ResultList results={results} />
    </div>
  );
}
```

### After -- debounce API call

```jsx
import { useState, useEffect, useRef, useCallback } from "react";

// Custom hook: useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 400); // chờ 400ms sau khi ngừng gõ

  // Chỉ gọi API khi debouncedQuery thay đổi
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/search?q=${debouncedQuery}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setResults(data);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      <ResultList results={results} />
    </div>
  );
}
```

### Throttle -- giới hạn scroll handler

```jsx
function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]);
}

function InfiniteScrollList() {
  const handleScroll = useThrottle(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      loadMoreItems();
    }
  }, 200); // tối đa 5 lần/giây

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return <div>{/* render items */}</div>;
}
```

---

## 9. React DevTools Profiler -- Đo Lường Trước Khi Optimize

> "Premature optimization is the root of all evil." Luôn **đo trước**, optimize sau.

### Cách sử dụng Profiler

1. Cài **React Developer Tools** extension (Chrome/Firefox)
2. Mở tab **Profiler** trong DevTools
3. Nhấn **Record**, thao tác trên app, nhấn **Stop**
4. Phân tích kết quả:
   - **Flame Chart**: xem component nào render, mất bao lâu
   - **Ranked Chart**: sắp xếp component theo thời gian render
   - **Màu sắc**: xanh (nhanh) -> vàng -> đỏ (chậm)
   - Component **xám** = không re-render (tốt)

### Dùng Profiler component trong code

```jsx
import { Profiler } from "react";

function onRenderCallback(
  id,        // tên của Profiler
  phase,     // "mount" hoặc "update"
  actualDuration,   // thời gian render thực tế (ms)
  baseDuration,     // thời gian render nếu không memo (ms)
  startTime,
  commitTime
) {
  // Gửi metrics lên monitoring service
  if (actualDuration > 16) { // chậm hơn 1 frame (60fps)
    console.warn(`[Perf] ${id} ${phase}: ${actualDuration.toFixed(2)}ms`);
  }
}

function App() {
  return (
    <Profiler id="ProductList" onRender={onRenderCallback}>
      <ProductList products={products} />
    </Profiler>
  );
}
```

### Highlight re-renders trực quan

Trong React DevTools -> Settings -> **Highlight updates when components render**. Mỗi component re-render sẽ nhấp nháy viền, giúp phát hiện re-render thừa.

---

## 10. Checklist Performance Optimization

Dùng checklist này khi app bắt đầu chậm:

```
[ ] 1. ĐO TRƯỚC -- dùng Profiler xác định bottleneck thực sự
[ ] 2. STATE COLOCATION -- state có đang ở quá cao không?
[ ] 3. KEY ĐÚNG -- list có dùng stable unique key chưa?
[ ] 4. React.memo -- component nặng có được memo chưa?
[ ] 5. useMemo/useCallback -- object/function props có stable reference chưa?
[ ] 6. CODE SPLITTING -- route/component nặng đã lazy load chưa?
[ ] 7. VIRTUALIZATION -- list > 100 items đã virtualize chưa?
[ ] 8. DEBOUNCE -- input search, resize có debounce chưa?
[ ] 9. IMAGE -- ảnh đã lazy load và optimize size chưa?
[ ] 10. BUNDLE SIZE -- kiểm tra bằng webpack-bundle-analyzer
```

### Thứ tự ưu tiên

| Ưu tiên | Kỹ thuật                | Effort | Impact |
|---------|-------------------------|--------|--------|
| 1       | State colocation        | Thấp   | Cao    |
| 2       | Key đúng                | Thấp   | Cao    |
| 3       | Code splitting (lazy)   | Thấp   | Cao    |
| 4       | React.memo cho heavy UI | Trung bình | Cao |
| 5       | Virtualization          | Trung bình | Rất cao |
| 6       | Debounce/Throttle       | Thấp   | Trung bình |
| 7       | useMemo/useCallback     | Thấp   | Thấp-TB |

---

## 11. Bai Tap Thuc Hanh

### Bai tap 1: Toi uu hoa re-render

Cho component sau, hãy optimize để `ExpensiveList` không re-render khi nhấn nút "Toggle Theme".

```jsx
// File: Exercise1.jsx -- Tìm và sửa vấn đề performance
function App() {
  const [theme, setTheme] = useState("light");
  const [items, setItems] = useState(generateItems(1000));

  const listStyle = { background: theme === "light" ? "#fff" : "#333" };

  const handleItemClick = (id) => {
    console.log("Clicked item:", id);
  };

  return (
    <div>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
      <ExpensiveList
        items={items}
        style={listStyle}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

function ExpensiveList({ items, style, onItemClick }) {
  console.log("ExpensiveList rendered!");
  return (
    <ul style={style}>
      {items.map(item => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**Yêu cầu:**
- Wrap `ExpensiveList` bằng `React.memo`
- Ổn định `listStyle` bằng `useMemo`
- Ổn định `handleItemClick` bằng `useCallback`
- Verify bằng console.log rằng `ExpensiveList` không re-render khi toggle theme

---

### Bai tap 2: Debounce search + Virtualization

Xây dựng component `UserDirectory` hiển thị danh sách 5,000 users:

```jsx
// File: Exercise2.jsx -- Hoàn thành các TODO
function UserDirectory() {
  const [users] = useState(() => generateUsers(5000));
  const [search, setSearch] = useState("");

  // TODO 1: Dùng useDebounce hook để debounce search 300ms
  // const debouncedSearch = ???

  // TODO 2: Dùng useMemo để filter users theo debouncedSearch
  // const filteredUsers = ???

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Tìm user..."
      />
      <p>Tìm thấy: {/* filteredUsers.length */} users</p>

      {/* TODO 3: Dùng react-window FixedSizeList thay vì map() */}
      <div style={{ height: 500 }}>
        {/* Render filteredUsers ở đây */}
      </div>
    </div>
  );
}

function generateUsers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: ["Engineering", "Design", "Marketing", "Sales"][i % 4],
  }));
}
```

**Yêu cầu:**
- Implement `useDebounce` hook
- Dùng `useMemo` để filter theo `debouncedSearch`
- Dùng `FixedSizeList` từ `react-window` để virtualize kết quả
- Input vẫn responsive (không bị lag khi gõ)

---

### Bai tap 3: Code Splitting theo route

Refactor app sau để mỗi page được lazy load:

```jsx
// File: Exercise3.jsx
// BEFORE: tất cả import ở đầu file
import Home from "./pages/Home";
import Products from "./pages/Products";
import AdminDashboard from "./pages/AdminDashboard"; // rất nặng, ít user truy cập

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Yêu cầu:**
- Chuyển tất cả import sang `React.lazy()`
- Wrap routes trong `Suspense` với fallback component
- Đặc biệt `AdminDashboard` nên có error boundary riêng

---

> **Tóm tắt:** Performance optimization trong React không phải là "dùng React.memo ở mọi nơi". Quy trình đúng là: **Đo -> Xác định bottleneck -> Chọn kỹ thuật phù hợp -> Đo lại**. Hãy luôn bắt đầu bằng Profiler và chỉ optimize khi thực sự cần thiết.
