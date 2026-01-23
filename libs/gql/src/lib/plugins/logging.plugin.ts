/* eslint-disable */
import { logger as rootLogger } from '@app/utils';
import crypto from 'crypto';
import type { IncomingMessage } from 'http';
import type { PostGraphilePlugin } from 'postgraphile';

/**
 * PostGraphile v4 runtime logging plugin
 */
export const LoggingPlugin: PostGraphilePlugin = {
    /**
     * Runs for every GraphQL HTTP request
     * Perfect place to setup request-scoped context
     */
    'postgraphile:http:graphqlRouteHandler'(req: IncomingMessage) {
        const traceId = (req as any)?.id?.toString() ?? req.headers['x-request-id']?.toString() ?? crypto.randomUUID();

        // Attach to request so it flows into contextValue
        (req as any).__traceId = traceId;
        (req as any).__startTime = performance.now();
        (req as any).__logger = rootLogger.child({ traceId });

        return req;
    },

    /**
     * Runs after execution, before response is sent
     */
    'postgraphile:http:result'(result) {
        const req = (result as any)?.meta?.req;
        const logger = req?.__logger ?? rootLogger;
        const start = req?.__startTime ?? performance.now();

        const durationMs = Math.round((performance.now() - start) * 100) / 100;

        if (result.errors?.length) {
            logger.warn({ durationMs, errors: result.errors }, 'GraphQL completed with errors');
        } else {
            logger.info({ durationMs }, 'GraphQL completed');
        }

        return result;
    },

    /**
     * Final HTTP response (even for batched requests)
     */
    'postgraphile:http:end'(payload) {
        // Optional: final hook, headers, metrics, etc.
        return payload;
    },
};

export default LoggingPlugin;
