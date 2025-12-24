import { ApiError } from './api.error.js';

/**
 * Service unavailable error (503).
 * Used when a dependent service or resource is unavailable.
 */
export class ServiceUnavailableError extends ApiError {
  constructor(service: string, context?: Record<string, unknown>) {
    super(`Service unavailable: ${service}`, 503, 'SERVICE_UNAVAILABLE', {
      ...context,
      service
    });
  }
}
