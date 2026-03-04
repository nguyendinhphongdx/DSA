# Custom Hooks

## 1. Khái niệm

Custom Hook là **function bắt đầu bằng `use`** cho phép **tái sử dụng logic** giữa các components. Nó extract stateful logic ra khỏi component.

```
TRƯỚC: Logic trùng lặp trong mỗi component
Component A: useState + useEffect (fetch data)
Component B: useState + useEffect (fetch data)  ← copy-paste!
Component C: useState + useEffect (fetch data)  ← copy-paste!

SAU: Extract thành custom hook
useFetch() → { data, loading, error }
Component A: useFetch("/api/users")
Component B: useFetch("/api/posts")
Component C: useFetch("/api/comments")
```

---

## 2. Quy tắc

1. Tên **bắt buộc** bắt đầu bằng `use` (useXxx)
2. Có thể gọi hooks khác bên trong (useState, useEffect, ...)
3. Mỗi component gọi hook sẽ có **state riêng** (không share state)

---

## 3. Ví dụ: các Custom Hooks phổ biến

### 3.1 useToggle

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Sử dụng
function Modal() {
  const { value: isOpen, toggle, setFalse: close } = useToggle();

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal content</p>
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
```

### 3.2 useFetch

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // cleanup cho race condition

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort(); // cleanup
  }, [url]);

  return { data, loading, error };
}

// Sử dụng - cực kỳ sạch!
function UserList() {
  const { data: users, loading, error } = useFetch("/api/users");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### 3.3 useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// Sử dụng
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);

  return (
    <div>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
        Theme: {theme}
      </button>
      <input
        type="range" min="12" max="24"
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

### 3.4 useDebounce

```jsx
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng: Search API chỉ gọi sau khi user ngừng gõ 300ms
function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data } = useFetch(
    debouncedQuery ? `/api/search?q=${debouncedQuery}` : null
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {data && data.map(item => <p key={item.id}>{item.title}</p>)}
    </div>
  );
}
```

### 3.5 useWindowSize

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Sử dụng
function ResponsiveLayout() {
  const { width } = useWindowSize();

  return width < 768 ? <MobileLayout /> : <DesktopLayout />;
}
```

### 3.6 useForm

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();

    // Mark tất cả fields là touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched);

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    onSubmit(values);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, reset };
}

// Sử dụng
function LoginForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: "", password: "" },
    (values) => {
      const errors = {};
      if (!values.email.includes("@")) errors.email = "Invalid email";
      if (values.password.length < 6) errors.password = "Min 6 characters";
      return errors;
    }
  );

  return (
    <form onSubmit={handleSubmit((data) => console.log("Submit:", data))}>
      <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input name="password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 4. Best Practices

1. **Đặt tên rõ ràng:** `useAuth`, `useFetch`, `useLocalStorage`
2. **Return object hoặc array:** Object khi nhiều giá trị, array khi giống useState
3. **Handle cleanup:** Luôn cleanup listeners, timers, abort controllers
4. **Không quá phức tạp:** 1 hook = 1 concern. Nếu quá lớn → tách thành nhiều hooks

---

## 5. Bài tập

1. Tạo `useClickOutside(ref, callback)` - gọi callback khi click ngoài element
2. Tạo `usePrevious(value)` - lưu giá trị trước đó
3. Tạo `useMediaQuery(query)` - return boolean cho responsive
4. Tạo `useAsync(asyncFn)` - quản lý async state (loading, data, error, execute)
