/**
 * Example: API Integration with Graphile Worker
 *
 * Shows how to queue jobs from Express routes and middleware.
 */

import type { NextFunction, Request, Response } from 'express';

import {
    queueEmail,
    queueSingletonTask,
    queueWebhook,
    REFRESH_CACHE_TASK,
    type SendEmailPayload,
    startBatchOperation,
    type WebhookPayload,
} from './tasks/index.js';

/**
 * Middleware to queue welcome email after registration
 */
export function sendWelcomeEmailMiddleware() {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        // Run after response is sent
        res.on('finish', () => {
            if (
                req.method === 'POST' &&
                req.path === '/register' &&
                res.statusCode === 201
            ) {
                const { email, username } = req.body as {
                    email: string;
                    username: string;
                };

                // Queue in background - don't await
                void queueEmail({
                    to: email,
                    subject: 'Welcome to the Forum!',
                    body: `Hi ${username}, welcome to our community!`,
                });
            }
        });

        next();
    };
}

/**
 * Express route handlers for job management
 */
export const jobRoutes = {
    /**
     * POST /api/jobs/send-email
     */
    async sendEmail(req: Request, res: Response): Promise<void> {
        const { to, subject, body, html } = req.body as SendEmailPayload;

        const job = await queueEmail({ to, subject, body, html });

        res.json({ success: true, jobId: job.id });
    },

    /**
     * POST /api/webhooks/:source
     * Receive and queue webhooks for background processing
     */
    async receiveWebhook(req: Request, res: Response): Promise<void> {
        const source = req.params.source as WebhookPayload['source'];
        const eventType = req.headers['x-event-type'] as string;
        const signature = req.headers['x-signature'] as string;

        const job = await queueWebhook({
            source,
            eventType,
            data: req.body as Record<string, unknown>,
            signature,
        });

        // Return 202 Accepted immediately
        res.status(202).json({ accepted: true, jobId: job.id });
    },

    /**
     * POST /api/admin/batch
     */
    async startBatch(req: Request, res: Response): Promise<void> {
        const { operation, batchSize, totalCount } = req.body as {
            operation: 'sync-users' | 'update-stats' | 'cleanup-old-data';
            batchSize?: number;
            totalCount?: number;
        };

        const job = await startBatchOperation(operation, { batchSize, totalCount });

        res.json({ success: true, jobId: job.id });
    },

    /**
     * POST /api/admin/refresh-cache
     */
    async refreshCache(_req: Request, res: Response): Promise<void> {
        const job = await queueSingletonTask(REFRESH_CACHE_TASK);

        res.json({ success: true, jobId: job.id });
    },
};

/**
 * Example: Queue jobs from PostGraphile resolvers
 *
 * ```typescript
 * import { makeExtendSchemaPlugin, gql } from 'graphile-utils';
 * import { queueEmail } from '@app/jobs/examples';
 *
 * export const JobsPlugin = makeExtendSchemaPlugin(() => ({
 *   typeDefs: gql`
 *     extend type Mutation {
 *       sendEmail(to: String!, subject: String!, body: String!): SendEmailResult
 *     }
 *     type SendEmailResult {
 *       success: Boolean!
 *       jobId: String
 *     }
 *   `,
 *   resolvers: {
 *     Mutation: {
 *       sendEmail: async (_parent, args) => {
 *         const job = await queueEmail({
 *           to: args.to,
 *           subject: args.subject,
 *           body: args.body,
 *         });
 *         return { success: true, jobId: job.id };
 *       },
 *     },
 *   },
 * }));
 * ```
 */
