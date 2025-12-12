import { asClass, asValue } from 'awilix';
import { Db } from 'mongodb';
import { FastifyBaseLogger } from 'fastify';
import { container } from './container.js';
import { UserRepository } from '@modules/user/user.repository.js';
import { UserService } from '@modules/user/user.service.js';
import { UserController } from '@modules/user/user.controller.js';

export function setupContainer(db: Db, logger: FastifyBaseLogger): void {
  container.register({
    db: asValue(db),
    logger: asValue(logger),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    userController: asClass(UserController).singleton()
  });
}

export function getUserController(): UserController {
  return container.resolve('userController');
}
