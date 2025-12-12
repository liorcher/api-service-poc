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
    it('testGetEnvStringShouldReturnValueWhenVariableSet', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnvString('TEST_VAR')).toBe('test-value');
    });

    it('testGetEnvStringShouldReturnDefaultWhenVariableNotSet', () => {
      expect(getEnvString('NON_EXISTENT', 'default')).toBe('default');
    });

    it('testGetEnvStringShouldThrowErrorWhenVariableNotSetAndNoDefault', () => {
      expect(() => getEnvString('NON_EXISTENT')).toThrow(
        'Environment variable NON_EXISTENT is required but not set'
      );
    });
  });

  describe('getEnvNumber', () => {
    it('testGetEnvNumberShouldReturnNumberWhenVariableSet', () => {
      process.env.TEST_NUMBER = '42';
      expect(getEnvNumber('TEST_NUMBER')).toBe(42);
    });

    it('testGetEnvNumberShouldReturnDefaultWhenVariableNotSet', () => {
      expect(getEnvNumber('NON_EXISTENT', 100)).toBe(100);
    });

    it('testGetEnvNumberShouldThrowErrorWhenInvalidNumber', () => {
      process.env.TEST_NUMBER = 'not-a-number';
      expect(() => getEnvNumber('TEST_NUMBER')).toThrow(
        'Environment variable TEST_NUMBER must be a valid number'
      );
    });

    it('testGetEnvNumberShouldThrowErrorWhenVariableNotSetAndNoDefault', () => {
      expect(() => getEnvNumber('NON_EXISTENT')).toThrow(
        'Environment variable NON_EXISTENT is required but not set'
      );
    });
  });

  describe('getEnvBoolean', () => {
    it('testGetEnvBooleanShouldReturnTrueWhenStringIsTrue', () => {
      process.env.TEST_BOOL = 'true';
      expect(getEnvBoolean('TEST_BOOL')).toBe(true);
    });

    it('testGetEnvBooleanShouldReturnTrueWhenStringIs1', () => {
      process.env.TEST_BOOL = '1';
      expect(getEnvBoolean('TEST_BOOL')).toBe(true);
    });

    it('testGetEnvBooleanShouldReturnFalseWhenOtherValues', () => {
      process.env.TEST_BOOL = 'false';
      expect(getEnvBoolean('TEST_BOOL')).toBe(false);
    });

    it('testGetEnvBooleanShouldReturnDefaultWhenVariableNotSet', () => {
      expect(getEnvBoolean('NON_EXISTENT', true)).toBe(true);
      expect(getEnvBoolean('NON_EXISTENT')).toBe(false);
    });
  });
});
