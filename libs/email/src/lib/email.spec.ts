/**
 * @app/email - Unit Tests
 *
 * Unit tests for email functionality including templates, config, and sending.
 */

import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendTopicReplyNotification,
} from './email.js';
import { getEmailConfig } from './config.js';
import {
    verificationEmailTemplate,
    passwordResetTemplate,
    welcomeEmailTemplate,
    topicReplyTemplate,
} from './templates.js';
import * as sender from './sender.js';
import type { EmailConfig } from './types.js';

jest.mock('./sender.js');

describe('@app/email', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (sender.sendEmail as jest.Mock).mockResolvedValue({ success: true });
    });

    describe('getEmailConfig', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            process.env = originalEnv;
        });

        it('should return config from environment variables', async () => {
            process.env['SMTP_HOST'] = 'smtp.test.com';
            process.env['SMTP_PORT'] = '587';
            process.env['SMTP_USER'] = 'user@test.com';
            process.env['SMTP_PASS'] = 'password123';
            process.env['SMTP_FROM'] = 'noreply@test.com';
            process.env['APP_NAME'] = 'Test App';

            // Mock @app/utils to return our test env values
            jest.doMock('@app/utils', () => ({
                env: {
                    SMTP_HOST: 'smtp.test.com',
                    SMTP_PORT: 587,
                    SMTP_SECURE: false,
                    SMTP_USER: 'user@test.com',
                    SMTP_PASS: 'password123',
                    SMTP_FROM: 'noreply@test.com',
                    APP_NAME: 'Test App',
                    APP_URL: 'http://localhost:3000',
                },
                logger: { info: jest.fn(), error: jest.fn() },
            }));

            const { getEmailConfig } = await import('./config.js');
            const config = getEmailConfig();

            expect(config.host).toBe('smtp.test.com');
            expect(config.port).toBe(587);
            expect(config.from).toBe('noreply@test.com');
            expect(config.appName).toBe('Test App');
        });

        it('should return default config when env vars are not set', async () => {
            // Mock @app/utils with default/empty values
            jest.doMock('@app/utils', () => ({
                env: {
                    SMTP_HOST: '',
                    SMTP_PORT: 1025,
                    SMTP_SECURE: false,
                    SMTP_USER: '',
                    SMTP_PASS: '',
                    SMTP_FROM: 'noreply@forum.local',
                    APP_NAME: 'Forum',
                    APP_URL: 'http://localhost:3000',
                },
                logger: { info: jest.fn(), error: jest.fn() },
            }));

            const { getEmailConfig } = await import('./config.js');
            const config = getEmailConfig();

            expect(config.host).toBe('localhost');
            expect(config.port).toBe(1025);
        });
    });

    describe('Email Templates', () => {
        const mockConfig: EmailConfig = {
            host: 'localhost',
            port: 1025,
            secure: false,
            from: 'noreply@test.com',
            appUrl: 'http://localhost:3000',
            appName: 'TestForum',
        };

        describe('verificationEmailTemplate', () => {
            it('should generate verification email with link', () => {
                const template = verificationEmailTemplate(
                    'test@example.com',
                    'http://localhost:3000/verify?token=abc123',
                    mockConfig
                );

                expect(template.subject).toContain('Verify your email address');
                expect(template.subject).toContain('TestForum');
                expect(template.html).toContain('abc123');
                expect(template.html).toContain('test@example.com');
                expect(template.text).toContain('abc123');
            });
        });

        describe('passwordResetTemplate', () => {
            it('should generate password reset email', () => {
                const template = passwordResetTemplate(
                    'user@test.com',
                    'http://localhost:3000/reset?token=token456',
                    mockConfig
                );

                expect(template.subject).toContain('Reset your password');
                expect(template.subject).toContain('TestForum');
                expect(template.html).toContain('token456');
                expect(template.html).toContain('user@test.com');
            });
        });

        describe('welcomeEmailTemplate', () => {
            it('should generate welcome email with user info', () => {
                const template = welcomeEmailTemplate('newuser', 'New User', mockConfig);

                expect(template.subject).toBe('Welcome to TestForum!');
                expect(template.html).toContain('New User');
                expect(template.text).toContain('New User');
            });

            it('should use username when name is undefined', () => {
                const template = welcomeEmailTemplate('username', undefined, mockConfig);

                expect(template.html).toContain('username');
            });
        });

        describe('topicReplyTemplate', () => {
            it('should generate topic reply notification', () => {
                const template = topicReplyTemplate(
                    'Author Name',
                    'Great Discussion',
                    'Replier',
                    'This is a preview of the reply...',
                    'http://localhost:3000/topics/456',
                    mockConfig
                );

                expect(template.subject).toContain('New reply to "Great Discussion"');
                expect(template.subject).toContain('TestForum');
                expect(template.html).toContain('Great Discussion');
                expect(template.html).toContain('Replier');
                expect(template.html).toContain('Author Name');
                expect(template.html).toContain('/topics/456');
            });
        });
    });

    describe('Email Sending Functions', () => {
        describe('sendVerificationEmail', () => {
            it('should send verification email', async () => {
                await sendVerificationEmail('user@test.com', 'token123');

                expect(sender.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: 'user@test.com',
                        subject: expect.stringContaining('Verify your email address'),
                    })
                );
            });
        });

        describe('sendPasswordResetEmail', () => {
            it('should send password reset email', async () => {
                await sendPasswordResetEmail('user@test.com', 42, 'resetToken');

                expect(sender.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: 'user@test.com',
                        subject: expect.stringContaining('Reset your password'),
                    })
                );
            });
        });

        describe('sendWelcomeEmail', () => {
            it('should send welcome email', async () => {
                await sendWelcomeEmail('new@test.com', 'newuser', 'New User');

                expect(sender.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: 'new@test.com',
                        subject: expect.stringContaining('Welcome to'),
                    })
                );
            });
        });

        describe('sendTopicReplyNotification', () => {
            it('should send topic reply notification', async () => {
                await sendTopicReplyNotification(
                    'author@test.com',
                    'Author Name',
                    123,
                    'Topic Title',
                    'Replier',
                    'Reply preview...'
                );

                expect(sender.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: 'author@test.com',
                        subject: expect.stringContaining('New reply to'),
                    })
                );
            });
        });

        describe('error handling', () => {
            it('should handle email send failure', async () => {
                (sender.sendEmail as jest.Mock).mockRejectedValue(
                    new Error('SMTP connection failed')
                );

                await expect(sendVerificationEmail('bad@test.com', 'token')).rejects.toThrow(
                    'SMTP connection failed'
                );
            });
        });
    });
});
