/**
 * Log sanitizer constants
 */

export const SENSITIVE_FIELDS = [
  'password',
  'apikey',
  'api-key',
  'token',
  'secret',
  'authorization'
];
export const REDACTED = '[REDACTED]';
export const FASTIFY_OBJECT_MARKER = '[FastifyRequest/Reply]';
export const CIRCULAR_REFERENCE_MARKER = '[Circular]';
