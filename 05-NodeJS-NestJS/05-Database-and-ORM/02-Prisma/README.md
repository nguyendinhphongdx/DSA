# Prisma trong NestJS

## Muc luc

- [1. Gioi thieu Prisma](#1-gioi-thieu-prisma)
- [2. Prisma vs TypeORM](#2-prisma-vs-typeorm)
- [3. Cai dat va cau hinh](#3-cai-dat-va-cau-hinh)
- [4. Prisma Schema](#4-prisma-schema)
- [5. Prisma Client - CRUD Operations](#5-prisma-client---crud-operations)
- [6. Relations (Quan he)](#6-relations-quan-he)
- [7. Filtering, Sorting, Pagination](#7-filtering-sorting-pagination)
- [8. Prisma Migrate](#8-prisma-migrate)
- [9. Seeding](#9-seeding)
- [10. Transactions](#10-transactions)
- [11. Raw Queries](#11-raw-queries)
- [12. Prisma Middleware](#12-prisma-middleware)
- [13. Cac loi thuong gap](#13-cac-loi-thuong-gap)
- [14. Bai tap](#14-bai-tap)

---

## 1. Gioi thieu Prisma

**Prisma** la mot ORM the he moi cho Node.js va TypeScript. Khac voi TypeORM (code-first hoac schema-first), Prisma su dung **schema-first approach** voi Prisma Schema Language (PSL) rieng.

**3 thanh phan chinh cua Prisma:**

1. **Prisma Schema** (`schema.prisma`) - Dinh nghia models, relations, datasource
2. **Prisma Client** - Auto-generated, type-safe query builder
3. **Prisma Migrate** - Migration tool dua tren schema

**Uu diem cua Prisma:**

- Type safety tuyet voi - auto-generated types tu schema
- IntelliSense/autocomplete manh me
- Prisma Studio - GUI de xem va chinh sua data
- Schema dang doc va de hieu
- Migration tu dong tu schema changes
- Ho tro PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, CockroachDB

---

## 2. Prisma vs TypeORM

| Tieu chi | Prisma | TypeORM |
|----------|--------|---------|
| Cach dinh nghia schema | File .prisma rieng | Decorators trong TS class |
| Type safety | Tuyet voi (auto-generated) | Tot (nhung can chu y) |
| Learning curve | Thap hon | Cao hon |
| Query API | Prisma Client (declarative) | Repository + QueryBuilder |
| Raw SQL | Ho tro | Ho tro |
| Migrations | Tu dong tu schema diff | Generate hoac viet tay |
| Relations | Khai bao trong schema | Decorators |
| Performance | Nhanh (Rust engine) | Tot |
| Cong dong | Dang phat trien nhanh | Lon va lau doi |

**Khi nao dung Prisma?**
- Du an moi, muon DX (Developer Experience) tot
- Can type safety cao
- Team khong quen SQL/ORM phuc tap

**Khi nao dung TypeORM?**
- Du an da co TypeORM
- Can Active Record pattern
- Can QueryBuilder phuc tap
- Can nhieu tinh nang nang cao (subscribers, custom repository)

---

## 3. Cai dat va cau hinh

### 3.1. Cai dat packages

```bash
# Cai Prisma CLI (devDependency)
npm install -D prisma

# Cai Prisma Client (dependency)
npm install @prisma/client

# Khoi tao Prisma (tao thu muc prisma/ va file schema.prisma)
npx prisma init
```

Sau khi chay `npx prisma init`, ban se co:

```
prisma/
  schema.prisma    # File schema chinh
.env               # File environment variables (chua DATABASE_URL)
```

### 3.2. Cau hinh Prisma Service trong NestJS

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'query' },  // Log queries (development)
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect(); // Ket noi DB khi module init
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Dong ket noi khi module destroy
  }
}
```

```typescript
// prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Cho phep inject PrismaService o bat ky module nao
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
})
export class AppModule {}
```

### 3.3. File .env

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_database?schema=public"
```

---

## 4. Prisma Schema

### 4.1. Cau truc co ban

```prisma
// prisma/schema.prisma

// Datasource - ket noi database
datasource db {
  provider = "postgresql"  // postgresql, mysql, sqlite, sqlserver, mongodb
  url      = env("DATABASE_URL")
}

// Generator - generate Prisma Client
generator client {
  provider = "prisma-client-js"
}

// =====================
// MODELS
// =====================

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?  // ? = nullable
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  profile   Profile?
  posts     Post[]
  comments  Comment[]

  // Mapping - ten bang trong DB khac ten model
  @@map("users")
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  avatar String?
  userId Int     @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  content     String
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  viewCount   Int       @default(0)
  authorId    Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]
  tags     Tag[]     // Implicit many-to-many

  // Indexes
  @@index([authorId])
  @@index([slug])
  @@index([createdAt])
  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  userId    Int
  parentId  Int?     // Self-referencing relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  post     Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([userId])
  @@map("comments")
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts Post[] // Implicit many-to-many

  @@map("tags")
}

// Enum
enum Role {
  ADMIN
  MODERATOR
  USER
}
```

### 4.2. Column types va attributes

```prisma
model Product {
  id          Int      @id @default(autoincrement())

  // String types
  name        String   // varchar(191) mac dinh
  sku         String   @db.VarChar(50)   // varchar(50) cu the
  description String   @db.Text          // text type
  code        String   @db.Char(10)      // char(10)

  // Number types
  price       Decimal  @db.Decimal(10, 2) // decimal chinh xac
  quantity    Int      @default(0)
  rating      Float    @default(0)
  bigNumber   BigInt

  // Boolean
  isAvailable Boolean  @default(true)

  // Date/Time
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  releaseDate DateTime @db.Date

  // JSON
  metadata    Json     @default("{}")
  tags        String[] // Array type (PostgreSQL only)

  // UUID
  uuid        String   @id @default(uuid())

  // CUID
  cuid        String   @id @default(cuid())

  // Unique constraints
  @@unique([name, sku]) // Composite unique
  @@index([price, isAvailable]) // Composite index
  @@map("products")
}
```

### 4.3. Explicit many-to-many

```prisma
// Khi ban can them truong vao bang trung gian
model Post {
  id         Int         @id @default(autoincrement())
  title      String
  postTags   PostTag[]   // Su dung model trung gian

  @@map("posts")
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  postTags PostTag[] // Su dung model trung gian

  @@map("tags")
}

// Bang trung gian tuong minh
model PostTag {
  postId    Int
  tagId     Int
  createdAt DateTime @default(now())
  createdBy Int?     // Truong them vao

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId]) // Composite primary key
  @@map("post_tags")
}
```

---

## 5. Prisma Client - CRUD Operations

Sau khi dinh nghia schema, generate Prisma Client:

```bash
npx prisma generate
```

### 5.1. Service su dung Prisma Client

```typescript
// users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== CREATE =====

  async create(dto: CreateUserDto) {
    // Kiem tra email trung
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email da ton tai');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        // Tao profile cung luc (nested create)
        profile: {
          create: {
            bio: dto.bio,
          },
        },
      },
      // Chon fields tra ve
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  // Tao nhieu records
  async createMany(dtos: CreateUserDto[]) {
    return this.prisma.user.createMany({
      data: dtos.map((dto) => ({
        email: dto.email,
        name: dto.name,
        password: dto.password,
      })),
      skipDuplicates: true, // Bo qua records bi trung
    });
  }

  // ===== READ =====

  // Lay tat ca
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  // Lay 1 record
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} khong ton tai`);
    }

    return user;
  }

  // Lay record dau tien thoa man dieu kien
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
    });
  }

  // ===== UPDATE =====

  async update(id: number, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          // Nested update - cap nhat profile
          profile: dto.bio
            ? {
                upsert: {
                  create: { bio: dto.bio },
                  update: { bio: dto.bio },
                },
              }
            : undefined,
        },
        include: { profile: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User #${id} khong ton tai`);
        }
      }
      throw error;
    }
  }

  // Upsert - tao moi hoac cap nhat
  async upsert(email: string, data: CreateUserDto) {
    return this.prisma.user.upsert({
      where: { email },
      create: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
      update: {
        name: data.name,
      },
    });
  }

  // Update nhieu records
  async deactivateInactiveUsers() {
    return this.prisma.user.updateMany({
      where: {
        isActive: true,
        posts: {
          none: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 ngay
            },
          },
        },
      },
      data: {
        isActive: false,
      },
    });
  }

  // ===== DELETE =====

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User #${id} khong ton tai`);
        }
      }
      throw error;
    }
  }

  // Xoa nhieu records
  async removeInactive() {
    return this.prisma.user.deleteMany({
      where: { isActive: false },
    });
  }
}
```

### 5.2. Select vs Include

```typescript
// SELECT - chi lay cac truong can thiet (KHONG the ket hop voi include)
const user = await this.prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    name: true,
    profile: {
      select: {
        bio: true,
        avatar: true,
      },
    },
  },
});
// Ket qua: { id: 1, email: '...', name: '...', profile: { bio: '...', avatar: '...' } }

