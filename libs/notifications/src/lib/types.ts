/**
 * @app/notifications - Types
 *
 * Type definitions for notification functionality.
 */

/**
 * Notification types
 */
export type NotificationType =
    | 'topic_reply'
    | 'post_reply'
    | 'mention'
    | 'welcome'
    | 'forum_invite'
    | 'system';

/**
 * Notification delivery channel
 */
export type NotificationChannel = 'email' | 'in_app' | 'push';

/**
 * Notification status
 */
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

/**
 * Base notification payload
 */
export interface BaseNotificationPayload {
    /** Recipient user ID */
    userId: number;
    /** Notification type */
    type: NotificationType;
    /** Delivery channels */
    channels?: NotificationChannel[];
}

/**
 * Topic reply notification payload
 */
export interface TopicReplyNotificationPayload extends BaseNotificationPayload {
    type: 'topic_reply';
    /** Topic ID */
    topicId: number;
    /** Post ID of the reply */
    postId: number;
    /** Author of the reply */
    replyAuthorId: number;
}

/**
 * Post reply notification payload
 */
export interface PostReplyNotificationPayload extends BaseNotificationPayload {
    type: 'post_reply';
    /** Original post ID */
    postId: number;
    /** Reply post ID */
    replyPostId: number;
    /** Author of the reply */
    replyAuthorId: number;
}

/**
 * Mention notification payload
 */
export interface MentionNotificationPayload extends BaseNotificationPayload {
    type: 'mention';
    /** Post or topic where mention occurred */
    sourceId: number;
    /** Whether it's a post or topic */
    sourceType: 'post' | 'topic';
    /** Who mentioned the user */
    mentionedBy: number;
}

/**
 * Welcome notification payload
 */
export interface WelcomeNotificationPayload extends BaseNotificationPayload {
    type: 'welcome';
}

/**
 * System notification payload
 */
export interface SystemNotificationPayload extends BaseNotificationPayload {
    type: 'system';
    /** System message title */
    title: string;
    /** System message body */
    message: string;
}

/**
 * Union of all notification payloads
 */
export type NotificationPayload =
    | TopicReplyNotificationPayload
    | PostReplyNotificationPayload
    | MentionNotificationPayload
    | WelcomeNotificationPayload
    | SystemNotificationPayload;

/**
 * Notification record (stored in database)
 */
export interface NotificationRecord {
    id: number;
    userId: number;
    type: NotificationType;
    payload: Record<string, unknown>;
    status: NotificationStatus;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
    /** Enable email notifications */
    email: boolean;
    /** Enable in-app notifications */
    inApp: boolean;
    /** Enable push notifications */
    push: boolean;
    /** Types to receive */
    enabledTypes: NotificationType[];
}
