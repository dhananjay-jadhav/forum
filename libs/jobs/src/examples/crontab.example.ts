/**
 * Example: Crontab Configuration
 *
 * Graphile Worker supports crontab-style scheduled jobs.
 * This file shows how to configure recurring tasks.
 *
 * @see https://worker.graphile.org/docs/cron
 */

/**
 * Crontab format:
 * ┌───────────── minute (0 - 59)
 * │ ┌───────────── hour (0 - 23)
 * │ │ ┌───────────── day of month (1 - 31)
 * │ │ │ ┌───────────── month (1 - 12)
 * │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
 * │ │ │ │ │
 * * * * * * task_identifier {payload}
 */

/**
 * Example crontab entries
 *
 * Create a file named `crontab` in your project root or specify via config.
 */
export const EXAMPLE_CRONTAB = `
# Run daily cleanup at 3 AM
0 3 * * * singleton-task {"taskName":"cleanup-sessions"}

# Refresh cache every hour
0 * * * * singleton-task {"taskName":"refresh-cache"}

# Send weekly digest on Mondays at 9 AM
0 9 * * 1 send-email {"to":"admin@example.com","subject":"Weekly Digest","body":"Here is your weekly summary."}

# Process batch sync every day at midnight
0 0 * * * batch-processor {"operation":"sync-users","batchSize":100}
`.trim();

/**
 * To use crontab with Graphile Worker:
 *
 * 1. Create a file: `crontab` (no extension)
 * 2. Add your cron entries
 * 3. Pass to runner:
 *
 * ```typescript
 * import { run } from 'graphile-worker';
 * import { readFileSync } from 'fs';
 *
 * const crontab = readFileSync('./crontab', 'utf8');
 *
 * await run({
 *   connectionString: process.env.DATABASE_URL,
 *   taskList,
 *   crontab,
 * });
 * ```
 *
 * Or use parsedCronItems for programmatic control.
 */

/**
 * Programmatic cron configuration
 */
export const cronItems = [
    {
        task: 'singleton-task',
        pattern: '0 3 * * *', // 3 AM daily
        payload: { taskName: 'cleanup-sessions' },
        options: { backfillPeriod: 0 },
    },
    {
        task: 'singleton-task',
        pattern: '0 * * * *', // Every hour
        payload: { taskName: 'refresh-cache' },
        options: { backfillPeriod: 0 },
    },
];

/**
 * Example using programmatic cron:
 *
 * ```typescript
 * import { run, parseCronItems } from 'graphile-worker';
 *
 * const parsedCronItems = parseCronItems(cronItems);
 *
 * await run({
 *   connectionString: process.env.DATABASE_URL,
 *   taskList,
 *   parsedCronItems,
 * });
 * ```
 */
