/**
 * Jobs Library Examples
 *
 * Example implementations demonstrating Graphile Worker patterns.
 */

// Task examples
export * from './tasks/index.js';

// Worker setup
export { getTaskList, runWorker } from './worker-setup.example.js';

// API integration
export {
    jobRoutes,
    sendWelcomeEmailMiddleware,
} from './api-integration.example.js';

// Crontab examples
export { cronItems, EXAMPLE_CRONTAB } from './crontab.example.js';
