// Import generated types from @app/gql
/* eslint-disable */
import type { ForumInput, ForumPatch } from '@app/gql';
import type { Plugin } from 'graphile-build';
import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import type { QueryResult } from 'pg';

import type { CountRow, ForumStats, ForumStatsArgs, ForumStatsRow, IdRow, PostGraphileContext } from './types.js';

/**
 * Forum Mutations Plugin
 *
 * Adds custom mutations and queries for Forum operations.
 * Can be used to add validation, custom business logic, or extend existing mutations.
 */
export const ForumMutationsPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            extend type Query {
                """
                Get forum statistics including topic and post counts
                """
                forumStats(forumId: Int!): ForumStats
            }

            type ForumStats {
                forumId: Int!
                topicCount: Int!
                postCount: Int!
                latestTopicId: Int
            }
        `,
        resolvers: {
            Query: {
                /**
                 * Get forum statistics
                 */
                forumStats: async (
                    _parent: unknown,
                    args: ForumStatsArgs,
                    context: PostGraphileContext
                ): Promise<ForumStats | null> => {
                    const { pgClient } = context;
                    const { forumId } = args;

                    const result: QueryResult<ForumStatsRow> = await pgClient.query(
                        `
                        SELECT 
                            $1::int as forum_id,
                            COUNT(DISTINCT t.id) as topic_count,
                            COUNT(p.id) as post_count,
                            MAX(t.id) as latest_topic_id
                        FROM app_public.forums f
                        LEFT JOIN app_public.topics t ON t.forum_id = f.id
                        LEFT JOIN app_public.posts p ON p.topic_id = t.id
                        WHERE f.id = $1
                        GROUP BY f.id
                        `,
                        [forumId]
                    );

                    if (result.rows.length === 0) {
                        return null;
                    }

                    const row = result.rows[0];
                    return {
                        forumId: row.forum_id,
                        topicCount: Number.parseInt(row.topic_count, 10) || 0,
                        postCount: Number.parseInt(row.post_count, 10) || 0,
                        latestTopicId: row.latest_topic_id,
                    };
                },
            },
        },
    };
});

// Type definitions for mutation arguments
interface CreateForumMutationArgs {
    input: {
        forum: ForumInput;
        clientMutationId?: string;
    };
}

interface UpdateForumMutationArgs {
    input: {
        patch: ForumPatch;
        id?: number;
        slug?: string;
        nodeId?: string;
        clientMutationId?: string;
    };
}

interface DeleteForumMutationArgs {
    input: {
        id?: number;
        slug?: string;
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
 * Forum Mutation Wrapper Plugin
 *
 * Wraps existing Forum mutations with validation logic using makeWrapResolversPlugin pattern.
 * This is the recommended approach for PostGraphile v4 mutation hooks.
 */
export const ForumMutationWrapperPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            # No additional types needed - we're wrapping existing mutations
            extend type Query {
                _forumMutationWrapperDummy: Boolean
            }
        `,
        resolvers: {
            Query: {
                _forumMutationWrapperDummy: (): boolean => true,
            },
            Mutation: {
                /**
                 * Wrap createForum with validation
                 */
                createForum: {
                    async resolve(
                        resolve: ResolverFn<CreateForumMutationArgs>,
                        parent: unknown,
                        args: CreateForumMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { forum } = args.input;

                        // Validate slug format
                        if (forum.slug && !/^[a-z0-9-]+$/.test(forum.slug)) {
                            throw new Error(
                                'Forum slug must be lowercase and contain only letters, numbers, and hyphens'
                            );
                        }

                        // Validate name length
                        if (forum.name && forum.name.length < 3) {
                            throw new Error('Forum name must be at least 3 characters long');
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updateForum with validation
                 */
                updateForum: {
                    async resolve(
                        resolve: ResolverFn<UpdateForumMutationArgs>,
                        parent: unknown,
                        args: UpdateForumMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.slug && !/^[a-z0-9-]+$/.test(patch.slug)) {
                            throw new Error(
                                'Forum slug must be lowercase and contain only letters, numbers, and hyphens'
                            );
                        }

                        if (patch.name && patch.name.length < 3) {
                            throw new Error('Forum name must be at least 3 characters long');
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updateForumBySlug with validation
                 */
                updateForumBySlug: {
                    async resolve(
                        resolve: ResolverFn<UpdateForumMutationArgs>,
                        parent: unknown,
                        args: UpdateForumMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.slug && !/^[a-z0-9-]+$/.test(patch.slug)) {
                            throw new Error(
                                'Forum slug must be lowercase and contain only letters, numbers, and hyphens'
                            );
                        }

                        if (patch.name && patch.name.length < 3) {
                            throw new Error('Forum name must be at least 3 characters long');
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deleteForum with cascade check
                 */
                deleteForum: {
                    async resolve(
                        resolve: ResolverFn<DeleteForumMutationArgs>,
                        parent: unknown,
                        args: DeleteForumMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { pgClient } = context;
                        const forumId = args.input.id;

                        if (forumId) {
                            const topicsResult: QueryResult<CountRow> = await pgClient.query(
                                'SELECT COUNT(*) as count FROM app_public.topics WHERE forum_id = $1',
                                [forumId]
                            );

                            const topicCount = Number.parseInt(topicsResult.rows[0]?.count ?? '0', 10);

                            if (topicCount > 0) {
                                throw new Error(
                                    `Cannot delete forum: it contains ${topicCount} topic(s). Delete topics first.`
                                );
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deleteForumBySlug with cascade check
                 */
                deleteForumBySlug: {
                    async resolve(
                        resolve: ResolverFn<DeleteForumMutationArgs>,
                        parent: unknown,
                        args: DeleteForumMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { pgClient } = context;
                        const slug = args.input.slug;

                        if (slug) {
                            // Get forum ID first
                            const forumResult: QueryResult<IdRow> = await pgClient.query(
                                'SELECT id FROM app_public.forums WHERE slug = $1',
                                [slug]
                            );

                            const forumId = forumResult.rows[0]?.id;

                            if (forumId) {
                                const topicsResult: QueryResult<CountRow> = await pgClient.query(
                                    'SELECT COUNT(*) as count FROM app_public.topics WHERE forum_id = $1',
                                    [forumId]
                                );

                                const topicCount = Number.parseInt(topicsResult.rows[0]?.count ?? '0', 10);

                                if (topicCount > 0) {
                                    throw new Error(
                                        `Cannot delete forum: it contains ${topicCount} topic(s). Delete topics first.`
                                    );
                                }
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },
            },
        },
    };
});

export default ForumMutationsPlugin;
