/**
 * Topic Page - Single Topic with Posts
 */

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, JSX, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { CREATE_POST } from '../../lib/graphql/mutations';
import { GET_TOPIC } from '../../lib/graphql/queries';
import styles from './Topic.module.css';

interface Post {
    id: string;
    body: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        name: string;
    };
}

interface Topic {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        name: string;
    };
    forum: {
        id: string;
        name: string;
        slug: string;
    };
    posts: {
        nodes: Post[];
    };
}

interface TopicData {
    topic: Topic | null;
}

export function TopicPage(): JSX.Element {
    const { topicId } = useParams<{
        forumSlug: string;
        topicId: string;
    }>();
    const { isAuthenticated } = useAuth();
    const [replyBody, setReplyBody] = useState('');
    const [error, setError] = useState('');

    const { data, loading, error: queryError } = useQuery<TopicData>(
        GET_TOPIC,
        {
            variables: { id: topicId ? parseInt(topicId, 10) : 0 },
            skip: !topicId,
        }
    );

    const [createPost, { loading: posting }] = useMutation(CREATE_POST, {
        refetchQueries: [{ query: GET_TOPIC, variables: { id: topicId ? parseInt(topicId, 10) : 0 } }],
    });

    const handleSubmitReply = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!replyBody.trim()) {
            setError('Reply cannot be empty');
            return;
        }

        try {
            await createPost({
                variables: {
                    input: {
                        post: {
                            topicId: data?.topic?.id,
                            body: replyBody,
                        },
                    },
                },
            });
            setReplyBody('');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to post reply'
            );
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (queryError || !data?.topic) {
        return (
            <div className={styles.error}>
                <h2>Topic not found</h2>
                <p>The topic you're looking for doesn't exist.</p>
                <Link to="/" className={styles.backLink}>
                    ← Back to forums
                </Link>
            </div>
        );
    }

    const topic = data.topic;
    const posts = topic.posts?.nodes || [];

    return (
        <div className={styles.container}>
            <nav className={styles.breadcrumb}>
                <Link to="/">Forums</Link>
                <span className={styles.separator}>/</span>
                <Link to={`/forum/${topic.forum.slug}`}>{topic.forum.name}</Link>
                <span className={styles.separator}>/</span>
                <span>{topic.title}</span>
            </nav>

            <div className={styles.topicHeader}>
                <h1>{topic.title}</h1>
                <div className={styles.topicMeta}>
                    Started by <strong>{topic.author?.name || topic.author?.username}</strong>
                    {' • '}
                    {new Date(topic.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Original Post */}
            <div className={styles.originalPost}>
                <div className={styles.postAuthor}>
                    <div className={styles.avatar}>
                        {(topic.author?.name || topic.author?.username || 'U')
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                    <div>
                        <div className={styles.authorName}>
                            {topic.author?.name || topic.author?.username}
                        </div>
                        <div className={styles.postDate}>
                            {new Date(topic.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className={styles.postBody}>{topic.body}</div>
            </div>

            {/* Replies */}
            <div className={styles.repliesSection}>
                <h2>{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h2>
                
                {posts.map((post: Post) => (
                    <div key={post.id} className={styles.reply}>
                        <div className={styles.postAuthor}>
                            <div className={styles.avatar}>
                                {(post.author?.name || post.author?.username || 'U')
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <div className={styles.authorName}>
                                    {post.author?.name || post.author?.username}
                                </div>
                                <div className={styles.postDate}>
                                    {new Date(post.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.postBody}>{post.body}</div>
                    </div>
                ))}
            </div>

            {/* Reply Form */}
            {isAuthenticated ? (
                <div className={styles.replyForm}>
                    <h3>Post a Reply</h3>
                    {error && <div className={styles.formError}>{error}</div>}
                    <form onSubmit={handleSubmitReply}>
                        <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Write your reply..."
                            required
                            disabled={posting}
                            rows={4}
                        />
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={posting}
                        >
                            {posting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className={styles.loginPrompt}>
                    <Link to="/login">Log in</Link> or{' '}
                    <Link to="/register">sign up</Link> to reply to this topic.
                </div>
            )}
        </div>
    );
}
