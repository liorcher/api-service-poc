import { ApiError } from '../errors/api.error.js';
import { BaseError } from '../errors/base.error.js';

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if error is a BaseError
 */
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

/**
 * Type guard to check if error is operational (expected error)
 */
export function isOperationalError(error: unknown): boolean {
  return isBaseError(error) && error.isOperational;
}

/**
 * Safely extracts error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely extracts error code from unknown error
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isBaseError(error)) {
    return error.code;
  }
  return undefined;
}

/**
 * Safely extracts HTTP status code from error
 */
export function getStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }
  return 500; // Default to internal server error
}
