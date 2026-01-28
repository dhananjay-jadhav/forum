/**
 * Analytics API Test Definitions
 *
 * Performance tests for the Analytics API endpoints.
 * Default port: 3002
 */

import { TestConfig } from '../types';

export function getAnalyticsTests(baseUrl: string): Record<string, TestConfig> {
    return {
        // Health & Status
        analytics_root: {
            name: 'Analytics API Root',
            url: `${baseUrl}/`,
            method: 'GET',
            category: 'rest',
            description: 'Analytics API root endpoint',
        },
        analytics_health: {
            name: 'Analytics Health Check',
            url: `${baseUrl}/api/analytics/health`,
            method: 'GET',
            category: 'rest',
            description: 'Analytics health check with Kafka status',
        },

        // Metrics Endpoints
        analytics_metrics: {
            name: 'Analytics Metrics Summary',
            url: `${baseUrl}/api/analytics/metrics`,
            method: 'GET',
            category: 'rest',
            description: 'Aggregated metrics summary',
        },
        analytics_counters: {
            name: 'Analytics Counters',
            url: `${baseUrl}/api/analytics/counters`,
            method: 'GET',
            category: 'rest',
            description: 'All counters list',
        },
        analytics_counters_prefix: {
            name: 'Analytics Counters by Prefix',
            url: `${baseUrl}/api/analytics/counters?prefix=users`,
            method: 'GET',
            category: 'rest',
            description: 'Counters filtered by prefix',
        },
        analytics_counter_single: {
            name: 'Analytics Single Counter',
            url: `${baseUrl}/api/analytics/counter/users_registered_total`,
            method: 'GET',
            category: 'rest',
            description: 'Single counter value retrieval',
        },

        // Time Series & Events
        analytics_timeseries: {
            name: 'Analytics Time Series',
            url: `${baseUrl}/api/analytics/timeseries/page_views?limit=100`,
            method: 'GET',
            category: 'rest',
            description: 'Time series data retrieval',
        },
        analytics_events: {
            name: 'Analytics Recent Events',
            url: `${baseUrl}/api/analytics/events?limit=50`,
            method: 'GET',
            category: 'rest',
            description: 'Recent events list',
        },

        // Dashboard
        analytics_dashboard: {
            name: 'Analytics Dashboard',
            url: `${baseUrl}/api/analytics/dashboard`,
            method: 'GET',
            category: 'rest',
            description: 'Aggregated dashboard data',
        },
    };
}
