import { serve } from '@hono/node-server';
import pg from 'pg';
import { logger } from './utils/logger.js';
import * as Sentry from '@sentry/node';
import { initMetrics } from './services/metrics.js';
import { version } from './version.js';
import { config } from './config.js';
import { createDb, runMigrations } from './db/index.js';
import { createApp } from './app.js';

const { Pool } = pg;

// Initialize Sentry early (skip if DSN not configured)
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    release: version,
    environment: config.env,
  });
  logger.info('Sentry error tracking initialized');
}

// Initialize database
const pool = new Pool({ connectionString: config.databaseUrl });
const db = createDb(pool);

// Run migrations
await runMigrations(db);
logger.info('Database migrations completed');

// Create the main Hono app
const app = createApp({ db });

// Initialize metrics
initMetrics();

serve(
  {
    fetch: app.fetch,
    hostname: config.listenAddr,
    port: config.listenPort,
  },
  () => {
    logger.info(`Server listening on http://${config.listenAddr}:${config.listenPort}`);
  },
);

logger.info(`Microservice v${version} is running!`);

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  try {
    await pool.end();
    logger.info('Database connections closed');
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    if (config.sentryDsn) {
      Sentry.captureException(error);
      await Sentry.flush(2000);
    }
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
