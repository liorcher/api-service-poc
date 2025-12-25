import { FastifyReply, FastifyRequest, preValidationHookHandler } from 'fastify';
import { ZodSchema } from 'zod/v4';
import { validationErrors } from '../metrics/collectors.js';
import { createValidationErrorResponse } from '../types/api-response.schema.js';

export function validateBody<T>(schema: ZodSchema<T>): preValidationHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      validationErrors.inc({
        endpoint: request.routeOptions?.url || request.url,
        validation_type: 'body'
      });
      reply.status(400).send(createValidationErrorResponse('Validation error', error as any));
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
      reply.status(400).send(createValidationErrorResponse('Validation error', error as any));
    }
  };
}
