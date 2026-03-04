# React Component Patterns

## 1. Tong quan ve cac Component Patterns

Trong qua trinh phat trien ung dung React, viec to chuc va tai su dung code la mot thach thuc lon. **Component Patterns** la nhung mo hinh thiet ke da duoc chung minh hieu qua, giup chung ta:

- **Tai su dung logic** giua cac component khac nhau
- **Tach biet concerns** (logic vs. giao dien)
- **Tang tinh linh hoat** va kha nang mo rong cua component
- **Giam code trung lap** (DRY principle)

Bai hoc nay se di sau vao **6 patterns chinh** ma moi React developer can nam vung, tu classic patterns nhu HOC va Render Props den modern patterns nhu Compound Components va Custom Hooks.

---

## 2. Higher-Order Components (HOC)

**HOC** la mot function nhan vao mot component va tra ve mot component moi voi cac tinh nang duoc bo sung. Day la pattern lay cam hung tu **higher-order functions** trong functional programming.

**Cong thuc:** `const EnhancedComponent = higherOrderComponent(WrappedComponent)`

### 2.1. withAuth - Bao ve route can xac thuc

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// HOC: Kiem tra user da dang nhap chua truoc khi render component
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const token = localStorage.getItem('auth_token');
    const isAuthenticated = Boolean(token);

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Truyen tat ca props xuong cho component goc
    return <WrappedComponent {...props} />;
  };
}

// Su dung:
function Dashboard({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Xin chao, {user.name}!</p>
    </div>
  );
}

function AdminPanel() {
  return <h1>Admin Panel - Chi danh cho admin</h1>;
}

// Boc component bang HOC
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedAdminPanel = withAuth(AdminPanel);

// Trong App:
function App() {
  return (
    <div>
      <ProtectedDashboard user={{ name: 'Phong' }} />
      <ProtectedAdminPanel />
    </div>
  );
}
```

### 2.2. withLoading - Tu dong hien thi loading state

```jsx
import React, { useState, useEffect } from 'react';

// HOC: Tu dong fetch data va hien thi loading spinner
function withLoading(WrappedComponent, fetchFunction) {
  return function LoadingComponent(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;

      async function loadData() {
        try {
          setLoading(true);
          const result = await fetchFunction(props);
          if (!cancelled) {
            setData(result);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err.message);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      loadData();
      return () => { cancelled = true; };
    }, []);

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p>Dang tai du lieu...</p>
        </div>
      );
    }

    if (error) {
      return <div style={{ color: 'red' }}>Loi: {error}</div>;
    }

    return <WrappedComponent {...props} data={data} />;
  };
}

// Component thuong - chi lo viec hien thi
function UserList({ data }) {
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}

// Tao phien ban co loading tu dong
const fetchUsers = () =>
  fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json());

const UserListWithLoading = withLoading(UserList, fetchUsers);

// Su dung don gian:
function App() {
  return <UserListWithLoading />;
}
```

**Luu y quan trong ve HOC:**
- Dat ten bat dau bang `with` (quy uoc chung)
- Luon truyen `...props` xuong cho WrappedComponent
- Khong thay doi component goc (immutability)
- HOC co the "chong" (compose) nhieu lop: `withAuth(withLoading(Component))`

---

## 3. Render Props Pattern

**Render Props** la pattern trong do mot component nhan vao mot **function lam prop** va goi function do de render giao dien. Component chia se logic thong qua function nay thay vi thong qua inheritance.

### 3.1. Mouse Tracker - Theo doi vi tri chuot

```jsx
import React, { useState, useEffect } from 'react';

