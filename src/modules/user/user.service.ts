import { ObjectId } from 'mongodb';
import { FastifyBaseLogger } from 'fastify';
import { IUserRepository } from './interfaces/user-repository.interface.js';
import { IUserService } from './interfaces/user-service.interface.js';
import { User, CreateUserDto, UpdateUserDto } from './user.schema.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { Logger } from '@decorators/logger.decorator.js';
import { InvalidIdError } from '../../errors/invalid-id.error.js';

export class UserService implements IUserService {
  @Logger()
  private readonly logger!: FastifyBaseLogger;

  constructor(private readonly userRepository: IUserRepository) {}

  @LogMethod()
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  @LogMethod()
  async getUserById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'getUserById' });
    }
    return this.userRepository.findById(new ObjectId(id));
  }

  @LogMethod()
  async createUser(userData: CreateUserDto): Promise<User> {
    return this.userRepository.create(userData);
  }

  @LogMethod()
  async updateUser(id: string, userData: UpdateUserDto): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'updateUser' });
    }
    return this.userRepository.update(new ObjectId(id), userData);
  }

  @LogMethod()
  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidIdError(id, { method: 'deleteUser' });
    }
    return this.userRepository.delete(new ObjectId(id));
  }
}
