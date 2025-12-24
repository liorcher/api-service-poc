import { ApiError } from './api.error.js';

/**
 * Unauthorized error (401).
 * Used for authentication failures.
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', context);
  }
}
