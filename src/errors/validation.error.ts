import { ApiError } from './api.error.js';

/**
 * Validation error with detailed field-level errors.
 * Used for input validation failures.
 */
export class ValidationError extends ApiError {
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation error',
    details?: Array<{ field: string; message: string }>,
    context?: Record<string, unknown>
  ) {
    super(message, 400, 'VALIDATION_ERROR', context);
    this.details = details;
  }

  toClientResponse() {
    return {
      ...super.toClientResponse(),
      details: this.details
    };
  }
}
