import {
  SENSITIVE_FIELDS,
  REDACTED,
  FASTIFY_OBJECT_MARKER,
  CIRCULAR_REFERENCE_MARKER
} from '../constants/log-sanitizer.constants.js';

interface SanitizableObject {
  password?: string;
  headers?: Record<string, string>;
  raw?: unknown;
  log?: unknown;
  request?: unknown;
  child?: unknown;
  info?: unknown;
}

export function sanitizeLogArgs(args: unknown[]): unknown[] {
  const seen = new WeakSet();
  return args.filter(arg => !isLoggerObject(arg)).map(arg => sanitizeValue(arg, seen));
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

function isSensitiveKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
  return SENSITIVE_FIELDS.some(field => {
    const normalizedField = field.toLowerCase().replace(/[-_]/g, '');
    return normalizedKey.includes(normalizedField);
  });
}

function sanitizeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value !== 'object' || value === null) return value;

  if (seen.has(value)) return CIRCULAR_REFERENCE_MARKER;
  seen.add(value);

  if (isFastifyObject(value)) return FASTIFY_OBJECT_MARKER;

  const obj = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = REDACTED;
    } else if (key === 'headers' && typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeHeaders(val as Record<string, unknown>);
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizeValue(val, seen);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(headers)) {
    sanitized[key] = isSensitiveKey(key) ? REDACTED : val;
  }
  return sanitized;
}
