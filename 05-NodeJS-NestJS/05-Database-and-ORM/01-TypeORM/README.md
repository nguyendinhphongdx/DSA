# TypeORM trong NestJS

## Mục lục

- [1. Giới thiệu TypeORM](#1-giới-thiệu-typeorm)
- [2. Cài đặt và cấu hình](#2-cài-đặt-và-cấu-hình)
- [3. Entity Decorators](#3-entity-decorators)
- [4. Column Types](#4-column-types)
- [5. Relations (Quan hệ)](#5-relations-quan-hệ)
- [6. Repository Pattern](#6-repository-pattern)
- [7. Custom Repository](#7-custom-repository)
- [8. QueryBuilder](#8-querybuilder)
- [9. Migrations](#9-migrations)
- [10. Transactions](#10-transactions)
- [11. Subscribers và Listeners](#11-subscribers-và-listeners)
- [12. Active Record vs Data Mapper](#12-active-record-vs-data-mapper)
- [13. Các lỗi thường gặp](#13-các-lỗi-thường-gặp)
- [14. Bài tập](#14-bài-tập)

---

## 1. Giới thiệu TypeORM

**TypeORM** là một ORM (Object-Relational Mapping) cho TypeScript và JavaScript, cho phép bạn tương tác với cơ sở dữ liệu thông qua các đối tượng TypeScript thay vì viết SQL thuần. TypeORM hỗ trợ nhiều database: PostgreSQL, MySQL, MariaDB, SQLite, Oracle, SQL Server, MongoDB.

**Tại sao dùng TypeORM với NestJS?**

- Tích hợp sẵn qua `@nestjs/typeorm` - setup nhanh, cấu hình đơn giản
- Hỗ trợ TypeScript decorators - viết entity rõ ràng, type-safe
- Repository pattern - tách biệt logic truy vấn DB ra khỏi business logic
- Hỗ trợ Migrations - quản lý schema database theo version
- QueryBuilder mạnh mẽ - xây dựng query phức tạp dễ dàng

---

## 2. Cài đặt và cấu hình

### 2.1. Cài đặt packages

```bash
# Cài TypeORM core và NestJS integration
npm install @nestjs/typeorm typeorm

# Cài driver cho database bạn dùng (chọn 1)
npm install pg           # PostgreSQL
npm install mysql2        # MySQL / MariaDB
npm install better-sqlite3 # SQLite
```

### 2.2. Cấu hình trong AppModule

**Cách 1: Cấu hình trực tiếp (synchronous)**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'my_database',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // CHỈ dùng trong development, KHÔNG dùng production!
    }),
  ],
})
export class AppModule {}
```

**Cách 2: Cấu hình bất đồng bộ với ConfigService (Khuyên dùng)**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class AppModule {}
```

**File .env tương ứng:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=my_database
NODE_ENV=development
```

### 2.3. Đăng ký Entity trong Feature Module

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký entity
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 3. Entity Decorators

Entity là class TypeScript đại diện cho một bảng trong database. TypeORM sử dụng decorators để ánh xạ class sang bảng.

### 3.1. @Entity

```typescript
import { Entity } from 'typeorm';

// Tên bảng mặc định = tên class viết thường
@Entity()
export class User {}

// Tùy chỉnh tên bảng
@Entity('users')
export class User {}

// Tùy chỉnh schema (PostgreSQL)
@Entity({ name: 'users', schema: 'public' })
export class User {}
```

### 3.2. @PrimaryGeneratedColumn

```typescript
import { Entity, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  // Auto-increment integer
  @PrimaryGeneratedColumn()
  id: number;

  // UUID tự động generate
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ROWID (dùng cho CockroachDB)
  @PrimaryGeneratedColumn('rowid')
  id: number;
}

// Primary key thủ công (không auto-generate)
@Entity()
export class Country {
  @PrimaryColumn()
  code: string; // VD: 'VN', 'US', 'JP'
}
```

### 3.3. @Column

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ length: 200 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ select: false }) // Không trả về khi query mặc định
  password: string;

  @Column({ name: 'created_at' }) // Tên cột trong DB khác tên property
  createdAt: Date;
}
```

### 3.4. Các decorator đặc biệt

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true }) // Index ở mức entity
@Index(['firstName', 'lastName'])   // Composite index
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index() // Index ở mức column
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Tự động set thời gian tạo
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Tự động cập nhật khi entity thay đổi
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Soft delete - không xóa thật, chỉ đánh dấu
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Tự động tăng khi entity được update (optimistic locking)
  @VersionColumn()
  version: number;
}
```

---

## 4. Column Types

### 4.1. Các kiểu dữ liệu cơ bản

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // String types
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'char', length: 3 })
  currencyCode: string;

  // Number types
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'bigint' })
  viewCount: string; // bigint trả về string trong JS

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'float' })
  rating: number;

  // Boolean
  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  // Date/Time
  @Column({ type: 'date' })
  releaseDate: string;

  @Column({ type: 'timestamptz' })
  publishedAt: Date;

  @Column({ type: 'time' })
  openTime: string;
}
```

### 4.2. Enum type

```typescript
// Cách 1: TypeScript enum
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Cách 2: Simple enum (array of strings)
  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  })
  size: string;
}
```

### 4.3. JSON và Array types

```typescript
@Entity('settings')
export class UserSetting {
  @PrimaryGeneratedColumn()
  id: number;

  // JSON type - lưu object phức tạp
  @Column({ type: 'jsonb', default: {} }) // jsonb cho PostgreSQL (nhanh hơn json)
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };

  // Simple JSON
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Array type (PostgreSQL only)
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'int', array: true, default: [] })
  scores: number[];
}
```

---

## 5. Relations (Quan hệ)

### 5.1. @OneToOne - Quan hệ 1-1

Mỗi User có đúng 1 Profile, mỗi Profile thuộc về đúng 1 User.

```typescript
// entities/profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  website: string;

  // Phía có @JoinColumn sẽ chứa foreign key (userId) trong DB
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn() // Tạo cột userId trong bảng profiles
  user: User;
}

// entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // Phía không có @JoinColumn - inverse side
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,  // Tự động save/update profile khi save user
    eager: false,   // Không tự động load profile khi query user
  })
  profile: Profile;
}
```

**Sử dụng:**

```typescript
// Tạo User kèm Profile (cascade)
const user = new User();
user.email = 'test@example.com';

const profile = new Profile();
profile.bio = 'Hello World';
profile.avatar = 'avatar.jpg';

user.profile = profile;
await this.userRepository.save(user); // Profile cũng được save tự động

// Query với relation
const userWithProfile = await this.userRepository.findOne({
  where: { id: 1 },
  relations: ['profile'], // Load profile
});
```

### 5.2. @OneToMany / @ManyToOne - Quan hệ 1-N

Một User có nhiều Post, mỗi Post thuộc về 1 User.

```typescript
// entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Một user có nhiều posts
  @OneToMany(() => Post, (post) => post.author, {
    cascade: true,
  })
  posts: Post[];
}

// entities/post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Nhiều posts thuộc về một user
  // @ManyToOne luôn chứa foreign key
  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE', // Xóa user -> xóa tất cả posts
  })
  @JoinColumn({ name: 'author_id' }) // Tùy chỉnh tên cột FK
  author: User;

  @Column({ name: 'author_id' })
  authorId: number; // Expose FK để query dễ hơn
}
```

**Sử dụng:**

```typescript
// Tạo post cho user
const post = new Post();
post.title = 'Bài viết đầu tiên';
post.content = 'Nội dung bài viết...';
post.authorId = userId; // Gán trực tiếp FK
await this.postRepository.save(post);

// Query posts của user
const userWithPosts = await this.userRepository.findOne({
  where: { id: userId },
  relations: ['posts'],
});

// Query posts kèm thông tin author
const posts = await this.postRepository.find({
  relations: ['author'],
  where: { isPublished: true },
  order: { createdAt: 'DESC' },
});
```

### 5.3. @ManyToMany - Quan hệ N-N

Một Post có nhiều Tags, một Tag thuộc nhiều Posts.

```typescript
// entities/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}

// entities/post.entity.ts (thêm vào entity Post ở trên)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // @JoinTable chỉ đặt ở MỘT phía (owner side)
  // TypeORM sẽ tự tạo bảng trung gian post_tags
  @ManyToMany(() => Tag, (tag) => tag.posts, {
    cascade: true,
  })
  @JoinTable({
    name: 'post_tags', // Tên bảng trung gian
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
```

**Sử dụng:**

```typescript
// Tạo post với tags
const tag1 = await this.tagRepository.findOneBy({ name: 'nestjs' });
const tag2 = await this.tagRepository.findOneBy({ name: 'typescript' });

const post = new Post();
post.title = 'NestJS TypeORM Guide';
post.tags = [tag1, tag2];
await this.postRepository.save(post);

// Thêm tag vào post đã tồn tại
const post = await this.postRepository.findOne({
  where: { id: postId },
  relations: ['tags'],
});
const newTag = await this.tagRepository.findOneBy({ name: 'database' });
post.tags.push(newTag);
await this.postRepository.save(post);

// Xóa tag khỏi post
post.tags = post.tags.filter((tag) => tag.id !== tagIdToRemove);
await this.postRepository.save(post);

// Query posts theo tag
const posts = await this.postRepository
  .createQueryBuilder('post')
  .innerJoinAndSelect('post.tags', 'tag')
  .where('tag.name = :tagName', { tagName: 'nestjs' })
  .getMany();
```

### 5.4. Self-referencing Relations

Ví dụ: Category cha-con, Comment reply.

```typescript
// entities/category.entity.ts
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Category cha
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category;

  @Column({ nullable: true })
  parentId: number;

  // Các category con
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
```

---

## 6. Repository Pattern

Repository là pattern cung cấp API để truy vấn và thao tác với entity. Trong NestJS + TypeORM, bạn inject `Repository<Entity>` vào service.

### 6.1. Inject Repository

```typescript
// users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
}
```

### 6.2. CRUD Operations

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ===== CREATE =====

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Cách 1: create() + save()
    const user = this.userRepository.create(createUserDto); // Chỉ tạo instance, chưa lưu DB
    return await this.userRepository.save(user); // Lưu vào DB

    // Cách 2: Gộp create + save
    // return await this.userRepository.save(createUserDto);

    // CHÚ Ý: Nên dùng create() trước save() vì create() sẽ:
    // - Validate entity
    // - Trigger hooks (@BeforeInsert, etc.)
    // - Tạo đúng instance của entity class
  }

  // Tạo nhiều records cùng lúc
  async createMany(dtos: CreateUserDto[]): Promise<User[]> {
    const users = this.userRepository.create(dtos);
    return await this.userRepository.save(users);
  }

  // ===== READ =====

  // Lấy tất cả
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Lấy với điều kiện
  async findAllActive(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 10,  // LIMIT
      skip: 0,   // OFFSET
    });
  }

  // Tìm 1 record
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'posts'], // Load relations
    });
    if (!user) {
      throw new NotFoundException(`User #${id} không tồn tại`);
    }
    return user;
  }

  // Tìm theo điều kiện
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'], // Chọn cột cần lấy
    });
  }

  // Đếm records
  async count(): Promise<number> {
    return await this.userRepository.count({
      where: { isActive: true },
    });
  }

  // Kiểm tra tồn tại
  async exists(email: string): Promise<boolean> {
    return await this.userRepository.existsBy({ email });
  }

  // ===== UPDATE =====

  // Cách 1: findOne + save (trigger hooks, trả về entity đầy đủ)
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Throw nếu không tìm thấy
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // Cách 2: update() - Nhanh hơn, KHÔNG trigger hooks
  async updatePartial(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const result = await this.userRepository.update(id, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} không tồn tại`);
    }
  }

  // ===== DELETE =====

  // Hard delete
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user); // Trigger hooks

    // Hoặc dùng delete() - KHÔNG trigger hooks
    // await this.userRepository.delete(id);
  }

  // Soft delete (cần @DeleteDateColumn trong entity)
  async softRemove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);

    // Hoặc
    // await this.userRepository.softDelete(id);
  }

  // Restore soft-deleted
  async restore(id: number): Promise<void> {
    await this.userRepository.restore(id);
  }

  // Query với soft-deleted records
  async findAllWithDeleted(): Promise<User[]> {
    return await this.userRepository.find({
      withDeleted: true, // Bao gồm cả records đã soft delete
    });
  }
}
```

### 6.3. Find Options nâng cao

```typescript
import { In, Between, Like, ILike, IsNull, Not, LessThan, MoreThan } from 'typeorm';

// WHERE với operators
const users = await this.userRepository.find({
  where: {
    role: In([UserRole.ADMIN, UserRole.MODERATOR]),   // IN
    age: Between(18, 65),                             // BETWEEN
    name: Like('%phong%'),                             // LIKE (case-sensitive)
    email: ILike('%@gmail.com'),                       // ILIKE (case-insensitive, PostgreSQL)
    deletedAt: IsNull(),                               // IS NULL
    status: Not(UserStatus.BANNED),                    // NOT
    createdAt: MoreThan(new Date('2024-01-01')),       // >
    score: LessThan(100),                              // <
  },
});

// OR conditions
const users = await this.userRepository.find({
  where: [
    { firstName: 'Phong' },       // OR
    { lastName: 'Phong' },        // OR
    { email: Like('%phong%') },   // OR
  ],
});

// SELECT specific columns
const users = await this.userRepository.find({
  select: {
    id: true,
    email: true,
    profile: {
      id: true,
      avatar: true,
    },
  },
  relations: ['profile'],
});

// ORDER BY
const posts = await this.postRepository.find({
  order: {
    createdAt: 'DESC',
    title: 'ASC',
  },
});

// Pagination
async findPaginated(page: number = 1, limit: number = 10) {
  const [items, total] = await this.userRepository.findAndCount({
    take: limit,
    skip: (page - 1) * limit,
    order: { createdAt: 'DESC' },
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

## 7. Custom Repository

Khi cần tái sử dụng logic query phức tạp, bạn tạo custom repository.

### 7.1. Cách tạo Custom Repository (TypeORM 0.3+)

```typescript
// users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  // Các method tùy chỉnh
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAdmins(): Promise<User[]> {
    return this.find({
      where: { role: UserRole.ADMIN },
    });
  }

  async searchUsers(query: string, page: number, limit: number) {
    const qb = this.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.name ILIKE :query', { query: `%${query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getUserStats() {
    return this.createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();
  }
}
```

### 7.2. Đăng ký và sử dụng

```typescript
// users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserRepository], // Đăng ký repository
  controllers: [UsersController],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}

