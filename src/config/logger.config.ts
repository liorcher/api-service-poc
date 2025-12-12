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
          ignore: 'pid,hostname',
          singleLine: false,
          colorize: true,
          messageFormat: '{if className}[{className}]{end}{if method}[{method}]{end}{if reqId}[{reqId}]{end} {msg}'
        }
      }
    : undefined,
  serializers: {
    req: req => ({
      id: req.id,
      method: req.method,
      url: req.url
    }),
    res: res => ({
      statusCode: res.statusCode
    })
  }
};
