#!/usr/bin/env node
/**
 * Performance Test CLI
 *
 * Usage:
 *   npx ts-node performance/src/cli.ts                     # Run all tests
 *   npx ts-node performance/src/cli.ts --endpoint=health   # Test specific endpoint
 *   npx ts-node performance/src/cli.ts --category=graphql  # Test all GraphQL endpoints
 *   npx ts-node performance/src/cli.ts --service=analytics # Test Analytics API
 *   npx ts-node performance/src/cli.ts --duration=30       # Run for 30 seconds
 *   npx ts-node performance/src/cli.ts --connections=100   # Use 100 concurrent connections
 *   npx ts-node performance/src/cli.ts --list              # List available tests
 */

import { TestRunner } from './runner';
import { getAllTests, getTestsByCategory, getTestsByService } from './tests/index';
import { ApiService, TestCategory, TestConfig } from './types';

interface CliArgs {
    endpoints?: string[];
    category?: TestCategory;
    service?: ApiService;
    duration?: number;
    connections?: number;
    list?: boolean;
    help?: boolean;
}

function parseArgs(): CliArgs {
    const args: CliArgs = { endpoints: [] };
    const argv = process.argv.slice(2);
    let expectingEndpoint = false;

    for (const arg of argv) {
        if (expectingEndpoint) {
            // Previous arg was --endpoint without =, so this is the value
            const endpoints = arg.split(',').map(e => e.trim());
            args.endpoints!.push(...endpoints);
            expectingEndpoint = false;
            continue;
        }

        if (arg === '--help' || arg === '-h') {
            args.help = true;
        } else if (arg === '--list' || arg === '-l') {
            args.list = true;
        } else if (arg === '--endpoint' || arg === '--endpoints') {
            // --endpoint without = means next arg is the value
            expectingEndpoint = true;
        } else if (arg.startsWith('--')) {
            const [key, value] = arg.replace('--', '').split('=');
            if (key === 'endpoint' || key === 'endpoints') {
                // Support comma-separated endpoints: --endpoint=health,live,ready
                const endpoints = value.split(',').map(e => e.trim());
                args.endpoints!.push(...endpoints);
            } else if (key === 'category') args.category = value as TestCategory;
            else if (key === 'service') args.service = value as ApiService;
            else if (key === 'duration') args.duration = parseInt(value, 10);
            else if (key === 'connections') args.connections = parseInt(value, 10);
        } else if (!arg.startsWith('-')) {
            // Support positional arguments: yarn perf:run health graphql_typename
            args.endpoints!.push(arg);
        }
    }

    return args;
}

function printHelp(): void {
    console.log(`
Performance Test Suite

Usage:
  yarn perf:test [options] [endpoints...]

Options:
  --endpoint=<names>    Run specific tests (comma-separated or multiple flags)
  --category=<type>     Run all tests in a category (rest|graphql|analytics|search)
  --service=<api>       Run all tests for a service (api|analytics|search)
  --duration=<seconds>  Duration per test (default: 10)
  --connections=<num>   Concurrent connections (default: 10)
  --list, -l            List all available tests
  --help, -h            Show this help message

API Services:
  api                   Forum API (GraphQL + REST) - port 3000
  analytics             Analytics API (REST) - port 3002
  search                Search API (REST) - port 3003

Environment Variables:
  API_URL               Forum API URL (default: http://localhost:3000)
  ANALYTICS_API_URL     Analytics API URL (default: http://localhost:3002)
  SEARCH_API_URL        Search API URL (default: http://localhost:3003)
  DURATION              Test duration in seconds
  CONNECTIONS           Concurrent connections
  PIPELINING            HTTP pipelining factor

Examples:
  yarn perf:test                                  # Run all tests for all APIs
  yarn perf:test health                           # Run health test only
  yarn perf:test --service=api                    # Run all Forum API tests
  yarn perf:test --service=analytics              # Run all Analytics API tests
  yarn perf:test --service=search                 # Run all Search API tests
  yarn perf:test --category=graphql               # Run all GraphQL tests
  yarn perf:test --category=rest                  # Run all REST tests
  yarn perf:test --duration=30                    # 30 second tests
  yarn perf:test --connections=100                # 100 concurrent connections
`);
}

