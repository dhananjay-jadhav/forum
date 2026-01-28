/**
 * @app/kafka
 *
 * Kafka messaging library for the Forum application.
 * Provides event publishing and consuming capabilities.
 */

// Configuration
export { getKafkaConfig, defaultKafkaConfig } from './lib/config.js';
export type { KafkaConfig } from './lib/config.js';

// Types
export {
    KAFKA_TOPICS,
    type KafkaTopic,
    type BaseEvent,
    type ForumEvent,
    type UserEvent,
    type TopicEvent,
    type PostEvent,
    type SearchEvent,
    type ContentEvent,
    type UserRegisteredEvent,
    type UserLoginEvent,
    type UserUpdatedEvent,
    type TopicCreatedEvent,
    type TopicUpdatedEvent,
    type TopicDeletedEvent,
    type TopicViewedEvent,
    type PostCreatedEvent,
    type PostUpdatedEvent,
    type PostDeletedEvent,
    type SearchPerformedEvent,
    type ContentCreatedEvent,
    type ContentUpdatedEvent,
    type ContentDeletedEvent,
    type ContentModeratedEvent,
} from './lib/types.js';

// Producer
export {
    initProducer,
    getProducer,
    disconnectProducer,
    publishEvent,
    publishEvents,
    isProducerHealthy,
} from './lib/producer.js';

// Consumer
export {
    initConsumer,
    getConsumer,
    disconnectConsumer,
    startConsuming,
    stopConsuming,
    createHandlerRegistry,
    registerHandler,
    isConsumerHealthy,
    isConsumerRunning,
} from './lib/consumer.js';
export type { EventHandler, ConsumerOptions } from './lib/consumer.js';

// High-level Publisher Service
export {
    initEventPublisher,
    publishUserRegistered,
    publishUserLogin,
    publishUserUpdated,
    publishTopicCreated,
    publishTopicUpdated,
    publishTopicDeleted,
    publishTopicViewed,
    publishPostCreated,
    publishPostUpdated,
    publishPostDeleted,
    publishSearchPerformed,
    publishContentModerated,
    publishContentCreated,
    publishContentUpdated,
    publishContentDeleted,
} from './lib/publisher.js';

// Test Helpers are exported from '@app/kafka/testing' to avoid ESM issues in Jest
// import { initTestProducer, ... } from '@app/kafka/testing';
