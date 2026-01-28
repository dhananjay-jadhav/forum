/**
 * Search Functions
 *
 * Query Elasticsearch for forum content.
 */

import { logger } from '@app/utils';

import { getContentIndex,getElasticsearchClient } from './client.js';
import type { IndexedContent } from './indexer.js';

export interface SearchOptions {
    /** Search query text */
    query: string;
    /** Filter by content type */
    contentType?: 'topic' | 'post' | 'user';
    /** Filter by forum ID */
    forumId?: string;
    /** Filter by author ID */
    authorId?: string;
    /** Maximum results to return */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}

export interface SearchResult {
    id: string;
    score: number;
    content: IndexedContent;
    highlights?: {
        title?: string[];
        body?: string[];
    };
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    took: number;
}

/**
 * Search for content
 */
export async function searchContent(options: SearchOptions): Promise<SearchResponse> {
    const es = getElasticsearchClient();
    const index = getContentIndex();
    const { query, contentType, forumId, authorId, limit = 20, offset = 0 } = options;

    // Build filters
    const filters: Array<{ term: { [key: string]: string } }> = [];
    if (contentType) {
        filters.push({ term: { contentType } });
    }
    if (forumId) {
        filters.push({ term: { forumId } });
    }
    if (authorId) {
        filters.push({ term: { authorId } });
    }

    try {
        const result = await es.search<IndexedContent>({
            index,
            from: offset,
            size: limit,
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query,
                                fields: ['title^2', 'body'],
                                type: 'best_fields',
                                fuzziness: 'AUTO',
                            },
                        },
                    ],
                    filter: filters,
                },
            },
            highlight: {
                fields: {
                    title: {},
                    body: {
                        fragment_size: 150,
                        number_of_fragments: 3,
                    },
                },
            },
        });

        const total =
            typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0;

        const results: SearchResult[] = result.hits.hits.map((hit) => ({
            id: hit._id || '',
            score: hit._score || 0,
            content: hit._source as IndexedContent,
            highlights: hit.highlight
                ? {
                      title: hit.highlight['title'],
                      body: hit.highlight['body'],
                  }
                : undefined,
        }));

        logger.debug(
            { query, total, resultsCount: results.length, took: result.took },
            'Search completed'
        );

        return {
            results,
            total,
            took: result.took,
        };
    } catch (error) {
        logger.error({ error, query }, 'Search failed');
        throw error;
    }
}

/**
 * Search suggestions (autocomplete)
 */
export async function searchSuggestions(
    prefix: string,
    options?: { limit?: number; contentType?: 'topic' | 'post' | 'user' }
): Promise<string[]> {
    const es = getElasticsearchClient();
    const index = getContentIndex();
    const { limit = 10, contentType } = options || {};

    const filters: Array<{ term: { contentType: string } }> = [];
    if (contentType) {
        filters.push({ term: { contentType } });
    }

    try {
        const result = await es.search({
            index,
            size: limit,
            query: {
                bool: {
                    must: [
                        {
                            prefix: {
                                'title.keyword': {
                                    value: prefix,
                                    case_insensitive: true,
                                },
                            },
                        },
                    ],
                    filter: filters,
                },
            },
            _source: ['title'],
        });

        const suggestions = result.hits.hits
            .map((hit) => (hit._source as { title?: string })?.title)
            .filter((title): title is string => !!title);

        return [...new Set(suggestions)]; // Dedupe
    } catch (error) {
        logger.error({ error, prefix }, 'Suggestions failed');
        return [];
    }
}

/**
 * Get content by ID
 */
export async function getContentById(
    contentType: string,
    contentId: string
): Promise<IndexedContent | null> {
    const es = getElasticsearchClient();
    const index = getContentIndex();
    const docId = `${contentType}-${contentId}`;

    try {
        const result = await es.get<IndexedContent>({
            index,
            id: docId,
        });

        return result._source || null;
    } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) {
            return null;
        }
        logger.error({ error, contentType, contentId }, 'Get content by ID failed');
        throw error;
    }
}
