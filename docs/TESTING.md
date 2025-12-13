# Testing Guide

Comprehensive guide to testing patterns, utilities, and best practices in this project.

## Overview

This project uses **Jest** as the testing framework with a focus on:
- Clean, maintainable test code
- Random data generation (no hardcoded values)
- Parameterized tests for DRY principles
- AAA pattern (Arrange-Act-Assert) via blank line separation
- Consistent naming conventions

**Test Stats:**
- 65 test cases across 5 test suites
- 100% pass rate
- Unit + Integration test coverage

---

## Test Structure

```
test/
├── unit/                    # Unit tests (isolated, mocked dependencies)
│   ├── config/              # Configuration tests
│   ├── modules/user/        # User module tests
│   └── utils/               # Utility function tests
├── integration/             # Integration tests (full app, real DB)
│   ├── app.test.ts          # App-level tests
│   └── modules/user/        # User API tests
├── utils/                   # Test utility functions
│   ├── test-utils.ts        # Random data generators
│   └── test-constants.ts    # Test constants
├── helpers/                 # Test setup helpers
│   └── app.helper.ts        # buildTestApp()
└── mocks/                   # Test mocks
    ├── logger.mock.ts
    ├── mongodb.mock.ts
    └── user-repository.mock.ts
```

---

## Test Utilities

### Location
`test/utils/test-utils.ts`

### Random Data Generators

All functions follow the `aRandom*` naming convention:

#### Basic Types
```typescript
aRandomInt(min = 0, max = 100)        // Random integer
aRandomBoolean()                       // Random boolean
aRandomString(length = 10)             // Random alphanumeric string
aRandomFloat(min, max, decimals = 2)   // Random float
aRandomDate(start, end)                // Random date
```

#### Collections
```typescript
aRandomChoice(['a', 'b', 'c'])        // Pick random item
aRandomArrayOf(aRandomString, 5)       // Array of random strings
```

#### MongoDB
```typescript
aRandomObjectId()                      // Random MongoDB ObjectId
```

#### Domain-Specific
```typescript
aRandomEmail()                         // Random email address
aRandomPassword(length = 16)           // Random password
aRandomApiKey()                        // Random API key (sk_test/live_...)
aRandomToken()                         // Random token (tok_...)
aRandomHttpMethod()                    // Random HTTP method
aRandomStatusCode()                    // Random HTTP status code
aRandomUrl()                           // Random URL path
```

#### User Data
```typescript
aRandomUserData()                      // { name, email, age }
aRandomUser()                          // Complete user object with _id, timestamps
```

#### Advanced
```typescript
aRandomEnumValue(MyEnum)               // Random enum value
aRandomPartialObject(template)         // Random partial object
aRandomSecureString(length)            // Cryptographically secure random string
```

### Usage Examples

#### Example 1: Basic Random Data
```typescript
it('testShouldCreateUserWhenValidData', async () => {
  const name = aRandomString();
  const email = aRandomEmail();
  const age = aRandomInt(18, 80);

  const result = await userService.createUser({ name, email, age });

  expect(result.name).toBe(name);
  expect(result.email).toBe(email);
});
```

#### Example 2: Random User Objects
```typescript
it('testShouldReturnAllUsers', async () => {
  const mockUsers = [aRandomUser(), aRandomUser(), aRandomUser()];
  mockRepository.findAll.mockResolvedValue(mockUsers);

  const result = await userService.getAllUsers();

  expect(result).toEqual(mockUsers);
});
```

#### Example 3: Random Array Generation
```typescript
it('testShouldHandleMultipleUsers', async () => {
  const users = aRandomArrayOf(aRandomUser, 10);

  const result = await processUsers(users);

  expect(result).toHaveLength(10);
});
```

---

## Test Helpers

### buildTestApp()

Location: `test/helpers/app.helper.ts`

Creates a fully configured Fastify app for integration tests.

#### Usage
```typescript
describe('User API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('testGetUsers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
      headers: { 'x-api-key': TEST_API_KEY }
    });

    expect(response.statusCode).toBe(200);
  });
});
```

#### Features
- Mocked MongoDB database
- Mocked logger (silent mode)
- API key authentication configured
- All routes registered
- Error handlers configured

---

## Test Mocks

### Logger Mock
Location: `test/mocks/logger.mock.ts`

```typescript
import { testLogger } from '../../mocks/logger.mock.js';

// Use in tests
const service = new UserService(mockRepo, testLogger);
```

