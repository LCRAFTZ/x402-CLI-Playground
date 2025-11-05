import type { FastifyInstance } from 'fastify';
import { appendTransaction } from '../utils/store.js';
import type { PaymentPayload, VerificationResult, SettlementResult } from '../types/x402.js';

export interface MockFacilitatorOptions {
  failRatePercent?: number; // 0..100
}

interface StoredTx {
  txHash: string;
  payload: PaymentPayload;
  status: 'verified' | 'settled' | 'failed';
  confirmations: number;
  createdAt: number;
}

const txMemory = new Map<string, StoredTx>();

export function verifyPayment(payload: PaymentPayload, opts?: MockFacilitatorOptions): VerificationResult {
  const failRate = Math.max(0, Math.min(100, opts?.failRatePercent ?? 0));
  const rand = Math.floor(Math.random() * 100);
  if (rand < failRate) {
    return { status: 'rejected', reason: 'Simulated verification failure' };
  }
  const record: StoredTx = {
    txHash: payload.txHash,
    payload,
    status: 'verified',
    confirmations: 0,
    createdAt: Date.now(),
  };
  txMemory.set(payload.txHash, record);
  appendTransaction({
    txHash: payload.txHash,
    status: 'verified',
    network: payload.network,
    asset: payload.asset,
    amount: payload.amount,
    to: payload.to,
    from: payload.from,
    scheme: payload.scheme,
    requestId: payload.requestId,
    timestamp: payload.timestamp,
  });
  return { status: 'verified' };
}

export function settlePayment(txHash: string, requiredConfirmations: number): SettlementResult {
  const tx = txMemory.get(txHash);
  if (!tx) {
    return { status: 'failed', confirmations: 0 };
  }
  tx.status = 'settled';
  tx.confirmations = requiredConfirmations;
  txMemory.set(txHash, tx);
  const explorerUrl = buildExplorerUrl(tx.payload.network, txHash);
  appendTransaction({ ...tx, explorerUrl });
  return { status: 'settled', confirmations: requiredConfirmations, explorerUrl };
}

export function buildExplorerUrl(network: string, txHash: string): string | undefined {
  if (network === 'base-sepolia') {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }
  return undefined;
}

export async function registerMockFacilitatorRoutes(app: FastifyInstance, opts?: MockFacilitatorOptions) {
  app.post('/verify', async (req, reply) => {
    const payload = req.body as PaymentPayload;
    const result = verifyPayment(payload, opts);
    if (result.status === 'verified') {
      return reply.code(200).send(result);
    } else {
      return reply.code(400).send(result);
    }
  });

  app.post('/settle', async (req, reply) => {
    const { txHash, confirmations } = req.body as { txHash: string; confirmations: number };
    const result = settlePayment(txHash, confirmations);
    const code = result.status === 'settled' ? 200 : 400;
    return reply.code(code).send(result);
  });
}