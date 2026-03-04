# Forms & Controlled Components

## 1. Controlled vs Uncontrolled

### Controlled Component (khuyên dùng)

React **kiểm soát** giá trị input qua state. Mỗi thay đổi đều đi qua React.

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // React kiểm soát value → "single source of truth"
  return (
    <form>
      <input
        type="email"
        value={email}                           // React kiểm soát value
        onChange={e => setEmail(e.target.value)} // mọi thay đổi qua setState
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
    </form>
  );
}

// Flow:
// 1. User gõ "a"
// 2. onChange fires → setEmail("a")
// 3. React re-render → input value = "a"
```

### Uncontrolled Component

DOM **tự quản lý** giá trị. Dùng `ref` để đọc khi cần.

```jsx
function SearchForm() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value); // đọc giá trị từ DOM
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
      <button type="submit">Search</button>
    </form>
  );
}
```

**Khi nào dùng cái nào?**
| | Controlled | Uncontrolled |
|--|-----------|-------------|
| Validation real-time | ✅ | ❌ |
| Disable submit khi invalid | ✅ | ❌ |
| Format input (phone, currency) | ✅ | ❌ |
| Đơn giản, ít logic | ❌ | ✅ |
| File input | ❌ | ✅ (luôn uncontrolled) |

---

## 2. Form hoàn chỉnh với validation

```jsx
function RegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic handler cho mọi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Xóa error khi user sửa
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.includes("@")) {
      newErrors.email = "Invalid email";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // await api.register(form);
      console.log("Registered:", form);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>

      {errors.submit && <p className="error">{errors.submit}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
```

---

## 3. Các loại input

```jsx
function AllInputTypes() {
  const [form, setForm] = useState({
    text: "",
    number: 0,
    checkbox: false,
    radio: "option1",
    select: "default",
    textarea: "",
    range: 50,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form>
      {/* Text */}
      <input name="text" value={form.text} onChange={handleChange} />

      {/* Number */}
      <input name="number" type="number" value={form.number} onChange={handleChange} />

      {/* Checkbox */}
      <label>
        <input name="checkbox" type="checkbox" checked={form.checkbox} onChange={handleChange} />
        I agree
      </label>

      {/* Radio */}
      <label>
        <input name="radio" type="radio" value="option1" checked={form.radio === "option1"} onChange={handleChange} />
        Option 1
      </label>
      <label>
        <input name="radio" type="radio" value="option2" checked={form.radio === "option2"} onChange={handleChange} />
        Option 2
      </label>

      {/* Select */}
      <select name="select" value={form.select} onChange={handleChange}>
        <option value="default">Choose...</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </select>

      {/* Textarea */}
      <textarea name="textarea" value={form.textarea} onChange={handleChange} rows={4} />

      {/* Range */}
      <input name="range" type="range" min="0" max="100" value={form.range} onChange={handleChange} />
      <span>{form.range}</span>

      {/* File (luôn uncontrolled) */}
      <input type="file" onChange={(e) => console.log(e.target.files[0])} />
    </form>
  );
}
```

---

## 4. Custom Hook cho Form (preview)

Tách logic form ra hook riêng (chi tiết ở phần Custom Hooks):

```jsx
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const reset = () => setValues(initialValues);

  return { values, errors, setErrors, handleChange, reset };
}

// Sử dụng
function LoginForm() {
  const { values, handleChange, reset } = useForm({ email: "", password: "" });

  return (
    <form>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" type="password" value={values.password} onChange={handleChange} />
      <button type="button" onClick={reset}>Reset</button>
    </form>
  );
}
```

---

## 5. Bài tập

1. Tạo form liên hệ (name, email, message) với validation real-time
2. Tạo multi-step form (wizard): Step 1 → Personal info, Step 2 → Address, Step 3 → Review
3. Tạo dynamic form builder: user chọn loại field → tự thêm input vào form
4. Tạo search form với debounce (delay 300ms trước khi tìm kiếm)
