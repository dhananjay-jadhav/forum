import Joi from 'joi';

import { ConfigError } from '../errors/errors';
import { logger } from '../logger/logger';

const envSchema = Joi.object({
    // Application
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    HOST: Joi.string().default('0.0.0.0'),
    PORT: Joi.number().port().default(3000),
    APP_NAME: Joi.string().default('postgraphile-api'),
    LOG_LEVEL: Joi.string().valid('trace', 'debug', 'info', 'warn', 'error', 'fatal').default('info'),
    SHUTDOWN_TIMEOUT: Joi.number().min(1000).default(10000),
    KEEP_ALIVE_TIMEOUT: Joi.number().min(1000).default(65000),
    APP_URL: Joi.string().uri().default('http://localhost:3000'),

    // Database
    DATABASE_URL: Joi.string()
        .pattern(/^postgres(ql)?:\/\/.+/)
        .default('postgres://postgres:postgres@localhost:5432/postgres'),
    DATABASE_SCHEMAS: Joi.string().default('public'),
    DATABASE_POOL_MAX: Joi.number().min(1).max(100).default(20),
    DATABASE_POOL_MIN: Joi.number().min(0).default(2),
    DATABASE_IDLE_TIMEOUT: Joi.number().min(1000).default(30000),
    DATABASE_CONNECTION_TIMEOUT: Joi.number().min(1000).default(5000),
    DATABASE_STATEMENT_TIMEOUT: Joi.number().min(1000).default(30000),
    DATABASE_QUERY_TIMEOUT: Joi.number().min(1000).default(30000),
    DATABASE_SSL: Joi.boolean().default(false),
    DATABASE_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(true),

    // Security
    JWT_SECRET: Joi.string().allow('').default(''),

    // CORS
    CORS_ORIGINS: Joi.string().allow('').default('http://localhost:4200,http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_MAX: Joi.number().min(1).default(100),
    RATE_LIMIT_WINDOW_MS: Joi.number().min(1000).default(60000), // 1 minute

    // GraphQL Security
    GRAPHQL_DEPTH_LIMIT: Joi.number().min(1).default(10),
    GRAPHQL_COST_LIMIT: Joi.number().min(1).default(1000),

    // Email Configuration
    SMTP_HOST: Joi.string().allow('').default(''),
    SMTP_PORT: Joi.number().port().default(587),
    SMTP_SECURE: Joi.boolean().default(false),
    SMTP_USER: Joi.string().allow('').default(''),
    SMTP_PASS: Joi.string().allow('').default(''),
    SMTP_FROM: Joi.string().default('noreply@example.com'),

    // Moderation Configuration
    MODERATION_ENABLED: Joi.boolean().default(true),
    MODERATION_SPAM_THRESHOLD: Joi.number().min(0).max(100).default(70),

    // Cleanup Configuration
    CLEANUP_UNVERIFIED_EMAIL_HOURS: Joi.number().min(1).default(48),
    CLEANUP_RESET_TOKEN_HOURS: Joi.number().min(1).default(24),
    CLEANUP_COMPLETED_JOB_DAYS: Joi.number().min(1).default(7),
    CLEANUP_FAILED_JOB_DAYS: Joi.number().min(1).default(30),

    // Kafka Configuration
    KAFKA_BROKERS: Joi.string().default('localhost:9092'),
    KAFKA_CLIENT_ID: Joi.string().default('forum-api'),
    KAFKA_GROUP_ID: Joi.string().default('forum-group'),
    KAFKA_ENABLED: Joi.boolean().default(true),
    KAFKA_CONNECTION_TIMEOUT: Joi.number().min(1000).default(10000),
    KAFKA_REQUEST_TIMEOUT: Joi.number().min(1000).default(30000),
    KAFKA_RETRY_INITIAL: Joi.number().min(1).default(100),
    KAFKA_RETRY_MAX: Joi.number().min(1000).default(30000),
    KAFKA_RETRIES: Joi.number().min(0).default(5),
    KAFKA_SSL: Joi.boolean().default(false),
    KAFKA_SASL_USERNAME: Joi.string().allow('').default(''),
    KAFKA_SASL_PASSWORD: Joi.string().allow('').default(''),
    KAFKA_SASL_MECHANISM: Joi.string().valid('plain', 'scram-sha-256', 'scram-sha-512').default('plain'),

    // Analytics API Configuration
    ANALYTICS_PORT: Joi.number().port().default(3002),
    METRICS_RETENTION_DAYS: Joi.number().min(1).default(90),

    // Search API Configuration
    SEARCH_PORT: Joi.number().port().default(3003),
    ELASTICSEARCH_URL: Joi.string().uri().default('http://localhost:9200'),
    ES_INDEX_PREFIX: Joi.string().default('forum'),

    // Debugging
    SHOW_SQL_QUERIES: Joi.boolean().default(false),
})
    .unknown(true)
    .options({ abortEarly: false });

export interface EnvConfig {
    // Application
    NODE_ENV: 'development' | 'test' | 'production';
    HOST: string;
    PORT: number;
    APP_NAME: string;
    LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    SHUTDOWN_TIMEOUT: number;
    KEEP_ALIVE_TIMEOUT: number;
    APP_URL: string;

    // Database
    DATABASE_URL: string;
    DATABASE_SCHEMAS: string;
    DATABASE_POOL_MAX: number;
    DATABASE_POOL_MIN: number;
    DATABASE_IDLE_TIMEOUT: number;
    DATABASE_CONNECTION_TIMEOUT: number;
    DATABASE_STATEMENT_TIMEOUT: number;
    DATABASE_QUERY_TIMEOUT: number;
    DATABASE_SSL: boolean;
    DATABASE_SSL_REJECT_UNAUTHORIZED: boolean;

    // Security
    JWT_SECRET: string;

    // CORS
    CORS_ORIGINS: string;

    // Rate Limiting
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_WINDOW_MS: number;

    // GraphQL Security
    GRAPHQL_DEPTH_LIMIT: number;
    GRAPHQL_COST_LIMIT: number;

    // Email Configuration
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;

    // Moderation Configuration
    MODERATION_ENABLED: boolean;
    MODERATION_SPAM_THRESHOLD: number;

    // Cleanup Configuration
    CLEANUP_UNVERIFIED_EMAIL_HOURS: number;
    CLEANUP_RESET_TOKEN_HOURS: number;
    CLEANUP_COMPLETED_JOB_DAYS: number;
    CLEANUP_FAILED_JOB_DAYS: number;

    // Kafka Configuration
    KAFKA_BROKERS: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    KAFKA_ENABLED: boolean;
    KAFKA_CONNECTION_TIMEOUT: number;
    KAFKA_REQUEST_TIMEOUT: number;
    KAFKA_RETRY_INITIAL: number;
    KAFKA_RETRY_MAX: number;
    KAFKA_RETRIES: number;
    KAFKA_SSL: boolean;
    KAFKA_SASL_USERNAME: string;
    KAFKA_SASL_PASSWORD: string;
    KAFKA_SASL_MECHANISM: 'plain' | 'scram-sha-256' | 'scram-sha-512';

    // Analytics API Configuration
    ANALYTICS_PORT: number;
    METRICS_RETENTION_DAYS: number;

    // Search API Configuration
    SEARCH_PORT: number;
    ELASTICSEARCH_URL: string;
    ES_INDEX_PREFIX: string;

    // Debugging
    SHOW_SQL_QUERIES: boolean;

    // Computed properties
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
}

function validateEnv(): EnvConfig {
    const { error, value } = envSchema.validate(process.env) as {
        error: Joi.ValidationError | undefined;
        value: EnvConfig;
    };

    if (error) {
        const validationErrors = error.details.map((d: Joi.ValidationErrorItem) => d.message);
        const errorMessage = `Environment validation failed:\n${validationErrors.map(e => `  - ${e}`).join('\n')}`;
        logger.error(errorMessage);
        throw new ConfigError(errorMessage, validationErrors);
    }

    const config: EnvConfig = {
        ...value,
        isProduction: value.NODE_ENV === 'production',
        isDevelopment: value.NODE_ENV === 'development',
        isTest: value.NODE_ENV === 'test',
    };

    logger.info({ env: config.NODE_ENV, port: config.PORT }, 'Environment configuration loaded');

    return config;
}

export const env = validateEnv();

export function getDatabaseSchemas(): string[] {
    return env.DATABASE_SCHEMAS.split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

/**
 * Get Kafka brokers as an array
 */
export function getKafkaBrokers(): string[] {
    return env.KAFKA_BROKERS.split(',')
        .map(b => b.trim())
        .filter(Boolean);
}
