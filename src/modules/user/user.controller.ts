import { FastifyReply, FastifyRequest } from 'fastify';
import { IUserService } from './interfaces/user-service.interface.js';
import { CreateUserDto, UpdateUserDto } from './user.schema.js';

interface UserIdParams {
  id: string;
}

export class UserController {
  constructor(private readonly userService: IUserService) {}

  async getAllUsers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      reply.send({ success: true, data: users });
    } catch (_error) {
      reply.status(500).send({ success: false, error: 'Failed to fetch users' });
    }
  }

  async getUserById(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        reply.status(404).send({ success: false, error: 'User not found' });
        return;
      }

      reply.send({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send({ success: false, error: error.message });
        return;
      }
      reply.status(500).send({ success: false, error: 'Failed to fetch user' });
    }
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const user = await this.userService.createUser(request.body);
      reply.status(201).send({ success: true, data: user });
    } catch (_error) {
      reply.status(500).send({ success: false, error: 'Failed to create user' });
    }
  }

  async updateUser(
    request: FastifyRequest<{ Params: UserIdParams; Body: UpdateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const user = await this.userService.updateUser(id, request.body);

      if (!user) {
        reply.status(404).send({ success: false, error: 'User not found' });
        return;
      }

      reply.send({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send({ success: false, error: error.message });
        return;
      }
      reply.status(500).send({ success: false, error: 'Failed to update user' });
    }
  }

  async deleteUser(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        reply.status(404).send({ success: false, error: 'User not found' });
        return;
      }

      reply.send({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send({ success: false, error: error.message });
        return;
      }
      reply.status(500).send({ success: false, error: 'Failed to delete user' });
    }
  }
}
