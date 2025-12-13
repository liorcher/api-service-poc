# API Service POC

A production-ready Fastify API service with MongoDB, Pino logger, and modular architecture built with TypeScript.

## Features

- **TypeScript** for type safety and better developer experience
- **Fastify** web framework with async/await support
- **MongoDB** integration with @fastify/mongodb (dual auth: username/password + certificates)
- **Pino** logger with pretty printing in development
- **Logging decorators** (`@Logger`, `@LogMethod`) for zero-boilerplate logging
- **Request context** with AsyncLocalStorage for distributed tracing
- **Automatic log sanitization** for security and compliance
- **Modular architecture** with controller-service-repository pattern
- **Dependency Injection** with Awilix for auto-wiring and testability
- **Path aliases** (`@config/*`, `@modules/*`, etc.) for cleaner imports
- **Environment configuration** with dotenv and helper functions
- **Jest** testing framework with parameterized tests and random data generators
- **Comprehensive test utilities** (`aRandom*` functions) for robust testing
- **ESLint & Prettier** for code quality and formatting
- **JSON schema validation** for API requests
- **Separation of concerns** with clean architecture principles
- **ts-node with nodemon** for development with hot reload

## Project Structure

```
api-service-poc/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── env.ts                   # Environment variables with helper functions
│   │   ├── database.config.ts       # Database configuration
│   │   ├── server.config.ts         # Server configuration
│   │   └── logger.config.ts         # Logger configuration
│   ├── modules/                     # Feature modules
│   │   └── user/                    # User module
│   │       ├── user.controller.ts   # HTTP request handling
│   │       ├── user.service.ts      # Business logic
│   │       ├── user.repository.ts   # Data access layer
│   │       ├── user.schema.ts       # Zod validation schemas
│   │       ├── user.routes.ts       # Route definitions
│   │       └── interfaces/          # TypeScript interfaces
│   ├── decorators/                  # Logging decorators
│   │   ├── logger.decorator.ts      # @Logger() decorator
│   │   └── log-method.decorator.ts  # @LogMethod() decorator
│   ├── context/                     # Request context (AsyncLocalStorage)
│   │   └── request-context.ts       # Request context storage and helpers
│   ├── middleware/                  # Request middleware
│   │   ├── request-context.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── constants/                   # Application constants
│   │   └── log-sanitizer.constants.ts
│   ├── utils/                       # Utility functions
│   │   └── log-sanitizer.ts         # Log sanitization utility
│   ├── di/                          # Dependency injection
│   │   ├── container.ts             # Awilix container
│   │   └── setup.ts                 # Container setup
│   ├── plugins/                     # Fastify plugins
│   │   └── mongodb.ts               # MongoDB connection plugin
│   ├── routes/                      # Routes registry
│   │   └── index.ts                 # Main routes file
│   ├── types/                       # TypeScript type definitions
│   │   └── fastify.d.ts             # Fastify type augmentation
│   ├── app.ts                       # Application setup
│   └── server.ts                    # Server entry point
├── test/                            # Test files
│   ├── unit/                        # Unit tests
│   │   ├── config/                  # Config tests
│   │   ├── modules/user/            # User module tests
│   │   └── utils/                   # Utility tests
│   ├── integration/                 # Integration tests
│   │   ├── app.test.ts              # App integration tests
│   │   └── modules/user/            # User API tests
│   ├── utils/                       # Test utility functions
│   │   ├── test-utils.ts            # Random data generators (aRandom*)
│   │   └── test-constants.ts        # Test constants
│   ├── helpers/                     # Test setup helpers
│   │   └── app.helper.ts            # buildTestApp()
│   └── mocks/                       # Test mocks
│       ├── logger.mock.ts           # Logger mock
│       ├── mongodb.mock.ts          # MongoDB mock
│       └── user-repository.mock.ts  # Repository mock
├── docs/                            # Documentation
│   ├── DECORATORS.md                # Logging decorators guide
│   ├── REQUEST_CONTEXT.md           # Request context pattern
│   ├── LOG_SANITIZATION.md          # Log sanitization guide
│   ├── TESTING.md                   # Testing guide
│   ├── DATABASE_AUTH.md             # Database authentication
│   ├── PATH_ALIASES.md              # Path aliases guide
│   └── DEPENDENCY_INJECTION.md      # DI guide
├── dist/                            # Compiled JavaScript (generated)
├── coverage/                        # Test coverage reports (generated)
├── .env.example                     # Example environment variables
├── .env                             # Environment variables (gitignored)
├── .prettierrc                      # Prettier configuration
├── eslint.config.mjs                # ESLint configuration
├── tsconfig.json                    # TypeScript configuration
├── jest.config.ts                   # Jest configuration
└── package.json
```

## Advanced Features

### Logging Decorators

This project uses custom TypeScript decorators for zero-boilerplate logging:

```typescript
export class UserService {
  @Logger()  // Injects class-specific logger
  private readonly logger!: FastifyBaseLogger;

  @LogMethod()  // Automatic entry/exit/error logging
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
```

**Benefits:**
- Automatic performance tracking
- Request-scoped logging with request IDs
- Sensitive data sanitization
- Clean, readable code

📖 See [docs/DECORATORS.md](docs/DECORATORS.md) for complete guide.

### Request Context

Per-request context using Node.js AsyncLocalStorage for distributed tracing:

```typescript
// Automatically available throughout the request lifecycle
const logger = getRequestLogger();  // Includes request ID
const reqId = getRequestId();       // Access request ID anywhere
```

