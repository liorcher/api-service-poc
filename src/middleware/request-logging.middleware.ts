import {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
  onResponseHookHandler
} from 'fastify';

export const requestLoggingMiddleware: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.info(
    {
      reqId: request.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent']
    },
    'Incoming request'
  );

  const start = Date.now();

  (reply.raw as any).__requestStart = start;
};

export const requestCompletedHook: onResponseHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const start = (reply.raw as any).__requestStart || Date.now();
  const duration = Date.now() - start;

  request.log.info(
    {
      reqId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration
    },
    'Request completed'
  );
};
