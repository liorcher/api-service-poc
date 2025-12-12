import { UserService } from '@modules/user/user.service.js';
import { UserRepository } from '@modules/user/user.repository.js';
import { ObjectId } from 'mongodb';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    userService = new UserService(mockUserRepository);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          _id: new ObjectId(),
          name: 'User 1',
          email: 'user1@test.com',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          name: 'User 2',
          email: 'user2@test.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = new ObjectId();
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId.toString());

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid id format', async () => {
      await expect(userService.getUserById('invalid-id')).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { name: 'New User', email: 'new@test.com', age: 25 };
      const mockCreatedUser = {
        _id: new ObjectId(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = new ObjectId();
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        _id: userId,
        name: 'Updated Name',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId.toString(), updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw error for invalid id format', async () => {
      await expect(userService.updateUser('invalid-id', { name: 'Test' })).rejects.toThrow(
        'Invalid user ID format'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = new ObjectId();
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(userId.toString());

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid id format', async () => {
      await expect(userService.deleteUser('invalid-id')).rejects.toThrow('Invalid user ID format');
    });
  });
});
