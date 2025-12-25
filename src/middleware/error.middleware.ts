import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { validationErrors, customErrorsByType } from '../metrics/collectors.js';
import {
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse
} from '../types/api-response.schema.js';
import { BaseError } from '../errors/base.error.js';
import { isApiError } from '../utils/error-guards.js';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(error);

  // 1. Handle ApiError instances (our custom errors)
  if (isApiError(error)) {
    // Track custom error metrics
    customErrorsByType.inc({
      error_type: error.constructor.name,
      error_code: error.code,
      endpoint: request.url
    });

    reply.status(error.statusCode).send(error.toClientResponse());
    return;
  }

  // 2. Handle non-operational errors (programming errors)
  if (error instanceof BaseError && !error.isOperational) {
    // Log as fatal, hide details from client
    request.log.fatal(error.toJSON());
    reply.status(500).send(createErrorResponse('Internal server error'));
    return;
  }

  // 3. Existing Fastify error handling
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

    reply
      .status(400)
      .send(createValidationErrorResponse('Validation error', fastifyError.validation));
    return;
  }

  reply
    .status(fastifyError.statusCode || 500)
    .send(createErrorResponse(error.message || 'Internal server error'));
}
