import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { randomUUID } from 'crypto';
import { loggerConfig } from '@config/index.js';
import mongodbPlugin from '@plugins/mongodb.js';
import { registerRoutes } from '@routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { requestContextMiddleware } from './middleware/request-context.middleware.js';
import { metricsMiddleware, metricsResponseMiddleware } from './middleware/metrics.middleware.js';
import { metricsRoutes } from '@routes/metrics.routes.js';

export async function buildApp(options: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: loggerConfig,
    genReqId: req => (req.headers['x-request-id'] as string) || randomUUID(),
    ...options
  });

  fastify.addHook('onRequest', requestContextMiddleware);
  fastify.addHook('onRequest', metricsMiddleware);
  fastify.addHook('onResponse', metricsResponseMiddleware);

  fastify.setErrorHandler(errorHandler);

  await fastify.register(mongodbPlugin);

  await fastify.register(metricsRoutes);

  await fastify.register(registerRoutes);

  return fastify;
}
