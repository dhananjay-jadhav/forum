/**
 * Analytics Event Handlers
 *
 * Processes Kafka events and updates metrics.
 */

import {
    type ForumEvent,
    KAFKA_TOPICS,
    type PostCreatedEvent,
    type SearchPerformedEvent,
    type TopicCreatedEvent,
    type TopicViewedEvent,
    type UserLoginEvent,
    type UserRegisteredEvent,
} from '@app/kafka';
import { logger } from '@app/utils';

import { incrementCounter, recordEvent, recordTimeSeries } from '../metrics/store.js';

/**
 * Handle user events
 */
export function handleUserEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'user.registered': {
            const userEvent = event as UserRegisteredEvent;
            incrementCounter('users_registered_total', {});
            recordTimeSeries('users_registered', 1);
            recordEvent({
                name: 'user_registered',
                value: 1,
                labels: { userId: String(userEvent.payload.userId) },
            });
            logger.info({ userId: userEvent.payload.userId }, 'User registered event processed');
            break;
        }

        case 'user.login': {
            const loginEvent = event as UserLoginEvent;
            incrementCounter('users_login_total', {});
            incrementCounter('users_login_by_method', {
                method: 'password',
            });
            recordTimeSeries('user_logins', 1);
            logger.debug({ userId: loginEvent.payload.userId }, 'User login event processed');
            break;
        }

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled user event');
    }
}

/**
 * Handle topic events
 */
export function handleTopicEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'topic.created': {
            const topicEvent = event as TopicCreatedEvent;
            incrementCounter('topics_created_total', {});
            incrementCounter('topics_created_by_forum', {
                forumId: String(topicEvent.payload.forumId),
            });
            recordTimeSeries('topics_created', 1);
            recordEvent({
                name: 'topic_created',
                value: 1,
                labels: {
                    topicId: String(topicEvent.payload.topicId),
                    forumId: String(topicEvent.payload.forumId),
                },
            });
            logger.info({ topicId: topicEvent.payload.topicId }, 'Topic created event processed');
            break;
        }

        case 'topic.viewed': {
            const viewEvent = event as TopicViewedEvent;
            incrementCounter('topics_viewed_total', {});
            incrementCounter('topic_views', {
                topicId: String(viewEvent.payload.topicId),
            });
            recordTimeSeries('topic_views', 1);
            logger.debug({ topicId: viewEvent.payload.topicId }, 'Topic viewed event processed');
            break;
        }

        case 'topic.updated':
            incrementCounter('topics_updated_total', {});
            break;

        case 'topic.deleted':
            incrementCounter('topics_deleted_total', {});
            break;

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled topic event');
    }
}

/**
 * Handle post events
 */
export function handlePostEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'post.created': {
            const postEvent = event as PostCreatedEvent;
            incrementCounter('posts_created_total', {});
            incrementCounter('posts_created_by_topic', {
                topicId: String(postEvent.payload.topicId),
            });
            recordTimeSeries('posts_created', 1);
            recordEvent({
                name: 'post_created',
                value: 1,
                labels: {
                    postId: String(postEvent.payload.postId),
                    topicId: String(postEvent.payload.topicId),
                },
            });
            logger.info({ postId: postEvent.payload.postId }, 'Post created event processed');
            break;
        }

        case 'post.updated':
            incrementCounter('posts_updated_total', {});
            break;

        case 'post.deleted':
            incrementCounter('posts_deleted_total', {});
            break;

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled post event');
    }
}

/**
 * Handle search events
 */
export function handleSearchEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'search.performed': {
            const searchEvent = event as SearchPerformedEvent;
            incrementCounter('searches_total', {});
            incrementCounter('searches_by_type', {
                searchType: searchEvent.payload.searchType || 'all',
            });
            recordTimeSeries('searches', 1);
            recordTimeSeries('search_results_count', searchEvent.payload.resultsCount);
            recordEvent({
                name: 'search_performed',
                value: searchEvent.payload.resultsCount,
                labels: {
                    searchType: searchEvent.payload.searchType || 'all',
                },
            });
            logger.debug(
                { query: searchEvent.payload.query, resultsCount: searchEvent.payload.resultsCount },
                'Search event processed'
            );
            break;
        }

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled search event');
    }
}

/**
 * Handle content events (for aggregated content metrics)
 */
export function handleContentEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'content.created':
            incrementCounter('content_created_total', {});
            break;

        case 'content.updated':
            incrementCounter('content_updated_total', {});
            break;

        case 'content.deleted':
            incrementCounter('content_deleted_total', {});
            break;

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled content event');
    }
}

/**
 * Handle moderation events
 */
export function handleModerationEvent(event: ForumEvent): void {
    switch (event.eventType) {
        case 'content.moderated':
            incrementCounter('content_moderated_total', {});
            break;

        default:
            logger.debug({ eventType: event.eventType }, 'Unhandled moderation event');
    }
}

/**
 * Get topic for an event type
 */
export function getTopicForEventType(eventType: string): string {
    if (eventType.startsWith('user.')) return KAFKA_TOPICS.USER_EVENTS;
    if (eventType.startsWith('topic.')) return KAFKA_TOPICS.TOPIC_EVENTS;
    if (eventType.startsWith('post.')) return KAFKA_TOPICS.POST_EVENTS;
    if (eventType.startsWith('search.')) return KAFKA_TOPICS.SEARCH_EVENTS;
    if (eventType.startsWith('content.')) return KAFKA_TOPICS.CONTENT_EVENTS;
    return KAFKA_TOPICS.CONTENT_EVENTS;
}
