/**
 * @app/email - Email Templates
 *
 * HTML and text templates for various email types.
 */

import type { EmailConfig } from './types.js';

/**
 * Base HTML template wrapper
 */
function baseTemplate(content: string, config: EmailConfig): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.appName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .content { padding: 30px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .button:hover { background-color: #0056b3; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .code { background-color: #f4f4f4; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.appName}</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${config.appName}. All rights reserved.</p>
        <p>This email was sent from <a href="${config.appUrl}">${config.appUrl}</a></p>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Email verification template
 */
export function verificationEmailTemplate(
    email: string,
    verificationLink: string,
    config: EmailConfig
): { subject: string; html: string; text: string } {
    const subject = `Verify your email address - ${config.appName}`;

    const html = baseTemplate(
        `
        <h2>Verify Your Email Address</h2>
        <p>Hi there!</p>
        <p>Please click the button below to verify your email address (<strong>${email}</strong>):</p>
        <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
    `,
        config
    );

    const text = `
Verify Your Email Address

Hi there!

Please click the link below to verify your email address (${email}):

${verificationLink}

If you didn't create an account, you can safely ignore this email.

This link will expire in 24 hours.

---
${config.appName}
${config.appUrl}
    `.trim();

    return { subject, html, text };
}

/**
 * Password reset template
 */
export function passwordResetTemplate(
    email: string,
    resetLink: string,
    config: EmailConfig
): { subject: string; html: string; text: string } {
    const subject = `Reset your password - ${config.appName}`;

    const html = baseTemplate(
        `
        <h2>Reset Your Password</h2>
        <p>Hi there!</p>
        <p>We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
        <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p><strong>If you didn't request a password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
    `,
        config
    );

    const text = `
Reset Your Password

Hi there!

We received a request to reset the password for your account associated with ${email}.

Click the link below to reset your password:

${resetLink}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

This link will expire in 1 hour.

---
${config.appName}
${config.appUrl}
    `.trim();

    return { subject, html, text };
}

/**
 * Welcome email template
 */
export function welcomeEmailTemplate(
    username: string,
    name: string | undefined,
    config: EmailConfig
): { subject: string; html: string; text: string } {
    const displayName = name || username;
    const subject = `Welcome to ${config.appName}!`;

    const html = baseTemplate(
        `
        <h2>Welcome to ${config.appName}!</h2>
        <p>Hi ${displayName}!</p>
        <p>Thank you for joining our community. We're excited to have you here!</p>
        <p>Here are some things you can do to get started:</p>
        <ul>
            <li><strong>Complete your profile</strong> - Add a photo and bio to let others know who you are</li>
            <li><strong>Browse forums</strong> - Explore our forums and find topics that interest you</li>
            <li><strong>Start a topic</strong> - Share your thoughts and start a conversation</li>
            <li><strong>Join the discussion</strong> - Reply to topics and engage with other members</li>
        </ul>
        <p style="text-align: center;">
            <a href="${config.appUrl}" class="button">Get Started</a>
        </p>
        <p>If you have any questions, feel free to reach out. We're here to help!</p>
        <p>Happy posting!</p>
    `,
        config
    );

    const text = `
Welcome to ${config.appName}!

Hi ${displayName}!

Thank you for joining our community. We're excited to have you here!

Here are some things you can do to get started:

- Complete your profile - Add a photo and bio to let others know who you are
- Browse forums - Explore our forums and find topics that interest you
- Start a topic - Share your thoughts and start a conversation
- Join the discussion - Reply to topics and engage with other members

Visit ${config.appUrl} to get started.

If you have any questions, feel free to reach out. We're here to help!

Happy posting!

---
${config.appName}
${config.appUrl}
    `.trim();

    return { subject, html, text };
}

/**
 * Topic reply notification template
 */
export function topicReplyTemplate(
    recipientName: string,
    topicTitle: string,
    replierName: string,
    replyPreview: string,
    topicLink: string,
    config: EmailConfig
): { subject: string; html: string; text: string } {
    const subject = `New reply to "${topicTitle}" - ${config.appName}`;

    const html = baseTemplate(
        `
        <h2>New Reply to Your Topic</h2>
        <p>Hi ${recipientName}!</p>
        <p><strong>${replierName}</strong> replied to your topic "<strong>${topicTitle}</strong>":</p>
        <blockquote style="border-left: 4px solid #ddd; margin: 20px 0; padding: 10px 20px; color: #666;">
            ${replyPreview}
        </blockquote>
        <p style="text-align: center;">
            <a href="${topicLink}" class="button">View Reply</a>
        </p>
    `,
        config
    );

    const text = `
New Reply to Your Topic

Hi ${recipientName}!

${replierName} replied to your topic "${topicTitle}":

"${replyPreview}"

View the reply: ${topicLink}

---
${config.appName}
${config.appUrl}
    `.trim();

    return { subject, html, text };
}
