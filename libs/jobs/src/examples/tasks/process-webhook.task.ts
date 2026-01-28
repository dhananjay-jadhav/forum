/**
 * Example: Process Webhook Task
 *
 * Demonstrates processing external webhooks asynchronously.
 * Shows how to use job helpers for logging and progress tracking.
 */

import type { JobHelpers } from 'graphile-worker';

import { addJob } from '../../lib/queue.js';
import type { TypedTask } from '../../lib/types.js';

export interface WebhookPayload {
    source: 'stripe' | 'github' | 'slack';
    eventType: string;
    data: Record<string, unknown>;
    receivedAt: string;
    signature?: string;
}

export const PROCESS_WEBHOOK_TASK = 'process-webhook';

/**
 * Webhook processor that routes to specific handlers
 */
export const processWebhookTask: TypedTask<WebhookPayload> = async (
    payload: WebhookPayload,
    helpers: JobHelpers
) => {
    helpers.logger.info(
        `Processing ${payload.source} webhook: ${payload.eventType}`
    );

    switch (payload.source) {
        case 'stripe':
            await handleStripeWebhook(payload, helpers);
            break;
        case 'github':
            await handleGithubWebhook(payload, helpers);
            break;
        case 'slack':
            await handleSlackWebhook(payload, helpers);
            break;
    }

    helpers.logger.info('Webhook processed successfully');
};

async function handleStripeWebhook(
    payload: WebhookPayload,
    helpers: JobHelpers
): Promise<void> {
    const { eventType, data } = payload;

    switch (eventType) {
        case 'payment_intent.succeeded':
            helpers.logger.info(`Payment succeeded: ${data.id as string}`);
            // Process payment...
            break;
        case 'customer.subscription.updated':
            helpers.logger.info(`Subscription updated: ${data.id as string}`);
            // Update subscription...
            break;
        default:
            helpers.logger.debug(`Unhandled Stripe event: ${eventType}`);
    }

    // Add artificial delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 50));
}

async function handleGithubWebhook(
    payload: WebhookPayload,
    helpers: JobHelpers
): Promise<void> {
    const { eventType, data } = payload;

    switch (eventType) {
        case 'push':
            helpers.logger.info(`Push to repo: ${data.repository as string}`);
            break;
        case 'pull_request':
            helpers.logger.info(`PR ${data.action as string}: #${data.number as number}`);
            break;
        default:
            helpers.logger.debug(`Unhandled GitHub event: ${eventType}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
}

async function handleSlackWebhook(
    payload: WebhookPayload,
    helpers: JobHelpers
): Promise<void> {
    const { eventType, data } = payload;

    switch (eventType) {
        case 'message':
            helpers.logger.info(`Message in channel: ${data.channel as string}`);
            break;
        case 'app_mention':
            helpers.logger.info(`App mentioned by: ${data.user as string}`);
            break;
        default:
            helpers.logger.debug(`Unhandled Slack event: ${eventType}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Queue a webhook for processing
 */
export async function queueWebhook(
    webhook: Omit<WebhookPayload, 'receivedAt'>
): Promise<{ id: string }> {
    return addJob<WebhookPayload>(PROCESS_WEBHOOK_TASK, {
        ...webhook,
        receivedAt: new Date().toISOString(),
    });
}
