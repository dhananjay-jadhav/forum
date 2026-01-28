import type { ForumInput, ForumPatch } from '@app/gql';
import { makeWrapResolversPlugin } from 'graphile-utils';

/**
 * Forum Validation Plugin
 *
 * Intercepts Forum mutations (createForum, updateForum, deleteForum)
 * and applies business logic validation BEFORE the mutation runs.
 */

// Validation helper functions
function validateSlug(slug: string | undefined | null): void {
    if (!slug) return;

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
        throw new Error(
            'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens (no consecutive hyphens or leading/trailing hyphens).'
        );
    }

    if (slug.length < 3) {
        throw new Error('Slug must be at least 3 characters long.');
    }

    if (slug.length > 50) {
        throw new Error('Slug must not exceed 50 characters.');
    }
}

function validateForumName(name: string | undefined | null): void {
    if (!name) return;

    if (name.trim().length < 3) {
        throw new Error('Forum name must be at least 3 characters long.');
    }

    if (name.length > 100) {
        throw new Error('Forum name must not exceed 100 characters.');
    }
}

function validateDescription(description: string | undefined | null): void {
    if (!description) return;

    if (description.length > 500) {
        throw new Error('Forum description must not exceed 500 characters.');
    }
}

/**
 * Export the Forum Validation Plugin
 *
 * This plugin wraps all Forum mutations with validation logic.
 * Validations run BEFORE the actual mutation, preventing invalid data
 * from being written to the database.
 */
export const ForumValidationPlugin = makeWrapResolversPlugin({
    Mutation: {
        // Validate createForum mutation
        createForum: (resolve, source, args, context, resolveInfo) => {
            const { forum } = args.input as { forum: ForumInput };

            // Validate required fields
            if (!forum.name || forum.name.trim().length === 0) {
                throw new Error('Forum name is required.');
            }

            if (!forum.slug || forum.slug.trim().length === 0) {
                throw new Error('Forum slug is required.');
            }

            // Run validations
            validateForumName(forum.name);
            validateSlug(forum.slug);
            validateDescription(forum.description);

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateForum mutation
        updateForum: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: ForumPatch };

            // Only validate fields that are being updated
            if (patch.name !== undefined) {
                validateForumName(patch.name);
            }

            if (patch.slug !== undefined) {
                validateSlug(patch.slug);
            }

            if (patch.description !== undefined) {
                validateDescription(patch.description);
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateForumBySlug mutation
        updateForumBySlug: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: ForumPatch };

            if (patch.name !== undefined) {
                validateForumName(patch.name);
            }

            if (patch.slug !== undefined) {
                validateSlug(patch.slug);
            }

            if (patch.description !== undefined) {
                validateDescription(patch.description);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateForumByNodeId mutation
        updateForumByNodeId: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: ForumPatch };

            if (patch.name !== undefined) {
                validateForumName(patch.name);
            }

            if (patch.slug !== undefined) {
                validateSlug(patch.slug);
            }

            if (patch.description !== undefined) {
                validateDescription(patch.description);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteForum mutation
        deleteForum: (resolve, source, args, context, resolveInfo) => {
            // Add business logic here if needed:
            // - Check if forum has topics
            // - Check user permissions
            // - Log the deletion attempt

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteForumBySlug mutation
        deleteForumBySlug: (resolve, source, args, context, resolveInfo) => {
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteForumByNodeId mutation
        deleteForumByNodeId: (resolve, source, args, context, resolveInfo) => {
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },
    },
});
