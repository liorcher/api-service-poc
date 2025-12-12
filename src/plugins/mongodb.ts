import fastifyPlugin from 'fastify-plugin';
import fastifyMongodb from '@fastify/mongodb';
import { FastifyInstance } from 'fastify';
import { databaseConfig } from '@config/index.js';
import { setupContainer } from '@di/setup.js';

async function mongodbConnector(fastify: FastifyInstance): Promise<void> {
  fastify.register(fastifyMongodb, {
    url: databaseConfig.url,
    forceClose: databaseConfig.forceClose,
    ...databaseConfig.options
  });

  fastify.addHook('onReady', async function () {
    if (!fastify.mongo.db) {
      throw new Error('MongoDB database instance not available');
    }
    setupContainer(fastify.mongo.db);
    fastify.log.info('MongoDB connected successfully');
    fastify.log.info('Dependency injection container initialized');
  });

  fastify.addHook('onClose', async function (instance) {
    instance.log.info('Closing MongoDB connection');
  });
}

export default fastifyPlugin(mongodbConnector);
