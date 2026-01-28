/**
 * @app/email
 *
 * Email sending functionality for the forum application.
 */

// Types
export type {
    EmailConfig,
    EmailMessage,
    EmailResult,
    EmailTemplate,
    EmailVerificationPayload,
    PasswordResetPayload,
    WelcomeEmailPayload,
} from './lib/types.js';

// Configuration
export { defaultConfig, getEmailConfig } from './lib/config.js';

// Sender
export { resetTransporter, sendEmail } from './lib/sender.js';

// High-level email functions
export {
    sendPasswordResetEmail,
    sendTopicReplyNotification,
    sendVerificationEmail,
    sendWelcomeEmail,
} from './lib/email.js';

// Templates (for custom usage)
export {
    passwordResetTemplate,
    topicReplyTemplate,
    verificationEmailTemplate,
    welcomeEmailTemplate,
} from './lib/templates.js';
