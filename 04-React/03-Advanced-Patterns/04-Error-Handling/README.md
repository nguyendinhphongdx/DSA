# Error Handling trong React

## 1. Vấn đề

Mặc định, nếu **bất kỳ component nào throw error** khi render → **toàn bộ app crash**, hiển thị trang trắng.

```
Component Tree:
<App>
  <Header />
  <Main>
    <Sidebar />
    <Content>
      <UserProfile />  ← throw Error ở đây
    </Content>
  </Main>
  <Footer />
</App>

Kết quả: TOÀN BỘ APP biến mất! Trang trắng.
User không biết chuyện gì xảy ra.
```

**Giải pháp:** Error Boundaries - "bắt" error và hiển thị fallback UI thay vì crash app.

---

## 2. Error Boundaries (Class Component)

Error Boundary là **class component** sử dụng `getDerivedStateFromError` hoặc `componentDidCatch`. React **chưa hỗ trợ** Error Boundary dạng function component.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Gọi khi child throw error → cập nhật state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Gọi sau khi error → dùng để log error
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error);
    console.error("Component stack:", errorInfo.componentStack);
    // Gửi lên error reporting service (Sentry, LogRocket...)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: "#fee", borderRadius: 8 }}>
          <h2>Oops! Có lỗi xảy ra</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Sử dụng

```jsx
function App() {
  return (
    <div>
      <Header />  {/* Không bị ảnh hưởng nếu Content lỗi */}

      <ErrorBoundary>
        <Content />  {/* Nếu lỗi → hiện fallback, phần còn lại OK */}
      </ErrorBoundary>

      <Footer />  {/* Không bị ảnh hưởng */}
    </div>
  );
}
```

### Granular Error Boundaries

```jsx
function App() {
  return (
    <ErrorBoundary>  {/* Catch-all cho toàn app */}
      <Header />

      <main>
        <ErrorBoundary>  {/* Sidebar riêng */}
          <Sidebar />
        </ErrorBoundary>

        <ErrorBoundary>  {/* Content riêng */}
          <Content />
        </ErrorBoundary>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}

// Nếu Sidebar crash → chỉ Sidebar hiện fallback
// Content và Header/Footer vẫn hoạt động bình thường!
```

---

## 3. Reusable ErrorBoundary với fallback

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Cho phép custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.FallbackComponent) {
        const FallbackComponent = this.props.FallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return <p>Something went wrong.</p>;
    }

    return this.props.children;
  }
}

// Sử dụng với fallback đơn giản
<ErrorBoundary fallback={<p>Sidebar failed to load</p>}>
  <Sidebar />
</ErrorBoundary>

// Sử dụng với FallbackComponent
function ErrorFallback({ error, resetError }) {
  return (
    <div role="alert">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <UserProfile />
</ErrorBoundary>
```

---

## 4. react-error-boundary (Library)

Thay vì tự viết class component, dùng library `react-error-boundary`:

```bash
npm install react-error-boundary
```

```jsx
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

// Fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Sử dụng
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log error
        console.error(error, info);
      }}
      onReset={() => {
        // Reset app state khi user click "Try again"
      }}
    >
      <MyApp />
    </ErrorBoundary>
  );
}
```

### useErrorBoundary hook

```jsx
import { useErrorBoundary } from "react-error-boundary";

function UserProfile({ userId }) {
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    fetchUser(userId).catch(error => {
      // Throw error lên Error Boundary gần nhất
      showBoundary(error);
    });
  }, [userId, showBoundary]);

  // ...
}
```

---

## 5. Error Boundary KHÔNG bắt được gì?

```
Error Boundary BẮT ĐƯỢC:
✓ Error trong render
✓ Error trong lifecycle methods
✓ Error trong constructor

Error Boundary KHÔNG BẮT ĐƯỢC:
✗ Event handlers (onClick, onChange...)
✗ Async code (setTimeout, fetch, promises)
✗ Server-side rendering
✗ Error trong chính Error Boundary
```

### Xử lý Error trong Event Handlers

```jsx
function DeleteButton({ onDelete }) {
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      setError(null);
      await onDelete();
    } catch (err) {
      setError(err.message);
      // HOẶC dùng useErrorBoundary:
      // showBoundary(err);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Delete</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Xử lý Error trong Async Code

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    return () => controller.abort();
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={() => setError(null)} />;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

---

## 6. Patterns thực tế

### Pattern 1: Error state trong custom hook

```jsx
function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        if (err.name !== "AbortError") {
          setState({ data: null, loading: false, error: err });
        }
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// Component sạch sẽ
function UserList() {
  const { data, loading, error } = useFetch("/api/users");

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;
  return data.map(u => <p key={u.id}>{u.name}</p>);
}
```

### Pattern 2: Error Boundary + Suspense

```jsx
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<Spinner />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}

// ErrorBoundary bọc ngoài Suspense:
// - Suspense xử lý loading
// - ErrorBoundary xử lý error
// → Clean separation of concerns
```

### Pattern 3: Retry logic

```jsx
function useRetry(fn, maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        setRetryCount(i);
        return await fn(...args);
      } catch (err) {
        if (i === maxRetries) {
          setError(err);
          throw err;
        }
        // Exponential backoff
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }, [fn, maxRetries]);

  return { execute, retryCount, error };
}
```

---

## 7. Global Error Handling

```jsx
// Bắt unhandled errors ở cấp window
useEffect(() => {
  const handleError = (event) => {
    console.error("Unhandled error:", event.error);
    // Gửi lên error reporting service
  };

  const handleRejection = (event) => {
    console.error("Unhandled rejection:", event.reason);
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleRejection);
  };
}, []);
```

---

## 8. Tổng hợp

| Loại Error | Giải pháp |
|-----------|----------|
| Render errors | Error Boundary |
| Event handler | try/catch + error state |
| Async (fetch) | try/catch + error state hoặc `showBoundary()` |
| Global unhandled | `window.addEventListener("error")` |
| Form validation | Validation state + error messages |

### Best Practices

1. **Đặt Error Boundary ở nhiều cấp** - catch-all ở root + granular cho từng section
2. **Cung cấp recovery** - nút "Try again", không chỉ hiện lỗi
3. **Log errors** - gửi lên Sentry/LogRocket/DataDog để track
4. **User-friendly messages** - không hiện stack trace cho end user
5. **Graceful degradation** - phần bị lỗi hiện fallback, phần còn lại vẫn hoạt động

---

## 9. Bài tập

1. Tạo reusable `ErrorBoundary` class component với custom fallback UI
2. Implement `useFetch` hook với đầy đủ error handling + retry
3. Tạo app với Error Boundary ở 3 cấp: App > Section > Widget
4. Implement form validation với error messages cho từng field
5. Tạo `useAsync` hook: `{ execute, data, loading, error, reset }`
