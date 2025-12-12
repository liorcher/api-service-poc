import { UserService } from '@modules/user/user.service.js';
import { IUserRepository } from '@modules/user/interfaces/user-repository.interface.js';
import { createMockUserRepository } from '../../../mocks/user-repository.mock.js';
import {
  aRandomUser,
  aRandomUserData,
  aRandomObjectId,
  aRandomString
} from '../../../utils/test-utils.js';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe('getAllUsers', () => {
    it('testGetAllUsersShouldReturnAllUsersWhenCalled', async () => {
      const mockUsers = [aRandomUser(), aRandomUser()];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('testGetUserByIdShouldReturnUserWhenValidIdProvided', async () => {
      const userId = aRandomObjectId();
      const mockUser = aRandomUser();
      mockUser._id = userId;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId.toString());

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('testGetUserByIdShouldThrowErrorWhenInvalidIdFormat', async () => {
      const invalidId = aRandomString();

      await expect(userService.getUserById(invalidId)).rejects.toThrow('Invalid user ID format');
    });
  });

  describe('createUser', () => {
    it('testCreateUserShouldReturnCreatedUserWhenValidDataProvided', async () => {
      const userData = aRandomUserData();
      const mockCreatedUser = aRandomUser();
      mockCreatedUser.name = userData.name;
      mockCreatedUser.email = userData.email;
      mockCreatedUser.age = userData.age;
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('updateUser', () => {
    it('testUpdateUserShouldReturnUpdatedUserWhenValidIdProvided', async () => {
      const userId = aRandomObjectId();
      const updatedName = aRandomString();
      const updateData = { name: updatedName };
      const mockUpdatedUser = aRandomUser();
      mockUpdatedUser._id = userId;
      mockUpdatedUser.name = updatedName;
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId.toString(), updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('testUpdateUserShouldThrowErrorWhenInvalidIdFormat', async () => {
      const invalidId = aRandomString();
      const updateData = { name: aRandomString() };

      await expect(userService.updateUser(invalidId, updateData)).rejects.toThrow(
        'Invalid user ID format'
      );
    });
  });

  describe('deleteUser', () => {
    it('testDeleteUserShouldReturnTrueWhenUserDeleted', async () => {
      const userId = aRandomObjectId();
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(userId.toString());

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('testDeleteUserShouldThrowErrorWhenInvalidIdFormat', async () => {
      const invalidId = aRandomString();

      await expect(userService.deleteUser(invalidId)).rejects.toThrow('Invalid user ID format');
    });
  });
});
