# Error Handling Guide

This project uses a custom error handling system with typed error classes for type-safe, consistent error handling throughout the application.

## Table of Contents

- [Overview](#overview)
- [Error Class Hierarchy](#error-class-hierarchy)
- [Using Error Classes](#using-error-classes)
- [Error Middleware](#error-middleware)
- [Error Response Format](#error-response-format)
- [Error Metrics](#error-metrics)
- [Best Practices](#best-practices)

## Overview

The error handling system provides:

- **Type-safe errors** with `instanceof` checks instead of string matching
- **Automatic HTTP status code handling** by the error middleware
- **Context preservation** for debugging with additional error data
- **Client-safe responses** that exclude sensitive information
- **Error metrics tracking** for monitoring
- **Consistent error responses** across all endpoints

## Error Class Hierarchy

```
Error (native)
  └── BaseError
        ├── ApiError
        │     ├── BadRequestError (400)
        │     ├── UnauthorizedError (401)
        │     ├── ForbiddenError (403)
        │     ├── NotFoundError (404)
        │     ├── ConflictError (409)
        │     ├── InternalServerError (500)
        │     ├── ServiceUnavailableError (503)
        │     ├── ValidationError (400)
        │     └── InvalidIdError (400)
        ├── ConfigurationError (non-operational)
        └── DatabaseError
```

### BaseError

Base class for all application errors with operational error tracking.

```typescript
class BaseError extends Error {
  isOperational: boolean;    // true = expected error, false = programming error
  code: string;              // Machine-readable code (e.g., 'USER_NOT_FOUND')
  context?: Record<string, unknown>;  // Additional debugging data
  timestamp: Date;           // When error occurred

  toJSON(): object;          // Serialize for logging (includes stack)
}
```

### ApiError

HTTP-specific error with status code for API responses.

```typescript
class ApiError extends BaseError {
  statusCode: number;        // HTTP status code (400, 404, 500, etc.)

  toClientResponse(): object;  // Client-safe response (excludes stack/sensitive data)
}
```

## Using Error Classes

### 1. Invalid ID Format

Use when a provided ID doesn't match the expected format (e.g., MongoDB ObjectId).

```typescript
import { InvalidIdError } from '../errors/invalid-id.error.js';

async getUserById(id: string): Promise<User | null> {
  if (!ObjectId.isValid(id)) {
    throw new InvalidIdError(id, { method: 'getUserById' });
  }
  return this.userRepository.findById(new ObjectId(id));
}
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid ID format: abc123",
  "code": "INVALID_ID_FORMAT",
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

### 2. Not Found Errors

Use when a requested resource doesn't exist.

```typescript
import { NotFoundError } from '../errors/not-found.error.js';

async getUserById(id: string): Promise<User> {
  const user = await this.userService.getUserById(id);

  if (!user) {
    throw new NotFoundError('User', id);
  }

  return user;
}
```

**Response:**
```json
{
  "success": false,
  "error": "User not found: 507f1f77bcf86cd799439011",
  "code": "NOT_FOUND",
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

### 3. Validation Errors

Use for complex validation failures with detailed error messages.

```typescript
import { ValidationError } from '../errors/validation.error.js';

async createUser(data: CreateUserDto): Promise<User> {
  const errors = [];

  if (await this.userExists(data.email)) {
    errors.push({ field: 'email', message: 'Email already exists' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return this.userRepository.create(data);
}
```

**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Email already exists" }
  ],
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

### 4. Configuration Errors

Use for startup/configuration errors (non-operational).

```typescript
import { ConfigurationError } from '../errors/configuration.error.js';

export function getEnvString(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined && defaultValue === undefined) {
    throw new ConfigurationError(
      `Environment variable ${key} is required but not set`,
      { key }
    );
  }

  return value ?? defaultValue!;
}
```

### 5. Database Errors

Use for database connection or operation failures.

```typescript
import { DatabaseError } from '../errors/database.error.js';

fastify.addHook('onReady', async function () {
  if (!fastify.mongo.db) {
    throw new DatabaseError('MongoDB database instance not available');
  }
  setupContainer(fastify.mongo.db, fastify.log);
});
```

### 6. Service Unavailable

Use when a dependent service or resource is unavailable.

```typescript
import { ServiceUnavailableError } from '../errors/service-unavailable.error.js';

if (!fastify.mongo?.db) {
  throw new ServiceUnavailableError('database');
}
```

**Response:**
```json
{
  "success": false,
  "error": "Service unavailable: database",
  "code": "SERVICE_UNAVAILABLE",
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

## Error Middleware

The error middleware automatically handles all custom errors:

```typescript
// src/middleware/error.middleware.ts

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // 1. Handle ApiError instances (our custom errors)
  if (isApiError(error)) {
    // Track custom error metrics
    customErrorsByType.inc({
      error_type: error.constructor.name,
      error_code: error.code,
      endpoint: request.url
    });

    reply.status(error.statusCode).send(error.toClientResponse());
    return;
  }

  // 2. Handle non-operational errors (programming errors)
  if (error instanceof BaseError && !error.isOperational) {
    // Log as fatal, hide details from client
    request.log.fatal(error.toJSON());
    reply.status(500).send(createErrorResponse('Internal server error'));
    return;
  }

  // 3. Fallback for other errors...
}
```

**Key Features:**
- Automatic HTTP status code from `error.statusCode`
- Client-safe responses via `toClientResponse()`
- Error metrics tracking
- Non-operational error handling (hides details)
- Request logging with full error context

## Error Response Format

All errors follow a consistent response format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;              // Human-readable error message
  code?: string;              // Machine-readable code
  timestamp?: string;         // ISO 8601 timestamp
  details?: any[];            // Optional validation details
}
```

### Example Responses

**Simple Error:**
```json
{
  "success": false,
  "error": "User not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "age", "message": "Must be at least 18" }
  ],
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

## Error Metrics

Errors are automatically tracked with Prometheus metrics:

```typescript
// Metric: api_custom_errors_total
customErrorsByType.inc({
  error_type: 'InvalidIdError',
  error_code: 'INVALID_ID_FORMAT',
  endpoint: '/api/users/invalid-id'
});
```

**Available labels:**
- `error_type`: Error class name (e.g., `InvalidIdError`)
- `error_code`: Error code (e.g., `INVALID_ID_FORMAT`)
- `endpoint`: Request path (e.g., `/api/users/:id`)

**Query examples:**
```promql
# Total errors by type
sum(api_custom_errors_total) by (error_type)

# Error rate for specific endpoint
rate(api_custom_errors_total{endpoint="/api/users/:id"}[5m])
```

## Error Guards

Type guard utilities for error handling:

```typescript
import {
  isApiError,
  isBaseError,
  isOperationalError,
  getErrorMessage,
  getErrorCode,
  getStatusCode
} from '../utils/error-guards.js';

// Type guards
if (isApiError(error)) {
  console.log(error.statusCode);  // TypeScript knows this exists
}

if (isOperationalError(error)) {
  // Expected error - safe to show details
} else {
  // Programming error - hide details
}

// Safe extractors
const message = getErrorMessage(error);      // Works with any error
const code = getErrorCode(error);            // Returns undefined for non-BaseError
const statusCode = getStatusCode(error);     // Returns 500 for non-ApiError
```

## Best Practices

### 1. Use Specific Error Classes

❌ **Bad:**
```typescript
if (!user) {
  throw new Error('User not found');  // Generic error
}
```

✅ **Good:**
```typescript
if (!user) {
  throw new NotFoundError('User', id);  // Typed error with context
}
```

### 2. Include Context for Debugging

❌ **Bad:**
```typescript
throw new InvalidIdError(id);  // Minimal context
```

✅ **Good:**
```typescript
throw new InvalidIdError(id, {
  method: 'getUserById',
  userId: id,
  operation: 'fetch'
});  // Rich debugging context
```

### 3. Let Middleware Handle Errors

❌ **Bad:**
```typescript
async getUserById(id: string): Promise<void> {
  try {
    const user = await this.service.getUserById(id);
    if (!user) {
      reply.status(404).send({ error: 'Not found' });  // Manual handling
    }
  } catch (error) {
    reply.status(500).send({ error: 'Internal error' });
  }
}
```

✅ **Good:**
```typescript
async getUserById(id: string): Promise<void> {
  const user = await this.service.getUserById(id);

  if (!user) {
    throw new NotFoundError('User', id);  // Middleware handles it
  }

  reply.send(createSuccessDataResponse(user));
}
```

### 4. Use Operational vs Non-Operational Correctly

**Operational errors** (isOperational=true):
- User input errors
- Resource not found
- Validation failures
- External service failures
- Network timeouts

**Non-operational errors** (isOperational=false):
- Configuration errors
- Null reference errors
- Programming bugs
- Startup failures

```typescript
// Operational - expected error
throw new InvalidIdError(id);  // isOperational = true

// Non-operational - programming error
throw new ConfigurationError('Missing required config');  // isOperational = false
```

### 5. Test Error Scenarios

Always test error cases:

```typescript
describe('getUserById', () => {
  it('should throw InvalidIdError for invalid ID', async () => {
    await expect(userService.getUserById('invalid'))
      .rejects.toThrow(InvalidIdError);
  });

  it('should throw NotFoundError when user not found', async () => {
    await expect(userService.getUserById('507f1f77bcf86cd799439011'))
      .rejects.toThrow(NotFoundError);
  });
});
```

## Creating Custom Error Classes

To create a new error class:

```typescript
import { ApiError } from './api.error.js';

/**
 * Payment processing error (402).
 * Used when payment processing fails.
 */
export class PaymentRequiredError extends ApiError {
  constructor(reason: string, context?: Record<string, unknown>) {
    super(
      `Payment required: ${reason}`,
      402,
      'PAYMENT_REQUIRED',
      context
    );
  }
}
```

**Usage:**
```typescript
if (insufficientFunds) {
  throw new PaymentRequiredError('insufficient funds', {
    userId: user.id,
    amount: 100,
    balance: 50
  });
}
```

## Migration from Generic Errors

### Before (Generic Errors)

```typescript
// Service
if (!ObjectId.isValid(id)) {
  throw new Error('Invalid user ID format');  // Generic
}

// Controller
try {
  const user = await this.service.getUserById(id);
} catch (error) {
  if (error instanceof Error && error.message === 'Invalid user ID format') {
    reply.status(400).send({ error: error.message });  // String matching
    return;
  }
  reply.status(500).send({ error: 'Internal error' });
}
```

### After (Custom Errors)

```typescript
// Service
if (!ObjectId.isValid(id)) {
  throw new InvalidIdError(id, { method: 'getUserById' });  // Typed
}

// Controller
const user = await this.service.getUserById(id);
// Error middleware handles all ApiError instances automatically
```

## Summary

✅ **Benefits:**
- Type-safe error handling
- Automatic HTTP status codes
- Context preservation for debugging
- Client-safe responses
- Error metrics tracking
- Cleaner, more maintainable code

✅ **Key Takeaways:**
- Use specific error classes instead of generic `Error`
- Include context for better debugging
- Let the error middleware handle responses
- Test error scenarios
- Use operational vs non-operational correctly
