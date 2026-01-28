/**
 * Kafka Test Helper
 *
 * Provides utilities for publishing test events to Kafka
 * and waiting for consumers to process them in E2E tests.
 */

import { randomUUID } from 'node:crypto';

import { Kafka, Producer } from 'kafkajs';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
const DEFAULT_CLIENT_ID = 'e2e-test';

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let clientId = DEFAULT_CLIENT_ID;

/**
 * Initialize Kafka producer for tests
 */
export async function initTestProducer(testClientId?: string): Promise<Producer> {
    if (producer) return producer;

    clientId = testClientId ?? DEFAULT_CLIENT_ID;

    kafka = new Kafka({
        clientId,
        brokers: KAFKA_BROKERS,
        connectionTimeout: 5000,
        requestTimeout: 5000,
    });

    producer = kafka.producer();
    await producer.connect();
    return producer;
}

/**
 * Disconnect test producer
 */
export async function disconnectTestProducer(): Promise<void> {
    if (producer) {
        await producer.disconnect();
        producer = null;
        kafka = null;
    }
}

/**
 * Publish a test event to Kafka
 */
export async function publishTestEvent<T extends Record<string, unknown>>(
    topic: string,
    eventType: string,
    payload: T
): Promise<void> {
    const prod = producer ?? (await initTestProducer());

    const event = {
        eventId: randomUUID(),
        eventType,
        timestamp: new Date().toISOString(),
        source: clientId,
        payload,
    };

    await prod.send({
        topic,
        messages: [
            {
                key: event.eventId,
                value: JSON.stringify(event),
                headers: {
                    eventType,
                },
            },
        ],
    });
}

/**
 * Wait for a condition to be true (polling)
 */
export async function waitFor(
    condition: () => Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
): Promise<void> {
    const { timeout = 10000, interval = 500 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await sleep(interval);
    }

    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique test ID to avoid collisions
 */
export function generateTestId(): string {
    return `e2e-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Kafka topics for testing
 */
export const TEST_TOPICS = {
    USER_EVENTS: 'forum.user.events',
    TOPIC_EVENTS: 'forum.topic.events',
    POST_EVENTS: 'forum.post.events',
    SEARCH_EVENTS: 'forum.search.events',
    CONTENT_EVENTS: 'forum.content.events',
    MODERATION_EVENTS: 'forum.moderation.events',
} as const;
