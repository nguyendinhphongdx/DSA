# Lazy-loading, Circular dependency

## 8. Circular Dependency giua Modules

### 8.1. Van de

Circular dependency xay ra khi Module A import Module B va Module B cung import Module A:

```
ModuleA ──imports──> ModuleB
   ^                    │
   └────imports─────────┘
```

```typescript
// LOI: Circular dependency!
// users.module.ts
@Module({
  imports: [PostsModule], // UsersModule import PostsModule
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// posts.module.ts
@Module({
  imports: [UsersModule], // PostsModule import UsersModule
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

### 8.2. Giai phap: forwardRef()

```typescript
import { Module, forwardRef } from '@nestjs/common';

// === users/users.module.ts ===
@Module({
  imports: [forwardRef(() => PostsModule)], // Su dung forwardRef
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// === posts/posts.module.ts ===
@Module({
  imports: [forwardRef(() => UsersModule)], // Su dung forwardRef
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

**Trong Service cung can forwardRef:**

```typescript
// === users/users.service.ts ===
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  async getUserWithPosts(userId: number) {
    const posts = await this.postsService.findByUserId(userId);
    return { userId, posts };
  }
}

// === posts/posts.service.ts ===
@Injectable()
export class PostsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getPostWithAuthor(postId: number) {
    // ...logic
  }
}
```

### 8.3. Giai phap tot hon: Tranh Circular Dependency

```
Thay vi:
  UsersModule <──> PostsModule

Nen tao module trung gian:
  UsersModule ──> SharedModule <── PostsModule
```

```typescript
// === shared/user-posts-shared.module.ts ===
@Module({
  providers: [UserPostsRelationService],
  exports: [UserPostsRelationService],
})
export class UserPostsSharedModule {}

// === users/users.module.ts ===
@Module({
  imports: [UserPostsSharedModule],
  providers: [UsersService],
})
export class UsersModule {}

// === posts/posts.module.ts ===
@Module({
  imports: [UserPostsSharedModule],
  providers: [PostsService],
})
export class PostsModule {}
```

---

## 9. Lazy-loading Modules

### 9.1. Khai niem

Mac dinh, NestJS load tat ca modules khi ung dung khoi dong. Voi ung dung lon, dieu nay co the anh huong den **startup time**. Lazy-loading cho phep load modules **theo yeu cau** (on-demand).

### 9.2. Su dung LazyModuleLoader

```typescript
import { Injectable } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class AppService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async generateReport() {
    // Module chi duoc load khi can
    // Lan goi dau tien se load module
    // Cac lan sau se dung cached instance
    const { ReportModule } = await import('./report/report.module');
    const moduleRef = await this.lazyModuleLoader.load(() => ReportModule);

    // Lay service tu lazy-loaded module
    const { ReportService } = await import('./report/report.service');
    const reportService = moduleRef.get(ReportService);

    return reportService.generate();
  }
}
```

### 9.3. Luu y ve Lazy-loading

```typescript
// Lazy-loaded modules KHONG THE:
// 1. Dang ky controllers (routes)
// 2. Dang ky middleware
// 3. Dang ky health indicators

// Lazy-loaded modules CO THE:
// 1. Cung cap providers/services
// 2. Duoc dung cho background tasks
// 3. Duoc dung cho CRON jobs
// 4. Worker processes
// 5. Report generation

// Vi du: Module cho heavy computation
@Module({
  providers: [
    HeavyComputationService,
    DataAnalyticsService,
    PdfGeneratorService,
  ],
  exports: [
    HeavyComputationService,
    DataAnalyticsService,
    PdfGeneratorService,
  ],
})
export class HeavyTaskModule {}
```

### 9.4. Vi du thuc te: Lazy-load Analytics Module

```typescript
// === analytics/analytics.module.ts ===
@Module({
  providers: [AnalyticsService, ChartGeneratorService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

// === analytics/analytics.service.ts ===
@Injectable()
export class AnalyticsService {
  generateDashboard(data: any[]) {
    // Heavy computation...
    return { charts: [], summary: {} };
  }
}

// === reports/reports.service.ts ===
@Injectable()
export class ReportsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  async getAnalyticsReport(dateRange: { from: Date; to: Date }) {
    // Chi load AnalyticsModule khi can tao report
    const { AnalyticsModule } = await import('../analytics/analytics.module');
    const moduleRef = await this.lazyModuleLoader.load(() => AnalyticsModule);

    const { AnalyticsService } = await import('../analytics/analytics.service');
    const analyticsService = moduleRef.get(AnalyticsService);

    const rawData = await this.fetchData(dateRange);
    return analyticsService.generateDashboard(rawData);
  }

  private async fetchData(dateRange: { from: Date; to: Date }) {
    // Fetch data from database...
    return [];
  }
}
```
