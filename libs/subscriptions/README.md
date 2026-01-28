# @app/subscriptions

Real-time subscription library for PostgreSQL LISTEN/NOTIFY events using PostGraphile.

## Features

- **PostgreSQL LISTEN/NOTIFY**: Native PostgreSQL pub/sub for real-time events
- **Type-safe events**: Strongly typed subscription events for users, forums, topics, and posts
- **Auto-reconnection**: Automatic reconnection with exponential backoff
- **PostGraphile integration**: Smart tags plugin for GraphQL subscriptions

## Installation

The library is part of the workspace. Just import from `@app/subscriptions`.

## Usage

### 1. Apply the Database Migration

The migration in `current.sql` creates:
- `app_private.tg__notify_subscription()` - Trigger function for NOTIFY
- Triggers on `users`, `forums`, `topics`, `posts` tables

Run the migration with:

```bash
yarn db:migrate
```

### 2. Subscribe to Events (Server-side)

```typescript
import {
  initializeSubscriptions,
  shutdownSubscriptions,
  CHANNELS,
} from '@app/subscriptions';
import type { UserEvent, PostEvent } from '@app/subscriptions';

// Initialize on server startup
const manager = await initializeSubscriptions();

// Subscribe to user events
await manager.subscribeToUsers((event) => {
  const userEvent = event as UserEvent;
  console.log(`User ${userEvent.operation}:`, userEvent.new?.username);
});

// Subscribe to post events
await manager.subscribeToPosts((event) => {
  const postEvent = event as PostEvent;
  if (postEvent.operation === 'INSERT') {
    console.log('New post created:', postEvent.new?.id);
  }
});

// Subscribe to all events
await manager.subscribeToAll((event) => {
  console.log(`${event.table} ${event.operation}`);
});

// On shutdown
await shutdownSubscriptions();
```

### 3. Publish Events (optional manual publishing)

```typescript
import {
  publishUserEvent,
  publishPostEvent,
} from '@app/subscriptions';

// Publish a user created event
await publishUserEvent('INSERT', {
  id: 1,
  username: 'newuser',
  name: 'New User',
  avatar_url: null,
  is_admin: false,
});

// Publish a post update event
await publishPostEvent('UPDATE', 
  { id: 1, body: 'Updated content' },
  { id: 1, body: 'Original content' }
);
```

### 4. PostGraphile Integration (GraphQL Subscriptions)

Add to your PostGraphile configuration:

```typescript
import { SubscriptionSmartTagsPlugin } from '@app/subscriptions';

const options = {
  appendPlugins: [SubscriptionSmartTagsPlugin],
  subscriptions: true,
  simpleSubscriptions: true,
};
```

Then use GraphQL subscriptions:

```graphql
subscription {
  listen(topic: "app:users") {
    relatedNode {
      ... on User {
        id
        username
        name
      }
    }
  }
}
```

## Event Types

### Channels

| Channel | Description |
|---------|-------------|
| `app:users` | User events |
| `app:forums` | Forum events |
| `app:topics` | Topic events |
| `app:posts` | Post events |
| `app:all` | All events |

### Event Structure

```typescript
interface SubscriptionEvent<T> {
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  timestamp: string;
  new?: T;  // For INSERT/UPDATE
  old?: T;  // For UPDATE/DELETE
}
```

### Payload Types

- `UserPayload` - id, username, name, avatar_url, is_admin
- `ForumPayload` - id, slug, name, description  
- `TopicPayload` - id, forum_id, author_id, title, body
- `PostPayload` - id, topic_id, author_id, body

## API Reference

### Subscription Manager

```typescript
// Get or create the singleton manager
getSubscriptionManager(): SubscriptionManager

// Initialize and connect
initializeSubscriptions(): Promise<SubscriptionManager>

// Disconnect and cleanup
shutdownSubscriptions(): Promise<void>
```

### SubscriptionManager Methods

```typescript
// Connect to database
connect(): Promise<void>

// Disconnect
disconnect(): Promise<void>

// Subscribe to specific channels
subscribeToUsers(callback): Promise<Unsubscribe>
subscribeToForums(callback): Promise<Unsubscribe>
subscribeToTopics(callback): Promise<Unsubscribe>
subscribeToPosts(callback): Promise<Unsubscribe>
subscribeToAll(callback): Promise<Unsubscribe>

// Generic subscribe
subscribe<T>(channel, callback): Promise<Unsubscribe>

// Check connection status
isActive(): boolean
```

## Building

Run `nx build subscriptions` to build the library.

## Running unit tests

Run `nx test subscriptions` to execute the unit tests via [Jest](https://jestjs.io).

## Examples

See the `examples/` directory for integration examples:

- `api-integration.example.ts` - Server-side subscription setup
- `postgraphile-integration.example.ts` - GraphQL subscription configuration
