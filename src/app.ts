import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { loggerConfig } from '@config/index.js';
import mongodbPlugin from '@plugins/mongodb.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export async function buildApp(options: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: loggerConfig,
    ...options
  });

  fastify.setErrorHandler(errorHandler);

  await fastify.register(mongodbPlugin);

  await fastify.register(registerRoutes);

  return fastify;
}
