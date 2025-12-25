import {
  isApiError,
  isBaseError,
  isOperationalError,
  getErrorMessage,
  getErrorCode,
  getStatusCode
} from '../../../src/utils/error-guards.js';
import { ApiError } from '../../../src/errors/api.error.js';
import { InvalidIdError } from '../../../src/errors/invalid-id.error.js';
import { ConfigurationError } from '../../../src/errors/configuration.error.js';

describe('Error Guards', () => {
  describe('isApiError', () => {
    it('should return true for ApiError instances', () => {
      const error = new ApiError('Test', 400, 'TEST');
      expect(isApiError(error)).toBe(true);
    });

    it('should return true for ApiError subclasses', () => {
      const error = new InvalidIdError('test-id');
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for non-ApiError', () => {
      const error = new Error('Test');
      expect(isApiError(error)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe('isBaseError', () => {
    it('should return true for BaseError instances', () => {
      const error = new ConfigurationError('Test');
      expect(isBaseError(error)).toBe(true);
    });

    it('should return true for BaseError subclasses', () => {
      const error = new ApiError('Test', 400, 'TEST');
      expect(isBaseError(error)).toBe(true);
    });

    it('should return false for non-BaseError', () => {
      const error = new Error('Test');
      expect(isBaseError(error)).toBe(false);
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      const error = new ApiError('Test', 400, 'TEST');
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational errors', () => {
      const error = new ConfigurationError('Test');
      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for non-BaseError', () => {
      const error = new Error('Test');
      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      const error = new Error('Test message');
      expect(getErrorMessage(error)).toBe('Test message');
    });

    it('should extract message from ApiError', () => {
      const error = new ApiError('API error', 400, 'TEST');
      expect(getErrorMessage(error)).toBe('API error');
    });

    it('should convert non-Error to string', () => {
      expect(getErrorMessage('string error')).toBe('string error');
      expect(getErrorMessage(123)).toBe('123');
      expect(getErrorMessage({ foo: 'bar' })).toBe('[object Object]');
    });
  });

  describe('getErrorCode', () => {
    it('should extract code from BaseError', () => {
      const error = new ApiError('Test', 400, 'TEST_CODE');
      expect(getErrorCode(error)).toBe('TEST_CODE');
    });

    it('should return undefined for non-BaseError', () => {
      const error = new Error('Test');
      expect(getErrorCode(error)).toBeUndefined();
    });

    it('should return undefined for null/undefined', () => {
      expect(getErrorCode(null)).toBeUndefined();
      expect(getErrorCode(undefined)).toBeUndefined();
    });
  });

  describe('getStatusCode', () => {
    it('should extract status code from ApiError', () => {
      const error = new ApiError('Test', 404, 'NOT_FOUND');
      expect(getStatusCode(error)).toBe(404);
    });

    it('should return 500 for non-ApiError', () => {
      const error = new Error('Test');
      expect(getStatusCode(error)).toBe(500);
    });

    it('should return 500 for BaseError', () => {
      const error = new ConfigurationError('Test');
      expect(getStatusCode(error)).toBe(500);
    });

    it('should return 500 for null/undefined', () => {
      expect(getStatusCode(null)).toBe(500);
      expect(getStatusCode(undefined)).toBe(500);
    });
  });
});
