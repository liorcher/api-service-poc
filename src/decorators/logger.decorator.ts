import type { FastifyBaseLogger } from 'fastify';
import { container } from '../di/container.js';


export function Logger(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol): void {
    const className = target.constructor.name;
    Object.defineProperty(target, propertyKey, {
      get: function (this: any) {
        const loggerSymbol = Symbol.for(`__logger_${String(propertyKey)}`);

        if (!this[loggerSymbol]) {
          const constructorLogger = this.__constructorLogger;
          const parentLogger = constructorLogger || container.resolve<FastifyBaseLogger>('logger');
          this[loggerSymbol] = parentLogger.child({ className });
        }

        return this[loggerSymbol];
      },
      enumerable: true,
      configurable: true
    });
  };
}
