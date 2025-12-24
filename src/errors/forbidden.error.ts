import { ApiError } from './api.error.js';

/**
 * Forbidden error (403).
 * Used for authorization failures (authenticated but insufficient permissions).
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', context?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', context);
  }
}
