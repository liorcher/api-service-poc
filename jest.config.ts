import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts', '!src/types/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)\\.(js|ts)$': '<rootDir>/src/$1',
    '^@config/(.*)\\.(js|ts)$': '<rootDir>/src/config/$1',
    '^@modules/(.*)\\.(js|ts)$': '<rootDir>/src/modules/$1',
    '^@common/(.*)\\.(js|ts)$': '<rootDir>/src/types/$1',
    '^@di/(.*)\\.(js|ts)$': '<rootDir>/src/di/$1',
    '^@plugins/(.*)\\.(js|ts)$': '<rootDir>/src/plugins/$1',
    '^@routes/(.*)\\.(js|ts)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)\\.(js|ts)$': '<rootDir>/src/utils/$1',
    '^@decorators/(.*)\\.(js|ts)$': '<rootDir>/src/decorators/$1',
    '^@context/(.*)\\.(js|ts)$': '<rootDir>/src/context/$1',
    '^@metrics/(.*)\\.(js|ts)$': '<rootDir>/src/metrics/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

export default config;
