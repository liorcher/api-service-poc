import { env } from './env.js';
import type { MongoClientOptions } from 'mongodb';
import { ConfigurationError } from '../errors/configuration.error.js';

function buildMongoOptions(): MongoClientOptions {
  const baseOptions: MongoClientOptions = {
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE
  };

  if (env.NODE_ENV === 'production') {
    if (!env.DB_CERT_KEY_PATH) {
      throw new ConfigurationError('Certificate auth mode requires DB_CERT_KEY_PATH to be set', {
        nodeEnv: env.NODE_ENV
      });
    }

    try {
      const tlsOptions: MongoClientOptions = {
        tls: true,
        tlsCertificateKeyFile: env.DB_CERT_KEY_PATH
      };

      if (env.DB_CA_PATH) {
        tlsOptions.tlsCAFile = env.DB_CA_PATH;
      }

      return { ...baseOptions, ...tlsOptions };
    } catch (error) {
      throw new ConfigurationError(`Failed to configure certificate authentication: ${error}`, {
        originalError: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    if (env.DB_USERNAME && env.DB_PASSWORD) {
      return {
        ...baseOptions,
        auth: {
          username: env.DB_USERNAME,
          password: env.DB_PASSWORD
        }
      };
    }

    return baseOptions;
  }
}

function buildMongoUri(): string {
  let uri = env.MONGODB_URI;

  if (env.NODE_ENV !== 'production' && env.DB_USERNAME && env.DB_PASSWORD) {
    if (!uri.includes('@')) {
      const protocol = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
      const rest = uri.replace(protocol, '');
      uri = `${protocol}${encodeURIComponent(env.DB_USERNAME)}:${encodeURIComponent(
        env.DB_PASSWORD
      )}@${rest}`;
    }
  }

  return uri;
}

export const databaseConfig = {
  url: buildMongoUri(),
  forceClose: true,
  options: buildMongoOptions()
};

export type DatabaseConfig = typeof databaseConfig;
