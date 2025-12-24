import { FastifyReply, FastifyRequest, preValidationHookHandler } from 'fastify';
import { ZodSchema } from 'zod';
import { validationErrors } from '../metrics/collectors.js';

export function validateBody<T>(schema: ZodSchema<T>): preValidationHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      validationErrors.inc({
        endpoint: request.routeOptions?.url || request.url,
        validation_type: 'body'
      });
      reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error
      });
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>): preValidationHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      validationErrors.inc({
        endpoint: request.routeOptions?.url || request.url,
        validation_type: 'params'
      });
      reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error
      });
    }
  };
}
