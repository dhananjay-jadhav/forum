/**
 * @app/moderation - Spam Detection
 *
 * Basic spam and content filtering functionality.
 */

import type { ModerationIssue, SpamConfig } from './types.js';

/**
 * Default spam detection configuration
 */
export const defaultSpamConfig: SpamConfig = {
    blockedPatterns: [
        // Common spam patterns
        /\b(buy now|click here|free money|act now|limited time)\b/gi,
        // Excessive caps (more than 70% caps in a word of 5+ chars)
        /\b[A-Z]{5,}\b/g,
        // Common spam domains (simplified)
        /\b(bit\.ly|tinyurl|goo\.gl)\/\w+/gi,
    ],
    maxUrls: 3,
    minLength: 10,
    maxLength: 50000,
    checkRepeatedChars: true,
    minAccountAgeHours: 0, // No restriction by default
};

/**
 * Count URLs in text
 */
function countUrls(text: string): number {
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const matches = text.match(urlPattern);
    return matches ? matches.length : 0;
}

/**
 * Check for excessive repeated characters
 */
function hasExcessiveRepeats(text: string): boolean {
    // Check for 5+ of the same character in a row
    return /(.)\1{4,}/g.test(text);
}

/**
 * Check for all caps text
 */
function hasExcessiveCaps(text: string): boolean {
    const words = text.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return false;
    
    const capsWords = words.filter(w => w === w.toUpperCase() && /[A-Z]/.test(w));
    return capsWords.length / words.length > 0.5;
}

/**
 * Detect spam patterns in content
 */
export function detectSpam(text: string, config: SpamConfig = defaultSpamConfig): ModerationIssue[] {
    const issues: ModerationIssue[] = [];

    // Check length constraints
    if (text.length < config.minLength) {
        issues.push({
            type: 'spam',
            severity: 0.3,
            description: `Content is too short (minimum ${config.minLength} characters)`,
        });
    }

    if (text.length > config.maxLength) {
        issues.push({
            type: 'spam',
            severity: 0.5,
            description: `Content is too long (maximum ${config.maxLength} characters)`,
        });
    }

    // Check for blocked patterns
    for (const pattern of config.blockedPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            issues.push({
                type: 'spam',
                severity: 0.7,
                description: 'Content contains suspicious patterns',
                matches: [...new Set(matches)].slice(0, 5),
            });
            break; // One pattern match is enough
        }
    }

    // Check URL count
    const urlCount = countUrls(text);
    if (urlCount > config.maxUrls) {
        issues.push({
            type: 'spam',
            severity: 0.6,
            description: `Too many URLs (${urlCount} found, maximum ${config.maxUrls})`,
        });
    }

    // Check for repeated characters
    if (config.checkRepeatedChars && hasExcessiveRepeats(text)) {
        issues.push({
            type: 'spam',
            severity: 0.4,
            description: 'Content contains excessive repeated characters',
        });
    }

    // Check for all caps
    if (hasExcessiveCaps(text)) {
        issues.push({
            type: 'spam',
            severity: 0.3,
            description: 'Content has excessive capitalization',
        });
    }

    return issues;
}

/**
 * Quick spam check - returns true if content is likely spam
 */
export function isLikelySpam(text: string, config: SpamConfig = defaultSpamConfig): boolean {
    const issues = detectSpam(text, config);
    
    // Calculate total severity
    const totalSeverity = issues.reduce((sum, issue) => sum + issue.severity, 0);
    
    // If total severity is above threshold, it's likely spam
    return totalSeverity >= 0.7;
}