// Component chia se logic theo doi chuot qua render prop
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(event) {
      setPosition({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Goi function "render" va truyen du lieu vi tri chuot vao
  return render(position);
}

// Su dung voi cac giao dien khac nhau:
function App() {
  return (
    <div>
      {/* Giao dien 1: Hien thi toa do don gian */}
      <MouseTracker
        render={({ x, y }) => (
          <p>Vi tri chuot: ({x}, {y})</p>
        )}
      />

      {/* Giao dien 2: Hinh tron di theo chuot */}
      <MouseTracker
        render={({ x, y }) => (
          <div
            style={{
              position: 'fixed',
              left: x - 15,
              top: y - 15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 120, 255, 0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      />

      {/* Giao dien 3: Hien thi hinh anh tai vi tri chuot */}
      <MouseTracker
        render={({ x, y }) => (
          <img
            src="/cat.png"
            alt="cat"
            style={{ position: 'fixed', left: x, top: y, width: 50 }}
          />
        )}
      />
    </div>
  );
}
```

### 3.2. Data Fetcher - Tai du lieu linh hoat

```jsx
import React, { useState, useEffect } from 'react';

// Component tai du lieu va chia se ket qua qua render prop
function DataFetcher({ url, children }) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => { cancelled = true; };
  }, [url]);

  // Su dung children nhu mot function (children-as-a-function pattern)
  return children(state);
}

// Su dung:
function App() {
  return (
    <div>
      <h2>Danh sach Users</h2>
      <DataFetcher url="https://jsonplaceholder.typicode.com/users">
        {({ data, loading, error }) => {
          if (loading) return <p>Dang tai...</p>;
          if (error) return <p style={{ color: 'red' }}>{error.message}</p>;
          return (
            <ul>
              {data.map(user => (
                <li key={user.id}>
                  <strong>{user.name}</strong> - {user.email}
                </li>
              ))}
            </ul>
          );
        }}
      </DataFetcher>

      <h2>Danh sach Posts</h2>
      <DataFetcher url="https://jsonplaceholder.typicode.com/posts?_limit=5">
        {({ data, loading, error }) => {
          if (loading) return <p>Dang tai...</p>;
          if (error) return <p style={{ color: 'red' }}>{error.message}</p>;
          return (
            <div>
              {data.map(post => (
                <article key={post.id} style={{ marginBottom: '1rem' }}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </article>
              ))}
            </div>
          );
        }}
      </DataFetcher>
    </div>
  );
}
```

---

## 4. Compound Components Pattern

**Compound Components** la nhom cac component hoat dong cung nhau de tao nen mot chuc nang hoan chinh. Chung chia se state noi bo thong qua **React Context** ma khong can truyen props thu cong qua tung cap.

Tuong tu nhu the HTML `<select>` va `<option>` - chung chi co y nghia khi dung cung nhau.

### 4.1. Tabs Component

```jsx
import React, { createContext, useContext, useState } from 'react';

// Tao Context de chia se state giua cac compound components
const TabsContext = createContext();

// Component cha: quan ly state tab nao dang active
function Tabs({ defaultIndex = 0, children }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// Component con: danh sach cac tab header
function TabList({ children }) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #ddd' }}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, { index })
      )}
    </div>
  );
}

