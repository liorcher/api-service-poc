import { IUserRepository } from '@modules/user/interfaces/user-repository.interface.js';

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});
