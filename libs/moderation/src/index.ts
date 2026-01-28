/**
 * @app/moderation
 *
 * Content moderation for the forum application.
 */

// Types
export type {
    ContentToModerate,
    ContentType,
    ModerationAction,
    ModerationIssue,
    ModerationJobPayload,
    ModerationLogEntry,
    ModerationReason,
    ModerationResult,
    ModerationStatus,
    SpamConfig,
} from './lib/types.js';

// Spam detection
export { defaultSpamConfig, detectSpam, isLikelySpam } from './lib/spam.js';

// Content filtering
export { detectPII, filterContent, sanitizeContent } from './lib/filter.js';

// Main service
export {
    analyzeContent,
    applyModerationAction,
    moderateContent,
    moderatePost,
    moderateTopic,
} from './lib/service.js';
