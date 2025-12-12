import { createContainer, AwilixContainer, InjectionMode } from 'awilix';
import { Db } from 'mongodb';
import { UserRepository } from '@modules/user/user.repository.js';
import { UserService } from '@modules/user/user.service.js';
import { UserController } from '@modules/user/user.controller.js';

export interface Container {
  db: Db;
  userRepository: UserRepository;
  userService: UserService;
  userController: UserController;
}

export const container: AwilixContainer<Container> = createContainer<Container>({
  injectionMode: InjectionMode.CLASSIC
});
