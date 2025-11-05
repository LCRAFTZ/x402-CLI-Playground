import { readConfig, writeConfig } from '../utils/store.js';

export async function faucetRequest(opts: any, globalOpts: any, logger: any) {
  const { to, network } = opts;
  if (!to) throw new Error('--to <wallet> is required');
  const net = network ?? 'local';
  if (net !== 'local') {
    const out = { error: 'faucet_unavailable', network: net };
    if (globalOpts.json) console.log(JSON.stringify(out));
    else console.log('Faucet unavailable for non-local networks');
    return;
  }
  const cfg = readConfig();
  cfg.balances = cfg.balances || {};
  const credit = 100; // mock faucet amount
  cfg.balances[to] = (cfg.balances[to] ?? 0) + credit;
  writeConfig(cfg);
  const out = { to, network: net, credited: credit };
  if (globalOpts.json) console.log(JSON.stringify(out));
  else console.log('Faucet request succeeded (simulated balance in local mode)');
}