/**
 * Test Registry
 *
 * Central export for all test definitions.
 * Import new test files here and add them to getAllTests().
 */

import { ApiConfig, ApiService, TestCategory, TestConfig } from '../types';
import { getAnalyticsTests } from './analytics.tests';
import { getGraphQLTests } from './graphql.tests';
import { getRestTests } from './rest.tests';
import { getSearchTests } from './search.tests';

/**
 * API service configurations with default ports
 */
export const API_CONFIGS: Record<ApiService, ApiConfig> = {
    api: {
        name: 'Forum API',
        baseUrl: process.env.API_URL || 'http://localhost:3000',
        port: 3000,
        healthEndpoint: '/live',
    },
    analytics: {
        name: 'Analytics API',
        baseUrl: process.env.ANALYTICS_API_URL || 'http://localhost:3002',
        port: 3002,
        healthEndpoint: '/',
    },
    search: {
        name: 'Search API',
        baseUrl: process.env.SEARCH_API_URL || 'http://localhost:3003',
        port: 3003,
        healthEndpoint: '/',
    },
};

/**
 * Get all tests for the main Forum API
 */
export function getApiTests(baseUrl: string): Record<string, TestConfig> {
    return {
        ...getRestTests(baseUrl),
        ...getGraphQLTests(baseUrl),
    };
}

/**
 * Get all tests across all API services
 */
export function getAllTests(configs?: Partial<Record<ApiService, string>>): Record<string, TestConfig> {
    const apiUrl = configs?.api || API_CONFIGS.api.baseUrl;
    const analyticsUrl = configs?.analytics || API_CONFIGS.analytics.baseUrl;
    const searchUrl = configs?.search || API_CONFIGS.search.baseUrl;

    return {
        ...getApiTests(apiUrl),
        ...getAnalyticsTests(analyticsUrl),
        ...getSearchTests(searchUrl),
    };
}

/**
 * Get tests for a specific API service
 */
export function getTestsByService(
    service: ApiService,
    baseUrl?: string
): Record<string, TestConfig> {
    const url = baseUrl || API_CONFIGS[service].baseUrl;

    switch (service) {
        case 'api':
            return getApiTests(url);
        case 'analytics':
            return getAnalyticsTests(url);
        case 'search':
            return getSearchTests(url);
        default:
            return {};
    }
}

/**
 * Get tests by category
 */
export function getTestsByCategory(
    category: TestCategory,
    configs?: Partial<Record<ApiService, string>>
): Record<string, TestConfig> {
    const allTests = getAllTests(configs);
    return Object.fromEntries(
        Object.entries(allTests).filter(([, config]) => config.category === category)
    );
}

/**
 * Get all test names
 */
export function getTestNames(configs?: Partial<Record<ApiService, string>>): string[] {
    return Object.keys(getAllTests(configs));
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getAllTests() instead
 */
export function getAllTestsLegacy(baseUrl: string): Record<string, TestConfig> {
    return getApiTests(baseUrl);
}

export { getRestTests } from './rest.tests';
export { getGraphQLTests } from './graphql.tests';
export { getAnalyticsTests } from './analytics.tests';
export { getSearchTests } from './search.tests';

