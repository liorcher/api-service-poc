import { getRequestLogger } from '@context/request-context.js';
import { sanitizeLogArgs } from '@utils/log-sanitizer.js';

export function LogMethod() {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;
    if (typeof originalMethod !== 'function') return;

    const className = target.constructor.name;

    descriptor.value = async function (...args: unknown[]) {
      const logger = getRequestLogger();
      if (!logger) {
        console.warn(`No request logger for ${className}.${propertyKey}`);
        return originalMethod.apply(this, args);
      }

      const methodLogger = logger.child({ method: propertyKey });
      const start = Date.now();

      methodLogger.info({ args: sanitizeLogArgs(args) }, `→ ${className}.${propertyKey}`);

      try {
        const result = await originalMethod.apply(this, args);
        methodLogger.info({ duration: Date.now() - start }, `← ${className}.${propertyKey}`);
        return result;
      } catch (error) {
        methodLogger.error(
          { error, duration: Date.now() - start },
          `✗ ${className}.${propertyKey}`
        );
        throw error;
      }
    };
  };
}