// Component con: tung tab button
function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const isActive = index === activeIndex;

  return (
    <button
      onClick={() => setActiveIndex(index)}
      style={{
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderBottom: isActive ? '3px solid #0070f3' : '3px solid transparent',
        backgroundColor: isActive ? '#f0f7ff' : 'transparent',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// Component con: noi dung cua tung tab
function TabPanels({ children }) {
  const { activeIndex } = useContext(TabsContext);
  return <div style={{ padding: '1rem' }}>{children[activeIndex]}</div>;
}

function TabPanel({ children }) {
  return <div>{children}</div>;
}

// Gan cac sub-component vao component chinh
Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanels = TabPanels;
Tabs.TabPanel = TabPanel;

// Su dung - API rat sach se va de doc:
function App() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.TabList>
        <Tabs.Tab>Gioi thieu</Tabs.Tab>
        <Tabs.Tab>Tinh nang</Tabs.Tab>
        <Tabs.Tab>Bang gia</Tabs.Tab>
      </Tabs.TabList>
      <Tabs.TabPanels>
        <Tabs.TabPanel>
          <h3>Chao mung den voi san pham</h3>
          <p>Day la phan gioi thieu tong quan...</p>
        </Tabs.TabPanel>
        <Tabs.TabPanel>
          <h3>Cac tinh nang noi bat</h3>
          <ul>
            <li>Tinh nang A</li>
            <li>Tinh nang B</li>
          </ul>
        </Tabs.TabPanel>
        <Tabs.TabPanel>
          <h3>Bang gia</h3>
          <p>Mien phi cho ca nhan, tra phi cho doanh nghiep.</p>
        </Tabs.TabPanel>
      </Tabs.TabPanels>
    </Tabs>
  );
}
```

### 4.2. Accordion Component

```jsx
import React, { createContext, useContext, useState } from 'react';

const AccordionContext = createContext();
const AccordionItemContext = createContext();

function Accordion({ allowMultiple = false, children }) {
  const [openItems, setOpenItems] = useState(new Set());

  function toggle(id) {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div style={{ border: '1px solid #ddd', borderRadius: 8 }}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, children }) {
  return (
    <AccordionItemContext.Provider value={{ id }}>
      <div style={{ borderBottom: '1px solid #eee' }}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

function AccordionHeader({ children }) {
  const { openItems, toggle } = useContext(AccordionContext);
  const { id } = useContext(AccordionItemContext);
  const isOpen = openItems.has(id);

  return (
    <button
      onClick={() => toggle(id)}
      style={{
        width: '100%',
        padding: '1rem',
        textAlign: 'left',
        border: 'none',
        backgroundColor: isOpen ? '#f5f5f5' : 'white',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {children}
      <span>{isOpen ? '−' : '+'}</span>
    </button>
  );
}

function AccordionPanel({ children }) {
  const { openItems } = useContext(AccordionContext);
  const { id } = useContext(AccordionItemContext);

  if (!openItems.has(id)) return null;

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      {children}
    </div>
  );
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

// Su dung:
function FAQ() {
  return (
    <Accordion allowMultiple={false}>
      <Accordion.Item id="q1">
        <Accordion.Header>React la gi?</Accordion.Header>
        <Accordion.Panel>
          React la mot thu vien JavaScript de xay dung giao dien nguoi dung,
          duoc phat trien boi Meta (Facebook).
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="q2">
        <Accordion.Header>Tai sao nen dung React?</Accordion.Header>
        <Accordion.Panel>
          React co hieu suat cao nho Virtual DOM, he sinh thai phong phu,
          va cong dong lon manh.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="q3">
        <Accordion.Header>Hook la gi?</Accordion.Header>
        <Accordion.Panel>
          Hook la cac function dac biet cho phep ban su dung state va cac
          tinh nang khac cua React trong function component.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
```

---

## 5. Controlled vs Uncontrolled Components

Day la hai cach tiep can khac nhau de quan ly du lieu form trong React.

### Controlled Component - React kiem soat hoan toan state

```jsx
import React, { useState } from 'react';

function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Moi thay doi deu di qua React state
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate ngay khi nguoi dung nhap
    if (name === 'email' && value && !value.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Email khong hop le' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Du lieu gui di:', formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
      </div>
      <div>
        <label>Password:</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Dang ky</button>

      {/* De dang hien thi preview vi ta co state */}
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
        <h4>Preview:</h4>
        <p>Username: {formData.username}</p>
        <p>Email: {formData.email}</p>
      </div>
    </form>
  );
}
```

### Uncontrolled Component - DOM tu quan ly state

```jsx
import React, { useRef } from 'react';

function UncontrolledForm() {
  // Dung ref de truy cap truc tiep vao DOM element
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const fileRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    // Doc gia tri truc tiep tu DOM tai thoi diem submit
    const data = {
      username: usernameRef.current.value,
      email: emailRef.current.value,
      file: fileRef.current.files[0],
    };
    console.log('Du lieu gui di:', data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        {/* defaultValue thay vi value - DOM tu quan ly */}
        <input ref={usernameRef} defaultValue="guest" />
      </div>
      <div>
        <label>Email:</label>
        <input ref={emailRef} type="email" />
      </div>
      <div>
        <label>Avatar:</label>
        {/* File input LUON la uncontrolled trong React */}
        <input ref={fileRef} type="file" accept="image/*" />
      </div>
      <button type="submit">Gui</button>
    </form>
  );
}
```

**Khi nao dung loai nao?**

| Tinh nang | Controlled | Uncontrolled |
|-----------|-----------|-------------|
| Validate ngay khi nhap | Co | Kho |
| Disable nut submit co dieu kien | Co | Kho |
| Format input (vd: so dien thoai) | Co | Kho |
| Nhieu input dung chung data | Co | Kho |
| File input | Khong | Bat buoc |
| Form don gian, it logic | Qua muc can thiet | Phu hop |

---

## 6. Container/Presentational Pattern

Pattern nay **tach biet ro rang** giua component xu ly logic (Container) va component chi hien thi giao dien (Presentational).

```jsx
import React, { useState, useEffect } from 'react';

// === PRESENTATIONAL COMPONENT ===
// Chi nhan props va render giao dien. Khong biet data den tu dau.
function ProductList({ products, loading, error, onAddToCart }) {
  if (loading) {
    return <p>Dang tai san pham...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Loi: {error}</p>;
  }

  if (products.length === 0) {
    return <p>Khong co san pham nao.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {products.map(product => (
        <div
          key={product.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '1rem',
          }}
        >
          <h3>{product.name}</h3>
          <p style={{ color: '#666' }}>{product.description}</p>
          <p style={{ fontWeight: 'bold', color: '#0070f3' }}>
            {product.price.toLocaleString('vi-VN')} VND
          </p>
          <button onClick={() => onAddToCart(product.id)}>
            Them vao gio hang
          </button>
        </div>
      ))}
    </div>
  );
}

// === CONTAINER COMPONENT ===
// Xu ly tat ca logic: fetch data, quan ly state, xu ly events
function ProductListContainer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Khong the tai san pham');
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleAddToCart(productId) {
    console.log('Them san pham vao gio:', productId);
    // Goi API them vao gio hang...
  }

  // Container chi truyen du lieu xuong, khong render giao dien phuc tap
  return (
    <ProductList
      products={products}
      loading={loading}
      error={error}
      onAddToCart={handleAddToCart}
    />
  );
}
```

**Loi ich chinh:**
- `ProductList` co the tai su dung o bat ky dau voi bat ky nguon data nao
- De viet **unit test** cho Presentational component (chi can truyen props)
- De thay doi giao dien ma khong anh huong logic va nguoc lai

---

## 7. So sanh: Khi nao dung pattern nao?

| Pattern | Truong hop su dung | Uu diem | Nhuoc diem |
|---------|-------------------|---------|------------|
| **HOC** | Them chuc nang chung (auth, logging, theming) | Tai su dung cao, tach biet concerns | Wrapper hell, kho debug, prop collision |
| **Render Props** | Chia se logic voi giao dien linh hoat | Ro rang, linh hoat giao dien | Callback hell khi long nhieu lop |
| **Compound Components** | Nhom component lien quan (tabs, menu, form) | API sach, linh hoat cho nguoi dung | Phuc tap khi implement |
| **Controlled** | Form can validate, format, lien ket | Kiem soat hoan toan | Nhieu boilerplate code |
| **Uncontrolled** | Form don gian, file upload | It code, don gian | Kho validate, kho dong bo |
| **Container/Presentational** | Tach logic va giao dien | De test, de tai su dung | Them lop component |

**Nguyen tac chon pattern:**
1. Can **them chuc nang** cho nhieu component? -> **HOC** hoac **Custom Hook**
2. Can **chia se logic** voi **giao dien khac nhau**? -> **Render Props** hoac **Custom Hook**
3. Nhom component **hoat dong cung nhau**? -> **Compound Components**
4. Can **kiem soat form chat che**? -> **Controlled Components**

---

## 8. Modern Alternatives: Custom Hooks thay the HOC va Render Props

Tu React 16.8, **Custom Hooks** da thay the phan lon use case cua HOC va Render Props. Hooks don gian hon, de hieu hon, va khong gay ra wrapper hell.

### 8.1. useAuth - Thay the withAuth HOC

```jsx
import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login(credentials) {
    return fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
      });
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook - don gian va truc tiep
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phai duoc dung ben trong AuthProvider');
  }
  return context;
}

// Su dung trong component - khong can HOC boc ngoai
function Dashboard() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Dang kiem tra xac thuc...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Xin chao, {user.name}!</h1>
      <button onClick={logout}>Dang xuat</button>
    </div>
  );
}
```

### 8.2. useFetch - Thay the DataFetcher Render Prop

```jsx
import { useState, useEffect } from 'react';

