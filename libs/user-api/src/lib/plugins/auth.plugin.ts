import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import type { QueryResult, QueryResultRow } from 'pg';

import { generateTokens, JwtTokenResponse, verifyRefreshToken } from '../auth/index.js';

// Type definitions for PostGraphile context and SQL utilities
interface PgClient {
    query<T extends QueryResultRow>(sql: { text: string; values?: unknown[] }): Promise<QueryResult<T>>;
}

interface SqlHelper {
    query: (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
    value: (val: unknown) => unknown;
    compile: (query: unknown) => { text: string; values?: unknown[] };
}

interface ResolverContext {
    pgClient: PgClient;
}

interface LoginInput {
    usernameOrEmail: string;
    password: string;
}

interface RegisterInput {
    username: string;
    email: string;
    password: string;
    name?: string;
}

interface RefreshTokenInput {
    refreshToken: string;
}

interface UserRow {
    id: number;
    username: string;
}

interface UserEmailRow {
    user_id: number;
}

interface JwtTokenPayload {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserRow;
}

interface LogoutPayload {
    success: boolean;
}

/**
 * Authentication mutations plugin for PostGraphile.
 * 
 * Provides GraphQL mutations for:
 * - login: Authenticate with username/email and password
 * - register: Create a new user account with email and password
 * - refreshToken: Get new access token using refresh token
 * - logout: Invalidate the current session (client-side)
 * 
 * Uses database functions:
 * - app_private.login(username, password) -> user
 * - app_private.really_create_user(username, email, email_is_verified, name, avatar_url, password) -> user
 */
export const AuthenticationPlugin = makeExtendSchemaPlugin((build) => {
    // Get the SQL helper from build
    const { pgSql: sql } = build;

    return {
        typeDefs: gql`
            """
            JWT token response containing access and refresh tokens.
            """
            type JwtTokenPayload {
                "JWT access token for API authentication"
                accessToken: String!
                "JWT refresh token for getting new access tokens"
                refreshToken: String!
                "Access token expiration time in seconds"
                expiresIn: Int!
                "The authenticated user"
                user: User!
            }

            """
            Input for the login mutation.
            """
            input LoginInput {
                "Username or email address"
                usernameOrEmail: String!
                "Password"
                password: String!
            }

            """
            Input for the register mutation.
            """
            input RegisterInput {
                "Unique username (3-50 characters, alphanumeric with underscores)"
                username: String!
                "Email address"
                email: String!
                "Password (minimum 8 characters)"
                password: String!
                "Display name (optional)"
                name: String
            }

            """
            Input for the refreshToken mutation.
            """
            input RefreshTokenInput {
                "Valid refresh token"
                refreshToken: String!
            }

            """
            Payload for logout mutation.
            """
            type LogoutPayload {
                "Whether the logout was successful"
                success: Boolean!
            }

            extend type Mutation {
                """
                Authenticate a user with username/email and password.
                Returns JWT tokens on success.
                """
                login(input: LoginInput!): JwtTokenPayload

                """
                Register a new user account.
                Returns JWT tokens on success.
                """
                register(input: RegisterInput!): JwtTokenPayload

                """
                Get a new access token using a valid refresh token.
                """
                refreshToken(input: RefreshTokenInput!): JwtTokenPayload

                """
                Logout the current user.
                Clients should discard their tokens after calling this.
                """
                logout: LogoutPayload
            }
        `,
        resolvers: {
            Mutation: {
                login: async (
                    _query: unknown,
                    args: { input: LoginInput },
                    context: ResolverContext
                ): Promise<JwtTokenPayload> => {
                    const { usernameOrEmail, password } = args.input;
                    const { pgClient } = context;

                    // Validate input
                    if (!usernameOrEmail || !password) {
                        throw new Error('Username/email and password are required');
                    }

                    // Call the database login function
                    const {
                        rows: [user],
                    } = await pgClient.query<UserRow>(
                        (sql as SqlHelper).compile(
                            (sql as SqlHelper).query`SELECT * FROM app_private.login(${(sql as SqlHelper).value(usernameOrEmail)}, ${(sql as SqlHelper).value(password)})`
                        )
                    );

                    // The function returns null (as a row with null id) when login fails
                    if (!user || !user.id) {
                        throw new Error('Invalid username/email or password');
                    }

                    // Generate JWT tokens
                    const tokens: JwtTokenResponse = generateTokens(user.id, user.username);

                    return {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                        user,
                    };
                },

                register: async (
                    _query: unknown,
                    args: { input: RegisterInput },
                    context: ResolverContext
                ): Promise<JwtTokenPayload> => {
                    const { username, email, password, name } = args.input;
                    const { pgClient } = context;

                    // Validate input
                    if (!username || !email || !password) {
                        throw new Error('Username, email, and password are required');
                    }

                    // Validate username format (matches database constraint)
                    const usernameRegex = /^[a-zA-Z]([a-zA-Z0-9]_?)+$/;
                    if (!usernameRegex.test(username)) {
                        throw new Error(
                            'Username must start with a letter, contain only letters, numbers, and underscores (not consecutive)'
                        );
                    }

                    if (username.length < 3 || username.length > 50) {
                        throw new Error('Username must be between 3 and 50 characters');
                    }

                    // Validate email format
                    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
                    if (!emailRegex.test(email)) {
                        throw new Error('Invalid email format');
                    }

                    // Validate password strength
                    if (password.length < 8) {
                        throw new Error('Password must be at least 8 characters');
                    }

                    // Validate name if provided
                    if (name && (name.length < 2 || name.length > 100)) {
                        throw new Error('Name must be between 2 and 100 characters');
                    }

                    // Check if username already exists
                    const {
                        rows: [existingUser],
                    } = await pgClient.query<UserRow>(
                        (sql as SqlHelper).compile(
                            (sql as SqlHelper).query`SELECT id FROM app_public.users WHERE username = ${(sql as SqlHelper).value(username)}`
                        )
                    );

                    if (existingUser) {
                        throw new Error('Username is already taken');
                    }

                    // Check if email already exists and is verified
                    const {
                        rows: [existingEmail],
                    } = await pgClient.query<UserEmailRow>(
                        (sql as SqlHelper).compile(
                            (sql as SqlHelper).query`SELECT user_id FROM app_public.user_emails WHERE email = ${(sql as SqlHelper).value(email)} AND is_verified = true`
                        )
                    );

                    if (existingEmail) {
                        throw new Error('Email is already registered');
                    }

                    // Create the user using the database function
                    const {
                        rows: [user],
                    } = await pgClient.query<UserRow>(
                        (sql as SqlHelper).compile(
                            (sql as SqlHelper).query`SELECT * FROM app_private.really_create_user(
                                ${(sql as SqlHelper).value(username)},
                                ${(sql as SqlHelper).value(email)},
                                ${(sql as SqlHelper).value(false)},
                                ${(sql as SqlHelper).value(name || null)},
                                ${(sql as SqlHelper).value(null)},
                                ${(sql as SqlHelper).value(password)}
                            )`
                        )
                    );

                    if (!user) {
                        throw new Error('Failed to create user');
                    }

                    // Generate JWT tokens
                    const tokens: JwtTokenResponse = generateTokens(user.id, user.username);

                    return {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                        user,
                    };
                },

                refreshToken: async (
                    _query: unknown,
                    args: { input: RefreshTokenInput },
                    context: ResolverContext
                ): Promise<JwtTokenPayload> => {
                    const { refreshToken } = args.input;
                    const { pgClient } = context;

                    if (!refreshToken) {
                        throw new Error('Refresh token is required');
                    }

                    // Verify the refresh token
                    let claims;
                    try {
                        claims = verifyRefreshToken(refreshToken);
                    } catch {
                        throw new Error('Invalid or expired refresh token');
                    }

                    // Fetch the current user to ensure they still exist and get fresh data
                    const {
                        rows: [user],
                    } = await pgClient.query<UserRow>(
                        (sql as SqlHelper).compile(
                            (sql as SqlHelper).query`SELECT * FROM app_public.users WHERE id = ${(sql as SqlHelper).value(claims.user_id)}`
                        )
                    );

                    if (!user) {
                        throw new Error('User not found');
                    }

                    // Generate new tokens
                    const tokens: JwtTokenResponse = generateTokens(user.id, user.username);

                    return {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                        user,
                    };
                },

                logout: (): LogoutPayload => {
                    // In a stateless JWT system, logout is primarily client-side
                    // The client should discard the tokens
                    // For additional security, you could implement token blacklisting here
                    return {
                        success: true,
                    };
                },
            },
        },
    };
});
