/**
 * @app/cleanup - Types
 *
 * Type definitions for scheduled cleanup tasks.
 */

/**
 * Cleanup task types
 */
export type CleanupTask =
    | 'expired_sessions'
    | 'unverified_emails'
    | 'expired_tokens'
    | 'old_jobs'
    | 'orphaned_data'
    | 'audit_logs';

/**
 * Cleanup result
 */
export interface CleanupResult {
    /** Task that was run */
    task: CleanupTask;
    /** Whether the cleanup succeeded */
    success: boolean;
    /** Number of items cleaned up */
    itemsRemoved: number;
    /** Duration in milliseconds */
    duration: number;
    /** Error message if failed */
    error?: string;
    /** Additional details */
    details?: Record<string, unknown>;
}

/**
 * Cleanup configuration
 */
export interface CleanupConfig {
    /** Delete unverified emails older than X hours */
    unverifiedEmailMaxAgeHours: number;
    /** Delete password reset tokens older than X hours */
    resetTokenMaxAgeHours: number;
    /** Delete completed jobs older than X days */
    completedJobMaxAgeDays: number;
    /** Delete failed jobs older than X days */
    failedJobMaxAgeDays: number;
    /** Delete audit logs older than X days */
    auditLogMaxAgeDays: number;
    /** Batch size for deletion operations */
    batchSize: number;
    /** Whether to use transactions */
    useTransactions: boolean;
}

/**
 * Default cleanup configuration
 */
export const defaultCleanupConfig: CleanupConfig = {
    unverifiedEmailMaxAgeHours: 72, // 3 days
    resetTokenMaxAgeHours: 24, // 1 day
    completedJobMaxAgeDays: 7, // 1 week
    failedJobMaxAgeDays: 30, // 1 month
    auditLogMaxAgeDays: 90, // 3 months
    batchSize: 1000,
    useTransactions: true,
};

/**
 * Cleanup job payload
 */
export interface CleanupJobPayload {
    /** Specific task to run, or 'all' for all tasks */
    task?: CleanupTask | 'all';
    /** Override configuration */
    config?: Partial<CleanupConfig>;
}

/**
 * Cleanup summary for all tasks
 */
export interface CleanupSummary {
    /** When the cleanup started */
    startedAt: Date;
    /** When the cleanup finished */
    finishedAt: Date;
    /** Total duration in milliseconds */
    totalDuration: number;
    /** Results for each task */
    results: CleanupResult[];
    /** Overall success (all tasks succeeded) */
    success: boolean;
    /** Total items removed across all tasks */
    totalItemsRemoved: number;
}
