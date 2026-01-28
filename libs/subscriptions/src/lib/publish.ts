/**
 * Publish Events
 *
 * Functions to publish events via PostgreSQL NOTIFY.
 */

import { query } from '@app/database';
import { logger } from '@app/utils';

import type {
    ChannelName,
    ForumPayload,
    PostPayload,
    SubscriptionEvent,
    SubscriptionOperation,
    TopicPayload,
    UserPayload,
} from './types.js';
import { CHANNELS } from './types.js';

const log = logger.child({ component: 'subscriptions-publish' });

/**
 * Publish an event to a channel
 */
export async function publishEvent<T>(
    channel: ChannelName,
    event: SubscriptionEvent<T>
): Promise<void> {
    try {
        const payload = JSON.stringify(event);
        await query(`SELECT pg_notify($1, $2)`, [channel, payload]);
        log.debug({ channel, event }, 'Published event');
    } catch (error) {
        log.error({ error, channel }, 'Failed to publish event');
        throw error;
    }
}

/**
 * Publish a user event
 */
export async function publishUserEvent(
    operation: SubscriptionOperation,
    user: Partial<UserPayload>,
    oldUser?: Partial<UserPayload>
): Promise<void> {
    const event: SubscriptionEvent<Partial<UserPayload>> = {
        operation,
        table: 'users',
        schema: 'app_public',
        timestamp: new Date().toISOString(),
        ...(operation !== 'DELETE' ? { new: user } : {}),
        ...(operation !== 'INSERT' ? { old: oldUser ?? user } : {}),
    };

    await publishEvent(CHANNELS.USERS, event);
    await publishEvent(CHANNELS.ALL, event);
}

/**
 * Publish a forum event
 */
export async function publishForumEvent(
    operation: SubscriptionOperation,
    forum: Partial<ForumPayload>,
    oldForum?: Partial<ForumPayload>
): Promise<void> {
    const event: SubscriptionEvent<Partial<ForumPayload>> = {
        operation,
        table: 'forums',
        schema: 'app_public',
        timestamp: new Date().toISOString(),
        ...(operation !== 'DELETE' ? { new: forum } : {}),
        ...(operation !== 'INSERT' ? { old: oldForum ?? forum } : {}),
    };

    await publishEvent(CHANNELS.FORUMS, event);
    await publishEvent(CHANNELS.ALL, event);
}

/**
 * Publish a topic event
 */
export async function publishTopicEvent(
    operation: SubscriptionOperation,
    topic: Partial<TopicPayload>,
    oldTopic?: Partial<TopicPayload>
): Promise<void> {
    const event: SubscriptionEvent<Partial<TopicPayload>> = {
        operation,
        table: 'topics',
        schema: 'app_public',
        timestamp: new Date().toISOString(),
        ...(operation !== 'DELETE' ? { new: topic } : {}),
        ...(operation !== 'INSERT' ? { old: oldTopic ?? topic } : {}),
    };

    await publishEvent(CHANNELS.TOPICS, event);
    await publishEvent(CHANNELS.ALL, event);
}

/**
 * Publish a post event
 */
export async function publishPostEvent(
    operation: SubscriptionOperation,
    post: Partial<PostPayload>,
    oldPost?: Partial<PostPayload>
): Promise<void> {
    const event: SubscriptionEvent<Partial<PostPayload>> = {
        operation,
        table: 'posts',
        schema: 'app_public',
        timestamp: new Date().toISOString(),
        ...(operation !== 'DELETE' ? { new: post } : {}),
        ...(operation !== 'INSERT' ? { old: oldPost ?? post } : {}),
    };

    await publishEvent(CHANNELS.POSTS, event);
    await publishEvent(CHANNELS.ALL, event);
}
