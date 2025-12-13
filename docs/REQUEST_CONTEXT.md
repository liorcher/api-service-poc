# Request Context Pattern

This project uses Node.js AsyncLocalStorage to maintain per-request context throughout the entire request lifecycle.

## What is AsyncLocalStorage?

AsyncLocalStorage is a Node.js API that provides a way to store data that's automatically available throughout an asynchronous call chain without explicitly passing it as parameters.

Think of it as "thread-local storage" for asynchronous JavaScript.

## Why We Use It

### Problem
In a web application, you often need request-specific data (like request ID, user info, or logger) available deep in your call stack:

```
HTTP Request → Controller → Service → Repository
                 ↓           ↓          ↓
         Need reqId     Need reqId   Need reqId
```

### Traditional Solution (Bad)
Pass the request object or logger through every function:

```typescript
controller.handle(request)
  → service.getUser(request.id, request.log)
    → repository.find(request.id, request.log)
```

**Problems:**
- Pollutes function signatures
- Tight coupling to HTTP layer
- Hard to maintain

### AsyncLocalStorage Solution (Good)
Store request context once, access it anywhere:

```typescript
// In middleware
requestContextStorage.run({ logger, reqId }, () => {
  controller.handle(request)  // No need to pass context
    → service.getUser(id)     // Can access via getRequestLogger()
      → repository.find(id)   // Can access via getRequestId()
});
```

**Benefits:**
- Clean function signatures
- Loose coupling
- Easy to maintain

---

## Architecture

### Components

#### 1. Storage
Location: `src/context/request-context.ts`

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import type { FastifyBaseLogger } from 'fastify';

interface RequestContext {
  logger: FastifyBaseLogger;
  reqId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();
```

#### 2. Middleware
Location: `src/middleware/request-context.middleware.ts`

```typescript
export const requestContextMiddleware = (
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  const context: RequestContext = {
    logger: request.log,
    reqId: request.id
  };

  requestContextStorage.run(context, () => {
    done();
  });
};
```

#### 3. Helper Functions
Location: `src/context/request-context.ts`

```typescript
export function getRequestLogger(): FastifyBaseLogger | undefined {
  return requestContextStorage.getStore()?.logger;
}

export function getRequestId(): string | undefined {
  return requestContextStorage.getStore()?.reqId;
}
```

---

## How It Works

### 1. Request Arrives
```
GET /api/users → Fastify creates request object with:
  - request.id (unique request ID)
  - request.log (request-scoped logger)
```

### 2. Middleware Stores Context
```typescript
requestContextMiddleware runs:
  → Creates context object { logger, reqId }
  → Stores in AsyncLocalStorage
  → Continues to route handler
```

### 3. Code Accesses Context
```typescript
Anywhere in the call chain:
  const logger = getRequestLogger();
  const reqId = getRequestId();
```

### 4. Request Completes
```
AsyncLocalStorage automatically cleans up
No memory leaks
Context isolated per request
```

---

## Integration with Decorators

The `@LogMethod()` decorator uses request context automatically:

```typescript
export function LogMethod() {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const logger = getRequestLogger(); // ← Uses request context

      if (!logger) {
        // Gracefully handles no context (e.g., unit tests)
        return originalMethod.apply(this, args);
      }

      const methodLogger = logger.child({ method: propertyKey });
      methodLogger.info(`→ ${className}.${propertyKey}`);

      // ... rest of logging logic
    };
  };
}
```

---

## Usage Patterns

### Pattern 1: Accessing Request Logger
```typescript
export class SomeService {
  async someMethod() {
    const logger = getRequestLogger();

    if (logger) {
      logger.info('This log will include the request ID');
    }
  }
}
```

### Pattern 2: Accessing Request ID
```typescript
export class SomeService {
  async trackOperation() {
    const reqId = getRequestId();

    await analytics.track({
      requestId: reqId,
      operation: 'getUserById'
    });
  }
}
```

### Pattern 3: With @LogMethod Decorator
```typescript
export class UserService {
  @LogMethod() // ← Automatically uses request context
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
```

**Log output includes request ID:**
```
[14:23:45 UTC] INFO: [UserService][getAllUsers][req-abc123] → UserService.getAllUsers
[14:23:45 UTC] INFO: [UserService][getAllUsers][req-abc123] ← UserService.getAllUsers { duration: 12 }
```

---

## Benefits

### 1. Distributed Tracing
Each log includes the request ID, making it easy to trace a request through the entire system:

```bash
# Find all logs for a specific request
grep "req-abc123" app.log
```

### 2. Clean Code
No need to pass logger or request ID through function parameters:

```typescript
// ❌ Bad: Passing logger everywhere
async function processUser(userId: string, logger: Logger) {
  logger.info('Processing user');
  await updateUser(userId, logger);
}

// ✅ Good: Using request context
async function processUser(userId: string) {
  const logger = getRequestLogger();
  logger?.info('Processing user');
  await updateUser(userId);
}
```

### 3. Automatic Context Propagation
Context automatically flows through async operations:

```typescript
async function handleRequest() {
  await serviceA.method1();  // Has request context
    await serviceB.method2(); // Has request context
      await repoC.method3();  // Has request context
}
```

---

## Setup and Configuration

### 1. Register Middleware
Location: `src/app.ts`

```typescript
import { requestContextMiddleware } from '@middleware/request-context.middleware.js';

app.addHook('onRequest', requestContextMiddleware);
```

**Important**: Register as early as possible in the middleware chain to ensure context is available for all subsequent hooks and handlers.

### 2. Logger Configuration
Location: `src/config/logger.config.ts`

The logger is configured with custom formatters that display request context:

```typescript
messageFormat: '{if className}[{className}]{end}{if method}[{method}]{end}{if reqId}[{reqId}]{end} {msg}'
```

---

## Testing

### Unit Tests
In unit tests, there's no request context (which is expected):

```typescript
it('testSomeMethod', async () => {
  const service = new UserService(mockRepo);

  await service.someMethod(); // No request context, logs won't include reqId
});
```

**Note**: You'll see console warnings like "No request logger for..." - this is expected and doesn't affect test execution.

### Integration Tests
In integration tests, use `buildTestApp()` which sets up the middleware:

```typescript
it('testApiEndpoint', async () => {
  const app = await buildTestApp();

  const response = await app.inject({
    method: 'GET',
    url: '/api/users'
  });

  // Request context is available, logs include reqId
});
```

---

## Advanced: Extending Request Context

You can add more fields to the request context:

### 1. Update the Interface
```typescript
interface RequestContext {
  logger: FastifyBaseLogger;
  reqId: string;
  userId?: string;        // NEW
  tenantId?: string;      // NEW
}
```

### 2. Update the Middleware
```typescript
export const requestContextMiddleware = (
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  const context: RequestContext = {
    logger: request.log,
    reqId: request.id,
    userId: request.user?.id,    // NEW
    tenantId: request.tenant?.id // NEW
  };

  requestContextStorage.run(context, () => done());
};
```

### 3. Add Helper Functions
```typescript
export function getRequestUserId(): string | undefined {
  return requestContextStorage.getStore()?.userId;
}

export function getRequestTenantId(): string | undefined {
  return requestContextStorage.getStore()?.tenantId;
}
```

---

## Related Documentation

- [Logging Decorators](./DECORATORS.md) - @Logger and @LogMethod usage
- [Log Sanitization](./LOG_SANITIZATION.md) - Security features
- [Dependency Injection](./DEPENDENCY_INJECTION.md) - DI container setup

---

## References

- [Node.js AsyncLocalStorage Documentation](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- [Fastify Request Lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/)
