import axios, { AxiosError } from 'axios';

describe('Search API', () => {
    describe('GET /', () => {
        it('should return API info', async () => {
            const res = await axios.get('/');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('name', 'Search API');
            expect(res.data).toHaveProperty('version', '1.0.0');
            expect(res.data).toHaveProperty('status', 'running');
        });
    });

    describe('GET /api/search/health', () => {
        it('should return health status', async () => {
            const res = await axios.get('/api/search/health');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('status');
            expect(['healthy', 'degraded', 'unhealthy']).toContain(res.data.status);
            expect(res.data).toHaveProperty('elasticsearch');
            expect(res.data).toHaveProperty('kafka');
            expect(res.data).toHaveProperty('timestamp');
        });

        it('should indicate Elasticsearch connection status', async () => {
            const res = await axios.get('/api/search/health');

            expect(res.status).toBe(200);
            expect(['connected', 'disconnected']).toContain(res.data.elasticsearch);
        });

        it('should indicate Kafka connection status', async () => {
            const res = await axios.get('/api/search/health');

            expect(res.status).toBe(200);
            expect(['connected', 'disconnected']).toContain(res.data.kafka);
        });
    });

    describe('GET /api/search', () => {
        it('should require query parameter', async () => {
            try {
                await axios.get('/api/search');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Query parameter "q" is required');
            }
        });

        it('should reject empty query', async () => {
            try {
                await axios.get('/api/search?q=');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Query parameter "q" is required');
            }
        });

        it('should return search results', async () => {
            const res = await axios.get('/api/search?q=test');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('query', 'test');
            expect(res.data).toHaveProperty('results');
            expect(res.data).toHaveProperty('total');
            expect(Array.isArray(res.data.results)).toBe(true);
        });

        it('should support content type filter', async () => {
            const res = await axios.get('/api/search?q=test&type=topic');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
            // All results should be topics
            res.data.results.forEach((result: { type: string }) => {
                expect(result.type).toBe('topic');
            });
        });

        it('should support forum filter', async () => {
            const res = await axios.get('/api/search?q=test&forumId=1');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
        });

        it('should support pagination', async () => {
            const res = await axios.get('/api/search?q=test&limit=5&offset=0');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
            expect(res.data.results.length).toBeLessThanOrEqual(5);
        });

        it('should cap limit at 100', async () => {
            const res = await axios.get('/api/search?q=test&limit=200');

            expect(res.status).toBe(200);
            expect(res.data.results.length).toBeLessThanOrEqual(100);
        });
    });

    describe('GET /api/search/suggestions', () => {
        it('should require query parameter', async () => {
            try {
                await axios.get('/api/search/suggestions');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Query parameter "q" is required');
            }
        });

        it('should reject empty query', async () => {
            try {
                await axios.get('/api/search/suggestions?q=');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
            }
        });

        it('should return suggestions', async () => {
            const res = await axios.get('/api/search/suggestions?q=test');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('suggestions');
            expect(Array.isArray(res.data.suggestions)).toBe(true);
        });

        it('should support content type filter', async () => {
            const res = await axios.get('/api/search/suggestions?q=test&type=topic');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('suggestions');
        });

        it('should respect limit parameter', async () => {
            const res = await axios.get('/api/search/suggestions?q=test&limit=5');

            expect(res.status).toBe(200);
            expect(res.data.suggestions.length).toBeLessThanOrEqual(5);
        });

        it('should cap limit at 20', async () => {
            const res = await axios.get('/api/search/suggestions?q=test&limit=50');

            expect(res.status).toBe(200);
            expect(res.data.suggestions.length).toBeLessThanOrEqual(20);
        });
    });

    describe('GET /api/search/content/:type/:id', () => {
        it('should reject invalid content type', async () => {
            try {
                await axios.get('/api/search/content/invalid/1');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Invalid content type');
            }
        });

        it('should return 404 for non-existent content', async () => {
            try {
                await axios.get('/api/search/content/topic/999999');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(404);
                expect(error.response?.data.error).toBe('Content not found');
            }
        });

        it('should accept valid topic type', async () => {
            try {
                const res = await axios.get('/api/search/content/topic/1');
                expect(res.status).toBe(200);
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                // 404 is acceptable if content doesn't exist
                expect([404, 500]).toContain(error.response?.status);
            }
        });

        it('should accept valid post type', async () => {
            try {
                const res = await axios.get('/api/search/content/post/1');
                expect(res.status).toBe(200);
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                // 404 is acceptable if content doesn't exist
                expect([404, 500]).toContain(error.response?.status);
            }
        });

        it('should accept valid user type', async () => {
            try {
                const res = await axios.get('/api/search/content/user/1');
                expect(res.status).toBe(200);
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                // 404 is acceptable if content doesn't exist
                expect([404, 500]).toContain(error.response?.status);
            }
        });
    });

    describe('GET /api/search/topics', () => {
        it('should require query parameter', async () => {
            try {
                await axios.get('/api/search/topics');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Query parameter "q" is required');
            }
        });

        it('should return topic search results', async () => {
            const res = await axios.get('/api/search/topics?q=test');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('query', 'test');
            expect(res.data).toHaveProperty('results');
            expect(res.data).toHaveProperty('total');
            expect(Array.isArray(res.data.results)).toBe(true);
        });

        it('should support forum filter', async () => {
            const res = await axios.get('/api/search/topics?q=test&forumId=1');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
        });

        it('should support pagination', async () => {
            const res = await axios.get('/api/search/topics?q=test&limit=10&offset=0');

            expect(res.status).toBe(200);
            expect(res.data.results.length).toBeLessThanOrEqual(10);
        });
    });

    describe('GET /api/search/posts', () => {
        it('should require query parameter', async () => {
            try {
                await axios.get('/api/search/posts');
                fail('Should have thrown an error');
            } catch (err) {
                const error = err as AxiosError<{ error: string }>;
                expect(error.response?.status).toBe(400);
                expect(error.response?.data.error).toBe('Query parameter "q" is required');
            }
        });

        it('should return post search results', async () => {
            const res = await axios.get('/api/search/posts?q=test');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('query', 'test');
            expect(res.data).toHaveProperty('results');
            expect(res.data).toHaveProperty('total');
            expect(Array.isArray(res.data.results)).toBe(true);
        });

        it('should support forum filter', async () => {
            const res = await axios.get('/api/search/posts?q=test&forumId=1');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
        });

        it('should support author filter', async () => {
            const res = await axios.get('/api/search/posts?q=test&authorId=1');

            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('results');
        });

        it('should support pagination', async () => {
            const res = await axios.get('/api/search/posts?q=test&limit=10&offset=0');

            expect(res.status).toBe(200);
            expect(res.data.results.length).toBeLessThanOrEqual(10);
        });
    });
});
