/**
 * @app/email - Email Service
 *
 * High-level email sending functions for common use cases.
 */

import { logger } from '@app/utils';

import { getEmailConfig } from './config.js';
import { sendEmail } from './sender.js';
import {
    passwordResetTemplate,
    topicReplyTemplate,
    verificationEmailTemplate,
    welcomeEmailTemplate,
} from './templates.js';
import type { EmailResult } from './types.js';

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
    email: string,
    verificationToken: string
): Promise<EmailResult> {
    const config = getEmailConfig();
    const verificationLink = `${config.appUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const { subject, html, text } = verificationEmailTemplate(email, verificationLink, config);

    logger.info({ email }, 'Sending verification email');

    return sendEmail({
        to: email,
        subject,
        html,
        text,
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    userId: number,
    resetToken: string
): Promise<EmailResult> {
    const config = getEmailConfig();
    const resetLink = `${config.appUrl}/reset-password?token=${resetToken}&userId=${userId}`;

    const { subject, html, text } = passwordResetTemplate(email, resetLink, config);

    logger.info({ email, userId }, 'Sending password reset email');

    return sendEmail({
        to: email,
        subject,
        html,
        text,
    });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
    email: string,
    username: string,
    name?: string
): Promise<EmailResult> {
    const config = getEmailConfig();

    const { subject, html, text } = welcomeEmailTemplate(username, name, config);

    logger.info({ email, username }, 'Sending welcome email');

    return sendEmail({
        to: email,
        subject,
        html,
        text,
    });
}

/**
 * Send topic reply notification
 */
export async function sendTopicReplyNotification(
    recipientEmail: string,
    recipientName: string,
    topicId: number,
    topicTitle: string,
    replierName: string,
    replyPreview: string
): Promise<EmailResult> {
    const config = getEmailConfig();
    const topicLink = `${config.appUrl}/topics/${topicId}`;

    const { subject, html, text } = topicReplyTemplate(
        recipientName,
        topicTitle,
        replierName,
        replyPreview,
        topicLink,
        config
    );

    logger.info({ recipientEmail, topicId, replierName }, 'Sending topic reply notification');

    return sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
    });
}
