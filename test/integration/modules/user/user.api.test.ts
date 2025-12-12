import { FastifyInstance } from 'fastify';
import { buildTestApp, TEST_API_KEY } from '../../../helpers/app.helper.js';
import { aRandomString, aRandomEmail, aRandomInt } from '../../../utils/test-utils.js';

describe('User API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
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
        headers: {
          'x-api-key': TEST_API_KEY
        }
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
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: userName,
          email: userEmail,
          age: userAge
        }
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.data.name).toBe(userName);
      expect(payload.data.email).toBe(userEmail);
    });

    it('testCreateUserEndpointShouldReturn400WhenRequiredFieldsMissing', async () => {
      const endpoint = '/api/users';
      const userName = aRandomString();

      const response = await app.inject({
        method: 'POST',
        url: endpoint,
        headers: {
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: userName
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('testCreateUserEndpointShouldReturn400WhenInvalidEmailProvided', async () => {
      const endpoint = '/api/users';
      const userName = aRandomString();
      const invalidEmail = aRandomString();

      const response = await app.inject({
        method: 'POST',
        url: endpoint,
        headers: {
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: userName,
          email: invalidEmail
        }
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
        headers: {
          'x-api-key': TEST_API_KEY
        }
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('Validation error');
    });
  });

  describe('API Key Authentication', () => {
    it('testApiKeyAuthShouldReturn401WhenApiKeyMissing', async () => {
      const endpoint = '/api/users';

      const response = await app.inject({
        method: 'GET',
        url: endpoint
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('API key required');
    });

    it('testApiKeyAuthShouldReturn403WhenApiKeyInvalid', async () => {
      const endpoint = '/api/users';
      const invalidApiKey = aRandomString();

      const response = await app.inject({
        method: 'GET',
        url: endpoint,
        headers: {
          'x-api-key': invalidApiKey
        }
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('Invalid API key');
    });
  });
});