// users/users.service.ts
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async search(query: string, page: number, limit: number) {
    return this.userRepository.searchUsers(query, page, limit);
  }
}
```

---

## 8. QueryBuilder

QueryBuilder là công cụ mạnh nhất của TypeORM, cho phép bạn xây dựng SQL query phức tạp một cách type-safe.

### 8.1. Select QueryBuilder

```typescript
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // Query cơ bản
  async findPublishedPosts() {
    return this.postRepository
      .createQueryBuilder('post') // alias cho bảng posts
      .where('post.isPublished = :isPublished', { isPublished: true })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  // WHERE phức tạp
  async searchPosts(query: string, authorId?: number) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .where('post.isPublished = true');

    // Thêm điều kiện động
    if (query) {
      qb.andWhere(
        '(post.title ILIKE :query OR post.content ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (authorId) {
      qb.andWhere('post.authorId = :authorId', { authorId });
    }

    return qb
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  // JOIN
  async getPostsWithDetails() {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')          // LEFT JOIN + SELECT
      .leftJoinAndSelect('post.tags', 'tag')                // LEFT JOIN + SELECT
      .leftJoinAndSelect('author.profile', 'profile')       // Nested join
      .innerJoin('post.comments', 'comment')                // INNER JOIN (không select)
      .where('post.isPublished = true')
      .andWhere('author.isActive = true')
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('tag.name', 'ASC')
      .getMany();
  }

  // SELECT cụ thể + Aggregation
  async getPostStats() {
    return this.postRepository
      .createQueryBuilder('post')
      .select('post.authorId', 'authorId')
      .addSelect('author.name', 'authorName')
      .addSelect('COUNT(post.id)', 'postCount')
      .addSelect('AVG(post.viewCount)', 'avgViews')
      .innerJoin('post.author', 'author')
      .where('post.isPublished = true')
      .groupBy('post.authorId')
      .addGroupBy('author.name')
      .having('COUNT(post.id) > :minPosts', { minPosts: 5 })
      .orderBy('postCount', 'DESC')
      .getRawMany(); // getRawMany khi dùng aggregation
  }

  // Pagination
  async getPaginatedPosts(page: number, limit: number) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublished = true')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  // SubQuery
  async getPopularPosts() {
    // Posts có số comment > trung bình
    const subQuery = this.postRepository
      .createQueryBuilder('sub_post')
      .select('AVG(comment_count.count)')
      .from((qb) => {
        return qb
          .select('COUNT(*)', 'count')
          .from('comments', 'c')
          .groupBy('c.post_id');
      }, 'comment_count');

    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('comment.postId')
          .from('Comment', 'comment')
          .groupBy('comment.postId')
          .having('COUNT(*) > 10')
          .getQuery();
        return `post.id IN ${subQuery}`;
      })
      .getMany();
  }
}
```

### 8.2. Insert, Update, Delete QueryBuilder

```typescript
// Insert
await this.postRepository
  .createQueryBuilder()
  .insert()
  .into(Post)
  .values([
    { title: 'Post 1', content: 'Content 1', authorId: 1 },
    { title: 'Post 2', content: 'Content 2', authorId: 1 },
  ])
  .execute();

