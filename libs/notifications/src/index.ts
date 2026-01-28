/**
 * @app/notifications
 *
 * Notification handling for the forum application.
 */

// Types
export type {
    BaseNotificationPayload,
    MentionNotificationPayload,
    NotificationChannel,
    NotificationPayload,
    NotificationPreferences,
    NotificationRecord,
    NotificationStatus,
    NotificationType,
    PostReplyNotificationPayload,
    SystemNotificationPayload,
    TopicReplyNotificationPayload,
    WelcomeNotificationPayload,
} from './lib/types.js';

// Service
export {
    defaultPreferences,
    getUserPreferences,
    notifySystem,
    notifyTopicReply,
    notifyWelcome,
    sendNotification,
} from './lib/service.js';
