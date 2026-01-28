/**
 * Graphile Worker Runner
 *
 * Functions for running the job worker.
 */

import { env, logger } from '@app/utils';
import { run, type Runner, type TaskList } from 'graphile-worker';

import type { TypedTask, WorkerConfig } from './types.js';

let runnerInstance: Runner | null = null;

const log = logger.child({ component: 'graphile-worker' });

/**
 * Create task list from typed task handlers
 */
export function createTaskList(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: Record<string, TypedTask<any>>
): TaskList {
    const taskList: TaskList = {};

    for (const [name, handler] of Object.entries(tasks)) {
        taskList[name] = async (payload, helpers): Promise<void> => {
            log.info({ task: name, jobId: helpers.job.id }, 'Processing job');
            try {
                await handler(payload, helpers);
                log.info({ task: name, jobId: helpers.job.id }, 'Job completed');
            } catch (error) {
                log.error(
                    { task: name, jobId: helpers.job.id, error },
                    'Job failed'
                );
                throw error;
            }
        };
    }

    return taskList;
}

/**
 * Start the Graphile Worker runner
 *
 * @param taskList - Map of task identifiers to handlers
 * @param config - Worker configuration
 * @returns The runner instance
 */
export async function startWorker(
    taskList: TaskList,
    config?: WorkerConfig
): Promise<Runner> {
    if (runnerInstance) {
        log.warn('Worker already running');
        return runnerInstance;
    }

    log.info(
        { concurrency: config?.concurrency ?? 5 },
        'Starting Graphile Worker'
    );

    runnerInstance = await run({
        connectionString: config?.connectionString ?? env.DATABASE_URL,
        concurrency: config?.concurrency ?? 5,
        pollInterval: config?.pollInterval ?? 1000,
        taskList,
        // Use custom schema if provided
        schema: config?.schema,
        // Crontab for scheduled jobs
        parsedCronItems: config?.crontab ? undefined : undefined,
        // Disable prepared statements if needed (for pgBouncer)
        noPreparedStatements: config?.noPreparedStatements ?? false,
    });

    // Handle graceful shutdown
    runnerInstance.events.on('pool:gracefulShutdown', () => {
        log.info('Worker shutting down gracefully');
    });

    runnerInstance.events.on('job:start', ({ job }) => {
        log.debug({ jobId: job.id, task: job.task_identifier }, 'Job started');
    });

    runnerInstance.events.on('job:success', ({ job }) => {
        log.debug({ jobId: job.id, task: job.task_identifier }, 'Job succeeded');
    });

    runnerInstance.events.on('job:error', ({ job, error }) => {
        log.error(
            { jobId: job.id, task: job.task_identifier, error },
            'Job error'
        );
    });

    runnerInstance.events.on('job:failed', ({ job, error }) => {
        log.error(
            { jobId: job.id, task: job.task_identifier, error },
            'Job permanently failed'
        );
    });

    log.info('Graphile Worker started');

    return runnerInstance;
}

/**
 * Stop the Graphile Worker runner
 */
export async function stopWorker(): Promise<void> {
    if (runnerInstance) {
        log.info('Stopping Graphile Worker');
        await runnerInstance.stop();
        runnerInstance = null;
        log.info('Graphile Worker stopped');
    }
}

/**
 * Get the current runner instance
 */
export function getRunner(): Runner | null {
    return runnerInstance;
}

/**
 * Check if the worker is running
 */
export function isWorkerRunning(): boolean {
    return runnerInstance !== null;
}
