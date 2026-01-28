/**
 * Search Kafka Consumer
 *
 * Consumes content events from Kafka and indexes them in Elasticsearch.
 */

import {
    createHandlerRegistry,
    disconnectConsumer,
    type ForumEvent,
    initConsumer,
    isConsumerHealthy,
    KAFKA_TOPICS,
    registerHandler,
    startConsuming,
} from '@app/kafka';
import { logger } from '@app/utils';

import {
    handleContentCreated,
    handleContentDeleted,
    handleContentUpdated,
} from './handlers.js';

let consumerRunning = false;

/**
 * Create event handlers for content indexing
 */
function createEventHandlers(): Map<string, (event: ForumEvent, metadata: { topic: string; partition: number; offset: string }) => Promise<void>> {
    const handlers = createHandlerRegistry();

    // Content events - these are the main events for search indexing
    registerHandler(handlers, 'content.created', async (event) => {
        await handleContentCreated(event);
    });

    registerHandler(handlers, 'content.updated', async (event) => {
        await handleContentUpdated(event);
    });

    registerHandler(handlers, 'content.deleted', async (event) => {
        await handleContentDeleted(event);
    });

    return handlers;
}

/**
 * Start the Kafka consumer for search indexing
 */
export async function startSearchConsumer(): Promise<void> {
    if (consumerRunning) {
        logger.warn('Search consumer already running');
        return;
    }

    try {
        // Initialize consumer with search-specific group
        await initConsumer(
            { groupId: 'search-api-group' },
            { sessionTimeout: 30000 }
        );

        // Create handlers
        const handlers = createEventHandlers();

        // Subscribe only to content events topic
        const topics = [KAFKA_TOPICS.CONTENT_EVENTS];

        // Start consuming
        await startConsuming({
            topics,
            fromBeginning: false,
            handlers,
            // eslint-disable-next-line @typescript-eslint/require-await
            defaultHandler: async (event: ForumEvent, metadata) => {
                logger.debug(
                    { eventType: event.eventType, topic: metadata.topic },
                    'Received event without specific handler'
                );
            },
        });

        consumerRunning = true;
        logger.info({ topics }, 'Search Kafka consumer started');
    } catch (error) {
        logger.error({ error }, 'Failed to start search Kafka consumer');
        throw error;
    }
}

/**
 * Stop the Kafka consumer
 */
export async function stopSearchConsumer(): Promise<void> {
    if (!consumerRunning) {
        return;
    }

    try {
        await disconnectConsumer();
        consumerRunning = false;
        logger.info('Search Kafka consumer stopped');
    } catch (error) {
        logger.error({ error }, 'Error stopping search Kafka consumer');
    }
}

/**
 * Check if consumer is healthy
 */
export function isSearchConsumerHealthy(): boolean {
    return consumerRunning && isConsumerHealthy();
}

/**
 * Check if consumer is running
 */
export function isConsumerRunning(): boolean {
    return consumerRunning;
}
