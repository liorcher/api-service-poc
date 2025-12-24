import { ApiError } from './api.error.js';

/**
 * Bad request error (400).
 * Used for general client errors that don't fit other specific categories.
 */
export class BadRequestError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', context);
  }
}
