import { BaseError } from './base.error.js';

/**
 * Configuration error - thrown during app startup.
 * These are NOT operational errors (indicate programming/deployment issues).
 * Application should not start if configuration is invalid.
 */
export class ConfigurationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', false, context); // isOperational = false
  }
}
