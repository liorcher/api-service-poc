import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { httpRequestDuration, httpRequestsTotal } from '../metrics/collectors.js';

export const metricsMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void => {
  const start = process.hrtime.bigint();

  reply.addHook('onSend', (_request, _reply, _payload, sendDone) => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;

    const route = normalizeRoute(request.routeOptions?.url || request.url);
    const method = request.method;
    const statusCode = reply.statusCode.toString();

    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestsTotal.inc({ method, route, status_code: statusCode });

    sendDone();
  });

  done();
};

function normalizeRoute(route: string): string {
  return route.replace(/\/[0-9a-f]{24}/g, '/:id');
}
