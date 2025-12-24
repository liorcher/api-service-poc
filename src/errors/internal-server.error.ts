import { ApiError } from './api.error.js';

/**
 * Internal server error (500).
 * Used for unexpected server-side errors.
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', context?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', context);
  }
}
