import { env } from './env.js';

export const serverConfig = {
  port: env.PORT,
  host: env.HOST,
  environment: env.NODE_ENV
} as const;

export const isDevelopment = env.NODE_ENV !== 'production';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
