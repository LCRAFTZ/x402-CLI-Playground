import { readConfig, writeConfig } from '../utils/store.js';

export async function simulate(opts: any, globalOpts: any, logger: any) {
  const scenario = opts.scenario;
  if (!scenario) throw new Error('--scenario <name> is required');

  switch (scenario) {
    case 'high-latency': {
      console.log('Simulate: high-latency. Use --delay 2000 on serve and --simulate-delay 2000 on pay.');
      break;
    }
    case 'faucet-fail': {
      const cfg = readConfig();
      cfg.faucetDisabled = true;
      writeConfig(cfg);
      console.log('Simulate: faucet disabled set in local config.');
      break;
    }
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}