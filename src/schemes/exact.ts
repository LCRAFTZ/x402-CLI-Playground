import { Signer } from 'ethers';
import { deterministicTxHash, signPayload } from '../utils/crypto.js';
import type { PaymentRequirementsV1, PaymentPayload } from '../types/x402.js';

export interface BuildExactOptions {
  wallet: Signer;
}

export async function buildExactPayment(req: PaymentRequirementsV1, opts: BuildExactOptions): Promise<PaymentPayload> {
  const fromAddress = await opts.wallet.getAddress();
  const base = {
    version: 'v1' as const,
    requestId: req.requestId,
    scheme: req.scheme,
    network: req.network,
    asset: req.asset,
    amount: req.price,
    from: fromAddress,
    to: req.payTo,
    nonce: `${Date.now()}`,
    timestamp: Date.now(),
  } as const;
  const txHash = deterministicTxHash(base);
  const signature = await signPayload(opts.wallet, txHash);
  return { ...base, txHash, signature };
}