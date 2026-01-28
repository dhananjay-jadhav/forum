/**
 * @app/moderation - Types
 *
 * Type definitions for content moderation functionality.
 */

/**
 * Moderation action types
 */
export type ModerationAction =
    | 'approve'
    | 'reject'
    | 'flag'
    | 'hide'
    | 'delete'
    | 'warn_user'
    | 'suspend_user';

/**
 * Moderation status
 */
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

/**
 * Content type for moderation
 */
export type ContentType = 'post' | 'topic' | 'user_profile';

/**
 * Moderation reason codes
 */
export type ModerationReason =
    | 'spam'
    | 'offensive'
    | 'harassment'
    | 'off_topic'
    | 'duplicate'
    | 'illegal'
    | 'other';

/**
 * Moderation result from content analysis
 */
export interface ModerationResult {
    /** Whether the content passed moderation */
    passed: boolean;
    /** Confidence score (0-1) */
    confidence: number;
    /** Detected issues */
    issues: ModerationIssue[];
    /** Recommended action */
    recommendedAction: ModerationAction;
    /** Whether manual review is needed */
    needsReview: boolean;
}

/**
 * Detected moderation issue
 */
export interface ModerationIssue {
    /** Issue type */
    type: ModerationReason;
    /** Severity (0-1) */
    severity: number;
    /** Description of the issue */
    description: string;
    /** Matched patterns or keywords */
    matches?: string[];
}

/**
 * Content to be moderated
 */
export interface ContentToModerate {
    /** Content ID */
    id: number;
    /** Content type */
    type: ContentType;
    /** Text content to analyze */
    text: string;
    /** Author user ID */
    authorId: number;
    /** Additional context */
    context?: {
        forumId?: number;
        topicId?: number;
        isFirstPost?: boolean;
    };
}

/**
 * Moderation job payload
 */
export interface ModerationJobPayload {
    /** Content ID */
    contentId: number;
    /** Content type */
    contentType: ContentType;
}

/**
 * Moderation log entry
 */
export interface ModerationLogEntry {
    id: number;
    contentId: number;
    contentType: ContentType;
    action: ModerationAction;
    reason: ModerationReason;
    moderatorId?: number;
    isAutomatic: boolean;
    notes?: string;
    createdAt: Date;
}

/**
 * Spam detection configuration
 */
export interface SpamConfig {
    /** Blocked words/patterns */
    blockedPatterns: RegExp[];
    /** URL threshold (max URLs allowed) */
    maxUrls: number;
    /** Minimum content length */
    minLength: number;
    /** Maximum content length */
    maxLength: number;
    /** Check for repeated characters */
    checkRepeatedChars: boolean;
    /** Minimum account age for posting (hours) */
    minAccountAgeHours: number;
}