async function main(): Promise<void> {
    const args = parseArgs();

    if (args.help) {
        printHelp();
        process.exit(0);
    }

    const runner = new TestRunner({
        duration: args.duration,
        connections: args.connections,
    });

    const config = runner.getConfig();
    const apiConfigs = runner.getApiConfigs();
    const urlConfigs = runner.getApiUrlConfigs();

    if (args.list) {
        console.log('\n📋 Available Tests:\n');

        // Group tests by service
        for (const [service, serviceConfig] of Object.entries(apiConfigs)) {
            console.log(`\n  🔷 ${serviceConfig.name} (${serviceConfig.baseUrl})`);
            console.log('  ' + '-'.repeat(50));

            const serviceTests = getTestsByService(service as ApiService);
            if (Object.keys(serviceTests).length === 0) {
                console.log('    No tests defined');
                continue;
            }

            Object.entries(serviceTests).forEach(([key, test]) => {
                console.log(`    ${key.padEnd(30)} [${test.category}] ${test.name}`);
                if (test.description) {
                    console.log(`    ${''.padEnd(30)} └─ ${test.description}`);
                }
            });
        }

        const allTests = getAllTests(urlConfigs);
        console.log(`\n  Total: ${Object.keys(allTests).length} tests across ${Object.keys(apiConfigs).length} APIs`);
        process.exit(0);
    }

    console.log('🚀 Performance Test Suite');
    console.log('\n📡 API Services:');
    for (const [service, serviceConfig] of Object.entries(apiConfigs)) {
        console.log(`   ${serviceConfig.name}: ${serviceConfig.baseUrl}`);
    }
    console.log(`\n⏱️  Duration: ${config.duration}s per test`);
    console.log(`🔗 Connections: ${config.connections}`);

    // Check server reachability
    console.log('\n🔍 Checking server connectivity...');
    const reachability = await runner.checkAllServersReachable();
    let anyReachable = false;

    for (const [service, isReachable] of Object.entries(reachability)) {
        const serviceConfig = apiConfigs[service as ApiService];
        if (isReachable) {
            console.log(`   ✅ ${serviceConfig.name} is reachable`);
            anyReachable = true;
        } else {
            console.log(`   ⚠️  ${serviceConfig.name} is not reachable`);
        }
    }

    if (!anyReachable) {
        console.error('\n❌ No servers are reachable. Make sure at least one API is running.');
        console.error('   yarn start            # Start Forum API');
        console.error('   yarn start:analytics  # Start Analytics API');
        console.error('   yarn start:search     # Start Search API');
        process.exit(1);
    }
    console.log('');

    // Determine which tests to run
    let testsToRun: Record<string, TestConfig>;

    if (args.endpoints && args.endpoints.length > 0) {
        const allTests = getAllTests(urlConfigs);
        testsToRun = {};
        const unknownEndpoints: string[] = [];

        for (const endpoint of args.endpoints) {
            if (allTests[endpoint]) {
                testsToRun[endpoint] = allTests[endpoint];
            } else {
                unknownEndpoints.push(endpoint);
            }
        }

        if (unknownEndpoints.length > 0) {
            console.error(`❌ Unknown endpoint(s): ${unknownEndpoints.join(', ')}`);
            console.error(`Use --list to see available tests`);
            process.exit(1);
        }

        if (Object.keys(testsToRun).length === 0) {
            console.error('❌ No valid endpoints specified');
            process.exit(1);
        }
    } else if (args.service) {
        testsToRun = getTestsByService(args.service);
        if (Object.keys(testsToRun).length === 0) {
            console.error(`❌ No tests found for service: ${args.service}`);
            process.exit(1);
        }
        console.log(`Running tests for: ${apiConfigs[args.service].name}`);
    } else if (args.category) {
        testsToRun = getTestsByCategory(args.category, urlConfigs);
        if (Object.keys(testsToRun).length === 0) {
            console.error(`❌ No tests found for category: ${args.category}`);
            process.exit(1);
        }
    } else {
        // Run all tests, but filter to only reachable services
        const allTests = getAllTests(urlConfigs);
        testsToRun = {};

        for (const [testName, testConfig] of Object.entries(allTests)) {
            // Determine which service this test belongs to based on URL
            let testService: ApiService = 'api';
            if (testConfig.url.includes(apiConfigs.analytics.baseUrl)) {
                testService = 'analytics';
            } else if (testConfig.url.includes(apiConfigs.search.baseUrl)) {
                testService = 'search';
            }

            if (reachability[testService]) {
                testsToRun[testName] = testConfig;
            }
        }
    }

    // Run tests
    const results = await runner.runTests(testsToRun);

    // Print summary
    runner.printSummary(results);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
