import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(error);

  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: 'Validation error',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    });
    return;
  }

  const fastifyError = error as FastifyError;

  if (fastifyError.statusCode === 404) {
    reply.status(404).send({
      success: false,
      error: 'Not found'
    });
    return;
  }

  if (fastifyError.validation) {
    reply.status(400).send({
      success: false,
      error: 'Validation error',
      details: fastifyError.validation
    });
    return;
  }

  reply.status(fastifyError.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal server error'
  });
}
