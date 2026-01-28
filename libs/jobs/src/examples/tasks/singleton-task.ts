/**
 * Example: Singleton Task with Job Key
 *
 * Demonstrates using jobKey for deduplication.
 * Ensures only one instance of a job runs at a time.
 */

import type { JobHelpers } from 'graphile-worker';

import { addJob, removeJob } from '../../lib/queue.js';
import type { TypedTask } from '../../lib/types.js';

export interface SingletonTaskPayload {
    taskName: string;
    params?: Record<string, unknown>;
}

export const SINGLETON_TASK = 'singleton-task';
export const REFRESH_CACHE_TASK = 'refresh-cache';
export const CLEANUP_SESSIONS_TASK = 'cleanup-sessions';

/**
 * Generic singleton task handler
 */
export const singletonTask: TypedTask<SingletonTaskPayload> = async (
    payload: SingletonTaskPayload,
    helpers: JobHelpers
) => {
    helpers.logger.info(`Executing singleton task: ${payload.taskName}`);

    switch (payload.taskName) {
        case REFRESH_CACHE_TASK:
            await refreshCache(helpers);
            break;
        case CLEANUP_SESSIONS_TASK:
            await cleanupSessions(helpers);
            break;
        default:
            helpers.logger.warn(`Unknown singleton task: ${payload.taskName}`);
    }

    helpers.logger.info('Singleton task completed');
};

async function refreshCache(helpers: JobHelpers): Promise<void> {
    helpers.logger.info('Refreshing application cache');

    // Simulate cache refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));

    helpers.logger.info('Cache refreshed');
}

async function cleanupSessions(helpers: JobHelpers): Promise<void> {
    helpers.logger.info('Cleaning up expired sessions');

    // Simulate session cleanup
    await new Promise((resolve) => setTimeout(resolve, 500));

    helpers.logger.info('Sessions cleaned up');
}

/**
 * Queue a singleton task with deduplication
 * Uses jobKey to ensure only one instance is queued
 */
export async function queueSingletonTask(
    taskName: string,
    params?: Record<string, unknown>
): Promise<{ id: string }> {
    const jobKey = `singleton:${taskName}`;

    return addJob<SingletonTaskPayload>(
        SINGLETON_TASK,
        { taskName, params },
        {
            jobKey,
            // 'replace' will update existing job with new payload
            // 'preserve_run_at' keeps original schedule
            // 'unsafe_dedupe' ignores if job exists
            jobKeyMode: 'preserve_run_at',
        }
    );
}

/**
 * Cancel a pending singleton task
 */
export async function cancelSingletonTask(taskName: string): Promise<boolean> {
    const jobKey = `singleton:${taskName}`;
    return removeJob(jobKey);
}
