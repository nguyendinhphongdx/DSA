# React Router

## 1. Khái niệm

React Router là thư viện **routing** phổ biến nhất cho React. Nó cho phép **navigation** giữa các "trang" mà **không reload** trình duyệt (SPA - Single Page Application).

```
URL thay đổi → React Router match route → Render component tương ứng

/              → <HomePage />
/about         → <AboutPage />
/users         → <UserList />
/users/123     → <UserDetail id={123} />
/users/123/posts → <UserPosts id={123} />
```

### Cài đặt

```bash
npm install react-router-dom
```

---

## 2. Setup cơ bản

### BrowserRouter + Routes + Route

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />  {/* 404 */}
      </Routes>
    </BrowserRouter>
  );
}

function Home() { return <h1>Trang chủ</h1>; }
function About() { return <h1>Giới thiệu</h1>; }
function Contact() { return <h1>Liên hệ</h1>; }
function NotFound() { return <h1>404 - Không tìm thấy</h1>; }
```

### Navigation với Link và NavLink

```jsx
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      {/* Link: chuyển trang không reload */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>

      {/* NavLink: tự thêm class "active" khi route match */}
      <NavLink
        to="/about"
        className={({ isActive }) => isActive ? "nav-active" : ""}
      >
        About
      </NavLink>

      {/* Style inline */}
      <NavLink
        to="/contact"
        style={({ isActive }) => ({
          fontWeight: isActive ? "bold" : "normal",
          color: isActive ? "red" : "black",
        })}
      >
        Contact
      </NavLink>
    </nav>
  );
}
```

---

## 3. Dynamic Routes (URL Params)

```jsx
import { useParams } from "react-router-dom";

// Route definition
<Route path="/users/:userId" element={<UserDetail />} />
<Route path="/posts/:postId/comments/:commentId" element={<Comment />} />

// Component
function UserDetail() {
  const { userId } = useParams(); // { userId: "123" } (luôn là string!)

  return <h1>User ID: {userId}</h1>;
}

function Comment() {
  const { postId, commentId } = useParams();
  return <p>Post {postId} - Comment {commentId}</p>;
}
```

### Ví dụ: Fetch data theo param

```jsx
function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]); // Re-fetch khi userId thay đổi

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## 4. Nested Routes

```jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Nested routes render trong <Outlet /> của Layout */}
          <Route index element={<Home />} />          {/* / */}
          <Route path="about" element={<About />} />  {/* /about */}

          <Route path="users" element={<UsersLayout />}>
            <Route index element={<UserList />} />     {/* /users */}
            <Route path=":id" element={<UserDetail />} /> {/* /users/123 */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Layout với Outlet

```jsx
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <Navbar />               {/* Luôn hiển thị */}
      <main>
        <Outlet />             {/* Nội dung thay đổi theo route */}
      </main>
      <Footer />               {/* Luôn hiển thị */}
    </div>
  );
}

function UsersLayout() {
  return (
    <div>
      <h1>Users Section</h1>
      <Outlet />               {/* UserList hoặc UserDetail */}
    </div>
  );
}
```

```
URL: /users/123

Render tree:
<Layout>
  <Navbar />
  <main>
    <UsersLayout>
      <h1>Users Section</h1>
      <UserDetail />           ← Outlet renders này
    </UsersLayout>
  </main>
  <Footer />
