# TypeScript with React

## 1. Tai sao dung TypeScript voi React?

JavaScript la ngon ngu dynamic typing -- ban co the gan bat ky gia tri nao vao bat ky bien nao ma khong bi loi tai thoi diem viet code. Dieu nay dan den hang loat bug chi xuat hien khi chay (runtime errors). TypeScript giai quyet van de nay bang cach them **static type checking** ngay tai thoi diem viet code.

Loi ich cu the khi dung TypeScript voi React:

- **Bat loi som**: Truyen sai props, thieu props bat buoc, sai kieu du lieu -- tat ca deu bi bat ngay trong editor
- **Autocompletion**: Editor goi y chinh xac props nao component can, state co nhung truong nao
- **Refactoring an toan**: Khi doi ten prop hoac thay doi kieu du lieu, TypeScript chi ra moi cho can sua
- **Documentation song**: Type definitions chinh la tai lieu mo ta component can gi, tra ve gi

```tsx
// Khong co TypeScript -- bug an trong code
function UserCard({ user }) {
  return <h1>{user.nama}</h1>; // Loi chinh ta "nama" thay vi "name" -- khong ai bao loi
}

// Co TypeScript -- loi duoc bat ngay lap tuc
interface User {
  name: string;
  email: string;
}

function UserCard({ user }: { user: User }) {
  return <h1>{user.nama}</h1>; // TS Error: Property 'nama' does not exist on type 'User'
}
```

---

## 2. Setup: Vite + React + TypeScript

Cach nhanh nhat de tao project React voi TypeScript la dung Vite:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

Cau truc thu muc sau khi tao:

```
my-app/
  src/
    App.tsx          # Component file dung .tsx (TypeScript + JSX)
    main.tsx         # Entry point
    vite-env.d.ts    # Type declarations cho Vite
  tsconfig.json      # Cau hinh TypeScript
  tsconfig.app.json  # Cau hinh rieng cho app code
  vite.config.ts     # Cau hinh Vite
```

Nhung cau hinh quan trong trong `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

> **Luu y**: File `.tsx` cho phep viet JSX trong TypeScript. File `.ts` thuong dung cho logic thuan (utils, hooks, types).

---

## 3. Props Typing

### 3.1 Interface vs Type

Ca hai deu dung de dinh nghia kieu cho props. Quy tac chung: **dung `interface` cho object shapes, dung `type` cho unions va mapped types**.

```tsx
// Cach 1: Interface -- co the extend va merge declarations
interface ButtonProps {
  label: string;
  variant: "primary" | "secondary";
}

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

// Cach 2: Type alias -- linh hoat hon voi unions
type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  label: string;
  variant: ButtonVariant;
};

// Intersection type (tuong tu extend)
type IconButtonProps = ButtonProps & {
  icon: React.ReactNode;
};
```

### 3.2 Optional Props va Default Values

```tsx
interface CardProps {
  title: string;
  subtitle?: string;          // Optional -- co the truyen hoac khong
  maxWidth?: number;
  bordered?: boolean;
}

function Card({ title, subtitle, maxWidth = 400, bordered = true }: CardProps) {
  return (
    <div style={{ maxWidth, border: bordered ? "1px solid #ccc" : "none" }}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// Su dung
<Card title="Hello" />                          // OK -- chi can truyen title
<Card title="Hello" subtitle="World" />          // OK
<Card title="Hello" maxWidth="wide" />           // TS Error: string khong phai number
```

### 3.3 Children Typing

```tsx
// Cach 1: Khai bao tuong minh
interface LayoutProps {
  children: React.ReactNode;   // Chap nhan moi thu: string, JSX, null, array...
}

function Layout({ children }: LayoutProps) {
  return <main className="layout">{children}</main>;
}

// Cach 2: PropsWithChildren utility type
import { PropsWithChildren } from "react";

interface SidebarProps {
  collapsed: boolean;
}

function Sidebar({ collapsed, children }: PropsWithChildren<SidebarProps>) {
  return <aside className={collapsed ? "narrow" : "wide"}>{children}</aside>;
}

// Cach 3: Render prop pattern -- children la function
interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean) => React.ReactNode;
}
```

---

## 4. useState voi TypeScript

### 4.1 Type Inference va Generic Type

```tsx
import { useState } from "react";

