/**
 * Home Page - Forum Listing
 */

import { useQuery } from '@apollo/client';
import { JSX } from 'react';
import { Link } from 'react-router-dom';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { GET_FORUMS } from '../../lib/graphql/queries';
import styles from './Home.module.css';

interface Forum {
    id: string;
    name: string;
    description: string;
    slug: string;
    createdAt: string;
    topicsCount?: number;
}

interface ForumsData {
    forums: {
        nodes: Forum[];
    };
}

export function HomePage(): JSX.Element {
    const { data, loading, error } = useQuery<ForumsData>(GET_FORUMS);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error loading forums</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const forums = data?.forums?.nodes || [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Forums</h1>
                <p>Browse discussions across all our communities</p>
            </div>

            {forums.length === 0 ? (
                <div className={styles.empty}>
                    <h2>No forums yet</h2>
                    <p>Be the first to create a forum!</p>
                </div>
            ) : (
                <div className={styles.forumList}>
                    {forums.map((forum: Forum) => (
                        <Link
                            key={forum.id}
                            to={`/forum/${forum.slug}`}
                            className={styles.forumCard}
                        >
                            <div className={styles.forumIcon}>
                                {forum.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.forumContent}>
                                <h3>{forum.name}</h3>
                                <p>{forum.description}</p>
                                {forum.topicsCount !== undefined && (
                                    <span className={styles.topicsCount}>
                                        {forum.topicsCount} topics
                                    </span>
                                )}
                            </div>
                            <div className={styles.arrow}>→</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
