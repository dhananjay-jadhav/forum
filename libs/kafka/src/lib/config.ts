/**
 * @app/kafka - Configuration
 *
 * Kafka configuration with environment variable support.
 */

import { env as appEnv, getKafkaBrokers, logger } from '@app/utils';

export interface KafkaConfig {
    /** Kafka broker addresses */
    brokers: string[];
    /** Client ID for this application */
    clientId: string;
    /** Consumer group ID */
    groupId: string;
    /** Connection timeout in ms */
    connectionTimeout: number;
    /** Request timeout in ms */
    requestTimeout: number;
    /** Enable SSL */
    ssl: boolean;
    /** SASL authentication */
    sasl?: {
        mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
        username: string;
        password: string;
    };
    /** Retry configuration */
    retry: {
        initialRetryTime: number;
        maxRetryTime: number;
        retries: number;
    };
}

/**
 * Get Kafka configuration from environment variables
 */
export function getKafkaConfig(): KafkaConfig {
    const brokers = getKafkaBrokers();

    const config: KafkaConfig = {
        brokers,
        clientId: appEnv.KAFKA_CLIENT_ID,
        groupId: appEnv.KAFKA_GROUP_ID,
        connectionTimeout: appEnv.KAFKA_CONNECTION_TIMEOUT,
        requestTimeout: appEnv.KAFKA_REQUEST_TIMEOUT,
        ssl: appEnv.KAFKA_SSL,
        retry: {
            initialRetryTime: appEnv.KAFKA_RETRY_INITIAL,
            maxRetryTime: appEnv.KAFKA_RETRY_MAX,
            retries: appEnv.KAFKA_RETRIES,
        },
    };

    // Add SASL if credentials provided
    if (appEnv.KAFKA_SASL_USERNAME && appEnv.KAFKA_SASL_PASSWORD) {
        config.sasl = {
            mechanism: appEnv.KAFKA_SASL_MECHANISM,
            username: appEnv.KAFKA_SASL_USERNAME,
            password: appEnv.KAFKA_SASL_PASSWORD,
        };
    }

    logger.debug({ brokers, clientId: config.clientId, groupId: config.groupId }, 'Kafka config loaded');

    return config;
}

/**
 * Default Kafka configuration
 */
export const defaultKafkaConfig = getKafkaConfig();
