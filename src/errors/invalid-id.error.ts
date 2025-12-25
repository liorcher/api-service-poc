import { ApiError } from './api.error.js';

/**
 * Invalid MongoDB ObjectId error.
 * Used when an ID parameter doesn't match the expected ObjectId format.
 */
export class InvalidIdError extends ApiError {
  constructor(id: string, context?: Record<string, unknown>) {
    super(`Invalid ID format: ${id}`, 400, 'INVALID_ID_FORMAT', { ...context, id });
  }
}
