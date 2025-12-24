import { ApiError } from './api.error.js';

/**
 * Not found error (404).
 * Used when a requested resource does not exist.
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string, context?: Record<string, unknown>) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, 404, 'NOT_FOUND', { ...context, resource, identifier });
  }
}
