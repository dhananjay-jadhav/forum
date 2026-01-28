/**
 * Graphile Worker Types
 *
 * Re-exports and custom types for working with Graphile Worker.
 */

import type {
    Job as GraphileJob,
    JobHelpers,
    RunnerOptions,
    Task,
    TaskList,
    TaskSpec,
} from 'graphile-worker';

// Re-export Graphile Worker types
export type { GraphileJob, JobHelpers, RunnerOptions, Task, TaskList, TaskSpec };

/**
 * Typed task handler with payload
 * Note: The payload type parameter is for documentation purposes;
 * at runtime, payload is cast from unknown.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedTask<TPayload = any> = (
    payload: TPayload,
    helpers: JobHelpers
) => Promise<void>;

/**
 * Options for adding a job
 */
export interface AddJobOptions {
    /** Queue name for serial processing */
    queueName?: string;
    /** When to run the job */
    runAt?: Date;
    /** Maximum attempts before giving up */
    maxAttempts?: number;
    /** Job priority (lower = higher priority) */
    priority?: number;
    /** Job key for deduplication */
    jobKey?: string;
    /** Job key mode: 'replace', 'preserve_run_at', 'unsafe_dedupe' */
    jobKeyMode?: 'replace' | 'preserve_run_at' | 'unsafe_dedupe';
    /** Flags for the job */
    flags?: string[];
}

/**
 * Worker configuration options
 */
export interface WorkerConfig {
    /** Database connection string */
    connectionString?: string;
    /** Maximum concurrent jobs */
    concurrency?: number;
    /** Poll interval in milliseconds */
    pollInterval?: number;
    /** Schema to use for jobs (default: graphile_worker) */
    schema?: string;
    /** Crontab entries for scheduled jobs */
    crontab?: string;
    /** Task directory for file-based tasks */
    taskDirectory?: string;
    /** Disable prepared statements (for pgBouncer) */
    noPreparedStatements?: boolean;
}

/**
 * Worker status information
 */
export interface WorkerStatus {
    isRunning: boolean;
    concurrency: number;
}
