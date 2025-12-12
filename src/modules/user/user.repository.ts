import { Collection, Db, ObjectId } from 'mongodb';
import { FastifyBaseLogger } from 'fastify';
import { User, CreateUserDto, UpdateUserDto } from './user.schema.js';
import { IUserRepository } from './interfaces/user-repository.interface.js';
import { LogMethod } from '@decorators/log-method.decorator.js';
import { container } from '@di/container.js';

export class UserRepository implements IUserRepository {
  private collection: Collection<User>;
  private readonly logger: FastifyBaseLogger;

  constructor(db: Db, logger?: FastifyBaseLogger) {
    this.collection = db.collection<User>('users');
    const parentLogger = logger || container.resolve<FastifyBaseLogger>('logger');
    this.logger = parentLogger.child({ className: 'UserRepository' });
  }

  @LogMethod()
  async findAll(): Promise<User[]> {
    return this.collection.find({}).toArray();
  }

  @LogMethod()
  async findById(id: ObjectId): Promise<User | null> {
    return this.collection.findOne({ _id: id });
  }

  @LogMethod()
  async create(userData: CreateUserDto): Promise<User> {
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(user as User);
    return { _id: result.insertedId, ...user };
  }

  @LogMethod()
  async update(id: ObjectId, userData: UpdateUserDto): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...userData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  @LogMethod()
  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
