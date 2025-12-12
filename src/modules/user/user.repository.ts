import { Collection, Db, ObjectId } from 'mongodb';
import { User, CreateUserDto, UpdateUserDto } from './user.schema.js';
import { IUserRepository } from './interfaces/user-repository.interface.js';

export class UserRepository implements IUserRepository {
  private collection: Collection<User>;

  constructor(db: Db) {
    this.collection = db.collection<User>('users');
  }

  async findAll(): Promise<User[]> {
    return this.collection.find({}).toArray();
  }

  async findById(id: ObjectId): Promise<User | null> {
    return this.collection.findOne({ _id: id });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(user as User);
    return { _id: result.insertedId, ...user };
  }

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

  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
