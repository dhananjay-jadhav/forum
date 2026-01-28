/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 */

import { useMutation, useQuery } from '@apollo/client';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { apolloClient } from '../lib/apollo-client';
import { LOGIN, LOGOUT, REGISTER } from '../lib/graphql/mutations';
import { CURRENT_USER } from '../lib/graphql/queries';

export interface User {
    id: number;
    username: string;
    name?: string;
    avatarUrl?: string;
}

// GraphQL response types
interface CurrentUserData {
    currentUser: User | null;
}

interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: User;
}

interface LoginData {
    login: AuthPayload;
}

interface RegisterData {
    register: AuthPayload;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string,
        name?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Query current user
    const { data: currentUserData, loading: currentUserLoading, error: currentUserError } = useQuery<CurrentUserData>(
        CURRENT_USER,
        {
            skip: !localStorage.getItem('accessToken'),
        }
    );

    // Handle query error
    useEffect(() => {
        if (currentUserError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    }, [currentUserError]);

    // Mutations
    const [loginMutation] = useMutation<LoginData>(LOGIN);
    const [registerMutation] = useMutation<RegisterData>(REGISTER);
    const [logoutMutation] = useMutation(LOGOUT);

    // Update user when currentUser data changes
    useEffect(() => {
        if (currentUserData?.currentUser) {
            setUser(currentUserData.currentUser);
        }
        setIsLoading(currentUserLoading);
    }, [currentUserData, currentUserLoading]);

    // Check for token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(
        async (usernameOrEmail: string, password: string) => {
            const { data } = await loginMutation({
                variables: {
                    input: { usernameOrEmail, password },
                },
            });

            if (data?.login) {
                localStorage.setItem('accessToken', data.login.accessToken);
                localStorage.setItem('refreshToken', data.login.refreshToken);
                setUser(data.login.user);
            }
        },
        [loginMutation]
    );

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string,
            name?: string
        ) => {
            const { data } = await registerMutation({
                variables: {
                    input: { username, email, password, name },
                },
            });

            if (data?.register) {
                localStorage.setItem('accessToken', data.register.accessToken);
                localStorage.setItem(
                    'refreshToken',
                    data.register.refreshToken
                );
                setUser(data.register.user);
            }
        },
        [registerMutation]
    );

    const logout = useCallback(async () => {
        try {
            await logoutMutation();
        } catch {
            // Continue with logout even if server call fails
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        await apolloClient.resetStore();
    }, [logoutMutation]);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }),
        [user, isLoading, login, register, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
