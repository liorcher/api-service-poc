import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyBaseLogger } from 'fastify';
import { IUserService } from './interfaces/user-service.interface.js';
import { CreateUserDto, UpdateUserDto } from './user.schema.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { Logger } from '@decorators/logger.decorator.js';
import {
  createSuccessDataResponse,
  createSuccessMessageResponse
} from '@/types/api-response.schema.js';
import { NotFoundError } from '../../errors/not-found.error.js';

interface UserIdParams {
  id: string;
}

export class UserController {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userService: IUserService) {}

  @LogMethod()
  async getAllUsers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.userService.getAllUsers();
    reply.send(createSuccessDataResponse(users));
  }

  @LogMethod()
  async getUserById(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const user = await this.userService.getUserById(id);

    if (!user) {
      throw new NotFoundError('User', id);
    }

    reply.send(createSuccessDataResponse(user));
  }

  @LogMethod()
  async createUser(
    request: FastifyRequest<{ Body: CreateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.userService.createUser(request.body);
    reply.status(201).send(createSuccessDataResponse(user));
  }

  @LogMethod()
  async updateUser(
    request: FastifyRequest<{ Params: UserIdParams; Body: UpdateUserDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const user = await this.userService.updateUser(id, request.body);

    if (!user) {
      throw new NotFoundError('User', id);
    }

    reply.send(createSuccessDataResponse(user));
  }

  @LogMethod()
  async deleteUser(
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const deleted = await this.userService.deleteUser(id);

    if (!deleted) {
      throw new NotFoundError('User', id);
    }

    reply.send(createSuccessMessageResponse('User deleted successfully'));
  }
}
