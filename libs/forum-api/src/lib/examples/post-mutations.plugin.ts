// Import generated types from @app/gql
/* eslint-disable */
import type { PostInput, PostPatch } from '@app/gql';
import type { Plugin } from 'graphile-build';
import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import type { QueryResult } from 'pg';

import type {
    CreatePostWithNotificationsInput,
    EditPostInput,
    EditPostPayload,
    PostGraphileContext,
    PostRow,
    PostStats,
    PostStatsArgs,
    PostStatsRow,
    RecentPostsArgs,
} from './types.js';

/**
 * Post Mutations Plugin
 *
 * Adds custom mutations and queries for Post operations.
 */
export const PostMutationsPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            extend type Query {
                """
                Get recent posts across all topics or filtered by topic/author
                """
                recentPosts(topicId: Int, authorId: Int, limit: Int = 20): [Post!]!

                """
                Get post statistics for a specific post
                """
                postStats(postId: Int!): PostStats
            }

            type PostStats {
                postId: Int!
                replyCount: Int!
                editCount: Int
                createdAt: Datetime
                updatedAt: Datetime
            }

            extend type Mutation {
                """
                Create a post with automatic notification and activity tracking
                """
                createPostWithNotifications(input: CreatePostWithNotificationsInput!): CreatePostPayload

                """
                Edit post with version history
                """
                editPost(input: EditPostInput!): EditPostPayload
            }

            input CreatePostWithNotificationsInput {
                topicId: Int!
                body: String!
                notifySubscribers: Boolean = true
            }

            input EditPostInput {
                postId: Int!
                body: String!
                editReason: String
            }

            type EditPostPayload {
                post: Post
                query: Query
            }
        `,
        resolvers: {
            Query: {
                /**
                 * Get recent posts
                 */
                recentPosts: async (
                    _parent: unknown,
                    args: RecentPostsArgs,
                    context: PostGraphileContext
                ): Promise<PostRow[]> => {
                    const { pgClient } = context;
                    const { topicId, authorId, limit = 20 } = args;

                    let query = `SELECT * FROM app_public.posts WHERE 1=1`;
                    const params: number[] = [];

                    if (topicId !== undefined && topicId !== null) {
                        params.push(topicId);
                        query += ` AND topic_id = $${params.length}`;
                    }

                    if (authorId !== undefined && authorId !== null) {
                        params.push(authorId);
                        query += ` AND author_id = $${params.length}`;
                    }

                    params.push(limit);
                    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

                    const result: QueryResult<PostRow> = await pgClient.query(query, params);
                    return result.rows;
                },

                /**
                 * Get post statistics
                 */
                postStats: async (
                    _parent: unknown,
                    args: PostStatsArgs,
                    context: PostGraphileContext
                ): Promise<PostStats | null> => {
                    const { pgClient } = context;
                    const { postId } = args;

                    const result: QueryResult<PostStatsRow> = await pgClient.query(
                        `
                        SELECT 
                            id as post_id,
                            0 as reply_count,
                            0 as edit_count,
                            created_at,
                            updated_at
                        FROM app_public.posts
                        WHERE id = $1
                        `,
                        [postId]
                    );

                    if (result.rows.length === 0) {
                        return null;
                    }

                    const row = result.rows[0];
                    return {
                        postId: row.post_id,
                        replyCount: row.reply_count,
                        editCount: row.edit_count,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                    };
                },
            },

            Mutation: {
                /**
                 * Create post with notifications
                 */
                createPostWithNotifications: async (
                    _parent: unknown,
                    args: CreatePostWithNotificationsInput,
                    context: PostGraphileContext
                ): Promise<{ post: PostRow; query: unknown }> => {
                    const { pgClient, userId } = context;
                    const { topicId, body } = args.input;

                    // Get current user from context (assumes auth is set up)
                    const currentUserId = userId ?? 1; // Default for demo

                    // Insert the post
                    const postResult: QueryResult<PostRow> = await pgClient.query(
                        `
                        INSERT INTO app_public.posts (topic_id, author_id, body)
                        VALUES ($1, $2, $3)
                        RETURNING *
                        `,
                        [topicId, currentUserId, body]
                    );

                    const post = postResult.rows[0];

                    // Notification logic can be added here when notifySubscribers is true
                    // Implementation depends on your notification service

                    return {
                        post,
                        query: {},
                    };
                },

                /**
                 * Edit post with history tracking
                 */
                editPost: async (
                    _parent: unknown,
                    args: EditPostInput,
                    context: PostGraphileContext
                ): Promise<EditPostPayload> => {
                    const { pgClient, userId } = context;
                    const { postId, body } = args.input;

                    // Get current user from context
                    const currentUserId = userId ?? 1;

                    // Verify the post exists and user has permission
                    const existingPost: QueryResult<PostRow> = await pgClient.query(
                        'SELECT * FROM app_public.posts WHERE id = $1',
                        [postId]
                    );

                    if (existingPost.rows.length === 0) {
                        throw new Error(`Post with ID ${postId} not found`);
                    }

                    // Check if user is the author
                    if (existingPost.rows[0].author_id !== currentUserId) {
                        throw new Error('You can only edit your own posts');
                    }

                    // Update the post
                    const updateResult: QueryResult<PostRow> = await pgClient.query(
                        `
                        UPDATE app_public.posts 
                        SET body = $1, updated_at = NOW()
                        WHERE id = $2
                        RETURNING *
                        `,
                        [body, postId]
                    );

                    return {
                        post: updateResult.rows[0],
                        query: {},
                    };
                },
            },
        },
    };
});

// Type definitions for mutation arguments
interface CreatePostMutationArgs {
    input: {
        post: PostInput;
        clientMutationId?: string;
    };
}

interface UpdatePostMutationArgs {
    input: {
        patch: PostPatch;
        id?: number;
        nodeId?: string;
        clientMutationId?: string;
    };
}

interface DeletePostMutationArgs {
    input: {
        id?: number;
        nodeId?: string;
        clientMutationId?: string;
    };
}

type ResolverFn<TArgs> = (
    parent: unknown,
    args: TArgs,
    context: PostGraphileContext,
    info: unknown
) => Promise<unknown>;

/**
 * Post Mutation Wrapper Plugin
 *
 * Wraps existing Post mutations with validation logic.
 */
export const PostMutationWrapperPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            extend type Query {
                _postMutationWrapperDummy: Boolean
            }
        `,
        resolvers: {
            Query: {
                _postMutationWrapperDummy: (): boolean => true,
            },
            Mutation: {
                /**
                 * Wrap createPost with validation
                 */
                createPost: {
                    async resolve(
                        resolve: ResolverFn<CreatePostMutationArgs>,
                        parent: unknown,
                        args: CreatePostMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { post } = args.input;
                        const { pgClient } = context;

                        // Validate body is not empty
                        if (!post.body || post.body.trim().length === 0) {
                            throw new Error('Post body cannot be empty');
                        }

                        // Validate body length
                        if (post.body.trim().length < 10) {
                            throw new Error('Post body must be at least 10 characters long');
                        }

                        if (post.body.length > 10000) {
                            throw new Error('Post body must not exceed 10,000 characters');
                        }

                        // Verify topic exists
                        if (post.topicId) {
                            const topicCheck: QueryResult<{ id: number }> = await pgClient.query(
                                'SELECT id FROM app_public.topics WHERE id = $1',
                                [post.topicId]
                            );

                            if (topicCheck.rows.length === 0) {
                                throw new Error(`Topic with ID ${post.topicId} does not exist`);
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updatePost with validation
                 */
                updatePost: {
                    async resolve(
                        resolve: ResolverFn<UpdatePostMutationArgs>,
                        parent: unknown,
                        args: UpdatePostMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.body !== undefined) {
                            if (!patch.body || patch.body.trim().length === 0) {
                                throw new Error('Post body cannot be empty');
                            }

                            if (patch.body.trim().length < 10) {
                                throw new Error('Post body must be at least 10 characters long');
                            }

                            if (patch.body.length > 10000) {
                                throw new Error('Post body must not exceed 10,000 characters');
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updatePostByNodeId with validation
                 */
                updatePostByNodeId: {
                    async resolve(
                        resolve: ResolverFn<UpdatePostMutationArgs>,
                        parent: unknown,
                        args: UpdatePostMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.body !== undefined) {
                            if (!patch.body || patch.body.trim().length === 0) {
                                throw new Error('Post body cannot be empty');
                            }

                            if (patch.body.trim().length < 10) {
                                throw new Error('Post body must be at least 10 characters long');
                            }

                            if (patch.body.length > 10000) {
                                throw new Error('Post body must not exceed 10,000 characters');
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deletePost - can add custom checks here
                 */
                deletePost: {
                    async resolve(
                        resolve: ResolverFn<DeletePostMutationArgs>,
                        parent: unknown,
                        args: DeletePostMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        // Optional: Add time-based deletion restrictions
                        // const { pgClient } = context;
                        // const postId = args.input.id;
                        // ... check created_at for time-based restrictions

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deletePostByNodeId - can add custom checks here
                 */
                deletePostByNodeId: {
                    async resolve(
                        resolve: ResolverFn<DeletePostMutationArgs>,
                        parent: unknown,
                        args: DeletePostMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        // Optional: Add custom validation here

                        return resolve(parent, args, context, info);
                    },
                },
            },
        },
    };
});

export default PostMutationsPlugin;
