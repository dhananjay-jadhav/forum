/**
 * @app/moderation - Content Filter
 *
 * Content filtering for offensive, inappropriate, or harmful content.
 */

import type { ModerationIssue, ModerationReason } from './types.js';

/**
 * Severity levels for different content categories
 */
interface FilterCategory {
    name: ModerationReason;
    patterns: RegExp[];
    severity: number;
}

/**
 * Content filter categories
 * Note: This is a simplified implementation. In production, you would use
 * a more sophisticated approach like ML-based content classification.
 */
const filterCategories: FilterCategory[] = [
    {
        name: 'offensive',
        patterns: [
            // Placeholder patterns - in production, use proper word lists
            /\b(placeholder_offensive_word)\b/gi,
        ],
        severity: 0.8,
    },
    {
        name: 'harassment',
        patterns: [
            // Patterns for harassment detection
            /\b(i will find you|you're dead|watch your back)\b/gi,
            /\b(kill yourself|kys)\b/gi,
        ],
        severity: 0.9,
    },
    {
        name: 'illegal',
        patterns: [
            // Patterns for potentially illegal content
            /\b(credit card (number|info|details))\b/gi,
            /\b(ssn|social security)\s*(number|#)?\s*\d/gi,
        ],
        severity: 1.0,
    },
];

/**
 * Check content against filter categories
 */
export function filterContent(text: string): ModerationIssue[] {
    const issues: ModerationIssue[] = [];

    for (const category of filterCategories) {
        for (const pattern of category.patterns) {
            const matches = text.match(pattern);
            if (matches) {
                issues.push({
                    type: category.name,
                    severity: category.severity,
                    description: `Content flagged for ${category.name} content`,
                    matches: ['[content hidden]'], // Don't expose matched words
                });
                break; // One match per category is enough
            }
        }
    }

    return issues;
}

/**
 * Check if content contains personally identifiable information (PII)
 */
export function detectPII(text: string): ModerationIssue[] {
    const issues: ModerationIssue[] = [];

    // Email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailPattern);
    if (emails && emails.length > 0) {
        issues.push({
            type: 'other',
            severity: 0.4,
            description: 'Content contains email addresses',
            matches: emails.map(e => e.replace(/(.{3}).*(@.*)/, '$1***$2')),
        });
    }

    // Phone numbers (simplified US format)
    const phonePattern = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    const phones = text.match(phonePattern);
    if (phones && phones.length > 0) {
        issues.push({
            type: 'other',
            severity: 0.5,
            description: 'Content contains phone numbers',
            matches: phones.map(() => '[phone number]'),
        });
    }

    // Credit card numbers (basic pattern)
    const ccPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    const cards = text.match(ccPattern);
    if (cards && cards.length > 0) {
        issues.push({
            type: 'illegal',
            severity: 0.9,
            description: 'Content may contain credit card numbers',
            matches: ['[card number detected]'],
        });
    }

    return issues;
}

/**
 * Sanitize content by removing/replacing flagged content
 */
export function sanitizeContent(text: string): string {
    let sanitized = text;

    // Replace email addresses
    sanitized = sanitized.replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[email removed]'
    );

    // Replace phone numbers
    sanitized = sanitized.replace(
        /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        '[phone removed]'
    );

    // Replace potential credit card numbers
    sanitized = sanitized.replace(
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        '[card removed]'
    );

    return sanitized;
}
