# AGENTS.md

TypeScript microservice template with Express, Prometheus metrics, and health checks.

## Project structure

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

## Build and test commands

- `pnpm start` - start the application
- `pnpm build` - compile TypeScript to JavaScript
- `pnpm lint` - lint source files with ESLint
- `pnpm lint:fix` - lint and auto-fix issues
- `pnpm format:check` - check formatting with Prettier and Markdownlint
- `pnpm format:fix` - fix formatting issues
- `pnpm test` - run all tests once
- `pnpm test:watch` - run tests in watch mode
- `pnpm test:coverage` - run tests with coverage report

## Contribution instructions

- For every change you MUST verify it with linter and formatter.

  Use the following commands:
    - `pnpm lint` to run the linter (ESLint)
    - `pnpm format:check` to check the formatting (Prettier and Markdownlint)
    - `pnpm format:fix` to fix the formatting issues

- Do not forget to update unit tests for changed code.

- Always run tests with the `pnpm test` script to verify that your changes do
  not break existing functionality.

- You should update `DEVELOPMENT.md` whenever there are any changes within the
  following parts of the program:
    - Build process
    - Configuration (env variables)
    - Prometheus metrics
    - Dockerfile

- When making changes to the project structure, ensure the Project structure
  section in `AGENTS.md` is updated and remains valid.

- Configuration must be managed via environment variables.

- When formatting tables in markdown make sure to have space near the pipe
  symbol, i.e. format like `| ------------ |`.
