/**
 * In-Memory Metrics Store
 *
 * For production, this would use TimescaleDB or similar.
 * This implementation is for development/demo purposes.
 */

import { logger } from '@app/utils';

export interface Metric {
    name: string;
    value: number;
    timestamp: Date;
    labels: Record<string, string>;
}

export interface CounterMetric {
    name: string;
    count: number;
    labels: Record<string, string>;
}

export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
}

// In-memory storage
const counters = new Map<string, CounterMetric>();
const timeSeries = new Map<string, TimeSeriesPoint[]>();
const events: Metric[] = [];

const MAX_EVENTS = 10000;
const MAX_TIME_SERIES_POINTS = 1000;

/**
 * Generate a key for a counter based on name and labels
 */
function counterKey(name: string, labels: Record<string, string>): string {
    const sortedLabels = Object.entries(labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
    return `${name}{${sortedLabels}}`;
}

/**
 * Increment a counter
 */
export function incrementCounter(
    name: string,
    labels: Record<string, string> = {},
    value = 1
): void {
    const key = counterKey(name, labels);
    const existing = counters.get(key);

    if (existing) {
        existing.count += value;
    } else {
        counters.set(key, { name, count: value, labels });
    }

    logger.debug({ name, labels, value }, 'Counter incremented');
}

/**
 * Record a time series value
 */
export function recordTimeSeries(
    name: string,
    value: number,
    timestamp = new Date()
): void {
    const points = timeSeries.get(name) || [];
    points.push({ timestamp, value });

    // Trim to max size
    if (points.length > MAX_TIME_SERIES_POINTS) {
        points.splice(0, points.length - MAX_TIME_SERIES_POINTS);
    }

    timeSeries.set(name, points);
    logger.debug({ name, value }, 'Time series recorded');
}

/**
 * Record a raw event/metric
 */
export function recordEvent(metric: Omit<Metric, 'timestamp'>): void {
    events.push({
        ...metric,
        timestamp: new Date(),
    });

    // Trim to max size
    if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
    }
}

/**
 * Get all counters
 */
export function getCounters(namePrefix?: string): CounterMetric[] {
    const result: CounterMetric[] = [];
    for (const [, counter] of counters) {
        if (!namePrefix || counter.name.startsWith(namePrefix)) {
            result.push({ ...counter });
        }
    }
    return result;
}

/**
 * Get a specific counter value
 */
export function getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = counterKey(name, labels);
    return counters.get(key)?.count || 0;
}

/**
 * Get time series data
 */
export function getTimeSeries(
    name: string,
    options?: {
        startTime?: Date;
        endTime?: Date;
        limit?: number;
    }
): TimeSeriesPoint[] {
    const points = timeSeries.get(name) || [];
    let filtered = [...points];

    if (options?.startTime) {
        const startTime = options.startTime;
        filtered = filtered.filter((p) => p.timestamp >= startTime);
    }
    if (options?.endTime) {
        const endTime = options.endTime;
        filtered = filtered.filter((p) => p.timestamp <= endTime);
    }
    if (options?.limit) {
        filtered = filtered.slice(-options.limit);
    }

    return filtered;
}

/**
 * Get recent events
 */
export function getRecentEvents(limit = 100): Metric[] {
    return events.slice(-limit);
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): {
    totalCounters: number;
    totalTimeSeries: number;
    totalEvents: number;
    counters: CounterMetric[];
} {
    return {
        totalCounters: counters.size,
        totalTimeSeries: timeSeries.size,
        totalEvents: events.length,
        counters: getCounters(),
    };
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics(): void {
    counters.clear();
    timeSeries.clear();
    events.length = 0;
    logger.info('Metrics reset');
}
