/**
 * @app/jobs - Task Handlers
 *
 * Task handlers for Graphile Worker that integrate all the domain libraries.
 * These tasks are triggered by database triggers or scheduled via crontab.
 */

import { type CleanupTask as CleanupTaskType,runAllCleanupTasks, runCleanupTask } from '@app/cleanup';
import { getPool } from '@app/database';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from '@app/email';
import { moderatePost, moderateTopic } from '@app/moderation';
import { notifyTopicReply, notifyWelcome } from '@app/notifications';
import { logger } from '@app/utils';
import type { Task, TaskList } from 'graphile-worker';

// Type definitions for task payloads
interface VerificationEmailPayload {
    id: number;
}

interface ForgotPasswordPayload {
    id: number;
    email: string;
    token: string;
}

interface WelcomeEmailPayload {
    userId: number;
}

interface NotifyTopicReplyPayload {
    postId: number;
}

interface ModeratePayload {
    id: number;
}

interface CleanupPayload {
    task: string;
}

// Database row types for type-safe queries
interface VerificationEmailRow {
    email: string;
    user_id: number;
    username: string;
    token?: string;
}

interface WelcomeUserRow {
    email: string | null;
    username: string;
    name: string | null;
}

interface TopicReplyRow {
    post_id: number;
    reply_author_id: number;
    topic_id: number;
    topic_author_id: number;
}

/**
 * Email verification task
 * Triggered by: app_private.tg__add_job_for_row('user_emails__send_verification')
 */
const sendVerificationEmailTask: Task = async (rawPayload) => {
    const payload = rawPayload as VerificationEmailPayload;
    logger.info({ userEmailId: payload.id }, 'Processing email verification task');

    const pool = getPool();
    
    // Try with the token generation function first, fallback to simple query
    let result: { rows: VerificationEmailRow[] };
    try {
        result = await pool.query<VerificationEmailRow>(
            `SELECT ue.email, ue.user_id, u.username,
                    app_private.generate_email_verification_token(ue.id) as token
             FROM app_public.user_emails ue
             JOIN app_public.users u ON u.id = ue.user_id
             WHERE ue.id = $1 AND ue.is_verified = false`,
            [payload.id]
        );
    } catch {
        // If the function doesn't exist, fall back to simple query
        result = await pool.query<VerificationEmailRow>(
            `SELECT ue.email, ue.user_id, u.username
             FROM app_public.user_emails ue
             JOIN app_public.users u ON u.id = ue.user_id
             WHERE ue.id = $1 AND ue.is_verified = false`,
            [payload.id]
        );
    }

    if (result.rows.length === 0) {
        logger.warn({ userEmailId: payload.id }, 'Email record not found or already verified');
        return;
    }

    const row = result.rows[0];
    const email: string = row.email;
    const token: string | undefined = row.token;
    
    // Generate a simple token if none was returned
    const actualToken = token || Buffer.from(`${payload.id}-${Date.now()}`).toString('base64');
    await sendVerificationEmail(email, actualToken);
};

/**
 * Password reset task
 * Triggered by: forgotPassword mutation
 */
const forgotPasswordTask: Task = async (rawPayload) => {
    const payload = rawPayload as ForgotPasswordPayload;
    logger.info({ userId: payload.id, email: payload.email }, 'Processing password reset task');

    await sendPasswordResetEmail(payload.email, payload.id, payload.token);
};

/**
 * Welcome email task
 * Triggered after user registration
 */