// INCLUDE - lay tat ca truong cua model + relations
const user = await this.prisma.user.findUnique({
  where: { id: 1 },
  include: {
    profile: true,
    posts: true,
    _count: {
      select: { posts: true, comments: true },
    },
  },
});
// Ket qua: { id, email, name, password, role, ..., profile: {...}, posts: [...], _count: { posts: 5, comments: 10 } }
```

---

## 6. Relations (Quan he)

### 6.1. One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile? // Optional 1-1
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique // @unique bat buoc cho 1-1
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```typescript
// Tao user kem profile
const user = await this.prisma.user.create({
  data: {
    email: 'test@example.com',
    profile: {
      create: { bio: 'Hello World' },
    },
  },
  include: { profile: true },
});

// Cap nhat profile cua user
const user = await this.prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      update: { bio: 'Updated bio' },
    },
  },
});
```

### 6.2. One-to-Many

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  title    String
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

```typescript
// Tao post cho user
const post = await this.prisma.post.create({
  data: {
    title: 'Bai viet moi',
    content: 'Noi dung...',
    author: {
      connect: { id: userId }, // Ket noi voi user da ton tai
    },
  },
});

// Hoac dung authorId truc tiep
const post = await this.prisma.post.create({
  data: {
    title: 'Bai viet moi',
    content: 'Noi dung...',
    authorId: userId,
  },
});

