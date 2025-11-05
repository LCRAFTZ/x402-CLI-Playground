import { describe, it, expect } from 'vitest';
import { serve } from '../src/commands/serve.js';
import { pay } from '../src/commands/pay.js';
import { inspect } from '../src/commands/inspect.js';
import { createLogger } from '../src/utils/logger.js';

describe('x402 end-to-end (local)', () => {
  it('serve -> pay -> inspect succeeds locally', async () => {
    const logger = createLogger();
    const opts = {
      endpoint: '/content',
      price: '1',
      asset: 'usdc',
      network: 'local',
      payTo: 'mock-payee',
      scheme: 'exact' as const,
      confirmations: 0,
      facilitator: 'mock' as const,
      simulateFailRate: 0,
      delay: 0,
      autoFaucet: true,
      port: 4021,
    };
    const { app, port } = await serve(opts, {}, logger);
    const url = `http://127.0.0.1:${port}${opts.endpoint}`;

    // Describe should return PaymentRequirements
    const res = await fetch(url);
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.version).toBe('v1');
    expect(body.network).toBe('local');
    expect(body.asset).toBe('usdc');

    // Pay and capture output via JSON
    let txHash: string | undefined;
    const originalLog = console.log;
    try {
      console.log = (msg: any) => {
        try {
          const out = JSON.parse(msg);
          txHash = out.txHash;
        } catch {}
      };
      await pay(url, { autoFaucet: true }, { json: true }, logger);
    } finally {
      console.log = originalLog;
    }
    expect(txHash).toBeDefined();

    // Inspect should find the transaction
    let inspectOut: any = undefined;
    const originalLog2 = console.log;
    try {
      console.log = (msg: any) => {
        try {
          inspectOut = JSON.parse(msg);
        } catch {}
      };
      await inspect(txHash!, { verbose: false }, { json: true }, logger);
    } finally {
      console.log = originalLog2;
    }
    expect(inspectOut.status).toBeDefined();

    await app.close();
  });
});