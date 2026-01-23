# Forum Management System

## Product Information

**Forum Management System** is a modern, scalable platform for creating and managing online communities, support channels, or discussion groups. It enables users to register, participate in structured forums, create topics, post replies, and collaborate securely. Powered by PostgreSQL and PostGraphile 4, it provides an instant, robust GraphQL API, advanced security, and full administrative control.

## Functional Information

- User registration with profile management
- Creation and moderation of multiple forums
- Topic/thread posting and organized replies
- Role-based access for users and admins
- Secure, PostgreSQL-backed data with row-level security
- Auto-generated GraphQL API for flexible integrations
- Health checks and CI/CD-ready deployments
- Easily extensible and fully tested

Forum Management System is ideal for communities, organizations, and projects seeking a reliable, feature-rich platform for user-driven discussions.

## Features

- 🚀 **PostGraphile 4** - Powerful, customizable GraphQL API built directly from PostgreSQL, integrated for forum discussion and user management.
- 📦 **Nx Monorepo** - Structured codebase organized by features and shared modules.
- 🔒 **Production-Grade** - Health checks, graceful shutdown, and comprehensive error handling.
- 📝 **Structured Logging** - Efficient application logging with pino and pino-http.
- 🔧 **Config Validation** - Secure and type-safe environment variable validation using [Joi](https://github.com/hapijs/joi).
- 🐳 **Docker Integration** - One-command local development using `docker-compose` for PostgreSQL and all dependencies.
- 🔄 **GitHub Actions CI** - Continuous integration for linting, building, and testing.
- 🏊 **Connection Pooling** - Optimized PostgreSQL connection handling for concurrency and reliability.
- 🧪 **Testing** - End-to-end and unit tests with Jest for all major features.
- 🤖 **GraphQL Codegen** - Automatic type generation for your schema and resolvers.
- 🛡️ **Rate Limiting** - Express rate limiting for API abuse prevention.
- 🔐 **GraphQL Query Security** - Limits on query depth and computational cost.

## Project Structure

```
├── apps/
│   ├── api/                 # Express + PostGraphile server
│   │   └── src/
│   │       ├── main.ts      # Application entry point
│   │       └── routes/      # Express routes (health, api)
│   └── api-e2e/             # End-to-end tests
├── libs/
│   ├── database/            # Database pool and configuration
│   ├── gql/                 # PostGraphile preset and plugins
│   └── utils/               # Shared utilities (logger, config, health checks)
```

## Database Schema Overview

The forum system uses several main tables and security patterns to provide a robust, extensible backend.

### 1. Users (`app_public.users`)
Stores forum users (including admins).

| Column      | Type           | Description                       |
|-------------|----------------|-----------------------------------|
| id          | SERIAL PK      | Unique user identifier            |
| username    | CITEXT         | Public handle, unique             |
| name        | TEXT           | Public name or pseudonym          |
| avatar_url  | TEXT           | Avatar image URL (optional)       |
| is_admin    | BOOLEAN        | Admin privileges                  |
| created_at  | TIMESTAMPTZ    | Creation timestamp                |
| updated_at  | TIMESTAMPTZ    | Last update timestamp             |

**Triggers:**  
- `_100_timestamps`: Automatically manages `created_at` and `updated_at` on insert/update.  
- `_200_make_first_user_admin`: First registered user is made admin.  

**Row Level Security & Policies:**  
- Only users can update/delete their own data.
- Admin status enforced for critical actions.
- Most queries are restricted for privacy.

### 2. Forums (`app_public.forums`)
Defines forums as subject-based categories for topics.

| Column      | Type           | Description                       |
|-------------|----------------|-----------------------------------|
| id          | SERIAL PK      | Forum identifier                  |
| slug        | TEXT           | Unique, URL-friendly alias        |
| name        | TEXT           | Display name                      |
| description | TEXT           | Forum description                 |
| created_at  | TIMESTAMPTZ    | Creation timestamp                |
| updated_at  | TIMESTAMPTZ    | Update timestamp                  |

**Triggers:**  
- `_100_timestamps`: For maintaining timestamps.

**Row Level Security & Policies:**  
- Admins required for insert/update/delete.
- All users may read forums.

### 3. Topics (`app_public.topics`)
Stores threads authored by users within forums.

| Column      | Type         | Description                                              |
|-------------|--------------|---------------------------------------------------------|
| id          | SERIAL PK    | Topic identifier                                        |
| forum_id    | INT FK       | References parent forum                                 |
| author_id   | INT FK       | References user, defaults to current logged in user     |
| title       | TEXT         | Topic headline                                          |
| body        | TEXT         | Initial post content                                    |
| created_at  | TIMESTAMPTZ  | Created timestamp                                       |
| updated_at  | TIMESTAMPTZ  | Last update timestamp                                   |

**Triggers:**  
- `_100_timestamps`: Maintains timestamps.

**Row Level Security & Policies:**  
- Select: Allowed for all.
- Mutations: Custom to user role.

### 4. Posts (`app_public.posts`)
Individual replies in topics.

| Column      | Type         | Description                                              |
|-------------|--------------|---------------------------------------------------------|
| id          | SERIAL PK    | Post identifier                                         |
| topic_id    | INT FK       | References topic                                        |
| author_id   | INT FK       | References posting user                                 |
| body        | TEXT         | Post content                                            |
| created_at  | TIMESTAMPTZ  | Created timestamp                                       |
| updated_at  | TIMESTAMPTZ  | Last update timestamp                                   |

**Indices for performance:**  
- `topics_forum_id`, `topics_author_id`, `posts_author_id`, `posts_topic_id` for fast lookup.

### Example Initialization (from migrations)

Initial demo data for forums, topics, and posts:

```sql
insert into app_public.forums(slug, name, description) values
  ('testimonials', 'Testimonials', 'How do you rate PostGraphile?'),
  ('feedback', 'Feedback', 'How are you finding PostGraphile?'),
  ('cat-life', 'Cat Life', 'A forum all about cats and cat stories'),
  ('cat-help', 'Cat Help', 'Advice for troublesome cats');

insert into app_public.topics(forum_id, author_id, title, body) values
  (1, 2, 'Thank you!', '500-1500 requests per second on a single server is pretty awesome.'),
  (1, 4, 'PostGraphile is powerful', 'PostGraphile is powerful and elegant.'),
  (3, 1, 'I love cats!', 'They''re the best!');

insert into app_public.posts(topic_id, author_id, body) values
  (1, 1, 'Super pleased with the performance - thanks!'),
  (2, 1, 'Thanks so much!'),
  (4, 1, 'Don''t you just love cats?');
```

### Core Triggers & Security

- All core tables have timestamp triggers to maintain audit consistency.
- Policies based on current user ID and admin status restrict data access,
  providing a safe multi-user environment.
- Additional RLS and trigger logic in committed migrations ensures jobs/tasks
  are tracked, performance is optimized, and no sensitive data is exposed in GraphQL.

**See ["libs/database/migrations/committed"](https://github.com/dhananjay-jadhav/forum/tree/main/libs/database/migrations/committed) for the complete schema history and advanced logic.**


## Quick Start

##Yarn

- Docker

### Installation

```bash
# Install dependencies
yarn install
```

### Running the Database

In a separate terminal, start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start a PostgreSQL container and expose it on port `5432`.

### Configuration

Create a `.env` file in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

The default `DATABASE_URL` in `.env.example` is configured to work with the `docker-compose` setup.

### Running the Application

```bash
# Development mode with hot reload
yarn start api

# Build for production
yarn build api

# Run unit tests
yarn test utils
yarn test database

# Run e2e tests
yarn e2e api-build

# Run e2e tests
yarn api:e2e
```

## API Endpoints

| Endpoint    | Description                     |
| ----------- | ------------------------------- |
| `/graphql`  | GraphQL API endpoint            |
| `/graphiql` | GraphiQL IDE (development only) |
| `/api`      | API info endpoint               |
| `/live`     | Kubernetes liveness probe       |
| `/health`   | Comprehensive health check      |
| `/ready`    | Kubernetes readiness probe      |

## Performance

### Benchmark Results

> **Test Environment**: MacBook Air M1, Node.js v20, PostgreSQL 15  
> **Test Parameters**: 10 concurrent connections, 10 seconds duration

#### REST API Performance

| Endpoint  | Req/sec | Avg Latency | P99 Latency | Throughput |
| --------- | ------- | ----------- | ----------- | ---------- |
| `/live`   | 42,182  | 0.01 ms     | < 1 ms.     | 26 MB/s    |
| `/ready`  | 16,529  | 0.02 ms     | 1 ms        | 10 MB/s    |
| `/health` | 15,238  | 0.03 ms     | 1 ms        | 12 MB/s    |
| `/api`    | 11,350  | 0.18 ms     | 2 ms        | 20 MB/s    |

#### GraphQL Performance

| Query         | Req/sec | Avg Latency | P99 Latency | Throughput |
| ------------- | ------- | ----------- | ----------- | ---------- |
| Simple Query  | 28,138  | 0.03 ms     | 1 ms        | 21 MB/s    |
| Introspection | 22,205  | 0.04 ms     | 2 ms        | 24 MB/s    |

#### Key Metrics

- ⚡ **Peak Throughput**: 42,182 req/s (liveness endpoint)
- 🚀 **GraphQL Throughput**: 28,138 req/s (simple queries)
- 📊 **P99 Latency**: < 2ms for all endpoints
- ✅ **Error Rate**: 0%

### Running Performance Tests

```bash
# Start the API server
yarn start

# Run all performance tests
yarn perf:test

# Run specific test(s)
yarn perf:run health
yarn perf:run health,live,graphql_typename

# Run by category
yarn perf:rest
yarn perf:graphql

# Stress test (100 connections, 60 seconds)
yarn perf:stress
```

See [performance/README.md](performance/README.md) for detailed documentation.

## Environment Variables

| Variable              | Description                          | Default                                                |
| --------------------- | ------------------------------------ | ------------------------------------------------------ |
| `NODE_ENV`            | Environment (development/production) | `development`                                          |
| `PORT`                | Server port                          | `3000`                                                 |
| `APP_NAME`            | Application name for logging         | `postgraphile-api`                                     |
| `LOG_LEVEL`           | Logging level                        | `info`                                                 |
| `DATABASE_URL`        | PostgreSQL connection string         | `postgres://postgres:postgres@localhost:5432/postgres` |
| `DATABASE_SCHEMAS`    | Comma-separated schema names         | `public`                                               |
| `DATABASE_POOL_MAX`   | Maximum pool connections             | `20`                                                   |
| `DATABASE_POOL_MIN`   | Minimum pool connections             | `2`                                                    |
| `DATABASE_SSL`        | Enable SSL connection                | `false`                                                |
| `JWT_SECRET`          | Secret for JWT authentication        | -                                                      |
| `RATE_LIMIT_MAX`      | Max requests per window              | `100`                                                  |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window in milliseconds    | `60000`                                                |
| `GRAPHQL_DEPTH_LIMIT` | Maximum GraphQL query depth          | `10`                                                   |
| `GRAPHQL_COST_LIMIT`  | Maximum GraphQL query cost           | `1000`                                                 |
| `SHUTDOWN_TIMEOUT`    | Graceful shutdown timeout (ms)       | `10000`                                                |
| `KEEP_ALIVE_TIMEOUT`  | HTTP keep-alive timeout (ms)         | `65000`                                                |

## Libraries

### @app/database

Database connection pool and configuration.

```typescript
import { getPool, query, withTransaction, closePool } from '@app/database';

// Execute a query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Use transactions
await withTransaction(async client => {
    await client.query('INSERT INTO ...');
    await client.query('UPDATE ...');
});
```

### @app/utils

Shared utilities including logging, configuration, and health checks.

```typescript
import { logger, env, registerHealthCheck } from '@app/utils';

// Structured logging
logger.info({ userId }, 'User logged in');

// Access validated environment
console.log(env.DATABASE_URL);

// Register custom health checks
registerHealthCheck('redis', async () => {
    // Check redis connection
    return { healthy: true, latencyMs: 5 };
});
```

### @app/gql

PostGraphile configuration and plugins.

```typescript
import { preset } from '@app/gql';
import { postgraphile } from 'postgraphile';

const pgl = postgraphile(preset);
```

## Scripts

| Script                  | Description                        |
| ----------------------- | ---------------------------------- |
| `yarn start api`        | Start development server           |
| `yarn build api`        | Build the API for production       |
| `yarn api:e2e`          | Run e2e tests for the API          |
| `yarn lint`             | Run linting on all projects        |
| `yarn test <lib>`       | Run unit tests for a library       |
| `yarn all:test`         | Run tests for all projects         |
| `yarn all:build`        | Build all projects                 |
| `yarn format`           | Format code with Prettier          |
| `yarn db:up`            | Start PostgreSQL via Docker        |
| `yarn db:down`          | Stop and remove PostgreSQL         |
| `yarn db:logs`          | View PostgreSQL container logs     |
| `yarn perf:test`        | Run all performance tests          |
| `yarn perf:list`        | List available performance tests   |
| `yarn perf:run <tests>` | Run specific test(s)               |
| `yarn perf:rest`        | Run REST endpoint tests            |
| `yarn perf:graphql`     | Run GraphQL tests                  |
| `yarn perf:stress`      | Stress test (100 connections, 60s) |

```dockerfile
# Stage 1: Build the application
FROM node:24 as builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY .yarn ./
RUN yarn install --immutable
COPY . .
RUN npx nx build api

# Stage 2: Create the final production image
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/api/package.json ./
COPY --from=builder /app/dist/apps/api/yarn.lock ./
RUN yarn workspaces focus --all --production
COPY --from=builder /app/dist/apps/api .
EXPOSE 3000
CMD ["node", "main.js"]
```

### Health Checks

The application exposes three health endpoints for Kubernetes:

- **`/live`** - Liveness probe (is the process running?)
- **`/ready`** - Readiness probe (is the app ready to serve traffic?)
- **`/health`** - Detailed health report with all component statuses

Example Kubernetes configuration:

```yaml
livenessProbe:
    httpGet:
        path: /live
        port: 3000
    initialDelaySeconds: 10
    periodSeconds: 10
readinessProbe:
    httpGet:
        path: /ready
        port: 3000
    initialDelaySeconds: 5
    periodSeconds: 5
```

## License

MIT

- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
