# Bai tap

## 16. Bai tap

### Bai tap 1: CRUD Controller co ban (Co ban)

Tao `TasksController` voi cac route:

1. `GET /tasks` - Lay danh sach tasks
2. `GET /tasks/:id` - Lay task theo ID
3. `POST /tasks` - Tao task moi
4. `PATCH /tasks/:id` - Cap nhat task
5. `DELETE /tasks/:id` - Xoa task

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  createdAt: Date;
}
```

### Bai tap 2: Query Parameters (Co ban)

Mo rong bai tap 1 voi:

1. `GET /tasks?status=open` - Loc theo status
2. `GET /tasks?search=keyword` - Tim theo title
3. `GET /tasks?page=1&limit=5` - Phan trang
4. `GET /tasks?sortBy=createdAt&order=desc` - Sap xep

### Bai tap 3: DTO va Validation (Trung binh)

Tao DTO cho bai tap 1 voi validation:

1. `CreateTaskDto` - validate title (required, 3-100 chars), description (optional, max 500 chars), status (enum)
2. `UpdateTaskDto` - tat ca fields optional (PartialType)
3. `QueryTaskDto` - validate page (int, min 1), limit (int, 1-50), status (enum), search (string)

### Bai tap 4: Nested Routes (Trung binh)

Tao API cho blog posts voi comments:

1. `GET /posts` - Tat ca posts
2. `GET /posts/:postId` - Chi tiet post
3. `POST /posts` - Tao post
4. `GET /posts/:postId/comments` - Comments cua post
5. `POST /posts/:postId/comments` - Them comment cho post
6. `GET /posts/:postId/comments/:commentId` - Chi tiet comment
7. `DELETE /posts/:postId/comments/:commentId` - Xoa comment

### Bai tap 5: Response Serialization (Nang cao)

Tao User API voi response serialization:

1. Tao `User` entity co: id, name, email, password, role, createdAt
2. Tao `UserResponseDto` voi `@Exclude()` cho password
3. Su dung `ClassSerializerInterceptor` de tu dong loai bo password khoi response
4. API endpoints: GET /users, GET /users/:id, POST /users

### Bai tap 6: Tong hop (Nang cao)

Xay dung REST API cho he thong quan ly khoa hoc:

1. `CoursesController`:
   - `GET /courses` - Danh sach khoa hoc (co phan trang, tim kiem, loc theo category)
   - `GET /courses/:id` - Chi tiet khoa hoc
   - `POST /courses` - Tao khoa hoc (validate DTO)
   - `PATCH /courses/:id` - Cap nhat
   - `DELETE /courses/:id` - Xoa

2. `GET /courses/:id/lessons` - Danh sach bai hoc
3. `POST /courses/:id/lessons` - Them bai hoc
4. `GET /courses/:id/students` - Danh sach hoc vien

5. Redirect: `GET /courses/latest` -> redirect den khoa hoc moi nhat