function Counter() {
  // TypeScript tu suy luan kieu tu gia tri khoi tao
  const [count, setCount] = useState(0);           // count: number
  const [name, setName] = useState("Phong");        // name: string
  const [active, setActive] = useState(false);       // active: boolean

  // Khi gia tri khoi tao la null hoac phuc tap -- can chi dinh generic type
  const [user, setUser] = useState<User | null>(null);

  // Array cua objects
  const [items, setItems] = useState<Product[]>([]);

  return <div>{count}</div>;
}
```

### 4.2 Union Types cho State

Union types rat huu dung khi state chi co mot so gia tri nhat dinh:

```tsx
type Status = "idle" | "loading" | "success" | "error";

interface FetchState<T> {
  status: Status;
  data: T | null;
  error: string | null;
}

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    status: "idle",
    data: null,
    error: null,
  });

  const fetchData = async () => {
    setState({ status: "loading", data: null, error: null });
    try {
      const res = await fetch(url);
      const data: T = await res.json();
      setState({ status: "success", data, error: null });
    } catch (err) {
      setState({ status: "error", data: null, error: (err as Error).message });
    }
  };

  return { ...state, fetchData };
}
```

---

## 5. useRef Typing

`useRef` can generic type de chi dinh element ma ref se tro toi.

```tsx
import { useRef, useEffect } from "react";

function SearchForm() {
  // Ref cho input element -- khoi tao null vi chua mount
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref cho div element
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref cho canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // TypeScript biet inputRef.current co the la null
    // Nen bat buoc phai check truoc khi dung
    inputRef.current?.focus();

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d"); // ctx: CanvasRenderingContext2D | null
    }
  }, []);

  // Ref luu gia tri thay doi duoc (khong phai DOM element)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => console.log("tick"), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div ref={containerRef}>
      <input ref={inputRef} type="text" placeholder="Search..." />
      <canvas ref={canvasRef} />
    </div>
  );
}
```

> **Meo**: Dung `ReturnType<typeof setTimeout>` thay vi `number` cho timer ID de dam bao tuong thich giua Node.js va browser.

---

## 6. useContext Typing

### 6.1 Tao Context voi Type an toan

```tsx
import { createContext, useContext, useState, type PropsWithChildren } from "react";

// Buoc 1: Dinh nghia type cho context value
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Buoc 2: Tao context -- dung null lam default, se check sau
const AuthContext = createContext<AuthContextType | null>(null);

// Buoc 3: Custom hook voi null check -- dam bao type safety
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phai duoc dung ben trong AuthProvider");
  }
  return context; // TypeScript biet day KHONG phai null
}

// Buoc 4: Provider component
function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data: User = await res.json();
    setUser(data);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Buoc 5: Su dung trong component
function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  // TypeScript biet chinh xac user co the la User | null
  // va logout la () => void
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Xin chao, {user?.name}</span>
          <button onClick={logout}>Dang xuat</button>
        </>
      ) : (
        <a href="/login">Dang nhap</a>
      )}
    </nav>
  );
}
```

---

## 7. useReducer Typing

### 7.1 Discriminated Unions cho Action Types

Day la pattern manh nhat cua TypeScript -- moi action co `type` rieng va payload tuong ung:

```tsx
import { useReducer } from "react";

// State type
interface TodoState {
  todos: Todo[];
  filter: "all" | "active" | "completed";
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Discriminated union -- moi action type co payload rieng biet
type TodoAction =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: number }
  | { type: "DELETE_TODO"; payload: number }
  | { type: "SET_FILTER"; payload: TodoState["filter"] }
  | { type: "CLEAR_COMPLETED" };

