/**
 * @app/jobs - Graphile Worker Integration
 *
 * A wrapper around Graphile Worker for reliable PostgreSQL-backed job processing.
 *
 * Features:
 * - Type-safe task handlers
 * - Job scheduling and deduplication
 * - Automatic retries with exponential backoff
 * - Crontab support for recurring jobs
 * - Graceful shutdown
 *
 * @see https://worker.graphile.org/
 */

// Types
export type {
    AddJobOptions,
    GraphileJob,
    JobHelpers,
    RunnerOptions,
    Task,
    TaskList,
    TaskSpec,
    TypedTask,
    WorkerConfig,
    WorkerStatus,
} from './types.js';

// Queue operations
export {
    addJob,
    addUniqueJob,
    completeJobs,
    getWorkerUtils,
    permanentlyFailJobs,
    releaseWorkerUtils,
    removeJob,
    rescheduleJobs,
    scheduleJob,
} from './queue.js';

// Worker operations
export {
    createTaskList,
    getRunner,
    isWorkerRunning,
    startWorker,
    stopWorker,
} from './worker.js';

// Forum-specific task handlers
export { forumCrontab, forumTaskList } from './tasks.js';

// Re-export useful graphile-worker utilities
export { quickAddJob, runMigrations } from 'graphile-worker';
