/**
 * @app/kafka - Consumer
 *
 * Kafka consumer for processing events.
 */

import { logger } from '@app/utils';
import {
    Consumer,
    ConsumerConfig,
    ConsumerSubscribeTopics,
    EachMessagePayload,
    Kafka,
    SASLOptions,
} from 'kafkajs';

import { getKafkaConfig, KafkaConfig } from './config.js';
import { ForumEvent, KafkaTopic } from './types.js';

let kafka: Kafka | null = null;
let consumer: Consumer | null = null;
let isConnected = false;
let isRunning = false;

/**
 * Convert our SASL config to kafkajs SASLOptions
 */
function getSaslOptions(sasl?: KafkaConfig['sasl']): SASLOptions | undefined {
    if (!sasl) return undefined;

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

export type EventHandler<T extends ForumEvent = ForumEvent> = (
    event: T,
    metadata: {
        topic: string;
        partition: number;
        offset: string;
    }
) => Promise<void>;

export interface ConsumerOptions {
    /** Topics to subscribe to */
    topics: KafkaTopic[];
    /** Whether to start from the beginning */
    fromBeginning?: boolean;
    /** Event handlers by event type */
    handlers: Map<string, EventHandler>;
    /** Default handler for unhandled events */
    defaultHandler?: EventHandler;
    /** Max concurrent message processing */
    concurrency?: number;
}

/**
 * Initialize the Kafka consumer
 */
export async function initConsumer(
    config?: Partial<KafkaConfig>,
    consumerConfig?: Partial<ConsumerConfig>
): Promise<Consumer> {
    if (consumer && isConnected) {
        return consumer;
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

    consumer = kafka.consumer({
        groupId: kafkaConfig.groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: 1048576, // 1MB
        ...consumerConfig,
    });

    // Connect with timeout
    const connectTimeout = kafkaConfig.connectionTimeout || 10000;
    const connectPromise = consumer.connect();
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Kafka consumer connection timeout after ${connectTimeout}ms`)), connectTimeout);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    isConnected = true;

    logger.info(
        { brokers: kafkaConfig.brokers, groupId: kafkaConfig.groupId },
        'Kafka consumer connected'
    );

    return consumer;
}

/**
 * Get the Kafka consumer instance
 */
export function getConsumer(): Consumer {
    if (!consumer || !isConnected) {
        throw new Error('Kafka consumer not initialized. Call initConsumer() first.');
    }
    return consumer;
}

/**
 * Disconnect the Kafka consumer
 */
export async function disconnectConsumer(): Promise<void> {
    if (consumer && isConnected) {
        if (isRunning) {
            await consumer.stop();
            isRunning = false;
        }
        await consumer.disconnect();
        isConnected = false;
        consumer = null;
        kafka = null;
        logger.info('Kafka consumer disconnected');
    }
}

/**
 * Subscribe and start consuming messages
 */
export async function startConsuming(options: ConsumerOptions): Promise<void> {
    const cons = getConsumer();

    const subscribeConfig: ConsumerSubscribeTopics = {
        topics: options.topics,
        fromBeginning: options.fromBeginning ?? false,
    };

    await cons.subscribe(subscribeConfig);

    logger.info({ topics: options.topics }, 'Subscribed to Kafka topics');

    await cons.run({
        eachMessage: async (payload: EachMessagePayload) => {
            const { topic, partition, message } = payload;
            const offset = message.offset;

            try {
                if (!message.value) {
                    logger.warn({ topic, partition, offset }, 'Received empty message');
                    return;
                }

                const event = JSON.parse(message.value.toString()) as ForumEvent;
                const eventType = event.eventType;

                logger.debug(
                    { topic, partition, offset, eventType, eventId: event.eventId },
                    'Processing Kafka message'
                );

                const handler = options.handlers.get(eventType) || options.defaultHandler;

                if (handler) {
                    await handler(event, { topic, partition: partition, offset });
                } else {
                    logger.warn({ eventType }, 'No handler registered for event type');
                }
            } catch (error) {
                logger.error(
                    { error, topic, partition, offset },
                    'Error processing Kafka message'
                );
                // In production, you might want to send to a dead letter queue
                throw error;
            }
        },
    });

    isRunning = true;
    logger.info('Kafka consumer started');
}

/**
 * Stop consuming messages
 */
export async function stopConsuming(): Promise<void> {
    if (consumer && isRunning) {
        await consumer.stop();
        isRunning = false;
        logger.info('Kafka consumer stopped');
    }
}

/**
 * Create an event handler registry
 */
export function createHandlerRegistry(): Map<string, EventHandler> {
    return new Map();
}

/**
 * Register an event handler
 */
export function registerHandler<T extends ForumEvent>(
    registry: Map<string, EventHandler>,
    eventType: T['eventType'],
    handler: EventHandler<T>
): void {
    registry.set(eventType, handler as EventHandler);
}

/**
 * Check if consumer is healthy
 */
export function isConsumerHealthy(): boolean {
    return isConnected && consumer !== null;
}

/**
 * Check if consumer is actively processing messages
 */
export function isConsumerRunning(): boolean {
    return isRunning;
}
