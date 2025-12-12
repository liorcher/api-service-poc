import { buildApp } from './app.js';
import { serverConfig } from '@config/index.js';

async function start(): Promise<void> {
  let fastify;
  try {
    fastify = await buildApp();

    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host
    });

    fastify.log.info(`Server listening on ${serverConfig.host}:${serverConfig.port}`);
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
