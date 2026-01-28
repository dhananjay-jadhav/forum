/**
 * @app/notifications - Unit Tests
 *
 * Unit tests for notification functionality including routing and preferences.
 */

import {
    sendNotification,
    notifyTopicReply,
    notifyWelcome,
    notifySystem,
    defaultPreferences,
    getUserPreferences,
} from './service.js';
import * as emailService from '@app/email';
import { getPool } from '@app/database';

jest.mock('@app/email');
jest.mock('@app/database');

describe('@app/notifications', () => {
    const mockQuery = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (getPool as jest.Mock).mockReturnValue({ query: mockQuery });
        (emailService.sendTopicReplyNotification as jest.Mock).mockResolvedValue({ success: true });
        (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue({ success: true });
    });

    describe('defaultPreferences', () => {
        it('should have correct default values', () => {
            expect(defaultPreferences.email).toBe(true);
            expect(defaultPreferences.inApp).toBe(true);
            expect(defaultPreferences.push).toBe(false);
            expect(defaultPreferences.enabledTypes).toContain('topic_reply');
            expect(defaultPreferences.enabledTypes).toContain('welcome');
            expect(defaultPreferences.enabledTypes).toContain('system');
        });
    });

    describe('getUserPreferences', () => {
        it('should return default preferences', async () => {
            const prefs = await getUserPreferences(1);

            expect(prefs).toEqual(defaultPreferences);
        });
    });

    describe('sendNotification', () => {
        it('should send notification via email and in-app channels', async () => {
            mockQuery.mockResolvedValue({
                rows: [{ email: 'user@test.com', username: 'testuser', name: 'Test User' }],
            });

            await sendNotification({
                type: 'system',
                userId: 1,
                channels: ['email', 'in_app'],
                message: 'This is a system notification',
                title: 'System Alert',
            });

            // Should have queried for user details
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                expect.arrayContaining([1])
            );
        });

        it('should handle in-app only notification', async () => {
            await sendNotification({
                type: 'system',
                userId: 2,
                channels: ['in_app'],
                message: 'In-app only notification',
                title: 'In-App Alert',
            });

            // Should not call email services
            expect(emailService.sendTopicReplyNotification).not.toHaveBeenCalled();
            expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
        });
    });

    describe('notifyTopicReply', () => {
        it('should notify topic author of new reply', async () => {
            // First call: get user details for topic author
            mockQuery
                .mockResolvedValueOnce({
                    rows: [{ email: 'author@test.com', username: 'author', name: 'Topic Author' }],
                })
                // Second call: get topic and reply details
                .mockResolvedValueOnce({
                    rows: [
                        {
                            title: 'Great Topic',
                            body: 'This is a reply',
                            replier_name: 'replier',
                        },
                    ],
                });

            await notifyTopicReply(1, 100, 200, 2);

            // Should have queried for user details
            expect(mockQuery).toHaveBeenCalled();
        });

        it('should not notify if author is replying to own topic', async () => {
            await notifyTopicReply(1, 100, 200, 1);

            // Should not call email service when self-replying
            expect(emailService.sendTopicReplyNotification).not.toHaveBeenCalled();
        });

        it('should handle user without email gracefully', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            // Should not throw
            await expect(notifyTopicReply(1, 100, 200, 2)).resolves.not.toThrow();
        });
    });

    describe('notifyWelcome', () => {
        it('should send welcome notification to new user', async () => {
            mockQuery.mockResolvedValue({
                rows: [
                    {
                        email: 'newuser@test.com',
                        username: 'newuser',
                        name: 'New User',
                    },
                ],
            });

            await notifyWelcome(5);

            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [5]);
            expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
                'newuser@test.com',
                'newuser',
                'New User'
            );
        });

        it('should handle user without verified email', async () => {
            mockQuery.mockResolvedValue({
                rows: [{ username: 'user', name: 'User', email: null }],
            });

            await notifyWelcome(10);

            // Should not call email service without verified email
            expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
        });
    });

    describe('notifySystem', () => {
        it('should send system notification to user (in-app only)', async () => {
            // System notifications default to in-app only
            await notifySystem(7, 'System Update', 'Important update available');

            // System notifications don't query for email
            // They just log for in-app
            expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
            expect(emailService.sendTopicReplyNotification).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle missing user gracefully', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(notifyWelcome(999)).resolves.not.toThrow();
        });

        it('should catch email service errors without propagating', async () => {
            mockQuery.mockResolvedValue({
                rows: [{ email: 'user@test.com', username: 'user', name: 'User' }],
            });
            (emailService.sendWelcomeEmail as jest.Mock).mockRejectedValue(
                new Error('Email service down')
            );

            // Should not throw - errors are caught and logged
            await expect(notifyWelcome(1)).resolves.not.toThrow();
        });
    });
});
