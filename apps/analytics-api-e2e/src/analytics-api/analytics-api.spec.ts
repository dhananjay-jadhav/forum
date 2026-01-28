import axios from 'axios';

describe('Analytics API', () => {
    describe('GET /', () => {
        it('should return API info', async () => {
            const res = await axios.get('/');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('name', 'Analytics API');
            expect(res.data).toHaveProperty('version', '1.0.0');
            expect(res.data).toHaveProperty('status', 'running');
        });
    });

    describe('GET /api/analytics/health', () => {
        it('should return health status', async () => {
            const res = await axios.get('/api/analytics/health');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('status');
            expect(['healthy', 'degraded']).toContain(res.data.status);
            expect(res.data).toHaveProperty('kafka');
            expect(res.data).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/analytics/metrics', () => {
        it('should return metrics summary', async () => {
            const res = await axios.get('/api/analytics/metrics');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('totalCounters');
            expect(res.data).toHaveProperty('totalTimeSeries');
            expect(res.data).toHaveProperty('totalEvents');
            expect(typeof res.data.totalCounters).toBe('number');
        });
    });

    describe('GET /api/analytics/counters', () => {
        it('should return all counters', async () => {
            const res = await axios.get('/api/analytics/counters');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('counters');
            expect(typeof res.data.counters).toBe('object');
        });

        it('should filter counters by prefix', async () => {
            const res = await axios.get('/api/analytics/counters?prefix=topics');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('counters');
            expect(Array.isArray(res.data.counters)).toBe(true);
            // All returned counters should have names starting with the prefix
            res.data.counters.forEach((counter: { name: string }) => {
                expect(counter.name.toLowerCase()).toContain('topics');
            });
        });
    });

    describe('GET /api/analytics/counter/:name', () => {
        it('should return specific counter value', async () => {
            const res = await axios.get('/api/analytics/counter/users_registered_total');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('name', 'users_registered_total');
            expect(res.data).toHaveProperty('labels');
            expect(res.data).toHaveProperty('count');
            expect(typeof res.data.count).toBe('number');
        });

        it('should support labels in query string', async () => {
            const res = await axios.get('/api/analytics/counter/topics_created_by_forum?forumId=1');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('name', 'topics_created_by_forum');
            expect(res.data.labels).toHaveProperty('forumId', '1');
            expect(res.data).toHaveProperty('count');
        });
    });

    describe('GET /api/analytics/timeseries/:name', () => {
        it('should return time series data', async () => {
            const res = await axios.get('/api/analytics/timeseries/topics_created');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('name', 'topics_created');
            expect(res.data).toHaveProperty('data');
            expect(Array.isArray(res.data.data)).toBe(true);
        });

        it('should respect limit parameter', async () => {
            const res = await axios.get('/api/analytics/timeseries/topics_created?limit=5');

            expect(res.status).toBe(200);
            expect(res.data.data.length).toBeLessThanOrEqual(5);
        });

        it('should support time range filtering', async () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

            const res = await axios.get(
                `/api/analytics/timeseries/topics_created?startTime=${oneHourAgo.toISOString()}&endTime=${now.toISOString()}`
            );

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('data');
            expect(Array.isArray(res.data.data)).toBe(true);
        });
    });

    describe('GET /api/analytics/events', () => {
        it('should return recent events', async () => {
            const res = await axios.get('/api/analytics/events');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('events');
            expect(res.data).toHaveProperty('count');
            expect(Array.isArray(res.data.events)).toBe(true);
        });

        it('should respect limit parameter', async () => {
            const res = await axios.get('/api/analytics/events?limit=10');

            expect(res.status).toBe(200);
            expect(res.data.count).toBeLessThanOrEqual(10);
        });
    });

    describe('GET /api/analytics/dashboard', () => {
        it('should return dashboard data', async () => {
            const res = await axios.get('/api/analytics/dashboard');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('overview');
            expect(res.data).toHaveProperty('activity');
            expect(res.data).toHaveProperty('trends');
            expect(res.data).toHaveProperty('meta');
        });

        it('should include overview metrics', async () => {
            const res = await axios.get('/api/analytics/dashboard');

            expect(res.status).toBe(200);
            expect(res.data.overview).toHaveProperty('totalUsers');
            expect(res.data.overview).toHaveProperty('totalLogins');
            expect(res.data.overview).toHaveProperty('totalTopics');
            expect(res.data.overview).toHaveProperty('totalPosts');
            expect(res.data.overview).toHaveProperty('totalSearches');
        });

        it('should include activity metrics', async () => {
            const res = await axios.get('/api/analytics/dashboard');

            expect(res.status).toBe(200);
            expect(res.data.activity).toHaveProperty('topicViews');
            expect(res.data.activity).toHaveProperty('topicsUpdated');
            expect(res.data.activity).toHaveProperty('postsUpdated');
            expect(res.data.activity).toHaveProperty('contentModerated');
        });

        it('should include trends data', async () => {
            const res = await axios.get('/api/analytics/dashboard');

            expect(res.status).toBe(200);
            expect(res.data.trends).toHaveProperty('topicsCreated');
            expect(res.data.trends).toHaveProperty('postsCreated');
            expect(res.data.trends).toHaveProperty('userLogins');
            expect(res.data.trends).toHaveProperty('searches');
        });

        it('should include meta information', async () => {
            const res = await axios.get('/api/analytics/dashboard');

            expect(res.status).toBe(200);
            expect(res.data.meta).toHaveProperty('totalCounters');
            expect(res.data.meta).toHaveProperty('totalEvents');
            expect(res.data.meta).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/analytics/forum/:forumId/metrics', () => {
        it('should return forum-specific metrics', async () => {
            const res = await axios.get('/api/analytics/forum/1/metrics');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('forumId', '1');
            expect(res.data).toHaveProperty('topicsCreated');
            expect(res.data).toHaveProperty('topicViews');
            expect(res.data).toHaveProperty('postsCreated');
        });
    });

    describe('GET /api/analytics/topic/:topicId/metrics', () => {
        it('should return topic-specific metrics', async () => {
            const res = await axios.get('/api/analytics/topic/1/metrics');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('topicId', '1');
            expect(res.data).toHaveProperty('views');
            expect(res.data).toHaveProperty('posts');
        });
    });
});
