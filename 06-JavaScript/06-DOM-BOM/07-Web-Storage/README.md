# Web Storage

## Web Storage là gì?

Web Storage cho phép lưu trữ dữ liệu **trên browser** dưới dạng key-value (cả key và value đều là **string**). Có 2 loại: `localStorage` và `sessionStorage`.

---

## 1. localStorage vs sessionStorage

| | localStorage | sessionStorage |
|---|---|---|
| Thời gian lưu | **Vĩnh viễn** (cho đến khi xóa) | Chỉ trong **phiên** (tab đóng → mất) |
| Phạm vi | Tất cả tabs cùng origin | Chỉ tab hiện tại |
| Dung lượng | ~5-10MB | ~5-10MB |
| Chia sẻ giữa tabs | Có | Không |

---

## 2. API

```js
// SET — Lưu dữ liệu
localStorage.setItem('name', 'Phong');
localStorage.setItem('theme', 'dark');

// GET — Đọc dữ liệu
localStorage.getItem('name');     // 'Phong'
localStorage.getItem('notExist'); // null

// REMOVE — Xóa một key
localStorage.removeItem('name');

// CLEAR — Xóa tất cả
localStorage.clear();

// LENGTH & KEY
localStorage.length;     // Số lượng keys
localStorage.key(0);     // Key tại index 0
```

---

## 3. Lưu dữ liệu phức tạp (Object/Array)

Web Storage chỉ lưu **string**. Để lưu object/array, cần **JSON.stringify** khi lưu và **JSON.parse** khi đọc.

```js
// Lưu
const user = { name: 'Phong', age: 25, settings: { theme: 'dark' } };
localStorage.setItem('user', JSON.stringify(user));

// Đọc
const saved = JSON.parse(localStorage.getItem('user'));
console.log(saved.name); // 'Phong'

// Đọc an toàn (tránh lỗi khi data bị hỏng)
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}
```

---

## 4. Storage Event (Cross-tab communication)

Khi `localStorage` thay đổi **từ tab khác**, tab hiện tại nhận được `storage` event.

```js
window.addEventListener('storage', (event) => {
  console.log('Key:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
  console.log('URL:', event.url);

  // Ví dụ: sync theme giữa các tabs
  if (event.key === 'theme') {
    applyTheme(event.newValue);
  }
});
```

**Lưu ý:** Event chỉ fire ở **tabs khác** cùng origin, KHÔNG fire ở tab thực hiện thay đổi.

---

## 5. Cookies vs Web Storage vs IndexedDB

| | Cookies | localStorage | sessionStorage | IndexedDB |
|---|---|---|---|---|
| Dung lượng | ~4KB | ~5-10MB | ~5-10MB | Hàng trăm MB |
| Gửi lên server | **Có** (mỗi request) | Không | Không | Không |
| Hết hạn | Tùy chỉnh | Vĩnh viễn | Phiên | Vĩnh viễn |
| API | Khó dùng | Đơn giản | Đơn giản | Phức tạp |
| Dùng cho | Auth tokens, sessions | User prefs, cache | Temp data | Large data, offline |
