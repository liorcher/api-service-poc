import { ObjectId } from 'mongodb';
import { User, CreateUserDto, UpdateUserDto } from '../user.schema.js';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: ObjectId): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: ObjectId, userData: UpdateUserDto): Promise<User | null>;
  delete(id: ObjectId): Promise<boolean>;
}
