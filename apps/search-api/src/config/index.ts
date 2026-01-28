/**
 * Search API Configuration
 */

import { env } from '@app/utils';

export interface SearchConfig {
    /** Server port */
    port: number;
    /** Server host */
    host: string;
    /** Environment */
    env: 'development' | 'production' | 'test';
    /** Enable Kafka consumer */
    kafkaEnabled: boolean;
    /** Elasticsearch node URL */
    elasticsearchUrl: string;
    /** Elasticsearch index prefix */
    indexPrefix: string;
}

export function getConfig(): SearchConfig {
    return {
        port: env.SEARCH_PORT,
        host: env.HOST,
        env: env.NODE_ENV,
        kafkaEnabled: env.KAFKA_ENABLED,
        elasticsearchUrl: env.ELASTICSEARCH_URL,
        indexPrefix: env.ES_INDEX_PREFIX,
    };
}

export const config = getConfig();
