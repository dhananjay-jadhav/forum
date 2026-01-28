import type { GraphQLResolveInfo } from 'graphql';
import type { PoolClient } from 'pg';

/**
 * PostGraphile Context for v4
 * Contains the PostgreSQL client and other request-scoped data
 */
export interface PostGraphileContext {
    /** PostgreSQL client from the connection pool */
    pgClient: PoolClient;
    /** Current user ID (if authenticated) */
    userId?: number;
    /** JWT claims (if using JWT authentication) */
    jwtClaims?: Record<string, unknown>;
    /** The root pgSettings */
    pgSettings?: Record<string, string>;
}

/**
 * Generic resolver function type for PostGraphile v4
 */
export type ResolverFn<TResult, TArgs = Record<string, unknown>> = (
    parent: unknown,
    args: TArgs,
    context: PostGraphileContext,
    info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

/**
 * Mutation resolver wrapper function type
 */
export type MutationResolverWrapper<TArgs = Record<string, unknown>> = (
    resolve: ResolverFn<unknown, TArgs>,
    source: unknown,
    args: TArgs,
    context: PostGraphileContext,
    resolveInfo: GraphQLResolveInfo
) => Promise<unknown>;

/**
 * PostgreSQL query result row types
 */
export interface ForumStatsRow {
    forum_id: number;
    topic_count: string;
    post_count: string;
    latest_topic_id: number | null;
}

export interface TopicStatsRow {
    topic_id: number;
    post_count: string;
    last_activity_at: string | null;
}

export interface PostStatsRow {
    post_id: number;
    reply_count: number;
    edit_count: number;
    created_at: string;
    updated_at: string;
}

export interface CountRow {
    count: string;
}

export interface IdRow {
    id: number;
}

export interface ForumIdRow {
    id: number;
}

export interface PostRow {
    id: number;
    topic_id: number;
    author_id: number;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface TopicRow {
    id: number;
    forum_id: number;
    author_id: number;
    title: string;
    body: string;
    created_at: string;
    updated_at: string;
}

/**
 * Forum Stats result type for custom query
 */
export interface ForumStats {
    forumId: number;
    topicCount: number;
    postCount: number;
    latestTopicId: number | null;
}

/**
 * Topic Stats result type for custom query
 */
export interface TopicStats {
    topicId: number;
    postCount: number;
    viewCount: number | null;
    lastActivityAt: string | null;
}

/**
 * Post Stats result type for custom query
 */
export interface PostStats {
    postId: number;
    replyCount: number;
    editCount: number | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Arguments for forumStats query
 */
export interface ForumStatsArgs {
    forumId: number;
}

/**
 * Arguments for topicStats query
 */
export interface TopicStatsArgs {
    topicId: number;
}

/**
 * Arguments for postStats query
 */
export interface PostStatsArgs {
    postId: number;
}

/**
 * Arguments for searchTopics query
 */
export interface SearchTopicsArgs {
    searchTerm: string;
    forumId?: number;
    limit?: number;
}

/**
 * Arguments for recentPosts query
 */
export interface RecentPostsArgs {
    topicId?: number;
    authorId?: number;
    limit?: number;
}

/**
 * Arguments for createPostWithNotifications mutation
 */
export interface CreatePostWithNotificationsInput {
    input: {
        topicId: number;
        body: string;
        notifySubscribers?: boolean;
    };
}

/**
 * Arguments for editPost mutation
 */
export interface EditPostInput {
    input: {
        postId: number;
        body: string;
        editReason?: string;
    };
}

/**
 * Edit Post payload
 */
export interface EditPostPayload {
    post: PostRow | null;
    query: unknown;
}
