import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app.helper.js';
import { aRandomApiKey } from '../utils/test-utils.js';

describe('Health Check Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp(aRandomApiKey());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /health/live', () => {
    it('testLivenessEndpointShouldReturn200WhenProcessIsAlive', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/live'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('healthy');
      expect(payload.timestamp).toBeDefined();
      expect(payload.uptime).toBeGreaterThan(0);
    });

    it('testLivenessEndpointShouldBeFastResponse', async () => {
      const start = Date.now();

      const response = await app.inject({
        method: 'GET',
        url: '/health/live'
      });

      const duration = Date.now() - start;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /health/ready', () => {
    it('testReadinessEndpointShouldReturn200WhenDependenciesHealthy', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/ready'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('healthy');
      expect(payload.checks.database.status).toBe('connected');
      expect(payload.checks.container.status).toBe('connected');
      expect(payload.checks.database.responseTime).toBeDefined();
    });

    it('testReadinessEndpointShouldIncludeAllChecks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/ready'
      });

      const payload = JSON.parse(response.payload);
      expect(payload.checks).toBeDefined();
      expect(payload.checks.database).toBeDefined();
      expect(payload.checks.container).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('testHealthEndpointShouldReturnDetailedHealthStatus', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('healthy');
      expect(payload.checks).toBeDefined();
      expect(payload.checks.liveness).toBeDefined();
      expect(payload.checks.readiness).toBeDefined();
    });

    it('testHealthEndpointShouldIncludeBothLivenessAndReadiness', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const payload = JSON.parse(response.payload);
      expect(payload.checks.liveness.status).toBe('healthy');
      expect(payload.checks.readiness.database.status).toBe('connected');
      expect(payload.checks.readiness.container.status).toBe('connected');
    });
  });
});
