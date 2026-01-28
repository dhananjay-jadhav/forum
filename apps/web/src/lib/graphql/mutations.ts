/**
 * GraphQL Mutations
 */

import { gql } from '@apollo/client';

// ============ Auth Mutations ============
export const LOGIN = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            accessToken
            refreshToken
            user {
                id
                username
                name
                avatarUrl
            }
        }
    }
`;

export const REGISTER = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            accessToken
            refreshToken
            user {
                id
                username
                name
                avatarUrl
            }
        }
    }
`;

export const LOGOUT = gql`
    mutation Logout {
        logout {
            success
        }
    }
`;

export const REFRESH_TOKEN = gql`
    mutation RefreshToken($input: RefreshTokenInput!) {
        refreshToken(input: $input) {
            accessToken
            refreshToken
            user {
                id
                username
                name
                avatarUrl
            }
        }
    }
`;

// ============ Forum Mutations ============
export const CREATE_FORUM = gql`
    mutation CreateForum($input: CreateForumInput!) {
        createForum(input: $input) {
            forum {
                id
                name
                slug
                description
            }
        }
    }
`;

// ============ Topic Mutations ============
export const CREATE_TOPIC = gql`
    mutation CreateTopic($input: CreateTopicInput!) {
        createTopic(input: $input) {
            topic {
                id
                title
                body
                forum {
                    id
                    slug
                }
            }
        }
    }
`;

// ============ Post Mutations ============
export const CREATE_POST = gql`
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            post {
                id
                body
                createdAt
                author {
                    id
                    username
                    avatarUrl
                }
            }
        }
    }
`;
