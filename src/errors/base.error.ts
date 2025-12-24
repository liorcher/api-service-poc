/**
 * Base error class for all application errors.
 * Extends native Error with operational error tracking and context.
 */
export abstract class BaseError extends Error {
  /**
   * Distinguishes operational errors (expected) from programming errors (bugs).
   * - Operational errors: user errors, external service failures, invalid input
   * - Programming errors: null reference, unhandled edge case, assertion failures
   */
  public readonly isOperational: boolean;

  /**
   * Machine-readable error code for client handling.
   * Examples: 'USER_NOT_FOUND', 'INVALID_ID_FORMAT', 'DB_CONNECTION_FAILED'
   */
  public readonly code: string;

  /**
   * Additional context about the error (user input, IDs, parameters).
   * Useful for debugging and logging, excluded from client responses.
   */
  public readonly context?: Record<string, unknown>;

  /**
   * Timestamp when error was created
   */
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown (V8)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializes error for logging (includes context and stack trace)
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}
