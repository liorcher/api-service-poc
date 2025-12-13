# Log Sanitization

Automatic redaction of sensitive data in application logs to ensure security and compliance.

## Overview

The log sanitizer automatically removes or redacts sensitive information from logs before they're written, protecting:
- User credentials (passwords, tokens, API keys)
- PII (Personally Identifiable Information)
- Security tokens and secrets
- Request/response objects that could contain sensitive data

## Quick Start

### Automatic Sanitization

When using the `@LogMethod()` decorator, sanitization happens automatically:

```typescript
export class UserService {
  @LogMethod()
  async createUser(userData: { email: string; password: string }) {
    // Method is called with: { email: "user@example.com", password: "secret123" }
    // Logged as: { email: "user@example.com", password: "[REDACTED]" }
  }
}
```

### Manual Sanitization

You can also use the sanitizer directly:

```typescript
import { sanitizeLogArgs } from '@utils/log-sanitizer.js';

const args = [{ username: 'john', password: 'secret123', apiKey: 'sk_live_123' }];
const sanitized = sanitizeLogArgs(args);

// Result: [{ username: 'john', password: '[REDACTED]', apiKey: '[REDACTED]' }]
```

---

## Features

### 1. Sensitive Field Redaction

Automatically redacts fields containing sensitive keywords:

**Sensitive Fields** (configurable):
- `password`
- `apikey` / `api-key`
- `token`
- `secret`
- `authorization`

**Case-insensitive and partial matching:**
```typescript
{
  userPassword: 'secret',    // → '[REDACTED]'
  accessToken: 'tok_123',    // → '[REDACTED]'
  apiKeyValue: 'sk_123',     // → '[REDACTED]'
  PASSWORD: 'secret',        // → '[REDACTED]'
  'x-api-key': 'key123'      // → '[REDACTED]'
}
```

### 2. Nested Object Sanitization

Recursively sanitizes nested objects:

```typescript
const input = {
  user: {
    name: 'John',
    credentials: {
      password: 'secret123',
      apiKey: 'sk_live_xyz'
    }
  }
};

// Output:
{
  user: {
    name: 'John',
    credentials: {
      password: '[REDACTED]',
      apiKey: '[REDACTED]'
    }
  }
}
```

### 3. Header Sanitization

Special handling for HTTP headers:

```typescript
const headers = {
  'content-type': 'application/json',
  'x-api-key': 'sk_live_123456',
  'authorization': 'Bearer token123'
};

// Output:
{
  'content-type': 'application/json',
  'x-api-key': '[REDACTED]',
  'authorization': '[REDACTED]'
}
```

### 4. Fastify Object Filtering

Automatically replaces bulky Fastify Request/Reply objects:

```typescript
const args = [request, reply, { data: 'value' }];

// Output: ['[FastifyRequest/Reply]', '[FastifyRequest/Reply]', { data: 'value' }]
```

**Detected by checking for:**
- `raw` property (FastifyRequest)
- `log` property (FastifyReply)
- `request` property (FastifyReply)

### 5. Logger Object Filtering

Filters out logger objects to avoid logging the logger itself:

```typescript
const args = ['test', testLogger, { data: 'value' }];

// Output: ['test', { data: 'value' }]
```

**Detected by checking for:** Both `child()` and `info()` methods

### 6. Circular Reference Protection

Prevents infinite loops when logging objects with circular references:

```typescript
const obj = { name: 'John' };
obj.self = obj; // Circular reference

// Output: { name: 'John', self: '[Circular]' }
```

Uses `WeakSet` to track visited objects.

---

## Configuration

### Sensitive Fields List

Location: `src/constants/log-sanitizer.constants.ts`

```typescript
export const SENSITIVE_FIELDS = [
  'password',
  'apikey',
  'api-key',
  'token',
  'secret',
  'authorization'
];
```

### Adding Custom Sensitive Fields

Edit the constants file:

```typescript
export const SENSITIVE_FIELDS = [
  'password',
  'apikey',
  'api-key',
  'token',
  'secret',
  'authorization',
  'ssn',           // NEW
  'creditcard',    // NEW
  'bankaccount'    // NEW
];
```

### Customizing Redaction Marker

```typescript
export const REDACTED = '[REDACTED]';          // Current
// export const REDACTED = '***';              // Alternative
// export const REDACTED = '<SENSITIVE_DATA>'; // Alternative
```

---

## Examples

### Example 1: Login Request

**Input:**
```typescript
{
  body: {
    email: 'user@example.com',
    password: 'mySecretPassword123'
  }
}
```

**Output:**
```typescript
{
  body: {
    email: 'user@example.com',
    password: '[REDACTED]'
  }
}
```

### Example 2: API Request with Headers

**Input:**
```typescript
{
  url: '/api/users',
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': 'sk_live_123456789'
  },
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
}
```

