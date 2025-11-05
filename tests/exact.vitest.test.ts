import { describe, it, expect } from 'vitest';
import { Wallet } from 'ethers';
import { buildExactPayment } from '../src/schemes/exact.js';

const req = {
  version: 'v1' as const,
  requestId: 'req-3',
  price: '2',
  asset: 'usdc',
  network: 'mocknet',
  scheme: 'exact' as const,
  payTo: 'mock-payee',
  confirmations: 0,
  facilitator: 'mock' as const,
  expiresAt: new Date(Date.now() + 1000).toISOString(),
  metadata: {},
  hints: {},
};

describe('exact scheme', () => {
  it('builds signed payload', async () => {
    const w = Wallet.createRandom();
    const payload = await buildExactPayment(req, { wallet: w });
    expect(payload.amount).toBe('2');
    expect(payload.txHash.startsWith('0x')).toBe(true);
    expect(payload.signature.startsWith('0x')).toBe(true);
  });
});