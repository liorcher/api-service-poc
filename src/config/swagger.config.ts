import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { createJsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from './env.js';

const transform = createJsonSchemaTransform({
  skipList: []
});

/**
 * Swagger/OpenAPI configuration for @fastify/swagger plugin
 */
export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'API Service POC',
      description: 'Auto-generated API documentation using Fastify and Zod schemas',
      version: '1.0.0',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url:
          env.NODE_ENV === 'production'
            ? 'https://your-production-url.com' // Update with actual production URL
            : `http://${env.HOST}:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Production' : 'Development'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints for monitoring and orchestration'
      },
      {
        name: 'Metrics',
        description: 'Prometheus metrics for observability'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'API key for authentication. Required for all `/api/*` endpoints.'
        }
      }
    }
  },
  transform: transform,
  // Hide internal routes from documentation
  hideUntagged: true
};

/**
 * Swagger UI configuration for @fastify/swagger-ui plugin
 */
export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list', // Show endpoints collapsed by default
    deepLinking: true,
    displayRequestDuration: true,
    filter: true, // Enable search/filter
    showExtensions: true,
    tryItOutEnabled: true // Enable "Try it out" by default
  },
  staticCSP: true,
  transformStaticCSP: header => header,
  transformSpecification: swaggerObject => {
    return swaggerObject;
  },
  transformSpecificationClone: true
};
