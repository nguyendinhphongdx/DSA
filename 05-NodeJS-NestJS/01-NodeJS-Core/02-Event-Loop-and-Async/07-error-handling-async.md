# 8. Error Handling trong Async Code

## 8.1. try/catch voi async/await

```js
// Co ban
async function riskyOperation() {
  try {
    const data = await fetchData();
    const processed = await processData(data);
    const saved = await saveData(processed);
    return saved;
  } catch (err) {
    // Bat moi loi tu bat ky await nao
    console.error('Loi:', err.message);
    throw err; // Re-throw neu can
  } finally {
    // Luon chay du co loi hay khong
    console.log('Clean up resources...');
  }
}

// Bat loi cu the cho tung buoc
async function detailedErrorHandling() {
  let user;
  try {
    user = await fetchUser(1);
  } catch (err) {
    console.error('Khong lay duoc user:', err.message);
    return null;
  }

  let posts;
  try {
    posts = await fetchPosts(user.id);
  } catch (err) {
    console.error('Khong lay duoc posts:', err.message);
    posts = []; // Fallback
  }

  return { user, posts };
}
```

## 8.2. Pattern xu ly loi nang cao

```js
// Pattern 1: Wrapper function tra ve [error, result]
async function to(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err, null];
  }
}

// Su dung - gon gang, khong can try/catch
async function handleUser() {
  const [err, user] = await to(fetchUser(1));
  if (err) {
    console.error('Loi:', err.message);
    return;
  }

  const [postErr, posts] = await to(fetchPosts(user.id));
  if (postErr) {
    console.error('Loi lay posts:', postErr.message);
    return;
  }

  console.log('User:', user.name, '- Posts:', posts.length);
}

// Pattern 2: Retry logic
async function fetchWithRetry(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`Lan thu ${attempt}/${maxRetries} that bai: ${err.message}`);

      if (attempt === maxRetries) {
        throw new Error(
          `That bai sau ${maxRetries} lan thu: ${err.message}`
        );
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`Thu lai sau ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Su dung retry
const data = await fetchWithRetry(
  () => fetch('https://api.example.com/data'),
  3, // 3 lan
  1000 // 1s, 2s, 4s
);

// Pattern 3: Custom Error classes
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} voi id=${id} khong ton tai`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

class ValidationError extends AppError {
  constructor(message, fields) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Su dung
async function getUser(id) {
  const user = await db.findUser(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
}
```

## 8.3. Unhandled Promise Rejections

```js
// NGUY HIEM: Promise rejection khong duoc xu ly
async function dangerousFunction() {
  throw new Error('Loi khong duoc bat!');
}

dangerousFunction(); // Khong co .catch() hay try/catch → UnhandledPromiseRejection

// Node.js 15+ se CRASH process khi co unhandled rejection
// Cach xu ly global
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Log loi, gui alert, roi exit
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log loi, cleanup, roi exit
  process.exit(1);
});

// BAT BUOC: Luon xu ly loi cho moi Promise
dangerousFunction().catch((err) => {
  console.error('Da bat duoc loi:', err.message);
});
```