// Update
await this.postRepository
  .createQueryBuilder()
  .update(Post)
  .set({ isPublished: true })
  .where('authorId = :authorId', { authorId: 1 })
  .andWhere('createdAt < :date', { date: new Date('2024-01-01') })
  .execute();

// Delete
await this.postRepository
  .createQueryBuilder()
  .delete()
  .from(Post)
  .where('isPublished = false')
  .andWhere('createdAt < :date', { date: new Date('2023-01-01') })
  .execute();

// Soft Delete
await this.postRepository
  .createQueryBuilder()
  .softDelete()
  .where('id = :id', { id: 1 })
  .execute();

// Restore
await this.postRepository
  .createQueryBuilder()
  .restore()
  .where('id = :id', { id: 1 })
  .execute();
```

---

## 9. Migrations

Migration là cách quản lý schema database theo phiên bản. Thay vì dùng `synchronize: true` (nguy hiểm cho production), bạn tạo migration files.

### 9.1. Cấu hình

```typescript
// data-source.ts (file cấu hình cho CLI)
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
```

```json
// package.json - scripts
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d ./data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:create": "npm run typeorm -- migration:create"
  }
}
```

### 9.2. Tạo và chạy Migration

```bash
# Auto-generate migration từ entity changes
npm run migration:generate -- src/database/migrations/CreateUsersTable

