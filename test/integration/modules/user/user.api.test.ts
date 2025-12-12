import { FastifyInstance } from 'fastify';
import { buildTestApp, TEST_API_KEY } from '../../../helpers/app.helper.js';

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
    it('should return users array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
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
    it('should create a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'content-type': 'application/json',
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: 'Test User',
          email: 'test@example.com',
          age: 25
        }
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.data.name).toBe('Test User');
      expect(payload.data.email).toBe('test@example.com');
    });

    it('should fail without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: 'Test User'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should fail with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'x-api-key': TEST_API_KEY
        },
        payload: {
          name: 'Test User',
          email: 'invalid-email'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 400 for invalid ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/invalid-id',
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
    it('should return 401 when API key is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('API key required');
    });

    it('should return 403 when API key is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: {
          'x-api-key': 'invalid-key'
        }
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('Invalid API key');
    });
  });
});
