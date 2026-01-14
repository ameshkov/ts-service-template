# Development Guide

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for PostgreSQL and tests)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure as needed:

```env
LISTEN_ADDR=0.0.0.0
LISTEN_PORT=9090
DB_URL=postgresql://microservice:microservice@localhost:5432/microservice
SENTRY_DSN=
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Run the Service

```bash
pnpm start
```

## Environment Variables

| Variable      | Required | Default     | Description                       |
| ------------- | -------- | ----------- | --------------------------------- |
| `LISTEN_ADDR` | No       | `0.0.0.0`   | Address for metrics/health server |
| `LISTEN_PORT` | No       | `9090`      | Port for metrics/health server    |
| `DB_URL`      | No       | (see below) | PostgreSQL connection URL         |
| `SENTRY_DSN`  | No       | -           | Sentry DSN for error tracking     |

Default `DB_URL`: `postgresql://microservice:microservice@localhost:5432/microservice`

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm start`        | Run the service with tsx         |
| `pnpm build`        | Compile TypeScript to JavaScript |
| `pnpm lint`         | Run ESLint                       |
| `pnpm lint:fix`     | Fix ESLint issues                |
| `pnpm format:check` | Check formatting with Prettier   |
| `pnpm format:fix`   | Fix formatting issues            |
| `pnpm test`         | Run tests                        |
| `pnpm test:watch`   | Run tests in watch mode          |
| `pnpm test:coverage`| Run tests with coverage          |

## Project Structure

```text
ts-microservice-template/
├── src/                      # Application source code
│   ├── db/                   # Database schema and connection
│   ├── services/             # Business logic
│   ├── test/                 # Test setup and utilities
│   └── utils/                # Utility functions
├── .github/workflows/        # GitHub Actions CI/CD
└── Dockerfile                # Container build
```

## Database

This template uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

### Schema

The database schema is defined in `src/db/schema.ts`. Example:

```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Running PostgreSQL Locally

Start PostgreSQL using docker-compose:

```bash
docker compose up -d
```

Stop PostgreSQL:

```bash
docker compose down
```

Stop and remove data:

```bash
docker compose down -v
```

### Testing with Testcontainers

Unit tests use [Testcontainers](https://testcontainers.com/) to spin up a real
PostgreSQL instance. Docker must be running to execute tests.

```bash
pnpm test
```

## Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build to separate concerns and optimize the
final image size. Each stage serves a specific purpose:

| Stage           | Base Image   | Purpose                                      |
| --------------- | ------------ | -------------------------------------------- |
| `base`          | node:22-slim | Common base with pnpm for build stages       |
| `baseruntime`   | node:22-slim | Minimal runtime base                         |
| `deps`          | base         | Install and cache dependencies               |
| `linter`        | base         | Run ESLint and Prettier checks               |
| `linter-output` | scratch      | Export linter results                        |
| `tester`        | base         | Run tests with testcontainers                |
| `tester-output` | scratch      | Export test results (JUnit XML, exit code)   |
| `builder`       | base         | Compile TypeScript and prune dev deps        |
| `runtime`       | baseruntime  | Final production image                       |

The `runtime` stage copies artifacts from `linter` and `tester` stages to
ensure both checks passed before the image can be built.

### Running Tests Locally with Docker

Tests use testcontainers which require access to a Docker daemon. The
`docker-compose.test.yml` runs `docker build` inside a container that shares
a network with Docker-in-Docker (DinD), reproducing the CI environment locally.

The DinD service uses the official [Docker image](https://hub.docker.com/_/docker).

**Run tests:**

```bash
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

**Clean up:**

```bash
docker compose -f docker-compose.test.yml down -v
```

Test results are exported to `output/app/`:

- `test-results.xml` - JUnit format test results
- `exit-code.txt` - Test command exit code

### Running Tests in CI

In CI, tests run during `docker build`. The GitHub Actions workflow uses a
Docker-in-Docker (DinD) service to provide a Docker daemon for testcontainers.
The DinD service exposes port 2375, and `DOCKER_HOST=tcp://localhost:2375` is
passed as a build argument.

After the build completes, the workflow checks `/app/exit-code.txt` to verify
that tests passed. If tests failed, the workflow fails and displays the test
results.

Example build command used in CI:

```bash
docker build \
    --progress plain \
    --build-arg DOCKER_HOST=tcp://localhost:2375 \
    --output type=local,dest=output \
    .
```

## Deployment

### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t ts-microservice-template:latest .

# Run the container
docker run --rm \
  -p 9090:9090 \
  --env-file .env \
  ts-microservice-template:latest
```

### Health & Metrics

The service exposes the following endpoints on the configured port (default 9090):

- `GET /health-check` - Returns `200 OK` when healthy
- `GET /metrics` - Prometheus-format metrics
- `GET /api/hello` - Example API endpoint returning JSON

```bash
# Test health check
curl http://localhost:9090/health-check

# Test metrics
curl http://localhost:9090/metrics

# Test example API
curl http://localhost:9090/api/hello
```

## Prometheus Metrics

| Metric Name       | Type  | Labels    | Description               |
| ----------------- | ----- | --------- | ------------------------- |
| `microservice_up` | Gauge | `version` | Whether the service is up |

## Troubleshooting

### Health check failing

1. **Check port** - Ensure port 9090 is not in use
2. **Check firewall** - Port must be accessible
3. **Check logs** - Look for startup errors

### Sentry not receiving errors

1. **Check DSN** - Verify `SENTRY_DSN` is set correctly
2. **Check network** - Ensure outbound HTTPS is allowed
3. **Trigger test error** - Errors only sent when they occur

## License

ISC
