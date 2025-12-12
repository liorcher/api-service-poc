# API Service POC

A production-ready Fastify API service with MongoDB, Pino logger, and modular architecture built with TypeScript.

## Features

- **TypeScript** for type safety and better developer experience
- **Fastify** web framework with async/await support
- **MongoDB** integration with @fastify/mongodb (dual auth: username/password + certificates)
- **Pino** logger with pretty printing in development
- **Modular architecture** with controller-service-repository pattern
- **Dependency Injection** with Awilix for auto-wiring and testability
- **Path aliases** (`@config/*`, `@modules/*`, etc.) for cleaner imports
- **Environment configuration** with dotenv and helper functions
- **Jest** testing framework with unit and integration tests
- **ESLint & Prettier** for code quality and formatting
- **JSON schema validation** for API requests
- **Separation of concerns** with clean architecture principles
- **Separate config files** for database, server, and logger
- **ts-node with nodemon** for development with hot reload

## Project Structure

```
api-service-poc/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── env.ts                   # Environment variables with helper functions
│   │   ├── database.config.ts       # Database configuration
│   │   ├── server.config.ts         # Server configuration
│   │   ├── logger.config.ts         # Logger configuration
│   │   └── index.ts                 # Config exports
│   ├── modules/                     # Feature modules
│   │   └── user/                    # User module
│   │       ├── user.controller.ts   # HTTP request handling
│   │       ├── user.service.ts      # Business logic
│   │       ├── user.repository.ts   # Data access layer
│   │       └── user.routes.ts       # Route definitions
│   ├── plugins/                     # Fastify plugins
│   │   └── mongodb.ts               # MongoDB connection plugin
│   ├── routes/                      # Routes registry
│   │   └── index.ts                 # Main routes file
│   ├── types/                       # TypeScript type definitions
│   │   ├── user.types.ts            # User-related types
│   │   └── fastify.d.ts             # Fastify type augmentation
│   ├── app.ts                       # Application setup
│   └── server.ts                    # Server entry point
├── test/                            # Test files
│   ├── unit/                        # Unit tests
│   │   ├── config/
│   │   │   └── env.test.ts          # Env helper tests
│   │   └── modules/user/
│   │       └── user.service.test.ts # Service unit tests
│   └── integration/                 # Integration tests
│       ├── app.test.ts              # App integration tests
│       └── modules/user/
│           └── user.api.test.ts     # User API integration tests
├── dist/                            # Compiled JavaScript (generated)
├── coverage/                        # Test coverage reports (generated)
├── .env.example                     # Example environment variables
├── .env                             # Environment variables (gitignored)
├── .prettierrc                      # Prettier configuration
├── .prettierignore                  # Prettier ignore patterns
├── eslint.config.mjs                # ESLint configuration
├── tsconfig.json                    # TypeScript configuration
├── jest.config.ts                   # Jest configuration
└── package.json
```

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

Run all tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run test:unit
```

Run only integration tests:

```bash
npm run test:integration
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

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

## License

ISC
