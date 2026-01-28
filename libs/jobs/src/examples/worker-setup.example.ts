/**
 * Example: Complete Worker Setup
 *
 * Shows how to set up a Graphile Worker with all task handlers.
 */

import { logger } from '@app/utils';

import { releaseWorkerUtils } from '../lib/queue.js';
import { createTaskList, startWorker, stopWorker } from '../lib/worker.js';
import {
    BATCH_ITEM_TASK,
    BATCH_PROCESSOR_TASK,
    batchItemTask,
    batchProcessorTask,
    PROCESS_WEBHOOK_TASK,
    processWebhookTask,
    SEND_EMAIL_TASK,
    sendEmailTask,
    SINGLETON_TASK,
    singletonTask,
} from './tasks/index.js';

/**
 * All task handlers
 */
const tasks = {
    [SEND_EMAIL_TASK]: sendEmailTask,
    [PROCESS_WEBHOOK_TASK]: processWebhookTask,
    [BATCH_PROCESSOR_TASK]: batchProcessorTask,
    [BATCH_ITEM_TASK]: batchItemTask,
    [SINGLETON_TASK]: singletonTask,
};

/**
 * Main function to run the worker
 */
export async function runWorker(): Promise<void> {
    const log = logger.child({ component: 'job-worker' });

    log.info('Starting Graphile Worker');

    // Create task list with logging wrapper
    const taskList = createTaskList(tasks);

    // Start the worker
    const runner = await startWorker(taskList, {
        concurrency: 5,
        pollInterval: 1000,
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string): Promise<void> => {
        log.info({ signal }, 'Shutdown signal received');

        await stopWorker();
        await releaseWorkerUtils();

        log.info('Worker stopped gracefully');
        process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    log.info('Graphile Worker started and processing jobs');

    // The runner will keep the process alive
    await runner.promise;
}

/**
 * Get the task list for integration with your app
 */
export function getTaskList(): ReturnType<typeof createTaskList> {
    return createTaskList(tasks);
}

// Uncomment to run as standalone:
// runWorker().catch(console.error);
