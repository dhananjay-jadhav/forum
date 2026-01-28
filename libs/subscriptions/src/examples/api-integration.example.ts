/**
 * Subscription Integration Example
 *
 * This example shows how to integrate the subscription library with your API.
 */

import { logger } from '@app/utils';

import {
    getSubscriptionManager,
    initializeSubscriptions,
    shutdownSubscriptions,
} from '../lib/manager.js';
import type { ForumEvent, PostEvent, SubscriptionEvent, UserEvent } from '../lib/types.js';
import { CHANNELS } from '../lib/types.js';

const log = logger.child({ component: 'subscription-example' });

/**
 * Example: Set up subscriptions in your API startup
 */
export async function setupSubscriptions(): Promise<void> {
    // Initialize the subscription manager
    const manager = await initializeSubscriptions();

    // Subscribe to user events
    await manager.subscribeToUsers((event: SubscriptionEvent) => {
        const userEvent = event as UserEvent;
        switch (userEvent.operation) {
            case 'INSERT':
                log.info({ user: userEvent.new }, 'New user registered');
                // Could trigger: send welcome email, update analytics, etc.
                break;
            case 'UPDATE':
                log.info({ userId: userEvent.new?.id }, 'User profile updated');
                break;
            case 'DELETE':
                log.info({ userId: userEvent.old?.id }, 'User account deleted');
                break;
        }
    });

    // Subscribe to forum events
    await manager.subscribeToForums((event: SubscriptionEvent) => {
        const forumEvent = event as ForumEvent;
        if (forumEvent.operation === 'INSERT') {
            log.info({ forum: forumEvent.new?.name }, 'New forum created');
            // Could trigger: notify admins, index for search, etc.
        }
    });

    // Subscribe to post events
    await manager.subscribeToPosts((event: SubscriptionEvent) => {
        const postEvent = event as PostEvent;
        if (postEvent.operation === 'INSERT') {
            log.info({ postId: postEvent.new?.id }, 'New post created');
            // Could trigger: notify topic subscribers, update feed, etc.
        }
    });

    log.info('Subscriptions initialized');
}

/**
 * Example: Subscribe to all events with filtering
 */
export async function setupGlobalEventHandler(): Promise<void> {
    const manager = getSubscriptionManager();

    await manager.subscribe(CHANNELS.ALL, (event: SubscriptionEvent) => {
        // Log all events for audit purposes
        log.debug({
            operation: event.operation,
            table: event.table,
            timestamp: event.timestamp,
        }, 'Database event');

        // You could send to an event stream, analytics, etc.
    });
}

/**
 * Example: Clean shutdown
 */
export async function shutdown(): Promise<void> {
    await shutdownSubscriptions();
    log.info('Subscriptions shut down');
}

/**
 * Example: Dynamic subscription management
 */
export async function subscribeToSpecificUser(userId: number): Promise<() => Promise<void>> {
    const manager = getSubscriptionManager();

    const unsubscribe = await manager.subscribeToUsers((event: SubscriptionEvent) => {
        const userEvent = event as UserEvent;
        // Filter for specific user
        if (userEvent.new?.id === userId || userEvent.old?.id === userId) {
            log.info({ userId, event }, 'Event for watched user');
        }
    });

    return unsubscribe;
}
