import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../../../helpers/app.helper.js';
import {
  aRandomString,
  aRandomEmail,
  aRandomInt,
  aRandomApiKey
} from '../../../utils/test-utils.js';

describe('User API Integration Tests', () => {
  let app: FastifyInstance;
  let testApiKey: string = aRandomApiKey();

  beforeAll(async () => {
    app = await buildTestApp(testApiKey);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/users', () => {
    it('testGetUsersEndpointShouldReturnUsersArrayWhenValidApiKey', async () => {
      const endpoint = '/api/users';

      const response = await app.inject({
        method: 'GET',
        url: endpoint,
        headers: { 'x-api-key': testApiKey }
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(Array.isArray(payload.data)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('testCreateUserEndpointShouldReturn201WhenValidDataProvided', async () => {
      const endpoint = '/api/users';
      const userName = aRandomString();
      const userEmail = aRandomEmail();
      const userAge = aRandomInt(18, 80);

      const response = await app.inject({
        method: 'POST',
        url: endpoint,
        headers: {
          'content-type': 'application/json',
          'x-api-key': testApiKey
        },
        payload: { name: userName, email: userEmail, age: userAge }
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.data.name).toBe(userName);
      expect(payload.data.email).toBe(userEmail);
    });

    it.each([
      ['RequiredFieldsMissing', { name: aRandomString() }],
      ['InvalidEmailProvided', { name: aRandomString(), email: aRandomString() }]
    ])('testCreateUserEndpointShouldReturn400When%s', async (_description, payload) => {
      const endpoint = '/api/users';

      const response = await app.inject({
        method: 'POST',
        url: endpoint,
        headers: { 'x-api-key': testApiKey },
        payload
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('testGetUserByIdEndpointShouldReturn400WhenInvalidIdProvided', async () => {
      const invalidId = aRandomString();
      const endpoint = `/api/users/${invalidId}`;

      const response = await app.inject({
        method: 'GET',
        url: endpoint,
        headers: { 'x-api-key': testApiKey }
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('Validation error');
    });
  });

  describe('API Key Authentication', () => {
    it.each([
      [401, undefined, 'Missing', 'API key required'],
      [403, aRandomString(), 'Invalid', 'Invalid API key']
    ])(
      'testApiKeyAuthShouldReturn%dWhenApiKey%s',
      async (expectedStatus, apiKey, _description, expectedError) => {
        const endpoint = '/api/users';
        const headers = apiKey ? { 'x-api-key': apiKey } : {};

        const response = await app.inject({
          method: 'GET',
          url: endpoint,
          headers
        });

        expect(response.statusCode).toBe(expectedStatus);
        const payload = JSON.parse(response.payload);
        expect(payload.success).toBe(false);
        expect(payload.error).toBe(expectedError);
      }
    );
  });
});
