import { FastifyReply, FastifyRequest, preValidationHookHandler } from 'fastify';
import { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>): preValidationHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
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
      reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error
      });
    }
  };
}
