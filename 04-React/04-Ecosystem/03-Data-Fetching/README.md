# Data Fetching

## 1. Vấn đề

Fetch data trong React cần quản lý rất nhiều thứ: loading state, error handling, caching, refetching, race conditions, optimistic updates...

```
Tự viết fetch trong useEffect:
✗ Không cache → fetch lại mỗi lần mount
✗ Không dedup → 5 components cùng fetch 1 API = 5 requests
✗ Race condition → user chuyển trang nhanh
✗ Không background refetch
✗ Boilerplate loading/error state lặp lại

Dùng TanStack Query:
✓ Cache tự động
✓ Dedup requests
✓ Background refetch
✓ Stale-while-revalidate
✓ Retry, pagination, infinite scroll
✓ Optimistic updates
```

---

## 2. TanStack Query (React Query)

### Cài đặt

```bash
npm install @tanstack/react-query
# Optional: devtools
npm install @tanstack/react-query-devtools
```

### Setup

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data "tươi" trong 5 phút
      gcTime: 10 * 60 * 1000,      // Giữ cache 10 phút
      retry: 3,                     // Retry 3 lần khi fail
      refetchOnWindowFocus: true,   // Refetch khi user quay lại tab
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 3. useQuery - Đọc data

### Cơ bản

```jsx
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const {
    data,           // Response data
    isLoading,      // Lần đầu load (chưa có cache)
    isFetching,     // Đang fetch (cả background refetch)
    isError,        // Có lỗi
    error,          // Error object
    isSuccess,      // Thành công
    refetch,        // Hàm refetch thủ công
  } = useQuery({
    queryKey: ["users"],             // Unique key để cache
    queryFn: () =>                   // Hàm fetch data
      fetch("/api/users").then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Query Key

```jsx
// Query key = identity của cache entry
// Key khác nhau = cache khác nhau

useQuery({ queryKey: ["users"], ... })              // Tất cả users
useQuery({ queryKey: ["users", userId], ... })      // User cụ thể
useQuery({ queryKey: ["users", { role: "admin" }], ... }) // Users filtered
useQuery({ queryKey: ["posts", postId, "comments"], ... }) // Comments của post

// Khi key thay đổi → tự động refetch!
function UserDetail({ userId }) {
  const { data } = useQuery({
    queryKey: ["users", userId],  // userId đổi → fetch user mới
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });
  // ...
}
```

### Dependent Queries

```jsx
function UserPosts({ userId }) {
  // Query 1: Fetch user
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

  // Query 2: Fetch posts CHỈ KHI có user
  const { data: posts } = useQuery({
    queryKey: ["posts", { authorId: user?.id }],
    queryFn: () => fetchPostsByAuthor(user.id),
    enabled: !!user, // Chỉ chạy khi user đã load xong
  });

  // ...
}
```

---

## 4. useMutation - Ghi data

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      }).then(res => res.json()),

    onSuccess: (data) => {
      // Invalidate cache → tự động refetch danh sách posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Hoặc update cache trực tiếp
      // queryClient.setQueryData(["posts"], old => [...old, data]);
    },

    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      title: "New Post",
      content: "Hello world",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creating..." : "Create Post"}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Post created!</p>}
    </form>
  );
}
```

### Optimistic Updates

```jsx
const mutation = useMutation({
  mutationFn: updateTodo,

  onMutate: async (updatedTodo) => {
    // 1. Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    // 2. Lưu state cũ (để rollback)
    const previousTodos = queryClient.getQueryData(["todos"]);

    // 3. Optimistic update - cập nhật UI ngay
    queryClient.setQueryData(["todos"], old =>
      old.map(todo =>
        todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
      )
    );

    return { previousTodos }; // Context cho onError
  },

  onError: (err, updatedTodo, context) => {
    // 4. Rollback nếu fail
    queryClient.setQueryData(["todos"], context.previousTodos);
  },

  onSettled: () => {
    // 5. Refetch để đồng bộ với server
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

---

## 5. Pagination

```jsx
function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["posts", { page }],
    queryFn: () => fetch(`/api/posts?page=${page}&limit=10`).then(r => r.json()),
    placeholderData: (previousData) => previousData, // Giữ data cũ khi đang fetch trang mới
  });

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
          {data.posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}

      <div>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Infinite Scroll

```jsx
import { useInfiniteQuery } from "@tanstack/react-query";

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam }) =>
      fetch(`/api/posts?cursor=${pageParam}&limit=20`).then(r => r.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
          ? "Load More"
          : "No more posts"}
      </button>
    </div>
  );
}
```

---

## 6. Custom Hooks pattern

```jsx
// hooks/useUsers.js - Tách query logic ra custom hook
function useUsers(filters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

function useUser(userId) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(["users", id], data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Sử dụng - component cực sạch!
function UserManager() {
  const { data: users, isLoading } = useUsers({ role: "admin" });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onUpdate={(data) => updateUser.mutate({ id: user.id, data })}
        />
      ))}
      <button onClick={() => createUser.mutate({ name: "New User" })}>
        Add User
      </button>
    </div>
  );
}
```

---

## 7. SWR (Alternative)

SWR (Stale-While-Revalidate) của Vercel - đơn giản hơn React Query.

```bash
npm install swr
```

```jsx
import useSWR from "swr";

const fetcher = (url) => fetch(url).then(r => r.json());

function UserList() {
  const { data, error, isLoading, mutate } = useSWR("/api/users", fetcher);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <ul>
      {data.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### So sánh TanStack Query vs SWR

| Feature | TanStack Query | SWR |
|---------|---------------|-----|
| Bundle size | ~13kb | ~4kb |
| Mutations | `useMutation` (mạnh) | `mutate` (đơn giản) |
| Devtools | Có | Community |
| Infinite scroll | `useInfiniteQuery` | `useSWRInfinite` |
| Offline support | Tốt | Cơ bản |
| Optimistic updates | Built-in | Manual |
| Pagination | `placeholderData` | Tương tự |

**Recommendation:** TanStack Query cho app phức tạp, SWR cho app đơn giản.

---

## 8. Caching Flow

```
User vào trang /users lần đầu:
  1. isLoading = true (chưa có cache)
  2. Fetch /api/users
  3. Lưu vào cache với key ["users"]
  4. isLoading = false, data = [...]

User chuyển sang trang khác, rồi quay lại /users:
  5. Data từ cache hiển thị NGAY (stale data)
  6. Background refetch /api/users
  7. Nếu data mới ≠ cũ → cập nhật UI
  8. Nếu giống → không làm gì

Sau staleTime (ví dụ 5 phút):
  9. Data đánh dấu "stale"
  10. Lần sau truy cập → refetch

Sau gcTime (garbage collection):
  11. Cache bị xóa
  12. Lần sau → isLoading = true (fetch từ đầu)
```

---

## 9. Bài tập

1. Fetch và hiển thị danh sách users với `useQuery` (loading, error states)
2. CRUD Todo app với `useMutation` + cache invalidation
3. Paginated product listing với page navigation
4. Infinite scroll news feed với `useInfiniteQuery`
5. Optimistic update cho like/unlike button
