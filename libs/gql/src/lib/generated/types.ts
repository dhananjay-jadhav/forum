export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: { input: string; output: string; }
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
}

/** All input for the `completeJob` mutation. */
export interface CompleteJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  jobId?: InputMaybe<Scalars['Int']['input']>;
  workerId?: InputMaybe<Scalars['String']['input']>;
}

/** The output of our `completeJob` mutation. */
export interface CompleteJobPayload {
  __typename?: 'CompleteJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our `completeJob` mutation. */
export interface CompleteJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** All input for the create `Forum` mutation. */
export interface CreateForumInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `Forum` to be created by this mutation. */
  forum: ForumInput;
}

/** The output of our create `Forum` mutation. */
export interface CreateForumPayload {
  __typename?: 'CreateForumPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Forum` that was created by this mutation. */
  forum?: Maybe<Forum>;
  /** An edge for our `Forum`. May be used by Relay 1. */
  forumEdge?: Maybe<ForumsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our create `Forum` mutation. */
export interface CreateForumPayloadForumEdgeArgs {
  orderBy?: InputMaybe<Array<ForumsOrderBy>>;
}

/** All input for the create `Job` mutation. */
export interface CreateJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `Job` to be created by this mutation. */
  job: JobInput;
}

/** The output of our create `Job` mutation. */
export interface CreateJobPayload {
  __typename?: 'CreateJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Job` that was created by this mutation. */
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our create `Job` mutation. */
export interface CreateJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** All input for the create `JobQueue` mutation. */
export interface CreateJobQueueInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `JobQueue` to be created by this mutation. */
  jobQueue: JobQueueInput;
}

/** The output of our create `JobQueue` mutation. */
export interface CreateJobQueuePayload {
  __typename?: 'CreateJobQueuePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `JobQueue` that was created by this mutation. */
  jobQueue?: Maybe<JobQueue>;
  /** An edge for our `JobQueue`. May be used by Relay 1. */
  jobQueueEdge?: Maybe<JobQueuesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our create `JobQueue` mutation. */
export interface CreateJobQueuePayloadJobQueueEdgeArgs {
  orderBy?: InputMaybe<Array<JobQueuesOrderBy>>;
}

/** All input for the create `Post` mutation. */
export interface CreatePostInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `Post` to be created by this mutation. */
  post: PostInput;
}

/** The output of our create `Post` mutation. */
export interface CreatePostPayload {
  __typename?: 'CreatePostPayload';
  /** Reads a single `User` that is related to this `Post`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Post` that was created by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Topic` that is related to this `Post`. */
  topic?: Maybe<Topic>;
}


/** The output of our create `Post` mutation. */
export interface CreatePostPayloadPostEdgeArgs {
  orderBy?: InputMaybe<Array<PostsOrderBy>>;
}

/** All input for the create `Topic` mutation. */
export interface CreateTopicInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `Topic` to be created by this mutation. */
  topic: TopicInput;
}

/** The output of our create `Topic` mutation. */
export interface CreateTopicPayload {
  __typename?: 'CreateTopicPayload';
  /** Reads a single `User` that is related to this `Topic`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Reads a single `Forum` that is related to this `Topic`. */
  forum?: Maybe<Forum>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Topic` that was created by this mutation. */
  topic?: Maybe<Topic>;
  /** An edge for our `Topic`. May be used by Relay 1. */
  topicEdge?: Maybe<TopicsEdge>;
}


/** The output of our create `Topic` mutation. */
export interface CreateTopicPayloadTopicEdgeArgs {
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
}

/** All input for the create `UserAuthentication` mutation. */
export interface CreateUserAuthenticationInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `UserAuthentication` to be created by this mutation. */
  userAuthentication: UserAuthenticationInput;
}

/** The output of our create `UserAuthentication` mutation. */
export interface CreateUserAuthenticationPayload {
  __typename?: 'CreateUserAuthenticationPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `UserAuthentication` that was created by this mutation. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** An edge for our `UserAuthentication`. May be used by Relay 1. */
  userAuthenticationEdge?: Maybe<UserAuthenticationsEdge>;
}


/** The output of our create `UserAuthentication` mutation. */
export interface CreateUserAuthenticationPayloadUserAuthenticationEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationsOrderBy>>;
}

/** All input for the create `UserAuthenticationSecret` mutation. */
export interface CreateUserAuthenticationSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `UserAuthenticationSecret` to be created by this mutation. */
  userAuthenticationSecret: UserAuthenticationSecretInput;
}

/** The output of our create `UserAuthenticationSecret` mutation. */
export interface CreateUserAuthenticationSecretPayload {
  __typename?: 'CreateUserAuthenticationSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserAuthentication` that is related to this `UserAuthenticationSecret`. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** The `UserAuthenticationSecret` that was created by this mutation. */
  userAuthenticationSecret?: Maybe<UserAuthenticationSecret>;
  /** An edge for our `UserAuthenticationSecret`. May be used by Relay 1. */
  userAuthenticationSecretEdge?: Maybe<UserAuthenticationSecretsEdge>;
}


/** The output of our create `UserAuthenticationSecret` mutation. */
export interface CreateUserAuthenticationSecretPayloadUserAuthenticationSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationSecretsOrderBy>>;
}

/** All input for the create `UserEmail` mutation. */
export interface CreateUserEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `UserEmail` to be created by this mutation. */
  userEmail: UserEmailInput;
}

/** The output of our create `UserEmail` mutation. */
export interface CreateUserEmailPayload {
  __typename?: 'CreateUserEmailPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserEmail`. */
  user?: Maybe<User>;
  /** The `UserEmail` that was created by this mutation. */
  userEmail?: Maybe<UserEmail>;
  /** An edge for our `UserEmail`. May be used by Relay 1. */
  userEmailEdge?: Maybe<UserEmailsEdge>;
}


/** The output of our create `UserEmail` mutation. */
export interface CreateUserEmailPayloadUserEmailEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailsOrderBy>>;
}

/** All input for the create `UserEmailSecret` mutation. */
export interface CreateUserEmailSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `UserEmailSecret` to be created by this mutation. */
  userEmailSecret: UserEmailSecretInput;
}

/** The output of our create `UserEmailSecret` mutation. */
export interface CreateUserEmailSecretPayload {
  __typename?: 'CreateUserEmailSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserEmail` that is related to this `UserEmailSecret`. */
  userEmail?: Maybe<UserEmail>;
  /** The `UserEmailSecret` that was created by this mutation. */
  userEmailSecret?: Maybe<UserEmailSecret>;
  /** An edge for our `UserEmailSecret`. May be used by Relay 1. */
  userEmailSecretEdge?: Maybe<UserEmailSecretsEdge>;
}


/** The output of our create `UserEmailSecret` mutation. */
export interface CreateUserEmailSecretPayloadUserEmailSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailSecretsOrderBy>>;
}

/** All input for the create `User` mutation. */
export interface CreateUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `User` to be created by this mutation. */
  user: UserInput;
}

/** The output of our create `User` mutation. */
export interface CreateUserPayload {
  __typename?: 'CreateUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was created by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our create `User` mutation. */
export interface CreateUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the create `UserSecret` mutation. */
export interface CreateUserSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `UserSecret` to be created by this mutation. */
  userSecret: UserSecretInput;
}

/** The output of our create `UserSecret` mutation. */
export interface CreateUserSecretPayload {
  __typename?: 'CreateUserSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserSecret`. */
  user?: Maybe<User>;
  /** The `UserSecret` that was created by this mutation. */
  userSecret?: Maybe<UserSecret>;
  /** An edge for our `UserSecret`. May be used by Relay 1. */
  userSecretEdge?: Maybe<UserSecretsEdge>;
}


/** The output of our create `UserSecret` mutation. */
export interface CreateUserSecretPayloadUserSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserSecretsOrderBy>>;
}

/** All input for the `deleteForumByNodeId` mutation. */
export interface DeleteForumByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Forum` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteForumBySlug` mutation. */
export interface DeleteForumBySlugInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An URL-safe alias for the `Forum`. */
  slug: Scalars['String']['input'];
}

