import { CHANNELS } from './types.js';
import type { SubscriptionEvent, UserPayload } from './types.js';

describe('subscriptions', () => {
    describe('CHANNELS', () => {
        it('should define all channel names', () => {
            expect(CHANNELS.USERS).toBe('app:users');
            expect(CHANNELS.FORUMS).toBe('app:forums');
            expect(CHANNELS.TOPICS).toBe('app:topics');
            expect(CHANNELS.POSTS).toBe('app:posts');
            expect(CHANNELS.ALL).toBe('app:all');
        });
    });

    describe('types', () => {
        it('should define SubscriptionEvent correctly', () => {
            const event: SubscriptionEvent<UserPayload> = {
                operation: 'INSERT',
                table: 'users',
                schema: 'app_public',
                timestamp: new Date().toISOString(),
                new: {
                    id: 1,
                    username: 'testuser',
                    name: 'Test User',
                    avatar_url: null,
                    is_admin: false,
                },
            };

            expect(event.operation).toBe('INSERT');
            expect(event.table).toBe('users');
            expect(event.new?.username).toBe('testuser');
        });

        it('should define UPDATE event with old and new', () => {
            const event: SubscriptionEvent<UserPayload> = {
                operation: 'UPDATE',
                table: 'users',
                schema: 'app_public',
                timestamp: new Date().toISOString(),
                old: {
                    id: 1,
                    username: 'oldname',
                    name: 'Old Name',
                    avatar_url: null,
                    is_admin: false,
                },
                new: {
                    id: 1,
                    username: 'newname',
                    name: 'New Name',
                    avatar_url: null,
                    is_admin: false,
                },
            };

            expect(event.operation).toBe('UPDATE');
            expect(event.old?.username).toBe('oldname');
            expect(event.new?.username).toBe('newname');
        });

        it('should define DELETE event with old only', () => {
            const event: SubscriptionEvent<UserPayload> = {
                operation: 'DELETE',
                table: 'users',
                schema: 'app_public',
                timestamp: new Date().toISOString(),
                old: {
                    id: 1,
                    username: 'deleted',
                    name: 'Deleted User',
                    avatar_url: null,
                    is_admin: false,
                },
            };

            expect(event.operation).toBe('DELETE');
            expect(event.old?.username).toBe('deleted');
            expect(event.new).toBeUndefined();
        });
    });
});
