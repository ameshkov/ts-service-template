/**
 * Metrics Service
 *
 * Exposes Prometheus metrics and health check endpoints for production monitoring.
 */

import { Hono } from 'hono';
import { Registry, Gauge } from 'prom-client';
import { version } from '../version.js';

/** Prometheus registry for metrics */
export const register = new Registry();

/** Gauge indicating the service is up, labeled with version */
const upGauge = new Gauge({
  name: 'microservice_up',
  help: 'Whether the service is up',
  labelNames: ['version'],
  registers: [register],
});

/**
 * Initializes metrics by setting the up gauge.
 */
export function initMetrics(): void {
  upGauge.set({ version }, 1);
}

/**
 * Creates a Hono app with metrics and health check routes.
 * @returns Hono app instance with /metrics and /health-check routes
 */
export function createMetricsRoutes(): Hono {
  const app = new Hono();

  app.get('/metrics', async (c) => {
    try {
      return c.text(await register.metrics(), 200, {
        'Content-Type': register.contentType,
      });
    } catch {
      return c.text('Error collecting metrics', 500);
    }
  });

  app.get('/health-check', (c) => {
    return c.text('OK', 200);
  });

  return app;
}
