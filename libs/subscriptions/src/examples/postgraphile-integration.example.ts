/**
 * PostGraphile Integration Example
 *
 * This example shows how to enable GraphQL subscriptions with PostGraphile.
 */

import type { PostGraphileOptions } from 'postgraphile';

import { subscriptionOptions,SubscriptionSmartTagsPlugin } from '../lib/postgraphile-plugin.js';

/**
 * PostGraphile options for enabling subscriptions
 *
 * Add these to your PostGraphile configuration:
 */
export const subscriptionPostGraphileOptions: Partial<PostGraphileOptions> = {
    // Include the subscription smart tags plugin
    appendPlugins: [
        SubscriptionSmartTagsPlugin,
    ],

    // Enable subscriptions
    ...subscriptionOptions,

    // Configure websocket for subscriptions
    websocketMiddlewares: [],
};

/**
 * Example: Full PostGraphile configuration with subscriptions
 */
export function getPostGraphileOptionsWithSubscriptions(
    baseOptions: PostGraphileOptions
): PostGraphileOptions {
    return {
        ...baseOptions,

        // Merge plugins
        appendPlugins: [
            ...(baseOptions.appendPlugins || []),
            SubscriptionSmartTagsPlugin,
        ],

        // Enable subscriptions
        subscriptions: true,

        // Websocket configuration
        websocketMiddlewares: [],
    };
}

/**
 * Simple Subscriptions provide automatic subscriptions based on LISTEN/NOTIFY.
 *
 * With simple subscriptions enabled, you can subscribe to topics like:
 *
 * ```graphql
 * subscription {
 *   listen(topic: "app:users") {
 *     relatedNode {
 *       nodeId
 *       ... on User {
 *         id
 *         username
 *         name
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * Or for custom topic subscriptions:
 *
 * ```graphql
 * subscription {
 *   listen(topic: "app:posts") {
 *     relatedNodeId
 *     query {
 *       allPosts(first: 10, orderBy: CREATED_AT_DESC) {
 *         nodes {
 *           id
 *           body
 *           author {
 *             username
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */

/**
 * For custom subscriptions, you can create a plugin:
 *
 * ```typescript
 * import { makeExtendSchemaPlugin, gql } from 'graphile-utils';
 * import { pubSub } from '@graphile/pg-pubsub';
 *
 * export const CustomSubscriptionsPlugin = makeExtendSchemaPlugin((build) => ({
 *   typeDefs: gql`
 *     type UserCreatedPayload {
 *       user: User
 *     }
 *
 *     extend type Subscription {
 *       userCreated: UserCreatedPayload
 *     }
 *   `,
 *   resolvers: {
 *     Subscription: {
 *       userCreated: {
 *         subscribe: () => pubSub.asyncIterator('app:users'),
 *         resolve: (payload) => ({
 *           user: payload.new
 *         })
 *       }
 *     }
 *   }
 * }));
 * ```
 */
