import { BaseError } from './base.error.js';

/**
 * Database error for database operation failures.
 * Used when database connections fail or queries error.
 */
export class DatabaseError extends BaseError {
  public readonly operation: string;

  constructor(message: string, operation: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', true, { ...context, operation });
    this.operation = operation;
  }
}