/** All input for the `deleteForum` mutation. */
export interface DeleteForumInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `Forum` mutation. */
export interface DeleteForumPayload {
  __typename?: 'DeleteForumPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedForumNodeId?: Maybe<Scalars['ID']['output']>;
  /** The `Forum` that was deleted by this mutation. */
  forum?: Maybe<Forum>;
  /** An edge for our `Forum`. May be used by Relay 1. */
  forumEdge?: Maybe<ForumsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our delete `Forum` mutation. */
export interface DeleteForumPayloadForumEdgeArgs {
  orderBy?: InputMaybe<Array<ForumsOrderBy>>;
}

/** All input for the `deleteJobByNodeId` mutation. */
export interface DeleteJobByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Job` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteJob` mutation. */
export interface DeleteJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `Job` mutation. */
export interface DeleteJobPayload {
  __typename?: 'DeleteJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedJobNodeId?: Maybe<Scalars['ID']['output']>;
  /** The `Job` that was deleted by this mutation. */
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our delete `Job` mutation. */
export interface DeleteJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** All input for the `deleteJobQueueByNodeId` mutation. */
export interface DeleteJobQueueByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `JobQueue` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteJobQueue` mutation. */
export interface DeleteJobQueueInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  queueName: Scalars['String']['input'];
}

/** The output of our delete `JobQueue` mutation. */
export interface DeleteJobQueuePayload {
  __typename?: 'DeleteJobQueuePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedJobQueueNodeId?: Maybe<Scalars['ID']['output']>;
  /** The `JobQueue` that was deleted by this mutation. */
  jobQueue?: Maybe<JobQueue>;
  /** An edge for our `JobQueue`. May be used by Relay 1. */
  jobQueueEdge?: Maybe<JobQueuesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our delete `JobQueue` mutation. */
export interface DeleteJobQueuePayloadJobQueueEdgeArgs {
  orderBy?: InputMaybe<Array<JobQueuesOrderBy>>;
}

/** All input for the `deletePostByNodeId` mutation. */
export interface DeletePostByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Post` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deletePost` mutation. */
export interface DeletePostInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `Post` mutation. */
export interface DeletePostPayload {
  __typename?: 'DeletePostPayload';
  /** Reads a single `User` that is related to this `Post`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedPostNodeId?: Maybe<Scalars['ID']['output']>;
  /** The `Post` that was deleted by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Topic` that is related to this `Post`. */
  topic?: Maybe<Topic>;
}


/** The output of our delete `Post` mutation. */
export interface DeletePostPayloadPostEdgeArgs {
  orderBy?: InputMaybe<Array<PostsOrderBy>>;
}

/** All input for the `deleteTopicByNodeId` mutation. */
export interface DeleteTopicByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Topic` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteTopic` mutation. */
export interface DeleteTopicInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `Topic` mutation. */
export interface DeleteTopicPayload {
  __typename?: 'DeleteTopicPayload';
  /** Reads a single `User` that is related to this `Topic`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedTopicNodeId?: Maybe<Scalars['ID']['output']>;
  /** Reads a single `Forum` that is related to this `Topic`. */
  forum?: Maybe<Forum>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Topic` that was deleted by this mutation. */
  topic?: Maybe<Topic>;
  /** An edge for our `Topic`. May be used by Relay 1. */
  topicEdge?: Maybe<TopicsEdge>;
}


/** The output of our delete `Topic` mutation. */
export interface DeleteTopicPayloadTopicEdgeArgs {
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
}

/** All input for the `deleteUserAuthenticationByNodeId` mutation. */
export interface DeleteUserAuthenticationByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserAuthentication` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserAuthenticationByServiceAndIdentifier` mutation. */
export interface DeleteUserAuthenticationByServiceAndIdentifierInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** A unique identifier for the user within the login service. */
  identifier: Scalars['String']['input'];
  /** The login service used, e.g. `twitter` or `github`. */
  service: Scalars['String']['input'];
}

/** All input for the `deleteUserAuthentication` mutation. */
export interface DeleteUserAuthenticationInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `UserAuthentication` mutation. */
export interface DeleteUserAuthenticationPayload {
  __typename?: 'DeleteUserAuthenticationPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserAuthenticationNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `UserAuthentication` that was deleted by this mutation. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** An edge for our `UserAuthentication`. May be used by Relay 1. */
  userAuthenticationEdge?: Maybe<UserAuthenticationsEdge>;
}


/** The output of our delete `UserAuthentication` mutation. */
export interface DeleteUserAuthenticationPayloadUserAuthenticationEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationsOrderBy>>;
}

/** All input for the `deleteUserAuthenticationSecretByNodeId` mutation. */
export interface DeleteUserAuthenticationSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserAuthenticationSecret` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserAuthenticationSecret` mutation. */
export interface DeleteUserAuthenticationSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  userAuthenticationId: Scalars['Int']['input'];
}

/** The output of our delete `UserAuthenticationSecret` mutation. */
export interface DeleteUserAuthenticationSecretPayload {
  __typename?: 'DeleteUserAuthenticationSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserAuthenticationSecretNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserAuthentication` that is related to this `UserAuthenticationSecret`. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** The `UserAuthenticationSecret` that was deleted by this mutation. */
  userAuthenticationSecret?: Maybe<UserAuthenticationSecret>;
  /** An edge for our `UserAuthenticationSecret`. May be used by Relay 1. */
  userAuthenticationSecretEdge?: Maybe<UserAuthenticationSecretsEdge>;
}


/** The output of our delete `UserAuthenticationSecret` mutation. */
export interface DeleteUserAuthenticationSecretPayloadUserAuthenticationSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationSecretsOrderBy>>;
}

/** All input for the `deleteUserByNodeId` mutation. */
export interface DeleteUserByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `User` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserByUsername` mutation. */
export interface DeleteUserByUsernameInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Public-facing username (or 'handle') of the user. */
  username: Scalars['String']['input'];
}

/** All input for the `deleteUserEmailByNodeId` mutation. */
export interface DeleteUserEmailByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserEmail` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserEmailByUserIdAndEmail` mutation. */
export interface DeleteUserEmailByUserIdAndEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The users email address, in `a@b.c` format. */
  email: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
}

/** All input for the `deleteUserEmail` mutation. */
export interface DeleteUserEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
}

/** The output of our delete `UserEmail` mutation. */
export interface DeleteUserEmailPayload {
  __typename?: 'DeleteUserEmailPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserEmailNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserEmail`. */
  user?: Maybe<User>;
  /** The `UserEmail` that was deleted by this mutation. */
  userEmail?: Maybe<UserEmail>;
  /** An edge for our `UserEmail`. May be used by Relay 1. */
  userEmailEdge?: Maybe<UserEmailsEdge>;
}


/** The output of our delete `UserEmail` mutation. */
export interface DeleteUserEmailPayloadUserEmailEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailsOrderBy>>;
}

/** All input for the `deleteUserEmailSecretByNodeId` mutation. */
export interface DeleteUserEmailSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserEmailSecret` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserEmailSecret` mutation. */
export interface DeleteUserEmailSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  userEmailId: Scalars['Int']['input'];
}

/** The output of our delete `UserEmailSecret` mutation. */
export interface DeleteUserEmailSecretPayload {
  __typename?: 'DeleteUserEmailSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserEmailSecretNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserEmail` that is related to this `UserEmailSecret`. */
  userEmail?: Maybe<UserEmail>;
  /** The `UserEmailSecret` that was deleted by this mutation. */
  userEmailSecret?: Maybe<UserEmailSecret>;
  /** An edge for our `UserEmailSecret`. May be used by Relay 1. */
  userEmailSecretEdge?: Maybe<UserEmailSecretsEdge>;
}


/** The output of our delete `UserEmailSecret` mutation. */
export interface DeleteUserEmailSecretPayloadUserEmailSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailSecretsOrderBy>>;
}

/** All input for the `deleteUser` mutation. */
export interface DeleteUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for the user. */
  id: Scalars['Int']['input'];
}

/** The output of our delete `User` mutation. */
export interface DeleteUserPayload {
  __typename?: 'DeleteUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was deleted by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our delete `User` mutation. */
export interface DeleteUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `deleteUserSecretByNodeId` mutation. */
export interface DeleteUserSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserSecret` to be deleted. */
  nodeId: Scalars['ID']['input'];
}

/** All input for the `deleteUserSecret` mutation. */
export interface DeleteUserSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['Int']['input'];
}

/** The output of our delete `UserSecret` mutation. */
export interface DeleteUserSecretPayload {
  __typename?: 'DeleteUserSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserSecretNodeId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserSecret`. */
  user?: Maybe<User>;
  /** The `UserSecret` that was deleted by this mutation. */
  userSecret?: Maybe<UserSecret>;
  /** An edge for our `UserSecret`. May be used by Relay 1. */
  userSecretEdge?: Maybe<UserSecretsEdge>;
}


/** The output of our delete `UserSecret` mutation. */
export interface DeleteUserSecretPayloadUserSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserSecretsOrderBy>>;
}

/** All input for the `failJob` mutation. */
export interface FailJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  jobId?: InputMaybe<Scalars['Int']['input']>;
  workerId?: InputMaybe<Scalars['String']['input']>;
}

/** The output of our `failJob` mutation. */
export interface FailJobPayload {
  __typename?: 'FailJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our `failJob` mutation. */
export interface FailJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** All input for the `forgotPassword` mutation. */
export interface ForgotPasswordInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
}

/** The output of our `forgotPassword` mutation. */
export interface ForgotPasswordPayload {
  __typename?: 'ForgotPasswordPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

/** A subject-based grouping of topics and posts. */
export interface Forum extends Node {
  __typename?: 'Forum';
  createdAt: Scalars['Datetime']['output'];
  /** A brief description of the `Forum` including it's purpose. */
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  /** The name of the `Forum` (indicates its subject matter). */
  name: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** An URL-safe alias for the `Forum`. */
  slug: Scalars['String']['output'];
  /** Reads and enables pagination through a set of `Topic`. */
  topics: TopicsConnection;
  updatedAt: Scalars['Datetime']['output'];
}


/** A subject-based grouping of topics and posts. */
export interface ForumTopicsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<TopicCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
}

/** A condition to be used against `Forum` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface ForumCondition {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `slug` field. */
  slug?: InputMaybe<Scalars['String']['input']>;
}

