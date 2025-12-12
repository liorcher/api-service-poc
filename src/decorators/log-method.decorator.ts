import { Logger } from 'pino';

export function LogMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = (this as any).logger as Logger;
      const className = target.constructor.name;

      if (!logger) {
        return originalMethod.apply(this, args);
      }

      const methodLogger = logger.child({ method: propertyKey });

      methodLogger.info({ args: sanitizeArgs(args) }, `Entering ${className}.${propertyKey}`);
      const start = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        methodLogger.info({ duration }, `Exited ${className}.${propertyKey}`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        methodLogger.error({ error, duration }, `Error in ${className}.${propertyKey}`);
        throw error;
      }
    };

    return descriptor;
  };
}

function sanitizeArgs(args: any[]): any {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      if (arg.raw || arg.log || arg.request) {
        return '[FastifyRequest/Reply]';
      }
      if (arg.password) {
        return { ...arg, password: '[REDACTED]' };
      }
      if (arg.headers && arg.headers['x-api-key']) {
        return { ...arg, headers: { ...arg.headers, 'x-api-key': '[REDACTED]' } };
      }
    }
    return arg;
  });
}
