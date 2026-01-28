/**
 * Example Tasks Index
 *
 * Export all example tasks for easy registration.
 */

// Send Email
export {
    SEND_EMAIL_TASK,
    sendEmailTask,
    queueEmail,
    queueUniqueEmail,
    type SendEmailPayload,
} from './send-email.task.js';

// Process Webhook
export {
    PROCESS_WEBHOOK_TASK,
    processWebhookTask,
    queueWebhook,
    type WebhookPayload,
} from './process-webhook.task.js';

// Batch Processor
export {
    BATCH_PROCESSOR_TASK,
    BATCH_ITEM_TASK,
    batchProcessorTask,
    batchItemTask,
    startBatchOperation,
    type BatchProcessorPayload,
    type BatchItemPayload,
} from './batch-processor.task.js';

// Singleton Task
export {
    SINGLETON_TASK,
    REFRESH_CACHE_TASK,
    CLEANUP_SESSIONS_TASK,
    singletonTask,
    queueSingletonTask,
    cancelSingletonTask,
    type SingletonTaskPayload,
} from './singleton-task.js';
