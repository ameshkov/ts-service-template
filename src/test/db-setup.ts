import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { vi, beforeAll, afterAll, beforeEach } from 'vitest';
import * as schema from '../db/schema.js';
import { runMigrations } from '../db/migrate.js';

let container: StartedPostgreSqlContainer;
let testPool: pg.Pool;
let _testDb: ReturnType<typeof drizzle<typeof schema>>;

export function getTestDb() {
  return _testDb;
}

vi.mock('../db/index.js', async () => {
  const actual = await vi.importActual('../db/index.js');
  return {
    ...actual,
    get db() {
      return _testDb;
    },
  };
});

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  const connectionString = container.getConnectionUri();
  testPool = new pg.Pool({ connectionString });
  _testDb = drizzle(testPool, { schema });

  await runMigrations(_testDb);
}, 60000);

afterAll(async () => {
  await testPool?.end();
  await container?.stop();
});

beforeEach(async () => {
  await _testDb.delete(schema.users);
});
