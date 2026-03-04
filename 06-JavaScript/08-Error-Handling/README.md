# 08 - Error Handling

## 1. Try/Catch/Finally

```js
try {
  // Code có thể throw error
  const data = JSON.parse(invalidJson);
} catch (error) {
  // Xử lý error
  console.error(error.message);
  console.error(error.stack);
} finally {
  // Luôn chạy dù có error hay không
  cleanup();
}
```

## 2. Error Types

```js
// Built-in Error types
new Error('Generic error');
new TypeError('Wrong type');           // Sai kiểu dữ liệu
new ReferenceError('Not defined');     // Biến chưa khai báo
new SyntaxError('Bad syntax');         // Lỗi cú pháp
new RangeError('Out of range');        // Giá trị ngoài phạm vi
new URIError('Bad URI');               // URI không hợp lệ
new EvalError('Eval error');           // Lỗi eval()
```

## 3. Custom Errors

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(message, 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// Sử dụng
try {
  throw new ValidationError('email', 'Invalid email format');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Field: ${error.field}, Message: ${error.message}`);
  }
}
```

## 4. Debugging

```js
// Console methods
console.log('Basic log');
console.error('Error message');
console.warn('Warning');
console.table([{ a: 1 }, { a: 2 }]);  // Hiển thị dạng bảng
console.time('label'); /* code */ console.timeEnd('label'); // Đo thời gian
console.group('Group'); /* logs */ console.groupEnd();
console.trace(); // Stack trace
console.assert(condition, 'Failed!'); // Log nếu condition false

// Debugger
function buggyFunction() {
  debugger; // Dừng tại đây khi DevTools mở
  // ...
}
```
