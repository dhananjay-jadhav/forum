/**
 * Search API
 *
 * Kafka consumer and REST API for forum search.
 * Consumes content events from Forum API and indexes in Elasticsearch.
 */

import { logger } from '@app/utils';
import cors from 'cors';
import express, { NextFunction,Request, Response } from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import { startSearchConsumer, stopSearchConsumer } from './consumer/index.js';
import { closeElasticsearchClient,initializeIndices } from './elasticsearch/index.js';
import { searchRoutes } from './routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug({ method: req.method, url: req.url }, 'Search API request');
    next();
});

// API routes
app.use('/api/search', searchRoutes);

// Root health check
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'Search API',
        version: '1.0.0',
        status: 'running',
    });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err }, 'Search API error');
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutting down Search API');

    try {
        await stopSearchConsumer();
        await closeElasticsearchClient();
    } catch (error) {
        logger.error({ error }, 'Error during shutdown');
    }

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
async function start(): Promise<void> {
    try {
        // Initialize Elasticsearch indices
        try {
            await initializeIndices();
            logger.info('Elasticsearch indices initialized');
        } catch (error) {
            logger.warn({ error }, 'Elasticsearch initialization failed - search may not work');
        }

        // Start Kafka consumer if enabled
        if (config.kafkaEnabled) {
            try {
                await startSearchConsumer();
                logger.info('Kafka consumer started successfully');
            } catch (error) {
                logger.warn({ error }, 'Kafka consumer failed to start - running in API-only mode');
            }
        } else {
            logger.info('Kafka consumer disabled - running in API-only mode');
        }

        // Start HTTP server
        app.listen(config.port, config.host, () => {
            logger.info(
                { host: config.host, port: config.port, env: config.env },
                `Search API listening on http://${config.host}:${config.port}`
            );
        });
    } catch (error) {
        logger.error({ error }, 'Failed to start Search API');
        process.exit(1);
    }
}

void start();
