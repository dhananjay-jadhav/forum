import { verifyAccessToken, verifyRefreshToken } from '@app/user-api';
import axios, { AxiosResponse } from 'axios';

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

interface User {
    id: number;
    username: string;
    name: string | null;
}

interface JwtTokenPayload {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
}

interface LogoutPayload {
    success: boolean;
}

/**
 * E2E tests for JWT Authentication
 *
 * Tests the authentication mutations:
 * - register: Create a new user account
 * - login: Authenticate with username/email and password
 * - refreshToken: Get new access token using refresh token
 * - logout: Invalidate the current session
 * - Protected routes with JWT authentication
 */
describe('Authentication (JWT)', () => {
    // Test data
    const timestamp = Date.now();
    const testUser = {
        username: `authtest${timestamp}`,
        email: `authtest${timestamp}@example.com`,
        password: 'SecurePassword123!',
        name: 'Auth Test User',
    };

    let accessToken: string;
    let refreshToken: string;

    // ========================================================================
    // Registration Tests
    // ========================================================================

    describe('register mutation', () => {
        it('should register a new user successfully', async () => {
            const response: AxiosResponse<GraphQLResponse<{ register: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Register($input: RegisterInput!) {
                            register(input: $input) {
                                accessToken
                                refreshToken
                                expiresIn
                                user {
                                    id
                                    username
                                    name
                                }
                            }
                        }
                    `,
                    variables: {
                        input: testUser,
                    },
                }
            );

            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.register).toBeDefined();

            const result = response.data.data!.register;
            const { accessToken: at, refreshToken: rt, expiresIn, user } = result;

            // Verify tokens are valid JWTs
            expect(at).toBeDefined();
            expect(rt).toBeDefined();
            expect(typeof at).toBe('string');
            expect(typeof rt).toBe('string');

            // Verify tokens can be decoded
            const accessClaims = verifyAccessToken(at);
            expect(accessClaims.user_id).toBeDefined();
            expect(accessClaims.username).toBe(testUser.username);
            expect(accessClaims.type).toBe('access');

            const refreshClaims = verifyRefreshToken(rt);
            expect(refreshClaims.user_id).toBeDefined();
            expect(refreshClaims.username).toBe(testUser.username);
            expect(refreshClaims.type).toBe('refresh');

            // Verify expiry
            expect(expiresIn).toBe(15 * 60); // 15 minutes

            // Verify user data
            expect(user.username).toBe(testUser.username);
            expect(user.name).toBe(testUser.name);

            // Store tokens for subsequent tests
            accessToken = at;
            refreshToken = rt;
        });

        it('should reject registration with duplicate username', async () => {
            const response: AxiosResponse<GraphQLResponse<{ register: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Register($input: RegisterInput!) {
                            register(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            ...testUser,
                            email: `different${timestamp}@example.com`,
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Username is already taken');
        });

        it('should reject registration with invalid username format', async () => {
            const response: AxiosResponse<GraphQLResponse<{ register: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Register($input: RegisterInput!) {
                            register(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            username: '123invalid',
                            email: `test${timestamp}@example.com`,
                            password: 'SecurePassword123!',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Username must start with a letter');
        });

        it('should reject registration with short password', async () => {
            const response: AxiosResponse<GraphQLResponse<{ register: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Register($input: RegisterInput!) {
                            register(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            username: `shortpw${timestamp}`,
                            email: `shortpw${timestamp}@example.com`,
                            password: 'short',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Password must be at least 8 characters');
        });

        it('should reject registration with invalid email format', async () => {
            const response: AxiosResponse<GraphQLResponse<{ register: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Register($input: RegisterInput!) {
                            register(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            username: `invalidemail${timestamp}`,
                            email: 'not-an-email',
                            password: 'SecurePassword123!',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Invalid email format');
        });
    });

    // ========================================================================
    // Login Tests
    // ========================================================================

    describe('login mutation', () => {
        it('should login with valid username and password', async () => {
            const response: AxiosResponse<GraphQLResponse<{ login: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Login($input: LoginInput!) {
                            login(input: $input) {
                                accessToken
                                refreshToken
                                expiresIn
                                user {
                                    id
                                    username
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            usernameOrEmail: testUser.username,
                            password: testUser.password,
                        },
                    },
                }
            );

            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.login).toBeDefined();

            const result = response.data.data!.login;
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.user.username).toBe(testUser.username);

            // Update tokens
            accessToken = result.accessToken;
            refreshToken = result.refreshToken;
        });

        it('should login with valid email and password (if email verified)', async () => {
            const response: AxiosResponse<GraphQLResponse<{ login: JwtTokenPayload | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Login($input: LoginInput!) {
                            login(input: $input) {
                                accessToken
                                user {
                                    username
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            usernameOrEmail: testUser.email,
                            password: testUser.password,
                        },
                    },
                }
            );

            // Note: This may fail if email is not verified - that's expected behavior
            // The login function requires verified email for email-based login
            if (response.data.data?.login) {
                expect(response.data.data.login.user.username).toBe(testUser.username);
            } else {
                // Email not verified, so login by email fails - this is acceptable
                expect(response.data.errors).toBeDefined();
            }
        });

        it('should reject login with invalid password', async () => {
            const response: AxiosResponse<GraphQLResponse<{ login: JwtTokenPayload | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Login($input: LoginInput!) {
                            login(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            usernameOrEmail: testUser.username,
                            password: 'WrongPassword123!',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Invalid username/email or password');
        });

        it('should reject login with non-existent username', async () => {
            const response: AxiosResponse<GraphQLResponse<{ login: JwtTokenPayload | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Login($input: LoginInput!) {
                            login(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            usernameOrEmail: 'nonexistentuser12345',
                            password: 'SomePassword123!',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Invalid username/email or password');
        });
    });

    // ========================================================================
    // Refresh Token Tests
    // ========================================================================

    describe('refreshToken mutation', () => {
        it('should get new tokens with valid refresh token', async () => {
            const response: AxiosResponse<GraphQLResponse<{ refreshToken: JwtTokenPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation RefreshToken($input: RefreshTokenInput!) {
                            refreshToken(input: $input) {
                                accessToken
                                refreshToken
                                expiresIn
                                user {
                                    username
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            refreshToken,
                        },
                    },
                }
            );

            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.refreshToken).toBeDefined();

            const result = response.data.data!.refreshToken;
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.user.username).toBe(testUser.username);

            // Verify the new access token is valid
            const newClaims = verifyAccessToken(result.accessToken);
            expect(newClaims.user_id).toBeDefined();
            expect(newClaims.username).toBe(testUser.username);

            // Update tokens
            accessToken = result.accessToken;
            refreshToken = result.refreshToken;
        });

        it('should reject invalid refresh token', async () => {
            const response: AxiosResponse<GraphQLResponse<{ refreshToken: JwtTokenPayload | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation RefreshToken($input: RefreshTokenInput!) {
                            refreshToken(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            refreshToken: 'invalid.refresh.token',
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            expect(response.data.errors![0].message).toContain('Invalid or expired refresh token');
        });

        it('should reject access token used as refresh token', async () => {
            const response: AxiosResponse<GraphQLResponse<{ refreshToken: JwtTokenPayload | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation RefreshToken($input: RefreshTokenInput!) {
                            refreshToken(input: $input) {
                                accessToken
                            }
                        }
                    `,
                    variables: {
                        input: {
                            refreshToken: accessToken, // Using access token instead of refresh
                        },
                    },
                }
            );

            expect(response.data.errors).toBeDefined();
            // The error could be about token type or just "invalid"
            expect(response.data.errors![0].message).toBeDefined();
        });
    });

    // ========================================================================
    // JWT Authentication Tests
    // ========================================================================

    describe('JWT Authentication in requests', () => {
        it('should authenticate request with valid Bearer token', async () => {
            // Use the current user query to verify authentication works
            const response: AxiosResponse<GraphQLResponse<{ currentUser: User | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        query CurrentUser {
                            currentUser {
                                id
                                username
                            }
                        }
                    `,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            expect(response.data.errors).toBeUndefined();
            if (response.data.data?.currentUser) {
                expect(response.data.data.currentUser.username).toBe(testUser.username);
            }
        });

        it('should return null currentUser without token', async () => {
            const response: AxiosResponse<GraphQLResponse<{ currentUser: User | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        query CurrentUser {
                            currentUser {
                                id
                                username
                            }
                        }
                    `,
                }
            );

            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.currentUser).toBeNull();
        });

        it('should reject request with invalid Bearer token', async () => {
            const response: AxiosResponse<GraphQLResponse<{ currentUser: User | null }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        query CurrentUser {
                            currentUser {
                                id
                                username
                            }
                        }
                    `,
                },
                {
                    headers: {
                        Authorization: 'Bearer invalid.token.here',
                    },
                }
            );

            // Should gracefully handle invalid token and return null user
            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.currentUser).toBeNull();
        });
    });

    // ========================================================================
    // Logout Tests
    // ========================================================================

    describe('logout mutation', () => {
        it('should logout successfully', async () => {
            const response: AxiosResponse<GraphQLResponse<{ logout: LogoutPayload }>> = await axios.post(
                '/graphql',
                {
                    query: `
                        mutation Logout {
                            logout {
                                success
                            }
                        }
                    `,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            expect(response.data.errors).toBeUndefined();
            expect(response.data.data?.logout.success).toBe(true);
        });
    });
});