// Custom Hook thay the ca withLoading HOC va DataFetcher Render Props
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setData(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Su dung - cuc ky don gian va de doc
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <p>Dang tai...</p>;
  if (error) return <p>Loi: {error}</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// Compose nhieu hooks ma khong bi wrapper hell
function UserDashboard() {
  const { user } = useAuth();
  const { data: posts, loading } = useFetch(`/api/users/${user.id}/posts`);
  const { data: notifications } = useFetch(`/api/users/${user.id}/notifications`);

  return (
    <div>
      <h1>{user.name}</h1>
      {loading ? <p>Dang tai...</p> : <PostList posts={posts} />}
      <NotificationBadge count={notifications?.length ?? 0} />
    </div>
  );
}
```

### 8.3. useMousePosition - Thay the MouseTracker Render Prop

```jsx
import { useState, useEffect } from 'react';

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}

// Moi component tu do su dung - khong can Render Props nua
function Cursor() {
  const { x, y } = useMousePosition();
  return (
    <div
      style={{
        position: 'fixed', left: x - 10, top: y - 10,
        width: 20, height: 20, borderRadius: '50%',
        backgroundColor: 'blue', pointerEvents: 'none',
      }}
    />
  );
}

function CoordinateDisplay() {
  const { x, y } = useMousePosition();
  return <p>Chuot dang o: ({x}, {y})</p>;
}
```

---

## 9. Anti-patterns can tranh

### 9.1. Mutate props truc tiep

```jsx
// SAI - Khong bao gio thay doi props
function BadComponent(props) {
  props.items.push('new item'); // KHONG DUOC LAM DIEU NAY
  props.user.name = 'changed';  // KHONG DUOC LAM DIEU NAY
  return <div>{props.user.name}</div>;
}

