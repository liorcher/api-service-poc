import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app.helper.js';
import { aRandomApiKey, aRandomString, aRandomEmail, aRandomInt } from '../utils/test-utils.js';

describe('Metrics Integration Tests', () => {
  let app: FastifyInstance;
  const testApiKey = aRandomApiKey();

  beforeAll(async () => {
    app = await buildTestApp(testApiKey);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /metrics', () => {
    it('testMetricsEndpointShouldReturnPrometheusFormatWhenCalled', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('testMetricsEndpointShouldIncludeNodeJsMetrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(response.body).toContain('nodejs_heap_size_total_bytes');
      expect(response.body).toContain('nodejs_');
    });

    it('testMetricsEndpointShouldIncludeHttpMetrics', async () => {
      await app.inject({
        method: 'GET',
        url: '/health'
      });

      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(response.body).toContain('http_requests_total');
      expect(response.body).toContain('http_request_duration_seconds');
    });
  });

  describe('HTTP Metrics Collection', () => {
    it('testHttpMetricsShouldBeCollectedForSuccessfulRequests', async () => {
      await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { 'x-api-key': testApiKey }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('http_requests_total');
      expect(metricsResponse.body).toContain('method="GET"');
      expect(metricsResponse.body).toContain('status_code="200"');
    });

    it('testHttpMetricsShouldBeCollectedForFailedRequests', async () => {
      await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('status_code="401"');
    });
  });

  describe('Method Metrics Collection', () => {
    it('testMethodMetricsShouldBeCollectedWhenMethodsExecute', async () => {
      await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { 'x-api-key': testApiKey }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('method_invocations_total');
      expect(metricsResponse.body).toContain('method_duration_seconds');
      expect(metricsResponse.body).toContain('class_name="UserController"');
      expect(metricsResponse.body).toContain('status="success"');
    });

    it('testMethodMetricsShouldTrackErrorsWhenMethodsFail', async () => {
      const invalidId = aRandomString();

      await app.inject({
        method: 'GET',
        url: `/api/users/${invalidId}`,
        headers: { 'x-api-key': testApiKey }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('method_invocations_total');
    });
  });

  describe('Auth Metrics Collection', () => {
    it('testAuthFailureMetricsShouldBeCollectedWhenApiKeyMissing', async () => {
      await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('auth_failures_total');
      expect(metricsResponse.body).toContain('reason="missing_api_key"');
    });

    it('testAuthFailureMetricsShouldBeCollectedWhenApiKeyInvalid', async () => {
      const invalidApiKey = aRandomString();

      await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { 'x-api-key': invalidApiKey }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('auth_failures_total');
      expect(metricsResponse.body).toContain('reason="invalid_api_key"');
    });
  });

  describe('Validation Metrics Collection', () => {
    it('testValidationErrorMetricsShouldBeCollectedWhenValidationFails', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { 'x-api-key': testApiKey },
        payload: { name: aRandomString() }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('validation_errors_total');
      expect(metricsResponse.body).toContain('validation_type="body"');
    });

    it('testValidationErrorMetricsShouldBeCollectedForInvalidParams', async () => {
      const invalidId = aRandomString();

      await app.inject({
        method: 'GET',
        url: `/api/users/${invalidId}`,
        headers: { 'x-api-key': testApiKey }
      });

      const metricsResponse = await app.inject({
        method: 'GET',
        url: '/metrics'
      });

      expect(metricsResponse.body).toContain('validation_errors_total');
      expect(metricsResponse.body).toContain('validation_type="params"');
    });
  });
});
