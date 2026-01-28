// Import generated types from @app/gql
import type { TopicInput, TopicPatch } from '@app/gql';
import type { Plugin } from 'graphile-build';
import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import type { QueryResult } from 'pg';

import type {
    CountRow,
    PostGraphileContext,
    SearchTopicsArgs,
    TopicRow,
    TopicStats,
    TopicStatsArgs,
    TopicStatsRow,
} from './types.js';

/**
 * Topic Mutations Plugin
 *
 * Adds custom mutations and queries for Topic operations.
 */
export const TopicMutationsPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            extend type Query {
                """
                Get topic statistics including post count and engagement metrics
                """
                topicStats(topicId: Int!): TopicStats

                """
                Search topics by title or content
                """
                searchTopics(searchTerm: String!, forumId: Int, limit: Int = 10): [Topic!]!
            }

            type TopicStats {
                topicId: Int!
                postCount: Int!
                viewCount: Int
                lastActivityAt: Datetime
            }
        `,
        resolvers: {
            Query: {
                /**
                 * Get topic statistics
                 */
                topicStats: async (
                    _parent: unknown,
                    args: TopicStatsArgs,
                    context: PostGraphileContext
                ): Promise<TopicStats | null> => {
                    const { pgClient } = context;
                    const { topicId } = args;

                    const result: QueryResult<TopicStatsRow> = await pgClient.query(
                        `
                        SELECT 
                            t.id as topic_id,
                            COUNT(p.id) as post_count,
                            MAX(p.created_at) as last_activity_at
                        FROM app_public.topics t
                        LEFT JOIN app_public.posts p ON p.topic_id = t.id
                        WHERE t.id = $1
                        GROUP BY t.id
                        `,
                        [topicId]
                    );

                    if (result.rows.length === 0) {
                        return null;
                    }

                    const row = result.rows[0];
                    return {
                        topicId: row.topic_id,
                        postCount: Number.parseInt(row.post_count, 10) || 0,
                        viewCount: null, // Can be extended with view tracking
                        lastActivityAt: row.last_activity_at,
                    };
                },

                /**
                 * Search topics
                 */
                searchTopics: async (
                    _parent: unknown,
                    args: SearchTopicsArgs,
                    context: PostGraphileContext
                ): Promise<TopicRow[]> => {
                    const { pgClient } = context;
                    const { searchTerm, forumId, limit = 10 } = args;

                    let query = `
                        SELECT * FROM app_public.topics 
                        WHERE title ILIKE $1
                    `;
                    const params: (string | number)[] = [`%${searchTerm}%`];

                    if (forumId !== undefined && forumId !== null) {
                        query += ` AND forum_id = $2`;
                        params.push(forumId);
                    }

                    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
                    params.push(limit);

                    const result: QueryResult<TopicRow> = await pgClient.query(query, params);
                    return result.rows;
                },
            },
        },
    };
});

// Type definitions for mutation arguments
interface CreateTopicMutationArgs {
    input: {
        topic: TopicInput;
        clientMutationId?: string;
    };
}

interface UpdateTopicMutationArgs {
    input: {
        patch: TopicPatch;
        id?: number;
        nodeId?: string;
        clientMutationId?: string;
    };
}

interface DeleteTopicMutationArgs {
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
 * Topic Mutation Wrapper Plugin
 *
 * Wraps existing Topic mutations with validation logic.
 */
export const TopicMutationWrapperPlugin: Plugin = makeExtendSchemaPlugin(() => {
    return {
        typeDefs: gql`
            extend type Query {
                _topicMutationWrapperDummy: Boolean
            }
        `,
        resolvers: {
            Query: {
                _topicMutationWrapperDummy: (): boolean => true,
            },
            Mutation: {
                /**
                 * Wrap createTopic with validation
                 */
                createTopic: {
                    async resolve(
                        resolve: ResolverFn<CreateTopicMutationArgs>,
                        parent: unknown,
                        args: CreateTopicMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { topic } = args.input;
                        const { pgClient } = context;

                        // Validate title length
                        if (topic.title && topic.title.trim().length < 5) {
                            throw new Error('Topic title must be at least 5 characters long');
                        }

                        if (topic.title && topic.title.length > 200) {
                            throw new Error('Topic title must not exceed 200 characters');
                        }

                        // Verify forum exists
                        if (topic.forumId) {
                            const forumCheck: QueryResult<{ id: number }> = await pgClient.query(
                                'SELECT id FROM app_public.forums WHERE id = $1',
                                [topic.forumId]
                            );

                            if (forumCheck.rows.length === 0) {
                                throw new Error(`Forum with ID ${topic.forumId} does not exist`);
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updateTopic with validation
                 */
                updateTopic: {
                    async resolve(
                        resolve: ResolverFn<UpdateTopicMutationArgs>,
                        parent: unknown,
                        args: UpdateTopicMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.title && patch.title.trim().length < 5) {
                            throw new Error('Topic title must be at least 5 characters long');
                        }

                        if (patch.title && patch.title.length > 200) {
                            throw new Error('Topic title must not exceed 200 characters');
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap updateTopicByNodeId with validation
                 */
                updateTopicByNodeId: {
                    async resolve(
                        resolve: ResolverFn<UpdateTopicMutationArgs>,
                        parent: unknown,
                        args: UpdateTopicMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { patch } = args.input;

                        if (patch.title && patch.title.trim().length < 5) {
                            throw new Error('Topic title must be at least 5 characters long');
                        }

                        if (patch.title && patch.title.length > 200) {
                            throw new Error('Topic title must not exceed 200 characters');
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deleteTopic with cascade check
                 */
                deleteTopic: {
                    async resolve(
                        resolve: ResolverFn<DeleteTopicMutationArgs>,
                        parent: unknown,
                        args: DeleteTopicMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { pgClient } = context;
                        const topicId = args.input.id;

                        if (topicId) {
                            const postsResult: QueryResult<CountRow> = await pgClient.query(
                                'SELECT COUNT(*) as count FROM app_public.posts WHERE topic_id = $1',
                                [topicId]
                            );

                            const postCount = Number.parseInt(postsResult.rows[0]?.count ?? '0', 10);

                            if (postCount > 0) {
                                throw new Error(
                                    `Cannot delete topic: it contains ${postCount} post(s). Delete posts first.`
                                );
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },

                /**
                 * Wrap deleteTopicByNodeId with cascade check
                 */
                deleteTopicByNodeId: {
                    async resolve(
                        resolve: ResolverFn<DeleteTopicMutationArgs>,
                        parent: unknown,
                        args: DeleteTopicMutationArgs,
                        context: PostGraphileContext,
                        info: unknown
                    ): Promise<unknown> {
                        const { pgClient } = context;
                        const nodeId = args.input.nodeId;

                        if (nodeId) {
                            // Extract ID from nodeId (base64 encoded)
                            try {
                                const decoded = Buffer.from(nodeId, 'base64').toString('utf-8');
                                const match = /Topic:(\d+)/.exec(decoded);

                                if (match) {
                                    const topicId = Number.parseInt(match[1], 10);

                                    const postsResult: QueryResult<CountRow> = await pgClient.query(
                                        'SELECT COUNT(*) as count FROM app_public.posts WHERE topic_id = $1',
                                        [topicId]
                                    );

                                    const postCount = Number.parseInt(postsResult.rows[0]?.count ?? '0', 10);

                                    if (postCount > 0) {
                                        throw new Error(
                                            `Cannot delete topic: it contains ${postCount} post(s). Delete posts first.`
                                        );
                                    }
                                }
                            } catch {
                                // If we can't decode the nodeId, let PostGraphile handle the error
                            }
                        }

                        return resolve(parent, args, context, info);
                    },
                },
            },
        },
    };
});

export default TopicMutationsPlugin;
