import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app.helper.js';

describe('App Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Endpoint', () => {
    it('testHealthEndpointShouldReturn200WithStatusWhenCalled', async () => {
      const endpoint = '/health';

      const response = await app.inject({
        method: 'GET',
        url: endpoint
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('ok');
      expect(payload.timestamp).toBeDefined();
    });
  });

  describe('Unknown Routes', () => {
    it('testUnknownRoutesShouldReturn404WhenInvalidPathRequested', async () => {
      const invalidPath = '/unknown-route';

      const response = await app.inject({
        method: 'GET',
        url: invalidPath
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