# Tạo migration rỗng (để viết SQL thủ công)
npm run migration:create -- src/database/migrations/AddIndexToUsersEmail

# Chạy tất cả migration pending
npm run migration:run

# Revert migration gần nhất
npm run migration:revert
```

### 9.3. Ví dụ Migration file

```typescript
// src/database/migrations/1700000000000-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo enum type
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('admin', 'moderator', 'user')`,
    );

    // Tạo bảng
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'user_role_enum',
            default: `'user'`,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Tạo index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
```

**Migration auto-generated (từ entity changes):**

```typescript
// TypeORM tự generate khi bạn thay đổi entity
export class AddPhoneToUsers1700000001000 implements MigrationInterface {
  name = 'AddPhoneToUsers1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
```

---

## 10. Transactions

Transaction đảm bảo một nhóm operations hoặc thành công hết hoặc thất bại hết (ACID).

### 10.1. Sử dụng DataSource.transaction

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';

@Injectable()
export class TransferService {
  constructor(private readonly dataSource: DataSource) {}

  // Chuyển tiền giữa 2 tài khoản
  async transfer(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
  ): Promise<void> {
    // Tất cả operations trong callback sẽ chạy trong 1 transaction
    await this.dataSource.transaction(async (manager) => {
      // Dùng manager thay vì repository
      const fromAccount = await manager.findOne(Account, {
        where: { id: fromAccountId },
        lock: { mode: 'pessimistic_write' }, // Lock row để tránh race condition
      });

      const toAccount = await manager.findOne(Account, {
        where: { id: toAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount || !toAccount) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Số dư không đủ');
      }

      // Trừ tiền tài khoản gửi
      fromAccount.balance -= amount;
      await manager.save(fromAccount);

      // Cộng tiền tài khoản nhận
      toAccount.balance += amount;
      await manager.save(toAccount);

      // Tạo log giao dịch
      const transaction = manager.create(TransactionLog, {
        fromAccountId,
        toAccountId,
        amount,
        type: 'transfer',
      });
      await manager.save(transaction);
    });
    // Nếu bất kỳ operation nào throw error -> tự động ROLLBACK
    // Nếu tất cả thành công -> tự động COMMIT
  }
}
```

### 10.2. Sử dụng QueryRunner (kiểm soát chi tiết hơn)

```typescript
@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Tạo QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();

