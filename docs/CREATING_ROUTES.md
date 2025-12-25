# Creating New Routes Guide

This guide provides step-by-step instructions for creating new routes in the API service.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Step-by-Step Guide](#step-by-step-guide)
- [File Structure](#file-structure)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Reference

Creating a new route involves 6 main files:

1. **Schema** - Define data validation with Zod
2. **Repository** - Handle database operations
3. **Service** - Implement business logic
4. **Controller** - Handle HTTP requests/responses
5. **Routes** - Define route endpoints
6. **Register** - Add routes to main router

## Step-by-Step Guide

### Step 1: Create Module Directory

Create a new directory under `src/modules/` for your feature:

```bash
mkdir -p src/modules/product
```

### Step 2: Define Schemas (`*.schema.ts`)

Create validation schemas using Zod:

```typescript
// src/modules/product/product.schema.ts
import { z } from 'zod/v4';
import { ObjectId } from 'mongodb';

/**
 * Product data model
 */
export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Zod validation schemas
 */

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0)
});

// Update product schema (all fields optional)
export const updateProductSchema = createProductSchema.partial();

// Product ID parameter
export const productIdParamSchema = z.object({
  id: z.string().length(24)  // MongoDB ObjectId length
});

// Response schemas
export const productResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export const productsArrayResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productResponseSchema)
});

// Infer TypeScript types from schemas
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
```

### Step 3: Create Repository Interface

Define the repository interface:

```typescript
// src/modules/product/interfaces/product-repository.interface.ts
import { ObjectId } from 'mongodb';
import { Product, CreateProductDto, UpdateProductDto } from '../product.schema.js';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: ObjectId): Promise<Product | null>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: ObjectId, data: UpdateProductDto): Promise<Product | null>;
  delete(id: ObjectId): Promise<boolean>;
}
```

### Step 4: Implement Repository (`*.repository.ts`)

Create the repository implementation:

```typescript
// src/modules/product/product.repository.ts
import { Db, ObjectId } from 'mongodb';
import { IProductRepository } from './interfaces/product-repository.interface.js';
import { Product, CreateProductDto, UpdateProductDto } from './product.schema.js';

export class ProductRepository implements IProductRepository {
  private readonly collection = 'products';

  constructor(private readonly db: Db) {}

  async findAll(): Promise<Product[]> {
    return this.db.collection<Product>(this.collection).find().toArray();
  }

  async findById(id: ObjectId): Promise<Product | null> {
    return this.db.collection<Product>(this.collection).findOne({ _id: id });
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product: Product = {
      ...data,
      createdAt: new Date()
    };

    const result = await this.db
      .collection<Product>(this.collection)
      .insertOne(product as any);

    return { ...product, _id: result.insertedId };
  }

  async update(id: ObjectId, data: UpdateProductDto): Promise<Product | null> {
    const result = await this.db
      .collection<Product>(this.collection)
      .findOneAndUpdate(
        { _id: id },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

    return result ?? null;
  }

  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.db
      .collection<Product>(this.collection)
      .deleteOne({ _id: id });

    return result.deletedCount > 0;
  }
}
```

### Step 5: Create Service Interface

Define the service interface:

```typescript
// src/modules/product/interfaces/product-service.interface.ts
import { Product, CreateProductDto, UpdateProductDto } from '../product.schema.js';

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: CreateProductDto): Promise<Product>;
  updateProduct(id: string, data: UpdateProductDto): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
}
```

### Step 6: Implement Service (`*.service.ts`)

Create the service with business logic and decorators:

```typescript
// src/modules/product/product.service.ts
import { ObjectId } from 'mongodb';
import { FastifyBaseLogger } from 'fastify';
import { IProductRepository } from './interfaces/product-repository.interface.js';
import { IProductService } from './interfaces/product-service.interface.js';
import { Product, CreateProductDto, UpdateProductDto } from './product.schema.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { Logger } from '@decorators/logger.decorator.js';
import { InvalidIdError } from '../../errors/invalid-id.error.js';

export class ProductService implements IProductService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly productRepository: IProductRepository) {}

  @LogMethod()
  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  @LogMethod()
  async getProductById(id: string): Promise<Product | null> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'getProductById' });
    }
    return this.productRepository.findById(new ObjectId(id));
  }

  @LogMethod()
  async createProduct(data: CreateProductDto): Promise<Product> {
    return this.productRepository.create(data);
  }

  @LogMethod()
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'updateProduct' });
    }
    return this.productRepository.update(new ObjectId(id), data);
  }

  @LogMethod()
  async deleteProduct(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'deleteProduct' });
    }
    return this.productRepository.delete(new ObjectId(id));
  }
}
```

### Step 7: Create Controller (`*.controller.ts`)

Implement the controller to handle HTTP requests:

```typescript
// src/modules/product/product.controller.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyBaseLogger } from 'fastify';
import { IProductService } from './interfaces/product-service.interface.js';
import { CreateProductDto, UpdateProductDto } from './product.schema.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { Logger } from '@decorators/logger.decorator.js';
import {
  createSuccessDataResponse,
  createSuccessMessageResponse
} from '@/types/api-response.schema.js';
import { NotFoundError } from '../../errors/not-found.error.js';

interface ProductIdParams {
  id: string;
}

export class ProductController {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly productService: IProductService) {}

  @LogMethod()
  async getAllProducts(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const products = await this.productService.getAllProducts();
    reply.send(createSuccessDataResponse(products));
  }

  @LogMethod()
  async getProductById(
    request: FastifyRequest<{ Params: ProductIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const product = await this.productService.getProductById(id);

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    reply.send(createSuccessDataResponse(product));
  }

  @LogMethod()
  async createProduct(
    request: FastifyRequest<{ Body: CreateProductDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const product = await this.productService.createProduct(request.body);
    reply.status(201).send(createSuccessDataResponse(product));
  }

  @LogMethod()
  async updateProduct(
    request: FastifyRequest<{ Params: ProductIdParams; Body: UpdateProductDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const product = await this.productService.updateProduct(id, request.body);

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    reply.send(createSuccessDataResponse(product));
  }

  @LogMethod()
  async deleteProduct(
    request: FastifyRequest<{ Params: ProductIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const deleted = await this.productService.deleteProduct(id);

    if (!deleted) {
      throw new NotFoundError('Product', id);
    }

    reply.send(createSuccessMessageResponse('Product deleted successfully'));
  }
}
```

### Step 8: Define Routes (`*.routes.ts`)

Create route definitions with validation:

```typescript
// src/modules/product/product.routes.ts
import { FastifyInstance } from 'fastify';
import { getProductController } from '@di/setup.js';
import { createProductSchema, updateProductSchema, productIdParamSchema } from './product.schema.js';

export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  const getController = () => getProductController();

  // Get all products
  fastify.get(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Retrieve a list of all products'
      }
    },
    async (request, reply) => {
      return getController().getAllProducts(request, reply);
    }
  );

  // Get product by ID
  fastify.get(
    '/products/:id',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get product by ID',
        description: 'Retrieve a single product by its ID',
        params: productIdParamSchema
      }
    },
    async (request, reply) => {
      return getController().getProductById(request, reply);
    }
  );

  // Create product
  fastify.post(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Create a new product with the provided data',
        body: createProductSchema
      }
    },
    async (request, reply) => {
      return getController().createProduct(request, reply);
    }
  );

  // Update product
  fastify.put(
    '/products/:id',
    {
      schema: {
        tags: ['Products'],
        summary: 'Update product',
        description: 'Update an existing product by ID',
        params: productIdParamSchema,
        body: updateProductSchema
      }
    },
    async (request, reply) => {
      return getController().updateProduct(request, reply);
    }
  );

  // Delete product
  fastify.delete(
    '/products/:id',
    {
      schema: {
        tags: ['Products'],
        summary: 'Delete product',
        description: 'Delete a product by ID',
        params: productIdParamSchema
      }
    },
    async (request, reply) => {
      return getController().deleteProduct(request, reply);
    }
  );
}
```

### Step 9: Register in Dependency Injection

Add to the DI container:

```typescript
// src/di/setup.ts
import { ProductRepository } from '@modules/product/product.repository.js';
import { ProductService } from '@modules/product/product.service.js';
import { ProductController } from '@modules/product/product.controller.js';

export function setupContainer(db: Db, logger: FastifyBaseLogger): void {
  container.register({
    // ... existing registrations ...

    // Product module
    productRepository: asClass(ProductRepository).singleton(),
    productService: asClass(ProductService).singleton(),
    productController: asClass(ProductController).singleton()
  });
}

// Add getters
export const getProductController = (): ProductController =>
  container.cradle.productController;
```

### Step 10: Register Routes in Main Router

Add routes to the main routes file:

```typescript
// src/routes/index.ts
import { FastifyInstance } from 'fastify';
import { userRoutes } from '@modules/user/user.routes.js';
import { productRoutes } from '@modules/product/product.routes.js';
import { healthRoutes } from './health.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Health check routes (no /api prefix)
  await fastify.register(healthRoutes);

  // API routes with /api prefix
  await fastify.register(
    async (apiInstance) => {
      await apiInstance.register(userRoutes);
      await apiInstance.register(productRoutes);  // Add here
    },
    { prefix: '/api' }
  );
}
```

## File Structure

After completing all steps, your module should look like:

```
src/modules/product/
├── interfaces/
│   ├── product-repository.interface.ts
│   └── product-service.interface.ts
├── product.schema.ts
├── product.repository.ts
├── product.service.ts
├── product.controller.ts
└── product.routes.ts
```

## Examples

### Example 1: Simple GET Endpoint

```typescript
// Route
fastify.get('/products/:id', {
  schema: {
    params: productIdParamSchema
  }
}, async (request, reply) => {
  return getController().getProductById(request, reply);
});

// Controller
async getProductById(request, reply) {
  const { id } = request.params;
  const product = await this.service.getProductById(id);

  if (!product) {
    throw new NotFoundError('Product', id);
  }

  reply.send(createSuccessDataResponse(product));
}
```

### Example 2: POST with Validation

```typescript
// Schema
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive()
});

// Route
fastify.post('/products', {
  schema: {
    body: createProductSchema
  }
}, async (request, reply) => {
  return getController().createProduct(request, reply);
});

// Controller
async createProduct(request, reply) {
  const product = await this.service.createProduct(request.body);
  reply.status(201).send(createSuccessDataResponse(product));
}
```

### Example 3: Query Parameters

```typescript
// Schema
export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional()
});

// Route
fastify.get('/products', {
  schema: {
    querystring: productQuerySchema
  }
}, async (request, reply) => {
  return getController().searchProducts(request, reply);
});

// Controller
async searchProducts(request, reply) {
  const { category, minPrice, maxPrice } = request.query;
  const products = await this.service.searchProducts({ category, minPrice, maxPrice });
  reply.send(createSuccessDataResponse(products));
}
```

## Best Practices

### 1. Use Decorators for Logging

Always use `@Logger()` and `@LogMethod()` decorators:

```typescript
export class ProductService {
  @Logger()  // Injects request-scoped logger
  private readonly logger!: FastifyBaseLogger;

  @LogMethod()  // Auto-logs entry/exit/errors
  async getProductById(id: string): Promise<Product | null> {
    // Implementation
  }
}
```

### 2. Throw Typed Errors

Use specific error classes instead of generic errors:

```typescript
// ❌ Bad
if (!product) {
  throw new Error('Product not found');
}

// ✅ Good
if (!product) {
  throw new NotFoundError('Product', id);
}
```

### 3. Validate ObjectIds Early

Check ObjectId validity in services:

```typescript
async getProductById(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    throw new InvalidIdError(id, { method: 'getProductById' });
  }
  return this.repository.findById(new ObjectId(id));
}
```

### 4. Use Path Aliases

Import using configured path aliases:

```typescript
import { Logger } from '@decorators/logger.decorator.js';
import { createSuccessDataResponse } from '@/types/api-response.schema.js';
import { IProductService } from '@modules/product/interfaces/product-service.interface.js';
```

### 5. Add Swagger Documentation

Include clear descriptions in route schemas:

```typescript
fastify.get('/products/:id', {
  schema: {
    tags: ['Products'],
    summary: 'Get product by ID',
    description: 'Retrieve a single product by its ID',
    params: productIdParamSchema,
    response: {
      200: productResponseSchema,
      404: errorResponseSchema
    }
  }
}, handler);
```

### 6. Write Tests

Always create unit and integration tests:

```typescript
// Unit test - test/unit/modules/product/product.service.test.ts
describe('ProductService', () => {
  it('should throw InvalidIdError for invalid ID', async () => {
    await expect(service.getProductById('invalid'))
      .rejects.toThrow(InvalidIdError);
  });
});

// Integration test - test/integration/modules/product/product.api.test.ts
describe('GET /api/products/:id', () => {
  it('should return 404 when product not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/products/507f1f77bcf86cd799439011',
      headers: { 'x-api-key': apiKey }
    });

    expect(response.statusCode).toBe(404);
  });
});
```

## Troubleshooting

### Routes not found (404)

**Problem:** Routes return 404 even though they're defined.

**Solution:**
1. Check routes are registered in `src/routes/index.ts`
2. Verify prefix matches (e.g., `/api/products` not `/products`)
3. Check DI container registration
4. Ensure `export` keyword is present on route function

### Validation errors

**Problem:** Request validation always fails.

**Solution:**
1. Check schema matches request structure
2. Verify `body`, `params`, or `querystring` key in schema
3. Test schema separately with Zod's `.parse()`
4. Check for typos in property names

### Dependency injection errors

**Problem:** "Cannot find module" or undefined controller.

**Solution:**
1. Register module in `src/di/setup.ts`
2. Add getter function (e.g., `getProductController`)
3. Use `.singleton()` for stateful services
4. Import with correct path alias

### Type errors

**Problem:** TypeScript compilation errors.

**Solution:**
1. Run `npm run typecheck` for detailed errors
2. Check interface implementations match
3. Verify imports use `.js` extension
4. Update `tsconfig.json` paths if needed

## Checklist

Use this checklist when creating new routes:

- [ ] Created module directory
- [ ] Defined schemas with Zod
- [ ] Created repository interface
- [ ] Implemented repository
- [ ] Created service interface
- [ ] Implemented service with decorators
- [ ] Created controller
- [ ] Defined routes with validation
- [ ] Registered in DI container
- [ ] Registered in main router
- [ ] Added Swagger documentation
- [ ] Wrote unit tests
- [ ] Wrote integration tests
- [ ] Tested with Postman/curl
- [ ] Verified error handling
- [ ] Checked logs output correctly

## Summary

Creating routes involves a structured approach:

1. **Schema** - Define data structure and validation
2. **Repository** - Database operations
3. **Service** - Business logic with logging
4. **Controller** - HTTP request handling
5. **Routes** - Endpoint definitions
6. **Registration** - DI and router setup

Following this pattern ensures:
- Consistent code structure
- Type safety throughout
- Automatic logging and metrics
- Proper error handling
- Testability
- Maintainability
