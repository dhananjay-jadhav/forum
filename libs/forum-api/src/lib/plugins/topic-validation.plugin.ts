import type { TopicInput, TopicPatch } from '@app/gql';
import { makeWrapResolversPlugin } from 'graphile-utils';

/**
 * Topic Validation Plugin
 *
 * Intercepts Topic mutations (createTopic, updateTopic, deleteTopic)
 * and applies business logic validation BEFORE the mutation runs.
 */

// Validation helper functions
function validateTitle(title: string | undefined | null): void {
    if (!title) return;

    if (title.trim().length < 5) {
        throw new Error('Topic title must be at least 5 characters long.');
    }

    if (title.length > 200) {
        throw new Error('Topic title must not exceed 200 characters.');
    }

    // Check for spam patterns (example business logic)
    const spamPatterns = [/https?:\/\/\S+/gi, /\b(buy|sell|free|click here)\b/gi];
    for (const pattern of spamPatterns) {
        if (pattern.test(title)) {
            throw new Error('Topic title contains prohibited content.');
        }
    }
}

function validateBody(body: string | undefined | null): void {
    if (!body) return;

    if (body.trim().length < 10) {
        throw new Error('Topic body must be at least 10 characters long.');
    }

    if (body.length > 10000) {
        throw new Error('Topic body must not exceed 10000 characters.');
    }
}

// Context type for pgClient
interface PgContext {
    pgClient: {
        query: (sql: string, params: unknown[]) => Promise<{ rows: { id: number }[] }>;
    };
}

/**
 * Export the Topic Validation Plugin
 *
 * This plugin wraps all Topic mutations with validation logic.
 * Validations run BEFORE the actual mutation, preventing invalid data
 * from being written to the database.
 */
export const TopicValidationPlugin = makeWrapResolversPlugin({
    Mutation: {
        // Validate createTopic mutation
        createTopic: async (resolve, source, args, context, resolveInfo) => {
            const { topic } = args.input as { topic: TopicInput };
            const { pgClient } = context as PgContext;

            // Validate required fields
            if (!topic.title || topic.title.trim().length === 0) {
                throw new Error('Topic title is required.');
            }

            // Run validations
            validateTitle(topic.title);
            validateBody(topic.body);

            // Business logic: Verify forum exists
            if (topic.forumId) {
                const forumResult = await pgClient.query('SELECT id FROM app_public.forums WHERE id = $1', [
                    topic.forumId,
                ]);
                if (forumResult.rows.length === 0) {
                    throw new Error('Forum does not exist.');
                }
            }

            // Business logic: Verify author exists
            if (topic.authorId) {
                const authorResult = await pgClient.query('SELECT id FROM app_public.users WHERE id = $1', [
                    topic.authorId,
                ]);
                if (authorResult.rows.length === 0) {
                    throw new Error('Author does not exist.');
                }
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateTopic mutation
        updateTopic: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: TopicPatch };

            // Only validate fields that are being updated
            if (patch.title !== undefined) {
                validateTitle(patch.title);
            }

            if (patch.body !== undefined) {
                validateBody(patch.body);
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateTopicByNodeId mutation
        updateTopicByNodeId: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: TopicPatch };

            if (patch.title !== undefined) {
                validateTitle(patch.title);
            }

            if (patch.body !== undefined) {
                validateBody(patch.body);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteTopic mutation
        deleteTopic: async (resolve, source, args, context, resolveInfo) => {
            const { pgClient } = context as PgContext;
            const { id } = args.input as { id?: number };

            // Business logic: Check for existing posts before deletion
            if (id) {
                const postResult = await pgClient.query('SELECT id FROM app_public.posts WHERE topic_id = $1 LIMIT 1', [
                    id,
                ]);
                if (postResult.rows.length > 0) {
                    throw new Error(
                        'Cannot delete topic with existing posts. Please delete all posts first or use cascade delete.'
                    );
                }
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteTopicByNodeId mutation
        deleteTopicByNodeId: (resolve, source, args, context, resolveInfo) => {
            // Add business logic here if needed
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },
    },
});
