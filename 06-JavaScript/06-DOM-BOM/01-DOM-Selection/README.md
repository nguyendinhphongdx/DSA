# DOM Selection (Chọn phần tử DOM)

## DOM là gì?

DOM (Document Object Model) là **cấu trúc cây** biểu diễn trang HTML trong bộ nhớ. Mỗi thẻ HTML trở thành một **node** (nút) trong cây, và JavaScript có thể đọc, thêm, sửa, xóa bất kỳ node nào.

```
document
└── html
    ├── head
    │   └── title → "My Page"
    └── body
        ├── h1 → "Hello"
        ├── p → "World"
        └── div#container
            ├── p.item → "Item 1"
            └── p.item → "Item 2"
```

---

## 1. Các phương thức chọn phần tử

### querySelector / querySelectorAll (Khuyên dùng)

Dùng **CSS selector** để tìm phần tử — linh hoạt và mạnh nhất.

```js
// querySelector: trả về phần tử ĐẦU TIÊN match, hoặc null
document.querySelector('#id');           // Theo ID
document.querySelector('.class');         // Theo class
document.querySelector('div.box > p');   // CSS selector phức tạp
document.querySelector('[data-id="5"]'); // Attribute selector
document.querySelector('input[type="email"]');

// querySelectorAll: trả về NodeList (tất cả matches)
const items = document.querySelectorAll('.item');
items.length;        // Số phần tử
items[0];            // Truy cập theo index
items.forEach(item => console.log(item.textContent)); // Duyệt
```

**NodeList vs HTMLCollection:**
- `querySelectorAll` → **NodeList** (static — không cập nhật khi DOM thay đổi)
- `getElementsBy...` → **HTMLCollection** (live — tự cập nhật khi DOM thay đổi)

### getElementById / getElementsBy...

```js
document.getElementById('myId');          // Element hoặc null
document.getElementsByClassName('item');   // HTMLCollection (live)
document.getElementsByTagName('p');        // HTMLCollection (live)
document.getElementsByName('email');       // NodeList (cho name attr)
```

---

## 2. Duyệt cây DOM (Traversal)

Từ một phần tử, di chuyển đến các phần tử liên quan.

```js
const el = document.querySelector('.current');

// Parent
el.parentElement;          // Phần tử cha trực tiếp
el.closest('.container');  // Tìm ancestor gần nhất match selector (rất hữu ích!)

// Children
el.children;              // HTMLCollection con trực tiếp (chỉ elements)
el.childNodes;            // NodeList (bao gồm cả text, comment nodes)
el.firstElementChild;     // Con đầu tiên (element)
el.lastElementChild;      // Con cuối cùng (element)

// Siblings
el.nextElementSibling;    // Phần tử anh em kế tiếp
el.previousElementSibling; // Phần tử anh em trước đó
```

### closest() — Rất phổ biến trong Event Delegation

```js
// Tìm ancestor gần nhất match selector, bao gồm cả chính element
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card'); // Tìm .card chứa element được click
  if (card) {
    console.log('Clicked card:', card.dataset.id);
  }
});
```

---

## 3. Kiểm tra phần tử

```js
// matches: kiểm tra element có match selector không
el.matches('.active');         // true/false
el.matches('div.box:first-child');

// contains: kiểm tra element A có chứa element B không
parentEl.contains(childEl);   // true/false

// Ví dụ: click ngoài modal để đóng
document.addEventListener('click', (e) => {
  const modal = document.querySelector('.modal');
  if (modal && !modal.contains(e.target)) {
    closeModal();
  }
});
```
