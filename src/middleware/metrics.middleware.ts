import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { httpRequestDuration, httpRequestsTotal } from '../metrics/collectors.js';

export const metricsMiddleware = (
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  request.startTime = process.hrtime.bigint();
  done();
};

export const metricsResponseMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  if (request.startTime) {
    const duration = Number(process.hrtime.bigint() - request.startTime) / 1e9;

    const route = normalizeRoute(request.routeOptions?.url || request.url);
    const method = request.method;
    const statusCode = reply.statusCode.toString();

    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }
  done();
};

function normalizeRoute(route: string): string {
  return route.replace(/\/[0-9a-f]{24}/g, '/:id');
}
