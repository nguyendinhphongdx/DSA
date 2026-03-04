# useContext - Context API

## 1. Vấn đề: Prop Drilling

Khi nhiều component lồng nhau cần cùng một data, phải **truyền props qua nhiều tầng** (dù tầng giữa không dùng).

```
App (theme="dark")
  └── Layout (theme="dark")         ← chỉ forward, không dùng
       └── Sidebar (theme="dark")   ← chỉ forward, không dùng
            └── Button (theme="dark") ← thực sự dùng

→ 3 tầng component trung gian phải nhận và truyền theme dù không cần!
```

**Context** giải quyết: truyền data **trực tiếp** đến bất kỳ component nào, bỏ qua tầng trung gian.

```
App [ThemeProvider value="dark"]
  └── Layout                        ← không cần biết theme
       └── Sidebar                  ← không cần biết theme
            └── Button              ← useContext(ThemeContext) → "dark"
```

---

## 2. Cách dùng: 3 bước

### Bước 1: Tạo Context

```jsx
import { createContext } from "react";

// Tạo context với giá trị mặc định
const ThemeContext = createContext("light");
```

### Bước 2: Provider (cung cấp giá trị)

```jsx
function App() {
  const [theme, setTheme] = useState("dark");

  return (
    // Wrap component tree bằng Provider
    <ThemeContext.Provider value={theme}>
      <Navbar />
      <MainContent />
      <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
        Toggle Theme
      </button>
    </ThemeContext.Provider>
  );
}
```

### Bước 3: Consumer (sử dụng giá trị)

```jsx
import { useContext } from "react";

function Button() {
  const theme = useContext(ThemeContext);

  return (
    <button className={`btn btn-${theme}`}>
      Current theme: {theme}
    </button>
  );
}

// Button có thể ở BẤT KỲ ĐÂU trong cây component
// miễn là nằm trong <ThemeContext.Provider>
```

---

## 3. Ví dụ thực tế: Theme + Auth Context

### Theme Context

```jsx
// contexts/ThemeContext.jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook (DX tốt hơn useContext trực tiếp)
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

```jsx
// App.jsx
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <MainContent />
    </ThemeProvider>
  );
}

// components/Navbar.jsx
import { useTheme } from "../contexts/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`navbar navbar-${theme}`}>
      <h1>My App</h1>
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </nav>
  );
}
```

### Auth Context

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

```jsx
// Sử dụng
function ProfilePage() {
  const { user, logout, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <p>Please login</p>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Combine multiple providers
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

---

## 4. Performance: Khi nào Context gây re-render?

**Khi Provider value thay đổi → TẤT CẢ consumer re-render** (dù chỉ dùng 1 phần value).

```jsx
// ❌ Tạo object mới mỗi render → tất cả consumer re-render
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
// Đổi theme → user consumers cũng re-render (dù user không đổi)!

// ✅ Tách thành 2 context riêng
<AuthProvider>      {/* chỉ re-render auth consumers */}
  <ThemeProvider>   {/* chỉ re-render theme consumers */}
    {children}
  </ThemeProvider>
</AuthProvider>

// ✅ Hoặc dùng useMemo cho value
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}
```

---

## 5. Khi nào dùng Context?

| Dùng Context | Dùng Props |
|-------------|-----------|
| Theme (dark/light) | 1-2 cấp component |
| Auth (user, login/logout) | Data chỉ 1 component cần |
| Language/i18n | Performance-critical updates |
| Global settings | Dữ liệu thay đổi rất nhanh |

> **Không dùng Context thay Redux/Zustand** cho complex state management. Context tốt cho **ít thay đổi, nhiều consumers** (theme, auth, locale).

---

## 6. Bài tập

1. Tạo `ThemeProvider` với dark/light mode, apply lên toàn bộ app
2. Tạo `AuthContext` với login/logout, protected routes
3. Tạo `LanguageContext` cho multi-language (vi/en) switch
4. Tạo `CartContext` cho shopping cart (add, remove, total)
