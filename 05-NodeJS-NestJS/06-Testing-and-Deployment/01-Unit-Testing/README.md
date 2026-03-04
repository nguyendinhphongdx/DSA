# Unit Testing trong NestJS

## Muc luc

- [1. Gioi thieu Unit Testing](#1-gioi-thieu-unit-testing)
- [2. Jest Basics](#2-jest-basics)
- [3. Jest Matchers](#3-jest-matchers)
- [4. Mock, Stub, Spy](#4-mock-stub-spy)
- [5. Testing trong NestJS - Setup](#5-testing-trong-nestjs---setup)
- [6. Testing Services](#6-testing-services)
- [7. Testing Controllers](#7-testing-controllers)
- [8. Testing Guards](#8-testing-guards)
- [9. Testing Pipes](#9-testing-pipes)
- [10. Testing Interceptors](#10-testing-interceptors)
- [11. Testing Middleware](#11-testing-middleware)
- [12. Code Coverage](#12-code-coverage)
- [13. Common Mistakes](#13-common-mistakes)
- [14. Best Practices](#14-best-practices)
- [15. Bai tap](#15-bai-tap)

---

## 1. Gioi thieu Unit Testing

### Unit Testing la gi?

Unit Testing la ky thuat kiem thu phan mem trong do cac **don vi nho nhat** cua code (function, method, class) duoc kiem tra mot cach **doc lap**. Muc dich la dam bao moi don vi hoat dong dung nhu mong doi.

### Tai sao can Unit Testing?

| Loi ich | Mo ta |
|---------|-------|
| **Phat hien bug som** | Tim loi ngay khi viet code, khong phai doi den production |
| **Tai lieu song** | Tests mo ta cach code hoat dong |
| **Refactor an toan** | Thay doi code ma khong so pha hong tinh nang |
| **Thiet ke tot hon** | Code de test = code de bao tri |
| **Tiet kiem thoi gian** | Tu dong hoa kiem tra, khong can test thu cong |

### Testing Pyramid

```
        /\
       /  \        E2E Tests (it nhat, cham nhat, gia nhat)
      /    \
     /------\
    /        \     Integration Tests (vua phai)
   /          \
  /------------\
 /              \  Unit Tests (nhieu nhat, nhanh nhat, re nhat)
/________________\
```

### Unit Test vs Integration Test vs E2E Test

| Loai | Pham vi | Toc do | Dependencies |
|------|---------|--------|-------------|
| **Unit** | 1 function/method | Rat nhanh (ms) | Mock tat ca |
| **Integration** | Nhieu components | Nhanh (s) | Mock mot phan |
| **E2E** | Toan bo he thong | Cham (s-min) | Khong mock |

---

## 2. Jest Basics

### Cau truc test file

```typescript
// users.service.spec.ts

// describe: Nhom cac tests lien quan
describe('UsersService', () => {
  // Bien dung chung
  let service: UsersService;

  // beforeAll: Chay 1 lan truoc tat ca tests trong describe
  beforeAll(() => {
    console.log('Chay truoc tat ca tests');
  });

  // beforeEach: Chay truoc MOI test
  beforeEach(() => {
    service = new UsersService();
    console.log('Chay truoc moi test');
  });

  // afterEach: Chay sau MOI test
  afterEach(() => {
    console.log('Chay sau moi test');
    jest.clearAllMocks();  // Xoa tat ca mock data
  });

  // afterAll: Chay 1 lan sau tat ca tests
  afterAll(() => {
    console.log('Chay sau tat ca tests');
  });

  // it() hoac test(): Dinh nghia 1 test case
  it('nen tao service thanh cong', () => {
    expect(service).toBeDefined();
  });

  // test() la alias cua it()
  test('nen tao service thanh cong', () => {
    expect(service).toBeDefined();
  });

  // Nested describe
  describe('findAll', () => {
    it('nen tra ve mang users', () => {
      const result = service.findAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  // Skip test
  it.skip('test nay bi bo qua', () => {
    // Khong chay
  });

  // Only run this test (debug)
  it.only('chi chay test nay', () => {
    // Cac tests khac se bi bo qua
  });

  // Todo test (chua viet)
  it.todo('nen xu ly truong hop user khong ton tai');
});
```

### Thu tu thuc thi

```
beforeAll()
  beforeEach()
    test 1
  afterEach()
  beforeEach()
    test 2
  afterEach()
afterAll()
```

### Async Tests

```typescript
describe('Async Tests', () => {
  // Cach 1: async/await
  it('nen lay user tu database', async () => {
    const user = await service.findById(1);
    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
  });

  // Cach 2: return Promise
  it('nen lay user tu database', () => {
    return service.findById(1).then((user) => {
      expect(user).toBeDefined();
    });
  });

  // Cach 3: done callback
  it('nen goi callback', (done) => {
    service.findByIdCallback(1, (error, user) => {
      expect(error).toBeNull();
      expect(user).toBeDefined();
      done();  // Bao Jest test da xong
    });
  });

  // Test timeout (mac dinh 5000ms)
  it('nen hoan thanh trong 10 giay', async () => {
    const result = await service.longRunningTask();
    expect(result).toBe(true);
  }, 10000);  // Custom timeout 10s
});
```

---

## 3. Jest Matchers

### Matchers co ban

```typescript
describe('Jest Matchers', () => {
  // === EQUALITY ===

  // toBe: So sanh chinh xac (===), dung cho primitive
  it('toBe - so sanh primitive', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
    expect(null).toBe(null);
    expect(undefined).toBe(undefined);
  });

  // toEqual: So sanh sau (deep equality), dung cho object/array
  it('toEqual - so sanh object', () => {
    const obj1 = { name: 'A', age: 25 };
    const obj2 = { name: 'A', age: 25 };
    expect(obj1).toEqual(obj2);        // PASS
    // expect(obj1).toBe(obj2);        // FAIL (khac reference)

    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  // toStrictEqual: Giong toEqual nhung kiem tra ca undefined properties va class
  it('toStrictEqual - so sanh nghiem ngat', () => {
    class User {
      constructor(public name: string) {}
    }
    expect(new User('A')).toStrictEqual(new User('A')); // PASS
    // expect(new User('A')).toStrictEqual({ name: 'A' }); // FAIL (khac class)

    expect({ a: 1 }).toStrictEqual({ a: 1 });
    // expect({ a: 1, b: undefined }).toStrictEqual({ a: 1 }); // FAIL
  });

  // not: Phu dinh
  it('not - phu dinh', () => {
    expect(1).not.toBe(2);
    expect('hello').not.toBe('world');
    expect([1, 2]).not.toEqual([1, 3]);
  });

  // === TRUTHINESS ===

  it('truthiness matchers', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('hello').toBeDefined();

    expect(true).toBeTruthy();
    expect(1).toBeTruthy();
    expect('hello').toBeTruthy();

    expect(false).toBeFalsy();
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
  });

  // === NUMBERS ===

  it('number matchers', () => {
    expect(10).toBeGreaterThan(5);
    expect(10).toBeGreaterThanOrEqual(10);
    expect(5).toBeLessThan(10);
    expect(5).toBeLessThanOrEqual(5);

    // So thap phan: dung toBeCloseTo thay vi toBe
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    // expect(0.1 + 0.2).toBe(0.3); // FAIL! (floating point)

    expect(NaN).toBeNaN();
  });

  // === STRINGS ===

  it('string matchers', () => {
    expect('Hello World').toContain('World');
    expect('Hello World').toMatch(/hello/i);  // Regex
    expect('Hello World').toMatch('Hello');
    expect('Hello').toHaveLength(5);
  });

  // === ARRAYS ===

  it('array matchers', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(arr).toContain(3);
    expect(arr).toHaveLength(5);
    expect(arr).toEqual(expect.arrayContaining([1, 3, 5]));
    // Mang chua tat ca cac phan tu duoc chi dinh (bat ky thu tu)

    const users = [
      { name: 'A', age: 25 },
      { name: 'B', age: 30 },
    ];
    expect(users).toContainEqual({ name: 'A', age: 25 });
    // Dung toContainEqual cho object trong array
  });

  // === OBJECTS ===

  it('object matchers', () => {
    const user = {
      name: 'A',
      email: 'a@email.com',
      age: 25,
      address: { city: 'HN' },
    };

    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('name', 'A');
    expect(user).toHaveProperty('address.city', 'HN'); // Nested

    expect(user).toMatchObject({
      name: 'A',
      email: 'a@email.com',
    });
    // toMatchObject: Kiem tra object chua cac properties duoc chi dinh
    // Khong can khop tat ca properties

    expect(user).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        age: expect.any(Number),
      }),
    );
  });

  // === EXCEPTIONS ===

  it('exception matchers', () => {
    // Test throw error
    const throwError = () => {
      throw new Error('Loi xay ra');
    };

    expect(throwError).toThrow();
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Loi xay ra');
    expect(throwError).toThrow(/loi/i);

    // Test KHONG throw
    const safeFunction = () => 'OK';
    expect(safeFunction).not.toThrow();
  });

  // === ASYNC MATCHERS ===

  it('async matchers', async () => {
    // resolves: Test Promise resolve
    await expect(Promise.resolve('data')).resolves.toBe('data');
    await expect(Promise.resolve({ name: 'A' })).resolves.toEqual({ name: 'A' });

    // rejects: Test Promise reject
    await expect(Promise.reject(new Error('Loi'))).rejects.toThrow('Loi');
    await expect(Promise.reject('error')).rejects.toBe('error');

    // Voi async function
    const asyncFn = async () => {
      throw new Error('Async error');
    };
    await expect(asyncFn()).rejects.toThrow('Async error');
  });

  // === FUNCTION CALL MATCHERS ===

  it('function call matchers', () => {
    const mockFn = jest.fn();

    // Goi function
    mockFn('a', 'b');
    mockFn('c');

    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('a', 'b');
    expect(mockFn).toHaveBeenLastCalledWith('c');
    expect(mockFn).toHaveBeenNthCalledWith(1, 'a', 'b');

    // Return value
    const mockReturn = jest.fn().mockReturnValue(42);
    expect(mockReturn()).toBe(42);
    expect(mockReturn).toHaveReturnedWith(42);
  });

  // === SNAPSHOT MATCHERS ===

  it('snapshot matchers', () => {
    const user = {
      name: 'Test User',
      email: 'test@email.com',
      createdAt: expect.any(Date), // Ignore gia tri cu the
    };

    // Lan dau: Tao snapshot file
    // Lan sau: So sanh voi snapshot
    expect(user).toMatchSnapshot();

    // Inline snapshot
    expect(user).toMatchInlineSnapshot(`
      {
        "createdAt": Any<Date>,
        "email": "test@email.com",
        "name": "Test User",
      }
    `);
  });
});
```

### Custom Matchers

```typescript
// test/custom-matchers.ts
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `"${received}" la email hop le`
          : `"${received}" KHONG phai email hop le`,
    };
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;

    return {
      pass,
      message: () =>
        `Expected ${received} ${pass ? 'not ' : ''}to be within range ${floor}-${ceiling}`,
    };
  },
});

// Khai bao type (TypeScript)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Su dung
it('nen la email hop le', () => {
  expect('test@email.com').toBeValidEmail();
  expect('invalid').not.toBeValidEmail();
});

it('nen nam trong khoang', () => {
  expect(50).toBeWithinRange(1, 100);
});
```

---

## 4. Mock, Stub, Spy

### jest.fn() - Mock Function

```typescript
describe('jest.fn() - Mock Function', () => {
  // Tao mock function co ban
  it('tao mock function don gian', () => {
    const mockFn = jest.fn();

    mockFn('hello');
    mockFn('world');

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn.mock.calls).toEqual([['hello'], ['world']]);
  });

  // Mock return value
  it('mock return value', () => {
    const mockFn = jest.fn()
      .mockReturnValue('default')         // Gia tri mac dinh
      .mockReturnValueOnce('first')       // Lan goi thu 1
      .mockReturnValueOnce('second');     // Lan goi thu 2

    expect(mockFn()).toBe('first');       // Lan 1: 'first'
    expect(mockFn()).toBe('second');      // Lan 2: 'second'
    expect(mockFn()).toBe('default');     // Lan 3+: 'default'
  });

  // Mock resolved value (async)
  it('mock resolved value', async () => {
    const mockAsync = jest.fn()
      .mockResolvedValue({ id: 1, name: 'User' })       // Mac dinh
      .mockResolvedValueOnce({ id: 1, name: 'First' })  // Lan 1
      .mockRejectedValueOnce(new Error('Loi'));          // Lan 2: reject

    const result1 = await mockAsync();
    expect(result1).toEqual({ id: 1, name: 'First' });

    await expect(mockAsync()).rejects.toThrow('Loi');

    const result3 = await mockAsync();
    expect(result3).toEqual({ id: 1, name: 'User' });
  });

  // Mock implementation
  it('mock implementation', () => {
    const mockFn = jest.fn().mockImplementation((a: number, b: number) => {
      return a + b;
    });

    expect(mockFn(1, 2)).toBe(3);
    expect(mockFn(10, 20)).toBe(30);

    // mockImplementationOnce
    mockFn.mockImplementationOnce((a, b) => a * b);
    expect(mockFn(3, 4)).toBe(12);   // Nhan
    expect(mockFn(3, 4)).toBe(7);    // Cong (quay ve implementation mac dinh)
  });

  // Truy cap mock data
  it('truy cap mock data', () => {
    const mockFn = jest.fn().mockReturnValue('result');

    mockFn('arg1', 'arg2');
    mockFn('arg3');

    // mock.calls: Mang cac lan goi
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[0]).toEqual(['arg1', 'arg2']);
    expect(mockFn.mock.calls[1]).toEqual(['arg3']);

    // mock.results: Mang cac ket qua
    expect(mockFn.mock.results[0].value).toBe('result');

    // mock.instances: Mang cac instances (khi dung new)
  });
});
```

### jest.spyOn() - Spy on existing method

```typescript
describe('jest.spyOn() - Spy', () => {
  class Calculator {
    add(a: number, b: number): number {
      return a + b;
    }

    multiply(a: number, b: number): number {
      return a * b;
    }

    async fetchRate(): Promise<number> {
      // Call API that gia...
      return 1.0;
    }
  }

  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  afterEach(() => {
    jest.restoreAllMocks();  // Khoi phuc lai methods goc
  });

  // Spy: Theo doi method call ma VAN GIU implementation goc
  it('spy theo doi method goc', () => {
    const addSpy = jest.spyOn(calc, 'add');

    const result = calc.add(1, 2);

    expect(result).toBe(3);              // Van chay code goc
    expect(addSpy).toHaveBeenCalledWith(1, 2);
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  // Spy + Mock: Thay doi implementation
  it('spy va mock implementation', () => {
    jest.spyOn(calc, 'add').mockReturnValue(999);

    const result = calc.add(1, 2);

    expect(result).toBe(999);            // Tra ve gia tri mock
  });

  // Spy async method
  it('spy async method', async () => {
    jest.spyOn(calc, 'fetchRate').mockResolvedValue(23500);

    const rate = await calc.fetchRate();

    expect(rate).toBe(23500);
  });

  // Spy console.log
  it('spy console.log', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    console.log('Hello');
    console.log('World');

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith('Hello');

    consoleSpy.mockRestore();
  });
});
```

### jest.mock() - Mock module

```typescript
// === Mock module ===

// Mock toan bo module
jest.mock('./users.repository');
jest.mock('axios');

// Mock voi factory function
jest.mock('./email.service', () => {
  return {
    EmailService: jest.fn().mockImplementation(() => ({
      sendEmail: jest.fn().mockResolvedValue(true),
      sendBulk: jest.fn().mockResolvedValue({ sent: 10, failed: 0 }),
    })),
  };
});

// Mock partial - chi mock mot so functions
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),  // Giu lai functions goc
  generateToken: jest.fn().mockReturnValue('mock-token'),
  // Chi mock generateToken
}));

// === Su dung trong test ===
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  it('nen goi API va tra ve data', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { users: [{ id: 1, name: 'Test' }] },
    });

    const result = await apiService.getUsers();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users');
    expect(result).toEqual([{ id: 1, name: 'Test' }]);
  });

  it('nen xu ly loi API', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(apiService.getUsers()).rejects.toThrow('Network Error');
  });
});
```

---

## 5. Testing trong NestJS - Setup

### Tao Testing Module

```typescript
// users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    // Tao mock repository
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // Tao testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          // Mock TypeORM Repository
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('nen duoc dinh nghia', () => {
    expect(service).toBeDefined();
  });
});
```

### Mock Providers Pattern

```typescript
// test/mocks/mock-repository.ts
export const createMockRepository = <T = any>() => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  })),
});

// test/mocks/mock-config-service.ts
export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      DATABASE_URL: 'postgres://test',
    };
    return config[key];
  }),
});

// test/mocks/mock-cache-manager.ts
export const createMockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
});
```

---

## 6. Testing Services

### Vi du day du: UsersService

```typescript
// users/users.service.ts (Code can test)
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User voi ID ${id} khong ton tai`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email da ton tai');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });
    return this.userRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }
}
```

```typescript
// users/users.service.spec.ts (Unit Tests)
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  // Mock data
  const mockUser: User = {
    id: 1,
    name: 'Nguyen Van A',
    email: 'a@email.com',
    password: 'hashed_password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as User;

  const mockUsers: User[] = [
    mockUser,
    {
      id: 2,
      name: 'Tran Van B',
      email: 'b@email.com',
      password: 'hashed_password',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    } as User,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('nen duoc dinh nghia', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // findAll()
  // ==========================================
  describe('findAll', () => {
    it('nen tra ve mang tat ca users', async () => {
      // Arrange
      repository.find.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('nen tra ve mang rong khi khong co users', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ==========================================
  // findById()
  // ==========================================
  describe('findById', () => {
    it('nen tra ve user khi tim thay', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('nen throw NotFoundException khi khong tim thay', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById(999)).rejects.toThrow(
        'User voi ID 999 khong ton tai',
      );
    });
  });

  // ==========================================
  // findByEmail()
  // ==========================================
  describe('findByEmail', () => {
    it('nen tra ve user khi tim thay email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('a@email.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@email.com' },
      });
    });

    it('nen tra ve null khi khong tim thay email', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@email.com');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // create()
  // ==========================================
  describe('create', () => {
    const createDto: CreateUserDto = {
      name: 'New User',
      email: 'new@email.com',
      password: 'password123',
    };

    it('nen tao user moi thanh cong', async () => {
      // Mock findByEmail tra ve null (email chua ton tai)
      repository.findOne.mockResolvedValue(null);

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock create va save
      const newUser = { ...createDto, id: 3, password: 'hashed_password' };
      repository.create.mockReturnValue(newUser as User);
      repository.save.mockResolvedValue(newUser as User);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.name).toBe('New User');
      expect(result.email).toBe('new@email.com');
      expect(result.password).toBe('hashed_password');

      // Verify bcrypt duoc goi dung
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      // Verify repository methods duoc goi dung
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashed_password',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('nen throw ConflictException khi email da ton tai', async () => {
      // Mock findByEmail tra ve user (email da ton tai)
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Email da ton tai',
      );

      // Verify khong goi create/save
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // update()
  // ==========================================
  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('nen cap nhat user thanh cong', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser as User);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Updated Name');
      expect(repository.save).toHaveBeenCalled();
    });

    it('nen throw NotFoundException khi user khong ton tai', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ==========================================
  // remove()
  // ==========================================
  describe('remove', () => {
    it('nen xoa user thanh cong', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('nen throw NotFoundException khi user khong ton tai', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
```

---

## 7. Testing Controllers

```typescript
// users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@email.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('nen tra ve mang users', async () => {
      const expected = [mockUser];
      service.findAll.mockResolvedValue(expected as any);

      const result = await controller.findAll();

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('nen tra ve user theo ID', async () => {
      service.findById.mockResolvedValue(mockUser as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('nen throw NotFoundException', async () => {
      service.findById.mockRejectedValue(
        new NotFoundException('User khong ton tai'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('nen tao user moi', async () => {
      const dto: CreateUserDto = {
        name: 'New User',
        email: 'new@email.com',
        password: '123456',
      };
      const expected = { id: 2, ...dto };
      service.create.mockResolvedValue(expected as any);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('nen cap nhat user', async () => {
      const dto = { name: 'Updated' };
      const expected = { ...mockUser, ...dto };
      service.update.mockResolvedValue(expected as any);

      const result = await controller.update('1', dto);

      expect(result.name).toBe('Updated');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('nen xoa user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
```

---

## 8. Testing Guards

```typescript
// guards/roles.guard.ts (Code can test)
import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Khong yeu cau role -> cho phep
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Chua xac thuc');
    }

    const hasRole = requiredRoles.some((role) =>
      user.roles?.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Khong co quyen truy cap');
    }

    return true;
  }
}
```

```typescript
// guards/roles.guard.spec.ts
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  // Helper: Tao mock ExecutionContext
  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('nen cho phep khi khong co roles requirement', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('nen cho phep khi user co role yeu cau', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockContext({
      id: 1,
      roles: ['admin', 'user'],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('nen throw ForbiddenException khi user khong co role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockContext({
      id: 1,
      roles: ['user'],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('nen throw ForbiddenException khi khong co user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Chua xac thuc');
  });

  it('nen kiem tra nhieu roles (OR logic)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      'admin',
      'moderator',
    ]);

    const context = createMockContext({
      id: 1,
      roles: ['moderator'],  // Co 1 trong cac roles yeu cau
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
```

---

## 9. Testing Pipes

```typescript
// pipes/parse-int.pipe.ts
import {
  PipeTransform, Injectable, ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        `"${value}" khong phai la so nguyen hop le`,
      );
    }
    if (val < 0) {
      throw new BadRequestException('Gia tri phai >= 0');
    }
    return val;
  }
}
```

```typescript
// pipes/parse-int.pipe.spec.ts
import { ParseIntPipe } from './parse-int.pipe';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';

describe('ParseIntPipe', () => {
  let pipe: ParseIntPipe;

  const metadata: ArgumentMetadata = {
    type: 'param',
    metatype: Number,
    data: 'id',
  };

  beforeEach(() => {
    pipe = new ParseIntPipe();
  });

  it('nen chuyen doi string thanh number', () => {
    expect(pipe.transform('42', metadata)).toBe(42);
    expect(pipe.transform('0', metadata)).toBe(0);
    expect(pipe.transform('100', metadata)).toBe(100);
  });

  it('nen throw BadRequestException cho gia tri khong hop le', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('12.5', metadata)).toThrow(BadRequestException);
  });

  it('nen throw BadRequestException cho so am', () => {
    expect(() => pipe.transform('-1', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('-100', metadata)).toThrow('Gia tri phai >= 0');
  });
});
```

### Testing Validation Pipe phuc tap hon

```typescript
// pipes/validation.pipe.ts
import {
  PipeTransform, Injectable, ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) =>
        Object.values(error.constraints).join(', '),
      );
      throw new BadRequestException({
        message: 'Validation that bai',
        errors: messages,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

```typescript
// pipes/validation.pipe.spec.ts
import { CustomValidationPipe } from './validation.pipe';
import { BadRequestException } from '@nestjs/common';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

// DTO cho test
class TestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

describe('CustomValidationPipe', () => {
  let pipe: CustomValidationPipe;

  beforeEach(() => {
    pipe = new CustomValidationPipe();
  });

  it('nen thong qua validation voi data hop le', async () => {
    const value = {
      name: 'Test User',
      email: 'test@email.com',
      password: '123456',
    };

    const result = await pipe.transform(value, {
      type: 'body',
      metatype: TestDto,
    });

    expect(result).toEqual(value);
  });

  it('nen throw BadRequestException voi data khong hop le', async () => {
    const value = {
      name: '',
      email: 'invalid-email',
      password: '123',
    };

    await expect(
      pipe.transform(value, { type: 'body', metatype: TestDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('nen bo qua validation cho kieu primitive', async () => {
    const result = await pipe.transform('hello', {
      type: 'param',
      metatype: String,
    });

    expect(result).toBe('hello');
  });
});
```

---

## 10. Testing Interceptors

```typescript
// interceptors/logging.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`[${method}] ${url} - Bat dau`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const elapsed = Date.now() - startTime;
          this.logger.log(`[${method}] ${url} - Hoan thanh (${elapsed}ms)`);
        },
        error: (error) => {
          const elapsed = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${url} - Loi: ${error.message} (${elapsed}ms)`,
          );
        },
      }),
    );
  }
}
```

```typescript
// interceptors/logging.interceptor.spec.ts
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  // Helper: Tao mock ExecutionContext
  const createMockContext = (method = 'GET', url = '/test'): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
        getResponse: () => ({}),
      }),
      getClass: () => jest.fn(),
      getHandler: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  // Helper: Tao mock CallHandler
  const createMockCallHandler = (response: any): CallHandler => ({
    handle: () => of(response),
  });

  it('nen tra ve data tu next handler', (done) => {
    const context = createMockContext();
    const handler = createMockCallHandler({ data: 'test' });

    interceptor.intercept(context, handler).subscribe({
      next: (value) => {
        expect(value).toEqual({ data: 'test' });
        done();
      },
    });
  });

  it('nen log request method va URL', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');
    const context = createMockContext('POST', '/users');
    const handler = createMockCallHandler({ id: 1 });

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('[POST] /users'),
        );
        done();
      },
    });
  });

  it('nen log loi khi handler throw error', (done) => {
    const errorSpy = jest.spyOn(interceptor['logger'], 'error');
    const context = createMockContext();
    const handler: CallHandler = {
      handle: () => throwError(() => new Error('Test error')),
    };

    interceptor.intercept(context, handler).subscribe({
      error: () => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Loi: Test error'),
        );
        done();
      },
    });
  });
});
```

### Testing Transform Interceptor

```typescript
// interceptors/transform.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ResponseFormat<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

```typescript
// interceptors/transform.interceptor.spec.ts
import { TransformInterceptor } from './transform.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const mockContext = {} as ExecutionContext;

  it('nen wrap response trong format chuan', (done) => {
    const data = { id: 1, name: 'Test' };
    const handler: CallHandler = { handle: () => of(data) };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value).toEqual({
          success: true,
          data: { id: 1, name: 'Test' },
          timestamp: expect.any(String),
        });
        done();
      },
    });
  });

  it('nen wrap mang response', (done) => {
    const data = [{ id: 1 }, { id: 2 }];
    const handler: CallHandler = { handle: () => of(data) };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value.success).toBe(true);
        expect(value.data).toHaveLength(2);
        done();
      },
    });
  });

  it('nen wrap null response', (done) => {
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value.success).toBe(true);
        expect(value.data).toBeNull();
        done();
      },
    });
  });
});
```

---

## 11. Testing Middleware

```typescript
// middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsed = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${elapsed}ms - ${ip} - ${userAgent}`,
      );
    });

    next();
  }
}
```

```typescript
// middleware/logger.middleware.spec.ts
import { LoggerMiddleware } from './logger.middleware';
import { Request, Response } from 'express';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/users',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('TestAgent/1.0'),
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('nen goi next()', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('nen dang ky finish event listener', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.on).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );
  });

  it('nen log request info khi response finish', () => {
    const logSpy = jest.spyOn(middleware['logger'], 'log');

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Simulate response finish
    const finishCallback = (mockResponse.on as jest.Mock).mock.calls[0][1];
    finishCallback();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/users 200'),
    );
  });
});
```

---

## 12. Code Coverage

### Chay coverage

```bash
# Chay tests voi coverage report
npm run test -- --coverage

# Hoac
npx jest --coverage

# Coverage cho 1 file
npx jest --coverage users.service.spec.ts

# Coverage voi verbose
npx jest --coverage --verbose
```

### Cau hinh Coverage trong package.json

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.module.ts",
      "!**/*.dto.ts",
      "!**/*.entity.ts",
      "!**/*.interface.ts",
      "!**/main.ts",
      "!**/*.spec.ts",
      "!**/index.ts"
    ],
    "coverageDirectory": "../coverage",
    "coverageReporters": ["text", "text-summary", "lcov", "html"],
    "testEnvironment": "node",
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "./src/users/": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Doc hieu Coverage Report

```
-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------|---------|----------|---------|---------|-------------------
All files    |   85.71 |    83.33 |   90.00 |   85.00 |
 users.svc   |   95.00 |    90.00 |  100.00 |   94.00 | 45,67
 auth.svc    |   75.00 |    70.00 |   80.00 |   74.00 | 23-30,55-60
-------------|---------|----------|---------|---------|-------------------
```

| Metric | Mo ta |
|--------|-------|
| **Statements** | Phan tram cac cau lenh duoc thuc thi |
| **Branches** | Phan tram cac nhanh if/else/switch duoc thuc thi |
| **Functions** | Phan tram cac function duoc goi |
| **Lines** | Phan tram cac dong code duoc thuc thi |

---

## 13. Common Mistakes

### Loi 1: Test implementation, khong test behavior

```typescript
// SAI - Test chi tiet implementation
it('nen goi repository.find voi dung params', async () => {
  await service.findAll();
  expect(repository.find).toHaveBeenCalledWith({
    order: { createdAt: 'DESC' },
    relations: ['profile'],
  });
});
// Van de: Neu thay doi implementation (vd: them pagination),
// test se fail du behavior van dung

// DUNG - Test behavior/output
it('nen tra ve danh sach users', async () => {
  repository.find.mockResolvedValue(mockUsers);

  const result = await service.findAll();

  expect(result).toEqual(mockUsers);
  expect(result).toHaveLength(2);
});
```

### Loi 2: Khong clear mocks giua cac tests

```typescript
// SAI - Mocks tu test truoc anh huong test sau
describe('Service', () => {
  it('test 1', () => {
    mockFn.mockReturnValue(true);
    // ...
  });

  it('test 2', () => {
    // mockFn van return true tu test 1!
  });
});

// DUNG - Clear mocks
afterEach(() => {
  jest.clearAllMocks();   // Xoa calls, instances, results
  // hoac
  jest.resetAllMocks();   // Clear + reset implementations
  // hoac
  jest.restoreAllMocks(); // Reset + restore spyOn
});
```

### Loi 3: Test qua nhieu trong 1 test case

```typescript
// SAI - 1 test kiem tra qua nhieu thu
it('nen CRUD users', async () => {
  // Create
  const user = await service.create(dto);
  expect(user).toBeDefined();
  // Find
  const found = await service.findById(user.id);
  expect(found.name).toBe(dto.name);
  // Update
  const updated = await service.update(user.id, { name: 'New' });
  expect(updated.name).toBe('New');
  // Delete
  await service.remove(user.id);
  await expect(service.findById(user.id)).rejects.toThrow();
});

// DUNG - Moi test kiem tra 1 behavior
it('nen tao user', async () => { /* ... */ });
it('nen tim user theo ID', async () => { /* ... */ });
it('nen cap nhat user', async () => { /* ... */ });
it('nen xoa user', async () => { /* ... */ });
```

### Loi 4: Khong test error cases

```typescript
// SAI - Chi test happy path
describe('findById', () => {
  it('nen tra ve user', async () => { /* ... */ });
  // Thieu test cho truong hop khong tim thay!
});

// DUNG - Test ca happy va unhappy paths
describe('findById', () => {
  it('nen tra ve user khi tim thay', async () => { /* ... */ });
  it('nen throw NotFoundException khi khong tim thay', async () => { /* ... */ });
  it('nen throw BadRequestException khi ID khong hop le', async () => { /* ... */ });
});
```

### Loi 5: Su dung real dependencies trong unit test

```typescript
// SAI - Su dung real database
const module = await Test.createTestingModule({
  imports: [TypeOrmModule.forRoot(realDbConfig)], // Ket noi DB that!
  providers: [UsersService],
}).compile();

// DUNG - Mock dependencies
const module = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: createMockRepository(), // Mock!
    },
  ],
}).compile();
```

---

## 14. Best Practices

### 1. AAA Pattern (Arrange - Act - Assert)

```typescript
it('nen tao user moi thanh cong', async () => {
  // ARRANGE - Chuan bi data va mocks
  const dto: CreateUserDto = { name: 'Test', email: 'test@email.com', password: '123456' };
  repository.findOne.mockResolvedValue(null);
  repository.create.mockReturnValue({ id: 1, ...dto } as User);
  repository.save.mockResolvedValue({ id: 1, ...dto } as User);

  // ACT - Thuc hien hanh dong can test
  const result = await service.create(dto);

  // ASSERT - Kiem tra ket qua
  expect(result).toBeDefined();
  expect(result.name).toBe('Test');
  expect(result.email).toBe('test@email.com');
});
```

### 2. Test Naming Convention

```typescript
// Pattern: nen + [hanh dong] + khi + [dieu kien]
it('nen tra ve user khi tim thay ID', async () => {});
it('nen throw NotFoundException khi ID khong ton tai', async () => {});
it('nen hash password truoc khi luu', async () => {});
it('nen tra ve mang rong khi khong co data', async () => {});
```

### 3. Test Isolation

```typescript
// Moi test doc lap, khong phu thuoc vao test khac
describe('UsersService', () => {
  let service: UsersService;

  // Reset moi thu truoc moi test
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

### 4. Test Data Factories

```typescript
// test/factories/user.factory.ts
import { User } from '../../src/users/entities/user.entity';

let idCounter = 1;

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: idCounter++,
    name: 'Test User',
    email: `test${idCounter}@email.com`,
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

export function createMockUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({ name: `User ${i + 1}`, ...overrides }),
  );
}

// Su dung
it('test voi factory', async () => {
  const user = createMockUser({ name: 'Admin', role: 'admin' });
  const users = createMockUsers(5);
});
```

### 5. Organize Test Files

```
src/
  users/
    users.service.ts
    users.service.spec.ts      # Unit test cung folder
    users.controller.ts
    users.controller.spec.ts
test/
  factories/                   # Test data factories
    user.factory.ts
  mocks/                       # Shared mocks
    mock-repository.ts
    mock-config-service.ts
  e2e/                         # E2E tests
    users.e2e-spec.ts
  jest-setup.ts                # Global setup
```

---

## 15. Bai tap

### Bai tap 1: Test Service voi Cache (Easy)

Viet unit tests cho ProductsService co caching:
- findAll: Kiem tra cache hit va cache miss
- findById: Kiem tra cache, query DB khi miss, save to cache
- create: Kiem tra invalidate cache sau khi tao
- update: Kiem tra cap nhat cache
- remove: Kiem tra xoa cache

### Bai tap 2: Test Auth Service (Medium)

Viet unit tests cho AuthService:
- register: Hash password, kiem tra email trung, tao user
- login: Tim user, so sanh password, tao JWT token
- validateToken: Verify JWT, tra ve user
- refreshToken: Kiem tra refresh token, tao cap token moi
- changePassword: So sanh old password, hash new password, cap nhat
- Test ca happy path va error cases

### Bai tap 3: Test Guard + Decorator (Medium)

Viet unit tests cho:
- JwtAuthGuard: Kiem tra token trong header, validate, attach user to request
- RolesGuard: Kiem tra roles tu metadata, so sanh voi user roles
- Custom decorator @CurrentUser(): Lay user tu request
- Test cac truong hop: khong co token, token het han, token khong hop le, khong co quyen

### Bai tap 4: Test Interceptor phuc tap (Medium)

Viet unit tests cho TransformInterceptor:
- Wrap response thanh { success: true, data, meta }
- Them pagination meta cho list responses
- Xu ly null/undefined response
- Khong wrap khi co @SkipTransform() decorator
- Log request/response

### Bai tap 5: Test toan bo CRUD Module (Hard)

Tao va test day du 1 module Articles:
- ArticlesService: CRUD + search + pagination + cache
- ArticlesController: Routes + validation + authorization
- CreateArticleDto: Validation rules
- RolesGuard: RBAC
- Dat muc tieu coverage >= 90%
- Su dung factories cho test data

---

## Tong ket

Unit Testing trong NestJS giup dam bao chat luong code va giam thieu bugs. Cac diem chinh:

1. **Jest Basics**: Nam vung describe, it, expect, beforeEach, afterEach
2. **Matchers**: Biet cach su dung dung matcher cho tung truong hop
3. **Mocking**: Mock dependencies de isolate unit can test
4. **Test Module**: Su dung Test.createTestingModule() de setup NestJS testing
5. **Test moi thanh phan**: Service, Controller, Guard, Pipe, Interceptor, Middleware
6. **AAA Pattern**: Arrange - Act - Assert cho moi test case
7. **Coverage**: Dat va theo doi muc tieu coverage

Loi khuyen quan trong nhat: **Viet test cho behavior, khong phai implementation**. Tests nen mo ta code lam gi, khong phai code lam nhu the nao.
