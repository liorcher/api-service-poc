import { createContainer, AwilixContainer, InjectionMode } from 'awilix';
import { Db } from 'mongodb';
import { FastifyBaseLogger } from 'fastify';
import { UserRepository } from '@modules/user/user.repository.js';
import { UserService } from '@modules/user/user.service.js';
import { UserController } from '@modules/user/user.controller.js';

export interface Container {
  db: Db;
  logger: FastifyBaseLogger;
  userRepository: UserRepository;
  userService: UserService;
  userController: UserController;
}

export const container: AwilixContainer<Container> = createContainer<Container>({
  injectionMode: InjectionMode.CLASSIC
});
