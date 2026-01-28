/**
 * @app/moderation - Moderation Service
 *
 * Main moderation service that combines spam detection and content filtering.
 */

import { getPool } from '@app/database';
import { logger } from '@app/utils';

import { detectPII, filterContent } from './filter.js';
import { defaultSpamConfig,detectSpam } from './spam.js';
import type {
    ContentToModerate,
    ContentType,
    ModerationAction,
    ModerationIssue,
    ModerationResult,
    SpamConfig,
} from './types.js';

// Database row types
interface PostRow {
    id: number;
    body: string;
    author_id: number;
    topic_id: number;
    forum_id: number;
}

interface TopicRow {
    id: number;
    title: string;
    body: string;
    author_id: number;
    forum_id: number;
}

/**
 * Analyze content for moderation issues
 */
export function analyzeContent(
    text: string,
    spamConfig: SpamConfig = defaultSpamConfig
): ModerationResult {
    const issues: ModerationIssue[] = [];

    // Run spam detection
    const spamIssues = detectSpam(text, spamConfig);
    issues.push(...spamIssues);

    // Run content filtering
    const filterIssues = filterContent(text);
    issues.push(...filterIssues);

    // Run PII detection
    const piiIssues = detectPII(text);
    issues.push(...piiIssues);

    // Calculate overall severity
    const maxSeverity = issues.length > 0 
        ? Math.max(...issues.map(i => i.severity))
        : 0;

    const totalSeverity = issues.reduce((sum, i) => sum + i.severity, 0);

    // Determine if content passed and recommended action
    let passed = true;
    let recommendedAction: ModerationAction = 'approve';
    let needsReview = false;

    if (maxSeverity >= 0.9) {
        passed = false;
        recommendedAction = 'reject';
    } else if (maxSeverity >= 0.7) {
        passed = false;
        recommendedAction = 'flag';
        needsReview = true;
    } else if (totalSeverity >= 1.0) {
        needsReview = true;
        recommendedAction = 'flag';
    }

    // Calculate confidence (inverse of uncertainty based on severity variance)
    const confidence = issues.length === 0 
        ? 1.0 
        : Math.max(0.5, 1 - (totalSeverity / (issues.length * 2)));

    return {
        passed,
        confidence,
        issues,
        recommendedAction,
        needsReview,
    };
}

/**
 * Moderate a piece of content
 */
export async function moderateContent(content: ContentToModerate): Promise<ModerationResult> {
    logger.info(
        { contentId: content.id, contentType: content.type },
        'Starting content moderation'
    );

    const result = analyzeContent(content.text);

    logger.info(
        {
            contentId: content.id,
            contentType: content.type,
            passed: result.passed,
            issueCount: result.issues.length,
            recommendedAction: result.recommendedAction,
        },
        'Content moderation complete'
    );

    // If content needs action, apply it
    if (!result.passed || result.needsReview) {
        await applyModerationAction(
            content.id,
            content.type,
            result.recommendedAction,
            result.issues,
            true // isAutomatic
        );
    }

    return result;
}

/**
 * Apply a moderation action to content
 */
export function applyModerationAction(
    contentId: number,
    contentType: ContentType,
    action: ModerationAction,
    issues: ModerationIssue[],
    isAutomatic = true,
    moderatorId?: number
): Promise<void> {
    logger.info(
        { contentId, contentType, action, isAutomatic },
        'Applying moderation action'
    );

    // Log the moderation action
    // In a real app, you would have a moderation_log table and use getPool()
    // For now, just log to console
    const logEntry = {
        contentId,
        contentType,
        action,
        issues: issues.map(i => ({ type: i.type, severity: i.severity })),
        isAutomatic,
        moderatorId,
        timestamp: new Date().toISOString(),
    };
    
    logger.info({ moderationLog: logEntry }, 'Moderation action logged');

    // Apply the action based on content type
    switch (action) {
        case 'hide':
        case 'reject':
            logger.info({ contentId, contentType }, `Content would be hidden/rejected`);
            break;

        case 'delete':
            logger.info({ contentId, contentType }, `Content would be deleted`);
            break;

        case 'flag':
            logger.info({ contentId, contentType }, `Content flagged for review`);
            break;

        case 'approve':
            logger.info({ contentId, contentType }, `Content approved`);
            break;

        default:
            logger.debug({ action }, 'No automatic action taken');
    }

    return Promise.resolve();
}

/**
 * Moderate a post
 */
export async function moderatePost(postId: number): Promise<ModerationResult> {
    const pool = getPool();
    
    const result = await pool.query<PostRow>(
        `SELECT p.id, p.body, p.author_id, p.topic_id, t.forum_id
         FROM app_public.posts p
         JOIN app_public.topics t ON t.id = p.topic_id
         WHERE p.id = $1`,
        [postId]
    );

    if (result.rows.length === 0) {
        logger.warn({ postId }, 'Post not found for moderation');
        return {
            passed: true,
            confidence: 1.0,
            issues: [],
            recommendedAction: 'approve',
            needsReview: false,
        };
    }

    const post = result.rows[0];

    return moderateContent({
        id: post.id,
        type: 'post',
        text: post.body,
        authorId: post.author_id,
        context: {
            topicId: post.topic_id,
            forumId: post.forum_id,
        },
    });
}

/**
 * Moderate a topic
 */
export async function moderateTopic(topicId: number): Promise<ModerationResult> {
    const pool = getPool();
    
    const result = await pool.query<TopicRow>(
        `SELECT id, title, body, author_id, forum_id
         FROM app_public.topics
         WHERE id = $1`,
        [topicId]
    );

    if (result.rows.length === 0) {
        logger.warn({ topicId }, 'Topic not found for moderation');
        return {
            passed: true,
            confidence: 1.0,
            issues: [],
            recommendedAction: 'approve',
            needsReview: false,
        };
    }

    const post = result.rows[0];

    // Moderate title + body together
    return moderateContent({
        id: post.id,
        type: 'topic',
        text: `${post.title}\n\n${post.body}`,
        authorId: post.author_id,
        context: {
            forumId: post.forum_id,
        },
    });
}
