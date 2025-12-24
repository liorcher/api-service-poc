import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyBaseLogger } from 'fastify';
import { IUserService } from './interfaces/user-service.interface.js';
import { CreateUserDto, UpdateUserDto } from './user.schema.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { Logger } from '@decorators/logger.decorator.js';
import {
  createSuccessDataResponse,
  createSuccessMessageResponse,
  createErrorResponse,
  createNotFoundResponse
} from '@/types/api-response.schema.js';

interface UserIdParams {
  id: string;
}

export class UserController {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userService: IUserService) {}

  @LogMethod()
  async getAllUsers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      reply.send(createSuccessDataResponse(users));
    } catch (_error) {
      reply.status(500).send(createErrorResponse('Failed to fetch users'));
    }
  }

  @LogMethod()
  async getUserById(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        reply.status(404).send(createNotFoundResponse('User not found'));
        return;
      }

      reply.send(createSuccessDataResponse(user));
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send(createErrorResponse(error.message));
        return;
      }
      reply.status(500).send(createErrorResponse('Failed to fetch user'));
    }
  }

  @LogMethod()
  async createUser(
    request: FastifyRequest<{ Body: CreateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const user = await this.userService.createUser(request.body);
      reply.status(201).send(createSuccessDataResponse(user));
    } catch (_error) {
      reply.status(500).send(createErrorResponse('Failed to create user'));
    }
  }

  @LogMethod()
  async updateUser(
    request: FastifyRequest<{ Params: UserIdParams; Body: UpdateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const user = await this.userService.updateUser(id, request.body);

      if (!user) {
        reply.status(404).send(createNotFoundResponse('User not found'));
        return;
      }

      reply.send(createSuccessDataResponse(user));
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send(createErrorResponse(error.message));
        return;
      }
      reply.status(500).send(createErrorResponse('Failed to update user'));
    }
  }

  @LogMethod()
  async deleteUser(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        reply.status(404).send(createNotFoundResponse('User not found'));
        return;
      }

      reply.send(createSuccessMessageResponse('User deleted successfully'));
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        reply.status(400).send(createErrorResponse(error.message));
        return;
      }
      reply.status(500).send(createErrorResponse('Failed to delete user'));
    }
  }
}
