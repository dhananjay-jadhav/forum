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
}

interface Post {
    id: number;
    nodeId: string;
    body: string;
    topicId: number;
    createdAt: string;
    updatedAt: string;
}

interface PostStats {
    postId: number;
    characterCount: number;
    wordCount: number;
    editCount: number;
}

interface RecentPost {
    id: number;
    body: string;
    createdAt: string;
    author: {
        username: string;
    };
    topic: {
        title: string;
    };
}

interface User {
    id: number;
    nodeId: string;
    username: string;
}

describe('Post Mutations E2E', () => {
    let testForumId: number | null = null;
    let testTopicId: number | null = null;
    let testUserId: number | null = null;
    let createdPostId: number | null = null;

    // Setup: Create forum, topic, and user for testing
    beforeAll(async () => {
        // Create test forum
        const timestamp = Date.now();
        const uniqueSlug = `postforum${timestamp}`;
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
                        name: 'Post Test Forum',
                        slug: uniqueSlug,
                        description: 'A forum for testing posts',
                    },
                },
            },
        });
        if (forumRes.data.errors) {
            console.error('Forum creation failed:', JSON.stringify(forumRes.data.errors, null, 2));
        }
        testForumId = forumRes.data.data?.createForum.forum.id ?? null;

        // Create test user
        const timestamp2 = Date.now();
        const uniqueUsername = `posttester${timestamp2}`;
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
                        name: 'Post Tester',
                    },
                },
            },
        });
        if (userRes.data.errors) {
            console.error('User creation failed:', JSON.stringify(userRes.data.errors, null, 2));
        }
        testUserId = userRes.data.data?.createUser.user.id ?? null;

        // Create test topic
        if (testForumId && testUserId) {
            // Set the test user ID header for authenticated operations
            axios.defaults.headers.common['x-test-user-id'] = String(testUserId);
            
            const topicRes = await axios.post<GraphQLResponse<{ createTopic: { topic: Topic } }>>('/graphql', {
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
                            title: 'Post Test Topic',
                            body: 'A topic for testing posts',
                            forumId: testForumId,
                            authorId: testUserId,
                        },
                    },
                },
            });
            testTopicId = topicRes.data.data?.createTopic.topic.id ?? null;
        }
    });

    // Cleanup
    afterAll(async () => {
        // Delete created post
        if (createdPostId) {
            try {
                await axios.post('/graphql', {
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
                // Ignore
            }
        }

        // Delete test topic
        if (testTopicId) {
            try {
                await axios.post('/graphql', {
                    query: `
                        mutation DeleteTopic($input: DeleteTopicInput!) {
                            deleteTopic(input: $input) {
                                deletedTopicNodeId
                            }
                        }
                    `,
                    variables: { input: { id: testTopicId } },
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

    describe('createPost mutation', () => {
        it('should create a post with valid input', async () => {
            if (!testTopicId) {
                console.warn('Skipping test: Test topic not created');
                return;
            }

            const res = await axios.post<GraphQLResponse<{ createPost: { post: Post } }>>('/graphql', {
                query: `
                    mutation CreatePost($input: CreatePostInput!) {
                        createPost(input: $input) {
                            post {
                                id
                                nodeId
                                body
                                topicId
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        post: {
                            body: 'This is a test post body with enough content to pass validation.',
                            topicId: testTopicId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.createPost.post).toHaveProperty('id');
            expect(res.data.data?.createPost.post.body).toContain('test post body');
            expect(res.data.data?.createPost.post.topicId).toBe(testTopicId);

            // Store for cleanup
            createdPostId = res.data.data?.createPost.post.id ?? null;
        });

        it('should reject post creation with body less than 10 characters', async () => {
            if (!testTopicId) {
                console.warn('Skipping test: Test topic not created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreatePost($input: CreatePostInput!) {
                        createPost(input: $input) {
                            post {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        post: {
                            body: 'Short',
                            topicId: testTopicId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 10 characters');
        });

        it('should reject post creation with body exceeding 50000 characters', async () => {
            if (!testTopicId) {
                console.warn('Skipping test: Test topic not created');
                return;
            }

            const longBody = 'A'.repeat(50001);
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreatePost($input: CreatePostInput!) {
                        createPost(input: $input) {
                            post {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        post: {
                            body: longBody,
                            topicId: testTopicId,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('not exceed 50000 characters');
        });

        it('should reject post creation with non-existent topic', async () => {
            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation CreatePost($input: CreatePostInput!) {
                        createPost(input: $input) {
                            post {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        post: {
                            body: 'This post references a non-existent topic',
                            topicId: 999999,
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('does not exist');
        });
    });

    describe('updatePost mutation', () => {
        it('should update post body successfully', async () => {
            if (!createdPostId) {
                console.warn('Skipping test: No post created');
                return;
            }

            const res = await axios.post<GraphQLResponse<{ updatePost: { post: Post } }>>('/graphql', {
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
                            body: 'This is the updated post body with enough content.',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data?.updatePost.post.body).toContain('updated post body');
        });

        it('should reject update with body less than 10 characters', async () => {
            if (!createdPostId) {
                console.warn('Skipping test: No post created');
                return;
            }

            const res = await axios.post<GraphQLResponse>('/graphql', {
                query: `
                    mutation UpdatePost($input: UpdatePostInput!) {
                        updatePost(input: $input) {
                            post {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        id: createdPostId,
                        patch: {
                            body: 'Too short',
                        },
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors?.[0]?.message).toContain('at least 10 characters');
        });
    });

    // describe('postStats query', () => {
    //     it('should return post statistics', async () => {
    //         if (!createdPostId) {
    //             console.warn('Skipping test: No post created');
    //             return;
    //         }

    //         const res = await axios.post<GraphQLResponse<{ postStats: PostStats }>>('/graphql', {
    //             query: `
    //                 query PostStats($postId: Int!) {
    //                     postStats(postId: $postId) {
    //                         postId
    //                         characterCount
    //                         wordCount
    //                         editCount
    //                     }
    //                 }
    //             `,
    //             variables: { postId: createdPostId },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.postStats).toHaveProperty('postId', createdPostId);
    //         expect(res.data.data?.postStats).toHaveProperty('characterCount');
    //         expect(res.data.data?.postStats).toHaveProperty('wordCount');
    //     });

    //     it('should return null for non-existent post', async () => {
    //         const res = await axios.post<GraphQLResponse<{ postStats: PostStats | null }>>('/graphql', {
    //             query: `
    //                 query PostStats($postId: Int!) {
    //                     postStats(postId: $postId) {
    //                         postId
    //                     }
    //                 }
    //             `,
    //             variables: { postId: 999999 },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.postStats).toBeNull();
    //     });
    // });

    // describe('recentPosts query', () => {
    //     it('should return recent posts', async () => {
    //         const res = await axios.post<GraphQLResponse<{ recentPosts: RecentPost[] }>>('/graphql', {
    //             query: `
    //                 query RecentPosts($limit: Int) {
    //                     recentPosts(limit: $limit) {
    //                         id
    //                         body
    //                         createdAt
    //                     }
    //                 }
    //             `,
    //             variables: { limit: 10 },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(Array.isArray(res.data.data?.recentPosts)).toBe(true);
    //     });

    //     it('should respect the limit parameter', async () => {
    //         const res = await axios.post<GraphQLResponse<{ recentPosts: RecentPost[] }>>('/graphql', {
    //             query: `
    //                 query RecentPosts($limit: Int) {
    //                     recentPosts(limit: $limit) {
    //                         id
    //                     }
    //                 }
    //             `,
    //             variables: { limit: 5 },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.recentPosts.length).toBeLessThanOrEqual(5);
    //     });
    // });

    // describe('createPostWithNotifications mutation', () => {
    //     it('should create a post and return notification sent status', async () => {
    //         if (!testTopicId) {
    //             console.warn('Skipping test: Test topic not created');
    //             return;
    //         }

    //         const res = await axios.post<
    //             GraphQLResponse<{
    //                 createPostWithNotifications: {
    //                     post: Post;
    //                 };
    //             }>
    //         >('/graphql', {
    //             query: `
    //                 mutation CreatePostWithNotifications($input: CreatePostWithNotificationsInput!) {
    //                     createPostWithNotifications(input: $input) {
    //                         post {
    //                             id
    //                             body
    //                         }
    //                     }
    //                 }
    //             `,
    //             variables: {
    //                 input: {
    //                     topicId: testTopicId,
    //                     body: 'Post created with notifications enabled.',
    //                     notifySubscribers: true,
    //                 },
    //             },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.createPostWithNotifications.post).toHaveProperty('id');
    //     });
    // });

    // describe('editPost mutation', () => {
    //     it('should edit a post and track edit history', async () => {
    //         if (!createdPostId) {
    //             console.warn('Skipping test: No post created');
    //             return;
    //         }

    //         const res = await axios.post<
    //             GraphQLResponse<{
    //                 editPost: {
    //                     post: Post;
    //                 };
    //             }>
    //         >('/graphql', {
    //             query: `
    //                 mutation EditPost($input: EditPostInput!) {
    //                     editPost(input: $input) {
    //                         post {
    //                             id
    //                             body
    //                         }
    //                     }
    //                 }
    //             `,
    //             variables: {
    //                 input: {
    //                     postId: createdPostId,
    //                     body: 'This post has been edited through the editPost mutation.',
    //                     editReason: 'Testing edit functionality',
    //                 },
    //             },
    //         });

    //         expect(res.status).toBe(200);
    //         expect(res.data.errors).toBeUndefined();
    //         expect(res.data.data?.editPost.post).toHaveProperty('id');
    //     });
    // });

    describe('deletePost mutation', () => {
        it('should delete a post successfully', async () => {
            if (!testTopicId) {
                console.warn('Skipping test: Test topic not created');
                return;
            }

            // Create a new post for deletion
            const createRes = await axios.post<GraphQLResponse<{ createPost: { post: Post } }>>('/graphql', {
                query: `
                    mutation CreatePost($input: CreatePostInput!) {
                        createPost(input: $input) {
                            post {
                                id
                                nodeId
                            }
                        }
                    }
                `,
                variables: {
                    input: {
                        post: {
                            body: 'This post will be deleted for testing purposes.',
                            topicId: testTopicId,
                        },
                    },
                },
            });

            const postToDeleteId = createRes.data.data?.createPost.post.id;

            // Delete the post
            const deleteRes = await axios.post<GraphQLResponse<{ deletePost: { deletedPostNodeId: string } }>>(
                '/graphql',
                {
                    query: `
                        mutation DeletePost($input: DeletePostInput!) {
                            deletePost(input: $input) {
                                deletedPostNodeId
                            }
                        }
                    `,
                    variables: { input: { id: postToDeleteId } },
                }
            );

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.data.errors).toBeUndefined();
            expect(deleteRes.data.data?.deletePost.deletedPostNodeId).toBeDefined();
        });
    });
});
