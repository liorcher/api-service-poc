import { BadRequestError } from './bad-request.error.js';

/**
 * Invalid MongoDB ObjectId error.
 * Used when an ID parameter doesn't match the expected ObjectId format.
 */
export class InvalidIdError extends BadRequestError {
  constructor(id: string, context?: Record<string, unknown>) {
    super('Invalid user ID format', { ...context, invalidId: id });
    this.code = 'INVALID_ID_FORMAT';
  }
}
