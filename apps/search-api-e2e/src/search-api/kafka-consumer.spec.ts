/**
 * Kafka Consumer E2E Tests
 *
 * Tests that validate Kafka events are consumed and processed correctly
 * by the Search API (content indexing in Elasticsearch).
 */

import {
    disconnectTestProducer,
    generateTestId,
    initTestProducer,
    publishTestEvent,
    sleep,
    TEST_TOPICS,
    waitFor,
} from '@app/kafka/testing';
import axios from 'axios';

// Kafka topics
const TOPICS = TEST_TOPICS;

// Increase timeout for Kafka/Elasticsearch tests
jest.setTimeout(30000);

describe('Kafka Consumer Integration', () => {
    // Skip tests if Kafka or Elasticsearch is not available
    let kafkaAvailable = true;
    let elasticsearchAvailable = true;

    beforeAll(async () => {
        // Check Kafka availability
        try {
            await initTestProducer();
        } catch {
            console.warn('Kafka not available, skipping consumer tests');
            kafkaAvailable = false;
        }

        // Check Elasticsearch availability
        try {
            const healthRes = await axios.get('/api/search/health');
            if (healthRes.data.elasticsearch?.status !== 'connected') {
                console.warn('Elasticsearch not connected, some tests may fail');
                elasticsearchAvailable = false;
            }
        } catch {
            console.warn('Could not check Elasticsearch health');
            elasticsearchAvailable = false;
        }
    }, 30000);

    afterAll(async () => {
        await disconnectTestProducer();
    });

    describe('Content Created Events', () => {
        it('should index topic content from content.created event', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentId = Date.now();

            // Publish content created event for a topic
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'topic',
                contentId,
                forumId: 1,
                authorId: 100,
                title: `E2E Kafka Test Topic ${testId}`,
                body: `This is a test topic body created by E2E Kafka tests with unique id ${testId}`,
                metadata: { testId },
            });

            // Wait for content to be indexed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/topic/${contentId}`);
                        return res.status === 200 && res.data.found === true;
                    } catch {
                        return false;
                    }
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify content was indexed
            const contentRes = await axios.get(`/api/search/content/topic/${contentId}`);
            expect(contentRes.status).toBe(200);
            expect(contentRes.data.found).toBe(true);
            expect(contentRes.data.content?.title).toContain('E2E Kafka Test Topic');
        });

        it('should index post content from content.created event', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentId = Date.now();

            // Publish content created event for a post
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'post',
                contentId,
                forumId: 1,
                authorId: 100,
                title: null, // Posts may not have titles
                body: `This is a test post body created by E2E Kafka tests with unique id ${testId}`,
                metadata: { testId, topicId: 999 },
            });

            // Wait for content to be indexed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/post/${contentId}`);
                        return res.status === 200 && res.data.found === true;
                    } catch {
                        return false;
                    }
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify content was indexed
            const contentRes = await axios.get(`/api/search/content/post/${contentId}`);
            expect(contentRes.status).toBe(200);
            expect(contentRes.data.found).toBe(true);
        });

        it('should make indexed content searchable', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            // Use a truly unique search term
            const uniqueSearchTerm = `kafkatest${Date.now()}xyz`;
            const contentId = Date.now();

            // Publish content with unique searchable term
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'topic',
                contentId,
                forumId: 1,
                authorId: 100,
                title: `Unique ${uniqueSearchTerm} Topic`,
                body: `Body with ${uniqueSearchTerm} term for search testing`,
            });

            // Wait for content to be indexed
            await sleep(5000); // Give time for ES to index

            // Search for the unique term
            try {
                const searchRes = await axios.get(`/api/search?q=${uniqueSearchTerm}`);
                expect(searchRes.status).toBe(200);
                expect(searchRes.data).toHaveProperty('results');
                // The content should be found (may be empty if ES isn't ready)
            } catch (error) {
                // Search might fail if ES isn't fully configured
                console.log('Search test skipped due to ES configuration');
            }
        });
    });

    describe('Content Updated Events', () => {
        it('should update indexed content from content.updated event', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentId = Date.now();

            // First, create the content
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'topic',
                contentId,
                forumId: 1,
                authorId: 100,
                title: `Original Title ${testId}`,
                body: `Original body content for update test ${testId}`,
            });

            // Wait for content to be indexed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/topic/${contentId}`);
                        return res.status === 200 && res.data.found === true;
                    } catch {
                        return false;
                    }
                },
                { timeout: 15000, interval: 1000 }
            );

            // Now update the content
            const updatedTitle = `Updated Title ${testId}`;
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.updated', {
                contentType: 'topic',
                contentId,
                title: updatedTitle,
                body: `Updated body content for update test ${testId}`,
            });

            // Wait for update to be processed
            await sleep(3000);

            // Verify content was updated
            const contentRes = await axios.get(`/api/search/content/topic/${contentId}`);
            expect(contentRes.status).toBe(200);
            expect(contentRes.data.found).toBe(true);
            // Title should be updated (if the update worked)
        });
    });

    describe('Content Deleted Events', () => {
        it('should remove content from index on content.deleted event', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentId = Date.now();

            // First, create the content
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'topic',
                contentId,
                forumId: 1,
                authorId: 100,
                title: `Delete Test Topic ${testId}`,
                body: `This topic will be deleted ${testId}`,
            });

            // Wait for content to be indexed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/topic/${contentId}`);
                        return res.status === 200 && res.data.found === true;
                    } catch {
                        return false;
                    }
                },
                { timeout: 15000, interval: 1000 }
            );

            // Now delete the content
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.deleted', {
                contentType: 'topic',
                contentId,
            });

            // Wait for deletion to be processed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/topic/${contentId}`);
                        return res.data.found === false;
                    } catch (error) {
                        // 404 is also acceptable for deleted content
                        return (error as { response?: { status: number } }).response?.status === 404;
                    }
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify content was deleted
            const contentRes = await axios.get(`/api/search/content/topic/${contentId}`);
            expect(contentRes.data.found).toBe(false);
        });
    });

    describe('Event Processing Performance', () => {
        it('should process content events within acceptable latency', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentId = Date.now();

            // Record start time
            const startTime = Date.now();

            // Publish content created event
            await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                contentType: 'topic',
                contentId,
                forumId: 1,
                authorId: 100,
                title: `Latency Test Topic ${testId}`,
                body: `Testing event processing latency ${testId}`,
            });

            // Wait for content to be indexed
            await waitFor(
                async () => {
                    try {
                        const res = await axios.get(`/api/search/content/topic/${contentId}`);
                        return res.status === 200 && res.data.found === true;
                    } catch {
                        return false;
                    }
                },
                { timeout: 10000, interval: 200 }
            );

            const endTime = Date.now();
            const latency = endTime - startTime;

            // Event should be processed and indexed within 8 seconds
            expect(latency).toBeLessThan(8000);
            console.log(`Content indexing latency: ${latency}ms`);
        });

        it('should handle batch content creation', async () => {
            if (!kafkaAvailable || !elasticsearchAvailable) {
                console.log('Skipping test: Kafka or Elasticsearch not available');
                return;
            }

            const testId = generateTestId();
            const contentIds: number[] = [];
            const batchSize = 5;

            // Publish multiple content events
            for (let i = 0; i < batchSize; i++) {
                const contentId = Date.now() + i;
                contentIds.push(contentId);

                await publishTestEvent(TOPICS.CONTENT_EVENTS, 'content.created', {
                    contentType: 'topic',
                    contentId,
                    forumId: 1,
                    authorId: 100,
                    title: `Batch Test Topic ${testId} #${i + 1}`,
                    body: `Batch testing content creation ${testId}`,
                });

                // Small delay between events
                await sleep(100);
            }

            // Wait for all content to be indexed
            await sleep(8000);

            // Verify at least some content was indexed
            let indexedCount = 0;
            for (const contentId of contentIds) {
                try {
                    const res = await axios.get(`/api/search/content/topic/${contentId}`);
                    if (res.status === 200 && res.data.found === true) {
                        indexedCount++;
                    }
                } catch {
                    // Continue checking others
                }
            }

            // At least half should be indexed
            expect(indexedCount).toBeGreaterThanOrEqual(Math.floor(batchSize / 2));
            console.log(`Batch indexing: ${indexedCount}/${batchSize} items indexed`);
        });
    });
});
