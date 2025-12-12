import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { requestContext } from '@context/request-context.js';

export function requestContextMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  const store = {
    logger: request.log,
    reqId: request.id
  };

  requestContext.run(store, () => {
    done();
  });
}
