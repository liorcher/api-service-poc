import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { validationErrors } from '../metrics/collectors.js';
import {
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse
} from '../types/api-response.schema.js';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(error);

  const fastifyError = error as FastifyError;

  if (fastifyError.statusCode === 404) {
    reply.status(404).send(createNotFoundResponse());
    return;
  }

  if (fastifyError.validation) {
    // Track validation error metrics
    const validationType = fastifyError.validationContext || 'unknown';
    validationErrors.inc({
      endpoint: request.routeOptions?.url || request.url,
      validation_type: validationType
    });

    reply.status(400).send(
      createValidationErrorResponse('Validation error', fastifyError.validation)
    );
    return;
  }

  reply.status(fastifyError.statusCode || 500).send(
    createErrorResponse(error.message || 'Internal server error')
  );
}
