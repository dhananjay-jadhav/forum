/**
 * @app/jobs - Task Handler Integration Tests
 *
 * Integration tests for job task handlers with database integration.
 * These tests verify the complete flow from database triggers to task execution.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { closePool, query, withTransaction } from '@app/database';
import * as emailService from '@app/email';
import * as notificationService from '@app/notifications';
import * as moderationService from '@app/moderation';
import * as cleanupService from '@app/cleanup';
import { forumTaskList } from './tasks.js';

// Mock external services
jest.mock('@app/email');
jest.mock('@app/notifications');
jest.mock('@app/moderation');
jest.mock('@app/cleanup');

describe('Task Handlers (Integration)', () => {
    let testUserId: number;
    let testUserEmailId: number;
    let testTopicId: number;
    let testPostId: number;

    beforeAll(async () => {
        // Setup test data with unique username
        const timestamp = Date.now();
        await withTransaction(async (client) => {
            // Create test user
            const userResult = await client.query(
                `INSERT INTO app_public.users (username, name) 
                 VALUES ($1, $2) RETURNING id`,
                [`testuser_jobs_${timestamp}`, 'Test User Jobs']
            );
            testUserId = userResult.rows[0].id;

            // Create test user email
            const emailResult = await client.query(
                `INSERT INTO app_public.user_emails (user_id, email, is_verified) 
                 VALUES ($1, $2, $3) RETURNING id`,
                [testUserId, 'testjobs@example.com', false]
            );
            testUserEmailId = emailResult.rows[0].id;

            // Get an existing forum or create one
            let forumId = 1;
            const forumCheck = await client.query('SELECT id FROM app_public.forums LIMIT 1');
            if (forumCheck.rows.length > 0) {
                forumId = forumCheck.rows[0].id;
            }

            // Create test topic
            const topicResult = await client.query(
                `INSERT INTO app_public.topics (title, author_id, forum_id) 
                 VALUES ($1, $2, $3) RETURNING id`,
                ['Test Topic for Jobs', testUserId, forumId]
            );
            testTopicId = topicResult.rows[0].id;

            // Create test post
            const postResult = await client.query(
                `INSERT INTO app_public.posts (body, author_id, topic_id) 
                 VALUES ($1, $2, $3) RETURNING id`,
                ['Test post content', testUserId, testTopicId]
            );
            testPostId = postResult.rows[0].id;
        });
    });

    afterAll(async () => {
        // Cleanup test data in correct order (respect foreign key constraints)
        await query('DELETE FROM app_public.posts WHERE author_id = $1', [testUserId]);
        await query('DELETE FROM app_public.topics WHERE author_id = $1', [testUserId]);
        await query('DELETE FROM app_public.user_emails WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM app_private.user_secrets WHERE user_id = $1', [testUserId]);
        await query('DELETE FROM app_public.users WHERE id = $1', [testUserId]);
        await closePool();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('user_emails__send_verification', () => {
        it('should send verification email for user email', async () => {
            const task = forumTaskList['user_emails__send_verification'];
            expect(task).toBeDefined();

            const payload = { id: testUserEmailId };
            await task!(payload, {} as any);

            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
                'testjobs@example.com',
                expect.any(String)
            );
        });

        it('should handle non-existent email gracefully', async () => {
            const task = forumTaskList['user_emails__send_verification'];
            const payload = { id: 999999 };

            await expect(task!(payload, {} as any)).resolves.not.toThrow();
            expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
        });
    });

    describe('user__forgot_password', () => {
        it('should send password reset email', async () => {
            const task = forumTaskList['user__forgot_password'];
            expect(task).toBeDefined();

            const payload = {
                id: testUserId,
                email: 'testjobs@example.com',
                token: 'reset-token-123',
            };
            await task!(payload, {} as any);

            expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
                'testjobs@example.com',
                testUserId,
                'reset-token-123'
            );
        });
    });

    describe('user__send_welcome', () => {
        it('should send welcome email and notification for verified user', async () => {
            // Mark email as verified
            await query(
                'UPDATE app_public.user_emails SET is_verified = true WHERE id = $1',
                [testUserEmailId]
            );

            const task = forumTaskList['user__send_welcome'];
            expect(task).toBeDefined();

            const payload = { userId: testUserId };
            await task!(payload, {} as any);

            expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
                'testjobs@example.com',
                expect.stringContaining('testuser_jobs'),
                'Test User Jobs'
            );
            expect(notificationService.notifyWelcome).toHaveBeenCalledWith(testUserId);

            // Reset for other tests
            await query(
                'UPDATE app_public.user_emails SET is_verified = false WHERE id = $1',
                [testUserEmailId]
            );
        });

        it('should handle user without verified email', async () => {
            const task = forumTaskList['user__send_welcome'];
            const payload = { userId: testUserId };

            // Clear mocks before this test since previous test may have called it
            jest.clearAllMocks();

            await expect(task!(payload, {} as any)).resolves.not.toThrow();
            expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
        });
    });

    describe('post__notify_topic_author', () => {
        it('should notify topic author of new post', async () => {
            const task = forumTaskList['post__notify_topic_author'];
            expect(task).toBeDefined();

            const payload = { postId: testPostId };
            await task!(payload, {} as any);

            expect(notificationService.notifyTopicReply).toHaveBeenCalledWith(
                testUserId,
                testTopicId,
                testPostId,
                testUserId
            );
        });

        it('should handle non-existent post gracefully', async () => {
            const task = forumTaskList['post__notify_topic_author'];
            const payload = { postId: 999999 };

            await expect(task!(payload, {} as any)).resolves.not.toThrow();
            expect(notificationService.notifyTopicReply).not.toHaveBeenCalled();
        });
    });

    describe('post__moderate', () => {
        it('should moderate post content', async () => {
            const task = forumTaskList['post__moderate'];
            expect(task).toBeDefined();

            const payload = { id: testPostId };
            await task!(payload, {} as any);

            expect(moderationService.moderatePost).toHaveBeenCalledWith(testPostId);
        });
    });

    describe('topic__moderate', () => {
        it('should moderate topic content', async () => {
            const task = forumTaskList['topic__moderate'];
            expect(task).toBeDefined();

            const payload = { id: testTopicId };
            await task!(payload, {} as any);

            expect(moderationService.moderateTopic).toHaveBeenCalledWith(testTopicId);
        });
    });

    describe('cleanup__run_all', () => {
        it('should run all cleanup tasks', async () => {
            (cleanupService.runAllCleanupTasks as jest.Mock).mockResolvedValue({
                success: true,
                totalItemsRemoved: 10,
                totalDuration: 150,
                results: [],
            });

            const task = forumTaskList['cleanup__run_all'];
            expect(task).toBeDefined();

            await task!({}, {} as any);

            expect(cleanupService.runAllCleanupTasks).toHaveBeenCalled();
        });
    });

    describe('cleanup__run', () => {
        it('should run specific cleanup task', async () => {
            (cleanupService.runCleanupTask as jest.Mock).mockResolvedValue({
                task: 'expired_tokens',
                success: true,
                itemsRemoved: 5,
            });

            const task = forumTaskList['cleanup__run'];
            expect(task).toBeDefined();

            const payload = { task: 'expired_tokens' };
            await task!(payload, {} as any);

            expect(cleanupService.runCleanupTask).toHaveBeenCalledWith('expired_tokens');
        });
    });

    describe('forumTaskList', () => {
        it('should have all expected task handlers', () => {
            expect(forumTaskList).toHaveProperty('user_emails__send_verification');
            expect(forumTaskList).toHaveProperty('user__forgot_password');
            expect(forumTaskList).toHaveProperty('user__send_welcome');
            expect(forumTaskList).toHaveProperty('post__notify_topic_author');
            expect(forumTaskList).toHaveProperty('post__moderate');
            expect(forumTaskList).toHaveProperty('topic__moderate');
            expect(forumTaskList).toHaveProperty('cleanup__run_all');
            expect(forumTaskList).toHaveProperty('cleanup__run');
        });

        it('should have all handlers as functions', () => {
            Object.values(forumTaskList).forEach((handler) => {
                expect(typeof handler).toBe('function');
            });
        });
    });
});
