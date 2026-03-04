# 12 - Testing

## 1. Unit Testing Concepts

```js
// Một unit test tốt nên:
// - Độc lập (không phụ thuộc test khác)
// - Nhanh
// - Đáng tin cậy (chạy lại cho cùng kết quả)
// - Dễ đọc

// AAA Pattern
// Arrange - Chuẩn bị dữ liệu
// Act - Thực hiện hành động
// Assert - Kiểm tra kết quả
```

## 2. Jest

```js
// Cài đặt: npm install --save-dev jest

// Basic test
describe('Calculator', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('subtracts 5 - 3 to equal 2', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});

// Matchers
expect(value).toBe(exact);           // ===
expect(value).toEqual(object);        // Deep equality
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();
expect(value).toBeGreaterThan(3);
expect(array).toContain(item);
expect(fn).toThrow(Error);
expect(string).toMatch(/regex/);

// Async testing
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ name: 'Phong' });
});

// Mocking
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });

jest.mock('./module', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked' }),
}));

// Setup/Teardown
beforeAll(() => { /* Chạy trước tất cả tests */ });
afterAll(() => { /* Chạy sau tất cả tests */ });
beforeEach(() => { /* Chạy trước mỗi test */ });
afterEach(() => { /* Chạy sau mỗi test */ });
```

## 3. TDD (Test-Driven Development)

```
Quy trình Red-Green-Refactor:

1. RED    - Viết test trước → test FAIL
2. GREEN  - Viết code tối thiểu để test PASS
3. REFACTOR - Cải thiện code, giữ test PASS
4. Lặp lại
```

```js
// Ví dụ TDD: Viết hàm isPalindrome

// Step 1: RED - Viết test
test('isPalindrome returns true for "racecar"', () => {
  expect(isPalindrome('racecar')).toBe(true);
});

test('isPalindrome returns false for "hello"', () => {
  expect(isPalindrome('hello')).toBe(false);
});

test('isPalindrome handles empty string', () => {
  expect(isPalindrome('')).toBe(true);
});

// Step 2: GREEN - Viết implementation
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

// Step 3: REFACTOR
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < cleaned.length / 2; i++) {
    if (cleaned[i] !== cleaned[cleaned.length - 1 - i]) return false;
  }
  return true;
}
```
