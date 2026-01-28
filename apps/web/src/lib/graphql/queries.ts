/**
 * GraphQL Queries
 */

import { gql } from '@apollo/client';

// ============ User Queries ============
export const CURRENT_USER = gql`
    query CurrentUser {
        currentUser {
            id
            username
            name
            avatarUrl
            createdAt
        }
    }
`;

// ============ Forum Queries ============
export const GET_FORUMS = gql`
    query GetForums($first: Int, $after: Cursor) {
        forums(first: $first, after: $after, orderBy: [ID_DESC]) {
            nodes {
                id
                name
                slug
                description
                createdAt
            }
            pageInfo {
                hasNextPage
                endCursor
            }
            totalCount
        }
    }
`;

export const GET_FORUM = gql`
    query GetForum($slug: String!) {
        forumBySlug(slug: $slug) {
            id
            name
            slug
            description
            createdAt
            topics(first: 20, orderBy: [ID_DESC]) {
                nodes {
                    id
                    title
                    body
                    createdAt
                    author {
                        id
                        username
                        name
                        avatarUrl
                    }
                    posts(first: 1) {
                        totalCount
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
                totalCount
            }
        }
    }
`;

// ============ Topic Queries ============
export const GET_TOPIC = gql`
    query GetTopic($id: Int!) {
        topic(id: $id) {
            id
            title
            body
            createdAt
            author {
                id
                username
                name
                avatarUrl
            }
            forum {
                id
                name
                slug
            }
            posts(orderBy: [ID_ASC]) {
                nodes {
                    id
                    body
                    createdAt
                    author {
                        id
                        username
                        name
                        avatarUrl
                    }
                }
                totalCount
            }
        }
    }
`;
