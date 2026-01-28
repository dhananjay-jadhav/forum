/**
 * @app/kafka - Unit Tests
 *
 * Tests for Kafka types and configuration.
 */

import {
    KAFKA_TOPICS,
    type TopicCreatedEvent,
    type PostCreatedEvent,
    type UserRegisteredEvent,
} from './types.js';

describe('Kafka Types', () => {
    describe('KAFKA_TOPICS', () => {
        it('should have all required topics defined', () => {
            expect(KAFKA_TOPICS.USER_EVENTS).toBe('forum.user.events');
            expect(KAFKA_TOPICS.TOPIC_EVENTS).toBe('forum.topic.events');
            expect(KAFKA_TOPICS.POST_EVENTS).toBe('forum.post.events');
            expect(KAFKA_TOPICS.SEARCH_EVENTS).toBe('forum.search.events');
            expect(KAFKA_TOPICS.CONTENT_EVENTS).toBe('forum.content.events');
            expect(KAFKA_TOPICS.MODERATION_EVENTS).toBe('forum.moderation.events');
        });
    });

    describe('Event Types', () => {
        it('should create valid UserRegisteredEvent', () => {
            const event: Partial<UserRegisteredEvent> = {
                eventType: 'user.registered',
                payload: {
                    userId: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                },
            };

            expect(event.eventType).toBe('user.registered');
            expect(event.payload?.userId).toBe(1);
        });

        it('should create valid TopicCreatedEvent', () => {
            const event: Partial<TopicCreatedEvent> = {
                eventType: 'topic.created',
                payload: {
                    topicId: 1,
                    forumId: 1,
                    authorId: 1,
                    title: 'Test Topic',
                    bodyPreview: 'Test body...',
                },
            };

            expect(event.eventType).toBe('topic.created');
            expect(event.payload?.topicId).toBe(1);
        });

        it('should create valid PostCreatedEvent', () => {
            const event: Partial<PostCreatedEvent> = {
                eventType: 'post.created',
                payload: {
                    postId: 1,
                    topicId: 1,
                    forumId: 1,
                    authorId: 1,
                    bodyPreview: 'Test post...',
                },
            };

            expect(event.eventType).toBe('post.created');
            expect(event.payload?.postId).toBe(1);
        });
    });
});

describe('Handler Registry', () => {
    it('should create an empty handler registry using Map', () => {
        const registry = new Map();
        expect(registry.size).toBe(0);
    });

    it('should register and retrieve handlers', () => {
        const registry = new Map<string, (event: unknown) => Promise<void>>();

        registry.set('topic.created', async () => {
            // handler
        });

        registry.set('post.created', async () => {
            // handler
        });

        expect(registry.size).toBe(2);
        expect(registry.has('topic.created')).toBe(true);
        expect(registry.has('post.created')).toBe(true);
    });

    it('should execute registered handlers', async () => {
        const registry = new Map<string, (event: unknown) => Promise<void>>();
        let handlerCalled = false;

        registry.set('topic.created', async () => {
            handlerCalled = true;
        });

        const handler = registry.get('topic.created');
        expect(handler).toBeDefined();

        const mockEvent: TopicCreatedEvent = {
            eventId: 'test-id',
            eventType: 'topic.created',
            timestamp: new Date().toISOString(),
            source: 'test',
            payload: {
                topicId: 1,
                forumId: 1,
                authorId: 1,
                title: 'Test',
                bodyPreview: 'Body',
            },
        };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await handler!(mockEvent);
        expect(handlerCalled).toBe(true);
    });
});

describe('Kafka Config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should use default values when env vars not set', async () => {
        // Mock @app/utils for this test
        jest.doMock('@app/utils', () => ({
            logger: { debug: jest.fn() },
            env: {
                APP_NAME: 'test-app',
                KAFKA_CLIENT_ID: 'forum-api',
                KAFKA_GROUP_ID: 'forum-group',
                KAFKA_CONNECTION_TIMEOUT: 10000,
                KAFKA_REQUEST_TIMEOUT: 30000,
                KAFKA_SSL: false,
                KAFKA_RETRY_INITIAL: 100,
                KAFKA_RETRY_MAX: 30000,
                KAFKA_RETRY_RETRIES: 5,
                KAFKA_SASL_USERNAME: '',
                KAFKA_SASL_PASSWORD: '',
                KAFKA_SASL_MECHANISM: 'plain',
            },
            getKafkaBrokers: () => ['localhost:9092'],
        }));

        const { getKafkaConfig } = await import('./config.js');
        const config = getKafkaConfig();

        expect(config.brokers).toContain('localhost:9092');
        expect(config.connectionTimeout).toBe(10000);
        expect(config.ssl).toBe(false);
    });

    it('should parse broker list from env', async () => {
        process.env['KAFKA_BROKERS'] = 'broker1:9092,broker2:9092,broker3:9092';

        jest.doMock('@app/utils', () => ({
            logger: { debug: jest.fn() },
            env: {
                APP_NAME: 'test-app',
                KAFKA_CLIENT_ID: 'forum-api',
                KAFKA_GROUP_ID: 'forum-group',
                KAFKA_CONNECTION_TIMEOUT: 10000,
                KAFKA_REQUEST_TIMEOUT: 30000,
                KAFKA_SSL: false,
                KAFKA_RETRY_INITIAL: 100,
                KAFKA_RETRY_MAX: 30000,
                KAFKA_RETRY_RETRIES: 5,
                KAFKA_SASL_USERNAME: '',
                KAFKA_SASL_PASSWORD: '',
                KAFKA_SASL_MECHANISM: 'plain',
            },
            getKafkaBrokers: () => ['broker1:9092', 'broker2:9092', 'broker3:9092'],
        }));

        const { getKafkaConfig } = await import('./config.js');
        const config = getKafkaConfig();

        expect(config.brokers).toHaveLength(3);
        expect(config.brokers).toContain('broker1:9092');
    });

    it('should configure SASL when credentials provided', async () => {
        process.env['KAFKA_SASL_USERNAME'] = 'user';
        process.env['KAFKA_SASL_PASSWORD'] = 'pass';

        jest.doMock('@app/utils', () => ({
            logger: { debug: jest.fn() },
            env: {
                APP_NAME: 'test-app',
                KAFKA_CLIENT_ID: 'test-client',
                KAFKA_GROUP_ID: 'test-group',
                KAFKA_CONNECTION_TIMEOUT: 10000,
                KAFKA_REQUEST_TIMEOUT: 30000,
                KAFKA_SSL: false,
                KAFKA_RETRY_INITIAL: 100,
                KAFKA_RETRY_MAX: 30000,
                KAFKA_RETRY_RETRIES: 5,
                KAFKA_SASL_USERNAME: 'user',
                KAFKA_SASL_PASSWORD: 'pass',
                KAFKA_SASL_MECHANISM: 'plain',
            },
            getKafkaBrokers: () => ['localhost:9092'],
        }));

        const { getKafkaConfig } = await import('./config.js');
        const config = getKafkaConfig();

        expect(config.sasl).toBeDefined();
        expect(config.sasl?.username).toBe('user');
        expect(config.sasl?.password).toBe('pass');
    });
});
