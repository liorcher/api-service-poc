# Path Aliases

This project uses TypeScript path aliases to simplify imports and improve code navigation.

## Available Aliases

| Alias | Maps To | Usage |
|-------|---------|-------|
| `@/*` | `src/*` | Any file in src directory |
| `@config/*` | `src/config/*` | Configuration files |
| `@modules/*` | `src/modules/*` | Feature modules |
| `@common/*` | `src/types/*` | Shared type definitions |
| `@di/*` | `src/di/*` | Dependency injection |
| `@plugins/*` | `src/plugins/*` | Fastify plugins |
| `@routes/*` | `src/routes/*` | Route definitions |

## Examples

### Before (Relative Paths)
```typescript
// Deep nested imports - hard to read and maintain
import { UserService } from '../../../modules/user/user.service.js';
import { databaseConfig } from '../../config/database.config.js';
import { User } from '../../../types/user.types.js';
```

### After (Path Aliases)
```typescript
// Clean, readable imports
import { UserService } from '@modules/user/user.service.js';
import { databaseConfig } from '@config/database.config.js';
import { User } from '@common/user.types.js';
```

## Configuration

### TypeScript (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/types/*"],
      "@di/*": ["src/di/*"],
      "@plugins/*": ["src/plugins/*"],
      "@routes/*": ["src/routes/*"]
    }
  }
}
```

### Jest (`jest.config.ts`)
Jest requires mapping to resolve path aliases in tests:
```typescript
moduleNameMapper: {
  '^@/(.*)\\.(js|ts)$': '<rootDir>/src/$1',
  '^@config/(.*)\\.(js|ts)$': '<rootDir>/src/config/$1',
  // ... other mappings
}
```

### Runtime (`ts-node`)
The dev script uses `tsconfig-paths/register` to resolve aliases at runtime:
```json
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec ts-node -r tsconfig-paths/register src/server.ts"
  }
}
```

## Important Notes

### 1. Why `@common/*` instead of `@types/*`?
TypeScript reserves `@types/*` for DefinitelyTyped type declarations from npm. Using `@types/*` as an alias causes conflicts. We use `@common/*` for shared types instead.

### 2. Keep the `.js` Extension
Even though we're writing TypeScript, keep the `.js` extension in imports:
```typescript
// ✅ Correct
import { UserService } from '@modules/user/user.service.js';

// ❌ Wrong
import { UserService } from '@modules/user/user.service';
```

This is required for ES modules and ensures compatibility when the code is compiled.

### 3. IDE Support
Modern IDEs (VS Code, WebStorm) automatically support TypeScript path aliases configured in `tsconfig.json`:
- Auto-completion works
- Go to definition works
- Refactoring maintains aliases

### 4. Test Files
Test files can use the same path aliases to import from `src/`:
```typescript
// test/unit/modules/user/user.service.test.ts
import { UserService } from '@modules/user/user.service.js';
import { UserRepository } from '@modules/user/user.repository.js';
```

## Adding New Aliases

To add a new path alias:

### 1. Update `tsconfig.json`
```json
{
  "paths": {
    "@utils/*": ["src/utils/*"]  // Add new alias
  }
}
```

### 2. Update `jest.config.ts`
```typescript
moduleNameMapper: {
  '^@utils/(.*)\\.(js|ts)$': '<rootDir>/src/utils/$1'  // Add mapping
}
```

### 3. Use in your code
```typescript
import { formatDate } from '@utils/date.js';
```

## Benefits

✅ **Cleaner Imports** - No more `../../../`
✅ **Better Refactoring** - Moving files doesn't break imports
✅ **Easier Navigation** - Clear where modules come from
✅ **Consistent** - Same pattern across the entire codebase
✅ **IDE Support** - Full auto-completion and go-to-definition

## Common Patterns

```typescript
// Configuration
import { env, databaseConfig } from '@config/index.js';

// Modules
import { UserController } from '@modules/user/user.controller.js';
import { ProductService } from '@modules/product/product.service.js';

// Types
import { User, CreateUserDto } from '@common/user.types.js';

// DI
import { container, getUserController } from '@di/index.js';

// Plugins
import mongodbPlugin from '@plugins/mongodb.js';

// Routes
import { registerRoutes } from '@routes/index.js';

// Root-level files
import { buildApp } from '@/app.js';
```
