import axios, { AxiosError } from 'axios';

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

interface Forum {
    id: number;
    nodeId: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface ForumStats {
    forumId: number;
    topicCount: number;
    postCount: number;
    latestTopicId: number | null;
}

describe('Forum Mutations E2E', () => {
    let createdForumId: number | null = null;
    let createdForumNodeId: string | null = null;

    // Cleanup: Delete any forums created during tests
    afterAll(async () => {
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
    });

    describe('createForum mutation', () => {
        it('should create a forum with valid input', async () => {
            const uniqueSlug = `test-forum-${Date.now()}`;
            const res = await axios.post<GraphQLResponse<{ createForum: { forum: Forum } }>>('/graphql', {
                query: `
                    mutation CreateForum($input: CreateForumInput!) {
                        createForum(input: $input) {
                            forum {
                                id
                                nodeId
                                name
                                slug
                                description
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        forum: {
                            name: 'Test Forum',
                            slug: uniqueSlug,
                            description: 'A test forum for e2e testing',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createForum.forum).toHaveProperty('id');
            expect(res.data.data?.createForum.forum.name).toBe('Test Forum');
            expect(res.data.data?.createForum.forum.slug).toBe(uniqueSlug);

            // Store for cleanup
            createdForumId = res.data.data?.createForum.forum.id ?? null;
            createdForumNodeId = res.data.data?.createForum.forum.nodeId ?? null;
        });

        it('should reject forum creation with invalid slug format', async () => {
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateForum($input: CreateForumInput!) {
                        createForum(input: $input) {
                            forum {
                                id
                                name
                                slug
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        forum: {
                            name: 'Test Forum',
                            slug: 'Invalid Slug With Spaces!',
                            description: 'This should fail',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('Invalid slug format');
        });

        it('should reject forum creation with uppercase slug', async () => {
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateForum($input: CreateForumInput!) {
                        createForum(input: $input) {
                            forum {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        forum: {
                            name: 'Test Forum',
                            slug: 'UPPERCASE-SLUG',
                            description: 'This should fail',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('Invalid slug format');
        });

        it('should reject forum creation with name less than 3 characters', async () => {
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreateForum($input: CreateForumInput!) {
                        createForum(input: $input) {
                            forum {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        forum: {
                            name: 'AB',
                            slug: 'valid-slug',
                            description: 'This should fail',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 3 characters');
        });
    });

    describe('updateForum mutation', () => {
        it('should update forum name successfully', async () => {
            if (!createdForumId) {
                console.warn('Skipping test: No forum created');
                return;
            }

            const res = await axios.post<GraphQLResponse<{ updateForum: { forum: Forum } }>>('/graphql', {
                query: `
                    mutation UpdateForum($input: UpdateForumInput!) {
                        updateForum(input: $input) {
                            forum {
                                id
                                name
                                slug
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdForumId,
                        patch: {
                            name: 'Updated Test Forum',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.updateForum.forum.name).toBe('Updated Test Forum');
        });

        it('should reject update with invalid slug', async () => {
            if (!createdForumId) {
                console.warn('Skipping test: No forum created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation UpdateForum($input: UpdateForumInput!) {
                        updateForum(input: $input) {
                            forum {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdForumId,
                        patch: {
                            slug: 'Invalid Slug!',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('Invalid slug format');
        });

        it('should reject update with name less than 3 characters', async () => {
            if (!createdForumId) {
                console.warn('Skipping test: No forum created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation UpdateForum($input: UpdateForumInput!) {
                        updateForum(input: $input) {
                            forum {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdForumId,
                        patch: {
                            name: 'XY',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 3 characters');
        });
    });

    // describe('forumStats query', () => {
    //     it('should return forum statistics', async () => {
    //         if (!createdForumId) {
    //             console.warn('Skipping test: No forum created');
    //             return;
    //         }

    //         const res = await axios.post<GraphQLResponse<{ forumStats: ForumStats }>>('/graphql', {
    //             query: `
    //                 query ForumStats($forumId: Int!) {
    //                     forumStats(forumId: $forumId) {
    //                         forumId
    //                         topicCount
    //                         postCount
    //                         latestTopicId
    //                     }
    //                 }
    //             `,
    //             variables: { forumId: createdForumId },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.forumStats).toHaveProperty('forumId', createdForumId);
    //         expect(res.data.data?.forumStats).toHaveProperty('topicCount');
    //         expect(res.data.data?.forumStats).toHaveProperty('postCount');
    //     });

    //     it('should return null for non-existent forum', async () => {
    //         const res = await axios.post<GraphQLResponse<{ forumStats: ForumStats | null }>>('/graphql', {
    //             query: `
    //                 query ForumStats($forumId: Int!) {
    //                     forumStats(forumId: $forumId) {
    //                         forumId
    //                         topicCount
    //                     }
    //                 }
    //             `,
    //             variables: { forumId: 999999 },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.forumStats).toBeNull();
    //     });
    // });

    describe('deleteForum mutation', () => {
        it('should delete an empty forum successfully', async () => {
            // Create a new forum for deletion
            const uniqueSlug = `delete-test-${Date.now()}`;
            const createRes = await axios.post<GraphQLResponse<{ createForum: { forum: Forum } }>>('/graphql', {
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
                            name: 'Forum to Delete',
                            slug: uniqueSlug,
                            description: 'This forum will be deleted',
                        },
                    },
                },
            });

            const forumToDeleteId = createRes.data.data?.createForum.forum.id;

            // Now delete it
            const deleteRes = await axios.post<GraphQLResponse<{ deleteForum: { deletedForumNodeId: string } }>>(
                '/graphql',
                {
                    query: `
                        mutation DeleteForum($input: DeleteForumInput!) {
                            deleteForum(input: $input) {
                                deletedForumNodeId
                            }
                        }
                    `,
                    variables: { input: { id: forumToDeleteId } },
                }
            );

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.data.errors).toBeUndefined();
            expect(deleteRes.data.data?.deleteForum.deletedForumNodeId).toBeDefined();
        });
    });
});
