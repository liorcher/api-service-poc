import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { createMockDb } from '../mocks/mongodb.mock.js';
import { testLogger } from '../mocks/logger.mock.js';
import { setupContainer } from '@di/setup.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { Db } from 'mongodb';
import { aRandomApiKey } from '../utils/test-utils.js';

export async function buildTestApp(apiKey?: string, options: FastifyServerOptions = {}): Promise<FastifyInstance> {
  process.env.API_KEYS = apiKey || aRandomApiKey();

  const fastify = Fastify({
    logger: false,
    ...options
  });

  fastify.setErrorHandler(errorHandler);

  const mockDb = createMockDb() as Db;
  setupContainer(mockDb, testLogger);

  await fastify.register(registerRoutes);
  await fastify.ready();

  return fastify;
}
