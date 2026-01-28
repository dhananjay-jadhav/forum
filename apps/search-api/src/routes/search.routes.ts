/**
 * Search API Routes
 *
 * REST endpoints for searching forum content.
 */

import { Request, Response,Router } from 'express';

import { isSearchConsumerHealthy } from '../consumer/consumer.js';
import { isElasticsearchHealthy } from '../elasticsearch/client.js';
import { getContentById,searchContent, searchSuggestions } from '../elasticsearch/search.js';

const router = Router();

/**
 * Health check
 */
router.get('/health', async (_req: Request, res: Response) => {
    const esHealthy = await isElasticsearchHealthy();
    const kafkaHealthy = isSearchConsumerHealthy();

    const status = esHealthy && kafkaHealthy ? 'healthy' : esHealthy ? 'degraded' : 'unhealthy';

    res.json({
        status,
        elasticsearch: esHealthy ? 'connected' : 'disconnected',
        kafka: kafkaHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Search content
 * GET /api/search?q=query&type=topic&forumId=1&limit=20&offset=0
 */
router.get('/', async (req: Request, res: Response) => {
    const query = req.query['q'] as string;

    if (!query || query.trim().length === 0) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
    }

    const contentType = req.query['type'] as 'topic' | 'post' | 'user' | undefined;
    const forumId = req.query['forumId'] as string | undefined;
    const authorId = req.query['authorId'] as string | undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
    const offset = req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : 0;

    try {
        const results = await searchContent({
            query: query.trim(),
            contentType,
            forumId,
            authorId,
            limit: Math.min(limit, 100), // Cap at 100
            offset,
        });

        res.json({
            query,
            ...results,
        });
    } catch {
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * Search suggestions/autocomplete
 * GET /api/search/suggestions?q=prefix&type=topic&limit=10
 */
router.get('/suggestions', async (req: Request, res: Response) => {
    const prefix = req.query['q'] as string;

    if (!prefix || prefix.trim().length === 0) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
    }

    const contentType = req.query['type'] as 'topic' | 'post' | 'user' | undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10;

    try {
        const suggestions = await searchSuggestions(prefix.trim(), {
            contentType,
            limit: Math.min(limit, 20),
        });

        res.json({ suggestions });
    } catch {
        res.status(500).json({ error: 'Suggestions failed' });
    }
});

/**
 * Get content by type and ID
 * GET /api/search/content/:type/:id
 */
router.get('/content/:type/:id', async (req: Request, res: Response) => {
    const { type, id } = req.params;

    if (!['topic', 'post', 'user'].includes(type)) {
        res.status(400).json({ error: 'Invalid content type' });
        return;
    }

    try {
        const content = await getContentById(type, id);

        if (!content) {
            res.status(404).json({ error: 'Content not found' });
            return;
        }

        res.json(content);
    } catch {
        res.status(500).json({ error: 'Failed to get content' });
    }
});

/**
 * Search topics
 * GET /api/search/topics?q=query
 */
router.get('/topics', async (req: Request, res: Response) => {
    const query = req.query['q'] as string;

    if (!query || query.trim().length === 0) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
    }

    const forumId = req.query['forumId'] as string | undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
    const offset = req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : 0;

    try {
        const results = await searchContent({
            query: query.trim(),
            contentType: 'topic',
            forumId,
            limit: Math.min(limit, 100),
            offset,
        });

        res.json({ query, ...results });
    } catch {
        res.status(500).json({ error: 'Topic search failed' });
    }
});

/**
 * Search posts
 * GET /api/search/posts?q=query
 */
router.get('/posts', async (req: Request, res: Response) => {
    const query = req.query['q'] as string;

    if (!query || query.trim().length === 0) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
    }

    const forumId = req.query['forumId'] as string | undefined;
    const authorId = req.query['authorId'] as string | undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
    const offset = req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : 0;

    try {
        const results = await searchContent({
            query: query.trim(),
            contentType: 'post',
            forumId,
            authorId,
            limit: Math.min(limit, 100),
            offset,
        });

        res.json({ query, ...results });
    } catch {
        res.status(500).json({ error: 'Post search failed' });
    }
});

export { router as searchRoutes };
