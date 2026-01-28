/**
 * @app/subscriptions
 *
 * PostgreSQL LISTEN/NOTIFY based subscriptions for real-time events.
 */

// Types
export type {
    AppSubscriptionEvent,
    ChannelName,
    ForumCreatedEvent,
    ForumDeletedEvent,
    ForumEvent,
    ForumPayload,
    ForumUpdatedEvent,
    PostCreatedEvent,
    PostDeletedEvent,
    PostEvent,
    PostPayload,
    PostUpdatedEvent,
    SubscriptionCallback,
    SubscriptionEvent,
    SubscriptionOperation,
    TopicCreatedEvent,
    TopicDeletedEvent,
    TopicEvent,
    TopicPayload,
    TopicUpdatedEvent,
    Unsubscribe,
    UserCreatedEvent,
    UserDeletedEvent,
    UserEvent,
    UserPayload,
    UserUpdatedEvent,
} from './lib/types.js';

export { CHANNELS } from './lib/types.js';

// Subscription Manager
export {
    getSubscriptionManager,
    initializeSubscriptions,
    shutdownSubscriptions,
    SubscriptionManager,
} from './lib/manager.js';

// Publish functions
export {
    publishEvent,
    publishForumEvent,
    publishPostEvent,
    publishTopicEvent,
    publishUserEvent,
} from './lib/publish.js';

// PostGraphile plugin
export {
    SubscriptionSmartTagsPlugin,
    subscriptionOptions,
} from './lib/postgraphile-plugin.js';
