/**
 * @app/email - Email Sender
 *
 * Core email sending functionality using nodemailer-compatible interface.
 * In development, uses console logging. In production, would use actual SMTP.
 */

import { env, logger } from '@app/utils';

import { getEmailConfig } from './config.js';
import type { EmailConfig, EmailMessage, EmailResult } from './types.js';

// Simple transporter interface (nodemailer-compatible)
interface Transporter {
    sendMail(options: EmailMessage): Promise<{ messageId: string }>;
}

let transporter: Transporter | null = null;

/**
 * Create or get the email transporter
 */
function getTransporter(config: EmailConfig): Transporter {
    if (transporter) {
        return transporter;
    }

    // For development, use a mock transporter that logs emails
    if (env.isDevelopment) {
        transporter = {
            sendMail(options: EmailMessage): Promise<{ messageId: string }> {
                const messageId = `dev-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                logger.info(
                    {
                        messageId,
                        to: options.to,
                        subject: options.subject,
                        from: options.from || config.from,
                    },
                    'Email sent (dev mode - logged only)'
                );
                logger.debug({ html: options.html?.substring(0, 200) }, 'Email content preview');
                return Promise.resolve({ messageId });
            },
        };
    } else {
        // In production, you would use nodemailer:
        // import nodemailer from 'nodemailer';
        // transporter = nodemailer.createTransport({
        //     host: config.host,
        //     port: config.port,
        //     secure: config.secure,
        //     auth: config.auth,
        // });

        // For now, still use mock in production too
        transporter = {
            sendMail(options: EmailMessage): Promise<{ messageId: string }> {
                const messageId = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                logger.info(
                    {
                        messageId,
                        to: options.to,
                        subject: options.subject,
                    },
                    'Email would be sent in production'
                );
                return Promise.resolve({ messageId });
            },
        };
    }

    return transporter;
}

/**
 * Send an email
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
    const config = getEmailConfig();

    try {
        const transport = getTransporter(config);
        const result = await transport.sendMail({
            ...message,
            from: message.from || config.from,
        });

        logger.info({ messageId: result.messageId, to: message.to }, 'Email sent successfully');

        return {
            success: true,
            messageId: result.messageId,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, to: message.to, subject: message.subject }, 'Failed to send email');

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Reset the transporter (for testing)
 */
export function resetTransporter(): void {
    transporter = null;
}
