/**
 * @app/moderation - Unit Tests
 *
 * Unit tests for content moderation including spam detection and content filtering.
 */

import { detectSpam, isLikelySpam, defaultSpamConfig } from './spam.js';
import { filterContent, detectPII, sanitizeContent } from './filter.js';
import { analyzeContent, moderateContent, moderatePost, moderateTopic } from './service.js';
import { getPool } from '@app/database';

jest.mock('@app/database');

describe('@app/moderation', () => {
    describe('Spam Detection', () => {
        describe('defaultSpamConfig', () => {
            it('should have correct default thresholds', () => {
                expect(defaultSpamConfig.maxUrls).toBe(3);
                expect(defaultSpamConfig.minLength).toBe(10);
                expect(defaultSpamConfig.maxLength).toBe(50000);
                expect(defaultSpamConfig.blockedPatterns).toBeDefined();
                expect(defaultSpamConfig.blockedPatterns.length).toBeGreaterThan(0);
            });
        });

        describe('isLikelySpam', () => {
            it('should detect excessive links', () => {
                // More than maxUrls (3) should be flagged
                const content =
                    'Check out http://spam1.com http://spam2.com http://spam3.com http://spam4.com and more links combined with suspicious patterns buy now!';
                const result = isLikelySpam(content, defaultSpamConfig);
                expect(result).toBe(true);
            });

            it('should detect excessive uppercase', () => {
                const content = 'BUY NOW!!! AMAZING DEAL!!! LIMITED TIME!!!';
                const result = isLikelySpam(content, defaultSpamConfig);
                expect(result).toBe(true);
            });

            it('should detect suspicious patterns', () => {
                const content = 'Click here now for free money! Buy now! Limited time offer!';
                const result = isLikelySpam(content, defaultSpamConfig);
                expect(result).toBe(true);
            });

            it('should pass clean content', () => {
                const content = 'This is a normal forum post with useful information about programming.';
                const result = isLikelySpam(content, defaultSpamConfig);
                expect(result).toBe(false);
            });
        });

        describe('detectSpam', () => {
            it('should detect spam with detailed issues', () => {
                const content = 'BUY NOW!!! CLICK HERE!!! http://spam.com';
                const issues = detectSpam(content, defaultSpamConfig);

                expect(issues.length).toBeGreaterThan(0);
                expect(issues.some(i => i.type === 'spam')).toBe(true);
            });

            it('should not flag clean content', () => {
                const content = 'A helpful post about programming techniques and best practices.';
                const issues = detectSpam(content, defaultSpamConfig);

                // Clean content should have no or minimal issues
                const highSeverityIssues = issues.filter(i => i.severity >= 0.5);
                expect(highSeverityIssues).toHaveLength(0);
            });

            it('should detect content that is too short', () => {
                const content = 'Short';
                const issues = detectSpam(content, defaultSpamConfig);

                expect(issues.some(i => i.description.includes('too short'))).toBe(true);
            });
        });
    });

    describe('Content Filtering', () => {
        describe('detectPII', () => {
            it('should detect email addresses', () => {
                const content = 'Contact me at user@example.com for more info';
                const issues = detectPII(content);

                expect(issues.length).toBeGreaterThan(0);
                expect(issues.some(i => i.description.includes('email'))).toBe(true);
            });

            it('should detect phone numbers', () => {
                const content = 'Call me at 555-123-4567';
                const issues = detectPII(content);

                expect(issues.length).toBeGreaterThan(0);
                expect(issues.some(i => i.description.includes('phone'))).toBe(true);
            });

            it('should detect credit card patterns', () => {
                const content = 'My card number is 4111-1111-1111-1111';
                const issues = detectPII(content);

                expect(issues.length).toBeGreaterThan(0);
                expect(issues.some(i => i.description.includes('credit card'))).toBe(true);
            });

            it('should not detect PII in clean content', () => {
                const content = 'Just a normal discussion post without any personal info';
                const issues = detectPII(content);

                expect(issues).toHaveLength(0);
            });
        });

        describe('sanitizeContent', () => {
            it('should replace email addresses', () => {
                const content = 'Contact user@example.com for help';
                const sanitized = sanitizeContent(content);

                expect(sanitized).not.toContain('user@example.com');
                expect(sanitized).toContain('[email removed]');
            });

            it('should replace phone numbers', () => {
                const content = 'Call 555-123-4567 for support';
                const sanitized = sanitizeContent(content);

                expect(sanitized).not.toContain('555-123-4567');
                expect(sanitized).toContain('[phone removed]');
            });

            it('should replace credit card numbers', () => {
                const content = 'Card: 4111-1111-1111-1111';
                const sanitized = sanitizeContent(content);

                expect(sanitized).not.toContain('4111-1111-1111-1111');
                expect(sanitized).toContain('[card removed]');
            });
        });

        describe('filterContent', () => {
            it('should detect harassment content', () => {
                const content = 'I will find you and you should watch your back';
                const issues = filterContent(content);

                expect(issues.length).toBeGreaterThan(0);
                expect(issues.some(i => i.type === 'harassment')).toBe(true);
            });

            it('should pass clean content', () => {
                const content = 'A normal helpful post about technology';
                const issues = filterContent(content);

                expect(issues).toHaveLength(0);
            });
        });
    });

    describe('Moderation Service', () => {
        const mockQuery = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
            (getPool as jest.Mock).mockReturnValue({ query: mockQuery });
        });

        describe('analyzeContent', () => {
            it('should analyze content and return moderation result', () => {
                const content = 'BUY NOW!!! CLICK HERE!!! http://spam.com http://link2.com http://link3.com http://link4.com';
                const result = analyzeContent(content);

                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.recommendedAction).toBeDefined();
                expect(result.passed).toBeDefined();
                expect(result.confidence).toBeDefined();
            });

            it('should approve clean content', () => {
                const content = 'A thoughtful discussion post about software development best practices.';
                const result = analyzeContent(content);

                expect(result.passed).toBe(true);
                expect(result.recommendedAction).toBe('approve');
            });

            it('should flag content with high severity issues', () => {
                const content = 'I will find you and kill yourself kys';
                const result = analyzeContent(content);

                expect(result.passed).toBe(false);
                expect(['flag', 'reject']).toContain(result.recommendedAction);
            });
        });

        describe('moderateContent', () => {
            it('should moderate content and return result', async () => {
                const result = await moderateContent({
                    id: 1,
                    type: 'post',
                    text: 'Test content for moderation',
                    authorId: 10,
                });

                expect(result.passed).toBeDefined();
                expect(result.issues).toBeDefined();
                expect(result.recommendedAction).toBeDefined();
            });
        });

        describe('moderatePost', () => {
            it('should moderate post by ID', async () => {
                mockQuery.mockResolvedValue({
                    rows: [{ id: 1, body: 'Post content', author_id: 10, topic_id: 5, forum_id: 1 }],
                });

                const result = await moderatePost(1);

                expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [1]);
                expect(result.passed).toBeDefined();
            });

            it('should handle non-existent post', async () => {
                mockQuery.mockResolvedValue({ rows: [] });

                const result = await moderatePost(999);

                expect(result.passed).toBe(true);
                expect(result.issues).toHaveLength(0);
            });
        });

        describe('moderateTopic', () => {
            it('should moderate topic by ID', async () => {
                mockQuery.mockResolvedValue({
                    rows: [{ id: 1, title: 'Topic title', body: 'Topic body', author_id: 10, forum_id: 1 }],
                });

                const result = await moderateTopic(1);

                expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [1]);
                expect(result.passed).toBeDefined();
            });

            it('should handle non-existent topic', async () => {
                mockQuery.mockResolvedValue({ rows: [] });

                const result = await moderateTopic(999);

                expect(result.passed).toBe(true);
                expect(result.issues).toHaveLength(0);
            });
        });
    });
});
