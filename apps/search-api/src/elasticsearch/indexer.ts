/**
 * Content Indexer
 *
 * Functions for indexing forum content in Elasticsearch.
 */

import { logger } from '@app/utils';

import { getContentIndex,getElasticsearchClient } from './client.js';

export interface IndexedContent {
    contentType: 'topic' | 'post' | 'user';
    contentId: string;
    forumId?: string;
    authorId?: string;
    title?: string;
    body?: string;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Index a piece of content
 */
export async function indexContent(content: IndexedContent): Promise<void> {
    const es = getElasticsearchClient();
    const index = getContentIndex();

    try {
        await es.index({
            index,
            id: `${content.contentType}-${content.contentId}`,
            document: {
                ...content,
                updatedAt: new Date(),
            },
        });

        logger.debug(
            { contentType: content.contentType, contentId: content.contentId },
            'Content indexed'
        );
    } catch (error) {
        logger.error(
            { error, contentType: content.contentType, contentId: content.contentId },
            'Failed to index content'
        );
        throw error;
    }
}

/**
 * Update indexed content
 */
export async function updateContent(
    contentType: string,
    contentId: string,
    updates: Partial<IndexedContent>
): Promise<void> {
    const es = getElasticsearchClient();
    const index = getContentIndex();
    const docId = `${contentType}-${contentId}`;

    try {
        await es.update({
            index,
            id: docId,
            doc: {
                ...updates,
                updatedAt: new Date(),
            },
        });

        logger.debug({ contentType, contentId }, 'Content updated');
    } catch (error) {
        logger.error({ error, contentType, contentId }, 'Failed to update content');
        throw error;
    }
}

/**
 * Delete indexed content
 */
export async function deleteContent(contentType: string, contentId: string): Promise<void> {
    const es = getElasticsearchClient();
    const index = getContentIndex();
    const docId = `${contentType}-${contentId}`;

    try {
        await es.delete({
            index,
            id: docId,
        });

        logger.debug({ contentType, contentId }, 'Content deleted from index');
    } catch (error) {
        // Ignore 404 errors (document not found)
        if ((error as { statusCode?: number }).statusCode === 404) {
            logger.debug({ contentType, contentId }, 'Content not found in index (already deleted)');
            return;
        }
        logger.error({ error, contentType, contentId }, 'Failed to delete content');
        throw error;
    }
}

/**
 * Bulk index multiple content items
 */
export async function bulkIndexContent(items: IndexedContent[]): Promise<void> {
    if (items.length === 0) return;

    const es = getElasticsearchClient();
    const index = getContentIndex();

    const operations = items.flatMap((item) => [
        {
            index: {
                _index: index,
                _id: `${item.contentType}-${item.contentId}`,
            },
        },
        { ...item, updatedAt: new Date() },
    ]);

    try {
        const result = await es.bulk({ operations });

        if (result.errors) {
            const erroredItems = result.items.filter((item) => item.index?.error);
            logger.error({ errors: erroredItems }, 'Bulk index had errors');
        } else {
            logger.info({ count: items.length }, 'Bulk indexed content');
        }
    } catch (error) {
        logger.error({ error, count: items.length }, 'Failed to bulk index content');
        throw error;
    }
}
