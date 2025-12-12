import type { FastifyBaseLogger } from 'fastify';
import { container } from '../di/container.js';

const loggerCache = new WeakMap<object, FastifyBaseLogger>();

export function Logger(): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    const className = target.constructor.name;

    Object.defineProperty(target, propertyKey, {
      get(this: object): FastifyBaseLogger {
        if (!loggerCache.has(this)) {
          const parentLogger = container.resolve<FastifyBaseLogger>('logger');
          loggerCache.set(this, parentLogger.child({ className }));
        }
        return loggerCache.get(this)!;
      },
      enumerable: true,
      configurable: true
    });
  };
}
