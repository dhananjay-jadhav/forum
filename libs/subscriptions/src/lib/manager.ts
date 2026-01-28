/**
 * Subscription Manager
 *
 * Manages PostgreSQL LISTEN/NOTIFY subscriptions for real-time events.
 */

import { getPool } from '@app/database';
import { logger } from '@app/utils';
import type { PoolClient } from 'pg';

import type {
    ChannelName,
    SubscriptionCallback,
    SubscriptionEvent,
    Unsubscribe,
} from './types.js';
import { CHANNELS } from './types.js';

const log = logger.child({ component: 'subscriptions' });

/**
 * Subscription manager for PostgreSQL LISTEN/NOTIFY
 */
export class SubscriptionManager {
    private client: PoolClient | null = null;
    private isConnected = false;
    private listeners = new Map<string, Set<SubscriptionCallback>>();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;

    /**
     * Connect to the database and start listening for notifications
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            log.warn('Already connected to subscription manager');
            return;
        }

        try {
            const pool = getPool();
            this.client = await pool.connect();
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Set up notification handler
            this.client.on('notification', (msg) => {
                this.handleNotification(msg.channel, msg.payload);
            });

            // Handle connection errors
            this.client.on('error', (err) => {
                log.error({ error: err }, 'Subscription client error');
                this.handleDisconnect();
            });

            log.info('Subscription manager connected');
        } catch (error) {
            log.error({ error }, 'Failed to connect subscription manager');
            this.scheduleReconnect();
            throw error;
        }
    }

    /**
     * Disconnect and clean up resources
     */
    async disconnect(): Promise<void> {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.client) {
            try {
                // Unlisten from all channels
                for (const channel of this.listeners.keys()) {
                    await this.client.query(`UNLISTEN ${channel}`);
                }
                this.client.release();
            } catch (error) {
                log.error({ error }, 'Error during disconnect');
            }
            this.client = null;
        }

        this.isConnected = false;
        this.listeners.clear();
        log.info('Subscription manager disconnected');
    }

    /**
     * Subscribe to a channel
     */
    async subscribe<T extends SubscriptionEvent = SubscriptionEvent>(
        channel: ChannelName,
        callback: SubscriptionCallback<T>
    ): Promise<Unsubscribe> {
        if (!this.isConnected || !this.client) {
            throw new Error('Subscription manager not connected');
        }

        // Add listener
        let listeners = this.listeners.get(channel);
        if (!listeners) {
            listeners = new Set();
            this.listeners.set(channel, listeners);
            // Start listening on this channel
            await this.client.query(`LISTEN "${channel}"`);
            log.debug({ channel }, 'Listening on channel');
        }

        listeners.add(callback as SubscriptionCallback);

        // Return unsubscribe function
        return async () => {
            const listeners = this.listeners.get(channel);
            if (listeners) {
                listeners.delete(callback as SubscriptionCallback);

                // If no more listeners, stop listening
                if (listeners.size === 0) {
                    this.listeners.delete(channel);
                    if (this.client && this.isConnected) {
                        await this.client.query(`UNLISTEN "${channel}"`);
                        log.debug({ channel }, 'Stopped listening on channel');
                    }
                }
            }
        };
    }

    /**
     * Subscribe to user events
     */
    async subscribeToUsers(
        callback: SubscriptionCallback
    ): Promise<Unsubscribe> {
        return this.subscribe(CHANNELS.USERS, callback);
    }

    /**
     * Subscribe to forum events
     */
    async subscribeToForums(
        callback: SubscriptionCallback
    ): Promise<Unsubscribe> {
        return this.subscribe(CHANNELS.FORUMS, callback);
    }

    /**
     * Subscribe to topic events
     */
    async subscribeToTopics(
        callback: SubscriptionCallback
    ): Promise<Unsubscribe> {
        return this.subscribe(CHANNELS.TOPICS, callback);
    }

    /**
     * Subscribe to post events
     */
    async subscribeToPosts(
        callback: SubscriptionCallback
    ): Promise<Unsubscribe> {
        return this.subscribe(CHANNELS.POSTS, callback);
    }

    /**
     * Subscribe to all events
     */
    async subscribeToAll(
        callback: SubscriptionCallback
    ): Promise<Unsubscribe> {
        return this.subscribe(CHANNELS.ALL, callback);
    }

    /**
     * Check if connected
     */
    isActive(): boolean {
        return this.isConnected;
    }

    /**
     * Handle incoming notification
     */
    private handleNotification(channel: string, payload: string | undefined): void {
        if (!payload) {
            log.warn({ channel }, 'Received empty notification payload');
            return;
        }

        try {
            const event = JSON.parse(payload) as SubscriptionEvent;
            log.debug({ channel, event }, 'Received notification');

            // Notify channel-specific listeners
            const listeners = this.listeners.get(channel);
            if (listeners) {
                for (const callback of listeners) {
                    try {
                        void Promise.resolve(callback(event));
                    } catch (error) {
                        log.error({ error, channel }, 'Error in subscription callback');
                    }
                }
            }

            // Also notify 'all' listeners
            if (channel !== CHANNELS.ALL) {
                const allListeners = this.listeners.get(CHANNELS.ALL);
                if (allListeners) {
                    for (const callback of allListeners) {
                        try {
                            void Promise.resolve(callback(event));
                        } catch (error) {
                            log.error({ error, channel }, 'Error in subscription callback');
                        }
                    }
                }
            }
        } catch (error) {
            log.error({ error, channel, payload }, 'Failed to parse notification payload');
        }
    }

    /**
     * Handle disconnection
     */
    private handleDisconnect(): void {
        this.isConnected = false;
        this.client = null;
        this.scheduleReconnect();
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            log.error('Max reconnection attempts reached');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        log.info({ attempt: this.reconnectAttempts, delay }, 'Scheduling reconnection');

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnect().catch((err) => {
                log.error({ error: err }, 'Reconnection failed');
            });
        }, delay);
    }

    /**
     * Attempt to reconnect
     */
    private async reconnect(): Promise<void> {
        const previousListeners = new Map(this.listeners);

        await this.connect();

        // Re-subscribe to previous channels
        for (const channel of previousListeners.keys()) {
            if (this.client) {
                await this.client.query(`LISTEN "${channel}"`);
                log.debug({ channel }, 'Re-subscribed to channel');
            }
        }

        this.listeners = previousListeners;
    }
}

// Singleton instance
let subscriptionManager: SubscriptionManager | null = null;

/**
 * Get the subscription manager instance
 */
export function getSubscriptionManager(): SubscriptionManager {
    if (!subscriptionManager) {
        subscriptionManager = new SubscriptionManager();
    }
    return subscriptionManager;
}

/**
 * Initialize subscriptions (connect the manager)
 */
export async function initializeSubscriptions(): Promise<SubscriptionManager> {
    const manager = getSubscriptionManager();
    await manager.connect();
    return manager;
}

/**
 * Shutdown subscriptions
 */
export async function shutdownSubscriptions(): Promise<void> {
    if (subscriptionManager) {
        await subscriptionManager.disconnect();
        subscriptionManager = null;
    }
}
