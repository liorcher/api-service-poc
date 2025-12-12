import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { createMockDb } from '../mocks/mongodb.mock.js';
import { testLogger } from '../mocks/logger.mock.js';
import { setupContainer } from '@di/setup.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { Db } from 'mongodb';

export const TEST_API_KEY = 'test-api-key-12345';

export async function buildTestApp(options: FastifyServerOptions = {}): Promise<FastifyInstance> {
  process.env.API_KEYS = TEST_API_KEY;

  const fastify = Fastify({
    logger: false,
    ...options
  });

  fastify.setErrorHandler(errorHandler);

  const mockDb = createMockDb() as Db;
  setupContainer(mockDb, testLogger as any);

  await fastify.register(registerRoutes);
  await fastify.ready();

  return fastify;
}
