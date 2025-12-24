import { ApiError } from './api.error.js';

/**
 * Conflict error (409).
 * Used when a request conflicts with the current state of the resource.
 * Example: Creating a user with an email that already exists.
 */
export class ConflictError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', context);
  }
}
