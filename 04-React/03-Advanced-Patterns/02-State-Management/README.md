# State Management trong React

## Muc luc

1. [Tong quan - Cac loai State](#1-tong-quan---cac-loai-state)
2. [Lifting State Up](#2-lifting-state-up)
3. [Context API](#3-context-api)
4. [useReducer + Context = Mini Redux](#4-usereducer--context--mini-redux)
5. [External State Libraries](#5-external-state-libraries)
6. [Server State vs Client State](#6-server-state-vs-client-state)
7. [URL State](#7-url-state)
8. [Decision Tree - Chon approach nao?](#8-decision-tree---chon-approach-nao)
9. [Common Mistakes](#9-common-mistakes)
10. [Bai tap](#10-bai-tap)

---

## 1. Tong quan - Cac loai State

Trong bat ky ung dung React nao, state co the chia thanh **4 loai chinh**:

| Loai State | Mo ta | Vi du | Cong cu thuong dung |
|------------|-------|-------|---------------------|
| **Local State** | State chi thuoc ve 1 component | Form input, toggle modal | `useState`, `useReducer` |
| **Shared State** | State duoc chia se giua nhieu component | Theme, user auth, gio hang | Context, Redux, Zustand |
| **Server State** | Du lieu den tu API/backend | Danh sach san pham, user profile | TanStack Query, SWR |
| **URL State** | State duoc luu trong URL | Search filters, pagination | `useSearchParams`, nuqs |

**Nguyen tac vang:** Khong phai moi thu deu can global state. Hay bat dau voi local state, chi "nang cap" khi that su can thiet.

```jsx
// Local State - Don gian nhat, uu tien dung truoc
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Dem: {count}</button>;
}
```

---

## 2. Lifting State Up

Khi 2 component can chia se cung 1 state, ta **nang state len component cha gan nhat** chua ca hai.

### Van de: 2 component can cung du lieu

```jsx
// Sai: moi component tu quan ly state rieng => khong dong bo
function TemperatureInput() {
  const [temp, setTemp] = useState('');
  return <input value={temp} onChange={e => setTemp(e.target.value)} />;
}

function TemperatureDisplay() {
  const [temp, setTemp] = useState(''); // Khong lien quan den input ben tren!
  return <p>Nhiet do hien tai: {temp}</p>;
}
```

### Giai phap: Lifting State Up

```jsx
// Dung: State duoc quan ly boi component cha
function TemperatureConverter() {
  const [celsius, setCelsius] = useState('');

  const fahrenheit = celsius ? (parseFloat(celsius) * 9/5 + 32).toFixed(1) : '';

  return (
    <div>
      <TemperatureInput
        label="Celsius"
        value={celsius}
        onChange={setCelsius}
      />
      <TemperatureInput
        label="Fahrenheit"
        value={fahrenheit}
        onChange={(f) => setCelsius(((parseFloat(f) - 32) * 5/9).toFixed(1))}
      />
    </div>
  );
}

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}:
      <input value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}
```

**Khi nao dung Lifting State Up:**
- Chi co 2-3 component can chia se state
- Cac component nam gan nhau trong component tree
- Khong can truyen props qua qua nhieu tang (< 3 tang)

**Khi nao KHONG dung:**
- Props phai truyen qua 4-5 tang (prop drilling) => chuyen sang Context hoac state library

---

## 3. Context API

Context giup truyen du lieu xuong component tree ma khong can truyen props qua tung tang.

### Cach tao va su dung Context

```jsx
import { createContext, useContext, useState } from 'react';

// Buoc 1: Tao Context
const ThemeContext = createContext(null);

// Buoc 2: Tao Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Buoc 3: Tao custom hook de su dung Context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phai duoc dung ben trong ThemeProvider');
  }
  return context;
}

// Buoc 4: Su dung trong component bat ky (khong can prop drilling)
function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={`header-${theme}`}>
      <button onClick={toggleTheme}>
        Chuyen sang {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </header>
  );
}

// App
function App() {
  return (
    <ThemeProvider>
      <Header />
      <MainContent />
      <Footer />
    </ThemeProvider>
  );
}
```

### Khi nao dung Context API

- Theme (light/dark mode)
- Thong tin user dang nhap (auth)
- Locale / ngon ngu
- Bat ky du lieu nao it thay doi va can truy cap o nhieu noi

### Limitations cua Context

```
[!] CANH BAO: Context KHONG phai la cong cu quan ly state toan nang

1. Performance: Khi value cua Provider thay doi, TAT CA consumer re-render
2. Khong co selector: Khong the subscribe chi 1 phan cua context
3. Khong co middleware, devtools, hay time-travel debugging
```

```jsx
// Van de performance: component UserAvatar chi can `name`
// nhung se re-render khi `email` thay doi
const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Phong', email: 'phong@mail.com' });
  // Moi lan setUser => tat ca component dung useContext(UserContext) deu re-render
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

// Giai phap: Tach context thanh nhieu context nho
const UserNameContext = createContext(null);
const UserEmailContext = createContext(null);
// => Component chi subscribe vao context ma no can
```

---

## 4. useReducer + Context = Mini Redux

Ket hop `useReducer` va Context de tao mot state management pattern manh me ma khong can thu vien ngoai.

```jsx
import { createContext, useContext, useReducer } from 'react';

// Dinh nghia action types
const ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_TO_CART: {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case ACTIONS.REMOVE_FROM_CART:
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case ACTIONS.CLEAR_CART:
      return { ...state, items: [] };
    default:
      throw new Error(`Action khong hop le: ${action.type}`);
  }
}

// Tao Context
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
  const removeFromCart = (id) => dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: id });
  const clearCart = () => dispatch({ type: ACTIONS.CLEAR_CART });

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  return (
    <CartContext.Provider value={{ items: state.items, totalPrice, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phai dung trong CartProvider');
  return context;
}

// Su dung
function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div>
      <h3>{product.name} - {product.price.toLocaleString()}d</h3>
      <button onClick={() => addToCart(product)}>Them vao gio</button>
    </div>
  );
}

function CartSummary() {
  const { items, totalPrice, clearCart } = useCart();
  return (
    <div>
      <h2>Gio hang ({items.length} san pham)</h2>
      {items.map(item => (
        <p key={item.id}>{item.name} x{item.quantity}</p>
      ))}
      <p>Tong: {totalPrice.toLocaleString()}d</p>
      <button onClick={clearCart}>Xoa gio hang</button>
    </div>
  );
}
```

**Pattern nay phu hop khi:** Logic state phuc tap (nhieu action), nhung app chua du lon de can Redux/Zustand.

---

## 5. External State Libraries

### 5.1 Redux Toolkit (RTK)

Redux Toolkit la cach viet Redux hien dai, giam boilerplate dang ke so voi Redux goc.

```jsx
// store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0, history: [] },
  reducers: {
    increment(state) {
      // RTK su dung Immer => co the "mutate" state truc tiep
      state.value += 1;
      state.history.push(`+1 => ${state.value}`);
    },
    decrement(state) {
      state.value -= 1;
      state.history.push(`-1 => ${state.value}`);
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
      state.history.push(`+${action.payload} => ${state.value}`);
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;

// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// Component su dung Redux
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store/counterSlice';

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

### 5.2 Zustand - Don gian, hien dai

Zustand noi bat boi su don gian: khong can Provider, khong can boilerplate.

```jsx
import { create } from 'zustand';

// Tao store chi voi 1 ham
const useBearStore = create((set, get) => ({
  bears: 0,
  fish: 10,

  // Actions
  addBear: () => set(state => ({ bears: state.bears + 1 })),
  removeBear: () => set(state => ({ bears: Math.max(0, state.bears - 1) })),
  feedBear: () => {
    if (get().fish > 0) {
      set(state => ({ fish: state.fish - 1 }));
    }
  },
  reset: () => set({ bears: 0, fish: 10 }),
}));

// Su dung - giong nhu 1 custom hook binh thuong
function BearCounter() {
  // Chi re-render khi `bears` thay doi (auto selector)
  const bears = useBearStore(state => state.bears);
  const addBear = useBearStore(state => state.addBear);

  return (
    <div>
      <h2>{bears} con gau</h2>
      <button onClick={addBear}>Them gau</button>
    </div>
  );
}
```

### 5.3 Jotai - Atomic State

Jotai tiep can theo huong "atom" - moi don vi state la 1 atom doc lap.

```jsx
import { atom, useAtom } from 'jotai';

// Tao cac atom (don vi state nho nhat)
const countAtom = atom(0);
const doubleCountAtom = atom(get => get(countAtom) * 2);  // Derived atom

const userAtom = atom({ name: 'Phong', age: 25 });

// Async atom - tu dong fetch data
const todosAtom = atom(async () => {
  const res = await fetch('/api/todos');
  return res.json();
});

// Su dung atom giong nhu useState
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubleCount] = useAtom(doubleCountAtom);  // Tu dong cap nhat

  return (
    <div>
      <p>Count: {count} (x2 = {doubleCount})</p>
      <button onClick={() => setCount(c => c + 1)}>Tang</button>
    </div>
  );
}
```

**So sanh nhanh:**

| Tieu chi | Redux Toolkit | Zustand | Jotai |
|----------|---------------|---------|-------|
| Boilerplate | Trung binh | Rat it | Rat it |
| DevTools | Tot nhat | Co | Co |
| Learning curve | Cao | Thap | Thap |
| Phu hop | App lon, team lon | App vua, moi du an | State phan tan, derived state |

---

## 6. Server State vs Client State

Day la su phan biet **quan trong nhat** ma nhieu nguoi bo qua.

```
Client State: Do nguoi dung tao ra (UI toggle, form input, theme)
  => useState, Context, Zustand...

Server State: Du lieu tu server (products, users, orders)
  => TanStack Query, SWR (KHONG nen dung Redux cho server state)
```

### Tai sao khong nen dung Redux cho server state?

Server state co nhung van de rieng ma client state khong co:
- **Caching**: Luu data da fetch de khong goi lai
- **Stale data**: Khi nao data cu? Khi nao can refetch?
- **Background refetching**: Tu dong cap nhat khi user quay lai tab
- **Optimistic updates**: Cap nhat UI truoc khi server tra loi

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data voi TanStack Query
function ProductList() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json()),
    staleTime: 5 * 60 * 1000,  // Data "tuoi" trong 5 phut
  });

  if (isLoading) return <p>Dang tai...</p>;
  if (error) return <p>Loi: {error.message}</p>;

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Mutation voi optimistic update
function AddProduct() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newProduct) =>
      fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      }).then(res => res.json()),

    // Optimistic update: cap nhat UI ngay, rollback neu loi
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previous = queryClient.getQueryData(['products']);
      queryClient.setQueryData(['products'], old => [...old, { ...newProduct, id: Date.now() }]);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['products'], context.previous);  // Rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });  // Refetch cho chac
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'San pham moi', price: 100000 })}>
      Them san pham {mutation.isPending && '(dang xu ly...)'}
    </button>
  );
}
```

---

## 7. URL State

URL state la state duoc luu tren thanh dia chi cua trinh duyet. Dac biet huu ich cho **search, filter, pagination** vi nguoi dung co the bookmark hoac chia se link.

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Doc state tu URL: /products?category=dien-thoai&sort=price&page=2
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const handleCategoryChange = (newCategory) => {
    setSearchParams(prev => {
      prev.set('category', newCategory);
      prev.set('page', '1');  // Reset ve trang 1 khi doi filter
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  return (
    <div>
      <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
        <option value="all">Tat ca</option>
        <option value="dien-thoai">Dien thoai</option>
        <option value="laptop">Laptop</option>
      </select>

      <select value={sort} onChange={e => {
        setSearchParams(prev => { prev.set('sort', e.target.value); return prev; });
      }}>
        <option value="newest">Moi nhat</option>
        <option value="price">Gia tang dan</option>
      </select>

      <div>
        <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>Truoc</button>
        <span>Trang {page}</span>
        <button onClick={() => handlePageChange(page + 1)}>Sau</button>
      </div>
    </div>
  );
}
```

**Loi ich cua URL state:**
- Nguoi dung co the **bookmark** trang ket qua tim kiem
- **Chia se link** giu nguyen trang thai filter
- **Back/Forward** cua trinh duyet hoat dong dung
- **SEO friendly** - search engine doc duoc trang thai

---

## 8. Decision Tree - Chon approach nao?

```
State can quan ly
  |
  |-- Chi 1 component su dung?
  |     => useState / useReducer
  |
  |-- 2-3 component gan nhau can chia se?
  |     => Lifting State Up
  |
  |-- Nhieu component o cac tang khac nhau can truy cap?
  |     |
  |     |-- Data it thay doi (theme, auth, locale)?
  |     |     => Context API
  |     |
  |     |-- Data thay doi thuong xuyen, can performance?
  |           => Zustand hoac Jotai
  |
  |-- Du lieu tu server (API)?
  |     => TanStack Query / SWR
  |     (KHONG dung Redux/Zustand cho server data)
  |
  |-- Can luu tren URL (filter, search, pagination)?
  |     => useSearchParams / nuqs
  |
  |-- App rat lon, team nhieu nguoi, can strict pattern?
        => Redux Toolkit
```

**Tom tat thuc te:**

| Use case | Giai phap |
|----------|-----------|
| Form input, modal toggle | `useState` |
| Form phuc tap nhieu field | `useReducer` |
| Theme, auth, locale | Context API |
| Gio hang, notifications | Zustand |
| Dashboard voi nhieu widget chia se data | Jotai |
| Fetch/cache API data | TanStack Query |
| Search filter, pagination | URL State (`useSearchParams`) |
| Enterprise app, team > 5 nguoi | Redux Toolkit |

---

## 9. Common Mistakes

### Sai lam 1: Cho moi thu vao global state

```jsx
// SAI: Khong can global state cho modal open/close
const useStore = create(set => ({
  isModalOpen: false,
  setModalOpen: (v) => set({ isModalOpen: v }),
}));

// DUNG: Local state la du
function ProductCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Xem chi tiet</button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
```

### Sai lam 2: Dung Redux/Zustand de cache server data

```jsx
// SAI: Tu viet logic fetch + cache trong Redux
const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    fetchStart(state) { state.loading = true; },
    fetchSuccess(state, action) { state.items = action.payload; state.loading = false; },
    fetchError(state, action) { state.error = action.payload; state.loading = false; },
  },
});
// Phai tu xu ly caching, refetching, stale data, error retry...

// DUNG: Dung TanStack Query - da xu ly het cho ban
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});
```

### Sai lam 3: Tao object moi trong Context value moi lan render

```jsx
// SAI: Moi lan Parent render => object moi => tat ca consumer re-render
function Parent() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// DUNG: Dung useMemo de giu reference on dinh
function Parent() {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### Sai lam 4: Khong tach read/write Context

```jsx
// SAI: 1 context chua ca state va dispatch
// => Component chi goi dispatch cung bi re-render khi state thay doi

// DUNG: Tach thanh 2 context
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}

// Component chi can goi action => khong re-render khi state thay doi
function AddButton() {
  const dispatch = useContext(DispatchContext);  // Chi subscribe dispatch
  return <button onClick={() => dispatch({ type: 'ADD' })}>Them</button>;
}
```

---

## 10. Bai tap

### Bai 1: Shopping Cart voi useReducer + Context (Co ban)

Xay dung gio hang voi cac chuc nang:
- Them san pham vao gio
- Tang/giam so luong
- Xoa san pham khoi gio
- Tinh tong tien, tong so luong
- Su dung `useReducer` + Context pattern

### Bai 2: Theme + Language Switcher voi Context (Co ban)

Tao he thong ho tro:
- Dark/Light mode
- Chuyen doi ngon ngu (Tieng Viet / English)
- Moi tinh nang dung 1 Context rieng biet
- Persist lua chon vao `localStorage`

### Bai 3: Todo App voi Zustand (Trung binh)

Tao ung dung Todo su dung Zustand:
- CRUD todo items
- Filter: All / Active / Completed
- Persist vao `localStorage` (dung Zustand middleware)
- Dem so task con lai

```jsx
// Goi y cau truc store
const useTodoStore = create(
  persist(
    (set, get) => ({
      todos: [],
      filter: 'all',
      addTodo: (text) => { /* ... */ },
      toggleTodo: (id) => { /* ... */ },
      deleteTodo: (id) => { /* ... */ },
      setFilter: (filter) => { /* ... */ },
      get filteredTodos() { /* ... */ },
      get remaining() { /* ... */ },
    }),
    { name: 'todo-storage' }
  )
);
```

### Bai 4: Product Listing voi TanStack Query + URL State (Nang cao)

Xay dung trang san pham voi:
- Fetch tu API (su dung TanStack Query)
- Filter theo category, sap xep theo gia (URL state)
- Pagination (URL state)
- Khi nguoi dung copy URL va dan vao tab moi => giu nguyen filter

### Bai 5: Mini E-commerce (Tong hop)

Ket hop tat ca kien thuc:
- **Server state** (TanStack Query): Danh sach san pham, chi tiet san pham
- **Client state** (Zustand): Gio hang, trang thai UI
- **URL state** (useSearchParams): Tim kiem, loc, phan trang
- **Context**: Theme, thong tin user dang nhap

---

> **Loi khuyen cuoi:** Bat dau voi giai phap don gian nhat (`useState`). Chi them do phuc tap khi thuc su can. Premature optimization la goc cua moi van de. Hieu ro van de truoc khi chon cong cu.
