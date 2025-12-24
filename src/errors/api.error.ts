import { BaseError } from './base.error.js';

/**
 * HTTP-specific error with status code.
 * Use for errors that should be returned to API clients.
 */
export class ApiError extends BaseError {
  /**
   * HTTP status code (400, 404, 500, etc.)
   */
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message, code, true, context);
    this.statusCode = statusCode;
  }

  /**
   * Creates client-safe response (excludes stack trace and sensitive context).
   * Returns response in the standardized API format.
   */
  toClientResponse() {
    return {
      success: false as const,
      error: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString()
    };
  }
}
