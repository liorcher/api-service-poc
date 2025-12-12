import { container } from '@di/container.js';
import { Logger } from 'pino';

export function Logger(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const className = target.constructor.name;

    Object.defineProperty(target, propertyKey, {
      get() {
        if (!this._logger) {
          const parentLogger = container.resolve<Logger>('logger');
          this._logger = parentLogger.child({ className });
        }
        return this._logger;
      },
      enumerable: true,
      configurable: true
    });
  };
}
