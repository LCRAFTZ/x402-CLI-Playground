import { PaymentPayloadSchema, type PaymentPayload } from '../types/x402.js';

export function buildXPaymentHeader(payload: PaymentPayload): string {
  // Validate payload strictly
  const parsed = PaymentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Invalid PaymentPayload: ' + JSON.stringify(parsed.error.format()));
  }
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString('base64');
}

export function parseXPaymentHeader(header: string): PaymentPayload {
  const json = Buffer.from(header, 'base64').toString('utf8');
  const obj = JSON.parse(json);
  const parsed = PaymentPayloadSchema.safeParse(obj);
  if (!parsed.success) {
    throw new Error('Invalid X-PAYMENT header payload: ' + JSON.stringify(parsed.error.format()));
  }
  return parsed.data;
}