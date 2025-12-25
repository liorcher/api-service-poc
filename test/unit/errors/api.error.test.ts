import { ApiError } from '../../../src/errors/api.error.js';
import { BaseError } from '../../../src/errors/base.error.js';

describe('ApiError', () => {
  it('should create API error with status code', () => {
    const error = new ApiError('Not found', 404, 'NOT_FOUND');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.isOperational).toBe(true);
  });

  it('should create API error with context', () => {
    const context = { resource: 'user', id: '123' };
    const error = new ApiError('User not found', 404, 'USER_NOT_FOUND', context);

    expect(error.context).toEqual(context);
    expect(error.statusCode).toBe(404);
  });

  it('should generate client-safe response', () => {
    const context = { internal: 'secret', userId: '123' };
    const error = new ApiError('Bad request', 400, 'BAD_REQUEST', context);
    const response = error.toClientResponse();

    expect(response).toEqual({
      success: false,
      error: 'Bad request',
      code: 'BAD_REQUEST',
      timestamp: error.timestamp.toISOString()
    });
  });

  it('should exclude stack trace from client response', () => {
    const error = new ApiError('Server error', 500, 'SERVER_ERROR');
    const response = error.toClientResponse();

    expect(response).not.toHaveProperty('stack');
    expect(response).not.toHaveProperty('context');
  });

  it('should handle different HTTP status codes', () => {
    const testCases = [
      { status: 400, message: 'Bad request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 404, message: 'Not found' },
      { status: 500, message: 'Internal error' },
      { status: 503, message: 'Service unavailable' }
    ];

    testCases.forEach(({ status, message }) => {
      const error = new ApiError(message, status, 'TEST_CODE');
      expect(error.statusCode).toBe(status);
      expect(error.message).toBe(message);
    });
  });

  it('should preserve all BaseError properties', () => {
    const error = new ApiError('Test error', 400, 'TEST_ERROR');

    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('isOperational');
    expect(error).toHaveProperty('timestamp');
    expect(error).toHaveProperty('name', 'ApiError');
  });
});
