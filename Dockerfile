# Base image for building
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@10.14.0

# Base image for runtime
FROM node:22-slim AS baseruntime

# Image for dependencies. We install dependencies here to cache these layers.
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/pnpm,id=ts-microservice-template-pnpm \
    pnpm install \
        --frozen-lockfile \
        --prefer-offline \
        --ignore-scripts

# Image for linting
FROM base AS linter

COPY --from=deps /app/node_modules /app/node_modules

COPY . /app

WORKDIR /app

RUN pnpm lint && pnpm format:check && \
    touch /app/lint.txt

# Image for linter output so that when running linter in CI we could get only
# the test results
FROM scratch AS linter-output

COPY --from=linter /app /app

# Image for testing (CI) - runs tests during build
FROM base AS tester

# Required for testcontainers. These arguments are passed in CI environments.
# For local development we pass them using docker-compose.test.yml and use
# Docker-in-Docker (DinD) to run tests.
ARG DOCKER_HOST
ENV DOCKER_HOST=${DOCKER_HOST}

# If test result was cached by Docker but you need to re-run them without
# changing the code, override this build argument.
ARG CACHE_BUSTER=0

COPY --from=deps /app/node_modules /app/node_modules

COPY . /app

WORKDIR /app

# Note that we export test-results in junit format and suppress the original
# exit code (so that we could get the test results).
RUN pnpm test:junit ; \
    echo $? > /app/exit-code.txt; \
    sed -i 's/&amp;gt;/&gt;/g; s/&amp;lt;/&lt;/g' /app/test-results.xml

# Image for tester output so that when running tests in CI we could get only
# the test results
FROM scratch AS tester-output

COPY --from=tester /app /app

# Image for building for production
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

COPY . /app

RUN pnpm build && \
    CI=1 pnpm prune --production


# Runtime image, the one that will work in production
FROM baseruntime AS runtime

WORKDIR /app

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules /app/node_modules

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Environment variables (required at runtime)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV LISTEN_ADDR=0.0.0.0
ENV LISTEN_PORT=8080

# Reference files from linter and tester to make sure that they actually ran
# during the build process.
COPY --from=linter /app/lint.txt /app
COPY --from=tester /app/exit-code.txt /app
COPY --from=tester /app/test-results.xml /app

# Expose metrics port
EXPOSE 8080

CMD ["node", "dist/index.js"]
