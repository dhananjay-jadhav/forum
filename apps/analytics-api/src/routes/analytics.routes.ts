/**
 * Analytics API Routes
 *
 * REST endpoints for querying analytics data.
 */

import { Request, Response,Router } from 'express';

import { isAnalyticsConsumerHealthy } from '../consumer/consumer.js';
import {
    getCounter,
    getCounters,
    getMetricsSummary,
    getRecentEvents,
    getTimeSeries,
} from '../metrics/store.js';

const router = Router();

/**
 * Health check
 */
router.get('/health', (_req: Request, res: Response) => {
    const kafkaHealthy = isAnalyticsConsumerHealthy();
    res.json({
        status: kafkaHealthy ? 'healthy' : 'degraded',
        kafka: kafkaHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Get metrics summary
 */
router.get('/metrics', (_req: Request, res: Response) => {
    const summary = getMetricsSummary();
    res.json(summary);
});

/**
 * Get all counters, optionally filtered by prefix
 */
router.get('/counters', (req: Request, res: Response) => {
    const prefix = req.query['prefix'] as string | undefined;
    const counters = getCounters(prefix);
    res.json({ counters });
});

/**
 * Get specific counter value
 */
router.get('/counter/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const labels: Record<string, string> = {};

    // Parse labels from query string (e.g., ?forumId=1&authorId=2)
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
            labels[key] = value;
        }
    }

    const count = getCounter(name, labels);
    res.json({ name, labels, count });
});

/**
 * Get time series data
 */
router.get('/timeseries/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const startTime = req.query['startTime']
        ? new Date(req.query['startTime'] as string)
        : undefined;
    const endTime = req.query['endTime'] ? new Date(req.query['endTime'] as string) : undefined;

    const data = getTimeSeries(name, { limit, startTime, endTime });
    res.json({ name, data });
});

/**
 * Get recent events
 */
router.get('/events', (req: Request, res: Response) => {
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 100;
    const events = getRecentEvents(limit);
    res.json({ events, count: events.length });
});

/**
 * Dashboard summary - aggregated metrics for display
 */
router.get('/dashboard', (_req: Request, res: Response) => {
    const summary = getMetricsSummary();

    // Build dashboard data
    const dashboard = {
        overview: {
            totalUsers: getCounter('users_registered_total'),
            totalLogins: getCounter('users_login_total'),
            totalTopics: getCounter('topics_created_total'),
            totalPosts: getCounter('posts_created_total'),
            totalSearches: getCounter('searches_total'),
        },
        activity: {
            topicViews: getCounter('topics_viewed_total'),
            topicsUpdated: getCounter('topics_updated_total'),
            postsUpdated: getCounter('posts_updated_total'),
            contentModerated: getCounter('content_moderated_total'),
        },
        trends: {
            topicsCreated: getTimeSeries('topics_created', { limit: 24 }),
            postsCreated: getTimeSeries('posts_created', { limit: 24 }),
            userLogins: getTimeSeries('user_logins', { limit: 24 }),
            searches: getTimeSeries('searches', { limit: 24 }),
        },
        meta: {
            totalCounters: summary.totalCounters,
            totalEvents: summary.totalEvents,
            timestamp: new Date().toISOString(),
        },
    };

    res.json(dashboard);
});

/**
 * Forum-specific metrics
 */
router.get('/forum/:forumId/metrics', (req: Request, res: Response) => {
    const { forumId } = req.params;

    const metrics = {
        forumId,
        topicsCreated: getCounter('topics_created_by_forum', { forumId }),
        topicViews: getCounter('topic_views_by_forum', { forumId }),
        postsCreated: getCounter('posts_created_by_forum', { forumId }),
    };

    res.json(metrics);
});

/**
 * Topic-specific metrics
 */
router.get('/topic/:topicId/metrics', (req: Request, res: Response) => {
    const { topicId } = req.params;

    const metrics = {
        topicId,
        views: getCounter('topic_views', { topicId }),
        posts: getCounter('posts_created_by_topic', { topicId }),
    };

    res.json(metrics);
});

export { router as analyticsRoutes };
