/**
 * @app/cleanup
 *
 * Scheduled cleanup tasks for the forum application.
 */

// Types
export type {
    CleanupConfig,
    CleanupJobPayload,
    CleanupResult,
    CleanupSummary,
    CleanupTask,
} from './lib/types.js';

export { defaultCleanupConfig } from './lib/types.js';

// Individual tasks
export {
    cleanupExpiredTokens,
    cleanupOldJobs,
    cleanupOrphanedData,
    cleanupUnverifiedEmails,
} from './lib/tasks.js';

// Service
export { getCleanupCrontab, runAllCleanupTasks, runCleanupTask } from './lib/service.js';
