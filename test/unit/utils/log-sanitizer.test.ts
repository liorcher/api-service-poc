import { sanitizeLogArgs } from '@utils/log-sanitizer.js';
import { testLogger } from '../../mocks/logger.mock.js';
import {
  aRandomString,
  aRandomInt,
  aRandomBoolean,
  aRandomEmail,
  aRandomPassword,
  aRandomApiKey,
  aRandomToken
} from '../../utils/test-utils.js';
import { REDACTED_MARKER, FASTIFY_MARKER, CIRCULAR_MARKER } from '../../utils/test-constants.js';

describe('sanitizeLogArgs', () => {
  describe('Basic Value Handling', () => {
    it('testSanitizeLogArgsShouldReturnUnchangedWhenPassedPrimitiveValues', () => {
      const stringValue = aRandomString();
      const intValue = aRandomInt();
      const boolValue = aRandomBoolean();
      const args = [stringValue, intValue, boolValue, null, undefined];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([stringValue, intValue, boolValue, null, undefined]);
    });

    it('testSanitizeLogArgsShouldReturnEmptyArrayWhenPassedEmptyArray', () => {
      const args: unknown[] = [];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([]);
    });

    it('testSanitizeLogArgsShouldReturnUnchangedWhenPassedSimpleObjects', () => {
      const name = aRandomString();
      const age = aRandomInt(18, 80);
      const args = [{ name, age }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ name, age }]);
    });
  });

  describe('Logger Object Filtering', () => {
    it('testSanitizeLogArgsShouldFilterOutLoggerObjectsWhenPresent', () => {
      const stringValue = aRandomString();
      const data = { value: aRandomString() };
      const args = [stringValue, testLogger, data];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([stringValue, data]);
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
        params: { id: aRandomString() },
        query: {},
        body: {}
      };
      const args = [fastifyRequest];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([FASTIFY_MARKER]);
    });

    it('testSanitizeLogArgsShouldReplaceWithMarkerWhenFastifyReplyDetected', () => {
      const fastifyReply = {
        log: {},
        request: {},
        send: () => {}
      };
      const args = [fastifyReply];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([FASTIFY_MARKER]);
    });

    it('testSanitizeLogArgsShouldReplaceWithMarkerWhenRequestPropertyPresent', () => {
      const obj = {
        request: {},
        data: aRandomString()
      };
      const args = [obj];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([FASTIFY_MARKER]);
    });
  });

  describe('Sensitive Field Redaction', () => {
    it('testSanitizeLogArgsShouldRedactPasswordFieldWhenPresent', () => {
      const username = aRandomString();
      const password = aRandomPassword();
      const args = [{ username, password }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ username, password: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldRedactApiKeyFieldWhenPresent', () => {
      const service = aRandomString();
      const apiKey = aRandomApiKey();
      const args = [{ service, apiKey }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ service, apiKey: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldRedactTokenFieldWhenPresent', () => {
      const user = aRandomString();
      const token = aRandomToken();
      const args = [{ user, token }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ user, token: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldRedactSecretFieldWhenPresent', () => {
      const app = aRandomString();
      const secret = aRandomString(32);
      const args = [{ app, secret }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ app, secret: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldRedactFieldsWithCaseInsensitiveMatching', () => {
      const password = aRandomPassword();
      const apiKey = aRandomApiKey();
      const token = aRandomToken();
      const secret = aRandomString(32);
      const args = [
        {
          PASSWORD: password,
          ApiKey: apiKey,
          Token: token,
          SECRET: secret
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          PASSWORD: REDACTED_MARKER,
          ApiKey: REDACTED_MARKER,
          Token: REDACTED_MARKER,
          SECRET: REDACTED_MARKER
        }
      ]);
    });

    it('testSanitizeLogArgsShouldRedactFieldsContainingSensitiveKeywords', () => {
      const userPassword = aRandomPassword();
      const accessToken = aRandomToken();
      const apiKeyValue = aRandomApiKey();
      const args = [{ userPassword, accessToken, apiKeyValue }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          userPassword: REDACTED_MARKER,
          accessToken: REDACTED_MARKER,
          apiKeyValue: REDACTED_MARKER
        }
      ]);
    });
  });

  describe('Header Sanitization', () => {
    it('testSanitizeLogArgsShouldSanitizeSensitiveHeadersWhenPresent', () => {
      const method = aRandomString();
      const apiKey = aRandomApiKey();
      const authToken = aRandomToken();
      const args = [
        {
          method,
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            authorization: `Bearer ${authToken}`
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          method,
          headers: {
            'content-type': 'application/json',
            'x-api-key': REDACTED_MARKER,
            authorization: REDACTED_MARKER
          }
        }
      ]);
    });

    it('testSanitizeLogArgsShouldKeepNonSensitiveHeadersUnchanged', () => {
      const contentType = 'application/json';
      const accept = 'application/json';
      const userAgent = aRandomString();
      const args = [
        {
          headers: {
            'content-type': contentType,
            accept,
            'user-agent': userAgent
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          headers: {
            'content-type': contentType,
            accept,
            'user-agent': userAgent
          }
        }
      ]);
    });

    it('testSanitizeLogArgsShouldHandleEmptyHeadersObject', () => {
      const method = aRandomString();
      const args = [{ method, headers: {} }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ method, headers: {} }]);
    });

    it('testSanitizeLogArgsShouldSanitizeHeadersWithCaseInsensitiveMatching', () => {
      const apiKey = aRandomApiKey();
      const authToken = aRandomToken();
      const password = aRandomPassword();
      const args = [
        {
          headers: {
            'X-API-KEY': apiKey,
            Authorization: authToken,
            PASSWORD: password
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          headers: {
            'X-API-KEY': REDACTED_MARKER,
            Authorization: REDACTED_MARKER,
            PASSWORD: REDACTED_MARKER
          }
        }
      ]);
    });
  });

  describe('Complex Object Handling', () => {
    it('testSanitizeLogArgsShouldSanitizeNestedObjectsWithSensitiveData', () => {
      const userName = aRandomString();
      const password = aRandomPassword();
      const apiKey = aRandomApiKey();
      const args = [
        {
          user: {
            name: userName,
            credentials: {
              password,
              apiKey
            }
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          user: {
            name: userName,
            credentials: {
              password: REDACTED_MARKER,
              apiKey: REDACTED_MARKER
            }
          }
        }
      ]);
    });

    it('testSanitizeLogArgsShouldHandleMultipleArgumentsWithMixedTypes', () => {
      const stringValue = aRandomString();
      const intValue = aRandomInt();
      const fastifyRequest = {
        raw: {},
        params: { id: aRandomString() }
      };
      const userName = aRandomString();
      const password = aRandomPassword();
      const userData = { name: userName, password };
      const args = [stringValue, intValue, testLogger, fastifyRequest, userData];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        stringValue,
        intValue,
        FASTIFY_MARKER,
        { name: userName, password: REDACTED_MARKER }
      ]);
    });

    it('testSanitizeLogArgsShouldKeepArraysAsIsWithinObjects', () => {
      const user1Name = aRandomString();
      const user1Password = aRandomPassword();
      const user2Name = aRandomString();
      const user2Password = aRandomPassword();
      const args = [
        {
          users: [
            { name: user1Name, password: user1Password },
            { name: user2Name, password: user2Password }
          ]
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          users: [
            { name: user1Name, password: user1Password },
            { name: user2Name, password: user2Password }
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
      const name = aRandomString();
      const args = [{ name, password: null }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ name, password: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldRedactSensitiveFieldsEvenWhenUndefined', () => {
      const name = aRandomString();
      const args = [{ name, password: undefined }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ name, password: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldReturnEmptyObjectWhenPassedEmptyObject', () => {
      const args = [{}];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{}]);
    });

    it('testSanitizeLogArgsShouldIgnoreSymbolKeysInObjects', () => {
      const sym = Symbol('test');
      const name = aRandomString();
      const symbolValue = aRandomString();
      const args = [{ [sym]: symbolValue, name }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ name }]);
    });

    it('testSanitizeLogArgsShouldReplaceCircularReferencesWithMarker', () => {
      const name = aRandomString();
      const obj: Record<string, unknown> = { name };
      obj.self = obj;

      const result = sanitizeLogArgs([obj]);

      expect(result).toEqual([{ name, self: CIRCULAR_MARKER }]);
    });
  });

  describe('Real-World Scenarios', () => {
    it('testSanitizeLogArgsShouldSanitizeLoginRequestData', () => {
      const email = aRandomEmail();
      const password = aRandomPassword();
      const args = [{ body: { email, password } }];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([{ body: { email, password: REDACTED_MARKER } }]);
    });

    it('testSanitizeLogArgsShouldSanitizeApiRequestWithSensitiveHeaders', () => {
      const url = '/api/users';
      const method = 'POST';
      const apiKey = aRandomApiKey();
      const userName = aRandomString();
      const userEmail = aRandomEmail();
      const args = [
        {
          url,
          method,
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey
          },
          body: {
            name: userName,
            email: userEmail
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          url,
          method,
          headers: {
            'content-type': 'application/json',
            'x-api-key': REDACTED_MARKER
          },
          body: {
            name: userName,
            email: userEmail
          }
        }
      ]);
    });

    it('testSanitizeLogArgsShouldSanitizePaymentRequestWithCredentials', () => {
      const amount = aRandomInt(100, 10000);
      const currency = 'USD';
      const token = aRandomToken();
      const apiKey = aRandomApiKey();
      const args = [
        {
          amount,
          currency,
          paymentMethod: {
            type: 'card',
            token,
            apiKey
          }
        }
      ];

      const result = sanitizeLogArgs(args);

      expect(result).toEqual([
        {
          amount,
          currency,
          paymentMethod: {
            type: 'card',
            token: REDACTED_MARKER,
            apiKey: REDACTED_MARKER
          }
        }
      ]);
    });
  });
});
