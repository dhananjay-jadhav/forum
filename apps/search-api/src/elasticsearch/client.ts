/**
 * Elasticsearch Client
 *
 * Client and index management for forum search.
 */

import { logger } from '@app/utils';
import { Client } from '@elastic/elasticsearch';

import { config } from '../config/index.js';

let client: Client | null = null;

/**
 * Get or create Elasticsearch client
 */
export function getElasticsearchClient(): Client {
    if (!client) {
        client = new Client({
            node: config.elasticsearchUrl,
        });
    }
    return client;
}

/**
 * Check Elasticsearch health
 */
export async function isElasticsearchHealthy(): Promise<boolean> {
    try {
        const es = getElasticsearchClient();
        const health = await es.cluster.health();
        return health.status !== 'red';
    } catch (error) {
        logger.error({ error }, 'Elasticsearch health check failed');
        return false;
    }
}

/**
 * Forum content index name
 */
export function getContentIndex(): string {
    return `${config.indexPrefix}-content`;
}

/**
 * Topic index name
 */
export function getTopicIndex(): string {
    return `${config.indexPrefix}-topics`;
}

/**
 * Post index name
 */
export function getPostIndex(): string {
    return `${config.indexPrefix}-posts`;
}

/**
 * User index name
 */
export function getUserIndex(): string {
    return `${config.indexPrefix}-users`;
}

/**
 * Content index mapping
 */
const contentMapping = {
    properties: {
        contentType: { type: 'keyword' as const },
        contentId: { type: 'keyword' as const },
        forumId: { type: 'keyword' as const },
        authorId: { type: 'keyword' as const },
        title: {
            type: 'text' as const,
            analyzer: 'standard',
            fields: {
                keyword: { type: 'keyword' as const },
            },
        },
        body: {
            type: 'text' as const,
            analyzer: 'standard',
        },
        tags: { type: 'keyword' as const },
        createdAt: { type: 'date' as const },
        updatedAt: { type: 'date' as const },
    },
};

/**
 * Initialize Elasticsearch indices
 */
export async function initializeIndices(): Promise<void> {
    const es = getElasticsearchClient();
    const contentIndex = getContentIndex();

    try {
        // Check if content index exists
        const exists = await es.indices.exists({ index: contentIndex });

        if (!exists) {
            await es.indices.create({
                index: contentIndex,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 0,
                    },
                    mappings: contentMapping,
                },
            });
            logger.info({ index: contentIndex }, 'Created Elasticsearch index');
        } else {
            logger.debug({ index: contentIndex }, 'Elasticsearch index already exists');
        }
    } catch (error) {
        logger.error({ error, index: contentIndex }, 'Failed to initialize Elasticsearch index');
        throw error;
    }
}

/**
 * Close Elasticsearch client
 */
export async function closeElasticsearchClient(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
        logger.info('Elasticsearch client closed');
    }
}
