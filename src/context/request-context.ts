import { AsyncLocalStorage } from 'async_hooks';
import { FastifyBaseLogger } from 'fastify';

interface RequestContext {
  logger: FastifyBaseLogger;
  reqId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestLogger(): FastifyBaseLogger | undefined {
  return requestContext.getStore()?.logger;
}

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.reqId;
}