// DUNG - Tao ban sao moi
function GoodComponent({ items, user }) {
  const allItems = [...items, 'new item'];
  const updatedUser = { ...user, name: 'changed' };
  return <div>{updatedUser.name}</div>;
}
```

### 9.2. Dung index lam key trong danh sach dong

```jsx
// SAI - Khi danh sach thay doi, React se render sai
function BadList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li> // index lam key = loi tiem an
      ))}
    </ul>
  );
}

// DUNG - Dung ID duy nhat
function GoodList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 9.3. Nested component definitions (dinh nghia component trong component)

```jsx
// SAI - Component duoc tao lai moi lan render, mat state va hieu suat
function Parent() {
  // InnerChild duoc tao moi o MOI LAN Parent render
  function InnerChild() {
    const [count, setCount] = useState(0); // State bi reset moi lan Parent render
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
  }

  return <InnerChild />;
}

// DUNG - Dinh nghia component ben ngoai
function Child() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

function Parent() {
  return <Child />;
}
```

### 9.4. Prop Drilling qua nhieu lop

```jsx
// SAI - Truyen prop qua 5 lop component chi de den component cuoi cung
function App() {
  const [theme, setTheme] = useState('dark');
  return <Layout theme={theme} setTheme={setTheme} />;
}
function Layout({ theme, setTheme }) {
  return <Sidebar theme={theme} setTheme={setTheme} />;
}
function Sidebar({ theme, setTheme }) {
  return <Menu theme={theme} setTheme={setTheme} />;
}
function Menu({ theme, setTheme }) {
  return <ThemeToggle theme={theme} setTheme={setTheme} />;
}

// DUNG - Su dung Context
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
      Hien tai: {theme}
    </button>
  );
}
```

