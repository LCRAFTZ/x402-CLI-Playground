import { Command } from 'commander';
import { createLogger } from './utils/logger.js';

const program = new Command();
const logger = createLogger();

program
  .name('x402')
  .description('x402: Offline-first reference CLI for the x402 payment protocol')
  .version('0.1.0');

// Global options
program.option('--json', 'Output machine-parseable JSON where applicable', false);

// Dynamic command registration to keep index lean
// serve
program
  .command('serve')
  .description('Launch an HTTP server that enforces x402 payments on a specified endpoint')
  .option('-e, --endpoint <path>', 'Endpoint to protect', '/')
  .option('--price <amount>', 'Price required (string for precision)', '1')
  .option('--asset <symbol>', 'Asset symbol, e.g., "usdc"', 'usdc')
  .option('--network <name>', 'Network name, e.g., "local" or "base-sepolia"', 'local')
  .option('--port <n>', 'Server port', (v) => parseInt(v, 10))
  .option('--pay-to <address>', 'Destination address', 'mock-payee')
  .option('--scheme <name>', 'Payment scheme (exact|upto)', 'exact')
  .option('--confirmations <n>', 'Required confirmations', (v) => parseInt(v, 10), 0)
  .option('--facilitator <type>', 'Facilitator (mock|cdp)', 'mock')
  .option('--simulate-fail-rate <n>', 'Verification fail rate in %', (v) => parseInt(v, 10), 0)
  .option('--delay <ms>', 'Artificial server delay in milliseconds', (v) => parseInt(v, 10), 0)
  .option('--auto-faucet', 'Allow auto-faucet hinting for clients', false)
  .action(async (opts) => {
    const { serve } = await import('./commands/serve.js');
    await serve(opts, program.opts(), logger);
  });

// pay
program
  .command('pay')
  .description('Fetch PaymentRequirements from a URL and submit a payment payload')
  .argument('<url>', 'Target URL exposing x402 PaymentRequirements')
  .option('--from <file>', 'Load wallet or credentials from JSON file')
  .option('--from-seed', 'Derive wallet from seed (in-memory, not saved)')
  .option('--use-cdp', 'Use CDP credentials via env vars', false)
  .option('--dry-run', 'Build payload but do not settle/store', false)
  .option('--simulate-delay <ms>', 'Artificial client delay before submit', (v) => parseInt(v, 10), 0)
  .option('--auto-faucet', 'Enable auto faucet if insufficient balance', false)
  .action(async (url, opts) => {
    const { pay } = await import('./commands/pay.js');
    await pay(url, opts, program.opts(), logger);
  });

// inspect
program
  .command('inspect')
  .description('Inspect a transaction by tx-hash (mock or testnet)')
  .argument('<tx-hash>', 'Transaction hash to read')
  .option('--verbose', 'Show full raw payload')
  .action(async (txHash, opts) => {
    const { inspect } = await import('./commands/inspect.js');
    await inspect(txHash, opts, program.opts(), logger);
  });

// describe
program
  .command('describe')
  .description('Describe PaymentRequirements from a URL without paying')
  .argument('<url>', 'Target URL')
  .action(async (url) => {
    const { describe } = await import('./commands/describe.js');
    await describe(url, program.opts(), logger);
  });

// faucet
program
  .command('faucet')
  .description('Smart faucet utilities')
  .command('request')
  .description('Request testnet tokens (mock/testnet)')
  .option('--to <wallet>', 'Wallet address to fund')
  .option('--network <name>', 'Network name')
  .action(async (opts) => {
    const { faucetRequest } = await import('./commands/faucet.js');
    await faucetRequest(opts, program.opts(), logger);
  });

// config init
program
  .command('config')
  .description('Configuration utilities for x402')
  .command('init')
  .description('Initialize .x402rc with smart defaults and README.local.md')
  .action(async () => {
    const { configInit } = await import('./commands/config.js');
    await configInit(program.opts(), logger);
  });

// logs --tail
program
  .command('logs')
  .description('Structured logs utilities')
  .option('--tail', 'Tail logs')
  .action(async (opts) => {
    const { logs } = await import('./commands/logs.js');
    await logs(opts, program.opts(), logger);
  });

// simulate
program
  .command('simulate')
  .description('Run predefined simulation scenarios (high-latency, faucet-fail, etc.)')
  .option('--scenario <name>', 'Scenario name to run')
  .action(async (opts) => {
    const { simulate } = await import('./commands/simulate.js');
    await simulate(opts, program.opts(), logger);
  });

// interactive (walkthrough)
program
  .command('interactive')
  .description('Guided walkthrough for constructing x402 serve commands (non-interactive by default).')
  .action(async () => {
    const { interactive } = await import('./commands/interactive.js');
    await interactive(program.opts(), logger);
  });

program.showHelpAfterError('(run with --help for available options)');

program.parseAsync(process.argv).catch((err) => {
  logger.error({ err }, 'CLI crashed');
  process.exit(1);
});