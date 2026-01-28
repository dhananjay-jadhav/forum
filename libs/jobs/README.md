# @app/jobs

A wrapper around [Graphile Worker](https://worker.graphile.org/) for reliable PostgreSQL-backed job processing.

## Features

- **Reliable job processing** - Jobs are persisted in PostgreSQL with automatic retries
- **Type-safe task handlers** - Full TypeScript support with typed payloads
- **Job deduplication** - Use `jobKey` to prevent duplicate jobs
- **Scheduled jobs** - Queue jobs to run at a specific time
- **Crontab support** - Define recurring jobs using cron syntax
- **Concurrent processing** - Configure worker concurrency
- **Graceful shutdown** - Proper cleanup on process termination

## Installation

```bash
yarn add graphile-worker
```

## Quick Start

### 1. Run migrations

```bash
npx graphile-worker --connection postgres://localhost/mydb --schema-only
```

### 2. Define a task

```typescript
import type { TypedTask } from '@app/jobs';

interface SendEmailPayload {
    to: string;
    subject: string;
    body: string;
}

export const sendEmailTask: TypedTask<SendEmailPayload> = async (payload, helpers) => {
    helpers.logger.info(`Sending email to ${payload.to}`);
    await sendEmail(payload);
    helpers.logger.info('Email sent!');
};
```

### 3. Add jobs

```typescript
import { addJob, scheduleJob } from '@app/jobs';

// Add a job to run immediately
await addJob('send-email', {
    to: 'user@example.com',
    subject: 'Welcome!',
    body: 'Thanks for signing up.',
});

// Schedule a job for later
await scheduleJob('send-email', payload, new Date('2025-01-01T10:00:00Z'));

// Add a unique job (deduplicated by key)
await addJob('send-reminder', payload, {
    jobKey: `reminder:user:${userId}`,
    jobKeyMode: 'preserve_run_at',
});
```

### 4. Start the worker

```typescript
import { startWorker, createTaskList, stopWorker } from '@app/jobs';

const taskList = createTaskList({
    'send-email': sendEmailTask,
    'process-order': processOrderTask,
});

await startWorker(taskList, { concurrency: 5 });

// On shutdown
await stopWorker();
```

## API Reference

### Queue Functions

| Function | Description |
|----------|-------------|
| `addJob(task, payload, options?)` | Add a job to the queue |
| `scheduleJob(task, payload, runAt, queueName?)` | Schedule a job |
| `addUniqueJob(task, payload, jobKey, options?)` | Add with deduplication |
| `removeJob(jobKey)` | Remove a job by key |
| `completeJobs(jobKeys)` | Mark jobs as complete |
| `permanentlyFailJobs(jobKeys, reason)` | Permanently fail jobs |
| `rescheduleJobs(jobKeys, runAt)` | Reschedule jobs |

### Worker Functions

| Function | Description |
|----------|-------------|
| `startWorker(taskList, config?)` | Start the worker |
| `stopWorker()` | Stop the worker gracefully |
| `createTaskList(tasks)` | Create task list with logging |
| `isWorkerRunning()` | Check if worker is running |

### Job Options

```typescript
interface AddJobOptions {
    queueName?: string;      // For serial processing
    runAt?: Date;            // When to run
    maxAttempts?: number;    // Max retry attempts
    priority?: number;       // Lower = higher priority
    jobKey?: string;         // For deduplication
    jobKeyMode?: 'replace' | 'preserve_run_at' | 'unsafe_dedupe';
    flags?: string[];        // Custom flags
}
```

## Examples

See [src/examples/](./src/examples/) for complete examples:

- **send-email.task.ts** - Basic email task with typed payload
- **process-webhook.task.ts** - Webhook processing with routing
- **batch-processor.task.ts** - Fan-out pattern for batch jobs
- **singleton-task.ts** - Using jobKey for deduplication
- **crontab.example.ts** - Scheduled recurring jobs
- **worker-setup.example.ts** - Complete worker setup
- **api-integration.example.ts** - Express/PostGraphile integration

## Crontab Support

```
# Run at 3 AM daily
0 3 * * * cleanup-task {}

# Run every hour
0 * * * * refresh-cache {"taskName":"refresh-cache"}

# Run on Mondays at 9 AM
0 9 * * 1 send-digest {}
```

## Links

- [Graphile Worker Documentation](https://worker.graphile.org/)
- [GitHub Repository](https://github.com/graphile/worker)
