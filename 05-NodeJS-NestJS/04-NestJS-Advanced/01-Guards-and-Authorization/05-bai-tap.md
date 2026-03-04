# Bai tap - Guards va Authorization

## 13. Bai tap

### Bai tap 1: Basic Authentication Guard
Tao mot `ApiKeyGuard` kiem tra header `x-api-key` trong request. Neu key hop le (so sanh voi gia tri trong config), cho phep request. Neu khong, tra ve `UnauthorizedException` voi thong bao "API key khong hop le".

**Yeu cau:**
- Guard phai inject `ConfigService` de lay gia tri API key
- Su dung `@UseGuards()` tren controller
- Tao route test de kiem tra

### Bai tap 2: RBAC hoan chinh
Xay dung he thong phan quyen cho mot blog:
- **Admin**: CRUD tat ca bai viet, quan ly users
- **Editor**: Tao va sua bai viet cua minh
- **Viewer**: Chi xem bai viet da publish

**Yeu cau:**
- Tao `Role` enum
- Tao `@Roles()` decorator
- Tao `RolesGuard` su dung `Reflector`
- Ap dung vao `ArticlesController` voi cac route phu hop
- Viet test cho Guard

### Bai tap 3: Permission-based Guard
Tao he thong phan quyen dua tren permissions cu the (khong chi roles):
- Dinh nghia cac permissions: `create:article`, `read:article`, `update:article`, `delete:article`, `manage:user`
- Tao `@RequirePermissions()` decorator
- Tao `PermissionsGuard`
- Moi role co danh sach permissions khac nhau

### Bai tap 4: CASL Integration
Tich hop CASL vao ung dung de thuc hien ABAC:
- User chi duoc sua/xoa bai viet cua chinh minh
- Admin co the quan ly tat ca
- Editor co the duyet (approve) bai viet cua nguoi khac nhung khong xoa
- Tao `CaslAbilityFactory` va `PoliciesGuard`

### Bai tap 5: Guard ket hop
Tao mot he thong authentication/authorization hoan chinh:
1. `JwtAuthGuard` (global) - xac thuc JWT
2. `@Public()` decorator cho routes khong can xac thuc
3. `RolesGuard` (global) - kiem tra role
4. `ThrottleGuard` - gioi han so luong request
5. Tao `AuthModule` day du voi login, register, refresh token

**Goi y:** Dang ky guards theo thu tu trong `AppModule` su dung `APP_GUARD`.

---

## Tai lieu tham khao

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [NestJS Security - Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS Security - Authorization](https://docs.nestjs.com/security/authorization)
- [CASL Documentation](https://casl.js.org/v6/en/)
- [Passport.js Documentation](http://www.passportjs.org/)
