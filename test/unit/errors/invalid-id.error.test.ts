import { InvalidIdError } from '../../../src/errors/invalid-id.error.js';
import { ApiError } from '../../../src/errors/api.error.js';

describe('InvalidIdError', () => {
  it('should create invalid ID error', () => {
    const error = new InvalidIdError('invalid-id-123');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(InvalidIdError);
    expect(error.message).toBe('Invalid ID format: invalid-id-123');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INVALID_ID_FORMAT');
  });

  it('should include ID in context', () => {
    const invalidId = 'abc123';
    const error = new InvalidIdError(invalidId);

    expect(error.context).toHaveProperty('id', invalidId);
  });

  it('should merge additional context', () => {
    const additionalContext = { method: 'getUserById', resource: 'user' };
    const error = new InvalidIdError('invalid-id', additionalContext);

    expect(error.context).toHaveProperty('id', 'invalid-id');
    expect(error.context).toHaveProperty('method', 'getUserById');
    expect(error.context).toHaveProperty('resource', 'user');
  });

  it('should generate correct client response', () => {
    const error = new InvalidIdError('bad-id');
    const response = error.toClientResponse();

    expect(response).toEqual({
      success: false,
      error: 'Invalid ID format: bad-id',
      code: 'INVALID_ID_FORMAT',
      timestamp: error.timestamp.toISOString()
    });
  });

  it('should be operational error', () => {
    const error = new InvalidIdError('test-id');

    expect(error.isOperational).toBe(true);
  });
});
