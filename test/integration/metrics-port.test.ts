import { spawn, ChildProcess } from 'child_process';
import { aRandomInt } from '../utils/test-utils.js';

describe('Metrics Port Integration Tests', () => {
  let serverProcess: ChildProcess | null = null;

  const waitForServer = (port: number, maxAttempts = 20): Promise<boolean> => {
    return new Promise(resolve => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const response = await fetch(`http://localhost:${port}/health`);
          if (response.ok) {
            clearInterval(interval);
            resolve(true);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve(false);
          }
        }
      }, 500);
    });
  };

  const waitForMetrics = (port: number, maxAttempts = 20): Promise<boolean> => {
    return new Promise(resolve => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const response = await fetch(`http://localhost:${port}/metrics`);
          if (response.ok) {
            clearInterval(interval);
            resolve(true);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve(false);
          }
        }
      }, 500);
    });
  };

  afterEach(async () => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
      serverProcess = null;
    }
  });

  describe('Separate Metrics Port', () => {
    it('should start metrics server on separate port when METRICS_PORT differs from PORT', async () => {
      const mainPort = aRandomInt(4000, 5000);
      const metricsPort = aRandomInt(5001, 6000);

      serverProcess = spawn('node', ['dist/server.js'], {
        env: {
          ...process.env,
          PORT: mainPort.toString(),
          METRICS_PORT: metricsPort.toString(),
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db'
        }
      });

      const mainServerReady = await waitForServer(mainPort);
      expect(mainServerReady).toBe(true);

      const metricsServerReady = await waitForMetrics(metricsPort);
      expect(metricsServerReady).toBe(true);

      // Verify main app endpoints work
      const healthResponse = await fetch(`http://localhost:${mainPort}/health`);
      expect(healthResponse.ok).toBe(true);

      // Verify metrics NOT available on main port
      const metricsOnMainPort = await fetch(`http://localhost:${mainPort}/metrics`);
      expect(metricsOnMainPort.status).toBe(404);

      // Verify metrics available on metrics port
      const metricsResponse = await fetch(`http://localhost:${metricsPort}/metrics`);
      expect(metricsResponse.ok).toBe(true);
      expect(metricsResponse.headers.get('content-type')).toContain('text/plain');

      const metricsBody = await metricsResponse.text();
      expect(metricsBody).toContain('nodejs_process_cpu');
      expect(metricsBody).toContain('http_requests_total');
    }, 30000);
  });

  describe('Same Port (Default Behavior)', () => {
    it('should serve metrics on main port when METRICS_PORT equals PORT', async () => {
      const port = aRandomInt(4000, 5000);

      serverProcess = spawn('node', ['dist/server.js'], {
        env: {
          ...process.env,
          PORT: port.toString(),
          METRICS_PORT: port.toString(),
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db'
        }
      });

      const serverReady = await waitForServer(port);
      expect(serverReady).toBe(true);

      // Verify main app endpoints work
      const healthResponse = await fetch(`http://localhost:${port}/health`);
      expect(healthResponse.ok).toBe(true);

      // Verify metrics available on same port
      const metricsResponse = await fetch(`http://localhost:${port}/metrics`);
      expect(metricsResponse.ok).toBe(true);

      const metricsBody = await metricsResponse.text();
      expect(metricsBody).toContain('nodejs_process_cpu');
    }, 30000);
  });

  describe('Default METRICS_PORT Behavior', () => {
    it('should default to PORT when METRICS_PORT not specified', async () => {
      const port = aRandomInt(4000, 5000);

      serverProcess = spawn('node', ['dist/server.js'], {
        env: {
          ...process.env,
          PORT: port.toString(),
          // METRICS_PORT not specified - should default to PORT
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db'
        }
      });

      const serverReady = await waitForServer(port);
      expect(serverReady).toBe(true);

      // Verify metrics available on main port (default behavior)
      const metricsResponse = await fetch(`http://localhost:${port}/metrics`);
      expect(metricsResponse.ok).toBe(true);
    }, 30000);
  });
});
