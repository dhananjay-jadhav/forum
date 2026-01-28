import axios from 'axios';

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

interface User {
    id: number;
    nodeId: string;
    username: string;
    name: string | null;
}

interface Forum {
    id: number;
    nodeId: string;
    name: string;
    slug: string;
}

interface Topic {
    id: number;
    nodeId: string;
    title: string;
}

interface Post {
    id: number;
    nodeId: string;
    body: string;
}

describe('Subscriptions E2E', () => {
    // Track created resources for cleanup
    let createdUserId: number | null = null;
    let createdForumId: number | null = null;
    let createdTopicId: number | null = null;
    let createdPostId: number | null = null;

    // Cleanup: Delete all created resources
    afterAll(async () => {
        // Delete in reverse order of creation to respect foreign keys
        if (createdPostId) {
            try {
                await axios.post<GraphQLResponse>('/graphql', {
                    query: `
                        mutation DeletePost($input: DeletePostInput!) {
                            deletePost(input: $input) {
                                deletedPostNodeId
                            }
                        }
                    `,
                    variables: { input: { id: createdPostId } },
                });
            } catch {
                // Ignore cleanup errors
            }
        }

        if (createdTopicId) {
            try {
                await axios.post<GraphQLResponse>('/graphql', {
                    query: `
                        mutation DeleteTopic($input: DeleteTopicInput!) {
                            deleteTopic(input: $input) {
                                deletedTopicNodeId
                            }
                        }
                    `,
                    variables: { input: { id: createdTopicId } },
                });
            } catch {
                // Ignore cleanup errors
            }
        }

        if (createdForumId) {
            try {
                await axios.post<GraphQLResponse>('/graphql', {
                    query: `
                        mutation DeleteForum($input: DeleteForumInput!) {
                            deleteForum(input: $input) {
                                deletedForumNodeId
                            }
                        }
                    `,
                    variables: { input: { id: createdForumId } },
                });
            } catch {
                // Ignore cleanup errors
            }
        }

        if (createdUserId) {
            try {
                await axios.post<GraphQLResponse>('/graphql', {
                    query: `
                        mutation DeleteUser($input: DeleteUserInput!) {
                            deleteUser(input: $input) {
                                deletedUserNodeId
                            }
                        }
                    `,
                    variables: { input: { id: createdUserId } },
                });
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    describe('GraphQL Subscription Schema', () => {
        it('should have Subscription type in schema', async () => {
            const res = await axios.post<GraphQLResponse<{ __schema: { types: Array<{ name: string; kind: string }> } }>>(
                '/graphql',
                {
                    query: `
                        query {
                            __schema {
                                types {
                                    name
                                    kind
                                }
                            }
                        }
                    `,
                }
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            const types = res.data.data?.__schema.types || [];
            const subscriptionType = types.find((t) => t.name === 'Subscription');
            expect(subscriptionType).toBeDefined();
            expect(subscriptionType?.kind).toBe('OBJECT');
        });

        it('should have listen subscription field', async () => {
            const res = await axios.post<
                GraphQLResponse<{ __type: { fields: Array<{ name: string; type: { name: string | null } }> } | null }>
            >('/graphql', {
                query: `
                    query {
                        __type(name: "Subscription") {
                            fields {
                                name
                                type {
                                    name
                                }
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.__type).toBeDefined();

            const fields = res.data.data?.__type?.fields || [];
            const listenField = fields.find((f) => f.name === 'listen');
            expect(listenField).toBeDefined();
        });

        it('should have ListenPayload type with query field', async () => {
            const res = await axios.post<
                GraphQLResponse<{
                    __type: {
                        name: string;
                        fields: Array<{ name: string; type: { name: string | null; kind: string } }>;
                    } | null;
                }>
            >('/graphql', {
                query: `
                    query {
                        __type(name: "ListenPayload") {
                            name
                            fields {
                                name
                                type {
                                    name
                                    kind
                                }
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.__type).toBeDefined();
            expect(res.data.data?.__type?.name).toBe('ListenPayload');

            const fields = res.data.data?.__type?.fields || [];
            const fieldNames = fields.map((f) => f.name);
            expect(fieldNames).toContain('query');
        });
    });

    describe('User Events (triggers)', () => {
        it('should create a user (which triggers subscription event)', async () => {
            const testUsername = `subtest_user_${Date.now()}`;
            const res = await axios.post<GraphQLResponse<{ createUser: { user: User } }>>('/graphql', {
                query: `
                    mutation CreateUser($input: CreateUserInput!) {
                        createUser(input: $input) {
                            user {
                                id
                                nodeId
                                username
                                name
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        user: {
                            username: testUsername,
                            name: 'Subscription Test User',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createUser.user).toHaveProperty('id');
            expect(res.data.data?.createUser.user.username).toBe(testUsername);

            createdUserId = res.data.data?.createUser.user.id ?? null;
        });

        it('should update a user (which triggers subscription event)', async () => {
            if (!createdUserId) {
                throw new Error('No user created in previous test');
            }

            const res = await axios.post<GraphQLResponse<{ updateUser: { user: User } }>>('/graphql', {
                query: `
                    mutation UpdateUser($input: UpdateUserInput!) {
                        updateUser(input: $input) {
                            user {
                                id
                                username
                                name
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdUserId,
                        patch: {
                            name: 'Updated Subscription Test User',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
        });
    });

    describe('Forum Events (triggers)', () => {
        it('should create a forum (which triggers subscription event)', async () => {
            const uniqueSlug = `subtest-forum-${Date.now()}`;
            const res = await axios.post<GraphQLResponse<{ createForum: { forum: Forum } }>>('/graphql', {
                query: `
                    mutation CreateForum($input: CreateForumInput!) {
                        createForum(input: $input) {
                            forum {
                                id
                                nodeId
                                name
                                slug
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        forum: {
                            name: 'Subscription Test Forum',
                            slug: uniqueSlug,
                            description: 'Forum created for subscription e2e testing',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createForum.forum).toHaveProperty('id');

            createdForumId = res.data.data?.createForum.forum.id ?? null;
        });

        it('should update a forum (which triggers subscription event)', async () => {
            if (!createdForumId) {
                throw new Error('No forum created in previous test');
            }

            const res = await axios.post<GraphQLResponse<{ updateForum: { forum: Forum } }>>('/graphql', {
                query: `
                    mutation UpdateForum($input: UpdateForumInput!) {
                        updateForum(input: $input) {
                            forum {
                                id
                                name
                                description
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdForumId,
                        patch: {
                            description: 'Updated forum description for subscription testing',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
        });
    });

    describe('Topic Events (triggers)', () => {
        it('should create a topic (which triggers subscription event)', async () => {
            if (!createdForumId || !createdUserId) {
                throw new Error('Forum or user not created in previous tests');
            }

            const res = await axios.post<GraphQLResponse<{ createTopic: { topic: Topic } }>>(
                '/graphql',
                {
                    query: `
                        mutation CreateTopic($input: CreateTopicInput!) {
                            createTopic(input: $input) {
                                topic {
                                    id
                                    nodeId
                                    title
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            topic: {
                                forumId: createdForumId,
                                authorId: createdUserId,
                                title: 'Subscription Test Topic',
                                body: 'Topic body for subscription e2e testing',
                            },
                        },
                    },
                },
                {
                    headers: {
                        'x-test-user-id': String(createdUserId),
                    },
                }
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createTopic.topic).toHaveProperty('id');

            createdTopicId = res.data.data?.createTopic.topic.id ?? null;
        });

        it('should update a topic (which triggers subscription event)', async () => {
            if (!createdTopicId || !createdUserId) {
                throw new Error('Topic not created in previous test');
            }

            const res = await axios.post<GraphQLResponse<{ updateTopic: { topic: Topic } }>>(
                '/graphql',
                {
                    query: `
                        mutation UpdateTopic($input: UpdateTopicInput!) {
                            updateTopic(input: $input) {
                                topic {
                                    id
                                    title
                                    body
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            id: createdTopicId,
                            patch: {
                                title: 'Updated Subscription Test Topic',
                            },
                        },
                    },
                },
                {
                    headers: {
                        'x-test-user-id': String(createdUserId),
                    },
                }
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
        });
    });

    describe('Post Events (triggers)', () => {
        it('should create a post (which triggers subscription event)', async () => {
            if (!createdTopicId || !createdUserId) {
                throw new Error('Topic or user not created in previous tests');
            }

            const res = await axios.post<GraphQLResponse<{ createPost: { post: Post } }>>(
                '/graphql',
                {
                    query: `
                        mutation CreatePost($input: CreatePostInput!) {
                            createPost(input: $input) {
                                post {
                                    id
                                    nodeId
                                    body
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            post: {
                                topicId: createdTopicId,
                                body: 'Post body for subscription e2e testing with enough content.',
                            },
                        },
                    },
                },
                {
                    headers: {
                        'x-test-user-id': String(createdUserId),
                    },
                }
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createPost.post).toHaveProperty('id');

            createdPostId = res.data.data?.createPost.post.id ?? null;
        });

        it('should update a post (which triggers subscription event)', async () => {
            if (!createdPostId || !createdUserId) {
                throw new Error('Post not created in previous test');
            }

            const res = await axios.post<GraphQLResponse<{ updatePost: { post: Post } }>>(
                '/graphql',
                {
                    query: `
                        mutation UpdatePost($input: UpdatePostInput!) {
                            updatePost(input: $input) {
                                post {
                                    id
                                    body
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            id: createdPostId,
                            patch: {
                                body: 'Updated post body for subscription e2e testing.',
                            },
                        },
                    },
                },
                {
                    headers: {
                        'x-test-user-id': String(createdUserId),
                    },
                }
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
        });
    });
});
