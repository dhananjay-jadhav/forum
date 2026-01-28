/**
 * Example: Batch Processor Task
 *
 * Demonstrates the "fan-out" pattern using Graphile Worker.
 * A parent job spawns multiple child jobs for parallel processing.
 */

import type { JobHelpers } from 'graphile-worker';

import { addJob } from '../../lib/queue.js';
import type { TypedTask } from '../../lib/types.js';

export interface BatchProcessorPayload {
    operation: 'sync-users' | 'update-stats' | 'cleanup-old-data';
    batchSize: number;
    totalCount?: number;
}

export interface BatchItemPayload {
    operation: string;
    offset: number;
    limit: number;
    parentJobId: string;
}

export const BATCH_PROCESSOR_TASK = 'batch-processor';
export const BATCH_ITEM_TASK = 'batch-item';

/**
 * Main batch processor - splits work into smaller chunks
 */
export const batchProcessorTask: TypedTask<BatchProcessorPayload> = async (
    payload: BatchProcessorPayload,
    helpers: JobHelpers
) => {
    const { operation, batchSize, totalCount = 1000 } = payload;

    helpers.logger.info(
        `Starting batch processor: ${operation}, total: ${totalCount}, batchSize: ${batchSize}`
    );

    // Calculate number of batches
    const numBatches = Math.ceil(totalCount / batchSize);

    helpers.logger.info(`Creating ${numBatches} batch jobs`);

    // Create batch jobs
    for (let i = 0; i < numBatches; i++) {
        const offset = i * batchSize;

        await addJob<BatchItemPayload>(
            BATCH_ITEM_TASK,
            {
                operation,
                offset,
                limit: batchSize,
                parentJobId: String(helpers.job.id),
            },
            {
                // Use queue to process batches serially
                queueName: `batch-${operation}-${helpers.job.id}`,
            }
        );
    }

    helpers.logger.info(`${numBatches} batch jobs created`);
};

/**
 * Individual batch item processor
 */
export const batchItemTask: TypedTask<BatchItemPayload> = async (
    payload: BatchItemPayload,
    helpers: JobHelpers
) => {
    const { operation, offset, limit, parentJobId } = payload;

    helpers.logger.info(
        `Processing batch: ${operation}, offset: ${offset}, limit: ${limit}, parent: ${parentJobId}`
    );

    // Simulate batch processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    helpers.logger.info(`Batch processed successfully`);
};

/**
 * Start a batch processing operation
 */
export async function startBatchOperation(
    operation: BatchProcessorPayload['operation'],
    options?: { batchSize?: number; totalCount?: number }
): Promise<{ id: string }> {
    return addJob<BatchProcessorPayload>(BATCH_PROCESSOR_TASK, {
        operation,
        batchSize: options?.batchSize ?? 100,
        totalCount: options?.totalCount,
    });
}
