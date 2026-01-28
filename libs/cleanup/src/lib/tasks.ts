/**
 * @app/cleanup - Cleanup Tasks
 *
 * Individual cleanup task implementations.
 */

import { getPool } from '@app/database';
import { logger } from '@app/utils';

import type { CleanupConfig, CleanupResult, CleanupTask } from './types.js';
import { defaultCleanupConfig } from './types.js';

/**
 * Clean up expired/unverified email records
 */
export async function cleanupUnverifiedEmails(
    config: CleanupConfig = defaultCleanupConfig
): Promise<CleanupResult> {
    const startTime = Date.now();
    const task: CleanupTask = 'unverified_emails';
    const pool = getPool();

    try {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - config.unverifiedEmailMaxAgeHours);

        const result = await pool.query(
            `DELETE FROM app_public.user_emails 
             WHERE is_verified = false 
             AND created_at < $1
             RETURNING id`,
            [cutoffDate]
        );

        const itemsRemoved = result.rowCount || 0;

        logger.info({ task, itemsRemoved, cutoffDate }, 'Cleaned up unverified emails');

        return {
            task,
            success: true,
            itemsRemoved,
            duration: Date.now() - startTime,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, task }, 'Failed to clean up unverified emails');

        return {
            task,
            success: false,
            itemsRemoved: 0,
            duration: Date.now() - startTime,
            error: errorMessage,
        };
    }
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredTokens(
    config: CleanupConfig = defaultCleanupConfig
): Promise<CleanupResult> {
    const startTime = Date.now();
    const task: CleanupTask = 'expired_tokens';
    const pool = getPool();

    try {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - config.resetTokenMaxAgeHours);

        // Clean up from user_secrets table (password reset tokens)
        const result = await pool.query(
            `UPDATE app_private.user_secrets 
             SET password_reset_email_sent_at = NULL,
                 reset_password_token = NULL,
                 reset_password_token_generated = NULL
             WHERE reset_password_token_generated < $1
             AND reset_password_token IS NOT NULL
             RETURNING user_id`,
            [cutoffDate]
        );

        const itemsRemoved = result.rowCount || 0;

        logger.info({ task, itemsRemoved, cutoffDate }, 'Cleaned up expired tokens');

        return {
            task,
            success: true,
            itemsRemoved,
            duration: Date.now() - startTime,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, task }, 'Failed to clean up expired tokens');

        return {
            task,
            success: false,
            itemsRemoved: 0,
            duration: Date.now() - startTime,
            error: errorMessage,
        };
    }
}

/**
 * Clean up old completed/failed jobs from graphile_worker
 */
export async function cleanupOldJobs(
    config: CleanupConfig = defaultCleanupConfig
): Promise<CleanupResult> {
    const startTime = Date.now();
    const task: CleanupTask = 'old_jobs';
    const pool = getPool();

    try {
        let totalRemoved = 0;

        // Clean up completed jobs
        const completedCutoff = new Date();
        completedCutoff.setDate(completedCutoff.getDate() - config.completedJobMaxAgeDays);

        // Note: graphile_worker removes completed jobs automatically,
        // but we might have a custom jobs table in app_jobs schema
        const completedResult = await pool.query(
            `DELETE FROM app_jobs.jobs 
             WHERE status = 'completed' 
             AND completed_at < $1
             RETURNING id`,
            [completedCutoff]
        );
        totalRemoved += completedResult.rowCount || 0;

        // Clean up failed jobs
        const failedCutoff = new Date();
        failedCutoff.setDate(failedCutoff.getDate() - config.failedJobMaxAgeDays);

        const failedResult = await pool.query(
            `DELETE FROM app_jobs.jobs 
             WHERE status = 'failed' 
             AND completed_at < $1
             RETURNING id`,
            [failedCutoff]
        );
        totalRemoved += failedResult.rowCount || 0;

        logger.info(
            { task, itemsRemoved: totalRemoved, completedCutoff, failedCutoff },
            'Cleaned up old jobs'
        );

        return {
            task,
            success: true,
            itemsRemoved: totalRemoved,
            duration: Date.now() - startTime,
            details: {
                completedRemoved: completedResult.rowCount || 0,
                failedRemoved: failedResult.rowCount || 0,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, task }, 'Failed to clean up old jobs');

        return {
            task,
            success: false,
            itemsRemoved: 0,
            duration: Date.now() - startTime,
            error: errorMessage,
        };
    }
}

/**
 * Clean up orphaned data (e.g., user_authentications without users)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function cleanupOrphanedData(_config: CleanupConfig = defaultCleanupConfig): Promise<CleanupResult> {
    const startTime = Date.now();
    const task: CleanupTask = 'orphaned_data';
    const pool = getPool();

    try {
        let totalRemoved = 0;

        // Clean up user_authentications without corresponding users
        // This shouldn't happen with proper foreign keys, but just in case
        const authResult = await pool.query(
            `DELETE FROM app_public.user_authentications ua
             WHERE NOT EXISTS (
                 SELECT 1 FROM app_public.users u WHERE u.id = ua.user_id
             )
             RETURNING id`
        );
        totalRemoved += authResult.rowCount || 0;

        // Clean up user_emails without corresponding users
        const emailResult = await pool.query(
            `DELETE FROM app_public.user_emails ue
             WHERE NOT EXISTS (
                 SELECT 1 FROM app_public.users u WHERE u.id = ue.user_id
             )
             RETURNING id`
        );
        totalRemoved += emailResult.rowCount || 0;

        logger.info({ task, itemsRemoved: totalRemoved }, 'Cleaned up orphaned data');

        return {
            task,
            success: true,
            itemsRemoved: totalRemoved,
            duration: Date.now() - startTime,
            details: {
                orphanedAuths: authResult.rowCount || 0,
                orphanedEmails: emailResult.rowCount || 0,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, task }, 'Failed to clean up orphaned data');

        return {
            task,
            success: false,
            itemsRemoved: 0,
            duration: Date.now() - startTime,
            error: errorMessage,
        };
    }
}
