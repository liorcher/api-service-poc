import { FastifyInstance } from 'fastify';
import { container } from '@di/container.js';
import { ServiceUnavailableError } from '../errors/service-unavailable.error.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/health/live',
    {
      schema: {
        tags: ['Health'],
        summary: 'Liveness probe',
        description: 'Check if the application process is running'
      }
    },
    async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    }
  );

  fastify.get(
    '/health/ready',
    {
      schema: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description:
          'Check if the application is ready to serve traffic (database and container checks)'
      }
    },
    async (request, reply) => {
      const startTime = Date.now();
      const checks = {
        database: { status: 'disconnected', responseTime: undefined as number | undefined },
        container: { status: 'not_initialized' }
      };

      try {
        if (container.cradle.db) {
          checks.container.status = 'connected';
        }

        if (!fastify.mongo?.db) {
          throw new ServiceUnavailableError('database');
        }

        const pingResult = await fastify.mongo.db.admin().ping();
        if (pingResult.ok === 1) {
          checks.database.status = 'connected';
          checks.database.responseTime = Date.now() - startTime;
        }

        return reply.code(200).send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          checks
        });
      } catch (error) {
        request.log.error({ error, checks }, 'Readiness check failed');

        return reply.code(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          checks,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Combined health check',
        description: 'Get comprehensive health status including liveness and readiness checks'
      }
    },
    async (_request, reply) => {
      const checks = {
        liveness: { status: 'healthy' as const },
        readiness: {
          database: { status: 'disconnected' },
          container: { status: 'not_initialized' }
        }
      };

      try {
        if (container.cradle.db) {
          checks.readiness.container.status = 'connected';
        }

        if (fastify.mongo?.db) {
          const pingResult = await fastify.mongo.db.admin().ping();
          if (pingResult.ok === 1) {
            checks.readiness.database.status = 'connected';
          }
        }

        const allHealthy =
          checks.readiness.database.status === 'connected' &&
          checks.readiness.container.status === 'connected';

        return reply.code(allHealthy ? 200 : 503).send({
          status: allHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          checks
        });
      } catch (error) {
        return reply.code(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          checks,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
}
