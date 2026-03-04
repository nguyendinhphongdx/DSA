# CASL va Policies Pattern

## 9. CASL - Attribute-based Access Control

CASL la thu vien JavaScript ho tro **Attribute-based Access Control (ABAC)** - phan quyen dua tren thuoc tinh cua doi tuong. Linh hoat hon RBAC vi co the kiem tra: "User nay co duoc sua bai viet nay khong?" (khong chi la "User co role editor khong?").

### Cai dat

```bash
npm install @casl/ability
```

### Dinh nghia Abilities

```typescript
// casl/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';

// Dinh nghia cac entity
export class Article {
  id: number;
  title: string;
  authorId: number;
  isPublished: boolean;
}

export class User {
  id: number;
  username: string;
  roles: string[];
}

// Dinh nghia cac action co the thuc hien
export enum Action {
  Manage = 'manage', // Tat ca cac action (wildcard)
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Dinh nghia cac subject (doi tuong ma action tac dong len)
type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.roles.includes('admin')) {
      // Admin co the lam moi thu voi moi doi tuong
      can(Action.Manage, 'all');
    } else if (user.roles.includes('editor')) {
      // Editor co the doc tat ca
      can(Action.Read, Article);
      // Editor co the tao bai viet
      can(Action.Create, Article);
      // Editor CHI co the sua bai viet cua CHINH MINH
      can(Action.Update, Article, { authorId: user.id });
      // Editor KHONG the xoa bai viet da publish
      can(Action.Delete, Article, { authorId: user.id, isPublished: false });
    } else {
      // User thuong chi doc duoc bai viet da publish
      can(Action.Read, Article, { isPublished: true });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
```

### CASL Guard

```typescript
// casl/guards/policies.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, AppAbility } from '../casl-ability.factory';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';

// Interface cho Policy handler
export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

// Hoac dung function
type PolicyHandlerCallback = (ability: AppAbility) => boolean;
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

### Decorators cho CASL

```typescript
// casl/decorators/check-policies.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../guards/policies.guard';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

### Su dung trong Controller

```typescript
// articles/articles.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { Action, Article } from '../casl/casl-ability.factory';

@Controller('articles')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ArticlesController {

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, Article))
  findAll() {
    return 'Danh sach bai viet';
  }

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, Article))
  create() {
    return 'Tao bai viet';
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, Article))
  update(@Param('id') id: string) {
    return `Cap nhat bai viet #${id}`;
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, Article))
  remove(@Param('id') id: string) {
    return `Xoa bai viet #${id}`;
  }
}
```

---

## 10. Policies Pattern

Policies pattern la mot cach to chuc code authorization thanh cac policy class rieng biet, giup code sach hon va de bao tri.

```typescript
// policies/read-article.policy.ts
import { AppAbility, Action, Article } from '../casl/casl-ability.factory';
import { IPolicyHandler } from '../casl/guards/policies.guard';

export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Read, Article);
  }
}
```

```typescript
// policies/create-article.policy.ts
export class CreateArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Create, Article);
  }
}
```

```typescript
// policies/update-article.policy.ts
export class UpdateArticlePolicyHandler implements IPolicyHandler {
  private article: Article;

  constructor(article: Article) {
    this.article = article;
  }

  handle(ability: AppAbility): boolean {
    return ability.can(Action.Update, this.article);
  }
}
```

```typescript
// Su dung policy class
@Controller('articles')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ArticlesController {

  @Get()
  @CheckPolicies(new ReadArticlePolicyHandler())
  findAll() { }

  @Post()
  @CheckPolicies(new CreateArticlePolicyHandler())
  create() { }
}
```