**Output:**
```typescript
{
  url: '/api/users',
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': '[REDACTED]'
  },
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
}
```

### Example 3: Payment Request

**Input:**
```typescript
{
  amount: 1000,
  currency: 'USD',
  paymentMethod: {
    type: 'card',
    token: 'tok_123456789',
    apiKey: 'sk_test_key'
  }
}
```

**Output:**
```typescript
{
  amount: 1000,
  currency: 'USD',
  paymentMethod: {
    type: 'card',
    token: '[REDACTED]',
    apiKey: '[REDACTED]'
  }
}
```

---

## Security Benefits

### Compliance

✅ **PCI DSS**: Prevents logging of credit card data, tokens
✅ **GDPR**: Protects sensitive user data
✅ **HIPAA**: Prevents logging of protected health information (with custom fields)
✅ **SOC 2**: Demonstrates data protection controls

### Security Best Practices

✅ **Defense in depth**: Even if sensitive data is accidentally passed to logger, it's redacted
✅ **Automatic protection**: Developers don't need to remember to sanitize
✅ **Configurable**: Easy to add new sensitive fields
✅ **Tested**: Comprehensive test coverage (32 test cases)

---

## Implementation Details

### Source Code
Location: `src/utils/log-sanitizer.ts`

**Key functions:**
- `sanitizeLogArgs(args)` - Main entry point
- `isSensitiveKey(key)` - Checks if a field name is sensitive
- `sanitizeValue(value, seen)` - Recursively sanitizes values
- `sanitizeHeaders(headers)` - Special header handling
- `isLoggerObject(value)` - Detects logger instances
- `isFastifyObject(value)` - Detects Fastify objects

### Constants
Location: `src/constants/log-sanitizer.constants.ts`

```typescript
export const SENSITIVE_FIELDS = [/* ... */];
export const REDACTED = '[REDACTED]';
export const FASTIFY_OBJECT_MARKER = '[FastifyRequest/Reply]';
export const CIRCULAR_REFERENCE_MARKER = '[Circular]';
```

---

## Testing

### Test Coverage
Location: `test/unit/utils/log-sanitizer.test.ts`

**37 test cases covering:**
- Primitive value handling
- Logger object filtering
- Fastify object detection
- Sensitive field redaction (password, apiKey, token, secret)
- Case-insensitive matching
- Header sanitization
- Nested objects
- Circular references
- Edge cases (null, undefined, empty objects)
- Real-world scenarios

### Running Sanitizer Tests

```bash
npm test -- log-sanitizer.test
```

---

## Advanced Usage

### Custom Sanitization Logic

While the current implementation covers most use cases, you can extend it:

#### Option 1: Add to SENSITIVE_FIELDS
```typescript
export const SENSITIVE_FIELDS = [
  'password',
  'apikey',
  // ... existing fields
  'customSensitiveField'  // Your custom field
];
```

#### Option 2: Create Custom Sanitizer
```typescript
import { sanitizeLogArgs } from '@utils/log-sanitizer.js';

function customSanitize(args: unknown[]): unknown[] {
  const baseSanitized = sanitizeLogArgs(args);

  // Add your custom logic here
  return baseSanitized.map(arg => {
    // Custom transformations
    return arg;
  });
}
```

---

## Related Documentation

- [Logging Decorators](./DECORATORS.md) - Automatic logging with @LogMethod
- [Request Context](./REQUEST_CONTEXT.md) - AsyncLocalStorage pattern
- [Testing Guide](./TESTING.md) - Test utilities and patterns

---

## Performance Considerations

### Overhead
- Sanitization happens only when logging (not on every method call)
- Uses WeakSet for circular reference tracking (O(1) lookup)
- Minimal performance impact (<1ms for typical objects)

### When to Disable (Don't!)
**Never disable sanitization in production.** The security benefits far outweigh the minimal performance cost.

If you need to log large objects, consider:
1. Logging only specific fields instead of entire objects
2. Using debug log level (disabled in production)
3. Sampling logs (log 1 in N requests)

---

## Troubleshooting

### Sensitive Data Still Appearing in Logs

1. **Check field name**: Ensure it contains a sensitive keyword
2. **Add to SENSITIVE_FIELDS**: If it's a custom field, add it to the list
3. **Verify sanitizer is being used**: Check that @LogMethod is applied or sanitizeLogArgs is called

### Over-Sanitization

If non-sensitive data is being redacted:

1. **Review SENSITIVE_FIELDS**: Check for overly broad keywords
2. **Use more specific field names**: E.g., `userToken` instead of `userdata`
3. **Customize the sanitizer**: Create a project-specific version

### Performance Issues

If sanitization is causing performance problems:

1. **Profile first**: Measure actual impact
2. **Reduce log verbosity**: Use appropriate log levels
3. **Simplify objects**: Log only necessary fields
4. **Consider sampling**: Log only a percentage of requests