// Lay user kem posts
const userWithPosts = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: {
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { tags: true },
    },
  },
});
```

### 6.3. Many-to-Many

```prisma
// Implicit many-to-many (Prisma tu dong tao bang trung gian)
model Post {
  id   Int    @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

```typescript
// Tao post voi tags
const post = await this.prisma.post.create({
  data: {
    title: 'NestJS Prisma Guide',
    content: 'Noi dung...',
    authorId: 1,
    tags: {
      // Tao tags moi
      create: [{ name: 'nestjs', slug: 'nestjs' }],
      // Hoac ket noi voi tags da co
      connect: [{ id: 1 }, { id: 2 }],
      // Hoac dung connectOrCreate
      connectOrCreate: [
        {
          where: { name: 'typescript' },
          create: { name: 'typescript', slug: 'typescript' },
        },
      ],
    },
  },
  include: { tags: true },
});

// Them tag vao post
const post = await this.prisma.post.update({
  where: { id: postId },
  data: {
    tags: {
      connect: { id: tagId },
    },
  },
});

// Xoa tag khoi post
const post = await this.prisma.post.update({
  where: { id: postId },
  data: {
    tags: {
      disconnect: { id: tagId },
    },
  },
});

// Set lai tat ca tags (xoa het roi them moi)
const post = await this.prisma.post.update({
  where: { id: postId },
  data: {
    tags: {
      set: [{ id: 1 }, { id: 3 }], // Chi giu lai tag 1 va 3
    },
  },
});
```

---

## 7. Filtering, Sorting, Pagination

### 7.1. Filtering

```typescript
// Cac operators
const posts = await this.prisma.post.findMany({
  where: {
    // equals
    isPublished: true,

    // not
    authorId: { not: 1 },

    // in / notIn
    status: { in: ['PUBLISHED', 'DRAFT'] },

    // contains (LIKE '%value%')
    title: { contains: 'nestjs', mode: 'insensitive' }, // case-insensitive

    // startsWith / endsWith
    email: { endsWith: '@gmail.com' },

    // lt, lte, gt, gte
    viewCount: { gte: 100 },
    createdAt: { gte: new Date('2024-01-01') },

    // Relation filters
    author: {
      isActive: true,
      role: 'ADMIN',
    },

    // has (Array - chi PostgreSQL)
    tags: { has: 'javascript' },
  },
});

// AND, OR, NOT
const posts = await this.prisma.post.findMany({
  where: {
    AND: [
      { isPublished: true },
      { viewCount: { gte: 100 } },
    ],
    OR: [
      { title: { contains: 'nestjs' } },
      { content: { contains: 'nestjs' } },
    ],
    NOT: {
      authorId: 5,
    },
  },
});

// Relation filters nang cao
const users = await this.prisma.user.findMany({
  where: {
    // Co it nhat 1 post published
    posts: {
      some: { isPublished: true },
    },
    // Tat ca posts deu published
    // posts: { every: { isPublished: true } },
    // Khong co post nao
    // posts: { none: {} },
  },
});
```

### 7.2. Sorting

```typescript
const posts = await this.prisma.post.findMany({
  orderBy: [
    { isPublished: 'desc' },   // Published truoc
    { createdAt: 'desc' },      // Moi nhat truoc
  ],
});

// Sort theo relation
const users = await this.prisma.user.findMany({
  orderBy: {
    posts: { _count: 'desc' }, // User co nhieu post nhat
  },
});

// Sort theo aggregation
const posts = await this.prisma.post.findMany({
  orderBy: {
    comments: { _count: 'desc' },
  },
});

// Null first / Null last (Prisma 4.16+)
const users = await this.prisma.user.findMany({
  orderBy: {
    name: { sort: 'asc', nulls: 'last' },
  },
});
```

### 7.3. Pagination

```typescript
// Offset pagination
async findPaginated(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prisma.post.findMany({
      where: { isPublished: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
    this.prisma.post.count({
      where: { isPublished: true },
    }),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

// Cursor-based pagination (hieu qua hon voi dataset lon)
async findWithCursor(cursor?: number, limit: number = 10) {
  const items = await this.prisma.post.findMany({
    take: limit + 1, // Lay them 1 de biet co trang tiep khong
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Bo qua record tai cursor
    }),
    where: { isPublished: true },
    orderBy: { id: 'desc' },
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
  });

  const hasNext = items.length > limit;
  if (hasNext) items.pop(); // Bo record thua

  return {
    items,
    nextCursor: hasNext ? items[items.length - 1].id : null,
    hasNext,
  };
}
```

---

## 8. Prisma Migrate

### 8.1. Cac lenh co ban

```bash
# Tao migration tu schema changes (development)
npx prisma migrate dev --name init
npx prisma migrate dev --name add_phone_to_users

# Ap dung migration (production)
npx prisma migrate deploy

# Reset database (XOA het data + chay lai tat ca migrations)
npx prisma migrate reset

# Xem trang thai migration
npx prisma migrate status

# Tao migration nhung KHONG chay (de review truoc)
npx prisma migrate dev --create-only

# Generate Prisma Client (khong chay migration)
npx prisma generate

# Mo Prisma Studio (GUI xem data)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema tu database co san (database-first)
npx prisma db pull

# Push schema len database (khong tao migration file - dung cho prototype)
npx prisma db push
```

### 8.2. Workflow migration

```bash
# 1. Sua schema.prisma (them model, sua column, v.v.)

# 2. Tao migration
npx prisma migrate dev --name describe_your_changes

# Migration file duoc tao tai: prisma/migrations/20240101000000_describe_your_changes/migration.sql

# 3. Review migration SQL duoc generate
# 4. Commit migration files vao git
# 5. Deploy: npx prisma migrate deploy (chay tren production)
```

### 8.3. Vi du migration SQL duoc generate

```sql
-- prisma/migrations/20240101000000_init/migration.sql

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

---

## 9. Seeding

### 9.1. Setup Seed

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### 9.2. Viet Seed File

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Bat dau seeding...');

  // Xoa data cu (thu tu quan trong vi foreign keys)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  // Tao tags
  const tags = await Promise.all(
    ['nestjs', 'typescript', 'prisma', 'nodejs', 'javascript'].map((name) =>
      prisma.tag.create({
        data: { name, slug: name.toLowerCase() },
      }),
    ),
  );
  console.log(`Da tao ${tags.length} tags`);

  // Tao admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          bio: 'System Administrator',
          avatar: 'https://example.com/admin.jpg',
        },
      },
    },
  });
  console.log(`Da tao admin: ${admin.email}`);

  // Tao users
  const userPassword = await bcrypt.hash('user123', 10);
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          name: `User ${i + 1}`,
          password: userPassword,
          role: Role.USER,
          profile: {
            create: {
              bio: `Bio cua User ${i + 1}`,
            },
          },
        },
      }),
    ),
  );
  console.log(`Da tao ${users.length} users`);

  // Tao posts
  const allUsers = [admin, ...users];
  const posts = [];
  for (let i = 0; i < 30; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    const post = await prisma.post.create({
      data: {
        title: `Bai viet so ${i + 1}`,
        slug: `bai-viet-so-${i + 1}`,
        content: `Noi dung chi tiet cua bai viet so ${i + 1}. Day la noi dung mau de test.`,
        isPublished: Math.random() > 0.3,
        viewCount: Math.floor(Math.random() * 1000),
        authorId: randomUser.id,
        tags: {
          connect: randomTags.map((t) => ({ id: t.id })),
        },
      },
    });
    posts.push(post);
  }
  console.log(`Da tao ${posts.length} posts`);

  // Tao comments
  let commentCount = 0;
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 5);
    for (let i = 0; i < numComments; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      await prisma.comment.create({
        data: {
          content: `Comment ${i + 1} cho bai viet: ${post.title}`,
          postId: post.id,
          userId: randomUser.id,
        },
      });
      commentCount++;
    }
  }
  console.log(`Da tao ${commentCount} comments`);

  console.log('Seeding hoan tat!');
}

main()
  .catch((e) => {
    console.error('Loi khi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# Chay seed
npx prisma db seed

# Hoac chay kem voi migrate reset
npx prisma migrate reset  # Tu dong chay seed sau khi reset
```

---

## 10. Transactions

### 10.1. Sequential Operations

```typescript
// Prisma tu dong wrap trong transaction
const [post, user] = await this.prisma.$transaction([
  this.prisma.post.create({
    data: { title: 'New Post', content: '...', authorId: 1 },
  }),
  this.prisma.user.update({
    where: { id: 1 },
    data: { postCount: { increment: 1 } },
  }),
]);
```

### 10.2. Interactive Transactions

```typescript
// Interactive transaction - co the dung logic phuc tap
async transfer(fromId: number, toId: number, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    // tx la Prisma Client trong context transaction

    // Kiem tra so du
    const sender = await tx.account.findUnique({
      where: { id: fromId },
    });

    if (!sender || sender.balance < amount) {
      throw new Error('So du khong du');
    }

    // Tru tien nguoi gui
    const updatedSender = await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    // Cong tien nguoi nhan
    const updatedReceiver = await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    // Tao log
    await tx.transactionLog.create({
      data: {
        fromAccountId: fromId,
        toAccountId: toId,
        amount,
        type: 'TRANSFER',
      },
    });

    return { sender: updatedSender, receiver: updatedReceiver };
  }, {
    maxWait: 5000,      // Thoi gian doi toi da de bat dau transaction
    timeout: 10000,     // Thoi gian toi da cho transaction
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

// Tao order voi transaction
async createOrder(dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    // Tao order
    const order = await tx.order.create({
      data: {
        userId: dto.userId,
        status: 'PENDING',
      },
    });

    let totalPrice = 0;

    // Tao order items va kiem tra stock
    for (const item of dto.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stock < item.quantity) {
        throw new Error(`San pham ${product?.name || item.productId} khong du hang`);
      }

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        },
      });

      // Giam stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      totalPrice += Number(product.price) * item.quantity;
    }

    // Cap nhat tong tien
    return tx.order.update({
      where: { id: order.id },
      data: { totalPrice },
      include: { items: { include: { product: true } } },
    });
  });
}
```

---

## 11. Raw Queries

Khi can viet SQL truc tiep (query phuc tap, performance critical).

```typescript
// Query SELECT
const users = await this.prisma.$queryRaw<User[]>`
  SELECT * FROM users
  WHERE role = ${role}
  AND created_at > ${startDate}
  ORDER BY created_at DESC
  LIMIT ${limit}
`;

// Query voi template tag (tu dong parameterize - chong SQL injection)
const searchTerm = '%nestjs%';
const posts = await this.prisma.$queryRaw`
  SELECT p.*, u.name as author_name,
         COUNT(c.id) as comment_count
  FROM posts p
  JOIN users u ON p.author_id = u.id
  LEFT JOIN comments c ON c.post_id = p.id
  WHERE p.title ILIKE ${searchTerm}
    AND p.is_published = true
  GROUP BY p.id, u.name
  HAVING COUNT(c.id) > 0
  ORDER BY comment_count DESC
`;

// Execute (INSERT, UPDATE, DELETE)
const result = await this.prisma.$executeRaw`
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = ${postId}
`;
console.log(`${result} rows updated`);

// Dung Prisma.sql cho dynamic queries
import { Prisma } from '@prisma/client';

const orderBy = Prisma.sql`ORDER BY created_at DESC`;
const whereClause = isPublished
  ? Prisma.sql`AND is_published = true`
  : Prisma.empty;

const posts = await this.prisma.$queryRaw`
  SELECT * FROM posts
  WHERE author_id = ${authorId}
  ${whereClause}
  ${orderBy}
  LIMIT ${limit}
`;

// Query raw KHONG typed (Prisma.raw - dung can than)
const result = await this.prisma.$queryRawUnsafe(
  'SELECT * FROM users WHERE email = $1',
  email,
);
```

---

## 12. Prisma Middleware

Middleware cho phep ban chen logic vao truoc/sau moi Prisma query.

### 12.1. Logging Middleware

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Logging middleware
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      this.logger.log(
        `Query ${params.model}.${params.action} took ${after - before}ms`,
      );

      return result;
    });

    await this.$connect();
  }
}
```

### 12.2. Soft Delete Middleware

```typescript
// Middleware tu dong xu ly soft delete
this.$use(async (params, next) => {
  // Filter: tu dong bo qua records da soft delete
  if (params.model === 'Post') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    if (params.action === 'findMany') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    // Convert delete thanh soft delete
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (!params.args.data) params.args.data = {};
      params.args.data.deletedAt = new Date();
    }
  }

  return next(params);
});
```

### 12.3. Prisma Client Extensions (Prisma 4.16+)

```typescript
// Cach moi - su dung extensions thay vi middleware
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async create({ args, query }) {
        // Hash password truoc khi create
        if (args.data.password) {
          args.data.password = await bcrypt.hash(args.data.password, 10);
        }
        return query(args);
      },
    },
  },
  model: {
    user: {
      // Them method moi vao model
      async findByEmail(email: string) {
        return prisma.user.findFirst({ where: { email } });
      },
      async softDelete(id: number) {
        return prisma.user.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      },
    },
  },
  result: {
    user: {
      // Computed field
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },
});
```

---

## 13. Cac loi thuong gap

### Loi 1: Quen generate Prisma Client

```bash
# Sau moi lan thay doi schema.prisma, PHAI generate lai
npx prisma generate

