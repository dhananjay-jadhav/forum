/**
 * @app/email - Email Types
 *
 * Type definitions for email functionality.
 */

/**
 * Email configuration options
 */
export interface EmailConfig {
    /** SMTP host */
    host: string;
    /** SMTP port */
    port: number;
    /** Use secure connection (TLS) */
    secure: boolean;
    /** SMTP authentication */
    auth?: {
        user: string;
        pass: string;
    };
    /** Default from address */
    from: string;
    /** Application base URL for links */
    appUrl: string;
    /** Application name */
    appName: string;
}

/**
 * Email message options
 */
export interface EmailMessage {
    /** Recipient email address */
    to: string;
    /** Email subject */
    subject: string;
    /** Plain text content */
    text?: string;
    /** HTML content */
    html?: string;
    /** Optional from address (overrides default) */
    from?: string;
    /** Reply-to address */
    replyTo?: string;
}

/**
 * Email send result
 */
export interface EmailResult {
    /** Whether the email was sent successfully */
    success: boolean;
    /** Message ID if successful */
    messageId?: string;
    /** Error message if failed */
    error?: string;
}

/**
 * Email verification payload (from job)
 */
export interface EmailVerificationPayload {
    /** User email record ID */
    id: number;
}

/**
 * Password reset payload (from job)
 */
export interface PasswordResetPayload {
    /** User ID */
    id: number;
    /** User email */
    email: string;
    /** Reset token */
    token: string;
}

/**
 * Welcome email payload
 */
export interface WelcomeEmailPayload {
    /** User ID */
    userId: number;
    /** Username */
    username: string;
    /** User email */
    email: string;
    /** User display name */
    name?: string;
}

/**
 * Email template type
 */
export type EmailTemplate =
    | 'verification'
    | 'password-reset'
    | 'welcome'
    | 'topic-reply'
    | 'post-reply';
