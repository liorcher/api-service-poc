import { getEnvString, getEnvNumber, getEnvBoolean } from '@config/env.js';
import { aRandomString, aRandomInt } from '../../utils/test-utils.js';

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
      const varName = aRandomString();
      const varValue = aRandomString();
      process.env[varName] = varValue;

      const result = getEnvString(varName);

      expect(result).toBe(varValue);
    });

    it('testGetEnvStringShouldReturnDefaultWhenVariableNotSet', () => {
      const varName = aRandomString();
      const defaultValue = aRandomString();

      const result = getEnvString(varName, defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('testGetEnvStringShouldThrowErrorWhenVariableNotSetAndNoDefault', () => {
      const varName = aRandomString();

      expect(() => getEnvString(varName)).toThrow(
        `Environment variable ${varName} is required but not set`
      );
    });
  });

  describe('getEnvNumber', () => {
    it('testGetEnvNumberShouldReturnNumberWhenVariableSet', () => {
      const varName = aRandomString();
      const varValue = aRandomInt();
      process.env[varName] = varValue.toString();

      const result = getEnvNumber(varName);

      expect(result).toBe(varValue);
    });

    it('testGetEnvNumberShouldReturnDefaultWhenVariableNotSet', () => {
      const varName = aRandomString();
      const defaultValue = aRandomInt();

      const result = getEnvNumber(varName, defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('testGetEnvNumberShouldThrowErrorWhenInvalidNumber', () => {
      const varName = aRandomString();
      const invalidValue = aRandomString();
      process.env[varName] = invalidValue;

      expect(() => getEnvNumber(varName)).toThrow(
        `Environment variable ${varName} must be a valid number`
      );
    });

    it('testGetEnvNumberShouldThrowErrorWhenVariableNotSetAndNoDefault', () => {
      const varName = aRandomString();

      expect(() => getEnvNumber(varName)).toThrow(
        `Environment variable ${varName} is required but not set`
      );
    });
  });

  describe('getEnvBoolean', () => {
    it.each([
      { input: 'true', expected: true, description: 'StringIsTrue' },
      { input: '1', expected: true, description: 'StringIs1' }
    ])('testGetEnvBooleanShouldReturnTrueWhen$description', ({ input, expected }) => {
      const varName = aRandomString();
      process.env[varName] = input;

      const result = getEnvBoolean(varName);

      expect(result).toBe(expected);
    });

    it('testGetEnvBooleanShouldReturnFalseWhenOtherValues', () => {
      const varName = aRandomString();
      process.env[varName] = aRandomString();

      const result = getEnvBoolean(varName);

      expect(result).toBe(false);
    });

    it.each([
      { defaultValue: true, expected: true, description: 'WithTrueDefault' },
      { defaultValue: undefined, expected: false, description: 'WithoutDefault' }
    ])(
      'testGetEnvBooleanShouldReturnDefaultWhenVariableNotSet_$description',
      ({ defaultValue, expected }) => {
        const varName = aRandomString();

        const result = getEnvBoolean(varName, defaultValue);

        expect(result).toBe(expected);
      }
    );
  });
});
