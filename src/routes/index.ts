import { FastifyInstance } from 'fastify';
import { healthRoutes } from '@routes/health.routes.js';
import { userRoutes } from '@modules/user/user.routes.js';
import { requireApiKey } from '../middleware/auth.middleware.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.register(healthRoutes);

  fastify.register(
    async instance => {
      instance.addHook('preHandler', requireApiKey());
      instance.register(userRoutes);
    },
    { prefix: '/api' }
  );
}
