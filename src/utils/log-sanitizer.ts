interface SanitizableObject {
  password?: string;
  headers?: Record<string, string>;
  raw?: unknown;
  log?: unknown;
  request?: unknown;
  child?: unknown;
  info?: unknown;
}

const SENSITIVE_FIELDS = ['password', 'apiKey', 'token', 'secret'];
const REDACTED = '[REDACTED]';
const FASTIFY_OBJECT_MARKER = '[FastifyRequest/Reply]';

export function sanitizeLogArgs(args: unknown[]): unknown[] {
  return args.filter(arg => !isLoggerObject(arg)).map(arg => sanitizeValue(arg));
}

function isLoggerObject(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.child === 'function' && typeof obj.info === 'function';
}

function isFastifyObject(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as SanitizableObject;
  return !!(obj.raw || obj.log || obj.request);
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;

  if (isFastifyObject(value)) return FASTIFY_OBJECT_MARKER;

  const obj = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = REDACTED;
    } else if (key === 'headers' && typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeHeaders(val as Record<string, unknown>);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(headers)) {
    sanitized[key] = SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))
      ? REDACTED
      : val;
  }
  return sanitized;
}
