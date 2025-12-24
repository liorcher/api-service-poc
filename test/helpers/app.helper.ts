import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { createMockDb } from '../mocks/mongodb.mock.js';
import { setupContainer } from '@di/setup.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { requestContextMiddleware } from '@/middleware/request-context.middleware.js';
import { metricsMiddleware, metricsResponseMiddleware } from '@/middleware/metrics.middleware.js';
import { metricsRoutes } from '@routes/metrics.routes.js';
import { Db } from 'mongodb';
import { aRandomApiKey } from '../utils/test-utils.js';

export async function buildTestApp(
  apiKey?: string,
  options: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  process.env.API_KEYS = apiKey || aRandomApiKey();

  const fastify = Fastify({
    logger: { level: 'silent' },
    ...options
  });

  fastify.addHook('onRequest', requestContextMiddleware);
  fastify.addHook('onRequest', metricsMiddleware);
  fastify.addHook('onResponse', metricsResponseMiddleware);

  fastify.setErrorHandler(errorHandler);

  const mockDb = createMockDb() as Db;
  setupContainer(mockDb, fastify.log);

  fastify.decorate('mongo', {
    db: mockDb
  } as any);

  await fastify.register(metricsRoutes);
  await fastify.register(registerRoutes);
  await fastify.ready();

  return fastify;
}

export const TEST_API_KEY = 'test-api-key-12345';
