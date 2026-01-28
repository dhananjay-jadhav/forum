/**
 * @app/kafka - Producer
 *
 * Kafka producer for publishing events.
 */

import { logger } from '@app/utils';
import { Kafka, Producer, ProducerConfig, RecordMetadata, SASLOptions } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

import { getKafkaConfig, KafkaConfig } from './config.js';
import { BaseEvent, ForumEvent, KafkaTopic } from './types.js';

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let isConnected = false;

/**
 * Convert our SASL config to kafkajs SASLOptions
 */
function getSaslOptions(sasl?: KafkaConfig['sasl']): SASLOptions | undefined {
    if (!sasl) return undefined;

    // kafkajs requires specific discriminated union types
    switch (sasl.mechanism) {
        case 'plain':
            return {
                mechanism: 'plain' as const,
                username: sasl.username,
                password: sasl.password,
            };
        case 'scram-sha-256':
            return {
                mechanism: 'scram-sha-256' as const,
                username: sasl.username,
                password: sasl.password,
            };
        case 'scram-sha-512':
            return {
                mechanism: 'scram-sha-512' as const,
                username: sasl.username,
                password: sasl.password,
            };
        default:
            return undefined;
    }
}

/**
 * Initialize the Kafka producer
 */
export async function initProducer(config?: Partial<KafkaConfig>): Promise<Producer> {
    if (producer && isConnected) {
        return producer;
    }

    const kafkaConfig = { ...getKafkaConfig(), ...config };

    kafka = new Kafka({
        clientId: kafkaConfig.clientId,
        brokers: kafkaConfig.brokers,
        connectionTimeout: kafkaConfig.connectionTimeout,
        requestTimeout: kafkaConfig.requestTimeout,
        ssl: kafkaConfig.ssl,
        sasl: getSaslOptions(kafkaConfig.sasl),
        retry: kafkaConfig.retry,
    });

    const producerConfig: ProducerConfig = {
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
    };

    producer = kafka.producer(producerConfig);

    // Connect with timeout
    const connectTimeout = kafkaConfig.connectionTimeout || 10000;
    const connectPromise = producer.connect();
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Kafka producer connection timeout after ${connectTimeout}ms`)), connectTimeout);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    isConnected = true;

    logger.info({ brokers: kafkaConfig.brokers, clientId: kafkaConfig.clientId }, 'Kafka producer connected');

    return producer;
}

/**
 * Get the Kafka producer instance
 */
export function getProducer(): Producer {
    if (!producer || !isConnected) {
        throw new Error('Kafka producer not initialized. Call initProducer() first.');
    }
    return producer;
}

/**
 * Disconnect the Kafka producer
 */
export async function disconnectProducer(): Promise<void> {
    if (producer && isConnected) {
        await producer.disconnect();
        isConnected = false;
        producer = null;
        kafka = null;
        logger.info('Kafka producer disconnected');
    }
}

/**
 * Publish an event to a Kafka topic
 */
export async function publishEvent<T extends ForumEvent>(
    topic: KafkaTopic,
    event: Omit<T, 'eventId' | 'timestamp' | 'source'>
): Promise<RecordMetadata[]> {
    const prod = getProducer();

    const fullEvent: BaseEvent & typeof event = {
        eventId: uuidv4(),
        timestamp: new Date().toISOString(),
        source: getKafkaConfig().clientId,
        ...event,
    };

    const result = await prod.send({
        topic,
        messages: [
            {
                key: getEventKey(fullEvent),
                value: JSON.stringify(fullEvent),
                headers: {
                    eventType: fullEvent.eventType,
                    correlationId: fullEvent.correlationId || '',
                },
            },
        ],
    });

    logger.debug(
        { topic, eventType: fullEvent.eventType, eventId: fullEvent.eventId },
        'Event published to Kafka'
    );

    return result;
}

/**
 * Publish multiple events in a batch
 */
export async function publishEvents<T extends ForumEvent>(
    topic: KafkaTopic,
    events: Array<Omit<T, 'eventId' | 'timestamp' | 'source'>>
): Promise<RecordMetadata[]> {
    const prod = getProducer();
    const source = getKafkaConfig().clientId;

    const messages = events.map((event) => {
        const fullEvent: BaseEvent & typeof event = {
            eventId: uuidv4(),
            timestamp: new Date().toISOString(),
            source,
            ...event,
        };

        return {
            key: getEventKey(fullEvent),
            value: JSON.stringify(fullEvent),
            headers: {
                eventType: fullEvent.eventType,
                correlationId: fullEvent.correlationId || '',
            },
        };
    });

    const result = await prod.send({
        topic,
        messages,
    });

    logger.debug({ topic, count: events.length }, 'Batch events published to Kafka');

    return result;
}

/**
 * Get event key for partitioning
 */
function getEventKey(event: BaseEvent & { payload?: Record<string, unknown> }): string {
    const payload = event.payload as Record<string, unknown> | undefined;

    // Use userId, topicId, or postId as partition key for ordering
    if (payload?.userId) return `user:${String(payload.userId)}`;
    if (payload?.topicId) return `topic:${String(payload.topicId)}`;
    if (payload?.postId) return `post:${String(payload.postId)}`;
    if (payload?.contentId) return `content:${String(payload.contentType)}:${String(payload.contentId)}`;

    return event.eventId;
}

/**
 * Check if producer is healthy
 */
export function isProducerHealthy(): boolean {
    return isConnected && producer !== null;
}
