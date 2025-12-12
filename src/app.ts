import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { randomUUID } from 'crypto';
import { loggerConfig } from '@config/index.js';
import mongodbPlugin from '@plugins/mongodb.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import {
  requestLoggingMiddleware,
  requestCompletedHook
} from './middleware/request-logging.middleware.js';

export async function buildApp(options: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: loggerConfig,
    genReqId: req => (req.headers['x-request-id'] as string) || randomUUID(),
    ...options
  });

  fastify.setErrorHandler(errorHandler);

  fastify.addHook('preHandler', requestLoggingMiddleware);
  fastify.addHook('onResponse', requestCompletedHook);

  await fastify.register(mongodbPlugin);

  await fastify.register(registerRoutes);

  return fastify;
}