**Features:**
- Real Pino logger instance
- Silent mode (no console output during tests)
- Compatible with Fastify

### MongoDB Mock
Location: `test/mocks/mongodb.mock.ts`

```typescript
export function createMockDb(): Db {
  return {
    collection: jest.fn((name: string) => createMockCollection())
  } as unknown as Db;
}
```

### Repository Mock
Location: `test/mocks/user-repository.mock.ts`

```typescript
export function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
}
```

---

## Testing Patterns

### 1. AAA Pattern (Arrange-Act-Assert)

Tests are structured with blank line separation (no comments needed):

```typescript
it('testShouldDoSomething', () => {
  // ARRANGE - Setup test data
  const input = aRandomString();
  const expected = aRandomString();

  // ACT - Execute the function
  const result = someFunction(input);

  // ASSERT - Verify the outcome
  expect(result).toBe(expected);
});
```

### 2. Parameterized Tests

Use `it.each()` for testing multiple similar scenarios:

#### Simple Array
```typescript
it.each(['child', 'info'])(
  'testShouldHandle_%s_Method',
  (methodName) => {
    const obj = { [methodName]: () => {} };

    const result = processObject(obj);

    expect(result).toBeDefined();
  }
);
```

#### Tuple Array (Multiple Parameters)
```typescript
it.each([
  ['password', () => aRandomPassword()],
  ['apiKey', () => aRandomApiKey()],
  ['token', () => aRandomToken()]
])('testShouldRedact_%s_Field', (field, generator) => {
  const value = generator();

  const result = sanitize({ [field]: value });

  expect(result[field]).toBe('[REDACTED]');
});
```

#### Complex Scenarios
```typescript
it.each([
  [401, undefined, 'Missing', 'API key required'],
  [403, 'invalid', 'Invalid', 'Invalid API key']
])(
  'testShouldReturn%dWhenApiKey%s',
  async (status, apiKey, _desc, errorMsg) => {
    const response = await makeRequest(apiKey);

    expect(response.statusCode).toBe(status);
    expect(response.error).toBe(errorMsg);
  }
);
```

### 3. Test Naming Convention

**Format**: `test<FunctionName>Should<Action><Condition>`

**Examples:**
- `testGetUserByIdShouldReturnUserWhenValidIdProvided`
- `testCreateUserShouldThrowErrorWhenInvalidData`
- `testSanitizeLogArgsShouldRedactPasswordFieldWhenPresent`

**Benefits:**
- Self-documenting
- Searchable
- Consistent across codebase
- Clear in CI/CD output

---

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
npm test -- user.service.test
npm test -- log-sanitizer.test
```

### With Coverage
```bash
npm run test:coverage
```

Coverage is generated in `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format

### Watch Mode
```bash
npm test -- --watch
```

### Debugging Tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Writing New Tests

### Step 1: Choose Test Type

**Unit Test** - Testing a single class/function in isolation:
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    service = new UserService(mockRepo);
  });

  it('testShouldDoSomething', async () => {
    // Test with mocked dependencies
  });
});
```

**Integration Test** - Testing API endpoints with full app:
```typescript
describe('User API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('testShouldReturnUsers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users'
    });

    expect(response.statusCode).toBe(200);
  });
});
```

### Step 2: Use Random Data

```typescript
it('testCreateUser', async () => {
  // ❌ Bad: Hardcoded values
  const user = { name: 'John', email: 'john@test.com', age: 30 };

  // ✅ Good: Random values
  const user = aRandomUserData();

  const result = await service.createUser(user);

  expect(result.name).toBe(user.name);
});
```

### Step 3: Follow AAA Pattern

```typescript
it('testSomeFunction', () => {
  const input = aRandomString();
  const expected = input.toUpperCase();

  const result = someFunction(input);

  expect(result).toBe(expected);
});
```

### Step 4: Use Parameterized Tests for Similar Cases

```typescript
// ❌ Bad: Repetitive tests
it('testShouldHandlePassword', () => { /* ... */ });
it('testShouldHandleApiKey', () => { /* ... */ });
it('testShouldHandleToken', () => { /* ... */ });

