import { User, CreateUserDto, UpdateUserDto } from '../user.schema.js';

export interface IUserService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(userData: CreateUserDto): Promise<User>;
  updateUser(id: string, userData: UpdateUserDto): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}
