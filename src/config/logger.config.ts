import { FastifyServerOptions } from 'fastify';
import { env } from './env.js';
import { isDevelopment } from './server.config.js';

export const loggerConfig: FastifyServerOptions['logger'] = {
  level: env.LOG_LEVEL,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    : undefined
};
