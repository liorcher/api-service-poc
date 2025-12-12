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
      const result = sanitizeLogArgs([]);

      expect(result).toEqual([]);
    });

    it('testSanitizeLogArgsShouldReturnUnchangedWhenPassedSimpleObjects', () => {
      const name = aRandomString();
      const age = aRandomInt(18, 80);

      const result = sanitizeLogArgs([{ name, age }]);

      expect(result).toEqual([{ name, age }]);
    });
  });

  describe('Logger Object Filtering', () => {
    it('testSanitizeLogArgsShouldFilterOutLoggerObjectsWhenPresent', () => {
      const stringValue = aRandomString();
      const data = { value: aRandomString() };

      const result = sanitizeLogArgs([stringValue, testLogger, data]);

      expect(result).toEqual([stringValue, data]);
    });

    it.each(['child', 'info'])(
      'testSanitizeLogArgsShouldKeepObjectWhenOnly_%s_MethodPresent',
      methodName => {
        const notLogger = {
          [methodName]: () => {},
          someOtherMethod: () => {}
        };

        const result = sanitizeLogArgs([notLogger]);

        expect(result).toHaveLength(1);
      }
    );
  });

  describe('Fastify Object Detection', () => {
    it.each([
      ['raw', 'FastifyRequest'],
      ['log', 'FastifyReply'],
      ['request', 'RequestProperty']
    ])(
      'testSanitizeLogArgsShouldReplaceWithMarkerWhen%sPropertyDetected',
      (property, _description) => {
        const obj = { [property]: {}, data: aRandomString() };

        const result = sanitizeLogArgs([obj]);

        expect(result).toEqual([FASTIFY_MARKER]);
      }
    );
  });

  describe('Sensitive Field Redaction', () => {
    it.each([
      ['password', () => aRandomPassword()],
      ['apiKey', () => aRandomApiKey()],
      ['token', () => aRandomToken()],
      ['secret', () => aRandomString(32)]
    ])('testSanitizeLogArgsShouldRedact_%s_FieldWhenPresent', (field, generator) => {
      const otherField = aRandomString();
      const sensitiveValue = generator();

      const result = sanitizeLogArgs([{ other: otherField, [field]: sensitiveValue }]);

      expect(result).toEqual([{ other: otherField, [field]: REDACTED_MARKER }]);
    });

    it.each([
      ['PASSWORD', () => aRandomPassword()],
      ['ApiKey', () => aRandomApiKey()],
      ['Token', () => aRandomToken()],
      ['SECRET', () => aRandomString(32)]
    ])('testSanitizeLogArgsShouldRedactFieldWithCaseInsensitiveMatching_%s', (field, value) => {
      const result = sanitizeLogArgs([{ [field]: value() }]);

      expect(result).toEqual([{ [field]: REDACTED_MARKER }]);
    });

    it.each([
      ['userPassword', () => aRandomPassword()],
      ['accessToken', () => aRandomToken()],
      ['apiKeyValue', () => aRandomApiKey()]
    ])('testSanitizeLogArgsShouldRedactFieldContainingSensitiveKeyword_%s', (field, generator) => {
      const result = sanitizeLogArgs([{ [field]: generator() }]);

      expect(result).toEqual([{ [field]: REDACTED_MARKER }]);
    });
  });

  describe('Header Sanitization', () => {
    it('testSanitizeLogArgsShouldSanitizeSensitiveHeadersWhenPresent', () => {
      const method = aRandomString();
      const apiKey = aRandomApiKey();
      const authToken = aRandomToken();

      const result = sanitizeLogArgs([
        {
          method,
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            authorization: `Bearer ${authToken}`
          }
        }
      ]);

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
      const userAgent = aRandomString();

      const result = sanitizeLogArgs([
        {
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': userAgent
          }
        }
      ]);

      expect(result).toEqual([
        {
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'user-agent': userAgent
          }
        }
      ]);
    });

    it('testSanitizeLogArgsShouldHandleEmptyHeadersObject', () => {
      const method = aRandomString();

      const result = sanitizeLogArgs([{ method, headers: {} }]);

      expect(result).toEqual([{ method, headers: {} }]);
    });
  });

  describe('Complex Object Handling', () => {
    it('testSanitizeLogArgsShouldSanitizeNestedObjectsWithSensitiveData', () => {
      const userName = aRandomString();
      const password = aRandomPassword();
      const apiKey = aRandomApiKey();

      const result = sanitizeLogArgs([
        {
          user: {
            name: userName,
            credentials: { password, apiKey }
          }
        }
      ]);

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
      const fastifyRequest = { raw: {}, params: { id: aRandomString() } };
      const userName = aRandomString();
      const password = aRandomPassword();

      const result = sanitizeLogArgs([
        stringValue,
        intValue,
        testLogger,
        fastifyRequest,
        { name: userName, password }
      ]);

      expect(result).toEqual([
        stringValue,
        intValue,
        FASTIFY_MARKER,
        { name: userName, password: REDACTED_MARKER }
      ]);
    });

    it('testSanitizeLogArgsShouldKeepArraysAsIsWithinObjects', () => {
      const user1 = { name: aRandomString(), password: aRandomPassword() };
      const user2 = { name: aRandomString(), password: aRandomPassword() };

      const result = sanitizeLogArgs([{ users: [user1, user2] }]);

      expect(result).toEqual([{ users: [user1, user2] }]);
    });
  });

  describe('Edge Cases', () => {
    it.each([
      [null, 'Null'],
      [undefined, 'Undefined']
    ])('testSanitizeLogArgsShouldReturn%sWhenPassed%s', (value, _description) => {
      const result = sanitizeLogArgs([value]);

      expect(result).toEqual([value]);
    });

    it.each([
      [null, 'Null'],
      [undefined, 'Undefined']
    ])('testSanitizeLogArgsShouldRedactSensitiveFieldsEvenWhen%s', (value, _description) => {
      const name = aRandomString();

      const result = sanitizeLogArgs([{ name, password: value }]);

      expect(result).toEqual([{ name, password: REDACTED_MARKER }]);
    });

    it('testSanitizeLogArgsShouldReturnEmptyObjectWhenPassedEmptyObject', () => {
      const result = sanitizeLogArgs([{}]);

      expect(result).toEqual([{}]);
    });

    it('testSanitizeLogArgsShouldIgnoreSymbolKeysInObjects', () => {
      const sym = Symbol('test');
      const name = aRandomString();
      const symbolValue = aRandomString();

      const result = sanitizeLogArgs([{ [sym]: symbolValue, name }]);

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
    it.each([
      [
        'LoginRequestData',
        () => {
          const email = aRandomEmail();
          const password = aRandomPassword();
          return {
            input: [{ body: { email, password } }],
            expected: [{ body: { email, password: REDACTED_MARKER } }]
          };
        }
      ],
      [
        'ApiRequestWithSensitiveHeaders',
        () => {
          const apiKey = aRandomApiKey();
          const userName = aRandomString();
          const userEmail = aRandomEmail();
          return {
            input: [
              {
                url: '/api/users',
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
                body: { name: userName, email: userEmail }
              }
            ],
            expected: [
              {
                url: '/api/users',
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-api-key': REDACTED_MARKER },
                body: { name: userName, email: userEmail }
              }
            ]
          };
        }
      ],
      [
        'PaymentRequestWithCredentials',
        () => {
          const amount = aRandomInt(100, 10000);
          const token = aRandomToken();
          const apiKey = aRandomApiKey();
          return {
            input: [{ amount, currency: 'USD', paymentMethod: { type: 'card', token, apiKey } }],
            expected: [
              {
                amount,
                currency: 'USD',
                paymentMethod: { type: 'card', token: REDACTED_MARKER, apiKey: REDACTED_MARKER }
              }
            ]
          };
        }
      ]
    ])('testSanitizeLogArgsShouldSanitize%s', (_scenario, setupTest) => {
      const { input, expected } = setupTest();

      const result = sanitizeLogArgs(input);

      expect(result).toEqual(expected);
    });
  });
});
