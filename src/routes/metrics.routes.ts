import { FastifyInstance } from 'fastify';
import { metricsRegistry } from '../metrics/registry.js';

export async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', metricsRegistry.contentType);
    return metricsRegistry.metrics();
  });
}
