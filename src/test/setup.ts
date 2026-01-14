import { vi } from 'vitest';

vi.mock('../config.js', () => ({
  config: {
    env: 'test',
    isDev: false,
    listenAddr: '0.0.0.0',
    listenPort: 9090,
    databaseUrl: 'postgresql://test:test@localhost:5432/test',
    sentryDsn: '',
  },
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

export { getTestDb } from './db-setup.js';
