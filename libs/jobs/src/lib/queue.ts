/**
 * Job Queue Management
 *
 * Functions for adding and managing jobs using Graphile Worker.
 */

import { env } from '@app/utils';
import { makeWorkerUtils, type WorkerUtils } from 'graphile-worker';

import type { AddJobOptions } from './types.js';

let workerUtils: WorkerUtils | null = null;

/**
 * Get or create WorkerUtils instance
 * WorkerUtils provides methods for adding jobs without running a worker
 */
export async function getWorkerUtils(): Promise<WorkerUtils> {
    if (!workerUtils) {
        workerUtils = await makeWorkerUtils({
            connectionString: env.DATABASE_URL,
        });
    }
    return workerUtils;
}

/**
 * Release the WorkerUtils connection
 * Call this on application shutdown
 */
export async function releaseWorkerUtils(): Promise<void> {
    if (workerUtils) {
        await workerUtils.release();
        workerUtils = null;
    }
}

/**
 * Add a job to the queue
 *
 * @param taskIdentifier - The task type identifier
 * @param payload - The job payload data
 * @param options - Job options
 * @returns The created job
 */
export async function addJob<TPayload = unknown>(
    taskIdentifier: string,
    payload: TPayload,
    options?: AddJobOptions
): Promise<{ id: string }> {
    const utils = await getWorkerUtils();

    const job = await utils.addJob(taskIdentifier, payload as object, {
        queueName: options?.queueName,
        runAt: options?.runAt,
        maxAttempts: options?.maxAttempts,
        priority: options?.priority,
        jobKey: options?.jobKey,
        jobKeyMode: options?.jobKeyMode,
        flags: options?.flags,
    });

    return { id: String(job.id) };
}

/**
 * Schedule a job to run at a specific time
 *
 * @param taskIdentifier - The task type identifier
 * @param payload - The job payload data
 * @param runAt - When to run the job
 * @param queueName - Optional queue name for serial processing
 * @returns The created job
 */
export async function scheduleJob<TPayload = unknown>(
    taskIdentifier: string,
    payload: TPayload,
    runAt: Date,
    queueName?: string
): Promise<{ id: string }> {
    return addJob(taskIdentifier, payload, { runAt, queueName });
}

/**
 * Add a job with deduplication
 * If a job with the same jobKey exists, it will be updated or ignored based on jobKeyMode
 *
 * @param taskIdentifier - The task type identifier
 * @param payload - The job payload data
 * @param jobKey - Unique key for deduplication
 * @param options - Additional job options
 * @returns The created or existing job
 */
export async function addUniqueJob<TPayload = unknown>(
    taskIdentifier: string,
    payload: TPayload,
    jobKey: string,
    options?: Omit<AddJobOptions, 'jobKey'>
): Promise<{ id: string }> {
    return addJob(taskIdentifier, payload, {
        ...options,
        jobKey,
        jobKeyMode: options?.jobKeyMode ?? 'preserve_run_at',
    });
}

/**
 * Remove a job by its key
 * 
 * Note: Graphile Worker doesn't have a direct removeJob method on WorkerUtils.
 * To remove a job, you can mark it as completed using completeJobs.
 *
 * @param jobKey - The job key to remove (actually completes the job)
 * @returns True if a job was removed
 */
export async function removeJob(jobKey: string): Promise<boolean> {
    const utils = await getWorkerUtils();
    const result = await utils.completeJobs([jobKey]);
    return result.length > 0;
}

/**
 * Complete a list of jobs by their keys
 *
 * @param jobKeys - Array of job keys to complete
 */
export async function completeJobs(jobKeys: string[]): Promise<void> {
    const utils = await getWorkerUtils();
    await utils.completeJobs(jobKeys);
}

/**
 * Permanently fail jobs by their keys
 *
 * @param jobKeys - Array of job keys to fail
 * @param reason - Reason for failure
 */
export async function permanentlyFailJobs(
    jobKeys: string[],
    reason: string
): Promise<void> {
    const utils = await getWorkerUtils();
    await utils.permanentlyFailJobs(jobKeys, reason);
}

/**
 * Reschedule jobs by their keys
 *
 * @param jobKeys - Array of job keys to reschedule
 * @param runAt - New run time
 */
export async function rescheduleJobs(
    jobKeys: string[],
    runAt: Date
): Promise<void> {
    const utils = await getWorkerUtils();
    await utils.rescheduleJobs(jobKeys, { runAt });
}
