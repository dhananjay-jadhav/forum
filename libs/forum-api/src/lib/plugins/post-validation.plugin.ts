import type { PostInput, PostPatch } from '@app/gql';
import { makeWrapResolversPlugin } from 'graphile-utils';

/**
 * Post Validation Plugin
 *
 * Intercepts Post mutations (createPost, updatePost, deletePost)
 * and applies business logic validation BEFORE the mutation runs.
 */

// Validation helper functions
function validateBody(body: string | undefined | null): void {
    if (!body) return;

    if (body.trim().length < 10) {
        throw new Error('Post body must be at least 10 characters long.');
    }

    if (body.length > 50000) {
        throw new Error('Post body must not exceed 50000 characters.');
    }

    // Check for spam patterns
    const spamPatterns = [
        /(.)\1{10,}/g, // Repeated characters (more than 10)
        /\b(?:viagra|casino|lottery|winner|congratulations)\b/gi,
    ];
    for (const pattern of spamPatterns) {
        if (pattern.test(body)) {
            throw new Error('Post body contains prohibited content.');
        }
    }
}

// Context type for pgClient
interface PgContext {
    pgClient: {
        query: (sql: string, params: unknown[]) => Promise<{ rows: Array<{ id?: number; count?: string }> }>;
    };
}

/**
 * Export the Post Validation Plugin
 *
 * This plugin wraps all Post mutations with validation logic.
 * Validations run BEFORE the actual mutation, preventing invalid data
 * from being written to the database.
 */
export const PostValidationPlugin = makeWrapResolversPlugin({
    Mutation: {
        // Validate createPost mutation
        createPost: async (resolve, source, args, context, resolveInfo) => {
            const { post } = args.input as { post: PostInput };
            const { pgClient } = context as PgContext;

            // Validate required fields
            if (!post.body || post.body.trim().length === 0) {
                throw new Error('Post body is required.');
            }

            // Run validations
            validateBody(post.body);

            // Business logic: Verify topic exists
            if (post.topicId) {
                const topicResult = await pgClient.query('SELECT id FROM app_public.topics WHERE id = $1', [
                    post.topicId,
                ]);
                if (topicResult.rows.length === 0) {
                    throw new Error('Topic does not exist.');
                }
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updatePost mutation
        updatePost: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: PostPatch };

            // Validate body if being updated
            if (patch.body !== undefined) {
                validateBody(patch.body);
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updatePostByNodeId mutation
        updatePostByNodeId: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: PostPatch };

            if (patch.body !== undefined) {
                validateBody(patch.body);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deletePost mutation
        deletePost: async (resolve, source, args, context, resolveInfo) => {
            const { pgClient } = context as PgContext;
            const { id } = args.input as { id?: number };

            // Business logic: Only allow deletion if post exists
            if (id) {
                const postResult = await pgClient.query('SELECT id FROM app_public.posts WHERE id = $1', [id]);
                if (postResult.rows.length === 0) {
                    throw new Error('Post not found.');
                }
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deletePostByNodeId mutation
        deletePostByNodeId: (resolve, source, args, context, resolveInfo) => {
            // Add business logic here if needed
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },
    },
});
