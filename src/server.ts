import Fastify, { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { serverConfig, env } from '@config/index.js';
import { metricsRoutes } from '@routes/metrics.routes.js';

async function start(): Promise<void> {
  let fastify: FastifyInstance | undefined;
  let metricsServer: FastifyInstance | undefined;

  try {
    fastify = await buildApp();

    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host
    });

    fastify.log.info(`Server listening on ${serverConfig.host}:${serverConfig.port}`);

    // Start separate metrics server if on different port
    if (env.METRICS_PORT !== serverConfig.port) {
      metricsServer = Fastify({
        logger: {
          level: env.LOG_LEVEL || 'info'
        }
      });

      await metricsServer.register(metricsRoutes);

      await metricsServer.listen({
        port: env.METRICS_PORT,
        host: serverConfig.host
      });

      fastify.log.info(`Metrics server listening on ${serverConfig.host}:${env.METRICS_PORT}`);
    } else {
      fastify.log.info(
        `Metrics available at http://${serverConfig.host}:${serverConfig.port}/metrics`
      );
    }

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'] as const;
    signals.forEach(signal => {
      process.on(signal, async () => {
        if (fastify) {
          fastify.log.info(`Received ${signal}, closing server gracefully...`);
          await fastify.close();
          fastify.log.info('Server closed');
        }
        if (metricsServer) {
          await metricsServer.close();
          fastify?.log.info('Metrics server closed');
        }
        process.exit(0);
      });
    });
  } catch (err) {
    if (fastify) {
      fastify.log.error(err);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

start();
