import { z, ZodSchema } from 'zod/v4';

/**
 * Options for building a Swagger-compatible route schema
 */
export interface SwaggerRouteOptions {
  /** OpenAPI tags for grouping endpoints (e.g., ['Users'], ['Health']) */
  tags: string[];
  /** Brief summary of the endpoint */
  summary: string;
  /** Detailed description (optional) */
  description?: string;
  /** Zod schema for URL parameters */
  params?: ZodSchema;
  /** Zod schema for request body */
  body?: ZodSchema;
  /** Zod schema for query string parameters */
  querystring?: ZodSchema;
  /** Map of HTTP status codes to response Zod schemas */
  response: Record<number, ZodSchema>;
  /** Whether to require API key authentication (default: false) */
  security?: boolean;
}

/**
 * Helper function to build a Fastify route schema with Swagger/OpenAPI metadata.
 *
 * This makes adding Swagger documentation to routes simple and consistent:
 *
 * @example
 * ```typescript
 * fastify.get('/users', {
 *   schema: buildRouteSchema({
 *     tags: ['Users'],
 *     summary: 'Get all users',
 *     response: {
 *       200: commonResponses.successData(z.array(userSchema))
 *     },
 *     security: true
 *   })
 * }, handler)
 * ```
 */
export function buildRouteSchema(options: SwaggerRouteOptions) {
  const schema: Record<string, any> = {
    tags: options.tags,
    summary: options.summary
  };

  if (options.description) {
    schema.description = options.description;
  }

  if (options.params) {
    schema.params = options.params;
  }

  if (options.body) {
    schema.body = options.body;
  }

  if (options.querystring) {
    schema.querystring = options.querystring;
  }

  if (options.response) {
    schema.response = options.response;
  }

  // Add security requirement if specified
  if (options.security) {
    schema.security = [{ apiKey: [] }];
  }

  return schema;
}

/**
 * Pre-built response schemas for common API patterns.
 * All responses follow the `{ success: true/false, data/error: ... }` wrapper pattern.
 */
export const commonResponses = {
  /**
   * Success response with data: `{ success: true, data: T }`
   */
  successData: <T extends ZodSchema>(dataSchema: T) =>
    z.object({
      success: z.literal(true),
      data: dataSchema
    }),

  /**
   * Generic error response: `{ success: false, error: string }`
   */
  error: z.object({
    success: z.literal(false),
    error: z.string()
  }),

  /**
   * Not found error response: `{ success: false, error: string }`
   */
  notFound: z.object({
    success: z.literal(false),
    error: z.string()
  }),

  /**
   * Validation error response: `{ success: false, error: string, details?: any }`
   */
  validationError: z.object({
    success: z.literal(false),
    error: z.string(),
    details: z.any().optional()
  })
};