// Reducer -- TypeScript tu dong narrow type cua payload theo action.type
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "ADD_TODO":
      // action.payload o day la string -- TypeScript biet chac
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.payload, completed: false },
        ],
      };
    case "TOGGLE_TODO":
      // action.payload o day la number
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case "SET_FILTER":
      // action.payload o day la "all" | "active" | "completed"
      return { ...state, filter: action.payload };
    case "CLEAR_COMPLETED":
      // action nay KHONG co payload -- TypeScript se bao loi neu truy cap payload
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };
  }
}

// Su dung trong component
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: "all",
  });

  // TypeScript validate moi dispatch call
  dispatch({ type: "ADD_TODO", payload: "Hoc TypeScript" });          // OK
  dispatch({ type: "TOGGLE_TODO", payload: 1 });                      // OK
  dispatch({ type: "ADD_TODO", payload: 123 });                       // Error: number khong phai string
  dispatch({ type: "UNKNOWN_ACTION" });                                // Error: type khong ton tai

  return <div>{/* render todos */}</div>;
}
```

---

## 8. Event Types

React cung cap cac type rieng cho moi loai event. Dung dung type giup ban truy cap dung properties.

```tsx
function EventExamples() {
  // 1. Change event -- cho input, select, textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);     // string
    console.log(e.target.checked);   // boolean (cho checkbox)
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
  };

  // 2. Mouse event
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);   // Vi tri chuot
    e.preventDefault();
  };

  // 3. Form event -- cho form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
  };

  // 4. Keyboard event
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Enter pressed");
    }
  };

  // 5. Focus event
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log("Input mat focus:", e.target.value);
  };

  // 6. Drag event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <select onChange={handleSelectChange}>
        <option value="a">A</option>
      </select>
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

---

## 9. Component Typing Patterns

### 9.1 Function Declaration vs React.FC

```tsx
// Cach 1: Function declaration (KHUYEN DUNG)
// -- ro rang, don gian, khong co van de gi voi generics
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}</h1>;
}

// Cach 2: React.FC -- tu dong them children (truoc React 18), co the gay confuse
const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return <h1>Hello, {name}</h1>;
};
```

### 9.2 forwardRef voi TypeScript

```tsx
import { forwardRef } from "react";

interface InputProps {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...rest} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

// Su dung
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <Input ref={inputRef} label="Email" />;
}
```

### 9.3 Generic Components

Component co the nhan type parameter -- cuc ky huu dung cho data tables, lists, selects:

```tsx
// Generic list component -- hoat dong voi BAT KY kieu du lieu nao
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// TypeScript tu suy luan T tu items duoc truyen vao
<List
  items={[{ id: "1", name: "Phong" }, { id: "2", name: "Linh" }]}
  renderItem={(user) => <span>{user.name}</span>}    // user duoc suy luan la { id: string; name: string }
  keyExtractor={(user) => user.id}
/>
```

---

## 10. Utility Types Huu Ich

TypeScript cung cap nhieu utility types giup tai su dung va bien doi types:

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
  createdAt: Date;
}

// Partial<T> -- tat ca fields tro thanh optional
// Huu ich cho update forms khi chi can gui nhung field thay doi
type UpdateUserPayload = Partial<User>;
// Ket qua: { id?: string; name?: string; email?: string; ... }

// Pick<T, K> -- chi lay nhung fields can thiet
type UserPreview = Pick<User, "id" | "name" | "avatar">;
// Ket qua: { id: string; name: string; avatar: string }

// Omit<T, K> -- loai bo nhung fields khong can
type CreateUserPayload = Omit<User, "id" | "createdAt">;
// Ket qua: { name: string; email: string; avatar: string; role: "admin" | "user" }

// Record<K, V> -- tao object type voi keys va values cu the
type RolePermissions = Record<User["role"], string[]>;
// Ket qua: { admin: string[]; user: string[] }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read"],
};

