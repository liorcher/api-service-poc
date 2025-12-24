import { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { serverConfig } from '@config/index.js';

async function start(): Promise<void> {
  let fastify: FastifyInstance | undefined;
  try {
    fastify = await buildApp();

    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host
    });

    fastify.log.info(`Server listening on ${serverConfig.host}:${serverConfig.port}`);

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'] as const;
    signals.forEach(signal => {
      process.on(signal, async () => {
        if (fastify) {
          fastify.log.info(`Received ${signal}, closing server gracefully...`);
          await fastify.close();
          fastify.log.info('Server closed');
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
