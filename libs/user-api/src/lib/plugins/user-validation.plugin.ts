import type { UserInput, UserPatch } from '@app/gql';
import { makeWrapResolversPlugin } from 'graphile-utils';

/**
 * User Validation Plugin
 *
 * Intercepts User mutations (createUser, updateUser, deleteUser)
 * and applies business logic validation BEFORE the mutation runs.
 */

// Validation helper functions

/**
 * Validates username format
 * Database constraint: username ~ '^[a-zA-Z]([a-zA-Z0-9][_]?)+$'
 * - Must start with a letter
 * - Can contain alphanumeric characters and underscores
 * - Underscores cannot be consecutive
 */
function validateUsername(username: string | undefined | null): void {
    if (!username) return;

    // Username must start with a letter and contain only alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z]([a-zA-Z0-9][_]?)+$/;
    if (!usernameRegex.test(username)) {
        throw new Error(
            'Invalid username format. Username must start with a letter, contain only letters, numbers, and underscores (no consecutive underscores).'
        );
    }

    if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long.');
    }

    if (username.length > 50) {
        throw new Error('Username must not exceed 50 characters.');
    }
}

/**
 * Validates user display name
 */
function validateName(name: string | undefined | null): void {
    if (!name) return;

    if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long.');
    }

    if (name.length > 100) {
        throw new Error('Name must not exceed 100 characters.');
    }
}

/**
 * Validates avatar URL format
 */
function validateAvatarUrl(avatarUrl: string | undefined | null): void {
    if (!avatarUrl) return;

    // Basic URL validation
    try {
        const url = new URL(avatarUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Avatar URL must use HTTP or HTTPS protocol.');
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('protocol')) {
            throw error;
        }
        throw new Error('Invalid avatar URL format.');
    }

    if (avatarUrl.length > 500) {
        throw new Error('Avatar URL must not exceed 500 characters.');
    }
}

/**
 * Export the User Validation Plugin
 *
 * This plugin wraps all User mutations with validation logic.
 * Validations run BEFORE the actual mutation, preventing invalid data
 * from being written to the database.
 */
export const UserValidationPlugin = makeWrapResolversPlugin({
    Mutation: {
        // Validate createUser mutation
        createUser: (resolve, source, args, context, resolveInfo) => {
            const { user } = args.input as { user: UserInput };

            // Validate required fields
            if (!user.username || user.username.trim().length === 0) {
                throw new Error('Username is required.');
            }

            // Run validations
            validateUsername(user.username);
            validateName(user.name);
            validateAvatarUrl(user.avatarUrl);

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateUser mutation
        updateUser: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: UserPatch };

            // Only validate fields that are being updated
            if (patch.username !== undefined) {
                validateUsername(patch.username);
            }

            if (patch.name !== undefined) {
                validateName(patch.name);
            }

            if (patch.avatarUrl !== undefined) {
                validateAvatarUrl(patch.avatarUrl);
            }

            // All validations passed - proceed with mutation
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateUserByUsername mutation
        updateUserByUsername: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: UserPatch };

            if (patch.username !== undefined) {
                validateUsername(patch.username);
            }

            if (patch.name !== undefined) {
                validateName(patch.name);
            }

            if (patch.avatarUrl !== undefined) {
                validateAvatarUrl(patch.avatarUrl);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate updateUserByNodeId mutation
        updateUserByNodeId: (resolve, source, args, context, resolveInfo) => {
            const { patch } = args.input as { patch: UserPatch };

            if (patch.username !== undefined) {
                validateUsername(patch.username);
            }

            if (patch.name !== undefined) {
                validateName(patch.name);
            }

            if (patch.avatarUrl !== undefined) {
                validateAvatarUrl(patch.avatarUrl);
            }

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteUser mutation
        deleteUser: (resolve, source, args, context, resolveInfo) => {
            // Add business logic here if needed:
            // - Check if user has posts/topics
            // - Check user permissions (admin only?)
            // - Log the deletion attempt
            // - Prevent self-deletion

            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteUserByUsername mutation
        deleteUserByUsername: (resolve, source, args, context, resolveInfo) => {
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },

        // Validate deleteUserByNodeId mutation
        deleteUserByNodeId: (resolve, source, args, context, resolveInfo) => {
            return resolve(source, args, context, resolveInfo) as Promise<unknown>;
        },
    },
});