const sendWelcomeEmailTask: Task = async (rawPayload) => {
    const payload = rawPayload as WelcomeEmailPayload;
    logger.info({ userId: payload.userId }, 'Processing welcome email task');

    const pool = getPool();
    const result = await pool.query<WelcomeUserRow>(
        `SELECT u.username, u.name, ue.email
         FROM app_public.users u
         LEFT JOIN app_public.user_emails ue ON ue.user_id = u.id AND ue.is_verified = true
         WHERE u.id = $1
         LIMIT 1`,
        [payload.userId]
    );

    if (result.rows.length === 0) {
        logger.warn({ userId: payload.userId }, 'User not found');
        return;
    }

    const row = result.rows[0];
    const email: string | null = row.email;
    const username: string = row.username;
    const name: string | undefined = row.name ?? undefined;
    
    if (!email) {
        logger.warn({ userId: payload.userId }, 'User has no verified email');
        return;
    }

    await sendWelcomeEmail(email, username, name);
    
    // Also send in-app welcome notification
    await notifyWelcome(payload.userId);
};

/**
 * Topic reply notification task
 * Triggered after a post is created
 */
const notifyTopicReplyTask: Task = async (rawPayload) => {
    const payload = rawPayload as NotifyTopicReplyPayload;
    logger.info({ postId: payload.postId }, 'Processing topic reply notification task');

    const pool = getPool();
    const result = await pool.query<TopicReplyRow>(
        `SELECT p.id as post_id, p.author_id as reply_author_id,
                t.id as topic_id, t.author_id as topic_author_id
         FROM app_public.posts p
         JOIN app_public.topics t ON t.id = p.topic_id
         WHERE p.id = $1`,
        [payload.postId]
    );

    if (result.rows.length === 0) {
        logger.warn({ postId: payload.postId }, 'Post not found');
        return;
    }

    const row = result.rows[0];
    await notifyTopicReply(row.topic_author_id, row.topic_id, row.post_id, row.reply_author_id);
};

/**
 * Moderate post task
 * Triggered after a post is created
 */
const moderatePostTask: Task = async (rawPayload) => {
    const payload = rawPayload as ModeratePayload;
    logger.info({ postId: payload.id }, 'Processing post moderation task');

    await moderatePost(payload.id);
};

/**
 * Moderate topic task
 * Triggered after a topic is created
 */
const moderateTopicTask: Task = async (rawPayload) => {
    const payload = rawPayload as ModeratePayload;
    logger.info({ topicId: payload.id }, 'Processing topic moderation task');

    await moderateTopic(payload.id);
};

/**
 * Run all cleanup tasks
 * Scheduled via crontab
 */
const cleanupRunAllTask: Task = async () => {
    logger.info('Processing scheduled cleanup task');

    const summary = await runAllCleanupTasks();

    logger.info(
        {
            success: summary.success,
            totalItemsRemoved: summary.totalItemsRemoved,
            totalDuration: summary.totalDuration,
        },
        'Cleanup task completed'
    );
};

/**
 * Run a specific cleanup task
 */
const cleanupTask: Task = async (rawPayload) => {
    const payload = rawPayload as CleanupPayload;
    logger.info({ task: payload.task }, 'Processing specific cleanup task');

    const result = await runCleanupTask(payload.task as CleanupTaskType);

    logger.info(
        {
            task: result.task,
            success: result.success,
            itemsRemoved: result.itemsRemoved,
        },
        'Specific cleanup task completed'
    );
}

/**
 * All task handlers for the forum application
 */
export const forumTaskList: TaskList = {
    // Email tasks (triggered by database)
    'user_emails__send_verification': sendVerificationEmailTask,
    'user__forgot_password': forgotPasswordTask,
    
    // Welcome tasks
    'user__send_welcome': sendWelcomeEmailTask,
    
    // Notification tasks
    'post__notify_topic_author': notifyTopicReplyTask,
    
    // Moderation tasks
    'post__moderate': moderatePostTask,
    'topic__moderate': moderateTopicTask,
    
    // Cleanup tasks (scheduled)
    'cleanup__run_all': cleanupRunAllTask,
    'cleanup__run': cleanupTask,
};

/**
 * Crontab entries for scheduled tasks
 */
export const forumCrontab = `
# Run cleanup tasks daily at 3 AM
0 3 * * * cleanup__run_all ?max=1
`.trim();
