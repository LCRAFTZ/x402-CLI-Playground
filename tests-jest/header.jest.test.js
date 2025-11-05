describe('header (jest)', () => {
  test('encode/decode', async () => {
    const { buildXPaymentHeader, parseXPaymentHeader } = await import('../dist/utils/header.js');
    const payload = {
      version: 'v1',
      requestId: 'req-1',
      scheme: 'exact',
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
    const h = buildXPaymentHeader(payload);
    const p = parseXPaymentHeader(h);
    expect(p.requestId).toBe('req-1');
  });
});