    // Kết nối và bắt đầu transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo order
      const order = queryRunner.manager.create(Order, {
        userId: createOrderDto.userId,
        status: 'pending',
      });
      const savedOrder = await queryRunner.manager.save(order);

      // Tạo order items
      for (const item of createOrderDto.items) {
        // Kiểm tra stock
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} không đủ hàng`);
        }

        // Tạo order item
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
        await queryRunner.manager.save(orderItem);

        // Giảm stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release QueryRunner (QUAN TRỌNG - luôn phải release)
      await queryRunner.release();
    }
  }
}
```

---

## 11. Subscribers và Listeners

### 11.1. Entity Listeners (Decorators)

Listeners là decorators gắn trực tiếp vào entity methods.

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  AfterUpdate,
  AfterLoad,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Chạy TRƯỚC khi insert vào DB
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Chạy TRƯỚC khi update
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Chạy SAU khi insert
  @AfterInsert()
  logInsert() {
    console.log(`User ${this.email} đã được tạo với id: ${this.id}`);
  }

  // Chạy SAU khi load từ DB
  @AfterLoad()
  setFullName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
}
```

### 11.2. Subscribers (Class-based)

Subscribers mạnh hơn listeners, có thể access connection và query runner.

```typescript
// subscribers/user.subscriber.ts
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  // Chỉ lắng nghe events của User entity
  listenTo() {
    return User;
  }

  // Trước khi insert
  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    console.log('Before insert user:', event.entity.email);
    // Có thể access queryRunner
    // event.queryRunner
  }

  // Sau khi insert
  async afterInsert(event: InsertEvent<User>): Promise<void> {
    console.log('After insert user:', event.entity.id);
    // Gửi email welcome, tạo record liên quan, etc.
  }

  // Trước khi update
  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    console.log('Before update user:', event.entity);
  }

  // Sau khi update
  async afterUpdate(event: UpdateEvent<User>): Promise<void> {
    console.log('After update user');
  }

  // Trước khi xóa
  async beforeRemove(event: RemoveEvent<User>): Promise<void> {
    console.log('Before remove user:', event.entityId);
  }

  // Sau khi xóa
  async afterRemove(event: RemoveEvent<User>): Promise<void> {
    console.log('After remove user:', event.entityId);
  }
}
```

**Đăng ký subscriber:**

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  // ...config
  subscribers: [UserSubscriber],
  // Hoặc auto-load:
  // subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
}),
```

