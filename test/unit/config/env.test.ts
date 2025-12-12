import { getEnvString, getEnvNumber, getEnvBoolean } from '@config/env.js';

describe('Environment Helper Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnvString', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnvString('TEST_VAR')).toBe('test-value');
    });

    it('should return default value when variable is not set', () => {
      expect(getEnvString('NON_EXISTENT', 'default')).toBe('default');
    });

    it('should throw error when variable is not set and no default', () => {
      expect(() => getEnvString('NON_EXISTENT')).toThrow(
        'Environment variable NON_EXISTENT is required but not set'
      );
    });
  });

  describe('getEnvNumber', () => {
    it('should return number from environment variable', () => {
      process.env.TEST_NUMBER = '42';
      expect(getEnvNumber('TEST_NUMBER')).toBe(42);
    });

    it('should return default value when variable is not set', () => {
      expect(getEnvNumber('NON_EXISTENT', 100)).toBe(100);
    });

    it('should throw error for invalid number', () => {
      process.env.TEST_NUMBER = 'not-a-number';
      expect(() => getEnvNumber('TEST_NUMBER')).toThrow(
        'Environment variable TEST_NUMBER must be a valid number'
      );
    });

    it('should throw error when variable is not set and no default', () => {
      expect(() => getEnvNumber('NON_EXISTENT')).toThrow(
        'Environment variable NON_EXISTENT is required but not set'
      );
    });
  });

  describe('getEnvBoolean', () => {
    it('should return true for "true" string', () => {
      process.env.TEST_BOOL = 'true';
      expect(getEnvBoolean('TEST_BOOL')).toBe(true);
    });

    it('should return true for "1" string', () => {
      process.env.TEST_BOOL = '1';
      expect(getEnvBoolean('TEST_BOOL')).toBe(true);
    });

    it('should return false for other values', () => {
      process.env.TEST_BOOL = 'false';
      expect(getEnvBoolean('TEST_BOOL')).toBe(false);
    });

    it('should return default value when variable is not set', () => {
      expect(getEnvBoolean('NON_EXISTENT', true)).toBe(true);
      expect(getEnvBoolean('NON_EXISTENT')).toBe(false);
    });
  });
});
