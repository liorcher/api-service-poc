import { Histogram, Counter } from 'prom-client';
import { metricsRegistry } from './registry.js';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [metricsRegistry]
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry]
});

export const methodDuration = new Histogram({
  name: 'method_duration_seconds',
  help: 'Duration of method execution',
  labelNames: ['class_name', 'method_name', 'status'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [metricsRegistry]
});

export const methodInvocations = new Counter({
  name: 'method_invocations_total',
  help: 'Total method invocations',
  labelNames: ['class_name', 'method_name', 'status'],
  registers: [metricsRegistry]
});

export const authFailures = new Counter({
  name: 'auth_failures_total',
  help: 'Total authentication failures',
  labelNames: ['reason'],
  registers: [metricsRegistry]
});

export const validationErrors = new Counter({
  name: 'validation_errors_total',
  help: 'Total validation errors',
  labelNames: ['endpoint', 'validation_type'],
  registers: [metricsRegistry]
});

export const customErrorsByType = new Counter({
  name: 'api_custom_errors_total',
  help: 'Total number of custom errors by type',
  labelNames: ['error_type', 'error_code', 'endpoint'],
  registers: [metricsRegistry]
});
