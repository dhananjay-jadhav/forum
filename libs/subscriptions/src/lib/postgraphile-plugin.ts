/**
 * PostGraphile Subscription Plugin
 *
 * Integrates with @graphile/pg-pubsub for GraphQL subscriptions.
 */

import { PgEntityKind } from 'graphile-build-pg';
import { makePgSmartTagsPlugin } from 'graphile-utils';

/**
 * Smart tags to enable subscriptions on specific tables
 *
 * Add @subscription to tables you want to enable GraphQL subscriptions for.
 */
export const SubscriptionSmartTagsPlugin = makePgSmartTagsPlugin([
    {
        kind: PgEntityKind.CLASS,
        match: 'app_public.users',
        tags: {
            subscription: true,
        },
    },
    {
        kind: PgEntityKind.CLASS,
        match: 'app_public.forums',
        tags: {
            subscription: true,
        },
    },
    {
        kind: PgEntityKind.CLASS,
        match: 'app_public.topics',
        tags: {
            subscription: true,
        },
    },
    {
        kind: PgEntityKind.CLASS,
        match: 'app_public.posts',
        tags: {
            subscription: true,
        },
    },
]);

/**
 * PostGraphile configuration for subscriptions
 *
 * Add these options to your PostGraphile configuration:
 *
 * ```typescript
 * import { makePgSubscriptionPubsubPlugin } from '@graphile/pg-pubsub';
 * import { subscriptionPluginHook } from '@app/subscriptions';
 *
 * const options: PostGraphileOptions = {
 *   // ... other options
 *   pluginHook: subscriptionPluginHook,
 *   subscriptions: true,
 *   simpleSubscriptions: true,
 *   websocketMiddlewares: [],
 * };
 * ```
 */
export const subscriptionOptions = {
    /** Enable GraphQL subscriptions */
    subscriptions: true,
    /** Enable live queries (requires @graphile/subscriptions-lds) */
    live: false,
};
