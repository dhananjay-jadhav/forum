/**
 * @app/kafka - Event Publisher Service
 *
 * High-level service for publishing forum events.
 * This is the main interface used by the Forum API.
 */

import { logger } from '@app/utils';

import { initProducer, isProducerHealthy, publishEvent } from './producer.js';
import {
    ContentCreatedEvent,
    ContentDeletedEvent,
    ContentModeratedEvent,
    ContentUpdatedEvent,
    KAFKA_TOPICS,
    PostCreatedEvent,
    PostDeletedEvent,
    PostUpdatedEvent,
    SearchPerformedEvent,
    TopicCreatedEvent,
    TopicDeletedEvent,
    TopicUpdatedEvent,
    TopicViewedEvent,
    UserLoginEvent,
    UserRegisteredEvent,
    UserUpdatedEvent,
} from './types.js';

let initialized = false;

/**
 * Initialize the event publisher
 */
export async function initEventPublisher(): Promise<void> {
    if (initialized) return;

    try {
        await initProducer();
        initialized = true;
        logger.info('Event publisher initialized');
    } catch (error) {
        logger.warn({ error }, 'Failed to initialize Kafka producer - events will be logged only');
    }
}

/**
 * Check if Kafka is available
 */
function isKafkaAvailable(): boolean {
    return initialized && isProducerHealthy();
}

/**
 * Safe publish - logs if Kafka is not available
 */
async function safePublish<T extends Parameters<typeof publishEvent>[1]>(
    topic: Parameters<typeof publishEvent>[0],
    event: T
): Promise<void> {
    if (!isKafkaAvailable()) {
        logger.debug({ topic, eventType: event.eventType }, 'Kafka not available, event logged only');
        return;
    }

    try {
        await publishEvent(topic, event);
    } catch (error) {
        logger.error({ error, topic, eventType: event.eventType }, 'Failed to publish event');
    }
}

// ============================================================================
// User Events
// ============================================================================

export async function publishUserRegistered(payload: UserRegisteredEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.USER_EVENTS, {
        eventType: 'user.registered' as const,
        payload,
    });

    // Also publish content event for search indexing
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.created' as const,
        payload: {
            contentType: 'user' as const,
            contentId: payload.userId,
            body: payload.username,
            metadata: { email: payload.email },
        },
    });
}

export async function publishUserLogin(payload: UserLoginEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.USER_EVENTS, {
        eventType: 'user.login' as const,
        payload,
    });
}

export async function publishUserUpdated(payload: UserUpdatedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.USER_EVENTS, {
        eventType: 'user.updated' as const,
        payload,
    });

    // Update search index
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.updated' as const,
        payload: {
            contentType: 'user' as const,
            contentId: payload.userId,
            body: payload.username,
            metadata: { changes: payload.changes },
        },
    });
}

// ============================================================================
// Topic Events
// ============================================================================

export async function publishTopicCreated(payload: TopicCreatedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.TOPIC_EVENTS, {
        eventType: 'topic.created' as const,
        payload,
    });

    // Publish content event for search indexing
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.created' as const,
        payload: {
            contentType: 'topic' as const,
            contentId: payload.topicId,
            forumId: payload.forumId,
            authorId: payload.authorId,
            title: payload.title,
            body: payload.bodyPreview,
        },
    });
}

export async function publishTopicUpdated(payload: TopicUpdatedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.TOPIC_EVENTS, {
        eventType: 'topic.updated' as const,
        payload,
    });

    // Update search index
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.updated' as const,
        payload: {
            contentType: 'topic' as const,
            contentId: payload.topicId,
            title: payload.title,
            metadata: { changes: payload.changes },
        },
    });
}

export async function publishTopicDeleted(payload: TopicDeletedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.TOPIC_EVENTS, {
        eventType: 'topic.deleted' as const,
        payload,
    });

    // Remove from search index
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.deleted' as const,
        payload: {
            contentType: 'topic' as const,
            contentId: payload.topicId,
        },
    });
}

export async function publishTopicViewed(payload: TopicViewedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.TOPIC_EVENTS, {
        eventType: 'topic.viewed' as const,
        payload,
    });
}

// ============================================================================
// Post Events
// ============================================================================

export async function publishPostCreated(payload: PostCreatedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.POST_EVENTS, {
        eventType: 'post.created' as const,
        payload,
    });

    // Publish content event for search indexing
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.created' as const,
        payload: {
            contentType: 'post' as const,
            contentId: payload.postId,
            forumId: payload.forumId,
            authorId: payload.authorId,
            body: payload.bodyPreview,
            metadata: { topicId: payload.topicId },
        },
    });
}

export async function publishPostUpdated(payload: PostUpdatedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.POST_EVENTS, {
        eventType: 'post.updated' as const,
        payload,
    });

    // Update search index
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.updated' as const,
        payload: {
            contentType: 'post' as const,
            contentId: payload.postId,
            metadata: { topicId: payload.topicId, changes: payload.changes },
        },
    });
}

export async function publishPostDeleted(payload: PostDeletedEvent['payload']): Promise<void> {
    await safePublish(KAFKA_TOPICS.POST_EVENTS, {
        eventType: 'post.deleted' as const,
        payload,
    });

    // Remove from search index
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.deleted' as const,
        payload: {
            contentType: 'post' as const,
            contentId: payload.postId,
        },
    });
}

// ============================================================================
// Search Events
// ============================================================================

export async function publishSearchPerformed(
    payload: SearchPerformedEvent['payload']
): Promise<void> {
    await safePublish(KAFKA_TOPICS.SEARCH_EVENTS, {
        eventType: 'search.performed' as const,
        payload,
    });
}

// ============================================================================
// Moderation Events
// ============================================================================

export async function publishContentModerated(
    payload: ContentModeratedEvent['payload']
): Promise<void> {
    await safePublish(KAFKA_TOPICS.MODERATION_EVENTS, {
        eventType: 'content.moderated' as const,
        payload,
    });

    // If content was deleted, update search index
    if (payload.action === 'deleted') {
        await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
            eventType: 'content.deleted' as const,
            payload: {
                contentType: payload.contentType,
                contentId: payload.contentId,
            },
        });
    }
}

// ============================================================================
// Direct Content Events (for manual indexing)
// ============================================================================

export async function publishContentCreated(
    payload: ContentCreatedEvent['payload']
): Promise<void> {
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.created' as const,
        payload,
    });
}

export async function publishContentUpdated(
    payload: ContentUpdatedEvent['payload']
): Promise<void> {
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.updated' as const,
        payload,
    });
}

export async function publishContentDeleted(
    payload: ContentDeletedEvent['payload']
): Promise<void> {
    await safePublish(KAFKA_TOPICS.CONTENT_EVENTS, {
        eventType: 'content.deleted' as const,
        payload,
    });
}
