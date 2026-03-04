# Service layer pattern

## 3. Service Layer Pattern

### 3.1. Kien truc 3 lop (Three-tier Architecture)

```
┌─────────────────────────────────────┐
│        Controller Layer              │
│  (Nhan request, tra response)       │
│  - Route handling                   │
│  - Input validation (DTO)           │
│  - Response formatting              │
└──────────────┬──────────────────────┘
               │ goi
               ▼
┌─────────────────────────────────────┐
│         Service Layer                │
│  (Business logic)                   │
│  - Xu ly nghiep vu                │
│  - Validation logic phuc tap       │
│  - Orchestration                    │
│  - Transaction management           │
└──────────────┬──────────────────────┘
               │ goi
               ▼
┌─────────────────────────────────────┐
│        Repository Layer              │
│  (Data access)                      │
│  - CRUD operations                  │
│  - Database queries                 │
│  - Data mapping                     │
└─────────────────────────────────────┘
```

### 3.2. Vi du: User Management

```typescript
// === entities/user.entity.ts ===
export class User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// === users.repository.ts ===
// Repository: chi lo data access
@Injectable()
export class UsersRepository {
  private users: User[] = [];
  private nextId = 1;

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: this.nextId++,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date(),
    };
    return this.users[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

// === users.service.ts ===
// Service: business logic, orchestration
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.findAll();
    // Loai bo password truoc khi tra ve
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Business logic: kiem tra email da ton tai
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Business logic: hash password
    const hashedPassword = await this.hashService.hash(createUserDto.password);

    // Tao user
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Business logic: gui email chao mung
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Kiem tra user ton tai
    await this.findOne(id);

    // Neu cap nhat email, kiem tra trung
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // Neu cap nhat password, hash lai
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(updateUserDto.password);
    }

    const user = await this.usersRepository.update(id, updateUserDto);
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}

// === users.controller.ts ===
// Controller: chi lo routing
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```