// ✅ Good: Parameterized
it.each(['password', 'apiKey', 'token'])(
  'testShouldHandle_%s',
  (field) => { /* ... */ }
);
```

---

## Test Constants

Location: `test/utils/test-constants.ts`

```typescript
export const REDACTED_MARKER = '[REDACTED]';
export const FASTIFY_MARKER = '[FastifyRequest/Reply]';
export const CIRCULAR_MARKER = '[Circular]';
```

Use these for assertions:
```typescript
expect(result.password).toBe(REDACTED_MARKER);
```

---

## Best Practices

### ✅ DO

- Use `aRandom*` functions for all test data
- Follow the `test<Name>Should<Action><Condition>` naming convention
- Use AAA pattern with blank line separation
- Use parameterized tests for similar scenarios
- Mock external dependencies in unit tests
- Use `buildTestApp()` for integration tests
- Clean up resources in `afterAll`/`afterEach`

### ❌ DON'T

- Hardcode test values
- Use comments for AAA sections (blank lines are enough)
- Share state between tests
- Test implementation details
- Mock what you don't own (e.g., Date, Math.random in tests)
- Leave tests commented out

---

## Mocking Guidelines

### When to Mock

✅ **Mock:**
- Database calls
- External APIs
- File system operations
- Network requests
- Time-dependent operations (for consistency)

❌ **Don't Mock:**
- The code you're testing
- Simple utilities
- TypeScript types/interfaces
- Constants

### How to Mock with Jest

#### Mock Functions
```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue(Promise.resolve('value'));
mockFn.mockRejectedValue(new Error('error'));
```

#### Mock Modules
```typescript
jest.mock('@modules/user/user.service.js', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getUserById: jest.fn()
  }))
}));
```

#### Use Existing Mocks
```typescript
import { createMockUserRepository } from '../../../mocks/user-repository.mock.js';
import { testLogger } from '../../../mocks/logger.mock.js';

const mockRepo = createMockUserRepository();
const service = new UserService(mockRepo);
```

---

## Coverage

### Running Coverage Reports

```bash
npm run test:coverage
```

### Viewing Coverage

Open `coverage/lcov-report/index.html` in your browser.

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Excluding from Coverage

Already configured in `jest.config.ts`:
```typescript
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/server.ts',    // Entry point
  '!src/types/**'      // Type definitions
]
```

---

## Examples

### Unit Test Example

Location: `test/unit/modules/user/user.service.test.ts`

```typescript
import { UserService } from '@modules/user/user.service.js';
import { createMockUserRepository } from '../../../mocks/user-repository.mock.js';
import { aRandomUser, aRandomObjectId } from '../../../utils/test-utils.js';

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    service = new UserService(mockRepo);
  });

  it('testGetUserByIdShouldReturnUserWhenValidIdProvided', async () => {
    const userId = aRandomObjectId();
    const mockUser = aRandomUser();
    mockUser._id = userId;
    mockRepo.findById.mockResolvedValue(mockUser);

    const result = await service.getUserById(userId.toString());

    expect(result).toEqual(mockUser);
    expect(mockRepo.findById).toHaveBeenCalledWith(userId);
  });
});
```

### Integration Test Example

Location: `test/integration/modules/user/user.api.test.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { buildTestApp, TEST_API_KEY } from '../../../helpers/app.helper.js';
import { aRandomString, aRandomEmail, aRandomInt } from '../../../utils/test-utils.js';