/** An input for mutations affecting `Forum` */
export interface ForumInput {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** A brief description of the `Forum` including it's purpose. */
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the `Forum` (indicates its subject matter). */
  name: Scalars['String']['input'];
  /** An URL-safe alias for the `Forum`. */
  slug: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** Represents an update to a `Forum`. Fields that are set will be updated. */
export interface ForumPatch {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** A brief description of the `Forum` including it's purpose. */
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the `Forum` (indicates its subject matter). */
  name?: InputMaybe<Scalars['String']['input']>;
  /** An URL-safe alias for the `Forum`. */
  slug?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** A connection to a list of `Forum` values. */
export interface ForumsConnection {
  __typename?: 'ForumsConnection';
  /** A list of edges which contains the `Forum` and cursor to aid in pagination. */
  edges: Array<ForumsEdge>;
  /** A list of `Forum` objects. */
  nodes: Array<Forum>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Forum` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `Forum` edge in the connection. */
export interface ForumsEdge {
  __typename?: 'ForumsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Forum` at the end of the edge. */
  node: Forum;
}

/** Methods to use when ordering `Forum`. */
export type ForumsOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'SLUG_ASC'
  | 'SLUG_DESC';

/** All input for the `getJob` mutation. */
export interface GetJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  identifiers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  workerId?: InputMaybe<Scalars['String']['input']>;
}

/** The output of our `getJob` mutation. */
export interface GetJobPayload {
  __typename?: 'GetJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our `getJob` mutation. */
export interface GetJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

export interface Job extends Node {
  __typename?: 'Job';
  attempts: Scalars['Int']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['Int']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  payload: Scalars['JSON']['output'];
  priority: Scalars['Int']['output'];
  queueName: Scalars['String']['output'];
  runAt: Scalars['Datetime']['output'];
  taskIdentifier: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
}

/** A condition to be used against `Job` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface JobCondition {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `Job` */
export interface JobInput {
  attempts?: InputMaybe<Scalars['Int']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lastError?: InputMaybe<Scalars['String']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  queueName?: InputMaybe<Scalars['String']['input']>;
  runAt?: InputMaybe<Scalars['Datetime']['input']>;
  taskIdentifier: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** Represents an update to a `Job`. Fields that are set will be updated. */
export interface JobPatch {
  attempts?: InputMaybe<Scalars['Int']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lastError?: InputMaybe<Scalars['String']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  queueName?: InputMaybe<Scalars['String']['input']>;
  runAt?: InputMaybe<Scalars['Datetime']['input']>;
  taskIdentifier?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

export interface JobQueue extends Node {
  __typename?: 'JobQueue';
  jobCount: Scalars['Int']['output'];
  lockedAt?: Maybe<Scalars['Datetime']['output']>;
  lockedBy?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  queueName: Scalars['String']['output'];
}

/**
 * A condition to be used against `JobQueue` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export interface JobQueueCondition {
  /** Checks for equality with the object’s `queueName` field. */
  queueName?: InputMaybe<Scalars['String']['input']>;
}

/** An input for mutations affecting `JobQueue` */
export interface JobQueueInput {
  jobCount?: InputMaybe<Scalars['Int']['input']>;
  lockedAt?: InputMaybe<Scalars['Datetime']['input']>;
  lockedBy?: InputMaybe<Scalars['String']['input']>;
  queueName: Scalars['String']['input'];
}

/** Represents an update to a `JobQueue`. Fields that are set will be updated. */
export interface JobQueuePatch {
  jobCount?: InputMaybe<Scalars['Int']['input']>;
  lockedAt?: InputMaybe<Scalars['Datetime']['input']>;
  lockedBy?: InputMaybe<Scalars['String']['input']>;
  queueName?: InputMaybe<Scalars['String']['input']>;
}

/** A connection to a list of `JobQueue` values. */
export interface JobQueuesConnection {
  __typename?: 'JobQueuesConnection';
  /** A list of edges which contains the `JobQueue` and cursor to aid in pagination. */
  edges: Array<JobQueuesEdge>;
  /** A list of `JobQueue` objects. */
  nodes: Array<JobQueue>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `JobQueue` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `JobQueue` edge in the connection. */
export interface JobQueuesEdge {
  __typename?: 'JobQueuesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `JobQueue` at the end of the edge. */
  node: JobQueue;
}

/** Methods to use when ordering `JobQueue`. */
export type JobQueuesOrderBy =
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'QUEUE_NAME_ASC'
  | 'QUEUE_NAME_DESC';

/** A connection to a list of `Job` values. */
export interface JobsConnection {
  __typename?: 'JobsConnection';
  /** A list of edges which contains the `Job` and cursor to aid in pagination. */
  edges: Array<JobsEdge>;
  /** A list of `Job` objects. */
  nodes: Array<Job>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Job` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `Job` edge in the connection. */
export interface JobsEdge {
  __typename?: 'JobsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Job` at the end of the edge. */
  node: Job;
}

/** Methods to use when ordering `Job`. */
export type JobsOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

/** All input for the `linkOrRegisterUser` mutation. */
export interface LinkOrRegisterUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  fAuthDetails?: InputMaybe<Scalars['JSON']['input']>;
  fIdentifier?: InputMaybe<Scalars['String']['input']>;
  fProfile?: InputMaybe<Scalars['JSON']['input']>;
  fService?: InputMaybe<Scalars['String']['input']>;
  fUserId?: InputMaybe<Scalars['Int']['input']>;
}

/** The output of our `linkOrRegisterUser` mutation. */
export interface LinkOrRegisterUserPayload {
  __typename?: 'LinkOrRegisterUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our `linkOrRegisterUser` mutation. */
export interface LinkOrRegisterUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `login` mutation. */
export interface LoginInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
}

/** The output of our `login` mutation. */
export interface LoginPayload {
  __typename?: 'LoginPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our `login` mutation. */
export interface LoginPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** The root mutation type which contains root level fields which mutate data. */
export interface Mutation {
  __typename?: 'Mutation';
  completeJob?: Maybe<CompleteJobPayload>;
  /** Creates a single `Forum`. */
  createForum?: Maybe<CreateForumPayload>;
  /** Creates a single `Job`. */
  createJob?: Maybe<CreateJobPayload>;
  /** Creates a single `JobQueue`. */
  createJobQueue?: Maybe<CreateJobQueuePayload>;
  /** Creates a single `Post`. */
  createPost?: Maybe<CreatePostPayload>;
  /** Creates a single `Topic`. */
  createTopic?: Maybe<CreateTopicPayload>;
  /** Creates a single `User`. */
  createUser?: Maybe<CreateUserPayload>;
  /** Creates a single `UserAuthentication`. */
  createUserAuthentication?: Maybe<CreateUserAuthenticationPayload>;
  /** Creates a single `UserAuthenticationSecret`. */
  createUserAuthenticationSecret?: Maybe<CreateUserAuthenticationSecretPayload>;
  /** Creates a single `UserEmail`. */
  createUserEmail?: Maybe<CreateUserEmailPayload>;
  /** Creates a single `UserEmailSecret`. */
  createUserEmailSecret?: Maybe<CreateUserEmailSecretPayload>;
  /** Creates a single `UserSecret`. */
  createUserSecret?: Maybe<CreateUserSecretPayload>;
  /** Deletes a single `Forum` using a unique key. */
  deleteForum?: Maybe<DeleteForumPayload>;
  /** Deletes a single `Forum` using its globally unique id. */
  deleteForumByNodeId?: Maybe<DeleteForumPayload>;
  /** Deletes a single `Forum` using a unique key. */
  deleteForumBySlug?: Maybe<DeleteForumPayload>;
  /** Deletes a single `Job` using a unique key. */
  deleteJob?: Maybe<DeleteJobPayload>;
  /** Deletes a single `Job` using its globally unique id. */
  deleteJobByNodeId?: Maybe<DeleteJobPayload>;
  /** Deletes a single `JobQueue` using a unique key. */
  deleteJobQueue?: Maybe<DeleteJobQueuePayload>;
  /** Deletes a single `JobQueue` using its globally unique id. */
  deleteJobQueueByNodeId?: Maybe<DeleteJobQueuePayload>;
  /** Deletes a single `Post` using a unique key. */
  deletePost?: Maybe<DeletePostPayload>;
  /** Deletes a single `Post` using its globally unique id. */
  deletePostByNodeId?: Maybe<DeletePostPayload>;
  /** Deletes a single `Topic` using a unique key. */
  deleteTopic?: Maybe<DeleteTopicPayload>;
  /** Deletes a single `Topic` using its globally unique id. */
  deleteTopicByNodeId?: Maybe<DeleteTopicPayload>;
  /** Deletes a single `User` using a unique key. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Deletes a single `UserAuthentication` using a unique key. */
  deleteUserAuthentication?: Maybe<DeleteUserAuthenticationPayload>;
  /** Deletes a single `UserAuthentication` using its globally unique id. */
  deleteUserAuthenticationByNodeId?: Maybe<DeleteUserAuthenticationPayload>;
  /** Deletes a single `UserAuthentication` using a unique key. */
  deleteUserAuthenticationByServiceAndIdentifier?: Maybe<DeleteUserAuthenticationPayload>;
  /** Deletes a single `UserAuthenticationSecret` using a unique key. */
  deleteUserAuthenticationSecret?: Maybe<DeleteUserAuthenticationSecretPayload>;
  /** Deletes a single `UserAuthenticationSecret` using its globally unique id. */
  deleteUserAuthenticationSecretByNodeId?: Maybe<DeleteUserAuthenticationSecretPayload>;
  /** Deletes a single `User` using its globally unique id. */
  deleteUserByNodeId?: Maybe<DeleteUserPayload>;
  /** Deletes a single `User` using a unique key. */
  deleteUserByUsername?: Maybe<DeleteUserPayload>;
  /** Deletes a single `UserEmail` using a unique key. */
  deleteUserEmail?: Maybe<DeleteUserEmailPayload>;
  /** Deletes a single `UserEmail` using its globally unique id. */
  deleteUserEmailByNodeId?: Maybe<DeleteUserEmailPayload>;
  /** Deletes a single `UserEmail` using a unique key. */
  deleteUserEmailByUserIdAndEmail?: Maybe<DeleteUserEmailPayload>;
  /** Deletes a single `UserEmailSecret` using a unique key. */
  deleteUserEmailSecret?: Maybe<DeleteUserEmailSecretPayload>;
  /** Deletes a single `UserEmailSecret` using its globally unique id. */
  deleteUserEmailSecretByNodeId?: Maybe<DeleteUserEmailSecretPayload>;
  /** Deletes a single `UserSecret` using a unique key. */
  deleteUserSecret?: Maybe<DeleteUserSecretPayload>;
  /** Deletes a single `UserSecret` using its globally unique id. */
  deleteUserSecretByNodeId?: Maybe<DeleteUserSecretPayload>;
  failJob?: Maybe<FailJobPayload>;
  /** If you've forgotten your password, give us one of your email addresses and we' send you a reset token. Note this only works if you have added an email address! */
  forgotPassword?: Maybe<ForgotPasswordPayload>;
  getJob?: Maybe<GetJobPayload>;
  /** If you're logged in, this will link an additional OAuth login to your account if necessary. If you're logged out it may find if an account already exists (based on OAuth details or email address) and return that, or create a new user account if necessary. */
  linkOrRegisterUser?: Maybe<LinkOrRegisterUserPayload>;
  /** Returns a user that matches the username/password combo, or null on failure. */
  login?: Maybe<LoginPayload>;
  /** Creates a user account. All arguments are optional, it trusts the calling method to perform sanitisation. */
  reallyCreateUser?: Maybe<ReallyCreateUserPayload>;
  /** Used to register a user from information gleaned from OAuth. Primarily used by link_or_register_user */
  registerUser?: Maybe<RegisterUserPayload>;
  /** After triggering forgotPassword, you'll be sent a reset token. Combine this with your user ID and a new password to reset your password. */
  resetPassword?: Maybe<ResetPasswordPayload>;
  scheduleJob?: Maybe<ScheduleJobPayload>;
  /** Updates a single `Forum` using a unique key and a patch. */
  updateForum?: Maybe<UpdateForumPayload>;
  /** Updates a single `Forum` using its globally unique id and a patch. */
  updateForumByNodeId?: Maybe<UpdateForumPayload>;
  /** Updates a single `Forum` using a unique key and a patch. */
  updateForumBySlug?: Maybe<UpdateForumPayload>;
  /** Updates a single `Job` using a unique key and a patch. */
  updateJob?: Maybe<UpdateJobPayload>;
  /** Updates a single `Job` using its globally unique id and a patch. */
  updateJobByNodeId?: Maybe<UpdateJobPayload>;
  /** Updates a single `JobQueue` using a unique key and a patch. */
  updateJobQueue?: Maybe<UpdateJobQueuePayload>;
  /** Updates a single `JobQueue` using its globally unique id and a patch. */
  updateJobQueueByNodeId?: Maybe<UpdateJobQueuePayload>;
  /** Updates a single `Post` using a unique key and a patch. */
  updatePost?: Maybe<UpdatePostPayload>;
  /** Updates a single `Post` using its globally unique id and a patch. */
  updatePostByNodeId?: Maybe<UpdatePostPayload>;
  /** Updates a single `Topic` using a unique key and a patch. */
  updateTopic?: Maybe<UpdateTopicPayload>;
  /** Updates a single `Topic` using its globally unique id and a patch. */
  updateTopicByNodeId?: Maybe<UpdateTopicPayload>;
  /** Updates a single `User` using a unique key and a patch. */
  updateUser?: Maybe<UpdateUserPayload>;
  /** Updates a single `UserAuthentication` using a unique key and a patch. */
  updateUserAuthentication?: Maybe<UpdateUserAuthenticationPayload>;
  /** Updates a single `UserAuthentication` using its globally unique id and a patch. */
  updateUserAuthenticationByNodeId?: Maybe<UpdateUserAuthenticationPayload>;
  /** Updates a single `UserAuthentication` using a unique key and a patch. */
  updateUserAuthenticationByServiceAndIdentifier?: Maybe<UpdateUserAuthenticationPayload>;
  /** Updates a single `UserAuthenticationSecret` using a unique key and a patch. */
  updateUserAuthenticationSecret?: Maybe<UpdateUserAuthenticationSecretPayload>;
  /** Updates a single `UserAuthenticationSecret` using its globally unique id and a patch. */
  updateUserAuthenticationSecretByNodeId?: Maybe<UpdateUserAuthenticationSecretPayload>;
  /** Updates a single `User` using its globally unique id and a patch. */
  updateUserByNodeId?: Maybe<UpdateUserPayload>;
  /** Updates a single `User` using a unique key and a patch. */
  updateUserByUsername?: Maybe<UpdateUserPayload>;
  /** Updates a single `UserEmail` using a unique key and a patch. */
  updateUserEmail?: Maybe<UpdateUserEmailPayload>;
  /** Updates a single `UserEmail` using its globally unique id and a patch. */
  updateUserEmailByNodeId?: Maybe<UpdateUserEmailPayload>;
  /** Updates a single `UserEmail` using a unique key and a patch. */
  updateUserEmailByUserIdAndEmail?: Maybe<UpdateUserEmailPayload>;
  /** Updates a single `UserEmailSecret` using a unique key and a patch. */
  updateUserEmailSecret?: Maybe<UpdateUserEmailSecretPayload>;
  /** Updates a single `UserEmailSecret` using its globally unique id and a patch. */
  updateUserEmailSecretByNodeId?: Maybe<UpdateUserEmailSecretPayload>;
  /** Updates a single `UserSecret` using a unique key and a patch. */
  updateUserSecret?: Maybe<UpdateUserSecretPayload>;
  /** Updates a single `UserSecret` using its globally unique id and a patch. */
  updateUserSecretByNodeId?: Maybe<UpdateUserSecretPayload>;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCompleteJobArgs {
  input: CompleteJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateForumArgs {
  input: CreateForumInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateJobArgs {
  input: CreateJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateJobQueueArgs {
  input: CreateJobQueueInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreatePostArgs {
  input: CreatePostInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateTopicArgs {
  input: CreateTopicInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserArgs {
  input: CreateUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserAuthenticationArgs {
  input: CreateUserAuthenticationInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserAuthenticationSecretArgs {
  input: CreateUserAuthenticationSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserEmailArgs {
  input: CreateUserEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserEmailSecretArgs {
  input: CreateUserEmailSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserSecretArgs {
  input: CreateUserSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteForumArgs {
  input: DeleteForumInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteForumByNodeIdArgs {
  input: DeleteForumByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteForumBySlugArgs {
  input: DeleteForumBySlugInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteJobArgs {
  input: DeleteJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteJobByNodeIdArgs {
  input: DeleteJobByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteJobQueueArgs {
  input: DeleteJobQueueInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteJobQueueByNodeIdArgs {
  input: DeleteJobQueueByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeletePostArgs {
  input: DeletePostInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeletePostByNodeIdArgs {
  input: DeletePostByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteTopicArgs {
  input: DeleteTopicInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteTopicByNodeIdArgs {
  input: DeleteTopicByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserArgs {
  input: DeleteUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserAuthenticationArgs {
  input: DeleteUserAuthenticationInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserAuthenticationByNodeIdArgs {
  input: DeleteUserAuthenticationByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserAuthenticationByServiceAndIdentifierArgs {
  input: DeleteUserAuthenticationByServiceAndIdentifierInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserAuthenticationSecretArgs {
  input: DeleteUserAuthenticationSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserAuthenticationSecretByNodeIdArgs {
  input: DeleteUserAuthenticationSecretByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserByNodeIdArgs {
  input: DeleteUserByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserByUsernameArgs {
  input: DeleteUserByUsernameInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserEmailArgs {
  input: DeleteUserEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserEmailByNodeIdArgs {
  input: DeleteUserEmailByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserEmailByUserIdAndEmailArgs {
  input: DeleteUserEmailByUserIdAndEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserEmailSecretArgs {
  input: DeleteUserEmailSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserEmailSecretByNodeIdArgs {
  input: DeleteUserEmailSecretByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserSecretArgs {
  input: DeleteUserSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserSecretByNodeIdArgs {
  input: DeleteUserSecretByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationFailJobArgs {
  input: FailJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationForgotPasswordArgs {
  input: ForgotPasswordInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationGetJobArgs {
  input: GetJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationLinkOrRegisterUserArgs {
  input: LinkOrRegisterUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationLoginArgs {
  input: LoginInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationReallyCreateUserArgs {
  input: ReallyCreateUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationRegisterUserArgs {
  input: RegisterUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationResetPasswordArgs {
  input: ResetPasswordInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationScheduleJobArgs {
  input: ScheduleJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateForumArgs {
  input: UpdateForumInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateForumByNodeIdArgs {
  input: UpdateForumByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateForumBySlugArgs {
  input: UpdateForumBySlugInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateJobArgs {
  input: UpdateJobInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateJobByNodeIdArgs {
  input: UpdateJobByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateJobQueueArgs {
  input: UpdateJobQueueInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateJobQueueByNodeIdArgs {
  input: UpdateJobQueueByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdatePostArgs {
  input: UpdatePostInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdatePostByNodeIdArgs {
  input: UpdatePostByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateTopicArgs {
  input: UpdateTopicInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateTopicByNodeIdArgs {
  input: UpdateTopicByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserArgs {
  input: UpdateUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserAuthenticationArgs {
  input: UpdateUserAuthenticationInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserAuthenticationByNodeIdArgs {
  input: UpdateUserAuthenticationByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserAuthenticationByServiceAndIdentifierArgs {
  input: UpdateUserAuthenticationByServiceAndIdentifierInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserAuthenticationSecretArgs {
  input: UpdateUserAuthenticationSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserAuthenticationSecretByNodeIdArgs {
  input: UpdateUserAuthenticationSecretByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserByNodeIdArgs {
  input: UpdateUserByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserByUsernameArgs {
  input: UpdateUserByUsernameInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserEmailArgs {
  input: UpdateUserEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserEmailByNodeIdArgs {
  input: UpdateUserEmailByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserEmailByUserIdAndEmailArgs {
  input: UpdateUserEmailByUserIdAndEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserEmailSecretArgs {
  input: UpdateUserEmailSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserEmailSecretByNodeIdArgs {
  input: UpdateUserEmailSecretByNodeIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserSecretArgs {
  input: UpdateUserSecretInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserSecretByNodeIdArgs {
  input: UpdateUserSecretByNodeIdInput;
}

/** An object with a globally unique `ID`. */
export interface Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
}

/** Information about pagination in a connection. */
export interface PageInfo {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']['output']>;
}

/** An individual message thread within a Forum. */
export interface Post extends Node {
  __typename?: 'Post';
  /** Reads a single `User` that is related to this `Post`. */
  author?: Maybe<User>;
  authorId: Scalars['Int']['output'];
  /** The body of the `Topic`, which Posts reply to. */
  body: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['Int']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `Topic` that is related to this `Post`. */
  topic?: Maybe<Topic>;
  topicId: Scalars['Int']['output'];
  updatedAt: Scalars['Datetime']['output'];
}

/** A condition to be used against `Post` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface PostCondition {
  /** Checks for equality with the object’s `authorId` field. */
  authorId?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `topicId` field. */
  topicId?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `Post` */
export interface PostInput {
  /** The body of the `Topic`, which Posts reply to. */
  body?: InputMaybe<Scalars['String']['input']>;
  topicId: Scalars['Int']['input'];
}

/** Represents an update to a `Post`. Fields that are set will be updated. */
export interface PostPatch {
  /** The body of the `Topic`, which Posts reply to. */
  body?: InputMaybe<Scalars['String']['input']>;
}

/** A connection to a list of `Post` values. */
export interface PostsConnection {
  __typename?: 'PostsConnection';
  /** A list of edges which contains the `Post` and cursor to aid in pagination. */
  edges: Array<PostsEdge>;
  /** A list of `Post` objects. */
  nodes: Array<Post>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Post` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `Post` edge in the connection. */
export interface PostsEdge {
  __typename?: 'PostsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Post` at the end of the edge. */
  node: Post;
}

/** Methods to use when ordering `Post`. */
export type PostsOrderBy =
  | 'AUTHOR_ID_ASC'
  | 'AUTHOR_ID_DESC'
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'TOPIC_ID_ASC'
  | 'TOPIC_ID_DESC';

/** The root query type which gives access points into the data universe. */
export interface Query extends Node {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  forum?: Maybe<Forum>;
  /** Reads a single `Forum` using its globally unique `ID`. */
  forumByNodeId?: Maybe<Forum>;
  forumBySlug?: Maybe<Forum>;
  /** Reads and enables pagination through a set of `Forum`. */
  forums?: Maybe<ForumsConnection>;
  /** Reads and enables pagination through a set of `Forum`. */
  forumsAboutCats?: Maybe<ForumsConnection>;
  job?: Maybe<Job>;
  /** Reads a single `Job` using its globally unique `ID`. */
  jobByNodeId?: Maybe<Job>;
  jobQueue?: Maybe<JobQueue>;
  /** Reads a single `JobQueue` using its globally unique `ID`. */
  jobQueueByNodeId?: Maybe<JobQueue>;
  /** Reads and enables pagination through a set of `JobQueue`. */
  jobQueues?: Maybe<JobQueuesConnection>;
  /** Reads and enables pagination through a set of `Job`. */
  jobs?: Maybe<JobsConnection>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID']['output'];
  post?: Maybe<Post>;
  /** Reads a single `Post` using its globally unique `ID`. */
  postByNodeId?: Maybe<Post>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** Chosen by fair dice roll. Guaranteed to be random. XKCD#221 */
  randomNumber?: Maybe<Scalars['Int']['output']>;
  topic?: Maybe<Topic>;
  /** Reads a single `Topic` using its globally unique `ID`. */
  topicByNodeId?: Maybe<Topic>;
  user?: Maybe<User>;
  userAuthentication?: Maybe<UserAuthentication>;
  /** Reads a single `UserAuthentication` using its globally unique `ID`. */
  userAuthenticationByNodeId?: Maybe<UserAuthentication>;
  userAuthenticationByServiceAndIdentifier?: Maybe<UserAuthentication>;
  userAuthenticationSecret?: Maybe<UserAuthenticationSecret>;
  /** Reads a single `UserAuthenticationSecret` using its globally unique `ID`. */
  userAuthenticationSecretByNodeId?: Maybe<UserAuthenticationSecret>;
  /** Reads and enables pagination through a set of `UserAuthenticationSecret`. */
  userAuthenticationSecrets?: Maybe<UserAuthenticationSecretsConnection>;
  /** Reads a single `User` using its globally unique `ID`. */
  userByNodeId?: Maybe<User>;
  userByUsername?: Maybe<User>;
  userEmail?: Maybe<UserEmail>;
  /** Reads a single `UserEmail` using its globally unique `ID`. */
  userEmailByNodeId?: Maybe<UserEmail>;
  userEmailByUserIdAndEmail?: Maybe<UserEmail>;
  userEmailSecret?: Maybe<UserEmailSecret>;
  /** Reads a single `UserEmailSecret` using its globally unique `ID`. */
  userEmailSecretByNodeId?: Maybe<UserEmailSecret>;
  /** Reads and enables pagination through a set of `UserEmailSecret`. */
  userEmailSecrets?: Maybe<UserEmailSecretsConnection>;
  userSecret?: Maybe<UserSecret>;
  /** Reads a single `UserSecret` using its globally unique `ID`. */
  userSecretByNodeId?: Maybe<UserSecret>;
  /** Reads and enables pagination through a set of `UserSecret`. */
  userSecrets?: Maybe<UserSecretsConnection>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryForumArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryForumByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryForumBySlugArgs {
  slug: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryForumsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<ForumCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ForumsOrderBy>>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryForumsAboutCatsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobQueueArgs {
  queueName: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobQueueByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobQueuesArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<JobQueueCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<JobQueuesOrderBy>>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryJobsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<JobCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryNodeArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryPostArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryPostByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryTopicArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryTopicByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationByServiceAndIdentifierArgs {
  identifier: Scalars['String']['input'];
  service: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationSecretArgs {
  userAuthenticationId: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationSecretByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserAuthenticationSecretsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<UserAuthenticationSecretCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserAuthenticationSecretsOrderBy>>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserByUsernameArgs {
  username: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailArgs {
  id: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailByUserIdAndEmailArgs {
  email: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailSecretArgs {
  userEmailId: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailSecretByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserEmailSecretsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<UserEmailSecretCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserEmailSecretsOrderBy>>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserSecretArgs {
  userId: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserSecretByNodeIdArgs {
  nodeId: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserSecretsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<UserSecretCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSecretsOrderBy>>;
}

/** All input for the `reallyCreateUser` mutation. */
export interface ReallyCreateUserInput {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailIsVerified?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
}

/** The output of our `reallyCreateUser` mutation. */
export interface ReallyCreateUserPayload {
  __typename?: 'ReallyCreateUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our `reallyCreateUser` mutation. */
export interface ReallyCreateUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `registerUser` mutation. */
export interface RegisterUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  fAuthDetails?: InputMaybe<Scalars['JSON']['input']>;
  fEmailIsVerified?: InputMaybe<Scalars['Boolean']['input']>;
  fIdentifier?: InputMaybe<Scalars['String']['input']>;
  fProfile?: InputMaybe<Scalars['JSON']['input']>;
  fService?: InputMaybe<Scalars['String']['input']>;
}

/** The output of our `registerUser` mutation. */
export interface RegisterUserPayload {
  __typename?: 'RegisterUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our `registerUser` mutation. */
export interface RegisterUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `resetPassword` mutation. */
export interface ResetPasswordInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  newPassword: Scalars['String']['input'];
  resetToken: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
}

/** The output of our `resetPassword` mutation. */
export interface ResetPasswordPayload {
  __typename?: 'ResetPasswordPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our `resetPassword` mutation. */
export interface ResetPasswordPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `scheduleJob` mutation. */
export interface ScheduleJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  queueName?: InputMaybe<Scalars['String']['input']>;
  runAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** The output of our `scheduleJob` mutation. */
export interface ScheduleJobPayload {
  __typename?: 'ScheduleJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our `scheduleJob` mutation. */
export interface ScheduleJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** An individual message thread within a Forum. */
export interface Topic extends Node {
  __typename?: 'Topic';
  /** Reads a single `User` that is related to this `Topic`. */
  author?: Maybe<User>;
  authorId: Scalars['Int']['output'];
  /** The body of the `Topic`, which Posts reply to. */
  body: Scalars['String']['output'];
  bodySummary?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  /** Reads a single `Forum` that is related to this `Topic`. */
  forum?: Maybe<Forum>;
  forumId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads and enables pagination through a set of `Post`. */
  posts: PostsConnection;
  /** The title of the `Topic`. */
  title: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
}


/** An individual message thread within a Forum. */
export interface TopicBodySummaryArgs {
  maxLength?: InputMaybe<Scalars['Int']['input']>;
}


/** An individual message thread within a Forum. */
export interface TopicPostsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<PostCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PostsOrderBy>>;
}

/** A condition to be used against `Topic` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface TopicCondition {
  /** Checks for equality with the object’s `authorId` field. */
  authorId?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `forumId` field. */
  forumId?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `Topic` */
export interface TopicInput {
  authorId?: InputMaybe<Scalars['Int']['input']>;
  /** The body of the `Topic`, which Posts reply to. */
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  forumId: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The title of the `Topic`. */
  title: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** Represents an update to a `Topic`. Fields that are set will be updated. */
export interface TopicPatch {
  authorId?: InputMaybe<Scalars['Int']['input']>;
  /** The body of the `Topic`, which Posts reply to. */
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  forumId?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The title of the `Topic`. */
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** A connection to a list of `Topic` values. */
export interface TopicsConnection {
  __typename?: 'TopicsConnection';
  /** A list of edges which contains the `Topic` and cursor to aid in pagination. */
  edges: Array<TopicsEdge>;
  /** A list of `Topic` objects. */
  nodes: Array<Topic>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Topic` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `Topic` edge in the connection. */
export interface TopicsEdge {
  __typename?: 'TopicsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `Topic` at the end of the edge. */
  node: Topic;
}

/** Methods to use when ordering `Topic`. */
export type TopicsOrderBy =
  | 'AUTHOR_ID_ASC'
  | 'AUTHOR_ID_DESC'
  | 'FORUM_ID_ASC'
  | 'FORUM_ID_DESC'
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC';

/** All input for the `updateForumByNodeId` mutation. */
export interface UpdateForumByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Forum` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `Forum` being updated. */
  patch: ForumPatch;
}

/** All input for the `updateForumBySlug` mutation. */
export interface UpdateForumBySlugInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `Forum` being updated. */
  patch: ForumPatch;
  /** An URL-safe alias for the `Forum`. */
  slug: Scalars['String']['input'];
}

/** All input for the `updateForum` mutation. */
export interface UpdateForumInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `Forum` being updated. */
  patch: ForumPatch;
}

/** The output of our update `Forum` mutation. */
export interface UpdateForumPayload {
  __typename?: 'UpdateForumPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Forum` that was updated by this mutation. */
  forum?: Maybe<Forum>;
  /** An edge for our `Forum`. May be used by Relay 1. */
  forumEdge?: Maybe<ForumsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our update `Forum` mutation. */
export interface UpdateForumPayloadForumEdgeArgs {
  orderBy?: InputMaybe<Array<ForumsOrderBy>>;
}

/** All input for the `updateJobByNodeId` mutation. */
export interface UpdateJobByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Job` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `Job` being updated. */
  patch: JobPatch;
}

/** All input for the `updateJob` mutation. */
export interface UpdateJobInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `Job` being updated. */
  patch: JobPatch;
}

/** The output of our update `Job` mutation. */
export interface UpdateJobPayload {
  __typename?: 'UpdateJobPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Job` that was updated by this mutation. */
  job?: Maybe<Job>;
  /** An edge for our `Job`. May be used by Relay 1. */
  jobEdge?: Maybe<JobsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our update `Job` mutation. */
export interface UpdateJobPayloadJobEdgeArgs {
  orderBy?: InputMaybe<Array<JobsOrderBy>>;
}

/** All input for the `updateJobQueueByNodeId` mutation. */
export interface UpdateJobQueueByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `JobQueue` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `JobQueue` being updated. */
  patch: JobQueuePatch;
}

/** All input for the `updateJobQueue` mutation. */
export interface UpdateJobQueueInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `JobQueue` being updated. */
  patch: JobQueuePatch;
  queueName: Scalars['String']['input'];
}

/** The output of our update `JobQueue` mutation. */
export interface UpdateJobQueuePayload {
  __typename?: 'UpdateJobQueuePayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `JobQueue` that was updated by this mutation. */
  jobQueue?: Maybe<JobQueue>;
  /** An edge for our `JobQueue`. May be used by Relay 1. */
  jobQueueEdge?: Maybe<JobQueuesEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
}


/** The output of our update `JobQueue` mutation. */
export interface UpdateJobQueuePayloadJobQueueEdgeArgs {
  orderBy?: InputMaybe<Array<JobQueuesOrderBy>>;
}

/** All input for the `updatePostByNodeId` mutation. */
export interface UpdatePostByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Post` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `Post` being updated. */
  patch: PostPatch;
}

/** All input for the `updatePost` mutation. */
export interface UpdatePostInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `Post` being updated. */
  patch: PostPatch;
}

/** The output of our update `Post` mutation. */
export interface UpdatePostPayload {
  __typename?: 'UpdatePostPayload';
  /** Reads a single `User` that is related to this `Post`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** The `Post` that was updated by this mutation. */
  post?: Maybe<Post>;
  /** An edge for our `Post`. May be used by Relay 1. */
  postEdge?: Maybe<PostsEdge>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `Topic` that is related to this `Post`. */
  topic?: Maybe<Topic>;
}


/** The output of our update `Post` mutation. */
export interface UpdatePostPayloadPostEdgeArgs {
  orderBy?: InputMaybe<Array<PostsOrderBy>>;
}

/** All input for the `updateTopicByNodeId` mutation. */
export interface UpdateTopicByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `Topic` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `Topic` being updated. */
  patch: TopicPatch;
}

/** All input for the `updateTopic` mutation. */
export interface UpdateTopicInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `Topic` being updated. */
  patch: TopicPatch;
}

/** The output of our update `Topic` mutation. */
export interface UpdateTopicPayload {
  __typename?: 'UpdateTopicPayload';
  /** Reads a single `User` that is related to this `Topic`. */
  author?: Maybe<User>;
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Reads a single `Forum` that is related to this `Topic`. */
  forum?: Maybe<Forum>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `Topic` that was updated by this mutation. */
  topic?: Maybe<Topic>;
  /** An edge for our `Topic`. May be used by Relay 1. */
  topicEdge?: Maybe<TopicsEdge>;
}


/** The output of our update `Topic` mutation. */
export interface UpdateTopicPayloadTopicEdgeArgs {
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
}

/** All input for the `updateUserAuthenticationByNodeId` mutation. */
export interface UpdateUserAuthenticationByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserAuthentication` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `UserAuthentication` being updated. */
  patch: UserAuthenticationPatch;
}

/** All input for the `updateUserAuthenticationByServiceAndIdentifier` mutation. */
export interface UpdateUserAuthenticationByServiceAndIdentifierInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** A unique identifier for the user within the login service. */
  identifier: Scalars['String']['input'];
  /** An object where the defined keys will be set on the `UserAuthentication` being updated. */
  patch: UserAuthenticationPatch;
  /** The login service used, e.g. `twitter` or `github`. */
  service: Scalars['String']['input'];
}

/** All input for the `updateUserAuthentication` mutation. */
export interface UpdateUserAuthenticationInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `UserAuthentication` being updated. */
  patch: UserAuthenticationPatch;
}

/** The output of our update `UserAuthentication` mutation. */
export interface UpdateUserAuthenticationPayload {
  __typename?: 'UpdateUserAuthenticationPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `UserAuthentication` that was updated by this mutation. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** An edge for our `UserAuthentication`. May be used by Relay 1. */
  userAuthenticationEdge?: Maybe<UserAuthenticationsEdge>;
}


/** The output of our update `UserAuthentication` mutation. */
export interface UpdateUserAuthenticationPayloadUserAuthenticationEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationsOrderBy>>;
}

/** All input for the `updateUserAuthenticationSecretByNodeId` mutation. */
export interface UpdateUserAuthenticationSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserAuthenticationSecret` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `UserAuthenticationSecret` being updated. */
  patch: UserAuthenticationSecretPatch;
}

/** All input for the `updateUserAuthenticationSecret` mutation. */
export interface UpdateUserAuthenticationSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `UserAuthenticationSecret` being updated. */
  patch: UserAuthenticationSecretPatch;
  userAuthenticationId: Scalars['Int']['input'];
}

/** The output of our update `UserAuthenticationSecret` mutation. */
export interface UpdateUserAuthenticationSecretPayload {
  __typename?: 'UpdateUserAuthenticationSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserAuthentication` that is related to this `UserAuthenticationSecret`. */
  userAuthentication?: Maybe<UserAuthentication>;
  /** The `UserAuthenticationSecret` that was updated by this mutation. */
  userAuthenticationSecret?: Maybe<UserAuthenticationSecret>;
  /** An edge for our `UserAuthenticationSecret`. May be used by Relay 1. */
  userAuthenticationSecretEdge?: Maybe<UserAuthenticationSecretsEdge>;
}


/** The output of our update `UserAuthenticationSecret` mutation. */
export interface UpdateUserAuthenticationSecretPayloadUserAuthenticationSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserAuthenticationSecretsOrderBy>>;
}

/** All input for the `updateUserByNodeId` mutation. */
export interface UpdateUserByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `User` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
}

/** All input for the `updateUserByUsername` mutation. */
export interface UpdateUserByUsernameInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
  /** Public-facing username (or 'handle') of the user. */
  username: Scalars['String']['input'];
}

/** All input for the `updateUserEmailByNodeId` mutation. */
export interface UpdateUserEmailByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserEmail` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `UserEmail` being updated. */
  patch: UserEmailPatch;
}

/** All input for the `updateUserEmailByUserIdAndEmail` mutation. */
export interface UpdateUserEmailByUserIdAndEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The users email address, in `a@b.c` format. */
  email: Scalars['String']['input'];
  /** An object where the defined keys will be set on the `UserEmail` being updated. */
  patch: UserEmailPatch;
  userId: Scalars['Int']['input'];
}

/** All input for the `updateUserEmail` mutation. */
export interface UpdateUserEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `UserEmail` being updated. */
  patch: UserEmailPatch;
}

/** The output of our update `UserEmail` mutation. */
export interface UpdateUserEmailPayload {
  __typename?: 'UpdateUserEmailPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserEmail`. */
  user?: Maybe<User>;
  /** The `UserEmail` that was updated by this mutation. */
  userEmail?: Maybe<UserEmail>;
  /** An edge for our `UserEmail`. May be used by Relay 1. */
  userEmailEdge?: Maybe<UserEmailsEdge>;
}


/** The output of our update `UserEmail` mutation. */
export interface UpdateUserEmailPayloadUserEmailEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailsOrderBy>>;
}

/** All input for the `updateUserEmailSecretByNodeId` mutation. */
export interface UpdateUserEmailSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserEmailSecret` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `UserEmailSecret` being updated. */
  patch: UserEmailSecretPatch;
}

/** All input for the `updateUserEmailSecret` mutation. */
export interface UpdateUserEmailSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `UserEmailSecret` being updated. */
  patch: UserEmailSecretPatch;
  userEmailId: Scalars['Int']['input'];
}

/** The output of our update `UserEmailSecret` mutation. */
export interface UpdateUserEmailSecretPayload {
  __typename?: 'UpdateUserEmailSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `UserEmail` that is related to this `UserEmailSecret`. */
  userEmail?: Maybe<UserEmail>;
  /** The `UserEmailSecret` that was updated by this mutation. */
  userEmailSecret?: Maybe<UserEmailSecret>;
  /** An edge for our `UserEmailSecret`. May be used by Relay 1. */
  userEmailSecretEdge?: Maybe<UserEmailSecretsEdge>;
}


/** The output of our update `UserEmailSecret` mutation. */
export interface UpdateUserEmailSecretPayloadUserEmailSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserEmailSecretsOrderBy>>;
}

/** All input for the `updateUser` mutation. */
export interface UpdateUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for the user. */
  id: Scalars['Int']['input'];
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
}

/** The output of our update `User` mutation. */
export interface UpdateUserPayload {
  __typename?: 'UpdateUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was updated by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UsersEdge>;
}


/** The output of our update `User` mutation. */
export interface UpdateUserPayloadUserEdgeArgs {
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
}

/** All input for the `updateUserSecretByNodeId` mutation. */
export interface UpdateUserSecretByNodeIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `UserSecret` to be updated. */
  nodeId: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `UserSecret` being updated. */
  patch: UserSecretPatch;
}

/** All input for the `updateUserSecret` mutation. */
export interface UpdateUserSecretInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `UserSecret` being updated. */
  patch: UserSecretPatch;
  userId: Scalars['Int']['input'];
}

/** The output of our update `UserSecret` mutation. */
export interface UpdateUserSecretPayload {
  __typename?: 'UpdateUserSecretPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** Reads a single `User` that is related to this `UserSecret`. */
  user?: Maybe<User>;
  /** The `UserSecret` that was updated by this mutation. */
  userSecret?: Maybe<UserSecret>;
  /** An edge for our `UserSecret`. May be used by Relay 1. */
  userSecretEdge?: Maybe<UserSecretsEdge>;
}


/** The output of our update `UserSecret` mutation. */
export interface UpdateUserSecretPayloadUserSecretEdgeArgs {
  orderBy?: InputMaybe<Array<UserSecretsOrderBy>>;
}

/** A user who can log in to the application. */
export interface User extends Node {
  __typename?: 'User';
  /** Reads and enables pagination through a set of `Post`. */
  authoredPosts: PostsConnection;
  /** Reads and enables pagination through a set of `Topic`. */
  authoredTopics: TopicsConnection;
  /** Optional avatar URL. */
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  /** Unique identifier for the user. */
  id: Scalars['Int']['output'];
  /** If true, the user has elevated privileges. */
  isAdmin: Scalars['Boolean']['output'];
  /** Public-facing name (or pseudonym) of the user. */
  name?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  updatedAt: Scalars['Datetime']['output'];
  /** Reads and enables pagination through a set of `UserEmail`. */
  userEmails: UserEmailsConnection;
  /** Reads a single `UserSecret` that is related to this `User`. */
  userSecret?: Maybe<UserSecret>;
  /** Public-facing username (or 'handle') of the user. */
  username: Scalars['String']['output'];
}


/** A user who can log in to the application. */
export interface UserAuthoredPostsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<PostCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PostsOrderBy>>;
}


/** A user who can log in to the application. */
export interface UserAuthoredTopicsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<TopicCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TopicsOrderBy>>;
}


/** A user who can log in to the application. */
export interface UserUserEmailsArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<UserEmailCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserEmailsOrderBy>>;
}

/** Contains information about the login providers this user has used, so that they may disconnect them should they wish. */
export interface UserAuthentication extends Node {
  __typename?: 'UserAuthentication';
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['Int']['output'];
  /** A unique identifier for the user within the login service. */
  identifier: Scalars['String']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** The login service used, e.g. `twitter` or `github`. */
  service: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  /** Reads a single `UserAuthenticationSecret` that is related to this `UserAuthentication`. */
  userAuthenticationSecret?: Maybe<UserAuthenticationSecret>;
}

/** An input for mutations affecting `UserAuthentication` */
export interface UserAuthenticationInput {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** A unique identifier for the user within the login service. */
  identifier: Scalars['String']['input'];
  /** The login service used, e.g. `twitter` or `github`. */
  service: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

/** Represents an update to a `UserAuthentication`. Fields that are set will be updated. */
export interface UserAuthenticationPatch {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** A unique identifier for the user within the login service. */
  identifier?: InputMaybe<Scalars['String']['input']>;
  /** The login service used, e.g. `twitter` or `github`. */
  service?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
}

export interface UserAuthenticationSecret extends Node {
  __typename?: 'UserAuthenticationSecret';
  details: Scalars['JSON']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** Reads a single `UserAuthentication` that is related to this `UserAuthenticationSecret`. */
  userAuthentication?: Maybe<UserAuthentication>;
  userAuthenticationId: Scalars['Int']['output'];
}

/**
 * A condition to be used against `UserAuthenticationSecret` object types. All
 * fields are tested for equality and combined with a logical ‘and.’
 */
export interface UserAuthenticationSecretCondition {
  /** Checks for equality with the object’s `userAuthenticationId` field. */
  userAuthenticationId?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `UserAuthenticationSecret` */
export interface UserAuthenticationSecretInput {
  details?: InputMaybe<Scalars['JSON']['input']>;
  userAuthenticationId: Scalars['Int']['input'];
}

/** Represents an update to a `UserAuthenticationSecret`. Fields that are set will be updated. */
export interface UserAuthenticationSecretPatch {
  details?: InputMaybe<Scalars['JSON']['input']>;
  userAuthenticationId?: InputMaybe<Scalars['Int']['input']>;
}

/** A connection to a list of `UserAuthenticationSecret` values. */
export interface UserAuthenticationSecretsConnection {
  __typename?: 'UserAuthenticationSecretsConnection';
  /** A list of edges which contains the `UserAuthenticationSecret` and cursor to aid in pagination. */
  edges: Array<UserAuthenticationSecretsEdge>;
  /** A list of `UserAuthenticationSecret` objects. */
  nodes: Array<UserAuthenticationSecret>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UserAuthenticationSecret` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `UserAuthenticationSecret` edge in the connection. */
export interface UserAuthenticationSecretsEdge {
  __typename?: 'UserAuthenticationSecretsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `UserAuthenticationSecret` at the end of the edge. */
  node: UserAuthenticationSecret;
}

/** Methods to use when ordering `UserAuthenticationSecret`. */
export type UserAuthenticationSecretsOrderBy =
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'USER_AUTHENTICATION_ID_ASC'
  | 'USER_AUTHENTICATION_ID_DESC';

/** A `UserAuthentication` edge in the connection. */
export interface UserAuthenticationsEdge {
  __typename?: 'UserAuthenticationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `UserAuthentication` at the end of the edge. */
  node: UserAuthentication;
}

/** Methods to use when ordering `UserAuthentication`. */
export type UserAuthenticationsOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'SERVICE_ASC'
  | 'SERVICE_DESC';

/** Information about a user's email address. */
export interface UserEmail extends Node {
  __typename?: 'UserEmail';
  createdAt: Scalars['Datetime']['output'];
  /** The users email address, in `a@b.c` format. */
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  /** True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise. */
  isVerified: Scalars['Boolean']['output'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  updatedAt: Scalars['Datetime']['output'];
  /** Reads a single `User` that is related to this `UserEmail`. */
  user?: Maybe<User>;
  /** Reads a single `UserEmailSecret` that is related to this `UserEmail`. */
  userEmailSecret?: Maybe<UserEmailSecret>;
  userId: Scalars['Int']['output'];
}

/**
 * A condition to be used against `UserEmail` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export interface UserEmailCondition {
  /** Checks for equality with the object’s `id` field. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `userId` field. */
  userId?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `UserEmail` */
export interface UserEmailInput {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** The users email address, in `a@b.c` format. */
  email: Scalars['String']['input'];
  id?: InputMaybe<Scalars['Int']['input']>;
  /** True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise. */
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents an update to a `UserEmail`. Fields that are set will be updated. */
export interface UserEmailPatch {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** The users email address, in `a@b.c` format. */
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  /** True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise. */
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
}

/** The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users. */
export interface UserEmailSecret extends Node {
  __typename?: 'UserEmailSecret';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  /** We store the time the last password reset was sent to this email to prevent the email getting flooded. */
  passwordResetEmailSentAt?: Maybe<Scalars['Datetime']['output']>;
  /** Reads a single `UserEmail` that is related to this `UserEmailSecret`. */
  userEmail?: Maybe<UserEmail>;
  userEmailId: Scalars['Int']['output'];
  verificationToken?: Maybe<Scalars['String']['output']>;
}

/**
 * A condition to be used against `UserEmailSecret` object types. All fields are
 * tested for equality and combined with a logical ‘and.’
 */
export interface UserEmailSecretCondition {
  /** Checks for equality with the object’s `userEmailId` field. */
  userEmailId?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `UserEmailSecret` */
export interface UserEmailSecretInput {
  /** We store the time the last password reset was sent to this email to prevent the email getting flooded. */
  passwordResetEmailSentAt?: InputMaybe<Scalars['Datetime']['input']>;
  userEmailId: Scalars['Int']['input'];
  verificationToken?: InputMaybe<Scalars['String']['input']>;
}

/** Represents an update to a `UserEmailSecret`. Fields that are set will be updated. */
export interface UserEmailSecretPatch {
  /** We store the time the last password reset was sent to this email to prevent the email getting flooded. */
  passwordResetEmailSentAt?: InputMaybe<Scalars['Datetime']['input']>;
  userEmailId?: InputMaybe<Scalars['Int']['input']>;
  verificationToken?: InputMaybe<Scalars['String']['input']>;
}

/** A connection to a list of `UserEmailSecret` values. */
export interface UserEmailSecretsConnection {
  __typename?: 'UserEmailSecretsConnection';
  /** A list of edges which contains the `UserEmailSecret` and cursor to aid in pagination. */
  edges: Array<UserEmailSecretsEdge>;
  /** A list of `UserEmailSecret` objects. */
  nodes: Array<UserEmailSecret>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UserEmailSecret` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `UserEmailSecret` edge in the connection. */
export interface UserEmailSecretsEdge {
  __typename?: 'UserEmailSecretsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `UserEmailSecret` at the end of the edge. */
  node: UserEmailSecret;
}

/** Methods to use when ordering `UserEmailSecret`. */
export type UserEmailSecretsOrderBy =
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'USER_EMAIL_ID_ASC'
  | 'USER_EMAIL_ID_DESC';

/** A connection to a list of `UserEmail` values. */
export interface UserEmailsConnection {
  __typename?: 'UserEmailsConnection';
  /** A list of edges which contains the `UserEmail` and cursor to aid in pagination. */
  edges: Array<UserEmailsEdge>;
  /** A list of `UserEmail` objects. */
  nodes: Array<UserEmail>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UserEmail` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `UserEmail` edge in the connection. */
export interface UserEmailsEdge {
  __typename?: 'UserEmailsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `UserEmail` at the end of the edge. */
  node: UserEmail;
}

/** Methods to use when ordering `UserEmail`. */
export type UserEmailsOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'USER_ID_ASC'
  | 'USER_ID_DESC';

/** An input for mutations affecting `User` */
export interface UserInput {
  /** Optional avatar URL. */
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Unique identifier for the user. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** If true, the user has elevated privileges. */
  isAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  /** Public-facing name (or pseudonym) of the user. */
  name?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Public-facing username (or 'handle') of the user. */
  username: Scalars['String']['input'];
}

/** Represents an update to a `User`. Fields that are set will be updated. */
export interface UserPatch {
  /** Optional avatar URL. */
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Unique identifier for the user. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** If true, the user has elevated privileges. */
  isAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  /** Public-facing name (or pseudonym) of the user. */
  name?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Public-facing username (or 'handle') of the user. */
  username?: InputMaybe<Scalars['String']['input']>;
}

/** The contents of this table should never be visible to the user. Contains data mostly related to authentication. */
export interface UserSecret extends Node {
  __typename?: 'UserSecret';
  firstFailedPasswordAttempt?: Maybe<Scalars['Datetime']['output']>;
  firstFailedResetPasswordAttempt?: Maybe<Scalars['Datetime']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID']['output'];
  passwordAttempts: Scalars['Int']['output'];
  passwordHash?: Maybe<Scalars['String']['output']>;
  resetPasswordAttempts: Scalars['Int']['output'];
  resetPasswordToken?: Maybe<Scalars['String']['output']>;
  resetPasswordTokenGenerated?: Maybe<Scalars['Datetime']['output']>;
  /** Reads a single `User` that is related to this `UserSecret`. */
  user?: Maybe<User>;
  userId: Scalars['Int']['output'];
}

/**
 * A condition to be used against `UserSecret` object types. All fields are tested
 * for equality and combined with a logical ‘and.’
 */
export interface UserSecretCondition {
  /** Checks for equality with the object’s `userId` field. */
  userId?: InputMaybe<Scalars['Int']['input']>;
}

/** An input for mutations affecting `UserSecret` */
export interface UserSecretInput {
  firstFailedPasswordAttempt?: InputMaybe<Scalars['Datetime']['input']>;
  firstFailedResetPasswordAttempt?: InputMaybe<Scalars['Datetime']['input']>;
  passwordAttempts?: InputMaybe<Scalars['Int']['input']>;
  passwordHash?: InputMaybe<Scalars['String']['input']>;
  resetPasswordAttempts?: InputMaybe<Scalars['Int']['input']>;
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>;
  resetPasswordTokenGenerated?: InputMaybe<Scalars['Datetime']['input']>;
  userId: Scalars['Int']['input'];
}

/** Represents an update to a `UserSecret`. Fields that are set will be updated. */
export interface UserSecretPatch {
  firstFailedPasswordAttempt?: InputMaybe<Scalars['Datetime']['input']>;
  firstFailedResetPasswordAttempt?: InputMaybe<Scalars['Datetime']['input']>;
  passwordAttempts?: InputMaybe<Scalars['Int']['input']>;
  passwordHash?: InputMaybe<Scalars['String']['input']>;
  resetPasswordAttempts?: InputMaybe<Scalars['Int']['input']>;
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>;
  resetPasswordTokenGenerated?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['Int']['input']>;
}

/** A connection to a list of `UserSecret` values. */
export interface UserSecretsConnection {
  __typename?: 'UserSecretsConnection';
  /** A list of edges which contains the `UserSecret` and cursor to aid in pagination. */
  edges: Array<UserSecretsEdge>;
  /** A list of `UserSecret` objects. */
  nodes: Array<UserSecret>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UserSecret` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `UserSecret` edge in the connection. */
export interface UserSecretsEdge {
  __typename?: 'UserSecretsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `UserSecret` at the end of the edge. */
  node: UserSecret;
}

/** Methods to use when ordering `UserSecret`. */
export type UserSecretsOrderBy =
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'USER_ID_ASC'
  | 'USER_ID_DESC';

/** A `User` edge in the connection. */
export interface UsersEdge {
  __typename?: 'UsersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `User` at the end of the edge. */
  node: User;
}

/** Methods to use when ordering `User`. */
export type UsersOrderBy =
  | 'ID_ASC'
  | 'ID_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'USERNAME_ASC'
  | 'USERNAME_DESC';
