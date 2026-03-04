# React Hook: useState

> Hook co ban nhat va quan trong nhat trong React - quan ly state cua component.

---

## Muc luc

1. [Khai niem co ban](#1-khai-niem-co-ban)
2. [State co ban voi Primitive Types](#2-state-co-ban-voi-primitive-types)
3. [Updater Function](#3-updater-function-functional-update)
4. [Lazy Initialization](#4-lazy-initialization)
5. [State voi Object](#5-state-voi-object)
6. [State voi Array](#6-state-voi-array)
7. [Multiple States vs Single State Object](#7-multiple-states-vs-single-state-object)
8. [Batching trong React 18+](#8-batching-trong-react-18)
9. [Common Mistakes](#9-common-mistakes-loi-thuong-gap)
10. [Bai tap](#10-bai-tap)

---

## 1. Khai niem co ban

### useState la gi?

`useState` la mot **React Hook** cho phep ban them **state** (trang thai) vao **function component**. Truoc React 16.8, chi co class component moi co state. Gio day, voi `useState`, function component cung co the luu tru va cap nhat du lieu.

Khi state thay doi, React se **re-render** component - tuc la goi lai ham component de tinh toan giao dien moi dua tren gia tri state moi.

### Cu phap

```jsx
const [state, setState] = useState(initialValue);
```

| Thanh phan      | Mo ta                                                        |
| --------------- | ------------------------------------------------------------ |
| `state`         | Gia tri hien tai cua state                                   |
| `setState`      | Ham de cap nhat state, goi ham nay se trigger **re-render**  |
| `initialValue`  | Gia tri khoi tao, chi duoc su dung trong lan render **dau tien** |

Cu phap `[state, setState]` la **array destructuring**. Ban co the dat ten bat ky, nhung quy uoc la `[something, setSomething]`.

### Quy tac quan trong (Rules of Hooks)

- Chi goi `useState` **o top level** cua component (khong dat trong `if`, `for`, ham long).
- Chi goi trong **React function component** hoac **custom hook**.
- Thu tu goi hooks phai **giong nhau** giua cac lan render.

```jsx
// SAI - goi useState trong dieu kien
function Bad() {
  if (someCondition) {
    const [value, setValue] = useState(0); // KHONG DUOC!
  }
}

// DUNG - luon goi o top level
function Good() {
  const [value, setValue] = useState(0); // OK
  // Dung dieu kien o cho khac, khong phai luc khai bao hook
}
```

### Vi du dau tien

```jsx
import { useState } from "react";

function Counter() {
  // Khai bao state voi gia tri ban dau la 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Ban da click {count} lan</p>
      <button onClick={() => setCount(count + 1)}>Tang</button>
    </div>
  );
}
```

> Moi lan click nut "Tang", `setCount` duoc goi -> React re-render component -> `count` duoc cap nhat tren giao dien.

---

## 2. State co ban voi Primitive Types

### Number

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### String

```jsx
function Greeting() {
  const [name, setName] = useState("");

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nhap ten cua ban"
      />
      {name && <p>Xin chao, {name}!</p>}
    </div>
  );
}
```

> `value={name}` ket hop voi `onChange` tao thanh **controlled component** - React kiem soat hoan toan gia tri cua input. Day la pattern pho bien nhat khi lam viec voi form.

### Boolean

```jsx
function TogglePanel() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "An di" : "Hien thi"}
      </button>

      {isVisible && (
        <div style={{ padding: 16, background: "#f0f0f0", marginTop: 8 }}>
          Day la noi dung bi an. Click nut phia tren de dong lai.
        </div>
      )}
    </div>
  );
}
```

> Pattern `{condition && <Component />}` goi la **conditional rendering** - chi render khi dieu kien la `true`.

---

## 3. Updater Function (Functional Update)

### Van de: Stale State

Khi ban goi `setState` nhieu lan lien tiep trong cung mot event, gia tri `state` **chua duoc cap nhat ngay**. No van la gia tri cua lan render hien tai.

```jsx
// SAI - count chi tang 1, khong phai 3
function BrokenCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // count = 0 -> set 1
    setCount(count + 1); // count van = 0 -> set 1 (KHONG phai 2!)
    setCount(count + 1); // count van = 0 -> set 1 (KHONG phai 3!)
    // Ket qua cuoi cung: count = 1
  };

  return <button onClick={handleClick}>Tang 3 ({count})</button>;
}
```

**Tai sao?** Vi trong mot lan render, `count` la mot **hang so**. Ba dong `setCount(count + 1)` deu la `setCount(0 + 1)`, tuc la set gia tri `1` ba lan.

### Giai phap: Updater Function

Truyen mot **function** (goi la updater function) vao `setState`. React se truyen gia tri state **moi nhat** (bao gom ca cac lan update truoc do chua render) vao tham so cua function.

```jsx
// DUNG - count tang 3
function CorrectCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1); // prev = 0 -> return 1
    setCount((prev) => prev + 1); // prev = 1 -> return 2
    setCount((prev) => prev + 1); // prev = 2 -> return 3
    // Ket qua cuoi cung: count = 3
  };

  return <button onClick={handleClick}>Tang 3 ({count})</button>;
}
```

### Khi nao can dung Updater Function?

| Tinh huong                                          | Nen dung updater? |
| --------------------------------------------------- | ----------------- |
| Goi `setState` 1 lan, gia tri khong phu thuoc state cu | Khong bat buoc    |
| Goi `setState` nhieu lan lien tiep                   | **Co**            |
| State moi phu thuoc vao state cu                     | **Co**            |
| `setState` trong `setTimeout`, `setInterval`         | **Co**            |
| `setState` trong async function (sau `await`)        | **Co**            |
| Dat gia tri moi hoan toan (vd: `setCount(0)`)       | Khong can         |

### Vi du: setState trong setTimeout

```jsx
function DelayedCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      // SAI: count bi "dong bang" tai thoi diem click
      // Neu click 5 lan nhanh, ket qua van chi la 1
      // setCount(count + 1);

      // DUNG: luon lay gia tri moi nhat
      setCount((prev) => prev + 1);
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Tang sau 3 giay</button>
    </div>
  );
}
```

---

## 4. Lazy Initialization

Khi `initialValue` can **tinh toan nang** (doc tu localStorage, parse JSON, tinh toan phuc tap), ban nen truyen mot **function** vao `useState` thay vi truyen gia tri truc tiep.

### Van de: Tinh toan moi lan render

```jsx
function readFromStorage() {
  console.log("Doc localStorage..."); // Log nay in ra MOI LAN render
  const data = localStorage.getItem("myData");
  return data ? JSON.parse(data) : [];
}

// SAI - readFromStorage() chay moi lan component re-render
// Mac du gia tri tra ve chi duoc dung o lan render dau tien
function BadExample() {
  const [data, setData] = useState(readFromStorage());
  return <div>{data.length} items</div>;
}
```

### Giai phap: Truyen function (khong goi)

```jsx
// DUNG - function chi duoc goi 1 LAN duy nhat, o lan render dau tien
function GoodExample() {
  const [data, setData] = useState(() => {
    console.log("Chi chay 1 lan!"); // Log nay chi in 1 lan
    const saved = localStorage.getItem("myData");
    return saved ? JSON.parse(saved) : [];
  });

  return <div>{data.length} items</div>;
}
```

### Vi du thuc te: Todo App voi localStorage

```jsx
function TodoApp() {
  // Lazy init: doc saved todos tu localStorage, chi chay 1 lan
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addTodo = (text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  };

  return (
    <div>
      <h2>Todos ({todos.length})</h2>
      {todos.map((todo) => (
        <p key={todo.id}>{todo.text}</p>
      ))}
    </div>
  );
}
```

### So sanh

```jsx
// Truyen GIA TRI: ham duoc GOI ngay, moi lan render
useState(expensiveFunction());        // expensiveFunction() chay moi render

// Truyen FUNCTION: React chi goi function o lan render dau tien
useState(() => expensiveFunction());  // expensiveFunction() chi chay 1 lan
```

> **Quy tac:** Neu initial value la mot **literal** (so, string, boolean, object/array literal) thi khong can lazy init. Chi dung khi can **tinh toan** gia tri ban dau.

---

## 5. State voi Object

### Nguyen tac cot loi: Immutability

React so sanh state cu va moi bang **reference** (`Object.is()`). Neu ban thay doi truc tiep property cua object (mutation), reference khong doi -> React **khong biet** state da thay doi -> **khong re-render**.

```jsx
// SAI - Direct mutation, React KHONG re-render
const [user, setUser] = useState({ name: "A", age: 20 });

const updateAge = () => {
  user.age = 25;     // Thay doi truc tiep object goc (mutation)
  setUser(user);     // Cung reference -> React bo qua, khong re-render
};

// DUNG - Tao object MOI bang spread operator
const updateAge = () => {
  setUser({ ...user, age: 25 }); // Object moi, reference moi -> re-render
};
```

### Vi du: Form voi Object State

```jsx
function UserForm() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    age: 0,
  });

  // Helper: cap nhat 1 field bat ky dung computed property name
  const updateField = (field, value) => {
    setUser((prev) => ({
      ...prev,         // Copy tat ca field cu
      [field]: value,  // Ghi de field can thay doi
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Ten: </label>
        <input
          value={user.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div>
        <label>Email: </label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div>
        <label>Tuoi: </label>
        <input
          type="number"
          value={user.age}
          onChange={(e) => updateField("age", Number(e.target.value))}
        />
      </div>

      <button type="submit">Gui</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </form>
  );
}
```

### Nested Object - Object long nhau

Voi object nhieu cap, ban phai spread **tung cap** (level) can thay doi.

```jsx
function Profile() {
  const [profile, setProfile] = useState({
    name: "Phong",
    address: {
      city: "Ha Noi",
      district: "Cau Giay",
    },
  });

  const updateCity = (newCity) => {
    setProfile((prev) => ({
      ...prev,               // Spread cap 1 (name, address)
      address: {
        ...prev.address,     // Spread cap 2 (city, district)
        city: newCity,        // Ghi de city
      },
    }));
  };

  return (
    <div>
      <p>Thanh pho: {profile.address.city}</p>
      <p>Quan: {profile.address.district}</p>
      <button onClick={() => updateCity("Ho Chi Minh")}>
        Chuyen vao HCM
      </button>
    </div>
  );
}
```

> **Meo:** Neu object qua sau (3-4 cap tro len), hay xem xet:
> - Dung thu vien **Immer** (hook `useImmer`) de viet code mutation nhung van dam bao immutability.
> - Tach thanh nhieu state rieng biet thay vi 1 object lon.
> - Chuyen sang `useReducer` neu logic cap nhat phuc tap.

---

## 6. State voi Array

Tuong tu object, **khong bao gio mutate array truc tiep**. Luon tao array moi.

### 6.1. Them item (Add)

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Hoc React" },
    { id: 2, text: "Lam bai tap" },
  ]);
  const [input, setInput] = useState("");

  // Them vao cuoi mang
  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = { id: Date.now(), text: input };
    setTodos((prev) => [...prev, newTodo]);
    setInput("");
  };

  // Them vao dau mang
  const addToStart = () => {
    if (!input.trim()) return;
    const newTodo = { id: Date.now(), text: input };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  // Chen vao vi tri cu the
  const insertAt = (index) => {
    const newTodo = { id: Date.now(), text: input };
    setTodos((prev) => [
      ...prev.slice(0, index),
      newTodo,
      ...prev.slice(index),
    ]);
    setInput("");
  };

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>Them cuoi</button>
      <button onClick={addToStart}>Them dau</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 6.2. Xoa item (Remove)

```jsx
// Xoa theo id (cach tot nhat - dung unique identifier)
const removeTodoById = (idToRemove) => {
  setTodos((prev) => prev.filter((todo) => todo.id !== idToRemove));
};

// Xoa theo index (chu y: index co the thay doi khi mang thay doi)
const removeTodoByIndex = (indexToRemove) => {
  setTodos((prev) => prev.filter((_, index) => index !== indexToRemove));
};
```

### 6.3. Cap nhat item (Update)

```jsx
// Toggle trang thai done cua 1 todo
const toggleTodo = (idToToggle) => {
  setTodos((prev) =>
    prev.map((todo) =>
      todo.id === idToToggle
        ? { ...todo, done: !todo.done }  // Tao object moi cho item can thay doi
        : todo                            // Giu nguyen cac item khac
    )
  );
};

// Doi ten todo
const renameTodo = (idToRename, newText) => {
  setTodos((prev) =>
    prev.map((todo) =>
      todo.id === idToRename
        ? { ...todo, text: newText }
        : todo
    )
  );
};
```

### 6.4. Sap xep (Sort)

```jsx
// QUAN TRONG: Array.sort() MUTATE array goc -> phai tao ban sao truoc
const sortByName = () => {
  setTodos((prev) =>
    [...prev].sort((a, b) => a.text.localeCompare(b.text))
  );
};

// Dao nguoc thu tu
const reverseTodos = () => {
  setTodos((prev) => [...prev].reverse());
};
```

### Bang tom tat: Method an toan vs khong an toan

| Thao tac | An toan (tao array moi)             | KHONG an toan (mutate array goc) |
| -------- | ----------------------------------- | -------------------------------- |
| Them     | `[...arr, item]`, `concat()`       | `push()`, `unshift()`           |
| Xoa      | `filter()`, `slice()`              | `splice()`, `pop()`, `shift()`  |
| Cap nhat | `map()`                             | `arr[i] = x`                    |
| Sap xep  | `[...arr].sort()`                   | `arr.sort()`                    |
| Dao nguoc| `[...arr].reverse()`                | `arr.reverse()`                 |

---

## 7. Multiple States vs Single State Object

### Cach 1: Nhieu useState rieng biet

```jsx
function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Uu diem: moi state doc lap, de doc, de cap nhat
  // Nhuoc diem: nhieu dong khai bao, kho truyen ca nhom xuong component con
}
```

### Cach 2: Mot object chua tat ca

```jsx
function SignupForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    isLoading: false,
    error: null,
  });

  // Cap nhat 1 field: phai spread tat ca field con lai
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Uu diem: gon, de truyen ca object xuong component con
  // Nhuoc diem: moi lan cap nhat 1 field phai spread ca object
}
```

### Khi nao dung cach nao?

| Tieu chi                                     | Nhieu state   | Mot object     |
| -------------------------------------------- | ------------- | -------------- |
| Cac state **doc lap** voi nhau               | Tot           | Khong can      |
| Cac state **luon thay doi cung nhau**         | Khong tot     | Tot            |
| So luong state it (2-4)                       | Tot           | Duoc           |
| So luong state nhieu (>5)                     | Kho quan ly   | Tot hon        |
| Can truyen ca nhom state xuong child          | Bat tien      | Tien           |
| Logic cap nhat phuc tap, nhieu truong hop     | Xem xet `useReducer` | Xem xet `useReducer` |

### Cach 3 (khuyen nghi): Ket hop hop ly

```jsx
function ProductPage() {
  // Nhom 1: Form data - cac field lien quan, thay doi cung nhau -> object
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
  });

  // Nhom 2: UI state - doc lap voi nhau -> tach rieng
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Nhom 3: Error - doc lap
  const [error, setError] = useState(null);
}
```

> **Nguyen tac:** Nhom cac state **lien quan chat** vao 1 object, giu cac state **doc lap** rieng biet. Neu logic state qua phuc tap (nhieu action khac nhau), chuyen sang `useReducer`.

---

## 8. Batching trong React 18+

### Batching la gi?

**Batching** la ky thuat React **gom nhieu lan goi setState** lai va chi thuc hien **1 lan re-render** duy nhat. Dieu nay giup tang hieu nang dang ke vi moi lan re-render la mot qua trinh ton kem (tinh toan Virtual DOM, so sanh, cap nhat DOM that).

### Truoc React 18: Chi batch trong event handler

```jsx
// React 17: CHI batch trong React event handler
function React17Example() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // Duoc batch -> 1 re-render
  const handleClick = () => {
    setCount((c) => c + 1);
    setFlag((f) => !f);
    // 1 re-render
  };

  // KHONG batch -> 2 re-render rieng biet!
  const handleAsync = () => {
    setTimeout(() => {
      setCount((c) => c + 1); // Re-render lan 1
      setFlag((f) => !f);     // Re-render lan 2
    }, 100);
  };
}
```

### React 18+: Automatic Batching

Tu React 18, **tat ca** cac lan goi `setState` deu duoc batch tu dong, bat ke context (event handler, setTimeout, Promise, fetch callback, ...).

```jsx
function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [text, setText] = useState("hello");

  console.log("Render!"); // Dem so lan render

  // 1 re-render (giong React 17)
  const handleClick = () => {
    setCount((c) => c + 1);
    setFlag((f) => !f);
    setText("world");
    // React gom 3 setState -> 1 re-render duy nhat
  };

  // 1 re-render (KHAC React 17 - truoc la 3 re-render)
  const handleFetch = () => {
    fetch("/api/data").then(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
      setText("updated");
      // React 18: batch -> 1 re-render
      // React 17: 3 re-render rieng biet
    });
  };

  // 1 re-render (KHAC React 17 - truoc la 2 re-render)
  const handleTimeout = () => {
    setTimeout(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
      // React 18: 1 re-render | React 17: 2 re-render
    }, 1000);
  };

  return (
    <div>
      <p>Count: {count} | Flag: {String(flag)} | Text: {text}</p>
      <button onClick={handleClick}>Sync update</button>
      <button onClick={handleFetch}>After fetch</button>
      <button onClick={handleTimeout}>After timeout</button>
    </div>
  );
}
```

### flushSync - Buoc re-render ngay lap tuc

Trong truong hop hiem hoi ban can DOM cap nhat ngay (vi du: can do kich thuoc element ngay sau khi state thay doi):

```jsx
import { flushSync } from "react-dom";

function FlushSyncExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    flushSync(() => {
      setCount((c) => c + 1);
    });
    // DOM da cap nhat voi count moi tai day

    flushSync(() => {
      setFlag((f) => !f);
    });
    // DOM cap nhat voi flag moi tai day

    // Tong cong: 2 re-render (mat loi ich cua batching)
  };

  return <div>Count: {count}, Flag: {String(flag)}</div>;
}
```

> **Canh bao:** `flushSync` lam **giam hieu nang** vi tat batching. Chi dung khi that su can doc DOM ngay sau state update.

---

## 9. Common Mistakes (Loi thuong gap)

### Loi 1: Direct Mutation - Thay doi truc tiep state

Day la loi **pho bien nhat** voi nguoi moi hoc React.

```jsx
// SAI voi Object
const [user, setUser] = useState({ name: "A", age: 20 });

const updateAge = () => {
  user.age = 25;     // Mutation truc tiep vao object hien tai
  setUser(user);     // Van la cung reference -> React KHONG re-render!
};

// DUNG
const updateAge = () => {
  setUser({ ...user, age: 25 }); // Tao object moi -> reference moi -> re-render
};
```

```jsx
// SAI voi Array
const [items, setItems] = useState([1, 2, 3]);

const addItem = () => {
  items.push(4);      // Mutation truc tiep vao array hien tai
  setItems(items);     // Van la cung reference -> khong re-render!
};

// DUNG
const addItem = () => {
  setItems([...items, 4]); // Array moi -> reference moi -> re-render
};
```

### Loi 2: Stale Closure - Bien bi "dong bang"

```jsx
function StaleClosureExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // SAI: count luon la 0 vi closure "nho" gia tri luc useEffect chay
      // console.log(count); // Luon in 0
      // setCount(count + 1); // Luon set 0 + 1 = 1

      // DUNG: updater function luon nhan gia tri moi nhat tu React
      setCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // [] = chi chay 1 lan, closure bi "dong bang"

  return <p>Count: {count}</p>;
}
```

> **Giai thich:** Khi dependency array la `[]`, callback cua `useEffect` chi duoc tao **1 lan**. Bien `count` trong closure bi "dong bang" tai gia tri `0` mai mai. Updater function `(prev) => prev + 1` khong bi anh huong vi React truyen gia tri moi nhat vao `prev`.

### Loi 3: Doc state ngay sau setState

```jsx
function ReadAfterSet() {
  const [count, setCount] = useState(0);

  // SAI: tuong setState cap nhat ngay lap tuc
  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // Van in gia tri CU! (0, khong phai 1)
    // Ly do: `count` la const trong lan render nay, chi thay doi sau re-render
  };

  // DUNG: tinh truoc gia tri moi neu can dung ngay
  const handleClickFixed = () => {
    const newCount = count + 1;
    setCount(newCount);
    console.log(newCount); // 1 - gia tri moi, chinh xac
    sendToServer(newCount); // Gui gia tri moi
  };

  return <button onClick={handleClickFixed}>Count: {count}</button>;
}
```

### Loi 4: State bi cu trong async function

```jsx
function AsyncProblem() {
  const [count, setCount] = useState(0);

  const handleClick = async () => {
    // Tai dong nay, count = 0
    setCount(count + 1);  // Set 1

    await fetch("/api/save"); // Doi API (mat vai giay)

    // SAU await: count VAN = 0 (gia tri da bi "chup" luc bat dau ham)
    // Trong thoi gian doi, user co the da click them nhieu lan
    // setCount(count + 1); // SAI: set 0 + 1 = 1 (mat het cac lan click truoc)

    // DUNG: dung updater function
    setCount((prev) => prev + 1); // prev = gia tri hien tai (co the la 5, 10,...)
  };

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

### Loi 5: Khoi tao state tu prop nhung khong dong bo

```jsx
// State chi lay initialValue tu prop MO LAN RENDER DAU TIEN
// Khi parent truyen prop moi, state KHONG tu dong cap nhat
function UserCard({ initialName }) {
  const [name, setName] = useState(initialName);
  // Lan render dau: name = initialName
  // Parent thay doi initialName -> name VAN GIU GIA TRI CU

  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

// GIAI PHAP 1: Dung useEffect de dong bo khi prop thay doi
function UserCardV2({ initialName }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName); // Cap nhat state khi prop thay doi
  }, [initialName]);

  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

// GIAI PHAP 2 (khuyen nghi): Dung key de React tao component moi hoan toan
// Khi key thay doi, React unmount component cu va mount component moi
// -> useState chay lai voi initialValue moi
function Parent() {
  const [userId, setUserId] = useState(1);
  const userName = getUserName(userId);

  return <UserCard key={userId} initialName={userName} />;
}
```

---

## 10. Bai tap

### Bai 1: Counter nang cao

Yeu cau:
- Nut Tang (+step), Giam (-step), Reset (ve 0)
- Input de thay doi gia tri step (mac dinh step = 1)
- Khong cho `count` giam duoi 0
- Hien thi lich su cac lan thay doi (vd: "0 -> 1", "1 -> 6", ...)

```jsx
function AdvancedCounter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);

  const increment = () => {
    // TODO: Tang count them `step` don vi
    // TODO: Them vao history
  };

  const decrement = () => {
    // TODO: Giam count di `step` don vi, khong duoi 0
    // TODO: Them vao history
  };

  const reset = () => {
    // TODO: Reset ve 0, ghi vao history
  };

  return (
    <div>
      <h2>Count: {count}</h2>
      <div>
        <label>Step: </label>
        <input
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          min={1}
        />
      </div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>

      <h3>Lich su:</h3>
      <ul>
        {history.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Bai 2: Todo List hoan chinh

Yeu cau:
- Them, xoa, toggle done cho todo
- Dem so todo chua hoan thanh
- Loc theo trang thai: Tat ca / Chua xong / Da xong
- Luu vao `localStorage`, tu dong doc lai khi reload trang
- Dung `useEffect` de luu moi khi `todos` thay doi

```jsx
function TodoApp() {
  const [todos, setTodos] = useState(() => {
    // TODO: Doc tu localStorage
  });
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"

  // TODO: addTodo, removeTodo, toggleTodo
  // TODO: filteredTodos dua tren filter
  // TODO: useEffect de luu vao localStorage

  return (
    <div>
      {/* TODO: Input + nut Them */}
      {/* TODO: 3 nut loc: Tat ca / Chua xong / Da xong */}
      {/* TODO: Danh sach todo voi nut Xoa va checkbox Toggle */}
      {/* TODO: Hien thi "X viec chua hoan thanh" */}
    </div>
  );
}
```

### Bai 3: Form dang ky voi validation

Yeu cau:
- Fields: username, email, password, confirmPassword (dung 1 object state)
- Validate realtime:
  - `username` >= 3 ky tu
  - `email` chua "@" va "."
  - `password` >= 6 ky tu
  - `confirmPassword` === `password`
- Hien thi thong bao loi duoi moi field
- Disable nut Submit khi con loi hoac chua dien du

```jsx
function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Track field nao da tuong tac

  const validate = (data) => {
    const newErrors = {};
    // TODO: Validate tung field
    return newErrors;
  };

  const updateField = (field, value) => {
    // TODO: Cap nhat formData va chay validate
  };

  const handleBlur = (field) => {
    // TODO: Danh dau field la "touched" khi user roi khoi input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Validate tat ca, neu khong co loi thi submit
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO: Cac input fields voi error messages */}
      {/* TODO: Nut Submit (disabled khi co loi) */}
    </form>
  );
}
```

### Bai 4: Shopping Cart

Yeu cau:
- Danh sach san pham co san (ten, gia, hinh anh)
- Nut "Them vao gio" cho moi san pham
- Neu san pham da co trong gio: tang `quantity` thay vi them moi
- Trong gio hang: Tang/Giam so luong, Xoa san pham
- Hien thi tong tien (tinh tu `price * quantity` cua tat ca item)
- Tat ca thao tac phai dam bao **immutability**

```jsx
const PRODUCTS = [
  { id: 1, name: "Ao thun", price: 150000 },
  { id: 2, name: "Quan jeans", price: 350000 },
  { id: 3, name: "Giay the thao", price: 500000 },
];

function ShoppingCart() {
  const [cart, setCart] = useState([]);
  // Moi item trong cart: { id, name, price, quantity }

  const addToCart = (product) => {
    // TODO: Neu da co -> tang quantity, chua co -> them moi voi quantity = 1
  };

  const removeFromCart = (productId) => {
    // TODO: Xoa san pham khoi gio hang
  };

  const updateQuantity = (productId, delta) => {
    // TODO: Tang/giam quantity, xoa neu quantity = 0
  };

  const totalPrice = 0; // TODO: Tinh tong tien

  return (
    <div>
      <h2>San pham</h2>
      {/* TODO: Hien thi danh sach san pham voi nut "Them vao gio" */}

      <h2>Gio hang ({cart.length} san pham)</h2>
      {/* TODO: Hien thi cart items voi nut +, -, Xoa */}

      <h3>Tong tien: {totalPrice.toLocaleString()}d</h3>
    </div>
  );
}
```

---

## Tong ket

| Khai niem            | Diem chinh                                                  |
| -------------------- | ----------------------------------------------------------- |
| Cu phap co ban       | `const [state, setState] = useState(initial)`               |
| Primitive state      | Number, String, Boolean - dung truc tiep voi setState       |
| Updater function     | `setState(prev => newValue)` khi state moi phu thuoc state cu |
| Lazy initialization  | `useState(() => expensive())` de tranh tinh toan lai moi render |
| Object state         | Luon spread: `{ ...prev, field: value }` - khong mutate     |
| Array state          | Dung `map`, `filter`, `[...arr]` - khong dung `push`, `splice` |
| Multiple vs single   | Nhom state lien quan vao object, tach state doc lap rieng    |
| Batching (React 18+) | Nhieu setState duoc gom thanh 1 re-render tu dong           |
| Common mistakes      | Direct mutation, stale closure, doc state sau setState       |

> **Tiep theo:** Hoc `useEffect` de xu ly side effects (goi API, thao tac DOM, subscription) trong component.
