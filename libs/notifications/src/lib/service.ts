/**
 * @app/notifications - Notification Service
 *
 * Core notification functionality for handling user notifications.
 */

import { getPool } from '@app/database';
import { sendTopicReplyNotification, sendWelcomeEmail } from '@app/email';
import { logger } from '@app/utils';

import type {
    NotificationChannel,
    NotificationPayload,
    NotificationPreferences,
    SystemNotificationPayload,
    TopicReplyNotificationPayload,
    WelcomeNotificationPayload,
} from './types.js';

// Database row types
interface UserDetailsRow {
    email: string | null;
    username: string;
    name?: string;
}

interface TopicReplyRow {
    title: string;
    body: string;
    replier_name: string;
}

/**
 * Default notification preferences
 */
export const defaultPreferences: NotificationPreferences = {
    email: true,
    inApp: true,
    push: false,
    enabledTypes: ['topic_reply', 'post_reply', 'mention', 'welcome', 'system'],
};

/**
 * Get user's notification preferences
 */
export function getUserPreferences(userId: number): Promise<NotificationPreferences> {
    // For now, return defaults. In future, this could be stored in user_settings table
    logger.debug({ userId }, 'Getting notification preferences');
    return Promise.resolve(defaultPreferences);
}

/**
 * Get user details for notification
 */
async function getUserDetails(userId: number): Promise<UserDetailsRow | null> {
    const pool = getPool();
    const result = await pool.query<UserDetailsRow>(
        `SELECT u.username, u.name, ue.email 
         FROM app_public.users u
         LEFT JOIN app_public.user_emails ue ON ue.user_id = u.id AND ue.is_verified = true
         WHERE u.id = $1
         LIMIT 1`,
        [userId]
    );
    return result.rows[0] ?? null;
}

/**
 * Send notification via email channel
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
    const user = await getUserDetails(payload.userId);
    if (!user?.email) {
        logger.warn({ userId: payload.userId }, 'No verified email for user, skipping email notification');
        return;
    }

    switch (payload.type) {
        case 'welcome':
            await sendWelcomeEmail(user.email, user.username, user.name);
            break;

        case 'topic_reply': {
            const topicPayload = payload as TopicReplyNotificationPayload;
            const pool = getPool();
            
            // Get topic and reply details
            const topicResult = await pool.query<TopicReplyRow>(
                `SELECT t.title, p.body, u.username as replier_name
                 FROM app_public.topics t
                 JOIN app_public.posts p ON p.id = $2
                 JOIN app_public.users u ON u.id = $3
                 WHERE t.id = $1`,
                [topicPayload.topicId, topicPayload.postId, topicPayload.replyAuthorId]
            );
            
            if (topicResult.rows[0]) {
                const row = topicResult.rows[0];
                const preview = row.body.length > 200 ? row.body.substring(0, 200) + '...' : row.body;
                await sendTopicReplyNotification(
                    user.email,
                    user.name ?? user.username,
                    topicPayload.topicId,
                    row.title,
                    row.replier_name,
                    preview
                );
            }
            break;
        }

        case 'post_reply':
        case 'mention':
        case 'system':
            // TODO: Implement these email templates
            logger.info({ type: payload.type, userId: payload.userId }, 'Email notification type not yet implemented');
            break;
    }
}

/**
 * Send notification via in-app channel
 */
function sendInAppNotification(payload: NotificationPayload): Promise<void> {
    // In-app notifications would be stored in a notifications table
    // and shown in the UI. For now, just log.
    logger.info(
        { type: payload.type, userId: payload.userId },
        'In-app notification would be created'
    );
    
    // Future implementation:
    // const pool = getPool();
    // await pool.query(
    //     `INSERT INTO app_public.notifications (user_id, type, payload, status)
    //      VALUES ($1, $2, $3, 'pending')`,
    //     [payload.userId, payload.type, JSON.stringify(payload)]
    // );
    return Promise.resolve();
}

/**
 * Send notification through all appropriate channels
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
    logger.info({ type: payload.type, userId: payload.userId }, 'Processing notification');

    const preferences = await getUserPreferences(payload.userId);
    
    // Check if this notification type is enabled
    if (!preferences.enabledTypes.includes(payload.type)) {
        logger.debug({ type: payload.type, userId: payload.userId }, 'Notification type disabled by user');
        return;
    }

    // Determine channels to use
    const channels: NotificationChannel[] = payload.channels || ['email', 'in_app'];

    // Send through each enabled channel
    const promises: Promise<void>[] = [];

    if (channels.includes('email') && preferences.email) {
        promises.push(
            sendEmailNotification(payload).catch(err => {
                logger.error({ error: err, type: payload.type }, 'Failed to send email notification');
            })
        );
    }

    if (channels.includes('in_app') && preferences.inApp) {
        promises.push(
            sendInAppNotification(payload).catch(err => {
                logger.error({ error: err, type: payload.type }, 'Failed to send in-app notification');
            })
        );
    }

    await Promise.all(promises);
    
    logger.info({ type: payload.type, userId: payload.userId }, 'Notification processed');
}

/**
 * Send topic reply notification
 */
export async function notifyTopicReply(
    topicAuthorId: number,
    topicId: number,
    postId: number,
    replyAuthorId: number
): Promise<void> {
    // Don't notify if author is replying to their own topic
    if (topicAuthorId === replyAuthorId) {
        logger.debug({ topicId, replyAuthorId }, 'Skipping self-notification for topic reply');
        return;
    }

    const payload: TopicReplyNotificationPayload = {
        userId: topicAuthorId,
        type: 'topic_reply',
        topicId,
        postId,
        replyAuthorId,
    };

    await sendNotification(payload);
}

/**
 * Send welcome notification to new user
 */
export async function notifyWelcome(userId: number): Promise<void> {
    const payload: WelcomeNotificationPayload = {
        userId,
        type: 'welcome',
        channels: ['email', 'in_app'],
    };

    await sendNotification(payload);
}

/**
 * Send system notification
 */
export async function notifySystem(
    userId: number,
    title: string,
    message: string
): Promise<void> {
    const payload: SystemNotificationPayload = {
        userId,
        type: 'system',
        title,
        message,
        channels: ['in_app'],
    };

    await sendNotification(payload);
}
