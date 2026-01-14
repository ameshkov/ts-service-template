import { Hono } from 'hono';
import * as Sentry from '@sentry/node';
import { logger } from './utils/logger.js';
import { createMetricsRoutes } from './services/metrics.js';
import { Database } from './db/index.js';
import { UserService } from './services/users.js';

export interface AppDependencies {
  db: Database;
}

export function createApp(deps: AppDependencies) {
  const app = new Hono();
  const userService = new UserService(deps.db);

  app.onError((err, c) => {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
    logger.error('Unhandled error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  app.route('/', createMetricsRoutes());

  // ============================================================
  // API Routes - Add your routes below
  // ============================================================

  // Example route using the database (can be removed)
  app.get('/api/users', async (c) => {
    const users = await userService.getAllUsers();
    return c.json(users);
  });

  // Add your API routes here:
  // app.get('/api/example', (c) => c.json({ message: 'Hello' }));
  // app.post('/api/example', async (c) => { ... });

  return app;
}
