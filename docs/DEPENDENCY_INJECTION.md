# Dependency Injection with Awilix

This project uses [Awilix](https://github.com/jeffijoe/awilix) - a powerful, lightweight dependency injection container for JavaScript/TypeScript with automatic dependency resolution.

## Why Awilix?

- ✅ **Auto-wiring** - automatically resolves dependencies based on constructor parameter names
- ✅ **Type-safe** - full TypeScript support with generics
- ✅ **Simple API** - register classes/values with minimal boilerplate
- ✅ **Flexible lifetimes** - singleton, scoped, and transient registrations
- ✅ **Battle-tested** - widely used in production applications

## Architecture

The DI system consists of:

### 1. Container (`src/di/container.ts`)

Type-safe Awilix container with all dependencies defined:

```typescript
import { createContainer, AwilixContainer, InjectionMode } from 'awilix';

export interface Container {
  db: Db;
  userRepository: UserRepository;
  userService: UserService;
  userController: UserController;
}

export const container: AwilixContainer<Container> = createContainer<Container>({
  injectionMode: InjectionMode.CLASSIC
});
```

### 2. Setup (`src/di/setup.ts`)

Registration using Awilix's `asClass` and `asValue`:

```typescript
export function setupContainer(db: Db): void {
  container.register({
    db: asValue(db),                              // Singleton value
    userRepository: asClass(UserRepository).singleton(),  // Auto-wired!
    userService: asClass(UserService).singleton(),        // Auto-wired!
    userController: asClass(UserController).singleton()   // Auto-wired!
  });
}
```

**Auto-wiring Magic:** Awilix automatically injects dependencies based on constructor parameter names. No manual wiring needed!

## Usage Pattern

### 1. Define Interfaces
```typescript
// src/modules/user/interfaces/user-service.interface.ts
export interface IUserService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  // ...
}
```

### 2. Implement with Constructor Injection

**IMPORTANT:** Constructor parameter names must match container registration names for auto-wiring:

```typescript
// ✅ Correct - parameter name 'userRepository' matches registration name
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}

// ❌ Wrong - parameter name 'repo' doesn't match registration
export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}  // Won't auto-wire!
}
```

### 3. Register in Container

Add your class to `src/di/setup.ts` and update the Container type:

```typescript
// Update Container interface
export interface Container {
  db: Db;
  userRepository: UserRepository;
  userService: UserService;
  productService: ProductService;  // Add new service
}

// Register with auto-wiring
container.register({
  productService: asClass(ProductService).singleton()
});
```

### 4. Resolve in Routes

```typescript
import { getUserController } from '../../di/setup.js';

export async function userRoutes(fastify: FastifyInstance) {
  const userController = getUserController();
  fastify.get('/users', userController.getAllUsers.bind(userController));
}
```

## Benefits

1. **Auto-wiring** - No manual dependency wiring needed
2. **Loose Coupling** - Components depend on interfaces, not implementations
3. **Testability** - Easy to mock dependencies in unit tests
4. **Less Boilerplate** - Register classes directly without factory functions
5. **Type Safety** - Full TypeScript type checking with container interface
6. **Flexible Lifetimes** - Singleton, scoped, or transient registrations

## Testing with DI

Unit tests can easily mock dependencies:
```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      // ... other methods
    } as any;

    userService = new UserService(mockRepository);
  });

  test('getAllUsers should return users', async () => {
    mockRepository.findAll.mockResolvedValue([...]);
    const result = await userService.getAllUsers();
    expect(result).toEqual([...]);
  });
});
```

## Adding New Modules with Awilix

To add a new module (example: Product):

### 1. Create interfaces
```typescript
// src/modules/product/interfaces/product-repository.interface.ts
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  // ...
}
```

### 2. Implement with matching parameter names
```typescript
// src/modules/product/product.repository.ts
export class ProductRepository implements IProductRepository {
  constructor(private readonly db: Db) {}  // 'db' matches container registration
  // ...
}

// src/modules/product/product.service.ts
export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}  // matches!
  // ...
}
```

### 3. Update Container type in `src/di/container.ts`
```typescript
export interface Container {
  db: Db;
  userRepository: UserRepository;
  userService: UserService;
  userController: UserController;
  productRepository: ProductRepository;  // Add new
  productService: ProductService;        // Add new
  productController: ProductController;  // Add new
}
```

### 4. Register in `src/di/setup.ts`
```typescript
import { ProductRepository } from '../modules/product/product.repository.js';
import { ProductService } from '../modules/product/product.service.js';
import { ProductController } from '../modules/product/product.controller.js';

export function setupContainer(db: Db): void {
  container.register({
    db: asValue(db),

    // User module
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    userController: asClass(UserController).singleton(),

    // Product module (auto-wired!)
    productRepository: asClass(ProductRepository).singleton(),
    productService: asClass(ProductService).singleton(),
    productController: asClass(ProductController).singleton()
  });
}

// Create getter function
export function getProductController(): ProductController {
  return container.resolve('productController');
}
```

### 5. Use in routes
```typescript
import { getProductController } from '../../di/setup.js';

export async function productRoutes(fastify: FastifyInstance) {
  const controller = getProductController();
  fastify.get('/products', controller.getAllProducts.bind(controller));
}
```

That's it! Awilix auto-wires all dependencies based on constructor parameter names.

## Lifetime Management

Awilix supports three lifetime modes:

```typescript
container.register({
  // Singleton - one instance for the entire application
  userService: asClass(UserService).singleton(),

  // Scoped - one instance per scope (useful for per-request instances)
  requestLogger: asClass(RequestLogger).scoped(),

  // Transient - new instance every time it's resolved
  taskRunner: asClass(TaskRunner).transient()
});
```

For this project, we use **singleton** for most services since they're stateless.
