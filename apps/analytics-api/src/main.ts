/**
 * Analytics API
 *
 * Kafka consumer and REST API for forum analytics.
 * Consumes events from Forum API and provides metrics/dashboards.
 */

import { logger } from '@app/utils';
import cors from 'cors';
import express, { NextFunction,Request, Response } from 'express';
import helmet from 'helmet';

import { config } from './config/index.js';
import { startAnalyticsConsumer, stopAnalyticsConsumer } from './consumer/index.js';
import { analyticsRoutes } from './routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug({ method: req.method, url: req.url }, 'Analytics API request');
    next();
});

// API routes
app.use('/api/analytics', analyticsRoutes);

// Root health check
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'Analytics API',
        version: '1.0.0',
        status: 'running',
    });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err }, 'Analytics API error');
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutting down Analytics API');

    try {
        await stopAnalyticsConsumer();
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
        // Start Kafka consumer if enabled
        if (config.kafkaEnabled) {
            try {
                await startAnalyticsConsumer();
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
                `Analytics API listening on http://${config.host}:${config.port}`
            );
        });
    } catch (error) {
        logger.error({ error }, 'Failed to start Analytics API');
        process.exit(1);
    }
}

void start();
