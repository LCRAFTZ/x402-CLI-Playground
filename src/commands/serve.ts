import Fastify, { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { PaymentRequirementsV1Schema, type PaymentRequirementsV1 } from '../types/x402.js';
import { registerMockFacilitatorRoutes, verifyPayment, settlePayment } from '../facilitators/mock.js';
import { parseXPaymentHeader } from '../utils/header.js';

interface ServeOptions {
  endpoint: string;
  price: string;
  asset: string;
  network: string;
  payTo: string;
  scheme: 'exact' | 'upto';
  confirmations: number;
  facilitator: 'mock' | 'cdp';
  simulateFailRate: number;
  delay: number;
  autoFaucet: boolean;
  port?: number;
}

function buildRequirements(opts: ServeOptions): PaymentRequirementsV1 {
  const req: PaymentRequirementsV1 = {
    version: 'v1',
    requestId: `req-${randomUUID()}`,
    price: String(opts.price),
    asset: opts.asset,
    network: opts.network,
    scheme: opts.scheme,
    payTo: opts.payTo,
    confirmations: opts.confirmations,
    facilitator: opts.facilitator,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    metadata: {},
    hints: { autoFaucet: !!opts.autoFaucet },
  };
  // ensure spec compliance
  const parsed = PaymentRequirementsV1Schema.safeParse(req);
  if (!parsed.success) {
    throw new Error('Invalid PaymentRequirements: ' + JSON.stringify(parsed.error.format()));
  }
  return req;
}

export async function serve(opts: ServeOptions, globalOpts: any, logger: any) {
  const app: FastifyInstance = Fastify({ logger: false });

  // Facilitator routes
  if (opts.facilitator === 'mock') {
    await registerMockFacilitatorRoutes(app, { failRatePercent: opts.simulateFailRate });
  } else {
    // Placeholder: CDP facilitator would be registered here.
  }

  // Protected endpoint (respond to any method)
  app.all(opts.endpoint, async (req, reply) => {
    if (opts.delay > 0) await new Promise((r) => setTimeout(r, opts.delay));

    const header = req.headers['x-payment'] as string | undefined;
    if (!header) {
      const requirements = buildRequirements(opts);
      return reply.code(402).send(requirements);
    }

    try {
      // Verify via mock facilitator with strict header parsing
      const payload = parseXPaymentHeader(header);
      const verification = verifyPayment(payload, { failRatePercent: opts.simulateFailRate });
      if (verification.status !== 'verified') {
        return reply.code(402).send({ error: 'Payment verification failed', details: verification });
      }
      const settlement = settlePayment(payload.txHash, opts.confirmations);
      logger.info({ txHash: payload.txHash, settlement }, 'Payment settled');
      return reply.code(200).send({ data: 'Paid content' });
    } catch (err: any) {
      logger.error({ err }, 'Verification error');
      return reply.code(400).send({ error: 'Invalid X-PAYMENT header' });
    }
  });

  // Resolve port: CLI flag > env > .x402rc > default 4020
  function getRcPort(): number | undefined {
    try {
      const raw = require('fs').readFileSync('.x402rc', 'utf8');
      const rc = JSON.parse(raw);
      const p = rc?.defaults?.server?.port;
      return typeof p === 'number' ? p : undefined;
    } catch (_) {
      return undefined;
    }
  }
  const port = Number(opts.port ?? process.env.X402_PORT ?? getRcPort() ?? 4020);
  const host = process.env.X402_HOST ?? '127.0.0.1';
  await app.listen({ port, host });
  const url = `http://${host}:${port}${opts.endpoint}`;
  logger.info({ url, port, host, endpoint: opts.endpoint }, 'x402 serve started');
  console.log(`x402 serve listening at ${url}`);
  return { app, port };
}