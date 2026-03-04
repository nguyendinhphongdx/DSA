# Event Delegation (Ủy quyền sự kiện)

## Event Delegation là gì?

Thay vì gắn event listener cho **từng phần tử con**, bạn gắn **một listener duy nhất** cho phần tử cha. Khi event xảy ra ở con, nó **bubble lên** cha và được xử lý ở đó.

Đây là pattern quan trọng nhất khi làm việc với DOM — tối ưu performance và xử lý được cả phần tử thêm sau.

---

## Tại sao cần Event Delegation?

### Vấn đề 1: Nhiều listeners = tốn bộ nhớ

```js
// ❌ 1000 listeners cho 1000 items
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});
// Thêm item mới? Phải gắn listener thủ công!
```

### Vấn đề 2: Phần tử thêm sau không có listener

```js
// ❌ Items thêm sau KHÔNG có listener
ul.innerHTML += '<li class="item">New Item</li>';
// Item mới không được gắn click handler!
```

### Giải pháp: Event Delegation

```js
// ✅ 1 listener duy nhất, xử lý mọi items (hiện tại VÀ tương lai)
document.querySelector('.list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return; // Click không phải vào .item

  console.log('Clicked:', item.textContent);
});
```

---

## Cách implement

### Pattern cơ bản

```js
parentElement.addEventListener('eventType', (e) => {
  // 1. Tìm phần tử mục tiêu
  const target = e.target.closest('.target-selector');

  // 2. Kiểm tra có match không
  if (!target) return;

  // 3. Kiểm tra target nằm trong parent (tránh bắt event từ ngoài)
  if (!parentElement.contains(target)) return;

  // 4. Xử lý
  handleAction(target);
});
```

### Ví dụ thực tế: Todo List

```js
const todoList = document.querySelector('#todo-list');

todoList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  const toggleBtn = e.target.closest('.toggle-btn');
  const editBtn = e.target.closest('.edit-btn');
  const todoItem = e.target.closest('.todo-item');

  if (deleteBtn) {
    todoItem.remove();
    return;
  }

  if (toggleBtn) {
    todoItem.classList.toggle('completed');
    return;
  }

  if (editBtn) {
    startEdit(todoItem);
    return;
  }
});

// Giờ thêm todo mới KHÔNG cần gắn listener
function addTodo(text) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.innerHTML = `
    <span>${text}</span>
    <button class="toggle-btn">✓</button>
    <button class="edit-btn">✎</button>
    <button class="delete-btn">✕</button>
  `;
  todoList.appendChild(li); // Tự động có event handling!
}
```

### Ví dụ: Tab Navigation

```js
const tabContainer = document.querySelector('.tabs');

tabContainer.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;

  // Remove active from all tabs
  tabContainer.querySelectorAll('[data-tab]').forEach(t => {
    t.classList.remove('active');
  });

  // Activate clicked tab
  tab.classList.add('active');

  // Show corresponding content
  const tabId = tab.dataset.tab;
  document.querySelectorAll('.tab-content').forEach(content => {
    content.hidden = content.id !== tabId;
  });
});
```

---

## closest() là chìa khóa

`e.target` là phần tử **sâu nhất** được click (có thể là `<span>` bên trong `<button>`). Dùng `closest()` để tìm **ancestor gần nhất** match selector.

```html
<button class="btn">
  <span class="icon">🗑️</span>
  <span class="label">Delete</span>
</button>
```

```js
// ❌ e.target có thể là <span>, không phải <button>
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn')) { /* ... */ }
  // Nếu click vào <span> bên trong → KHÔNG match!
});

// ✅ closest tìm <button> chứa <span>
container.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (btn) { /* ... */ } // Luôn tìm đúng dù click vào <span>
});
```

---

## Khi nào KHÔNG dùng Event Delegation?

- Events **không bubble**: `focus`, `blur`, `mouseenter`, `mouseleave` (dùng `focusin`/`focusout` thay thế)
- Cần `this` reference chính xác đến element
- Chỉ có 1-2 elements tĩnh — overhead không đáng
