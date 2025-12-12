import { sanitizeLogArgs } from '@utils/log-sanitizer.js';
import { testLogger } from '../../mocks/logger.mock.js';

describe('sanitizeLogArgs', () => {
  describe('Basic Value Handling', () => {
    it('should pass through primitive values unchanged', () => {
      const args = ['string', 123, true, null, undefined];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['string', 123, true, null, undefined]);
    });

    it('should pass through empty array unchanged', () => {
      const result = sanitizeLogArgs([]);
      expect(result).toEqual([]);
    });

    it('should pass through simple objects unchanged', () => {
      const args = [{ name: 'John', age: 30 }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', age: 30 }]);
    });
  });

  describe('Logger Object Filtering', () => {
    it('should filter out logger objects', () => {
      const args = ['test', testLogger, { data: 'value' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['test', { data: 'value' }]);
    });

    it('should keep objects that only have child method', () => {
      const notLogger = {
        child: () => ({}),
        someOtherMethod: () => {}
      };

      const args = [notLogger];
      const result = sanitizeLogArgs(args);
      expect(result).toHaveLength(1);
    });

    it('should keep objects that only have info method', () => {
      const notLogger = {
        info: () => {},
        someOtherMethod: () => {}
      };

      const args = [notLogger];
      const result = sanitizeLogArgs(args);
      expect(result).toHaveLength(1);
    });
  });

  describe('Fastify Object Detection', () => {
    it('should detect and replace Fastify Request object', () => {
      const fastifyRequest = {
        raw: {},
        params: { id: '123' },
        query: {},
        body: {}
      };

      const args = [fastifyRequest];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['[FastifyRequest/Reply]']);
    });

    it('should detect and replace Fastify Reply object', () => {
      const fastifyReply = {
        log: {},
        request: {},
        send: () => {}
      };

      const args = [fastifyReply];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['[FastifyRequest/Reply]']);
    });

    it('should detect objects with request property', () => {
      const obj = {
        request: {},
        data: 'value'
      };

      const args = [obj];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['[FastifyRequest/Reply]']);
    });
  });

  describe('Sensitive Field Redaction', () => {
    it('should redact password field', () => {
      const args = [{ username: 'john', password: 'secret123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ username: 'john', password: '[REDACTED]' }]);
    });

    it('should redact apiKey field', () => {
      const args = [{ service: 'stripe', apiKey: 'sk_test_123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ service: 'stripe', apiKey: '[REDACTED]' }]);
    });

    it('should redact token field', () => {
      const args = [{ user: 'john', token: 'jwt_token_123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ user: 'john', token: '[REDACTED]' }]);
    });

    it('should redact secret field', () => {
      const args = [{ app: 'myapp', secret: 'my_secret_key' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ app: 'myapp', secret: '[REDACTED]' }]);
    });

    it('should redact fields with case-insensitive matching', () => {
      const args = [
        {
          PASSWORD: 'secret',
          ApiKey: 'key123',
          Token: 'token123',
          SECRET: 'secret123'
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          PASSWORD: '[REDACTED]',
          ApiKey: '[REDACTED]',
          Token: '[REDACTED]',
          SECRET: '[REDACTED]'
        }
      ]);
    });

    it('should redact fields containing sensitive keywords', () => {
      const args = [
        {
          userPassword: 'secret',
          accessToken: 'token123',
          apiKeyValue: 'key123'
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          userPassword: '[REDACTED]',
          accessToken: '[REDACTED]',
          apiKeyValue: '[REDACTED]'
        }
      ]);
    });
  });

  describe('Header Sanitization', () => {
    it('should sanitize sensitive headers', () => {
      const args = [
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': 'secret_key_123',
            authorization: 'Bearer token123'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': '[REDACTED]',
            authorization: '[REDACTED]'
          }
        }
      ]);
    });

    it('should keep non-sensitive headers unchanged', () => {
      const args = [
        {
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'Mozilla/5.0'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': 'Mozilla/5.0'
          }
        }
      ]);
    });

    it('should handle empty headers object', () => {
      const args = [{ method: 'GET', headers: {} }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ method: 'GET', headers: {} }]);
    });

    it('should sanitize headers with case-insensitive matching', () => {
      const args = [
        {
          headers: {
            'X-API-KEY': 'key123',
            Authorization: 'token123',
            PASSWORD: 'secret'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          headers: {
            'X-API-KEY': '[REDACTED]',
            Authorization: '[REDACTED]',
            PASSWORD: '[REDACTED]'
          }
        }
      ]);
    });
  });

  describe('Complex Object Handling', () => {
    it('should handle nested objects with sensitive data', () => {
      const args = [
        {
          user: {
            name: 'John',
            credentials: {
              password: 'secret123',
              apiKey: 'key123'
            }
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          user: {
            name: 'John',
            credentials: {
              password: '[REDACTED]',
              apiKey: '[REDACTED]'
            }
          }
        }
      ]);
    });

    it('should handle multiple arguments with mixed types', () => {
      const fastifyRequest = {
        raw: {},
        params: { id: '123' }
      };

      const userData = {
        name: 'John',
        password: 'secret123'
      };

      const args = ['test', 123, testLogger, fastifyRequest, userData];
      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        'test',
        123,
        '[FastifyRequest/Reply]',
        { name: 'John', password: '[REDACTED]' }
      ]);
    });

    it('should handle arrays within objects', () => {
      const args = [
        {
          users: [
            { name: 'John', password: 'secret1' },
            { name: 'Jane', password: 'secret2' }
          ]
        }
      ];
      const result = sanitizeLogArgs(args);
      // Arrays are kept as-is, only top-level object properties are sanitized
      expect(result).toEqual([
        {
          users: [
            { name: 'John', password: 'secret1' },
            { name: 'Jane', password: 'secret2' }
          ]
        }
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const args = [null];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([null]);
    });

    it('should handle undefined values', () => {
      const args = [undefined];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([undefined]);
    });

    it('should redact sensitive fields even when null', () => {
      const args = [{ name: 'John', password: null }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', password: '[REDACTED]' }]);
    });

    it('should redact sensitive fields even when undefined', () => {
      const args = [{ name: 'John', password: undefined }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', password: '[REDACTED]' }]);
    });

    it('should handle empty objects', () => {
      const args = [{}];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{}]);
    });

    it('should handle objects with symbol keys', () => {
      const sym = Symbol('test');
      const args = [{ [sym]: 'value', name: 'John' }];
      const result = sanitizeLogArgs(args);
      // Symbol keys are ignored by Object.entries
      expect(result).toEqual([{ name: 'John' }]);
    });

    it('should handle circular references gracefully', () => {
      const obj: Record<string, unknown> = { name: 'John' };
      obj.self = obj; // Create circular reference

      const result = sanitizeLogArgs([obj]);
      expect(result).toEqual([{ name: 'John', self: '[Circular]' }]);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should sanitize login request', () => {
      const args = [
        {
          body: {
            email: 'john@example.com',
            password: 'mySecretPassword123'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          body: {
            email: 'john@example.com',
            password: '[REDACTED]'
          }
        }
      ]);
    });

    it('should sanitize API request with headers', () => {
      const args = [
        {
          url: '/api/users',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': 'sk_live_123456789'
          },
          body: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          url: '/api/users',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': '[REDACTED]'
          },
          body: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ]);
    });

    it('should sanitize payment request', () => {
      const args = [
        {
          amount: 1000,
          currency: 'USD',
          paymentMethod: {
            type: 'card',
            token: 'tok_123456789',
            apiKey: 'sk_test_key'
          }
        }
      ];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([
        {
          amount: 1000,
          currency: 'USD',
          paymentMethod: {
            type: 'card',
            token: '[REDACTED]',
            apiKey: '[REDACTED]'
          }
        }
      ]);
    });
  });
});
