/**
 * @app/forum-api - Kafka Event Publishing Plugin
 *
 * PostGraphile plugin that publishes events to Kafka when
 * topics, posts, and other entities are created/updated/deleted.
 */

import {
    initEventPublisher,
    publishPostCreated,
    publishPostDeleted,
    publishPostUpdated,
    publishTopicCreated,
    publishTopicDeleted,
    publishTopicUpdated,
} from '@app/kafka';
import { logger } from '@app/utils';
import type { Plugin } from 'graphile-build';
import type { GraphQLResolveInfo } from 'graphql';

// Type definitions for mutation results
interface TopicData {
    id: number;
    forumId: number;
    authorId: number;
    title: string;
    body?: string;
}

interface PostData {
    id: number;
    topicId: number;
    authorId: number;
    body?: string;
    topic?: { forumId: number };
}

interface MutationResult<T> {
    data?: T;
}

interface MutationArgs {
    input?: { id?: number };
    id?: number;
}

// GraphQL resolver types
type GraphQLArgs = { [argName: string]: unknown };
type ResolverContext = Record<string, unknown>;

// Initialize the event publisher on module load
let publisherInitialized = false;

async function ensurePublisher(): Promise<void> {
    if (!publisherInitialized) {
        try {
            await initEventPublisher();
            publisherInitialized = true;
        } catch (error) {
            logger.warn({ error }, 'Kafka publisher not available - events will be skipped');
        }
    }
}

/**
 * Plugin that publishes Kafka events for topic mutations
 */
export const TopicEventPlugin: Plugin = builder => {
    // Hook into topic creation
    // @ts-expect-error - PostGraphile hook callback has dynamic typing
    builder.hook('GraphQLObjectType:fields:field', (field, build, context) => {
        const {
            scope: { fieldName, isRootMutation },
        } = context;

        if (!isRootMutation) return field;

        // Hook createTopic mutation
        if (fieldName === 'createTopic') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<TopicData>> {
                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<TopicData>;

                    // Publish event after successful creation
                    if (result?.data) {
                        void ensurePublisher();
                        const topic: TopicData = result.data;
                        try {
                            await publishTopicCreated({
                                topicId: topic.id,
                                forumId: topic.forumId,
                                authorId: topic.authorId,
                                title: topic.title,
                                bodyPreview: topic.body?.substring(0, 200) || '',
                            });
                        } catch (error) {
                            logger.error({ error, topicId: topic.id }, 'Failed to publish topic.created event');
                        }
                    }

                    return result;
                },
            };
        }

        // Hook updateTopic mutation
        if (fieldName === 'updateTopic' || fieldName === 'updateTopicById') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<TopicData>> {
                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<TopicData>;

                    if (result?.data) {
                        void ensurePublisher();
                        const topic: TopicData = result.data;
                        try {
                            await publishTopicUpdated({
                                topicId: topic.id,
                                forumId: topic.forumId,
                                authorId: topic.authorId,
                                title: topic.title,
                                changes: ['title', 'body'], // Could be more specific
                            });
                        } catch (error) {
                            logger.error({ error, topicId: topic.id }, 'Failed to publish topic.updated event');
                        }
                    }

                    return result;
                },
            };
        }

        // Hook deleteTopic mutation
        if (fieldName === 'deleteTopic' || fieldName === 'deleteTopicById') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<TopicData>> {
                    // Capture topic info before deletion
                    const typedArgs = args as MutationArgs;
                    const topicId = typedArgs.input?.id || typedArgs.id;

                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<TopicData>;

                    if (result?.data) {
                        void ensurePublisher();
                        const topic: TopicData = result.data;
                        try {
                            await publishTopicDeleted({
                                topicId: topicId || topic.id,
                                forumId: topic.forumId,
                                authorId: topic.authorId,
                            });
                        } catch (error) {
                            logger.error({ error, topicId }, 'Failed to publish topic.deleted event');
                        }
                    }

                    return result;
                },
            };
        }

        return field;
    });
};

/**
 * Plugin that publishes Kafka events for post mutations
 */
export const PostEventPlugin: Plugin = builder => {
    // @ts-expect-error - PostGraphile hook callback has dynamic typing
    builder.hook('GraphQLObjectType:fields:field', (field, build, context) => {
        const {
            scope: { fieldName, isRootMutation },
        } = context;

        if (!isRootMutation) return field;

        // Hook createPost mutation
        if (fieldName === 'createPost') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<PostData>> {
                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<PostData>;

                    if (result?.data) {
                        void ensurePublisher();
                        const post: PostData = result.data;
                        try {
                            await publishPostCreated({
                                postId: post.id,
                                topicId: post.topicId,
                                forumId: post.topic?.forumId || 0, // May need to fetch
                                authorId: post.authorId,
                                bodyPreview: post.body?.substring(0, 200) || '',
                            });
                        } catch (error) {
                            logger.error({ error, postId: post.id }, 'Failed to publish post.created event');
                        }
                    }

                    return result;
                },
            };
        }

        // Hook updatePost mutation
        if (fieldName === 'updatePost' || fieldName === 'updatePostById') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<PostData>> {
                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<PostData>;

                    if (result?.data) {
                        void ensurePublisher();
                        const post: PostData = result.data;
                        try {
                            await publishPostUpdated({
                                postId: post.id,
                                topicId: post.topicId,
                                authorId: post.authorId,
                                changes: ['body'],
                            });
                        } catch (error) {
                            logger.error({ error, postId: post.id }, 'Failed to publish post.updated event');
                        }
                    }

                    return result;
                },
            };
        }

        // Hook deletePost mutation
        if (fieldName === 'deletePost' || fieldName === 'deletePostById') {
            const originalResolve = field.resolve;
            if (!originalResolve) return field;

            return {
                ...field,
                async resolve(parent: unknown, args: GraphQLArgs, ctx: ResolverContext, info: GraphQLResolveInfo): Promise<MutationResult<PostData>> {
                    const typedArgs = args as MutationArgs;
                    const postId = typedArgs.input?.id || typedArgs.id;

                    const result = (await originalResolve(parent, args, ctx, info)) as MutationResult<PostData>;

                    if (result?.data) {
                        void ensurePublisher();
                        const post: PostData = result.data;
                        try {
                            await publishPostDeleted({
                                postId: postId || post.id,
                                topicId: post.topicId,
                                authorId: post.authorId,
                            });
                        } catch (error) {
                            logger.error({ error, postId }, 'Failed to publish post.deleted event');
                        }
                    }

                    return result;
                },
            };
        }

        return field;
    });
};

/**
 * Combined plugin for all event publishing
 */
export const KafkaEventPlugin: Plugin = (builder, options) => {
    void TopicEventPlugin(builder, options);
    void PostEventPlugin(builder, options);
};
