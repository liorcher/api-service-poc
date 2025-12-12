import { FastifyInstance } from 'fastify';
import { getUserController } from '@di/setup.js';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './user.schema.js';
import { validateBody, validateParams } from '../../middleware/validation.middleware.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const getController = () => getUserController();

  fastify.get('/users', async (req, reply) => getController().getAllUsers(req, reply));

  fastify.get<{ Params: { id: string } }>(
    '/users/:id',
    {
      preValidation: validateParams(userIdParamSchema)
    },
    async (req, reply) => getController().getUserById(req, reply)
  );

  fastify.post<{ Body: { name: string; email: string; age?: number } }>(
    '/users',
    {
      preValidation: validateBody(createUserSchema)
    },
    async (req, reply) => getController().createUser(req, reply)
  );

  fastify.put<{
    Params: { id: string };
    Body: { name?: string; email?: string; age?: number };
  }>(
    '/users/:id',
    {
      preValidation: [validateParams(userIdParamSchema), validateBody(updateUserSchema)]
    },
    async (req, reply) => getController().updateUser(req, reply)
  );

  fastify.delete<{ Params: { id: string } }>(
    '/users/:id',
    {
      preValidation: validateParams(userIdParamSchema)
    },
    async (req, reply) => getController().deleteUser(req, reply)
  );
}
