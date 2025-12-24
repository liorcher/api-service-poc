import { preHandlerHookHandler } from 'fastify';
import { env } from '@config/env.js';
import { authFailures } from '../metrics/collectors.js';

export function requireApiKey(): preHandlerHookHandler {
  return async (request, reply) => {
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      authFailures.inc({ reason: 'missing_api_key' });
      return reply.status(401).send({
        success: false,
        error: 'API key required'
      });
    }

    if (!env.API_KEYS.includes(apiKey as string)) {
      authFailures.inc({ reason: 'invalid_api_key' });
      return reply.status(403).send({
        success: false,
        error: 'Invalid API key'
      });
    }
  };
}
