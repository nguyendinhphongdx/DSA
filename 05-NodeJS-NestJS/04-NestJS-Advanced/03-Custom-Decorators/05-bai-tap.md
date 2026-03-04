# Bai tap - Custom Decorators

## 12. Bai tap

### Bai tap 1: @CurrentUser() Decorator
Tao decorator `@CurrentUser()` ho tro:
- `@CurrentUser()` - tra ve toan bo user object
- `@CurrentUser('id')` - tra ve chi field id
- `@CurrentUser('email')` - tra ve chi field email
- Type safe voi interface `UserPayload`
- Viet unit test cho decorator

### Bai tap 2: @Pagination() Decorator
Tao decorator `@Pagination()` extract thong tin phan trang tu query params:
- Ho tro: page, limit, sortBy, sortOrder
- Co gia tri mac dinh: page=1, limit=10, sortOrder=DESC
- Validate: page >= 1, 1 <= limit <= 100
- Tra ve ca `offset` (tinh tu page va limit)
- Ket hop voi Pipe de validate

### Bai tap 3: @Auth() Composed Decorator
Tao decorator `@Auth()` ket hop:
- `@UseGuards(JwtAuthGuard, RolesGuard)`
- `@Roles(...roles)`
- Swagger decorators: `@ApiBearerAuth()`, `@ApiUnauthorizedResponse()`
- Neu truyen `@Auth()` khong co roles => chi can xac thuc, khong kiem tra role

```typescript
// Muc tieu su dung:
@Auth(Role.ADMIN) // Can dang nhap + phai la admin
@Auth() // Chi can dang nhap
```

### Bai tap 4: @ValidatedBody() Decorator
Tao decorator parameter ket hop validation:
- Nhan vao DTO class
- Tu dong validate body theo DTO
- Throw BadRequestException voi thong bao loi chi tiet
- Ho tro ca nested objects

### Bai tap 5: Bo Decorator hoan chinh
Tao bo decorators cho mot e-commerce API:
1. `@CurrentUser()` - Lay user hien tai
2. `@Pagination()` - Phan trang
3. `@Sorting()` - Sap xep
4. `@Filtering()` - Loc du lieu
5. `@Auth()` - Xac thuc + phan quyen
6. `@ApiEndpoint()` - Gom Swagger docs
7. `@CacheResponse()` - Cache voi TTL tuy chinh

Ap dung toan bo vao `ProductsController` va test.

---

## Tai lieu tham khao

- [NestJS Custom Decorators Documentation](https://docs.nestjs.com/custom-decorators)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [NestJS Execution Context](https://docs.nestjs.com/fundamentals/execution-context)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [Swagger/OpenAPI in NestJS](https://docs.nestjs.com/openapi/introduction)
