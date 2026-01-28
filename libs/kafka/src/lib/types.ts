/**
 * @app/kafka - Type Definitions
 *
 * Event types and interfaces for Kafka messaging.
 */

// ============================================================================
// Base Event Types
// ============================================================================

export interface BaseEvent {
    /** Unique event ID */
    eventId: string;
    /** Event type identifier */
    eventType: string;
    /** ISO timestamp when the event occurred */
    timestamp: string;
    /** Source service that generated the event */
    source: string;
    /** Optional correlation ID for tracing */
    correlationId?: string;
}

// ============================================================================
// User Events
// ============================================================================

export interface UserRegisteredEvent extends BaseEvent {
    eventType: 'user.registered';
    payload: {
        userId: number;
        username: string;
        email: string;
    };
}

export interface UserLoginEvent extends BaseEvent {
    eventType: 'user.login';
    payload: {
        userId: number;
        username: string;
        ipAddress?: string;
        userAgent?: string;
    };
}

export interface UserUpdatedEvent extends BaseEvent {
    eventType: 'user.updated';
    payload: {
        userId: number;
        username: string;
        changes: string[];
    };
}

// ============================================================================
// Topic Events
// ============================================================================

export interface TopicCreatedEvent extends BaseEvent {
    eventType: 'topic.created';
    payload: {
        topicId: number;
        forumId: number;
        authorId: number;
        title: string;
        bodyPreview: string;
    };
}

export interface TopicUpdatedEvent extends BaseEvent {
    eventType: 'topic.updated';
    payload: {
        topicId: number;
        forumId: number;
        authorId: number;
        title: string;
        changes: string[];
    };
}

export interface TopicDeletedEvent extends BaseEvent {
    eventType: 'topic.deleted';
    payload: {
        topicId: number;
        forumId: number;
        authorId: number;
    };
}

export interface TopicViewedEvent extends BaseEvent {
    eventType: 'topic.viewed';
    payload: {
        topicId: number;
        forumId: number;
        viewerId?: number;
        sessionId?: string;
    };
}

// ============================================================================
// Post Events
// ============================================================================

export interface PostCreatedEvent extends BaseEvent {
    eventType: 'post.created';
    payload: {
        postId: number;
        topicId: number;
        forumId: number;
        authorId: number;
        bodyPreview: string;
    };
}

export interface PostUpdatedEvent extends BaseEvent {
    eventType: 'post.updated';
    payload: {
        postId: number;
        topicId: number;
        authorId: number;
        changes: string[];
    };
}

export interface PostDeletedEvent extends BaseEvent {
    eventType: 'post.deleted';
    payload: {
        postId: number;
        topicId: number;
        authorId: number;
    };
}

// ============================================================================
// Search Events
// ============================================================================

export interface SearchPerformedEvent extends BaseEvent {
    eventType: 'search.performed';
    payload: {
        query: string;
        userId?: number;
        resultsCount: number;
        searchType: 'topics' | 'posts' | 'users' | 'all';
        filters?: Record<string, unknown>;
    };
}

// ============================================================================
// Content Events (for Search indexing)
// ============================================================================

export interface ContentCreatedEvent extends BaseEvent {
    eventType: 'content.created';
    payload: {
        contentType: 'topic' | 'post' | 'user';
        contentId: number;
        forumId?: number;
        authorId?: number;
        title?: string;
        body: string;
        metadata?: Record<string, unknown>;
    };
}

export interface ContentUpdatedEvent extends BaseEvent {
    eventType: 'content.updated';
    payload: {
        contentType: 'topic' | 'post' | 'user';
        contentId: number;
        title?: string;
        body?: string;
        metadata?: Record<string, unknown>;
    };
}

export interface ContentDeletedEvent extends BaseEvent {
    eventType: 'content.deleted';
    payload: {
        contentType: 'topic' | 'post' | 'user';
        contentId: number;
    };
}

// ============================================================================
// Moderation Events
// ============================================================================

export interface ContentModeratedEvent extends BaseEvent {
    eventType: 'content.moderated';
    payload: {
        contentType: 'topic' | 'post';
        contentId: number;
        action: 'approved' | 'flagged' | 'hidden' | 'deleted';
        reason?: string;
        moderatorId?: number;
    };
}

// ============================================================================
// Union Types
// ============================================================================

export type UserEvent = UserRegisteredEvent | UserLoginEvent | UserUpdatedEvent;

export type TopicEvent =
    | TopicCreatedEvent
    | TopicUpdatedEvent
    | TopicDeletedEvent
    | TopicViewedEvent;

export type PostEvent = PostCreatedEvent | PostUpdatedEvent | PostDeletedEvent;

export type SearchEvent = SearchPerformedEvent;

export type ContentEvent =
    | ContentCreatedEvent
    | ContentUpdatedEvent
    | ContentDeletedEvent
    | ContentModeratedEvent;

export type ForumEvent =
    | UserEvent
    | TopicEvent
    | PostEvent
    | SearchEvent
    | ContentEvent;

// ============================================================================
// Kafka Topics
// ============================================================================

export const KAFKA_TOPICS = {
    /** User-related events (registration, login, profile updates) */
    USER_EVENTS: 'forum.user.events',
    /** Topic-related events (create, update, delete, view) */
    TOPIC_EVENTS: 'forum.topic.events',
    /** Post-related events (create, update, delete) */
    POST_EVENTS: 'forum.post.events',
    /** Search events for analytics */
    SEARCH_EVENTS: 'forum.search.events',
    /** Content events for search indexing */
    CONTENT_EVENTS: 'forum.content.events',
    /** Moderation events */
    MODERATION_EVENTS: 'forum.moderation.events',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
