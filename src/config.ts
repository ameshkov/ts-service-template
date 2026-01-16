import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  env: optionalEnv('NODE_ENV', 'production'),
  isDev: optionalEnv('NODE_ENV', 'development') === 'development',

  listenAddr: optionalEnv('LISTEN_ADDR', '0.0.0.0'),
  listenPort: parseInt(optionalEnv('LISTEN_PORT', '9090'), 10),

  databaseUrl: requireEnv('DB_URL'),

  sentryDsn: requireEnv('SENTRY_DSN'),
} as const;
