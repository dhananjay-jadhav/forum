/**
 * Example: Send Email Task
 *
 * A common task pattern for sending emails asynchronously.
 * Demonstrates typed payloads and JobHelpers usage.
 */

import type { JobHelpers } from 'graphile-worker';

import { addJob } from '../../lib/queue.js';
import type { TypedTask } from '../../lib/types.js';

// Define the payload interface for type safety
export interface SendEmailPayload {
    to: string;
    subject: string;
    body: string;
    html?: string;
    replyTo?: string;
}

// Task identifier constant
export const SEND_EMAIL_TASK = 'send-email';

/**
 * Send email task handler
 *
 * In production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Postmark
 * - Nodemailer
 */
export const sendEmailTask: TypedTask<SendEmailPayload> = async (
    payload: SendEmailPayload,
    helpers: JobHelpers
) => {
    const { to, subject, body } = payload;

    helpers.logger.info(`Sending email to ${to}: ${subject}`);

    // Validate payload
    if (!to || !subject || !body) {
        throw new Error('Missing required email fields');
    }

    // Simulate email sending
    await simulateSendEmail(payload);

    helpers.logger.info(`Email sent successfully to ${to}`);
};

async function simulateSendEmail(payload: SendEmailPayload): Promise<void> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`[SIMULATED] Email sent to ${payload.to}: ${payload.subject}`);
}

/**
 * Queue an email to be sent
 */
export async function queueEmail(
    email: SendEmailPayload,
    options?: { priority?: number; runAt?: Date }
): Promise<{ id: string }> {
    return addJob<SendEmailPayload>(SEND_EMAIL_TASK, email, {
        priority: options?.priority,
        runAt: options?.runAt,
    });
}

/**
 * Queue a unique email (deduplicated by jobKey)
 */
export async function queueUniqueEmail(
    email: SendEmailPayload,
    jobKey: string
): Promise<{ id: string }> {
    return addJob<SendEmailPayload>(SEND_EMAIL_TASK, email, {
        jobKey,
        jobKeyMode: 'preserve_run_at',
    });
}
