import axios from 'axios';

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
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
    body: string;
    forumId: number;
    authorId: number;
    createdAt: string;
    updatedAt: string;
}

interface TopicStats {
    topicId: number;
    postCount: number;
    viewCount: number | null;
    lastActivityAt: string | null;
}

interface User {
    id: number;
    nodeId: string;
    username: string;
}

describe('Topic Mutations E2E', () => {
    let testForumId: number | null = null;
    let testUserId: number | null = null;
    let createdTopicId: number | null = null;
    let createdTopicNodeId: string | null = null;

    // Setup: Create a forum and user for testing
    beforeAll(async () => {
        // Create a test forum
        const timestamp = Date.now();
        const uniqueSlug = `topicforum${timestamp}`;
        const forumRes = await axios.post<GraphQLResponse<{ createForum: { forum: Forum } }>>('/graphql', {
            query: `
                mutation CreateForum($input: CreateForumInput!) {
                    createForum(input: $input) {
                        forum {
                            id
                            nodeId
                        }
                    }
                }
            `,
            variables: {
                input: {
                    forum: {
                        name: 'Topic Test Forum',
                        slug: uniqueSlug,
                        description: 'A forum for testing topics',
                    },
                },
            },
        });
        if (forumRes.data.errors) {
            console.error('Forum creation failed:', JSON.stringify(forumRes.data.errors, null, 2));
        }
        testForumId = forumRes.data.data?.createForum.forum.id ?? null;

        // Create a test user
        const timestamp2 = Date.now();
        const uniqueUsername = `topictester${timestamp2}`;
        const userRes = await axios.post<GraphQLResponse<{ createUser: { user: User } }>>('/graphql', {
            query: `
                mutation CreateUser($input: CreateUserInput!) {
                    createUser(input: $input) {
                        user {
                            id
                            nodeId
                            username
                        }
                    }
                }
            `,
            variables: {
                input: {
                    user: {
                        username: uniqueUsername,
                        name: 'Topic Tester',
                    },
                },
            },
        });
        if (userRes.data.errors) {
            console.error('User creation failed:', JSON.stringify(userRes.data.errors, null, 2));
        }
        testUserId = userRes.data.data?.createUser.user.id ?? null;
        
        // Set the test user ID header for authenticated operations
        if (testUserId) {
            axios.defaults.headers.common['x-test-user-id'] = String(testUserId);
        }
    });

    // Cleanup
    afterAll(async () => {
        // Delete created topic
        if (createdTopicId) {
            try {
                await axios.post('/graphql', {
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
                // Ignore
            }
        }

        // Delete test forum
        if (testForumId) {
            try {
                await axios.post('/graphql', {
                    query: `
                        mutation DeleteForum($input: DeleteForumInput!) {
                            deleteForum(input: $input) {
                                deletedForumNodeId
                            }
                        }
                    `,
                    variables: { input: { id: testForumId } },
                });
            } catch {
                // Ignore
            }
        }

        // Delete test user
        if (testUserId) {
            try {
                await axios.post('/graphql', {
                    query: `
                        mutation DeleteUser($input: DeleteUserInput!) {
                            deleteUser(input: $input) {
                                deletedUserNodeId
                            }
                        }
                    `,
                    variables: { input: { id: testUserId } },
                });
            } catch {
                // Ignore
            }
        }
    });

    describe('createTopic mutation', () => {
        it('should create a topic with valid input', async () => {
            if (!testForumId || !testUserId) {
                console.warn('Skipping test: Test forum or user not created');
                return;
            }

            const res = await axios.post<GraphQLResponse<{ createTopic: { topic: Topic } }>>('/graphql', {
                query: `
                    mutation CreateTopic($input: CreateTopicInput!) {
                        createTopic(input: $input) {
                            topic {
                                id
                                nodeId
                                title
                                body
                                forumId
                                authorId
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        topic: {
                            title: 'Test Topic Title',
                            body: 'This is a test topic body with enough content.',
                            forumId: testForumId,
                            authorId: testUserId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createTopic.topic).toHaveProperty('id');
            expect(res.data.data?.createTopic.topic.title).toBe('Test Topic Title');
            expect(res.data.data?.createTopic.topic.forumId).toBe(testForumId);

            // Store for cleanup
            createdTopicId = res.data.data?.createTopic.topic.id ?? null;
            createdTopicNodeId = res.data.data?.createTopic.topic.nodeId ?? null;
        });

        it('should reject topic creation with title less than 5 characters', async () => {
            if (!testForumId || !testUserId) {
                console.warn('Skipping test: Test forum or user not created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateTopic($input: CreateTopicInput!) {
                        createTopic(input: $input) {
                            topic {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        topic: {
                            title: 'Hi',
                            body: 'This topic has a short title',
                            forumId: testForumId,
                            authorId: testUserId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 5 characters');
        });

        it('should reject topic creation with title exceeding 200 characters', async () => {
            if (!testForumId || !testUserId) {
                console.warn('Skipping test: Test forum or user not created');
                return;
            }

            const longTitle = 'A'.repeat(201);
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateTopic($input: CreateTopicInput!) {
                        createTopic(input: $input) {
                            topic {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        topic: {
                            title: longTitle,
                            body: 'This topic has a very long title',
                            forumId: testForumId,
                            authorId: testUserId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('not exceed 200 characters');
        });

        it('should reject topic creation with non-existent forum', async () => {
            if (!testUserId) {
                console.warn('Skipping test: Test user not created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateTopic($input: CreateTopicInput!) {
                        createTopic(input: $input) {
                            topic {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        topic: {
                            title: 'Valid Topic Title',
                            body: 'This topic references a non-existent forum',
                            forumId: 999999,
                            authorId: testUserId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('does not exist');
        });
    });

    describe('updateTopic mutation', () => {
        it('should update topic title successfully', async () => {
            if (!createdTopicId) {
                console.warn('Skipping test: No topic created');
                return;
            }

            const res = await axios.post<GraphQLResponse<{ updateTopic: { topic: Topic } }>>('/graphql', {
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
                            title: 'Updated Topic Title',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.updateTopic.topic.title).toBe('Updated Topic Title');
        });

        it('should reject update with title less than 5 characters', async () => {
            if (!createdTopicId) {
                console.warn('Skipping test: No topic created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation UpdateTopic($input: UpdateTopicInput!) {
                        updateTopic(input: $input) {
                            topic {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdTopicId,
                        patch: {
                            title: 'XYZ',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 5 characters');
        });
    });

    // describe('topicStats query', () => {
    //     it('should return topic statistics', async () => {
    //         if (!createdTopicId) {
    //             console.warn('Skipping test: No topic created');
    //             return;
    //         }

    //         const res = await axios.post<GraphQLResponse<{ topicStats: TopicStats }>>('/graphql', {
    //             query: `
    //                 query TopicStats($topicId: Int!) {
    //                     topicStats(topicId: $topicId) {
    //                         topicId
    //                         postCount
    //                         viewCount
    //                         lastActivityAt
    //                     }
    //                 }
    //             `,
    //             variables: { topicId: createdTopicId },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.topicStats).toHaveProperty('topicId', createdTopicId);
    //         expect(res.data.data?.topicStats).toHaveProperty('postCount');
    //     });

    //     it('should return null for non-existent topic', async () => {
    //         const res = await axios.post<GraphQLResponse<{ topicStats: TopicStats | null }>>('/graphql', {
    //             query: `
    //                 query TopicStats($topicId: Int!) {
    //                     topicStats(topicId: $topicId) {
    //                         topicId
    //                         postCount
    //                     }
    //                 }
    //             `,
    //             variables: { topicId: 999999 },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.topicStats).toBeNull();
    //     });
    // });

    // describe('searchTopics query', () => {
    //     it('should search topics by title', async () => {
    //         const res = await axios.post<GraphQLResponse<{ searchTopics: Topic[] }>>('/graphql', {
    //             query: `
    //                 query SearchTopics($searchTerm: String!, $limit: Int) {
    //                     searchTopics(searchTerm: $searchTerm, limit: $limit) {
    //                         id
    //                         title
    //                         body
    //                     }
    //                 }
    //             `,
    //             variables: {
    //                 searchTerm: 'Updated Topic',
    //                 limit: 10,
    //             },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(Array.isArray(res.data.data?.searchTopics)).toBe(true);
    //     });

    //     it('should filter search by forumId', async () => {
    //         if (!testForumId) {
    //             console.warn('Skipping test: No test forum');
    //             return;
    //         }

    //         const res = await axios.post<GraphQLResponse<{ searchTopics: Topic[] }>>('/graphql', {
    //             query: `
    //                 query SearchTopics($searchTerm: String!, $forumId: Int, $limit: Int) {
    //                     searchTopics(searchTerm: $searchTerm, forumId: $forumId, limit: $limit) {
    //                         id
    //                         title
    //                         forumId
    //                     }
    //                 }
    //             `,
    //             variables: {
    //                 searchTerm: 'Topic',
    //                 forumId: testForumId,
    //                 limit: 10,
    //             },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(Array.isArray(res.data.data?.searchTopics)).toBe(true);

    //         // All results should belong to the test forum
    //         res.data.data?.searchTopics.forEach((topic) => {
    //             expect(topic.forumId).toBe(testForumId);
    //         });
    //     });
    // });

    describe('deleteTopic mutation', () => {
        it('should delete an empty topic successfully', async () => {
            if (!testForumId || !testUserId) {
                console.warn('Skipping test: Test forum or user not created');
                return;
            }

            // Create a new topic for deletion
            const createRes = await axios.post<GraphQLResponse<{ createTopic: { topic: Topic } }>>('/graphql', {
                query: `
                    mutation CreateTopic($input: CreateTopicInput!) {
                        createTopic(input: $input) {
                            topic {
                                id
                                nodeId
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        topic: {
                            title: 'Topic to Delete',
                            body: 'This topic will be deleted',
                            forumId: testForumId,
                            authorId: testUserId,
                        },
                    },
                },
            });

            const topicToDeleteId = createRes.data.data?.createTopic.topic.id;

            // Now delete it
            const deleteRes = await axios.post<GraphQLResponse<{ deleteTopic: { deletedTopicNodeId: string } }>>(
                '/graphql',
                {
                    query: `
                        mutation DeleteTopic($input: DeleteTopicInput!) {
                            deleteTopic(input: $input) {
                                deletedTopicNodeId
                            }
                        }
                    `,
                    variables: { input: { id: topicToDeleteId } },
                }
            );

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.data.errors).toBeUndefined();
            expect(deleteRes.data.data?.deleteTopic.deletedTopicNodeId).toBeDefined();
        });
    });
});
