import { describe, it, expect } from 'vitest';
import { buildXPaymentHeader, parseXPaymentHeader } from '../src/utils/header.js';

const sample = {
  version: 'v1' as const,
  requestId: 'req-1',
  scheme: 'exact' as const,
  network: 'local',
  asset: 'usdc',
  amount: '1',
  from: '0xabc',
  to: 'mock-payee',
  nonce: '1',
  timestamp: Date.now(),
  txHash: '0xdeadbeef',
  signature: '0xsig',
};

describe('X-PAYMENT header utils', () => {
  it('encodes and decodes payload', () => {
    const header = buildXPaymentHeader(sample);
    const parsed = parseXPaymentHeader(header);
    expect(parsed.requestId).toBe('req-1');
    expect(parsed.scheme).toBe('exact');
  });

  it('throws on invalid payload', () => {
    // @ts-expect-error
    expect(() => buildXPaymentHeader({})).toThrow();
  });
});