---

## 12. Active Record vs Data Mapper

TypeORM hỗ trợ 2 patterns:

### 12.1. Active Record Pattern

Entity tự chứa các method để thao tác DB.

```typescript
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  // Static methods
  static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  static async findActive(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }
}

// Sử dụng - gọi trực tiếp trên entity class
const user = new User();
user.name = 'Phong';
user.email = 'phong@example.com';
await user.save(); // Không cần repository

const users = await User.find();
const phong = await User.findByEmail('phong@example.com');
await phong.remove();
```

### 12.2. Data Mapper Pattern (Khuyên dùng với NestJS)

Entity chỉ chứa dữ liệu, Repository chứa logic truy vấn.

```typescript
// Entity - CHỈ chứa data
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

// Service - dùng repository để thao tác
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
```

**So sánh:**

| Tiêu chí | Active Record | Data Mapper |
|-----------|---------------|-------------|
| Entity phụ thuộc DB | Co (extends BaseEntity) | Khong |
| Testability | Kho mock hon | De mock repository |
| Separation of Concerns | Thap | Cao |
| Phu hop voi NestJS | Khong | Co (DI pattern) |
| Khi nao dung | App nho, prototype | App lon, production |

**Khuyen nghi:** Luon dung **Data Mapper** voi NestJS vi no phu hop voi Dependency Injection pattern va de test hon.

---

## 13. Cac loi thuong gap

### Loi 1: `synchronize: true` trong production

```typescript
// SAI - Co the mat data trong production!
TypeOrmModule.forRoot({
  synchronize: true, // Tu dong thay doi schema DB theo entity
});

// DUNG - Dung migrations
TypeOrmModule.forRoot({
  synchronize: false,
  migrationsRun: true, // Tu dong chay migration khi start app
});
```

### Loi 2: N+1 Query Problem

