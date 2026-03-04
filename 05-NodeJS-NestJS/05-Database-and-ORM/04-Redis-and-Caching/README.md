# Redis va Caching trong NestJS

## Muc luc

- [1. Gioi thieu Redis](#1-gioi-thieu-redis)
- [2. Cau truc du lieu trong Redis](#2-cau-truc-du-lieu-trong-redis)
- [3. Redis Commands co ban](#3-redis-commands-co-ban)
- [4. Cai dat Redis trong NestJS](#4-cai-dat-redis-trong-nestjs)
- [5. CacheModule - Cache don gian](#5-cachemodule---cache-don-gian)
- [6. CacheInterceptor - Auto Cache](#6-cacheinterceptor---auto-cache)
- [7. Custom Caching voi CACHE_MANAGER](#7-custom-caching-voi-cache_manager)
- [8. Su dung ioredis truc tiep](#8-su-dung-ioredis-truc-tiep)
- [9. Cache Invalidation Patterns](#9-cache-invalidation-patterns)
- [10. Redis Pub/Sub](#10-redis-pubsub)
- [11. Redis Session Store](#11-redis-session-store)
- [12. Rate Limiting voi Redis](#12-rate-limiting-voi-redis)
- [13. Redis Streams](#13-redis-streams)
- [14. Caching Strategies nang cao](#14-caching-strategies-nang-cao)
- [15. Common Mistakes](#15-common-mistakes)
- [16. Best Practices](#16-best-practices)
- [17. Bai tap](#17-bai-tap)

---

## 1. Gioi thieu Redis

### Redis la gi?

**Redis** (Remote Dictionary Server) la mot in-memory data store, hoat dong nhu mot key-value database cuc nhanh. Du lieu duoc luu tru tren RAM nen toc do truy xuat rat cao (duoi 1ms cho hau het cac thao tac).

### Tai sao su dung Redis?

- **Cuc nhanh**: Du lieu luu tren RAM, khong can doc tu disk
- **Da dang data structures**: String, List, Set, Hash, Sorted Set, Stream
- **Persistence**: Co the luu du lieu xuong disk (RDB, AOF)
- **Pub/Sub**: Ho tro messaging pattern
- **Atomic operations**: Tat ca operations deu atomic
- **TTL (Time To Live)**: Tu dong xoa du lieu het han
- **Replication & Clustering**: Ho tro high availability

### Cac use case pho bien

| Use Case | Mo ta |
|----------|-------|
| **Caching** | Cache ket qua database queries, API responses |
| **Session Store** | Luu session cua user |
| **Rate Limiting** | Gioi han so request/thoi gian |
| **Pub/Sub** | Messaging giua cac services |
| **Leaderboard** | Bang xep hang dung Sorted Set |
| **Queue** | Job queue (Bull, BullMQ) |
| **Real-time** | Online status, typing indicator |
| **Distributed Lock** | Khoa phan tan giua cac services |

### Redis vs Memcached

| Tinh nang | Redis | Memcached |
|-----------|-------|-----------|
| Data structures | Nhieu (String, List, Set, Hash, ...) | Chi String |
| Persistence | Co (RDB, AOF) | Khong |
| Pub/Sub | Co | Khong |
| Scripting | Lua scripts | Khong |
| Clustering | Co | Co |
| Max key size | 512MB | 250 bytes |
| Multi-threaded | Single-threaded (I/O tu 6.0 la multi) | Multi-threaded |

---

## 2. Cau truc du lieu trong Redis

### String

Kieu du lieu co ban nhat. Co the luu text, number, binary data (toi da 512MB).

```bash
# Luu string
SET name "Nguyen Van A"
GET name  # => "Nguyen Van A"

# Luu number
SET counter 100
INCR counter       # => 101 (tang 1)
INCRBY counter 10  # => 111 (tang 10)
DECR counter       # => 110 (giam 1)
DECRBY counter 5   # => 105 (giam 5)

# Luu voi TTL
SET session:abc123 "user_data" EX 3600  # Het han sau 3600 giay
SETEX session:abc123 3600 "user_data"   # Tuong duong

# Luu chi khi chua ton tai
SETNX lock:resource "owner"  # Chi set neu key chua ton tai
SET lock:resource "owner" NX # Tuong duong

# Lay nhieu gia tri cung luc
MSET key1 "value1" key2 "value2" key3 "value3"
MGET key1 key2 key3  # => ["value1", "value2", "value3"]
```

### List

Danh sach co thu tu, ho tro push/pop tu 2 dau. Phu hop cho: message queue, recent activity.

```bash
# Them phan tu
LPUSH mylist "a"     # Them vao dau: ["a"]
LPUSH mylist "b"     # Them vao dau: ["b", "a"]
RPUSH mylist "c"     # Them vao cuoi: ["b", "a", "c"]

# Lay phan tu
LPOP mylist          # Lay tu dau: "b", list con ["a", "c"]
RPOP mylist          # Lay tu cuoi: "c", list con ["a"]

# Lay theo range
LRANGE mylist 0 -1   # Lay tat ca
LRANGE mylist 0 9    # Lay 10 phan tu dau

# Do dai
LLEN mylist

# Blocking pop (cho doi neu list rong)
BLPOP mylist 30      # Cho toi da 30 giay
```

### Set

Tap hop cac gia tri duy nhat, khong co thu tu. Phu hop cho: tags, unique visitors, mutual friends.

```bash
# Them phan tu
SADD myset "a" "b" "c"

# Kiem tra ton tai
SISMEMBER myset "a"   # => 1 (true)
SISMEMBER myset "z"   # => 0 (false)

# Lay tat ca phan tu
SMEMBERS myset         # => ["a", "b", "c"]

# So phan tu
SCARD myset            # => 3

# Phep toan tap hop
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"

SUNION set1 set2       # Hop: ["a", "b", "c", "d"]
SINTER set1 set2       # Giao: ["b", "c"]
SDIFF set1 set2        # Hieu (set1 - set2): ["a"]

# Xoa phan tu
SREM myset "a"

# Lay ngau nhien
SRANDMEMBER myset 2    # Lay 2 phan tu ngau nhien
SPOP myset             # Lay va xoa 1 phan tu ngau nhien
```

### Hash

Luu tru object (truong - gia tri). Phu hop cho: user profile, product info, session data.

```bash
# Dat gia tri
HSET user:1 name "Nguyen Van A" email "a@email.com" age "25"

# Lay gia tri
HGET user:1 name        # => "Nguyen Van A"
HGETALL user:1          # => { name: "Nguyen Van A", email: "a@email.com", age: "25" }

# Lay nhieu truong
HMGET user:1 name email # => ["Nguyen Van A", "a@email.com"]

# Kiem tra ton tai
HEXISTS user:1 name     # => 1

# Tang gia tri so
HINCRBY user:1 age 1    # age = 26

# Lay tat ca keys
HKEYS user:1            # => ["name", "email", "age"]

# Lay tat ca values
HVALS user:1            # => ["Nguyen Van A", "a@email.com", "26"]

# Xoa truong
HDEL user:1 age
```

### Sorted Set (ZSet)

Tap hop co thu tu (sap xep theo score). Phu hop cho: leaderboard, ranking, priority queue.

```bash
# Them phan tu voi score
ZADD leaderboard 100 "player1"
ZADD leaderboard 200 "player2"
ZADD leaderboard 150 "player3"

# Lay theo thu tu (score tang dan)
ZRANGE leaderboard 0 -1                  # => ["player1", "player3", "player2"]
ZRANGE leaderboard 0 -1 WITHSCORES       # Kem theo score

# Lay theo thu tu giam dan
ZREVRANGE leaderboard 0 -1               # => ["player2", "player3", "player1"]

# Lay top 3
ZREVRANGE leaderboard 0 2 WITHSCORES

# Xep hang cua member
ZRANK leaderboard "player1"              # => 0 (thu 1 tu thap)
ZREVRANK leaderboard "player2"           # => 0 (thu 1 tu cao)

# Lay score
ZSCORE leaderboard "player1"             # => 100

# Tang score
ZINCRBY leaderboard 50 "player1"         # score = 150

# Lay theo range score
ZRANGEBYSCORE leaderboard 100 200        # Members co score 100-200

# Dem members
ZCARD leaderboard                        # => 3
ZCOUNT leaderboard 100 200              # Members co score 100-200
```

---

## 3. Redis Commands co ban

### Key Management

```bash
# Tim keys theo pattern
KEYS user:*           # Tim tat ca keys bat dau bang "user:"
KEYS *                # Tim tat ca keys (KHONG DUNG TRONG PRODUCTION!)

# Dung SCAN thay vi KEYS trong production
SCAN 0 MATCH user:* COUNT 100

# Kiem tra key ton tai
EXISTS mykey          # => 1 (ton tai) hoac 0

# Xoa keys
DEL key1 key2 key3    # Xoa ngay, blocking
UNLINK key1 key2      # Xoa async, non-blocking (nhanh hon voi key lon)

# TTL (Time To Live)
EXPIRE mykey 3600     # Dat TTL 3600 giay
PEXPIRE mykey 3600000 # Dat TTL milliseconds
TTL mykey             # Xem con bao lau (giay). -1 = khong het han, -2 = khong ton tai
PTTL mykey            # TTL tinh bang milliseconds
PERSIST mykey         # Xoa TTL (key ton tai vinh vien)

# Kieu du lieu cua key
TYPE mykey            # => string, list, set, zset, hash, stream

# Doi ten key
RENAME oldkey newkey

# Lay gia tri va xoa
GETDEL mykey          # Lay gia tri roi xoa key

# Lay gia tri cu va dat gia tri moi
GETSET mykey "new_value"
```

### Utility Commands

```bash
# Thong tin server
INFO                  # Thong tin tong quat
INFO memory           # Thong tin bo nho
INFO clients          # Thong tin clients

# So key trong database
DBSIZE

# Xoa tat ca keys trong DB hien tai
FLUSHDB

# Xoa tat ca keys trong tat ca DB
FLUSHALL

# Ping server
PING                  # => PONG

# Chon database (0-15)
SELECT 0
```

---

## 4. Cai dat Redis trong NestJS

### Cach 1: Su dung @nestjs/cache-manager (CacheModule)

```bash
# Cai dat packages
npm install @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,  // Su dung o moi module ma khong can import lai
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          password: undefined,  // Neu co password
          ttl: 60 * 1000,      // TTL mac dinh: 60 giay (milliseconds)
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

### Cach 2: Su dung ConfigService

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: configService.get<number>('CACHE_TTL', 60000),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=60000
```

### Cach 3: Su dung ioredis truc tiep

```bash
npm install ioredis
npm install -D @types/ioredis
```

```typescript
// redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          keyPrefix: 'myapp:',  // Prefix cho tat ca keys
          retryStrategy: (times) => {
            if (times > 3) {
              return null;  // Ngung retry sau 3 lan
            }
            return Math.min(times * 200, 2000);
          },
        });

        redis.on('connect', () => {
          console.log('Redis: Da ket noi thanh cong');
        });

        redis.on('error', (error) => {
          console.error('Redis: Loi ket noi', error);
        });

        redis.on('close', () => {
          console.log('Redis: Da dong ket noi');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

```typescript
// Su dung trong service
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getCachedUser(userId: string): Promise<any> {
    const cached = await this.redis.get(`user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(
      `user:${userId}`,
      ttl,
      JSON.stringify(userData),
    );
  }
}
```

---

## 5. CacheModule - Cache don gian

### Su dung co ban voi CACHE_MANAGER

```typescript
// users/users.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // === GET: Lay tu cache, neu khong co thi query DB ===
  async findById(id: number): Promise<User> {
    const cacheKey = `user:${id}`;

    // Thu lay tu cache
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);
      return cached;
    }

    console.log('Cache MISS:', cacheKey);

    // Query database
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} khong ton tai`);
    }

    // Luu vao cache (TTL 5 phut = 300000 ms)
    await this.cacheManager.set(cacheKey, user, 300000);

    return user;
  }

  // === SET: Luu vao cache ===
  async cacheData(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  // === DEL: Xoa cache ===
  async invalidateCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // === UPDATE: Cap nhat DB va cache ===
  async update(id: number, updateDto: any): Promise<User> {
    await this.userRepo.update(id, updateDto);
    const user = await this.userRepo.findOne({ where: { id } });

    // Cap nhat cache
    const cacheKey = `user:${id}`;
    await this.cacheManager.set(cacheKey, user, 300000);

    // Xoa cache danh sach (vi danh sach da thay doi)
    await this.cacheManager.del('users:all');

    return user;
  }

  // === DELETE: Xoa DB va cache ===
  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);

    // Xoa cache
    await this.cacheManager.del(`user:${id}`);
    await this.cacheManager.del('users:all');
  }

  // === RESET: Xoa tat ca cache ===
  async clearAllCache(): Promise<void> {
    await this.cacheManager.reset();
  }

  // === GET or SET pattern ===
  async findAllCached(): Promise<User[]> {
    const cacheKey = 'users:all';

    // Thu lay tu cache
    let users = await this.cacheManager.get<User[]>(cacheKey);

    if (!users) {
      // Query DB
      users = await this.userRepo.find();

      // Luu cache 10 phut
      await this.cacheManager.set(cacheKey, users, 600000);
    }

    return users;
  }
}
```

### Generic Cache Service

```typescript
// cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Lay du lieu tu cache, neu khong co thi goi factory function
   * va luu ket qua vao cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 60000,  // 60 giay mac dinh
  ): Promise<T> {
    // Thu lay tu cache
    const cached = await this.cacheManager.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // Goi factory de lay du lieu
    const data = await factory();

    // Luu vao cache
    if (data !== undefined && data !== null) {
      await this.cacheManager.set(key, data, ttl);
    }

    return data;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Xoa nhieu keys cung luc
   */
  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  /**
   * Tao cache key tu nhieu phan
   */
  buildKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}
```

```typescript
// Su dung CacheService
@Injectable()
export class ProductsService {
  constructor(
    private cacheService: CacheService,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findById(id: number): Promise<Product> {
    return this.cacheService.getOrSet(
      this.cacheService.buildKey('product', id),
      () => this.productRepo.findOne({ where: { id } }),
      300000,  // 5 phut
    );
  }

  async findAll(page: number, limit: number): Promise<Product[]> {
    return this.cacheService.getOrSet(
      this.cacheService.buildKey('products', 'list', page, limit),
      () => this.productRepo.find({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      60000,  // 1 phut
    );
  }
}
```

---

## 6. CacheInterceptor - Auto Cache

CacheInterceptor tu dong cache response cua GET requests.

### Setup co ban

```typescript
// app.module.ts hoac feature module
import { Module, CacheModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ ttl: 60000 })],
  providers: [
    // Ap dung cho TOAN BO app (global)
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

### Su dung voi Controller

```typescript
// products/products.controller.ts
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

// Ap dung cache cho TOAN BO controller
@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products - tu dong cache voi key mac dinh (URL path)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // GET /products/:id - Custom cache key va TTL
  @Get(':id')
  @CacheKey('product-detail')  // Custom cache key
  @CacheTTL(300000)            // TTL 5 phut (ms)
  findOne(@Param('id') id: string) {
    return this.productsService.findById(+id);
  }

  // GET /products/featured - TTL ngan hon
  @Get('featured')
  @CacheTTL(30000)  // Chi cache 30 giay
  getFeatured() {
    return this.productsService.getFeatured();
  }
}
```

### Custom CacheInterceptor

```typescript
// interceptors/custom-cache.interceptor.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  // Tuy chinh cache key
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    // Khong cache neu co Authorization header (user-specific data)
    if (request.headers.authorization) {
      return undefined;  // undefined = khong cache
    }

    // Tao cache key tu URL + query params
    const { url, query } = request;
    const queryString = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    return queryString ? `${url}?${queryString}` : url;
  }

  // Chi cache GET requests
  isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.method === 'GET';
  }
}

// Su dung
@Controller('products')
@UseInterceptors(CustomCacheInterceptor)
export class ProductsController {}
```

### Cache voi User-specific data

```typescript
// interceptors/user-cache.interceptor.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    // Bao gom user ID trong cache key
    const userId = request.user?.id || 'anonymous';
    return `${userId}:${request.url}`;
  }
}

// Su dung
@Controller('profile')
@UseInterceptors(UserCacheInterceptor)
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }
}
```

---

## 7. Custom Caching voi CACHE_MANAGER

### Caching trong Service chi tiet

```typescript
// orders/orders.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrdersService {
  private readonly CACHE_PREFIX = 'orders';
  private readonly DEFAULT_TTL = 300000; // 5 phut

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  // Helper: Tao cache key
  private cacheKey(...parts: (string | number)[]): string {
    return [this.CACHE_PREFIX, ...parts].join(':');
  }

  // === Tim orders cua user voi cache ===
  async findByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Order[]; total: number }> {
    const key = this.cacheKey('user', userId, 'page', page, 'limit', limit);

    // Thu lay tu cache
    const cached = await this.cache.get<{ data: Order[]; total: number }>(key);
    if (cached) return cached;

    // Query DB
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product'],
    });

    const result = { data, total };

    // Cache ket qua
    await this.cache.set(key, result, this.DEFAULT_TTL);

    return result;
  }

  // === Tao order moi va invalidate cache ===
  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepo.save({
      userId,
      ...createOrderDto,
    });

    // Invalidate tat ca cache cua user nay
    await this.invalidateUserOrdersCache(userId);

    // Invalidate cache thong ke
    await this.cache.del(this.cacheKey('stats'));
    await this.cache.del(this.cacheKey('recent'));

    return order;
  }

  // === Invalidate cache cho user ===
  private async invalidateUserOrdersCache(userId: number): Promise<void> {
    // Vi khong biet chinh xac cac cache key (page, limit khac nhau),
    // can xoa tat ca keys cua user.
    // Cach 1: Luu danh sach keys
    const keysListKey = this.cacheKey('user', userId, '_keys');
    const keys = await this.cache.get<string[]>(keysListKey);

    if (keys) {
      await Promise.all(keys.map((key) => this.cache.del(key)));
      await this.cache.del(keysListKey);
    }
  }

  // === Cache thong ke (it thay doi) ===
  async getStats(): Promise<any> {
    const key = this.cacheKey('stats');

    const cached = await this.cache.get(key);
    if (cached) return cached;

    const stats = await this.orderRepo
      .createQueryBuilder('order')
      .select('COUNT(*)', 'totalOrders')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect('AVG(order.totalAmount)', 'avgOrderValue')
      .getRawOne();

    // Cache 1 gio
    await this.cache.set(key, stats, 3600000);

    return stats;
  }

  // === Cache voi stale-while-revalidate pattern ===
  async getPopularProducts(): Promise<Product[]> {
    const key = 'popular-products';
    const staleKey = `${key}:stale`;

    // Thu lay cache moi
    const fresh = await this.cache.get<Product[]>(key);
    if (fresh) return fresh;

    // Lay cache cu (neu co) va cap nhat ngam
    const stale = await this.cache.get<Product[]>(staleKey);
    if (stale) {
      // Cap nhat cache moi o background (khong cho doi)
      this.refreshPopularProducts(key, staleKey).catch(console.error);
      return stale;
    }

    // Khong co cache gi, phai query DB
    return this.refreshPopularProducts(key, staleKey);
  }

  private async refreshPopularProducts(
    key: string,
    staleKey: string,
  ): Promise<Product[]> {
    const products = await this.productRepo.find({
      order: { salesCount: 'DESC' },
      take: 20,
    });

    // Cache moi: 5 phut
    await this.cache.set(key, products, 300000);
    // Cache cu: 1 gio (backup)
    await this.cache.set(staleKey, products, 3600000);

    return products;
  }
}
```

---

## 8. Su dung ioredis truc tiep

### Redis Service toan dien

```typescript
// redis/redis.service.ts
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  // === STRING operations ===

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, data);
    } else {
      await this.redis.set(key, data);
    }
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    return this.redis.incrby(key, amount);
  }

  // === HASH operations ===

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  async hmset(key: string, data: Record<string, string>): Promise<void> {
    await this.redis.hmset(key, data);
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.redis.hdel(key, ...fields);
  }

  async hincrby(key: string, field: string, amount: number): Promise<number> {
    return this.redis.hincrby(key, field, amount);
  }

  // === LIST operations ===

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redis.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redis.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  // === SET operations ===

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  async scard(key: string): Promise<number> {
    return this.redis.scard(key);
  }

  // === SORTED SET operations ===

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redis.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.zrevrange(key, start, stop);
  }

  async zrangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<{ member: string; score: number }[]> {
    const result = await this.redis.zrange(key, start, stop, 'WITHSCORES');
    const items: { member: string; score: number }[] = [];
    for (let i = 0; i < result.length; i += 2) {
      items.push({
        member: result[i],
        score: parseFloat(result[i + 1]),
      });
    }
    return items;
  }

  async zscore(key: string, member: string): Promise<number | null> {
    const score = await this.redis.zscore(key, member);
    return score !== null ? parseFloat(score) : null;
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    return this.redis.zrevrank(key, member);
  }

  async zincrby(key: string, amount: number, member: string): Promise<string> {
    return this.redis.zincrby(key, amount, member);
  }

  // === PATTERN: Xoa keys theo pattern ===
  async delByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deletedCount = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    return deletedCount;
  }

  // === PIPELINE: Thuc thi nhieu commands cung luc ===
  async executePipeline(
    commands: Array<{ cmd: string; args: any[] }>,
  ): Promise<any[]> {
    const pipeline = this.redis.pipeline();

    commands.forEach(({ cmd, args }) => {
      (pipeline as any)[cmd](...args);
    });

    const results = await pipeline.exec();
    return results.map(([err, result]) => {
      if (err) throw err;
      return result;
    });
  }

  // === DISTRIBUTED LOCK ===
  async acquireLock(
    resource: string,
    ttl: number = 10,
  ): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const key = `lock:${resource}`;

    const result = await this.redis.set(key, lockId, 'EX', ttl, 'NX');
    return result === 'OK' ? lockId : null;
  }

  async releaseLock(resource: string, lockId: string): Promise<boolean> {
    const key = `lock:${resource}`;
    // Dung Lua script de dam bao atomic
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(script, 1, key, lockId);
    return result === 1;
  }
}
```

### Vi du su dung Distributed Lock

```typescript
@Injectable()
export class PaymentService {
  constructor(
    private redisService: RedisService,
    private orderRepo: Repository<Order>,
  ) {}

  async processPayment(orderId: string, amount: number): Promise<any> {
    const lockId = await this.redisService.acquireLock(
      `payment:${orderId}`,
      30,  // Lock 30 giay
    );

    if (!lockId) {
      throw new ConflictException('Don hang dang duoc xu ly boi process khac');
    }

    try {
      // Kiem tra trang thai order
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
      });

      if (order.status === 'paid') {
        throw new BadRequestException('Don hang da duoc thanh toan');
      }

      // Xu ly thanh toan...
      await this.processStripePayment(amount);

      // Cap nhat trang thai
      order.status = 'paid';
      await this.orderRepo.save(order);

      return { success: true, orderId };
    } finally {
      // Luon giai phong lock
      await this.redisService.releaseLock(`payment:${orderId}`, lockId);
    }
  }
}
```

---

## 9. Cache Invalidation Patterns

"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton

### Pattern 1: TTL-based (Time To Live)

```typescript
// Don gian nhat: Tu dong het han
await this.cache.set('users:list', users, 300000); // 5 phut

// Uu diem: Don gian, tu dong
// Nhuoc diem: Du lieu co the stale trong khoang TTL
```

### Pattern 2: Event-based Invalidation

```typescript
// users/users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepo.save(dto);

    // Emit event
    this.eventEmitter.emit('user.created', { user });

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, dto);
    const user = await this.userRepo.findOne({ where: { id } });

    // Emit event
    this.eventEmitter.emit('user.updated', { user });

    return user;
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);

    // Emit event
    this.eventEmitter.emit('user.deleted', { userId: id });
  }
}

// cache/cache-invalidation.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CacheInvalidationListener {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(payload: { user: User }) {
    // Xoa cache danh sach
    await this.cache.del('users:list');
    await this.cache.del('users:count');
  }

  @OnEvent('user.updated')
  async handleUserUpdated(payload: { user: User }) {
    const { user } = payload;
    // Xoa cache cu the
    await this.cache.del(`user:${user.id}`);
    await this.cache.del('users:list');
    // Cap nhat cache moi
    await this.cache.set(`user:${user.id}`, user, 300000);
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(payload: { userId: number }) {
    await this.cache.del(`user:${payload.userId}`);
    await this.cache.del('users:list');
    await this.cache.del('users:count');
  }
}
```

### Pattern 3: Write-Through Cache

```typescript
// Du lieu luon duoc ghi vao ca cache va DB dong thoi
@Injectable()
export class WriteThroughCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async save(product: Partial<Product>): Promise<Product> {
    // Ghi vao DB truoc
    const saved = await this.productRepo.save(product);

    // Ghi vao cache ngay lap tuc
    await this.cache.set(`product:${saved.id}`, saved, 3600000);

    return saved;
  }

  async findById(id: number): Promise<Product> {
    // Doc tu cache truoc
    const cached = await this.cache.get<Product>(`product:${id}`);
    if (cached) return cached;

    // Cache miss -> doc tu DB
    const product = await this.productRepo.findOne({ where: { id } });
    if (product) {
      await this.cache.set(`product:${id}`, product, 3600000);
    }
    return product;
  }
}
```

### Pattern 4: Write-Behind (Write-Back) Cache

```typescript
// Ghi vao cache truoc, cap nhat DB sau (async)
@Injectable()
export class WriteBehindCacheService {
  private writeQueue: Map<string, any> = new Map();
  private flushInterval: NodeJS.Timeout;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectRepository(ViewCount) private viewCountRepo: Repository<ViewCount>,
  ) {
    // Flush queue moi 10 giay
    this.flushInterval = setInterval(() => this.flushQueue(), 10000);
  }

  // Tang view count - chi cap nhat cache, DB cap nhat sau
  async incrementViewCount(articleId: string): Promise<number> {
    const key = `views:${articleId}`;

    // Lay gia tri hien tai tu cache
    let count = await this.cache.get<number>(key);
    count = (count || 0) + 1;

    // Cap nhat cache
    await this.cache.set(key, count, 86400000); // 24h

    // Them vao queue de ghi DB sau
    this.writeQueue.set(articleId, count);

    return count;
  }

  // Ghi batch tu cache xuong DB
  private async flushQueue(): Promise<void> {
    if (this.writeQueue.size === 0) return;

    const entries = new Map(this.writeQueue);
    this.writeQueue.clear();

    try {
      const updates = Array.from(entries.entries()).map(([articleId, count]) =>
        this.viewCountRepo.upsert(
          { articleId, count },
          ['articleId'],
        ),
      );

      await Promise.all(updates);
      console.log(`Da cap nhat ${entries.size} view counts vao DB`);
    } catch (error) {
      // Neu that bai, them lai vao queue
      entries.forEach((count, id) => {
        if (!this.writeQueue.has(id)) {
          this.writeQueue.set(id, count);
        }
      });
      console.error('Loi khi flush view counts:', error);
    }
  }

  onModuleDestroy() {
    clearInterval(this.flushInterval);
    // Flush lan cuoi truoc khi tat
    this.flushQueue();
  }
}
```

### Pattern 5: Cache Tag Pattern

```typescript
// Tag-based invalidation: Nhom cac cache keys theo tags
@Injectable()
export class TaggedCacheService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async set(
    key: string,
    value: any,
    ttl: number,
    tags: string[] = [],
  ): Promise<void> {
    const pipeline = this.redis.pipeline();

    // Luu data
    pipeline.setex(key, ttl, JSON.stringify(value));

    // Luu tags -> keys mapping
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, ttl);
    }

    await pipeline.exec();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Xoa tat ca cache keys co tag nay
  async invalidateByTag(tag: string): Promise<number> {
    const keys = await this.redis.smembers(`tag:${tag}`);
    if (keys.length === 0) return 0;

    const pipeline = this.redis.pipeline();
    keys.forEach((key) => pipeline.del(key));
    pipeline.del(`tag:${tag}`);
    await pipeline.exec();

    return keys.length;
  }

  // Xoa nhieu tags
  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map((tag) => this.invalidateByTag(tag)));
  }
}

// Su dung
@Injectable()
export class ProductsService {
  constructor(private taggedCache: TaggedCacheService) {}

  async findByCategory(categoryId: number) {
    const key = `products:category:${categoryId}`;

    const cached = await this.taggedCache.get(key);
    if (cached) return cached;

    const products = await this.productRepo.find({ where: { categoryId } });

    // Cache voi tags
    await this.taggedCache.set(key, products, 3600, [
      'products',
      `category:${categoryId}`,
    ]);

    return products;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.save({ id, ...dto });

    // Xoa tat ca cache lien quan den products va category nay
    await this.taggedCache.invalidateByTags([
      'products',
      `category:${product.categoryId}`,
    ]);

    return product;
  }
}
```

---

## 10. Redis Pub/Sub

Redis Pub/Sub cho phep gui va nhan messages giua cac processes/services.

### Setup Pub/Sub trong NestJS

```typescript
// redis/redis-pubsub.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUBLISHER,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_SUBSCRIBER,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_PUBLISHER, REDIS_SUBSCRIBER],
})
export class RedisPubSubModule {}
```

### Publisher Service

```typescript
// events/event-publisher.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER } from '../redis/redis-pubsub.module';

export interface AppEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

@Injectable()
export class EventPublisherService {
  constructor(
    @Inject(REDIS_PUBLISHER) private publisher: Redis,
  ) {}

  async publish(channel: string, event: AppEvent): Promise<number> {
    const message = JSON.stringify({
      ...event,
      timestamp: new Date(),
    });
    return this.publisher.publish(channel, message);
  }

  // Cac helper methods
  async publishUserEvent(type: string, data: any): Promise<void> {
    await this.publish('user-events', {
      type,
      data,
      timestamp: new Date(),
      source: 'user-service',
    });
  }

  async publishOrderEvent(type: string, data: any): Promise<void> {
    await this.publish('order-events', {
      type,
      data,
      timestamp: new Date(),
      source: 'order-service',
    });
  }

  async publishNotification(userId: string, notification: any): Promise<void> {
    await this.publish(`notifications:${userId}`, {
      type: 'notification',
      data: notification,
      timestamp: new Date(),
      source: 'notification-service',
    });
  }
}
```

### Subscriber Service

```typescript
// events/event-subscriber.service.ts
import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_SUBSCRIBER } from '../redis/redis-pubsub.module';
import { AppEvent } from './event-publisher.service';

@Injectable()
export class EventSubscriberService implements OnModuleInit, OnModuleDestroy {
  private handlers = new Map<string, Array<(event: AppEvent) => Promise<void>>>();

  constructor(
    @Inject(REDIS_SUBSCRIBER) private subscriber: Redis,
  ) {}

  async onModuleInit() {
    // Lang nghe messages
    this.subscriber.on('message', async (channel, message) => {
      try {
        const event: AppEvent = JSON.parse(message);
        console.log(`Nhan event tu channel "${channel}":`, event.type);

        const channelHandlers = this.handlers.get(channel) || [];
        await Promise.all(
          channelHandlers.map((handler) => handler(event)),
        );
      } catch (error) {
        console.error(`Loi xu ly message tu channel "${channel}":`, error);
      }
    });

    // Lang nghe pattern messages
    this.subscriber.on('pmessage', async (pattern, channel, message) => {
      try {
        const event: AppEvent = JSON.parse(message);
        const patternHandlers = this.handlers.get(pattern) || [];
        await Promise.all(
          patternHandlers.map((handler) => handler(event)),
        );
      } catch (error) {
        console.error(`Loi xu ly pmessage:`, error);
      }
    });

    // Subscribe cac channels
    await this.setupSubscriptions();
  }

  async onModuleDestroy() {
    await this.subscriber.unsubscribe();
    await this.subscriber.punsubscribe();
  }

  private async setupSubscriptions() {
    // Subscribe channels
    await this.subscriber.subscribe('user-events', 'order-events');

    // Pattern subscribe
    await this.subscriber.psubscribe('notifications:*');
  }

  // Dang ky handler cho channel
  on(channel: string, handler: (event: AppEvent) => Promise<void>) {
    const existing = this.handlers.get(channel) || [];
    existing.push(handler);
    this.handlers.set(channel, existing);
  }
}
```

### Su dung Pub/Sub trong thuc te

```typescript
// notifications/notification.service.ts
@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private eventSubscriber: EventSubscriberService,
    private eventPublisher: EventPublisherService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    // Lang nghe cac su kien
    this.eventSubscriber.on('order-events', async (event) => {
      switch (event.type) {
        case 'order.created':
          await this.handleOrderCreated(event.data);
          break;
        case 'order.shipped':
          await this.handleOrderShipped(event.data);
          break;
        case 'order.completed':
          await this.handleOrderCompleted(event.data);
          break;
      }
    });

    this.eventSubscriber.on('user-events', async (event) => {
      switch (event.type) {
        case 'user.registered':
          await this.handleUserRegistered(event.data);
          break;
      }
    });
  }

  private async handleOrderCreated(data: any) {
    // Gui email xac nhan
    await this.emailService.send({
      to: data.customerEmail,
      subject: 'Xac nhan don hang',
      template: 'order-confirmation',
      context: data,
    });

    // Gui notification realtime
    await this.eventPublisher.publishNotification(data.customerId, {
      title: 'Don hang da duoc tao',
      message: `Don hang #${data.orderId} da duoc tao thanh cong`,
      type: 'success',
    });
  }

  private async handleUserRegistered(data: any) {
    await this.emailService.send({
      to: data.email,
      subject: 'Chao mung ban!',
      template: 'welcome',
      context: data,
    });
  }
}
```

---

## 11. Redis Session Store

### Setup Session voi Redis

```bash
npm install express-session connect-redis ioredis
npm install -D @types/express-session
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tao Redis client
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  });

  // Tao Redis store
  const store = new RedisStore({
    client: redisClient,
    prefix: 'sess:',       // Prefix cho session keys
    ttl: 86400,            // Session ton tai 24 gio
  });

  // Cau hinh session middleware
  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || 'my-secret-key',
      resave: false,              // Khong luu lai neu khong thay doi
      saveUninitialized: false,   // Khong tao session rong
      cookie: {
        httpOnly: true,           // Khong cho JavaScript truy cap
        secure: process.env.NODE_ENV === 'production', // HTTPS only
        maxAge: 24 * 60 * 60 * 1000, // 24 gio
        sameSite: 'lax',
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

### Su dung Session trong Controller

```typescript
// auth/auth.controller.ts
import { Controller, Post, Get, Body, Session, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Session() session: Record<string, any>,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    // Luu user info vao session
    session.userId = user.id;
    session.role = user.role;
    session.loginAt = new Date();

    return { message: 'Dang nhap thanh cong', user };
  }

  @Get('profile')
  async getProfile(@Session() session: Record<string, any>) {
    if (!session.userId) {
      throw new UnauthorizedException('Chua dang nhap');
    }
    return this.authService.getProfile(session.userId);
  }

  @Post('logout')
  async logout(@Session() session: Record<string, any>) {
    return new Promise<void>((resolve, reject) => {
      session.destroy((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}
```

---

## 12. Rate Limiting voi Redis

### Su dung @nestjs/throttler voi Redis

```bash
npm install @nestjs/throttler throttler-storage-redis-new ioredis
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'throttler-storage-redis-new';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,    // 1 giay
          limit: 3,     // 3 requests / giay
        },
        {
          name: 'medium',
          ttl: 10000,   // 10 giay
          limit: 20,    // 20 requests / 10 giay
        },
        {
          name: 'long',
          ttl: 60000,   // 1 phut
          limit: 100,   // 100 requests / phut
        },
      ],
      storage: new ThrottlerStorageRedisService(
        new Redis({
          host: 'localhost',
          port: 6379,
        }),
      ),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### Custom Rate Limiter

```typescript
// rate-limiter/rate-limiter.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // giay
}

@Injectable()
export class RateLimiterService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  /**
   * Fixed Window Rate Limiter
   * Don gian, hieu qua cho hau het use cases
   */
  async fixedWindow(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / windowMs)}`;

    const current = await this.redis.incr(windowKey);

    // Dat TTL cho lan dau tien
    if (current === 1) {
      await this.redis.pexpire(windowKey, windowMs);
    }

    const remaining = Math.max(0, limit - current);
    const resetAt = new Date(
      Math.ceil(Date.now() / windowMs) * windowMs,
    );

    return {
      allowed: current <= limit,
      remaining,
      resetAt,
      retryAfter: current > limit
        ? Math.ceil((resetAt.getTime() - Date.now()) / 1000)
        : undefined,
    };
  }

  /**
   * Sliding Window Rate Limiter
   * Chinh xac hon fixed window, tranh burst o ranh gioi window
   */
  async slidingWindow(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:sliding:${key}`;

    // Dung Lua script de dam bao atomic
    const script = `
      -- Xoa cac entries cu hon window
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])

      -- Dem so entries trong window
      local count = redis.call('ZCARD', KEYS[1])

      if count < tonumber(ARGV[3]) then
        -- Them entry moi
        redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2] .. ':' .. math.random())
        redis.call('PEXPIRE', KEYS[1], ARGV[4])
        return {1, tonumber(ARGV[3]) - count - 1}
      else
        return {0, 0}
      end
    `;

    const result = await this.redis.eval(
      script,
      1,
      redisKey,
      windowStart.toString(),
      now.toString(),
      limit.toString(),
      windowMs.toString(),
    ) as [number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetAt: new Date(now + windowMs),
    };
  }

  /**
   * Token Bucket Rate Limiter
   * Cho phep burst trong gioi han, refill theo thoi gian
   */
  async tokenBucket(
    key: string,
    maxTokens: number,
    refillRate: number,  // tokens per second
    tokensRequired: number = 1,
  ): Promise<RateLimitResult> {
    const redisKey = `ratelimit:bucket:${key}`;

    const script = `
      local now = tonumber(ARGV[1])
      local maxTokens = tonumber(ARGV[2])
      local refillRate = tonumber(ARGV[3])
      local tokensRequired = tonumber(ARGV[4])

      local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or maxTokens
      local lastRefill = tonumber(bucket[2]) or now

      -- Refill tokens
      local elapsed = (now - lastRefill) / 1000
      tokens = math.min(maxTokens, tokens + elapsed * refillRate)

      if tokens >= tokensRequired then
        tokens = tokens - tokensRequired
        redis.call('HMSET', KEYS[1], 'tokens', tokens, 'lastRefill', now)
        redis.call('EXPIRE', KEYS[1], math.ceil(maxTokens / refillRate) + 1)
        return {1, math.floor(tokens)}
      else
        redis.call('HMSET', KEYS[1], 'tokens', tokens, 'lastRefill', now)
        redis.call('EXPIRE', KEYS[1], math.ceil(maxTokens / refillRate) + 1)
        return {0, math.floor(tokens)}
      end
    `;

    const result = await this.redis.eval(
      script,
      1,
      redisKey,
      Date.now().toString(),
      maxTokens.toString(),
      refillRate.toString(),
      tokensRequired.toString(),
    ) as [number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetAt: new Date(Date.now() + (maxTokens / refillRate) * 1000),
    };
  }
}
```

### Rate Limit Guard

```typescript
// guards/rate-limit.guard.ts
import {
  Injectable, CanActivate, ExecutionContext,
  HttpException, HttpStatus, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimiter: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Tao key tu IP hoac user ID
    const key = request.user?.id
      ? `${options.keyPrefix || 'api'}:user:${request.user.id}`
      : `${options.keyPrefix || 'api'}:ip:${request.ip}`;

    const result = await this.rateLimiter.fixedWindow(
      key,
      options.limit,
      options.windowMs,
    );

    // Them headers
    response.header('X-RateLimit-Limit', options.limit.toString());
    response.header('X-RateLimit-Remaining', result.remaining.toString());
    response.header('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      response.header('Retry-After', result.retryAfter?.toString());
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Qua nhieu yeu cau. Vui long thu lai sau.',
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

// Su dung
@Controller('api')
@UseGuards(RateLimitGuard)
export class ApiController {
  // 100 requests / phut
  @Get('data')
  @RateLimit({ limit: 100, windowMs: 60000 })
  getData() {
    return { data: 'OK' };
  }

  // 5 requests / phut cho login (chong brute force)
  @Post('login')
  @RateLimit({ limit: 5, windowMs: 60000, keyPrefix: 'login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 10 requests / gio cho tao tai khoan
  @Post('register')
  @RateLimit({ limit: 10, windowMs: 3600000, keyPrefix: 'register' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

---

## 13. Redis Streams

Redis Streams la cau truc du lieu moi (tu Redis 5.0), phu hop cho event sourcing, message queue va log processing.

### Producer

```typescript
// streams/stream-producer.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class StreamProducerService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  /**
   * Them message vao stream
   * @param stream - Ten stream
   * @param data - Du lieu (key-value pairs)
   * @returns Message ID
   */
  async add(
    stream: string,
    data: Record<string, string>,
  ): Promise<string> {
    const fields = Object.entries(data).flat();
    return this.redis.xadd(stream, '*', ...fields);
    // '*' = Redis tu dong tao ID (timestamp-sequence)
  }

  // Vi du: Gui order event
  async publishOrderEvent(event: {
    type: string;
    orderId: string;
    userId: string;
    amount: string;
  }): Promise<string> {
    return this.add('stream:orders', event);
  }

  // Vi du: Gui log entry
  async publishLog(level: string, message: string, meta?: string): Promise<string> {
    return this.add('stream:logs', {
      level,
      message,
      meta: meta || '',
      timestamp: new Date().toISOString(),
    });
  }

  // Xem thong tin stream
  async getStreamInfo(stream: string): Promise<any> {
    return this.redis.xinfo('STREAM', stream);
  }

  // Doc messages tu stream
  async readMessages(
    stream: string,
    count: number = 10,
    fromId: string = '0',
  ): Promise<any> {
    return this.redis.xrange(stream, fromId, '+', 'COUNT', count);
  }

  // Trim stream (giu lai N messages gan nhat)
  async trimStream(stream: string, maxLen: number): Promise<number> {
    return this.redis.xtrim(stream, 'MAXLEN', '~', maxLen);
  }
}
```

### Consumer Group

```typescript
// streams/stream-consumer.service.ts
import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class StreamConsumerService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private consumerName: string;

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {
    this.consumerName = `consumer-${process.pid}`;
  }

  async onModuleInit() {
    // Tao consumer group (neu chua co)
    try {
      await this.redis.xgroup(
        'CREATE',
        'stream:orders',
        'order-processors',  // Ten group
        '0',                 // Doc tu dau
        'MKSTREAM',          // Tao stream neu chua co
      );
    } catch (error) {
      // Group da ton tai - khong sao
      if (!error.message.includes('BUSYGROUP')) {
        throw error;
      }
    }

    // Bat dau lang nghe
    this.isRunning = true;
    this.startConsuming();
  }

  async onModuleDestroy() {
    this.isRunning = false;
  }

  private async startConsuming() {
    while (this.isRunning) {
      try {
        // Doc messages moi (chua duoc assign cho consumer nao)
        const results = await this.redis.xreadgroup(
          'GROUP',
          'order-processors',     // Group name
          this.consumerName,      // Consumer name
          'COUNT',
          10,                     // Doc toi da 10 messages
          'BLOCK',
          5000,                   // Cho toi da 5 giay
          'STREAMS',
          'stream:orders',
          '>',                    // Chi doc messages moi
        );

        if (results) {
          for (const [stream, messages] of results) {
            for (const [messageId, fields] of messages) {
              await this.processMessage(stream, messageId, fields);
            }
          }
        }
      } catch (error) {
        console.error('Loi khi doc stream:', error);
        // Cho 1 giay truoc khi thu lai
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private async processMessage(
    stream: string,
    messageId: string,
    fields: string[],
  ): Promise<void> {
    // Chuyen mang thanh object
    const data: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      data[fields[i]] = fields[i + 1];
    }

    try {
      console.log(`Xu ly message ${messageId}:`, data);

      // Xu ly theo type
      switch (data.type) {
        case 'order.created':
          await this.handleOrderCreated(data);
          break;
        case 'order.paid':
          await this.handleOrderPaid(data);
          break;
        default:
          console.log(`Unknown event type: ${data.type}`);
      }

      // ACK message (xac nhan da xu ly xong)
      await this.redis.xack(stream, 'order-processors', messageId);
    } catch (error) {
      console.error(`Loi xu ly message ${messageId}:`, error);
      // Khong ACK -> message se duoc xu ly lai
    }
  }

  private async handleOrderCreated(data: Record<string, string>): Promise<void> {
    console.log(`Don hang moi: ${data.orderId}, so tien: ${data.amount}`);
    // Xu ly logic...
  }

  private async handleOrderPaid(data: Record<string, string>): Promise<void> {
    console.log(`Don hang da thanh toan: ${data.orderId}`);
    // Xu ly logic...
  }
}
```

---

## 14. Caching Strategies nang cao

### Multi-Level Cache (L1 + L2)

```typescript
// cache/multi-level-cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

/**
 * L1: In-memory cache (nhanh, gioi han dung luong)
 * L2: Redis cache (cham hon L1 nhung lon hon)
 * L3: Database (cham nhat)
 */
@Injectable()
export class MultiLevelCacheService {
  // L1: In-memory cache (Map)
  private l1Cache = new Map<string, { data: any; expiresAt: number }>();
  private l1MaxSize = 1000;

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,  // L2: Redis
  ) {
    // Cleanup L1 cache moi 60 giay
    setInterval(() => this.cleanupL1(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    // L1: In-memory
    const l1 = this.getFromL1<T>(key);
    if (l1 !== null) {
      console.log(`L1 HIT: ${key}`);
      return l1;
    }

    // L2: Redis
    const l2 = await this.getFromL2<T>(key);
    if (l2 !== null) {
      console.log(`L2 HIT: ${key}`);
      // Promote to L1
      this.setL1(key, l2, 60); // L1 TTL ngan hon
      return l2;
    }

    console.log(`CACHE MISS: ${key}`);
    return null;
  }

  async set(key: string, value: any, l1Ttl: number = 60, l2Ttl: number = 3600): Promise<void> {
    // Set both levels
    this.setL1(key, value, l1Ttl);
    await this.setL2(key, value, l2Ttl);
  }

  async del(key: string): Promise<void> {
    this.l1Cache.delete(key);
    await this.redis.del(key);
  }

  // === L1: In-memory ===
  private getFromL1<T>(key: string): T | null {
    const entry = this.l1Cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.l1Cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setL1(key: string, value: any, ttlSeconds: number): void {
    // Evict neu qua dung luong
    if (this.l1Cache.size >= this.l1MaxSize) {
      const firstKey = this.l1Cache.keys().next().value;
      this.l1Cache.delete(firstKey);
    }

    this.l1Cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  // === L2: Redis ===
  private async getFromL2<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private async setL2(key: string, value: any, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  // Cleanup expired entries
  private cleanupL1(): void {
    const now = Date.now();
    for (const [key, entry] of this.l1Cache.entries()) {
      if (now > entry.expiresAt) {
        this.l1Cache.delete(key);
      }
    }
  }
}
```

### Cache Warming (Lam nong cache)

```typescript
// cache/cache-warmer.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class CacheWarmerService implements OnApplicationBootstrap {
  constructor(
    private cacheService: CacheService,
    private productRepo: Repository<Product>,
    private categoryRepo: Repository<Category>,
  ) {}

  // Chay sau khi app khoi dong
  async onApplicationBootstrap() {
    console.log('Bat dau lam nong cache...');

    await Promise.all([
      this.warmProductsCache(),
      this.warmCategoriesCache(),
      this.warmConfigCache(),
    ]);

    console.log('Lam nong cache hoan tat!');
  }

  private async warmProductsCache(): Promise<void> {
    // Cache top products
    const topProducts = await this.productRepo.find({
      order: { salesCount: 'DESC' },
      take: 100,
    });
    await this.cacheService.set('products:top100', topProducts, 3600);

    // Cache featured products
    const featured = await this.productRepo.find({
      where: { isFeatured: true },
    });
    await this.cacheService.set('products:featured', featured, 3600);
  }

  private async warmCategoriesCache(): Promise<void> {
    const categories = await this.categoryRepo.find({
      relations: ['children'],
    });
    await this.cacheService.set('categories:all', categories, 86400);
  }

  private async warmConfigCache(): Promise<void> {
    // Cache config tu database
    // ...
  }
}
```

---

## 15. Common Mistakes

### Loi 1: Su dung KEYS trong production

```typescript
// SAI - KEYS scan toan bo database, block server
const keys = await redis.keys('user:*');

// DUNG - Su dung SCAN (non-blocking, iterate)
async function scanKeys(redis: Redis, pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [nextCursor, foundKeys] = await redis.scan(
      cursor, 'MATCH', pattern, 'COUNT', 100,
    );
    cursor = nextCursor;
    keys.push(...foundKeys);
  } while (cursor !== '0');

  return keys;
}
```

### Loi 2: Khong dat TTL cho cache

```typescript
// SAI - Cache ton tai vinh vien, chiem het memory
await redis.set('user:1', JSON.stringify(user));

// DUNG - Luon dat TTL
await redis.setex('user:1', 3600, JSON.stringify(user)); // 1 gio
```

### Loi 3: Cache stampede (Thundering herd)

```typescript
// SAI - Nhieu requests dong thoi query DB khi cache het han
async getData() {
  let data = await cache.get('popular');
  if (!data) {
    // 1000 requests cung luc -> 1000 DB queries!
    data = await this.heavyQuery();
    await cache.set('popular', data, 300);
  }
  return data;
}

// DUNG - Dung lock de chi 1 request query DB
async getData() {
  let data = await cache.get('popular');
  if (!data) {
    const lockId = await this.redisService.acquireLock('lock:popular', 10);
    if (lockId) {
      try {
        // Double check
        data = await cache.get('popular');
        if (!data) {
          data = await this.heavyQuery();
          await cache.set('popular', data, 300);
        }
      } finally {
        await this.redisService.releaseLock('lock:popular', lockId);
      }
    } else {
      // Cho va thu lai
      await new Promise(r => setTimeout(r, 100));
      return this.getData();
    }
  }
  return data;
}
```

### Loi 4: Luu du lieu qua lon trong cache

```typescript
// SAI - Luu toan bo response lon
await cache.set('all-users', allUsers); // 100MB data!

// DUNG - Chi cache nhung gi can thiet
await cache.set('users:page:1', first20Users);
await cache.set('users:count', totalCount);
```

### Loi 5: Khong serialize/deserialize dung cach

```typescript
// SAI - Luu truc tiep object
await redis.set('user', user); // Luu thanh "[object Object]"

// DUNG - JSON.stringify/parse
await redis.set('user', JSON.stringify(user));
const user = JSON.parse(await redis.get('user'));
```

---

## 16. Best Practices

### 1. Naming Convention cho Keys

```typescript
// DO: Dung dau : de phan cap
'users:123'           // User ID 123
'users:123:posts'     // Posts cua user 123
'cache:products:page:1:limit:10'

// DO: Dung prefix cho app
'myapp:users:123'
'myapp:sessions:abc'

// DON'T: Keys qua dai hoac khong co cau truc
'this_is_a_very_long_key_name_for_user_profile_data_123'
```

### 2. Error Handling

```typescript
// DO: Luon handle Redis errors gracefully
async getCachedData(key: string): Promise<any> {
  try {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    // Log error nhung khong throw
    // App van hoat dong du Redis chet
    console.error('Redis error:', error.message);
    return null;
  }
}
```

### 3. Connection Management

```typescript
// DO: Dung connection pool
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

// DO: Graceful shutdown
async onModuleDestroy() {
  await this.redis.quit(); // Dong ket noi sach se
}
```

### 4. TTL Strategy

```typescript
// Phan loai du lieu va TTL phu hop
const TTL = {
  // Du lieu it thay doi: TTL dai
  CONFIG: 86400,          // 24 gio
  CATEGORIES: 3600,       // 1 gio

  // Du lieu thay doi trung binh: TTL vua
  PRODUCT_DETAIL: 300,    // 5 phut
  USER_PROFILE: 600,      // 10 phut

  // Du lieu thay doi thuong xuyen: TTL ngan
  PRODUCT_LIST: 60,       // 1 phut
  SEARCH_RESULTS: 30,     // 30 giay

  // Session va token
  SESSION: 86400,         // 24 gio
  OTP: 300,               // 5 phut
  RESET_TOKEN: 3600,      // 1 gio
};
```

### 5. Monitoring

```typescript
// Health check
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      if (result === 'PONG') {
        return this.getStatus(key, true);
      }
      return this.getStatus(key, false);
    } catch (error) {
      return this.getStatus(key, false, { error: error.message });
    }
  }
}
```

---

## 17. Bai tap

### Bai tap 1: Caching Layer cho API (Easy)

Xay dung caching layer cho mot REST API:
- Tao CacheService generic voi getOrSet, set, del, delByPattern
- Cache ket qua findAll (TTL 60s), findById (TTL 300s)
- Tu dong invalidate cache khi create, update, delete
- Them cache headers (X-Cache: HIT/MISS)
- Viet unit tests cho CacheService

### Bai tap 2: Rate Limiter (Medium)

Implement rate limiter hoan chinh:
- Fixed Window: 100 requests/phut cho API chung
- Sliding Window: 5 requests/phut cho login
- Token Bucket: 10 tokens, refill 2 tokens/giay cho file upload
- Custom decorator @RateLimit({ limit, window, type })
- Tra ve headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Viet tests

### Bai tap 3: Leaderboard System (Medium)

Dung Sorted Set xay dung he thong leaderboard:
- Them diem cho player
- Lay top 10 players
- Lay ranking cua 1 player
- Lay players xung quanh ranking cua minh (5 tren, 5 duoi)
- Leaderboard theo tuan/thang (tu dong reset)
- API endpoints day du

### Bai tap 4: Real-time Notification System (Hard)

Dung Redis Pub/Sub + Streams:
- Publisher: Gui notifications (order status, new message, system alert)
- Consumer Group: Xu ly va luu notification vao DB
- Pub/Sub: Push notification realtime den WebSocket clients
- Unread count (dung Redis INCR)
- Mark as read (cap nhat cache va DB)
- Notification preferences (user chon nhan loai nao)

### Bai tap 5: Multi-Level Cache voi Cache Warming (Hard)

- L1: In-memory cache (Map hoac LRU Cache)
- L2: Redis
- L3: Database
- Cache warming: Khi app khoi dong, load du lieu "nong" vao cache
- Cache stampede protection: Dung lock
- Stale-while-revalidate: Tra ve du lieu cu trong khi cap nhat ngam
- Monitoring: Hit/miss ratio, cache size, latency
- Dashboard API de xem thong ke cache

---

## Tong ket

Redis la mot cong cu khong the thieu trong backend development hien dai. Cac diem chinh:

1. **Caching**: Giam tai cho database, tang toc do response
2. **Data Structures**: Su dung dung cau truc du lieu cho tung use case
3. **Cache Invalidation**: Chon strategy phu hop (TTL, event-based, write-through)
4. **Pub/Sub**: Giao tiep giua cac services
5. **Rate Limiting**: Bao ve API khoi abuse
6. **Session Store**: Luu session tren Redis cho horizontal scaling
7. **Distributed Lock**: Dam bao data consistency trong distributed system

Khi su dung Redis, luon nho: dat TTL cho keys, xu ly loi gracefully (app van chay du Redis chet), va monitor memory usage.
