import fs from 'fs';
import path from 'path';
import { ensureStore, paths, writeConfig } from '../utils/store.js';

export async function configInit(globalOpts: any, logger: any) {
  ensureStore();
  const rcPath = path.resolve('.x402rc');
  const rc = {
    version: 1,
    defaults: {
      endpoint: '/',
      price: '1',
      asset: 'usdc',
      network: 'local',
      scheme: 'exact',
      confirmations: 0,
      facilitator: 'mock',
      server: { port: 4020 },
    },
    faucet: {
      baseSepolia: 'https://faucet.test.example',
    },
  };
  fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2));

  // Initialize primary config.json for balances map
  writeConfig({ version: 1, balances: {} });

  const readmePath = path.resolve('README.local.md');
  const readme = '# x402 Local Usage\n\n' +
    'Configuration:\n' +
    '- Default port is configurable via .x402rc under defaults.server.port. If not set, the CLI falls back to 4020.\n\n' +
    'Examples:\n\n' +
    '- Start server (mock):\n' +
    '  x402 serve --endpoint /content --price 1 --asset usdc --network local --pay-to mock-payee --scheme exact --confirmations 0 --facilitator mock\n\n' +
    '- Describe payment requirements:\n' +
    '  x402 describe http://127.0.0.1:4020/content --json\n\n' +
    '- Pay:\n' +
    '  x402 pay http://127.0.0.1:4020/content --auto-faucet\n\n' +
    '- Inspect:\n' +
    '  x402 inspect <tx-hash> --json\n\n' +
    '- Logs:\n' +
    '  X402_LOG_LEVEL=debug x402 logs --tail\n';
  fs.writeFileSync(readmePath, readme);

  console.log('Initialized .x402rc and README.local.md');
  console.log('State dir:', paths.X402_DIR);
}