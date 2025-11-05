import { z } from 'zod';

// x402 PaymentRequirements v1
export const PaymentRequirementsV1Schema = z.object({
  version: z.literal('v1'),
  requestId: z.string(),
  price: z.string(), // string for precision (e.g., "1.00")
  asset: z.string(), // e.g., "usdc"
  network: z.string(), // e.g., "local" or "base-sepolia"
  scheme: z.enum(['exact', 'upto']),
  payTo: z.string(), // address or identifier
  confirmations: z.number().int().nonnegative(),
  facilitator: z.enum(['mock', 'cdp']),
  expiresAt: z.string(), // ISO timestamp
  metadata: z.record(z.any()).optional(),
  hints: z.object({ autoFaucet: z.boolean().optional() }).optional(),
});

export type PaymentRequirementsV1 = z.infer<typeof PaymentRequirementsV1Schema>;

export const PaymentPayloadSchema = z.object({
  version: z.literal('v1'),
  requestId: z.string(),
  scheme: z.enum(['exact', 'upto']),
  network: z.string(),
  asset: z.string(),
  amount: z.string(),
  from: z.string(),
  to: z.string(),
  nonce: z.string(),
  timestamp: z.number(),
  txHash: z.string(),
  signature: z.string(),
});

export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;

export type VerificationStatus = 'verified' | 'rejected';
export type SettlementStatus = 'settled' | 'failed' | 'pending';

export interface VerificationResult {
  status: VerificationStatus;
  reason?: string;
}

export interface SettlementResult {
  status: SettlementStatus;
  confirmations: number;
  explorerUrl?: string;
}