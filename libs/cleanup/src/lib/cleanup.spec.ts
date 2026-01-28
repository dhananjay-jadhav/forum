/**
 * @app/cleanup - Unit Tests
 *
 * Unit tests for cleanup tasks including expired tokens and unverified accounts.
 */

import {
    cleanupUnverifiedEmails,
    cleanupExpiredTokens,
    cleanupOldJobs,
    cleanupOrphanedData,
} from './tasks.js';
import { runCleanupTask, runAllCleanupTasks, getCleanupCrontab } from './service.js';
import { getPool } from '@app/database';

jest.mock('@app/database');

describe('@app/cleanup', () => {
    const mockQuery = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (getPool as jest.Mock).mockReturnValue({ query: mockQuery });
    });

    describe('Cleanup Tasks', () => {
        describe('cleanupUnverifiedEmails', () => {
            it('should delete unverified emails older than configured hours', async () => {
                mockQuery.mockResolvedValue({ rowCount: 5 });

                const result = await cleanupUnverifiedEmails();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(5);
                expect(result.task).toBe('unverified_emails');
                expect(mockQuery).toHaveBeenCalledWith(
                    expect.stringContaining('DELETE FROM app_public.user_emails'),
                    expect.any(Array)
                );
            });

            it('should handle no items to clean', async () => {
                mockQuery.mockResolvedValue({ rowCount: 0 });

                const result = await cleanupUnverifiedEmails();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(0);
            });

            it('should handle database errors', async () => {
                mockQuery.mockRejectedValue(new Error('Database error'));

                const result = await cleanupUnverifiedEmails();

                expect(result.success).toBe(false);
                expect(result.error).toBe('Database error');
            });
        });

        describe('cleanupExpiredTokens', () => {
            it('should clear expired password reset tokens', async () => {
                mockQuery.mockResolvedValue({ rowCount: 3 });

                const result = await cleanupExpiredTokens();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(3);
                expect(result.task).toBe('expired_tokens');
                // The actual implementation uses UPDATE, not DELETE
                expect(mockQuery).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE app_private.user_secrets'),
                    expect.any(Array)
                );
            });

            it('should handle no expired tokens', async () => {
                mockQuery.mockResolvedValue({ rowCount: 0 });

                const result = await cleanupExpiredTokens();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(0);
            });
        });

        describe('cleanupOldJobs', () => {
            it('should delete old completed and failed jobs', async () => {
                // Mock returns for completed and failed job deletions
                mockQuery
                    .mockResolvedValueOnce({ rowCount: 10 }) // completed jobs
                    .mockResolvedValueOnce({ rowCount: 5 }); // failed jobs

                const result = await cleanupOldJobs();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(15);
                expect(result.task).toBe('old_jobs');
                expect(mockQuery).toHaveBeenCalledWith(
                    expect.stringContaining('DELETE FROM app_jobs.jobs'),
                    expect.any(Array)
                );
            });
        });

        describe('cleanupOrphanedData', () => {
            it('should delete orphaned authentications and emails', async () => {
                // Mock returns for auth and email deletions
                mockQuery
                    .mockResolvedValueOnce({ rowCount: 3 }) // orphaned auths
                    .mockResolvedValueOnce({ rowCount: 2 }); // orphaned emails

                const result = await cleanupOrphanedData();

                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(5);
                expect(result.task).toBe('orphaned_data');
                // The query doesn't take parameters, just verify it was called with the right SQL
                expect(mockQuery).toHaveBeenCalledWith(
                    expect.stringContaining('DELETE FROM app_public.user_authentications')
                );
            });
        });
    });

    describe('Cleanup Service', () => {
        describe('runCleanupTask', () => {
            it('should run unverified_emails task', async () => {
                mockQuery.mockResolvedValue({ rowCount: 2 });

                const result = await runCleanupTask('unverified_emails');

                expect(result.task).toBe('unverified_emails');
                expect(result.success).toBe(true);
                expect(result.itemsRemoved).toBe(2);
            });

            it('should run expired_tokens task', async () => {
                mockQuery.mockResolvedValue({ rowCount: 1 });

                const result = await runCleanupTask('expired_tokens');

                expect(result.task).toBe('expired_tokens');
                expect(result.success).toBe(true);
            });

            it('should run old_jobs task', async () => {
                mockQuery.mockResolvedValue({ rowCount: 10 });

                const result = await runCleanupTask('old_jobs');

                expect(result.task).toBe('old_jobs');
                expect(result.success).toBe(true);
            });

            it('should run orphaned_data task', async () => {
                mockQuery.mockResolvedValue({ rowCount: 5 });

                const result = await runCleanupTask('orphaned_data');

                expect(result.task).toBe('orphaned_data');
                expect(result.success).toBe(true);
            });

            it('should return error result for unknown task', async () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await runCleanupTask('invalid_task' as any);

                expect(result.success).toBe(false);
                expect(result.error).toContain('Unknown cleanup task');
            });
        });

        describe('runAllCleanupTasks', () => {
            it('should run all cleanup tasks successfully', async () => {
                mockQuery.mockResolvedValue({ rowCount: 1 });

                const summary = await runAllCleanupTasks();

                expect(summary.success).toBe(true);
                expect(summary.results.length).toBe(4);
                expect(summary.totalDuration).toBeGreaterThanOrEqual(0);
            });

            it('should handle task failures gracefully', async () => {
                mockQuery
                    .mockResolvedValueOnce({ rowCount: 1 })
                    .mockRejectedValueOnce(new Error('Task failed'))
                    .mockResolvedValueOnce({ rowCount: 2 })
                    .mockResolvedValueOnce({ rowCount: 2 })
                    .mockResolvedValueOnce({ rowCount: 0 })
                    .mockResolvedValueOnce({ rowCount: 0 });

                const summary = await runAllCleanupTasks();

                expect(summary.results.length).toBe(4);
                expect(summary.results.some(r => !r.success)).toBe(true);
            });

            it('should calculate total items removed', async () => {
                mockQuery
                    .mockResolvedValueOnce({ rowCount: 5 }) // unverified_emails
                    .mockResolvedValueOnce({ rowCount: 3 }) // expired_tokens
                    .mockResolvedValueOnce({ rowCount: 7 }) // old_jobs completed
                    .mockResolvedValueOnce({ rowCount: 3 }) // old_jobs failed
                    .mockResolvedValueOnce({ rowCount: 1 }) // orphaned_data auths
                    .mockResolvedValueOnce({ rowCount: 1 }); // orphaned_data emails

                const summary = await runAllCleanupTasks();

                // 5 + 3 + (7+3) + (1+1) = 20
                expect(summary.totalItemsRemoved).toBe(20);
            });
        });

        describe('getCleanupCrontab', () => {
            it('should return crontab configuration string', () => {
                const crontab = getCleanupCrontab();

                expect(typeof crontab).toBe('string');
                expect(crontab).toContain('0 3 * * *');
                expect(crontab).toContain('cleanup__run_all');
            });
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle cleanup with no items to remove', async () => {
            mockQuery.mockResolvedValue({ rowCount: 0 });

            const summary = await runAllCleanupTasks();

            expect(summary.success).toBe(true);
            expect(summary.totalItemsRemoved).toBe(0);
            expect(summary.results.every(r => r.success)).toBe(true);
        });

        it('should track execution time', async () => {
            mockQuery.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({ rowCount: 1 }), 10))
            );

            const summary = await runAllCleanupTasks();

            expect(summary.totalDuration).toBeGreaterThan(0);
            summary.results.forEach(result => {
                expect(result.duration).toBeGreaterThanOrEqual(0);
            });
        });
    });
});
