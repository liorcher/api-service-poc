import { FastifyBaseLogger } from 'fastify';
import pino from 'pino';

export const testLogger: FastifyBaseLogger = pino({ level: 'silent' });
