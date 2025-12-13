# Logging Decorators

This project uses TypeScript decorators for automatic, zero-boilerplate logging.

## Overview

Two decorators work together to provide comprehensive logging:
- **`@Logger()`** - Property decorator that injects a class-specific logger
- **`@LogMethod()`** - Method decorator that logs method execution automatically

## @Logger() Decorator

### Purpose
Automatically injects and initializes a logger instance with class-specific context.

### Usage

```typescript
import { FastifyBaseLogger } from 'fastify';
import { Logger } from '@decorators/logger.decorator.js';

export class UserService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userRepository: IUserRepository) {}

  someMethod() {
    this.logger.info('Manual logging when needed');
  }
}
```

### How It Works

1. **WeakMap Caching**: Uses `WeakMap<object, FastifyBaseLogger>` to cache logger instances
   - Automatic garbage collection when class instance is destroyed
   - No memory leaks
   - Thread-safe caching

2. **DI Container Integration**: Resolves the root logger from the dependency injection container
   ```typescript
   const parentLogger = container.resolve<FastifyBaseLogger>('logger');
   ```

3. **Child Logger Creation**: Creates a child logger with the class name as context
   ```typescript
   parentLogger.child({ className: 'UserService' })
   ```

### Benefits

✅ **Zero boilerplate** - Just 2 lines instead of 6
✅ **Automatic class context** - Uses `constructor.name` automatically
✅ **Type-safe** - Full TypeScript support
✅ **Memory efficient** - WeakMap provides automatic cleanup
✅ **Consistent pattern** - Same approach across all classes

### Before/After Comparison

**Before (without decorator):**
```typescript
export class UserService {
  private readonly logger: FastifyBaseLogger;

  constructor(userRepository: IUserRepository, logger?: FastifyBaseLogger) {
    const parentLogger = logger || container.resolve<FastifyBaseLogger>('logger');
    this.logger = parentLogger.child({ className: 'UserService' });
  }
}
```

**After (with decorator):**
```typescript
export class UserService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userRepository: IUserRepository) {}
}
```

**Code reduction: 67%** (6 lines → 2 lines)

---

## @LogMethod() Decorator

### Purpose
Automatically logs method entry, exit, duration, and errors without any manual logging code.

### Usage

```typescript
import { LogMethod } from '@decorators/log-method.decorator.js';

export class UserService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  @LogMethod()
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
```

### Log Output

The decorator produces structured logs with visual indicators:

```
[UserService][getUserById] → UserService.getUserById { args: ["507f1f77bcf86cd799439011"] }
[UserService][getUserById] ← UserService.getUserById { duration: 15 }
```

**Symbols:**
- `→` - Method entry
- `←` - Method exit (success)
- `✗` - Method exit (error)

### Features

#### 1. **Request Context Integration**
Uses AsyncLocalStorage to access request-scoped logger:
```typescript
const logger = getRequestLogger(); // Falls back gracefully if no request context
```

#### 2. **Automatic Performance Tracking**
Measures and logs execution duration in milliseconds:
```json
{ "duration": 15, "method": "getUserById" }
```

#### 3. **Error Logging**
Automatically captures and logs exceptions:
```
[UserService][getUserById] ✗ UserService.getUserById { error: {...}, duration: 23 }
```

#### 4. **Argument Sanitization**
Automatically redacts sensitive data from logged arguments:
```typescript
// Input: { email: "user@example.com", password: "secret123" }
// Logged: { email: "user@example.com", password: "[REDACTED]" }
```

See [LOG_SANITIZATION.md](./LOG_SANITIZATION.md) for details.

### How It Works

1. **Wraps the original method** with logging logic
2. **Captures method start time** using `Date.now()`
3. **Logs entry** with sanitized arguments
4. **Executes original method** preserving `this` context
5. **Logs exit** with duration
6. **Catches errors** and logs them before re-throwing

### Integration with Request Context

The decorator works seamlessly with the request context pattern:

```
HTTP Request → Middleware stores request.log
             ↓
   AsyncLocalStorage maintains context
             ↓
   @LogMethod retrieves request logger
             ↓
   Logs include request ID automatically
```

See [REQUEST_CONTEXT.md](./REQUEST_CONTEXT.md) for details.

---

## Best Practices

### When to Use @Logger()

✅ **Use when:**
- You need manual control over logging
- You want to log specific business logic events
- You're creating a service, repository, or controller class

❌ **Don't use when:**
- You only need automatic method logging (just use @LogMethod())
- The class doesn't need any logging

### When to Use @LogMethod()

✅ **Use when:**
- You want automatic entry/exit/error logging
- You want performance tracking for methods
- You're implementing API endpoints or service methods

❌ **Don't use when:**
- The method is trivial (getters, setters)
- You need custom log messages (use manual logging instead)
- The method is called very frequently (e.g., utility functions)

### Combining Both Decorators

```typescript
export class UserController {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  @LogMethod()
  async getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Automatic logging from @LogMethod
    const users = await this.userService.getAllUsers();

    // Manual logging when needed
    this.logger.info({ count: users.length }, 'Retrieved users');

    reply.send({ success: true, data: users });
  }
}
```

---

## Examples from the Codebase

### UserController
Location: `src/modules/user/user.controller.ts`

```typescript
export class UserController {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userService: IUserService) {}

  @LogMethod()
  async getAllUsers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.userService.getAllUsers();
    reply.send({ success: true, data: users });
  }
}
```

### UserService
Location: `src/modules/user/user.service.ts`

```typescript
export class UserService implements IUserService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userRepository: IUserRepository) {}

  @LogMethod()
  async getUserById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    return this.userRepository.findById(new ObjectId(id));
  }
}
```

### UserRepository
Location: `src/modules/user/user.repository.ts`

```typescript
export class UserRepository implements IUserRepository {
  private collection: Collection<User>;

  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(db: Db) {
    this.collection = db.collection<User>('users');
  }

  @LogMethod()
  async findAll(): Promise<User[]> {
    return this.collection.find({}).toArray();
  }
}
```

---

## Implementation Details

### Logger Decorator Source
Location: `src/decorators/logger.decorator.ts`

Key features:
- 22 lines of clean code
- WeakMap-based caching
- Automatic className detection
- Integration with DI container

### LogMethod Decorator Source
Location: `src/decorators/log-method.decorator.ts`

Key features:
- 40 lines of clean code
- Request context integration
- Automatic sanitization
- Performance tracking
- Error handling

---

## Related Documentation

- [Request Context Pattern](./REQUEST_CONTEXT.md) - AsyncLocalStorage integration
- [Log Sanitization](./LOG_SANITIZATION.md) - Security-focused logging
- [Dependency Injection](./DEPENDENCY_INJECTION.md) - DI container setup

---

## Troubleshooting

### "No request logger" Warning

If you see console warnings like:
```
No request logger for UserService.someMethod
```

This means:
- The method is being called outside of a request context (e.g., in unit tests)
- The method will still execute normally, just without logging
- In integration tests, ensure the request context middleware is installed

**Solution**: This is expected in unit tests. Integration tests should not see this warning if the middleware is properly configured.
