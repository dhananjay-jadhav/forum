/**
 * Analytics API Configuration
 */

import { env } from '@app/utils';

export interface AnalyticsConfig {
    /** Server port */
    port: number;
    /** Server host */
    host: string;
    /** Environment */
    env: 'development' | 'production' | 'test';
    /** Enable Kafka consumer */
    kafkaEnabled: boolean;
    /** Metrics retention in days */
    metricsRetentionDays: number;
}

export function getConfig(): AnalyticsConfig {
    return {
        port: env.ANALYTICS_PORT,
        host: env.HOST,
        env: env.NODE_ENV,
        kafkaEnabled: env.KAFKA_ENABLED,
        metricsRetentionDays: env.METRICS_RETENTION_DAYS,
    };
}

export const config = getConfig();
