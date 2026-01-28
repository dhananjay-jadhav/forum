/**
 * Main App Component with Routing
 */

import { ApolloProvider } from '@apollo/client';
import { Route, Routes } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { apolloClient } from '../lib/apollo-client';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForumPage } from '../pages/forum/ForumPage';
import { HomePage } from '../pages/home/HomePage';
import { TopicPage } from '../pages/topic/TopicPage';

export function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <AuthProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forum/:slug" element={<ForumPage />} />
                        <Route
                            path="/forum/:forumSlug/topic/:topicId"
                            element={<TopicPage />}
                        />
                    </Routes>
                </Layout>
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;
