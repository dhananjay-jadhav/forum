/**
 * Login Page
 */

import { FormEvent, JSX, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';

export function LoginPage(): JSX.Element {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(usernameOrEmail, password);
            await navigate('/');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to your account</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="usernameOrEmail">
                            Username or Email
                        </label>
                        <input
                            id="usernameOrEmail"
                            type="text"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            placeholder="Enter username or email"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    Don't have an account?{' '}
                    <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
