/**
 * Apollo Client Configuration
 */

import {
    ApolloClient,
    ApolloLink,
    from,
    HttpLink,
    InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql';

// Auth link to add JWT token to requests
const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('accessToken');

    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : '',
        },
    });

    return forward(operation);
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        for (const error of graphQLErrors) {
            console.error(
                `[GraphQL error]: Message: ${error.message}, Location: ${JSON.stringify(error.locations)}, Path: ${error.path}`
            );
        }

        // Check for unauthorized error and redirect to login
        const unauthorizedError = graphQLErrors.find(
            (error) =>
                error.message.toLowerCase().includes('unauthorized') ||
                error.message.toLowerCase().includes('not authenticated')
        );

        if (unauthorizedError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            globalThis.location.href = '/login';
        }
    }

    if (networkError) {
        console.error('[Network error]:', networkError);
    }
});

// HTTP link
const httpLink = new HttpLink({
    uri: API_URL,
    credentials: 'include',
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    forums: {
                        keyArgs: false,
                        merge(existing, incoming) {
                            return incoming;
                        },
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});
