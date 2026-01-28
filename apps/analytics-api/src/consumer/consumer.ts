/**
 * Analytics Kafka Consumer
 *
 * Consumes events from Kafka and processes them for analytics.
 */

import {
    createHandlerRegistry,
    disconnectConsumer,
    type EventHandler,
    type ForumEvent,
    initConsumer,
    isConsumerHealthy,
    KAFKA_TOPICS,
    registerHandler,
    startConsuming,
} from '@app/kafka';
import { logger } from '@app/utils';

import {
    handleContentEvent,
    handleModerationEvent,
    handlePostEvent,
    handleSearchEvent,
    handleTopicEvent,
    handleUserEvent,
} from './handlers.js';

let consumerRunning = false;

/**
 * Create event handlers for all event types
 */
function createEventHandlers(): Map<string, EventHandler> {
    const handlers = createHandlerRegistry();

    // User events
    registerHandler(handlers, 'user.registered', (event) => {
        handleUserEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'user.login', (event) => {
        handleUserEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'user.updated', (event) => {
        handleUserEvent(event);
        return Promise.resolve();
    });

    // Topic events
    registerHandler(handlers, 'topic.created', (event) => {
        handleTopicEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'topic.updated', (event) => {
        handleTopicEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'topic.deleted', (event) => {
        handleTopicEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'topic.viewed', (event) => {
        handleTopicEvent(event);
        return Promise.resolve();
    });

    // Post events
    registerHandler(handlers, 'post.created', (event) => {
        handlePostEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'post.updated', (event) => {
        handlePostEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'post.deleted', (event) => {
        handlePostEvent(event);
        return Promise.resolve();
    });

    // Search events
    registerHandler(handlers, 'search.performed', (event) => {
        handleSearchEvent(event);
        return Promise.resolve();
    });

    // Content events
    registerHandler(handlers, 'content.created', (event) => {
        handleContentEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'content.updated', (event) => {
        handleContentEvent(event);
        return Promise.resolve();
    });
    registerHandler(handlers, 'content.deleted', (event) => {
        handleContentEvent(event);
        return Promise.resolve();
    });

    // Moderation events
    registerHandler(handlers, 'content.moderated', (event) => {
        handleModerationEvent(event);
        return Promise.resolve();
    });

    return handlers;
}

/**
 * Start the Kafka consumer
 */
export async function startAnalyticsConsumer(): Promise<void> {
    if (consumerRunning) {
        logger.warn('Analytics consumer already running');
        return;
    }

    try {
        // Initialize consumer with analytics-specific group
        await initConsumer(
            { groupId: 'analytics-api-group' },
            { sessionTimeout: 30000 }
        );

        // Create handlers
        const handlers = createEventHandlers();

        // Subscribe to all relevant topics
        const topics = [
            KAFKA_TOPICS.USER_EVENTS,
            KAFKA_TOPICS.TOPIC_EVENTS,
            KAFKA_TOPICS.POST_EVENTS,
            KAFKA_TOPICS.SEARCH_EVENTS,
            KAFKA_TOPICS.CONTENT_EVENTS,
            KAFKA_TOPICS.MODERATION_EVENTS,
        ];

        // Start consuming
        await startConsuming({
            topics,
            fromBeginning: false,
            handlers,
            defaultHandler: (event: ForumEvent, metadata) => {
                logger.debug(
                    { eventType: event.eventType, topic: metadata.topic },
                    'Received event without specific handler'
                );
                return Promise.resolve();
            },
        });

        consumerRunning = true;
        logger.info({ topics }, 'Analytics Kafka consumer started');
    } catch (error) {
        logger.error({ error }, 'Failed to start analytics Kafka consumer');
        throw error;
    }
}

/**
 * Stop the Kafka consumer
 */
export async function stopAnalyticsConsumer(): Promise<void> {
    if (!consumerRunning) {
        return;
    }

    try {
        await disconnectConsumer();
        consumerRunning = false;
        logger.info('Analytics Kafka consumer stopped');
    } catch (error) {
        logger.error({ error }, 'Error stopping analytics Kafka consumer');
    }
}

/**
 * Check if consumer is healthy
 */
export function isAnalyticsConsumerHealthy(): boolean {
    return consumerRunning && isConsumerHealthy();
}

/**
 * Check if consumer is running
 */
export function isConsumerRunning(): boolean {
    return consumerRunning;
}
