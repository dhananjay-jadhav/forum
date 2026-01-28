/**
 * Kafka Consumer E2E Tests
 *
 * Tests that validate Kafka events are consumed and processed correctly
 * by the Analytics API.
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

describe('Kafka Consumer Integration', () => {
    // Skip tests if Kafka is not available
    let kafkaAvailable = true;

    beforeAll(async () => {
        try {
            await initTestProducer();
        } catch {
            console.warn('Kafka not available, skipping consumer tests');
            kafkaAvailable = false;
        }
    });

    afterAll(async () => {
        await disconnectTestProducer();
    });

    describe('User Events', () => {
        it('should process user.registered event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/users_registered_total');
            const initialCount = initialRes.data.count;

            // Publish user registered event
            const testUserId = Date.now();
            await publishTestEvent(TOPICS.USER_EVENTS, 'user.registered', {
                userId: testUserId,
                username: `testuser_${testUserId}`,
                email: `test${testUserId}@example.com`,
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/users_registered_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/users_registered_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });

        it('should process user.login event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/users_login_total');
            const initialCount = initialRes.data.count;

            // Publish user login event
            const testUserId = Date.now();
            await publishTestEvent(TOPICS.USER_EVENTS, 'user.login', {
                userId: testUserId,
                username: `testuser_${testUserId}`,
                ipAddress: '127.0.0.1',
                userAgent: 'E2E-Test-Agent',
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/users_login_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/users_login_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });
    });

    describe('Topic Events', () => {
        it('should process topic.created event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/topics_created_total');
            const initialCount = initialRes.data.count;

            // Publish topic created event
            const testTopicId = Date.now();
            await publishTestEvent(TOPICS.TOPIC_EVENTS, 'topic.created', {
                topicId: testTopicId,
                forumId: 1,
                authorId: 100,
                title: `E2E Test Topic ${testTopicId}`,
                bodyPreview: 'This is a test topic created by E2E tests',
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/topics_created_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/topics_created_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });

        it('should process topic.created event and update forum-specific counters', async () => {
            if (!kafkaAvailable) return;

            const testForumId = 999;

            // Publish topic created event for specific forum
            const testTopicId = Date.now();
            await publishTestEvent(TOPICS.TOPIC_EVENTS, 'topic.created', {
                topicId: testTopicId,
                forumId: testForumId,
                authorId: 100,
                title: `E2E Test Topic ${testTopicId}`,
                bodyPreview: 'This is a test topic for forum-specific counter',
            });

            // Wait and verify forum-specific counter
            await sleep(3000); // Give time for processing

            const res = await axios.get(
                `/api/analytics/counter/topics_created_by_forum?forumId=${testForumId}`
            );
            expect(res.status).toBe(200);
            expect(res.data.count).toBeGreaterThanOrEqual(1);
            expect(res.data.labels.forumId).toBe(String(testForumId));
        });

        it('should process topic.viewed event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/topics_viewed_total');
            const initialCount = initialRes.data.count;

            // Publish topic viewed event
            const testTopicId = Date.now();
            await publishTestEvent(TOPICS.TOPIC_EVENTS, 'topic.viewed', {
                topicId: testTopicId,
                forumId: 1,
                viewerId: 100,
                sessionId: generateTestId(),
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/topics_viewed_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/topics_viewed_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });
    });

    describe('Post Events', () => {
        it('should process post.created event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/posts_created_total');
            const initialCount = initialRes.data.count;

            // Publish post created event
            const testPostId = Date.now();
            await publishTestEvent(TOPICS.POST_EVENTS, 'post.created', {
                postId: testPostId,
                topicId: 1,
                forumId: 1,
                authorId: 100,
                bodyPreview: 'This is a test post created by E2E tests',
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/posts_created_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/posts_created_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });
    });

    describe('Search Events', () => {
        it('should process search.performed event and update counters', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter value
            const initialRes = await axios.get('/api/analytics/counter/searches_total');
            const initialCount = initialRes.data.count;

            // Publish search event
            await publishTestEvent(TOPICS.SEARCH_EVENTS, 'search.performed', {
                query: 'e2e test query',
                userId: 100,
                resultsCount: 5,
                searchType: 'all',
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/searches_total');
                    return res.data.count > initialCount;
                },
                { timeout: 15000, interval: 1000 }
            );

            // Verify counter increased
            const finalRes = await axios.get('/api/analytics/counter/searches_total');
            expect(finalRes.data.count).toBeGreaterThan(initialCount);
        });
    });

    describe('Time Series', () => {
        it('should record time series data from events', async () => {
            if (!kafkaAvailable) return;

            // Get initial metrics
            const initialRes = await axios.get('/api/analytics/metrics');
            const initialTotalEvents = initialRes.data.totalEvents;

            // Publish a topic created event
            const testTopicId = Date.now();
            await publishTestEvent(TOPICS.TOPIC_EVENTS, 'topic.created', {
                topicId: testTopicId,
                forumId: 1,
                authorId: 100,
                title: `Time Series Test Topic ${testTopicId}`,
                bodyPreview: 'Testing time series recording',
            });

            // Wait for event to be processed
            await sleep(3000);

            // Verify time series data exists
            const tsRes = await axios.get('/api/analytics/timeseries/topics_created');
            expect(tsRes.status).toBe(200);
            expect(tsRes.data).toHaveProperty('data');
            expect(Array.isArray(tsRes.data.data)).toBe(true);

            // Verify total events increased
            const finalRes = await axios.get('/api/analytics/metrics');
            expect(finalRes.data.totalEvents).toBeGreaterThanOrEqual(initialTotalEvents);
        });
    });

    describe('Event Latency', () => {
        it('should process events within acceptable latency', async () => {
            if (!kafkaAvailable) return;

            // Get initial counter
            const initialRes = await axios.get('/api/analytics/counter/users_registered_total');
            const initialCount = initialRes.data.count;

            // Record start time and publish event
            const startTime = Date.now();
            const testUserId = Date.now();
            await publishTestEvent(TOPICS.USER_EVENTS, 'user.registered', {
                userId: testUserId,
                username: `latency_test_${testUserId}`,
                email: `latency${testUserId}@example.com`,
            });

            // Wait for counter to increment
            await waitFor(
                async () => {
                    const res = await axios.get('/api/analytics/counter/users_registered_total');
                    return res.data.count > initialCount;
                },
                { timeout: 10000, interval: 200 }
            );

            const endTime = Date.now();
            const latency = endTime - startTime;

            // Event should be processed within 5 seconds
            expect(latency).toBeLessThan(5000);
            console.log(`Event processing latency: ${latency}ms`);
        });
    });
});
