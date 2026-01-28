/**
 * Main Layout Component
 */

import { JSX, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: Readonly<LayoutProps>): JSX.Element {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async (): Promise<void> => {
        await logout();
        await navigate('/');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.logo}>
                        📢 Forum
                    </Link>

                    <nav className={styles.nav}>
                        <Link to="/" className={styles.navLink}>
                            Forums
                        </Link>
                    </nav>

                    <div className={styles.authSection}>
                        {isAuthenticated ? (
                            <>
                                <span className={styles.username}>
                                    {user?.name || user?.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className={styles.logoutBtn}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={styles.authLink}>
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={styles.authLinkPrimary}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2026 Forum. Built with React & GraphQL.</p>
            </footer>
        </div>
    );
}
