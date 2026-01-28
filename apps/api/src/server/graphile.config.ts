import { getPool } from '@app/database';
import {
    // ForumMutationsPlugin,
    // ForumMutationWrapperPlugin,
    // TopicMutationsPlugin,
    // TopicMutationWrapperPlugin,
    // PostMutationsPlugin,
    // PostMutationWrapperPlugin,
    // Validation plugins - run business logic before mutations
    ForumValidationPlugin,
    PostValidationPlugin,
    TopicValidationPlugin,
} from '@app/forum-api';
import { QueryValidationPlugin } from '@app/gql';
import { SubscriptionSmartTagsPlugin } from '@app/subscriptions';
import { AuthenticationPlugin, extractBearerToken, UserValidationPlugin, verifyAccessToken } from '@app/user-api';
import { env, logger } from '@app/utils';
import  PgPubsub  from '@graphile/pg-pubsub';
import PgSimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector';
import { makePluginHook, PostGraphileOptions } from 'postgraphile';

// Plugin hook includes QueryValidationPlugin and PgPubsub for real-time subscriptions
const pluginHook = makePluginHook([QueryValidationPlugin, PgPubsub]);

/**
 * Verifies that a user exists in the database.
 * Returns the user if found, null otherwise.
 */
async function verifyUserExists(userId: number): Promise<{ id: number; username: string } | null> {
    try {
        const pool = getPool();
        const result = await pool.query<{ id: number; username: string }>(
            'SELECT id, username FROM app_public.users WHERE id = $1',
            [userId]
        );
        return result.rows[0] ?? null;
    } catch (error) {
        logger.error({ error, userId }, 'Error verifying user existence');
        return null;
    }
}

/**
 * Extracts and validates JWT from request, returning user info if valid.
 * Used by both pgSettings and additionalGraphQLContextFromRequest.
 */
async function getAuthenticatedUser(req: {
    headers: { 'authorization'?: string; 'x-test-user-id'?: string };
}): Promise<{ id: number; username: string } | null> {
    // Try to extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (token) {
        try {
            const claims = verifyAccessToken(token);
            const user = await verifyUserExists(claims.user_id);

            if (user) {
                logger.debug({ userId: user.id, username: user.username }, 'JWT authenticated and user verified');
                return user;
            } else {
                logger.warn({ userId: claims.user_id }, 'JWT valid but user not found in database');
            }
        } catch {
            logger.debug('Invalid JWT token in request');
        }
    }

    // In development/test, if there's a test user ID header and no JWT, use it
    if (env.isDevelopment || env.isTest) {
        const testUserId = req.headers['x-test-user-id'] as string;
        if (testUserId) {
            const user = await verifyUserExists(parseInt(testUserId, 10));
            if (user) {
                return user;
            } else {
                logger.warn({ testUserId }, 'Test user ID header provided but user not found');
            }
        }
    }

    return null;
}

export const postGraphileOptions: PostGraphileOptions = {
    pluginHook,
    watchPg: false, // env.isDevelopment,
    subscriptions: true,
    simpleSubscriptions: true, // Enable listen() subscription for PostgreSQL NOTIFY
    retryOnInitFail: (error: Error, attempts: number) => {
        if (attempts > 10) {
            return false;
        }
        logger.warn(`Postgraphile server retryOnInitFailed: attempts: ${attempts} error: ${error.message}`);
        return true;
    },
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: env.isDevelopment ? 'json' : false,
    extendedErrors: env.isDevelopment ? ['hint', 'detail', 'errcode'] : ['errcode'],
    appendPlugins: [
        PgSimplifyInflectorPlugin,
        // // Custom mutations and queries
        // ForumMutationsPlugin,
        // TopicMutationsPlugin,
        // PostMutationsPlugin,
        // // Mutation wrappers (legacy)
        // ForumMutationWrapperPlugin,
        // TopicMutationWrapperPlugin,
        // PostMutationWrapperPlugin,
        // Authentication plugin - login, register, refresh token
        AuthenticationPlugin,
        // Validation plugins - business logic validation before mutations
        ForumValidationPlugin,
        TopicValidationPlugin,
        PostValidationPlugin,
        UserValidationPlugin,
        // Subscription smart tags for real-time events
        SubscriptionSmartTagsPlugin,
    ],
    // Add current user to GraphQL context for use in resolver plugins
    additionalGraphQLContextFromRequest: async (req): Promise<{
        currentUser: { id: number; username: string } | null;
        isAuthenticated: boolean;
        getCurrentUserId: () => number;
    }> => {
        const user = await getAuthenticatedUser(req);
        return {
            // Current authenticated user (null if not authenticated)
            currentUser: user,
            // Helper to check if user is authenticated
            isAuthenticated: !!user,
            // Helper to get current user ID (throws if not authenticated)
            getCurrentUserId: (): number => {
                if (!user) {
                    throw new Error('Authentication required');
                }
                return user.id;
            },
        };
    },
    // Set PostgreSQL session variables for RLS policies
    pgSettings: async req => {
        const settings: Record<string, string> = {};
        const user = await getAuthenticatedUser(req);

        if (user) {
            settings['jwt.claims.user_id'] = String(user.id);
            settings['jwt.claims.username'] = user.username;
        }

        return settings;
    },
    graphiql: env.isDevelopment,
    enhanceGraphiql: env.isDevelopment,
    allowExplain() {
        return env.isDevelopment;
    },
    enableQueryBatching: true,
    disableQueryLog: env.isDevelopment, // our default logging has performance issues, but do make sure you have a logging system in place!
    legacyRelations: 'omit',
    ignoreIndexes: false,
    exportGqlSchemaPath: 'libs/gql/src/lib/schema.graphql',
    sortExport: true,
};
