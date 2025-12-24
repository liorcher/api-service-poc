import { FastifyInstance } from 'fastify';
import { getUserController } from '@di/setup.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userResponseSchema
} from './user.schema.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const getController = () => getUserController();

  fastify.get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of all users in the system',
        security: [{ apiKey: [] }]
      }
    },
    async (req, reply) => getController().getAllUsers(req, reply)
  );

  fastify.get<{ Params: { id: string } }>(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a single user by their MongoDB ObjectId',
        params: userIdParamSchema,
        security: [{ apiKey: [] }]
      }
    },
    async (req, reply) => getController().getUserById(req, reply)
  );

  fastify.post<{ Body: { name: string; email: string; age?: number } }>(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create new user',
        description: 'Create a new user with name, email, and optional age',
        body: createUserSchema,
        security: [{ apiKey: [] }]
      }
    },
    async (req, reply) => getController().createUser(req, reply)
  );

  fastify.put<{
    Params: { id: string };
    Body: { name?: string; email?: string; age?: number };
  }>(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update an existing user by their MongoDB ObjectId. All fields are optional.',
        params: userIdParamSchema,
        body: updateUserSchema,
        security: [{ apiKey: [] }]
      }
    },
    async (req, reply) => getController().updateUser(req, reply)
  );

  fastify.delete<{ Params: { id: string } }>(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete an existing user by their MongoDB ObjectId',
        params: userIdParamSchema,
        security: [{ apiKey: [] }]
      }
    },
    async (req, reply) => getController().deleteUser(req, reply)
  );
}