// ComponentProps -- lay props type tu mot component co san
import { ComponentProps } from "react";

// Lay tat ca props ma <button> chap nhan
type ButtonProps = ComponentProps<"button">;

// Lay props cua custom component va mo rong them
type ExtendedInputProps = ComponentProps<typeof Input> & {
  helpText?: string;
};

// Ket hop nhieu utility types
type UserFormData = Omit<Partial<User>, "id" | "createdAt"> & {
  confirmPassword: string;
};
```

---

## 11. Common Patterns

### 11.1 API Response Typing

```tsx
// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dinh nghia response types cho tung endpoint
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Typed fetch function
async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json() as Promise<ApiResponse<T>>;
}

// Su dung -- TypeScript biet chinh xac kieu tra ve
async function getProducts() {
  const response = await fetchApi<PaginatedResponse<Product>>("/api/products");
  // response.data.data la Product[]
  // response.data.total la number
  response.data.data.forEach((product) => {
    console.log(product.name, product.price); // Autocompletion day du
  });
}
```

### 11.2 Form Typing Pattern

```tsx
import { useState, type FormEvent, type ChangeEvent } from "react";

// Dinh nghia shape cua form data
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Dinh nghia errors -- moi field co the co hoac khong co loi
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Generic handler -- hoat dong cho moi input field
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xoa loi khi user bat dau go lai
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Ten la bat buoc";
    if (!formData.email.includes("@")) newErrors.email = "Email khong hop le";
    if (!formData.message.trim()) newErrors.message = "Noi dung la bat buoc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      {errors.name && <span>{errors.name}</span>}

      <input name="email" value={formData.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}

      <textarea name="message" value={formData.message} onChange={handleChange} />
      {errors.message && <span>{errors.message}</span>}

      <button type="submit">Gui</button>
    </form>
  );
}
```

---

## 12. Bai Tap

### Bai 1: Typed Component Library

Tao mot `Button` component voi day du type safety:

```tsx
// Yeu cau:
// - variant: "primary" | "secondary" | "danger" (bat buoc)
// - size: "sm" | "md" | "lg" (mac dinh "md")
// - loading: boolean (optional, khi true thi disable button)
// - Nhan tat ca props goc cua <button> (onClick, disabled, type, ...)
// - Khi loading=true, hien thi "Dang xu ly..." thay vi children

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

// Viet implementation o day
```

### Bai 2: Generic Data Table

Tao component `DataTable<T>` hien thi du lieu dang bang:

```tsx
// Yeu cau:
// - Nhan generic type T
// - columns: mang cac { key: keyof T, header: string }
// - data: T[]
// - onRowClick: (item: T) => void (optional)
// - TypeScript phai dam bao column keys chi co the la keys thuc su cua T

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

// Viet implementation o day
```

### Bai 3: Typed useReducer cho Shopping Cart

```tsx
// Yeu cau:
// - CartItem: { id, name, price, quantity }
// - Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART
// - Dung discriminated unions cho action types
// - State bao gom: items, totalPrice (tinh tu dong)
// - Viet reducer voi day du type safety

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

// Viet cartReducer va useCart hook o day
```

### Bai 4: Type-Safe Form Hook

```tsx
// Yeu cau:
// - Tao custom hook useForm<T> nhan generic type
// - Tra ve: values, errors, handleChange, handleSubmit, resetForm
// - errors phai map dung voi keys cua T
// - handleChange phai hoat dong voi input, select, textarea
// - validate function nhan vao values va tra ve errors

// Viet implementation o day
function useForm<T extends Record<string, unknown>>(config: {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}) {
  // ...
}
```

> **Goi y cho cac bai tap**: Bat dau bang viec dinh nghia types truoc, sau do moi viet logic. Khi TypeScript khong bao loi nao, ban co the tu tin rang code cua ban dung ve mat kieu du lieu.