# Loi thuong gap: "Property 'xxx' does not exist on type 'PrismaClient'"
# => Do chua generate lai Prisma Client sau khi them model moi
```

### Loi 2: N+1 Query Problem

```typescript
// SAI - N+1 queries
const posts = await this.prisma.post.findMany();
for (const post of posts) {
  const author = await this.prisma.user.findUnique({
    where: { id: post.authorId },
  });
  post.author = author;
}

// DUNG - Su dung include
const posts = await this.prisma.post.findMany({
  include: { author: true },
});
```

### Loi 3: Khong xu ly Prisma errors

```typescript
// SAI
await this.prisma.user.create({ data: { email: existingEmail } });
// => Throw PrismaClientKnownRequestError P2002 (unique constraint)

// DUNG
try {
  await this.prisma.user.create({ data: { email } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        throw new ConflictException('Email da ton tai');
      case 'P2025': // Record not found
        throw new NotFoundException('Khong tim thay record');
      case 'P2003': // Foreign key constraint failed
        throw new BadRequestException('Foreign key khong hop le');
      default:
        throw error;
    }
  }
  throw error;
}
```

### Loi 4: Select va Include cung luc

```typescript
// SAI - Khong the dung ca select va include tren cung 1 level
const user = await this.prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true },
  include: { posts: true }, // LOI!
});