---

## 10. Bai tap

### Bai tap 1: Custom Hook `useLocalStorage`
Viet mot Custom Hook luu va doc du lieu tu `localStorage`, tu dong dong bo khi gia tri thay doi.

```jsx
// Goi y cau truc:
function useLocalStorage(key, initialValue) {
  // 1. Khoi tao state tu localStorage (hoac initialValue neu chua co)
  // 2. Moi khi state thay doi, ghi lai vao localStorage
  // 3. Tra ve [value, setValue] giong nhu useState
}

// Test voi:
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);
  // Khi reload trang, gia tri van duoc giu nguyen
}
```

### Bai tap 2: Compound Component `Select/Option`
Xay dung mot custom Select component su dung Compound Components pattern.

```jsx
// Muc tieu API:
function App() {
  const [value, setValue] = useState('');
  return (
    <Select value={value} onChange={setValue} placeholder="Chon tinh thanh...">
      <Select.Option value="hn">Ha Noi</Select.Option>
      <Select.Option value="hcm">Ho Chi Minh</Select.Option>
      <Select.Option value="dn">Da Nang</Select.Option>
      <Select.Option value="hp" disabled>Hai Phong (Het)</Select.Option>
    </Select>
  );
}
// Yeu cau:
// - Click vao Select mo dropdown danh sach Option
// - Click Option -> dong dropdown, cap nhat gia tri
// - Click ben ngoai -> dong dropdown
// - Ho tro prop "disabled" cho Option
// - Hien thi placeholder khi chua chon
```

### Bai tap 3: Refactor HOC thanh Custom Hook
Cho san HOC `withWindowSize`, hay chuyen thanh Custom Hook `useWindowSize`.

```jsx
// HOC cho san:
function withWindowSize(WrappedComponent) {
  return function(props) {
    const [size, setSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    useEffect(() => {
      function handleResize() {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <WrappedComponent {...props} windowSize={size} />;
  };
}

// Bai lam: Viet useWindowSize va su dung truc tiep trong component
// function useWindowSize() { ... }
```

### Bai tap 4: Toggle Component voi Compound Pattern
Tao mot Toggle component cho phep bat/tat, su dung Compound Components.

```jsx
// Muc tieu API:
function App() {
  return (
    <Toggle onToggle={(on) => console.log('Trang thai:', on)}>
      <Toggle.On>Dang BAT</Toggle.On>
      <Toggle.Off>Dang TAT</Toggle.Off>
      <Toggle.Button />
    </Toggle>
  );
}
// - Toggle.On chi hien khi trang thai la true
// - Toggle.Off chi hien khi trang thai la false
// - Toggle.Button la nut nhan de chuyen doi trang thai
```

---

**Tong ket:** Cac Component Patterns la nen tang de xay dung ung dung React co cau truc tot. Trong thuc te hien dai, **Custom Hooks** da thay the phan lon HOC va Render Props, nhung **Compound Components** van la pattern khong the thay the cho cac UI component phuc tap. Hay nam vung tat ca cac pattern nay de co the chon dung cong cu cho tung tinh huong cu the.