📖 See [docs/REQUEST_CONTEXT.md](docs/REQUEST_CONTEXT.md) for implementation details.

### Log Sanitization

Automatic redaction of sensitive data for security and compliance:

```typescript
// Input:  { email: "user@example.com", password: "secret123" }
// Logged: { email: "user@example.com", password: "[REDACTED]" }
```

**Protects:**
- Passwords, API keys, tokens, secrets
- Authorization headers
- Nested sensitive data
- PII for GDPR/PCI compliance

📖 See [docs/LOG_SANITIZATION.md](docs/LOG_SANITIZATION.md) for security features.

### Testing Utilities

Comprehensive test helpers with random data generators:

```typescript
// No hardcoded test values - everything is random
const user = aRandomUser();
const email = aRandomEmail();
const apiKey = aRandomApiKey();
```

**Features:**
- 20+ random data generators (`aRandom*` functions)
- Parameterized tests with `it.each()`
- Test helpers and mocks
- AAA pattern (Arrange-Act-Assert)

📖 See [docs/TESTING.md](docs/TESTING.md) for complete testing guide.

## Getting Started

### Prerequisites

- Node.js 18+ (for native test runner and watch mode)
- MongoDB instance running locally or remotely

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and other settings.

### Running the Application

Development mode with auto-restart (using ts-node + nodemon):

```bash
npm run dev
```

Production mode (build first, then run):

```bash
npm run build
npm start
```

Type checking:

```bash
npm run typecheck
```

The server will start on `http://localhost:3000` by default.

### Code Quality

Lint your code with ESLint:

```bash
npm run lint              # Check for linting errors
npm run lint:fix          # Fix linting errors automatically
```

Format your code with Prettier:

```bash
npm run format            # Format all files
npm run format:check      # Check if files are formatted
```

### API Endpoints

Health check:
- `GET /health` - Returns service health status

User endpoints:
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Testing

📖 For comprehensive testing documentation including test utilities, helpers, patterns, and best practices, see [docs/TESTING.md](docs/TESTING.md).

#### Quick Start

```bash
npm test                  # Run all tests (65 test cases)
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode
```

**Test Features:**
- Parameterized tests with `it.each()`
- Random data generators (`aRandom*` functions)
- AAA pattern (Arrange-Act-Assert)
- Shared mocks and helpers
- 100% pass rate, 0 lint errors

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost)
- `MONGODB_URI` - MongoDB connection string (required)
- `LOG_LEVEL` - Pino log level (default: info)

## Architecture

This project follows a modular architecture with the controller-service-repository pattern:

- **Controllers** (`*.controller.ts`): Handle HTTP requests/responses and validation
- **Services** (`*.service.ts`): Contain business logic and orchestration
- **Repositories** (`*.repository.ts`): Handle data access and MongoDB operations
- **Routes** (`*.routes.ts`): Define HTTP routes and schema validation
- **Types** (`src/types/`): TypeScript interfaces and type definitions

Each feature is organized into its own module directory (e.g., `src/modules/user/`) containing all related files.

## Best Practices Implemented

- **TypeScript** for type safety and improved code quality
- **Modular architecture** with clear separation of concerns
- **Dependency injection** pattern for testability
- **Environment variable management** with dotenv and helper functions
- **Separate configuration files** for different concerns (database, server, logger)
- **Request/response schema validation** with JSON schemas
- **Structured logging** with Pino
- **Error handling** with appropriate HTTP status codes
- **Connection management** with graceful shutdown
- **Comprehensive testing** with Jest (unit and integration tests)
- **Test coverage** reporting
- **Code quality tools** with ESLint and Prettier
- **Hot reload** in development with ts-node and nodemon
- **Clean code principles** with single responsibility

## Configuration

The project uses separate configuration files for better organization:

### Application Configuration
- **env.ts**: Environment variable helper functions (`getEnvString`, `getEnvNumber`, `getEnvBoolean`)
- **database.config.ts**: MongoDB connection configuration
- **server.config.ts**: Server settings (port, host, environment)
- **logger.config.ts**: Pino logger configuration
- **fastify.d.ts**: TypeScript type augmentation for Fastify

### Code Quality Configuration
- **eslint.config.mjs**: ESLint rules and TypeScript integration
- **.prettierrc**: Prettier formatting rules
- **tsconfig.json**: TypeScript compiler options
- **jest.config.ts**: Jest testing configuration

## Testing Strategy

The project includes two types of tests:

- **Unit Tests** (`test/unit/`): Test individual components in isolation with mocked dependencies
- **Integration Tests** (`test/integration/`): Test API endpoints and full application flow with real dependencies

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[DECORATORS.md](docs/DECORATORS.md)** - Logging decorators (@Logger, @LogMethod)
- **[REQUEST_CONTEXT.md](docs/REQUEST_CONTEXT.md)** - Request context pattern with AsyncLocalStorage
- **[LOG_SANITIZATION.md](docs/LOG_SANITIZATION.md)** - Automatic log sanitization for security
- **[TESTING.md](docs/TESTING.md)** - Testing guide with utilities and patterns
- **[DATABASE_AUTH.md](docs/DATABASE_AUTH.md)** - MongoDB authentication methods
- **[PATH_ALIASES.md](docs/PATH_ALIASES.md)** - Path aliases configuration
- **[DEPENDENCY_INJECTION.md](docs/DEPENDENCY_INJECTION.md)** - Dependency injection with Awilix

## License

ISC
