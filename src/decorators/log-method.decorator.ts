import { getRequestLogger } from '@context/request-context.js';
import { sanitizeLogArgs } from '@utils/log-sanitizer.js';
import { methodDuration, methodInvocations } from '../metrics/collectors.js';

export function LogMethod() {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;
    if (typeof originalMethod !== 'function') return;

    const className = target.constructor.name;

    descriptor.value = async function (...args: unknown[]) {
      const logger = getRequestLogger();
      const start = Date.now();
      let status = 'success';

      try {
        if (logger) {
          const methodLogger = logger.child({ method: propertyKey });
          methodLogger.info({ args: sanitizeLogArgs(args) }, `→ ${className}.${propertyKey}`);
        } else {
          console.warn(`No request logger for ${className}.${propertyKey}`);
        }

        const result = await originalMethod.apply(this, args);
        const duration = (Date.now() - start) / 1000;

        if (logger) {
          logger.child({ method: propertyKey }).info({ duration }, `← ${className}.${propertyKey}`);
        }

        methodDuration.observe({ class_name: className, method_name: propertyKey, status }, duration);
        methodInvocations.inc({ class_name: className, method_name: propertyKey, status });

        return result;
      } catch (error) {
        status = 'error';
        const duration = (Date.now() - start) / 1000;

        if (logger) {
          logger.child({ method: propertyKey }).error({ error, duration }, `✗ ${className}.${propertyKey}`);
        }

        methodDuration.observe({ class_name: className, method_name: propertyKey, status }, duration);
        methodInvocations.inc({ class_name: className, method_name: propertyKey, status });

        throw error;
      }
    };
  };
}
