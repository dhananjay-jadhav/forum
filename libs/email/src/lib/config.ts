/**
 * @app/email - Configuration
 *
 * Email configuration loaded from environment variables.
 */

import { env } from '@app/utils';

import type { EmailConfig } from './types.js';

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
    return {
        host: env.SMTP_HOST || 'localhost',
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth:
            env.SMTP_USER && env.SMTP_PASS
                ? {
                      user: env.SMTP_USER,
                      pass: env.SMTP_PASS,
                  }
                : undefined,
        from: env.SMTP_FROM,
        appUrl: env.APP_URL,
        appName: env.APP_NAME,
    };
}

/**
 * Default configuration for development
 */
export const defaultConfig: EmailConfig = {
    host: 'localhost',
    port: 1025, // MailHog default port
    secure: false,
    from: 'noreply@forum.local',
    appUrl: 'http://localhost:3000',
    appName: 'Forum',
};
