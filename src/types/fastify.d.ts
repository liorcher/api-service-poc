import 'fastify';
import { Db, MongoClient } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: {
      db?: Db;
      client?: MongoClient;
    };
  }
}