// DUNG - Dung select cho tat ca
const user = await this.prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    posts: true, // Select relation
  },
});
```

### Loi 5: DateTime timezone

```typescript
// Prisma luu DateTime dang UTC
// Khi hien thi, can chuyen ve timezone local

// Schema
model Event {
  startTime DateTime
}

// Khi tao
await this.prisma.event.create({
  data: {
    startTime: new Date('2024-03-15T10:00:00+07:00'), // Prisma tu dong chuyen sang UTC
  },
});

// Khi doc ra -> Date object (UTC) -> can convert o client
```

---

## 14. Bai tap

### Bai tap 1: Blog API voi Prisma

Xay dung mot Blog API day du:

1. Viet Prisma schema cho: User, Profile, Post, Comment, Tag, Category
2. Implement CRUD service cho moi model
3. Pagination voi ca offset-based va cursor-based
4. Full-text search cho posts
5. Filter posts theo: tag, category, author, date range

### Bai tap 2: Nested Operations

Thuc hanh cac thao tac nested:

1. Tao user kem profile va 3 posts, moi post co 2 tags
2. Cap nhat user: doi name, cap nhat bio trong profile, them 1 post moi
3. Xoa 1 tag khoi post, them 2 tags moi
4. Lay user kem so luong posts, so luong comments, va 5 posts moi nhat

### Bai tap 3: Transactions

Implement cac chuc nang can transaction:

1. **Dat hang**: Tao order, tao order items, giam stock, tinh tong tien
2. **Like bai viet**: Tang like count, tao record trong bang likes, gui notification
3. **Xoa tai khoan**: Soft delete user, anonymize comments, unpublish posts

### Bai tap 4: Advanced Queries

1. Thong ke top 10 tags duoc dung nhieu nhat kem so bai
2. Lay cac bai viet "trending" (nhieu views trong 7 ngay qua)
3. Leaderboard - xep hang users theo tong so likes tren tat ca posts
4. Monthly report - so bai viet, so comments, so users moi theo tung thang
5. Viet raw query de full-text search voi PostgreSQL tsvector

### Bai tap 5: Migration va Seeding

1. Tao schema cho e-commerce: Product, Category, Order, OrderItem, User, Review
2. Viet migration files
3. Viet seed file tao 100 products, 10 categories, 50 orders voi random data
4. Thuc hanh: them truong moi vao model, tao migration, chay migration
5. Thuc hanh: rollback migration, sua lai, chay lai

---

> **Tai lieu tham khao:**
> - [Prisma Documentation](https://www.prisma.io/docs)
> - [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
> - [Prisma GitHub](https://github.com/prisma/prisma)
> - [Prisma Examples](https://github.com/prisma/prisma-examples)
