import dotenv from 'dotenv';
import { ConfigurationError } from '../errors/configuration.error.js';

dotenv.config();

export function getEnvString(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ConfigurationError(`Environment variable ${key} is required but not set`, { key });
  }

  return value;
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ConfigurationError(`Environment variable ${key} is required but not set`, { key });
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    throw new ConfigurationError(
      `Environment variable ${key} must be a valid number, got: ${value}`,
      {
        key,
        value
      }
    );
  }

  return numValue;
}

export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true' || value === '1';
}

function getApiKeys(): string[] {
  return getEnvString('API_KEYS', '')
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

export const env = {
  NODE_ENV: getEnvString('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  HOST: getEnvString('HOST', 'localhost'),
  LOG_LEVEL: getEnvString('LOG_LEVEL', 'info'),
  MONGODB_URI: getEnvString('MONGODB_URI', 'mongodb://localhost:27017/test-db'),
  MONGODB_MAX_POOL_SIZE: getEnvNumber('MONGODB_MAX_POOL_SIZE', 10),
  MONGODB_MIN_POOL_SIZE: getEnvNumber('MONGODB_MIN_POOL_SIZE', 2),
  DB_USERNAME: getEnvString('DB_USERNAME', ''),
  DB_PASSWORD: getEnvString('DB_PASSWORD', ''),
  DB_CERT_KEY_PATH: getEnvString('DB_CERT_KEY_PATH', ''),
  DB_CA_PATH: getEnvString('DB_CA_PATH', ''),
  get API_KEYS() {
    return getApiKeys();
  }
} as const;
