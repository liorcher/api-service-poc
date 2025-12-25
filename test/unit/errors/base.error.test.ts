import { BaseError } from '../../../src/errors/base.error.js';

class TestError extends BaseError {
  constructor(
    message: string,
    code: string,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message, code, isOperational, context);
  }
}

describe('BaseError', () => {
  it('should create error with required properties', () => {
    const error = new TestError('Test error', 'TEST_ERROR');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('TestError');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should create error with context', () => {
    const context = { userId: '123', action: 'delete' };
    const error = new TestError('Test error', 'TEST_ERROR', true, context);

    expect(error.context).toEqual(context);
  });

  it('should mark error as non-operational', () => {
    const error = new TestError('Programming error', 'PROGRAMMING_ERROR', false);

    expect(error.isOperational).toBe(false);
  });

  it('should serialize to JSON with all properties', () => {
    const context = { userId: '123' };
    const error = new TestError('Test error', 'TEST_ERROR', true, context);
    const json = error.toJSON();

    expect(json).toHaveProperty('name', 'TestError');
    expect(json).toHaveProperty('message', 'Test error');
    expect(json).toHaveProperty('code', 'TEST_ERROR');
    expect(json).toHaveProperty('isOperational', true);
    expect(json).toHaveProperty('context', context);
    expect(json).toHaveProperty('timestamp');
    expect(json).toHaveProperty('stack');
    expect(typeof json.stack).toBe('string');
  });

  it('should preserve stack trace', () => {
    const error = new TestError('Test error', 'TEST_ERROR');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('TestError');
    expect(error.stack).toContain('Test error');
  });

  it('should default to operational error', () => {
    const error = new TestError('Test error', 'TEST_ERROR');

    expect(error.isOperational).toBe(true);
  });
});
