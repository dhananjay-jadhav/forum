/**
 * Forum Page - Single Forum with Topics
 */

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, JSX, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { CREATE_TOPIC } from '../../lib/graphql/mutations';
import { GET_FORUM, GET_FORUMS } from '../../lib/graphql/queries';
import styles from './Forum.module.css';

interface Topic {
    id: string;
    title: string;
    createdAt: string;
    author: {
        username: string;
        name: string;
    };
    postsCount?: number;
}

interface Forum {
    id: string;
    name: string;
    description: string;
    slug: string;
    topics: {
        nodes: Topic[];
    };
}

interface ForumData {
    forumBySlug: Forum | null;
}

export function ForumPage(): JSX.Element {
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated } = useAuth();
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');

    const { data, loading, error: queryError } = useQuery<ForumData>(
        GET_FORUM,
        {
            variables: { slug },
            skip: !slug,
        }
    );

    const [createTopic, { loading: creating }] = useMutation(CREATE_TOPIC, {
        refetchQueries: [{ query: GET_FORUM, variables: { slug } }, { query: GET_FORUMS }],
    });

    const handleCreateTopic = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !body.trim()) {
            setError('Title and body are required');
            return;
        }

        try {
            await createTopic({
                variables: {
                    input: {
                        topic: {
                            forumId: data?.forumBySlug?.id,
                            title,
                            body,
                        },
                    },
                },
            });
            setTitle('');
            setBody('');
            setShowNewTopic(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create topic'
            );
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (queryError || !data?.forumBySlug) {
        return (
            <div className={styles.error}>
                <h2>Forum not found</h2>
                <p>The forum you're looking for doesn't exist.</p>
                <Link to="/" className={styles.backLink}>
                    ← Back to forums
                </Link>
            </div>
        );
    }

    const forum = data.forumBySlug;
    const topics = forum.topics?.nodes || [];

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.breadcrumb}>
                ← All Forums
            </Link>

            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>{forum.name}</h1>
                    <p>{forum.description}</p>
                </div>
                {isAuthenticated && (
                    <button
                        onClick={() => setShowNewTopic(!showNewTopic)}
                        className={styles.newTopicBtn}
                    >
                        {showNewTopic ? 'Cancel' : '+ New Topic'}
                    </button>
                )}
            </div>

            {showNewTopic && (
                <div className={styles.newTopicForm}>
                    <h3>Create New Topic</h3>
                    {error && <div className={styles.formError}>{error}</div>}
                    <form onSubmit={handleCreateTopic}>
                        <div className={styles.field}>
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter topic title"
                                required
                                disabled={creating}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="body">Content</label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write your topic content..."
                                required
                                disabled={creating}
                                rows={5}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create Topic'}
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.topicList}>
                <h2>Topics</h2>
                {topics.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No topics yet. Be the first to start a discussion!</p>
                    </div>
                ) : (
                    topics.map((topic: Topic) => (
                        <Link
                            key={topic.id}
                            to={`/forum/${slug}/topic/${topic.id}`}
                            className={styles.topicCard}
                        >
                            <div className={styles.topicContent}>
                                <h3>{topic.title}</h3>
                                <span className={styles.topicMeta}>
                                    by {topic.author?.name || topic.author?.username} •{' '}
                                    {new Date(topic.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className={styles.arrow}>→</div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
