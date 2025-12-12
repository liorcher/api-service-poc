import { preHandlerHookHandler } from 'fastify';
import { env } from '@config/env.js';

export function requireApiKey(): preHandlerHookHandler {
  return async (request, reply) => {
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return reply.status(401).send({
        success: false,
        error: 'API key required'
      });
    }

    if (!env.API_KEYS.includes(apiKey as string)) {
      return reply.status(403).send({
        success: false,
        error: 'Invalid API key'
      });
    }
  };
}