</Layout>
```

---

## 5. Programmatic Navigation

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);

    if (success) {
      navigate("/dashboard");          // Chuyển trang
      // navigate("/dashboard", { replace: true }); // Thay thế history (không back được)
      // navigate(-1);                  // Quay lại trang trước (like browser back)
      // navigate(-2);                  // Quay lại 2 trang
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Navigate component (redirect)

```jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Sử dụng
<Route
  path="/dashboard"
  element={
    <ProtectedRoute isAuthenticated={isLoggedIn}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 6. Search Params (Query String)

```jsx
import { useSearchParams } from "react-router-dom";

// URL: /products?category=shoes&sort=price&page=2
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params
  const category = searchParams.get("category");   // "shoes"
  const sort = searchParams.get("sort");             // "price"
  const page = Number(searchParams.get("page")) || 1; // 2

  // Cập nhật params
  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat, sort, page: 1 }); // Reset page khi đổi category
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set("page", newPage);
      return prev;
    });
  };

  return (
    <div>
      <select
        value={category || ""}
        onChange={e => handleCategoryChange(e.target.value)}
      >
        <option value="">All</option>
        <option value="shoes">Shoes</option>
        <option value="clothes">Clothes</option>
      </select>

      <p>Sort: {sort} | Page: {page}</p>

      <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <button onClick={() => handlePageChange(page + 1)}>Next</button>
    </div>
  );
}
```

---

## 7. useLocation

```jsx
import { useLocation } from "react-router-dom";

// URL: /products?category=shoes#reviews
function CurrentPage() {
  const location = useLocation();

  console.log(location);
  // {
  //   pathname: "/products",
  //   search: "?category=shoes",
  //   hash: "#reviews",
  //   state: { from: "/home" },   ← state truyền qua navigate
  //   key: "abc123"
  // }

  return <p>Current path: {location.pathname}</p>;
}

// Truyền state qua navigation
<Link to="/checkout" state={{ cartItems: items }}>Checkout</Link>

// Hoặc
navigate("/checkout", { state: { cartItems: items } });

// Nhận state
function Checkout() {
  const location = useLocation();
  const { cartItems } = location.state || {};
  // ...
}
```

---

## 8. Protected Routes Pattern

```jsx
// auth-context.jsx
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const userData = await api.login(credentials);
    setUser(userData);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ProtectedRoute.jsx
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login, lưu location để redirect lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// App.jsx - Sử dụng
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Login.jsx - Redirect lại sau khi login
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
    navigate(from, { replace: true }); // Quay lại trang trước
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 9. Lazy Loading Routes

```jsx
import { lazy, Suspense } from "react";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Kết quả: mỗi trang chỉ load JS khi user navigate đến
// Bundle splitting tự động!
```

---

## 10. Data Loading với loader (React Router v6.4+)

```jsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";

// Định nghĩa router với loader
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "users",
        element: <UserList />,
        loader: async () => {
          const res = await fetch("/api/users");
          if (!res.ok) throw new Response("Failed", { status: res.status });
          return res.json();
        },
      },
      {
        path: "users/:id",
        element: <UserDetail />,
        loader: async ({ params }) => {
          const res = await fetch(`/api/users/${params.id}`);
          if (!res.ok) throw new Response("Not found", { status: 404 });
          return res.json();
        },
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

// Component sử dụng loader data
function UserList() {
  const users = useLoaderData(); // Data từ loader, đã fetch xong!

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### Action (Form submissions)

```jsx
import { Form, useActionData } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/contact",
    element: <ContactForm />,
    action: async ({ request }) => {
      const formData = await request.formData();
      const data = Object.fromEntries(formData);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) return { error: "Failed to send" };
      return { success: true };
    },
  },
]);

function ContactForm() {
  const actionData = useActionData();

  return (
    <Form method="post">
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>

      {actionData?.error && <p className="error">{actionData.error}</p>}
      {actionData?.success && <p className="success">Sent!</p>}
    </Form>
  );
}
```

---

## 11. Hooks tổng hợp

| Hook | Mục đích | Ví dụ |
|------|---------|-------|
| `useParams()` | Lấy URL params | `/users/:id` → `{ id: "123" }` |
| `useSearchParams()` | Đọc/ghi query string | `?page=2&sort=name` |
| `useNavigate()` | Chuyển trang programmatic | `navigate("/home")` |
| `useLocation()` | Lấy thông tin URL hiện tại | `{ pathname, search, hash, state }` |
| `useLoaderData()` | Lấy data từ route loader | Data fetched trước khi render |
| `useActionData()` | Lấy kết quả từ route action | Form submission result |
| `useRouteError()` | Lấy error trong errorElement | Error boundary cho routes |
| `useOutletContext()` | Share data giữa parent-child routes | Layout → Child communication |

---

## 12. Bài tập

1. Tạo app với 3 trang (Home, About, Contact) + Navbar với active state
2. Tạo blog app: `/posts` (list) → `/posts/:id` (detail) với fake data
3. Implement Protected Routes: Login page → Dashboard (chỉ khi đã login)
4. Tạo product listing với search params: filter by category, sort, pagination
5. Nested routes: `/settings/profile`, `/settings/security`, `/settings/notifications`
