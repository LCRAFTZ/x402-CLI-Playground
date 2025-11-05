import { describe, it, expect } from 'vitest';
import { verifyPayment, settlePayment } from '../src/facilitators/mock.js';

const payload = {
  version: 'v1' as const,
  requestId: 'req-2',
  scheme: 'exact' as const,
  network: 'local',
  asset: 'usdc',
  amount: '1',
  from: '0xabc',
  to: 'mock-payee',
  nonce: 'n',
  timestamp: Date.now(),
  txHash: '0x123',
  signature: '0xs',
};

describe('mock facilitator', () => {
  it('verifies and settles', () => {
    const v = verifyPayment(payload, { failRatePercent: 0 });
    expect(v.status).toBe('verified');
    const s = settlePayment(payload.txHash, 0);
    expect(s.status).toBe('settled');
  });

  it('rejects with 100% fail rate', () => {
    const v = verifyPayment(payload, { failRatePercent: 100 });
    expect(v.status).toBe('rejected');
  });
});