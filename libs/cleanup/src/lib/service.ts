/**
 * @app/cleanup - Cleanup Service
 *
 * Main cleanup service that orchestrates cleanup tasks.
 */

import { logger } from '@app/utils';

import {
    cleanupExpiredTokens,
    cleanupOldJobs,
    cleanupOrphanedData,
    cleanupUnverifiedEmails,
} from './tasks.js';
import type { CleanupConfig, CleanupResult, CleanupSummary, CleanupTask } from './types.js';
import { defaultCleanupConfig } from './types.js';

/**
 * Run a specific cleanup task
 */
export async function runCleanupTask(
    task: CleanupTask,
    config: CleanupConfig = defaultCleanupConfig
): Promise<CleanupResult> {
    logger.info({ task }, 'Running cleanup task');

    switch (task) {
        case 'unverified_emails':
            return cleanupUnverifiedEmails(config);
        case 'expired_tokens':
            return cleanupExpiredTokens(config);
        case 'old_jobs':
            return cleanupOldJobs(config);
        case 'orphaned_data':
            return cleanupOrphanedData(config);
        case 'expired_sessions':
            // Sessions are typically handled by session store
            return {
                task,
                success: true,
                itemsRemoved: 0,
                duration: 0,
                details: { skipped: 'Sessions handled by session store' },
            };
        case 'audit_logs':
            // Audit log cleanup would be implemented when audit logging is added
            return {
                task,
                success: true,
                itemsRemoved: 0,
                duration: 0,
                details: { skipped: 'Audit logging not yet implemented' },
            };
        default:
            return {
                task: task as CleanupTask,
                success: false,
                itemsRemoved: 0,
                duration: 0,
                error: `Unknown cleanup task: ${String(task)}`,
            };
    }
}

/**
 * Run all cleanup tasks
 */
export async function runAllCleanupTasks(
    config: CleanupConfig = defaultCleanupConfig
): Promise<CleanupSummary> {
    const startedAt = new Date();
    logger.info('Starting all cleanup tasks');

    const tasks: CleanupTask[] = [
        'unverified_emails',
        'expired_tokens',
        'old_jobs',
        'orphaned_data',
    ];

    const results: CleanupResult[] = [];

    for (const task of tasks) {
        try {
            const result = await runCleanupTask(task, config);
            results.push(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({
                task,
                success: false,
                itemsRemoved: 0,
                duration: 0,
                error: errorMessage,
            });
        }
    }

    const finishedAt = new Date();
    const totalDuration = finishedAt.getTime() - startedAt.getTime();
    const success = results.every(r => r.success);
    const totalItemsRemoved = results.reduce((sum, r) => sum + r.itemsRemoved, 0);

    const summary: CleanupSummary = {
        startedAt,
        finishedAt,
        totalDuration,
        results,
        success,
        totalItemsRemoved,
    };

    logger.info(
        {
            success,
            totalDuration,
            totalItemsRemoved,
            taskCount: results.length,
            failedCount: results.filter(r => !r.success).length,
        },
        'All cleanup tasks completed'
    );

    return summary;
}

/**
 * Schedule cleanup tasks (returns crontab entries for graphile-worker)
 */
export function getCleanupCrontab(): string {
    // Run daily cleanup at 3 AM
    return `
# Daily cleanup tasks
0 3 * * * cleanup__run_all ?max=1
    `.trim();
}
