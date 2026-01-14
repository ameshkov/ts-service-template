# TypeScript Microservice Template

A production-ready TypeScript microservice template with Hono, Prometheus metrics, health checks, and Sentry error tracking.

## Features

- **Hono server** - Lightweight HTTP server with health-check and metrics endpoints
- **Prometheus metrics** - Production monitoring with prom-client
- **Sentry integration** - Error tracking (optional, enabled via `SENTRY_DSN`)
- **Structured logging** - JSONL format for infrastructure compatibility
- **TypeScript** - Full type safety with strict mode
- **ESLint + Prettier** - Code linting and formatting
- **Vitest** - Fast unit testing framework
- **Husky** - Pre-commit hooks for quality gates
- **Docker** - Multi-stage build for production deployment

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL (required for the example service)
docker compose up -d

# Start the service
pnpm start
```

## Available Scripts

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

## Endpoints

The service exposes two endpoints on the configured port (default 9090):

- `GET /health-check` - Returns `200 OK` when healthy
- `GET /metrics` - Prometheus-format metrics

## Creating a New Project from This Template

Follow these steps to create a new microservice based on this template:

### 1. Clone the Template

```bash
git clone <template-repo-url> my-new-service
cd my-new-service
rm -rf .git
git init
```

### 2. Update Project Identity

Replace all occurrences of the template name with your service name:

| File | What to Change |
| ---- | -------------- |
| `package.json` | `name`, `description` |
| `Dockerfile` | Cache ID in `--mount=type=cache,id=ts-microservice-template-pnpm` |
| `bamboo-specs/bamboo.yaml` | `plan.key`, `plan.name`, `variables.name`, `variables.maintainer` |
| `README.md` | Title and description |
| `AGENTS.md` | Project description and structure if needed |

### 3. Configure GitHub Actions CI/CD

The CI workflow is defined in `.github/workflows/ci.yml`. It runs:

- **Lint**: ESLint and Prettier checks (via Docker build)
- **Test**: Unit tests with testcontainers (via Docker-in-Docker)
- **Docker**: Docker image build (on master/main branch only)

To enable Docker image publishing, update the workflow to push to your container
registry (e.g., GitHub Container Registry, Docker Hub).

### 4. Update Environment Configuration

1. Copy `.env.example` to `.env`
2. Update environment variables as needed for your service
3. Add any new environment variables to both `.env.example` and `DEVELOPMENT.md`

### 5. Install Dependencies and Verify

```bash
pnpm install
pnpm lint
pnpm format:check
pnpm test
pnpm start
```

### 6. Remove Example Database Files (Optional)

This template includes an example PostgreSQL integration with Drizzle ORM. If your
service doesn't need a database, remove the following files:

- `src/db/` - Database schema, connection, and migrations
- `src/services/users.ts` - Example user service
- `src/services/users.test.ts` - Example user service tests
- `src/test/db-setup.ts` - Database test setup with testcontainers
- `docker-compose.yml` - PostgreSQL container configuration
- `docker-compose.test.yml` - Docker-in-Docker (DinD) configuration for running tests in CI

Also update:

- `src/config.ts` - Remove the database configuration
- `src/app.ts` - Remove the `/api/users` route and `UserService` import
- `src/index.ts` - Remove database initialization code
- `src/test/setup.ts` - Remove the `export { getTestDb }` line
- `package.json` - Remove `drizzle-orm`, `pg`, `@types/pg`, `drizzle-kit`,
  `testcontainers`, and `@testcontainers/postgresql` dependencies
- `DEVELOPMENT.md` - Remove the database section

### 7. Commit Your Changes

```bash
git add .
git commit -m "Initialize from ts-microservice-template"
```

## Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup and deployment guide
- [AGENTS.md](AGENTS.md) - AI agent instructions for contributing

## License

ISC