describe('User API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('testCreateUserEndpointShouldReturn201WhenValidDataProvided', async () => {
    const userName = aRandomString();
    const userEmail = aRandomEmail();
    const userAge = aRandomInt(18, 80);

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      headers: {
        'content-type': 'application/json',
        'x-api-key': TEST_API_KEY
      },
      payload: { name: userName, email: userEmail, age: userAge }
    });

    expect(response.statusCode).toBe(201);
    const payload = JSON.parse(response.payload);
    expect(payload.data.name).toBe(userName);
  });
});
```

### Parameterized Test Example

Location: `test/unit/utils/log-sanitizer.test.ts`

```typescript
it.each([
  ['password', () => aRandomPassword()],
  ['apiKey', () => aRandomApiKey()],
  ['token', () => aRandomToken()],
  ['secret', () => aRandomString(32)]
])('testSanitizeLogArgsShouldRedact_%s_FieldWhenPresent', (field, generator) => {
  const otherField = aRandomString();
  const sensitiveValue = generator();

  const result = sanitizeLogArgs([{ other: otherField, [field]: sensitiveValue }]);

  expect(result).toEqual([{ other: otherField, [field]: REDACTED_MARKER }]);
});
```

**Output:**
```
✓ testSanitizeLogArgsShouldRedact_password_FieldWhenPresent
✓ testSanitizeLogArgsShouldRedact_apiKey_FieldWhenPresent
✓ testSanitizeLogArgsShouldRedact_token_FieldWhenPresent
✓ testSanitizeLogArgsShouldRedact_secret_FieldWhenPresent
```

---

## Test Configuration

### Jest Configuration
Location: `jest.config.ts`

Key settings:
```typescript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)\\.(js|ts)$': '<rootDir>/src/$1',
    '^@config/(.*)\\.(js|ts)$': '<rootDir>/src/config/$1',
    // ... all path aliases
  }
}
```

### Path Aliases in Tests

Tests use the same path aliases as production code:
```typescript
import { UserService } from '@modules/user/user.service.js';
import { sanitizeLogArgs } from '@utils/log-sanitizer.js';
import { getRequestLogger } from '@context/request-context.js';
```

See [PATH_ALIASES.md](./PATH_ALIASES.md) for complete reference.

---

## Common Testing Scenarios

### Testing Error Cases

```typescript
it('testShouldThrowErrorWhenInvalidInput', async () => {
  const invalidInput = aRandomString();

  await expect(service.process(invalidInput)).rejects.toThrow('Invalid input');
});
```

### Testing Async Operations

```typescript
it('testShouldCompleteAsyncOperation', async () => {
  const data = aRandomUserData();

  const result = await service.asyncMethod(data);

  expect(result).toBeDefined();
});
```

### Testing with Multiple Assertions

```typescript
it('testShouldReturnCompleteUserObject', async () => {
  const userData = aRandomUserData();

  const result = await service.createUser(userData);

  expect(result._id).toBeDefined();
  expect(result.name).toBe(userData.name);
  expect(result.email).toBe(userData.email);
  expect(result.createdAt).toBeInstanceOf(Date);
  expect(result.updatedAt).toBeInstanceOf(Date);
});
```

### Testing with Spies

```typescript
it('testShouldCallRepositoryOnce', async () => {
  mockRepo.findAll.mockResolvedValue([]);

  await service.getAllUsers();

  expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  expect(mockRepo.findAll).toHaveBeenCalledWith();
});
```

---

## Debugging Tests

### Failed Test Output

Jest provides detailed diff output:
```
Expected: { name: 'John', age: 30 }
Received: { name: 'John', age: 31 }
```

### Debugging Individual Tests

Run a single test:
```bash
npm test -- -t "testGetUserByIdShouldReturnUser"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Inspect Test Data

Add console.log in tests (remove before committing):
```typescript
it('testSomething', () => {
  const data = aRandomUser();
  console.log('Test data:', JSON.stringify(data, null, 2));

  // ... test logic
});
```

---

## Continuous Integration

### GitHub Actions / CI Setup

Example workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## Related Documentation

- [Logging Decorators](./DECORATORS.md) - Testing with @LogMethod
- [Request Context](./REQUEST_CONTEXT.md) - Context in tests
- [Log Sanitization](./LOG_SANITIZATION.md) - Sanitizer tests

---

## Tips and Tricks

### Tip 1: Reuse Test Data

```typescript
const baseUser = aRandomUser();

it('test1', () => {
  const user = { ...baseUser, name: 'Override' };
  // ...
});
```

### Tip 2: Test Error Messages

```typescript
it('testShouldThrowSpecificError', async () => {
  await expect(service.method()).rejects.toThrow('Specific error message');
});
```

### Tip 3: Use describe.each for Test Groups

```typescript
describe.each(['UserService', 'ProductService'])(
  '%s Tests',
  (serviceName) => {
    it('testShouldInitialize', () => {
      // Test each service
    });
  }
);
```

### Tip 4: Setup/Teardown Hierarchy

```typescript
describe('OuterSuite', () => {
  beforeAll(() => { /* Runs once before all tests */ });
  afterAll(() => { /* Runs once after all tests */ });

  describe('InnerSuite', () => {
    beforeEach(() => { /* Runs before each test in InnerSuite */ });
    afterEach(() => { /* Runs after each test in InnerSuite */ });

    it('test', () => { /* ... */ });
  });
});
```

---

## Test Quality Checklist

Before committing tests, ensure:

- [ ] Uses `aRandom*` functions (no hardcoded values)
- [ ] Follows naming convention
- [ ] AAA pattern with blank lines
- [ ] Parameterized tests where appropriate
- [ ] Cleans up resources (close connections, etc.)
- [ ] No console.log statements
- [ ] Tests one thing per test
- [ ] Tests pass consistently
- [ ] Fast execution (< 1s for unit tests)
