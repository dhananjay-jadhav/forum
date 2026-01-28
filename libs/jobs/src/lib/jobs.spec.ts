import { isWorkerRunning } from './worker.js';
import type { AddJobOptions, TypedTask, WorkerConfig } from './types.js';

describe('jobs', () => {
    describe('types', () => {
        it('should define AddJobOptions correctly', () => {
            const options: AddJobOptions = {
                queueName: 'test-queue',
                runAt: new Date(),
                maxAttempts: 5,
                priority: 10,
                jobKey: 'unique-key',
                jobKeyMode: 'replace',
                flags: ['flag1', 'flag2'],
            };

            expect(options.queueName).toBe('test-queue');
            expect(options.priority).toBe(10);
            expect(options.jobKeyMode).toBe('replace');
        });

        it('should define WorkerConfig correctly', () => {
            const config: WorkerConfig = {
                connectionString: 'postgres://localhost/test',
                concurrency: 10,
                pollInterval: 500,
                schema: 'custom_schema',
                noPreparedStatements: true,
            };

            expect(config.concurrency).toBe(10);
            expect(config.schema).toBe('custom_schema');
        });

        it('should define TypedTask correctly', () => {
            interface EmailPayload {
                to: string;
                subject: string;
            }

            const emailTask: TypedTask<EmailPayload> = async (payload) => {
                expect(payload.to).toBeDefined();
                expect(payload.subject).toBeDefined();
            };

            expect(typeof emailTask).toBe('function');
        });
    });

    describe('worker', () => {
        it('should report worker not running initially', () => {
            expect(isWorkerRunning()).toBe(false);
        });
    });
});
