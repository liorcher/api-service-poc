import { sanitizeLogArgs } from '@utils/log-sanitizer.js';
import { testLogger } from '../../mocks/logger.mock.js';

describe('sanitizeLogArgs', () => {
  describe('Basic Value Handling', () => {
    it('testSanitizeLogArgsShouldReturnUnchangedWhenPassedPrimitiveValues', () => {
      const args = ['string', 123, true, null, undefined];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['string', 123, true, null, undefined]);
    });

    it('testSanitizeLogArgsShouldReturnEmptyArrayWhenPassedEmptyArray', () => {
      const result = sanitizeLogArgs([]);
      expect(result).toEqual([]);
    });

    it('testSanitizeLogArgsShouldReturnUnchangedWhenPassedSimpleObjects', () => {
      const args = [{ name: 'John', age: 30 }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', age: 30 }]);
    });
  });

  describe('Logger Object Filtering', () => {
    it('testSanitizeLogArgsShouldFilterOutLoggerObjectsWhenPresent', () => {
      const args = ['test', testLogger, { data: 'value' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['test', { data: 'value' }]);
    });

    it('testSanitizeLogArgsShouldKeepObjectWhenOnlyChildMethodPresent', () => {
      const notLogger = {
        child: () => ({}),
        someOtherMethod: () => {}
      };

      const args = [notLogger];
      const result = sanitizeLogArgs(args);
      expect(result).toHaveLength(1);
    });

    it('testSanitizeLogArgsShouldKeepObjectWhenOnlyInfoMethodPresent', () => {
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
    it('testSanitizeLogArgsShouldReplaceWithMarkerWhenFastifyRequestDetected', () => {
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

    it('testSanitizeLogArgsShouldReplaceWithMarkerWhenFastifyReplyDetected', () => {
      const fastifyReply = {
        log: {},
        request: {},
        send: () => {}
      };

      const args = [fastifyReply];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual(['[FastifyRequest/Reply]']);
    });

    it('testSanitizeLogArgsShouldReplaceWithMarkerWhenRequestPropertyPresent', () => {
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
    it('testSanitizeLogArgsShouldRedactPasswordFieldWhenPresent', () => {
      const args = [{ username: 'john', password: 'secret123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ username: 'john', password: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldRedactApiKeyFieldWhenPresent', () => {
      const args = [{ service: 'stripe', apiKey: 'sk_test_123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ service: 'stripe', apiKey: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldRedactTokenFieldWhenPresent', () => {
      const args = [{ user: 'john', token: 'jwt_token_123' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ user: 'john', token: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldRedactSecretFieldWhenPresent', () => {
      const args = [{ app: 'myapp', secret: 'my_secret_key' }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ app: 'myapp', secret: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldRedactFieldsWithCaseInsensitiveMatching', () => {
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

    it('testSanitizeLogArgsShouldRedactFieldsContainingSensitiveKeywords', () => {
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
    it('testSanitizeLogArgsShouldSanitizeSensitiveHeadersWhenPresent', () => {
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

    it('testSanitizeLogArgsShouldKeepNonSensitiveHeadersUnchanged', () => {
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

    it('testSanitizeLogArgsShouldHandleEmptyHeadersObject', () => {
      const args = [{ method: 'GET', headers: {} }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ method: 'GET', headers: {} }]);
    });

    it('testSanitizeLogArgsShouldSanitizeHeadersWithCaseInsensitiveMatching', () => {
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
    it('testSanitizeLogArgsShouldSanitizeNestedObjectsWithSensitiveData', () => {
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

    it('testSanitizeLogArgsShouldHandleMultipleArgumentsWithMixedTypes', () => {
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

    it('testSanitizeLogArgsShouldKeepArraysAsIsWithinObjects', () => {
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
    it('testSanitizeLogArgsShouldReturnNullWhenPassedNull', () => {
      const args = [null];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([null]);
    });

    it('testSanitizeLogArgsShouldReturnUndefinedWhenPassedUndefined', () => {
      const args = [undefined];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([undefined]);
    });

    it('testSanitizeLogArgsShouldRedactSensitiveFieldsEvenWhenNull', () => {
      const args = [{ name: 'John', password: null }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', password: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldRedactSensitiveFieldsEvenWhenUndefined', () => {
      const args = [{ name: 'John', password: undefined }];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{ name: 'John', password: '[REDACTED]' }]);
    });

    it('testSanitizeLogArgsShouldReturnEmptyObjectWhenPassedEmptyObject', () => {
      const args = [{}];
      const result = sanitizeLogArgs(args);
      expect(result).toEqual([{}]);
    });

    it('testSanitizeLogArgsShouldIgnoreSymbolKeysInObjects', () => {
      const sym = Symbol('test');
      const args = [{ [sym]: 'value', name: 'John' }];
      const result = sanitizeLogArgs(args);
      // Symbol keys are ignored by Object.entries
      expect(result).toEqual([{ name: 'John' }]);
    });

    it('testSanitizeLogArgsShouldReplaceCircularReferencesWithMarker', () => {
      const obj: Record<string, unknown> = { name: 'John' };
      obj.self = obj; // Create circular reference

      const result = sanitizeLogArgs([obj]);
      expect(result).toEqual([{ name: 'John', self: '[Circular]' }]);
    });
  });

  describe('Real-World Scenarios', () => {
    it('testSanitizeLogArgsShouldSanitizeLoginRequestData', () => {
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

    it('testSanitizeLogArgsShouldSanitizeApiRequestWithSensitiveHeaders', () => {
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

    it('testSanitizeLogArgsShouldSanitizePaymentRequestWithCredentials', () => {
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
