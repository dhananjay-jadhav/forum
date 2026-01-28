/**
 * Search API Test Definitions
 *
 * Performance tests for the Search API endpoints.
 * Default port: 3003
 */

import { TestConfig } from '../types';

export function getSearchTests(baseUrl: string): Record<string, TestConfig> {
    return {
        // Health & Status
        search_root: {
            name: 'Search API Root',
            url: `${baseUrl}/`,
            method: 'GET',
            category: 'rest',
            description: 'Search API root endpoint',
        },
        search_health: {
            name: 'Search Health Check',
            url: `${baseUrl}/api/search/health`,
            method: 'GET',
            category: 'rest',
            description: 'Search health check with Elasticsearch and Kafka status',
        },

        // Search Endpoints
        search_query: {
            name: 'Search Query',
            url: `${baseUrl}/api/search?q=test`,
            method: 'GET',
            category: 'rest',
            description: 'Basic search query',
        },
        search_query_filtered: {
            name: 'Search Query with Filters',
            url: `${baseUrl}/api/search?q=test&type=topic&limit=20`,
            method: 'GET',
            category: 'rest',
            description: 'Search with type filter and pagination',
        },
        search_suggestions: {
            name: 'Search Suggestions',
            url: `${baseUrl}/api/search/suggestions?q=te&limit=10`,
            method: 'GET',
            category: 'rest',
            description: 'Autocomplete suggestions',
        },
        search_suggestions_typed: {
            name: 'Search Suggestions by Type',
            url: `${baseUrl}/api/search/suggestions?q=te&type=topic&limit=5`,
            method: 'GET',
            category: 'rest',
            description: 'Typed autocomplete suggestions',
        },

        // Content Retrieval
        search_content_topic: {
            name: 'Search Content by Type',
            url: `${baseUrl}/api/search/content/topic/1`,
            method: 'GET',
            category: 'rest',
            description: 'Get content by type and ID',
        },
    };
}
