/**
 * Subscription Types
 *
 * Types for PostgreSQL LISTEN/NOTIFY based subscriptions.
 */

/**
 * Subscription event operations
 */
export type SubscriptionOperation = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Base subscription event payload
 */
export interface SubscriptionEvent<T = unknown> {
    /** The operation that triggered the event */
    operation: SubscriptionOperation;
    /** The table that was modified */
    table: string;
    /** The schema of the table */
    schema: string;
    /** The new data (for INSERT/UPDATE) */
    new?: T;
    /** The old data (for UPDATE/DELETE) */
    old?: T;
    /** Timestamp when the event occurred */
    timestamp: string;
}

/**
 * User-related events
 */
export interface UserPayload {
    id: number;
    username: string;
    name: string | null;
    avatar_url: string | null;
    is_admin: boolean;
}

export interface UserCreatedEvent extends SubscriptionEvent<UserPayload> {
    operation: 'INSERT';
    table: 'users';
}

export interface UserUpdatedEvent extends SubscriptionEvent<UserPayload> {
    operation: 'UPDATE';
    table: 'users';
}

export interface UserDeletedEvent extends SubscriptionEvent<UserPayload> {
    operation: 'DELETE';
    table: 'users';
}

export type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

/**
 * Forum-related events
 */
export interface ForumPayload {
    id: number;
    slug: string;
    name: string;
    description: string;
}

export interface ForumCreatedEvent extends SubscriptionEvent<ForumPayload> {
    operation: 'INSERT';
    table: 'forums';
}

export interface ForumUpdatedEvent extends SubscriptionEvent<ForumPayload> {
    operation: 'UPDATE';
    table: 'forums';
}

export interface ForumDeletedEvent extends SubscriptionEvent<ForumPayload> {
    operation: 'DELETE';
    table: 'forums';
}

export type ForumEvent = ForumCreatedEvent | ForumUpdatedEvent | ForumDeletedEvent;

/**
 * Topic-related events
 */
export interface TopicPayload {
    id: number;
    forum_id: number;
    author_id: number;
    title: string;
    body: string;
}

export interface TopicCreatedEvent extends SubscriptionEvent<TopicPayload> {
    operation: 'INSERT';
    table: 'topics';
}

export interface TopicUpdatedEvent extends SubscriptionEvent<TopicPayload> {
    operation: 'UPDATE';
    table: 'topics';
}

export interface TopicDeletedEvent extends SubscriptionEvent<TopicPayload> {
    operation: 'DELETE';
    table: 'topics';
}

export type TopicEvent = TopicCreatedEvent | TopicUpdatedEvent | TopicDeletedEvent;

/**
 * Post-related events
 */
export interface PostPayload {
    id: number;
    topic_id: number;
    author_id: number;
    body: string;
}

export interface PostCreatedEvent extends SubscriptionEvent<PostPayload> {
    operation: 'INSERT';
    table: 'posts';
}

export interface PostUpdatedEvent extends SubscriptionEvent<PostPayload> {
    operation: 'UPDATE';
    table: 'posts';
}

export interface PostDeletedEvent extends SubscriptionEvent<PostPayload> {
    operation: 'DELETE';
    table: 'posts';
}

export type PostEvent = PostCreatedEvent | PostUpdatedEvent | PostDeletedEvent;

/**
 * All subscription events
 */
export type AppSubscriptionEvent = UserEvent | ForumEvent | TopicEvent | PostEvent;

/**
 * Subscription channel names
 */
export const CHANNELS = {
    USERS: 'app:users',
    FORUMS: 'app:forums',
    TOPICS: 'app:topics',
    POSTS: 'app:posts',
    ALL: 'app:all',
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];

/**
 * Subscription callback type
 */
export type SubscriptionCallback<T = SubscriptionEvent> = (event: T) => void | Promise<void>;

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => Promise<void>;
