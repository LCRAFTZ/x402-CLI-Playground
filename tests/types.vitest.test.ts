import { describe, it, expect } from 'vitest';
import { PaymentRequirementsV1Schema, PaymentPayloadSchema } from '../src/types/x402.js';

describe('types/x402 zod schemas', () => {
  it('validates PaymentRequirementsV1', () => {
    const req = {
      version: 'v1',
      requestId: 'req-zod',
      price: '1',
      asset: 'usdc',
      network: 'local',
      scheme: 'exact',
      payTo: 'mock-payee',
      confirmations: 0,
      facilitator: 'mock',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      metadata: {},
      hints: { autoFaucet: true },
    };
    const parsed = PaymentRequirementsV1Schema.safeParse(req);
    expect(parsed.success).toBe(true);
  });

  it('validates PaymentPayload', () => {
    const payload = {
      version: 'v1',
      requestId: 'req-zod',
      scheme: 'exact',
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
    const parsed = PaymentPayloadSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });
});