```typescript
// SAI - N+1 queries (1 query lay users + N queries lay posts cho moi user)
const users = await this.userRepository.find();
for (const user of users) {
  const posts = await this.postRepository.find({
    where: { authorId: user.id },
  });
  user.posts = posts;
}

// DUNG - Eager loading voi relations
const users = await this.userRepository.find({
  relations: ['posts'],
});

// HOAC dung QueryBuilder voi JOIN
const users = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .getMany();
```

### Loi 3: Khong release QueryRunner

```typescript
// SAI - Leak connection neu co error
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
const result = await queryRunner.manager.save(entity); // Neu error o day
await queryRunner.commitTransaction();
await queryRunner.release(); // Se khong duoc goi

// DUNG - Luon release trong finally
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  const result = await queryRunner.manager.save(entity);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release(); // LUON duoc goi
}
```

### Loi 4: Quen select: false khi can password

```typescript
// Entity
@Column({ select: false })
password: string;

// SAI - password se la undefined
const user = await this.userRepository.findOne({ where: { email } });
console.log(user.password); // undefined

// DUNG - Explicitly select password
const user = await this.userRepository.findOne({
  where: { email },
  select: ['id', 'email', 'password'],
});

// HOAC dung QueryBuilder
const user = await this.userRepository
  .createQueryBuilder('user')
  .addSelect('user.password')
  .where('user.email = :email', { email })
  .getOne();
```

### Loi 5: Circular dependency khi import entity

```typescript
// SAI - Circular import
// user.entity.ts
import { Post } from '../posts/post.entity'; // Direct import co the gay circular

// DUNG - Dung callback function trong relation decorator
@OneToMany(() => Post, (post) => post.author) // Arrow function -> lazy evaluation
posts: Post[];
```

---

## 14. Bai tap

### Bai tap 1: Xay dung Blog API co ban

Tao cac entity va repository cho mot blog don gian:

- **User**: id, email, name, password, role (admin/author/reader), isActive, createdAt
- **Post**: id, title, slug, content, isPublished, publishedAt, authorId, createdAt, updatedAt
- **Comment**: id, content, postId, userId, parentId (self-referencing cho reply), createdAt
- **Tag**: id, name, slug (many-to-many voi Post)

**Yeu cau:**
1. Tao cac entity voi day du decorators va relations
2. Tao CRUD service cho moi entity dung Repository pattern
3. Implement pagination cho posts va comments
4. Implement soft delete cho Post va Comment
5. Viet query lay 10 bai viet duoc comment nhieu nhat

### Bai tap 2: QueryBuilder nang cao

Su dung QueryBuilder de:

1. Lay danh sach posts kem so luong comments va tags, sap xep theo so comments giam dan
2. Tim cac user chua viet bai nao trong 30 ngay qua
3. Thong ke so bai viet theo tung thang trong nam hien tai
4. Lay cac tags pho bien nhat (dung nhieu nhat) kem so bai
5. Full-text search posts theo title va content voi ranking

### Bai tap 3: Migrations

1. Tao migration tao bang users, posts, comments, tags, post_tags
2. Tao migration them cot `view_count` vao bang posts
3. Tao migration them index cho cot `slug` trong bang posts
4. Viet migration de seed data mau (10 users, 50 posts, 200 comments)
5. Thuc hanh revert migration va chay lai

### Bai tap 4: Transactions

Implement chuc nang:

1. **Tao order**: Tao order + order items + giam stock san pham, tat ca trong 1 transaction. Neu san pham het hang thi rollback toan bo.
2. **Chuyen diem thuong**: Tru diem user A, cong diem user B, tao log giao dich. Neu so diem khong du thi rollback.
3. **Xoa user**: Soft delete user + deactivate tat ca posts cua user + xoa sessions, tat ca trong 1 transaction.

### Bai tap 5: Custom Repository

Tao `PostRepository` voi cac method:
1. `findPublishedWithAuthor(page, limit)` - Pagination voi author info
2. `findByTag(tagSlug, page, limit)` - Tim theo tag
3. `getArchive()` - Nhom bai viet theo thang/nam
4. `getRelatedPosts(postId, limit)` - Tim bai viet lien quan (cung tags)
5. `incrementViewCount(postId)` - Tang view count (atomic operation)

---

> **Tai lieu tham khao:**
> - [TypeORM Documentation](https://typeorm.io/)
> - [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
> - [TypeORM GitHub](https://github.com/typeorm/typeorm)
