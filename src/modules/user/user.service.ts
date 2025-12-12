import { ObjectId } from 'mongodb';
import { IUserRepository } from './interfaces/user-repository.interface.js';
import { IUserService } from './interfaces/user-service.interface.js';
import { User, CreateUserDto, UpdateUserDto } from './user.schema.js';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    return this.userRepository.findById(new ObjectId(id));
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.userRepository.create(userData);
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    return this.userRepository.update(new ObjectId(id), userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    return this.userRepository.delete(new ObjectId(id));
  }
}
