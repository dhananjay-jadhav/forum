/**
 * Search Event Handlers
 *
 * Processes Kafka events and updates search index.
 */

import {
    type ContentCreatedEvent,
    type ContentDeletedEvent,
    type ContentUpdatedEvent,
    type ForumEvent,
} from '@app/kafka';
import { logger } from '@app/utils';

import { deleteContent,indexContent, updateContent } from '../elasticsearch/indexer.js';

/**
 * Handle content created events
 */
export async function handleContentCreated(event: ForumEvent): Promise<void> {
    if (event.eventType !== 'content.created') return;

    const contentEvent = event as ContentCreatedEvent;
    const { contentType, contentId, forumId, authorId, title, body } = contentEvent.payload;

    try {
        await indexContent({
            contentType: contentType as 'topic' | 'post' | 'user',
            contentId: String(contentId),
            forumId: forumId ? String(forumId) : undefined,
            authorId: authorId ? String(authorId) : undefined,
            title,
            body,
            createdAt: new Date(event.timestamp),
        });

        logger.info({ contentType, contentId }, 'Content indexed from event');
    } catch (error) {
        logger.error({ error, contentType, contentId }, 'Failed to index content from event');
    }
}

/**
 * Handle content updated events
 */
export async function handleContentUpdated(event: ForumEvent): Promise<void> {
    if (event.eventType !== 'content.updated') return;

    const contentEvent = event as ContentUpdatedEvent;
    const { contentType, contentId, title, body } = contentEvent.payload;

    try {
        await updateContent(contentType, String(contentId), {
            title,
            body,
            updatedAt: new Date(event.timestamp),
        });

        logger.info({ contentType, contentId }, 'Content updated from event');
    } catch (error) {
        // If document doesn't exist, try to index it
        if ((error as { statusCode?: number }).statusCode === 404) {
            logger.warn({ contentType, contentId }, 'Content not found for update, skipping');
            return;
        }
        logger.error({ error, contentType, contentId }, 'Failed to update content from event');
    }
}

/**
 * Handle content deleted events
 */
export async function handleContentDeleted(event: ForumEvent): Promise<void> {
    if (event.eventType !== 'content.deleted') return;

    const contentEvent = event as ContentDeletedEvent;
    const { contentType, contentId } = contentEvent.payload;

    try {
        await deleteContent(contentType, String(contentId));
        logger.info({ contentType, contentId }, 'Content deleted from event');
    } catch (error) {
        logger.error({ error, contentType, contentId }, 'Failed to delete content from event');
    }
}
