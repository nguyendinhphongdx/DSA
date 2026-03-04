# Testing trong React

## 1. Tổng quan

```
Các loại test:

Unit Test        → Test 1 function/component độc lập
Integration Test → Test nhiều components tương tác
E2E Test         → Test toàn bộ app như user thật

                    ┌─────────┐
                    │  E2E    │  Ít, chậm, đắt
                    ├─────────┤
                    │Integration│  Vừa phải
                    ├───────────┤
                    │  Unit      │  Nhiều, nhanh, rẻ
                    └────────────┘
                    Testing Pyramid

Tool stack phổ biến:
- Vitest (hoặc Jest) → Test runner
- React Testing Library (RTL) → Render & query components
- user-event → Simulate user interactions
- MSW → Mock API calls
```

### Cài đặt (Vite + Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
```

```js
// src/test/setup.js
import "@testing-library/jest-dom";
```

---

## 2. React Testing Library - Triết lý

```
"The more your tests resemble the way your software is used,
 the more confidence they can give you."

RTL test theo cách USER sử dụng app:
- Tìm element bằng text, role, label (không bằng class/id)
- Interact bằng click, type (không gọi hàm trực tiếp)
- Assert kết quả hiển thị (không check internal state)
```

### Queries ưu tiên

```
1. getByRole       → button, heading, textbox (BEST - accessible)
2. getByLabelText  → form inputs
3. getByPlaceholderText
4. getByText       → non-interactive elements
5. getByDisplayValue → input đã có value
6. getByTestId     → cuối cùng mới dùng (data-testid)
```

---

## 3. Test cơ bản

### Component đơn giản

```jsx
// Greeting.jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Greeting.test.jsx
import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
  it("renders greeting with name", () => {
    render(<Greeting name="Phong" />);

    // getByRole tìm heading
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Hello, Phong!");
  });

  it("renders with different name", () => {
    render(<Greeting name="Linh" />);

    expect(screen.getByText("Hello, Linh!")).toBeInTheDocument();
  });
});
```

### Component có state + interaction

```jsx
// Counter.jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Counter.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

describe("Counter", () => {
  it("starts at 0", () => {
    render(<Counter />);
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  it("increments when clicking +", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const incrementBtn = screen.getByRole("button", { name: "Increment" });
    await user.click(incrementBtn);

    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });

  it("decrements when clicking -", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Decrement" }));

    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  it("resets to 0", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });
});
```

---

## 4. Test Forms

```jsx
// LoginForm.jsx
function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Invalid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit">Login</button>
    </form>
  );
}

// LoginForm.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it("submits with valid data", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText("Email"), "test@email.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: "test@email.com",
      password: "123456",
    });
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText("Email"), "invalid");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("shows error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText("Email"), "test@email.com");
    await user.type(screen.getByLabelText("Password"), "123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("at least 6");
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

---

## 5. Test Async (API calls)

### Mock fetch

```jsx
// UserList.jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/users")
      .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// UserList.test.jsx
import { render, screen, waitFor } from "@testing-library/react";

describe("UserList", () => {
  it("renders users after fetch", async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]),
    });

    render(<UserList />);

    // Loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for users to appear
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    // Loading gone
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("renders error on fetch failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

### MSW (Mock Service Worker)

```bash
npm install -D msw
```

```js
// src/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),
];

// src/mocks/server.js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// src/test/setup.js
import { server } from "../mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```jsx
// Test với MSW - không cần mock fetch!
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

it("handles server error", async () => {
  // Override handler cho test cụ thể
  server.use(
    http.get("/api/users", () => {
      return HttpResponse.json({ error: "Server error" }, { status: 500 });
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});
```

---

## 6. Test với Context / Providers

```jsx
// Tạo render helper với providers
function renderWithProviders(ui, { theme = "light", user = null } = {}) {
  return render(
    <ThemeContext.Provider value={theme}>
      <AuthContext.Provider value={{ user }}>
        {ui}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

// Sử dụng
it("shows user name when logged in", () => {
  renderWithProviders(<UserGreeting />, {
    user: { name: "Phong" },
  });

  expect(screen.getByText("Hello, Phong")).toBeInTheDocument();
});

it("shows login button when logged out", () => {
  renderWithProviders(<UserGreeting />, { user: null });

  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});
```

---

## 7. findBy vs getBy vs queryBy

```jsx
// getBy: Tìm ngay, throw nếu KHÔNG có
screen.getByText("Hello");     // Throw nếu không tìm thấy
screen.getByRole("button");

// queryBy: Tìm ngay, return null nếu KHÔNG có
screen.queryByText("Hello");   // null nếu không có → assert NOT in document
expect(screen.queryByText("Error")).not.toBeInTheDocument();

// findBy: Tìm ASYNC (chờ đến khi xuất hiện)
await screen.findByText("Hello");  // Chờ element xuất hiện
// Timeout mặc định: 1000ms

// Tổng hợp:
// | | 0 matches | 1 match | >1 matches | Async? |
// |getBy| throw | return | throw | No |
// |queryBy| null | return | throw | No |
// |findBy| throw | return | throw | Yes |
// |getAllBy| throw | array | array | No |
// |queryAllBy| [] | array | array | No |
// |findAllBy| throw | array | array | Yes |
```

---

## 8. Testing Patterns

### Test accessibility

```jsx
it("has proper ARIA attributes", () => {
  render(<Modal isOpen={true} title="Confirm" />);

  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveAttribute("aria-labelledby");
  expect(dialog).toHaveAttribute("aria-modal", "true");
});
```

### Test custom hooks

```jsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("starts with initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("increments", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 9. Bài tập

1. Viết tests cho `Counter` component (increment, decrement, reset)
2. Viết tests cho `LoginForm` (validation, submit, error display)
3. Viết tests cho component fetch data (loading, success, error states)
4. Viết tests cho `TodoList` (add, remove, toggle, filter)
5. Setup MSW và viết integration tests cho CRUD operations
