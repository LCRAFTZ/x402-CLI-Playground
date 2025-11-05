import fs from 'fs';
import { Wallet, Signer } from 'ethers';
import { PaymentRequirementsV1Schema } from '../types/x402.js';
import { walletFromPrivateKey } from '../utils/crypto.js';
import { buildExactPayment } from '../schemes/exact.js';
import { buildXPaymentHeader } from '../utils/header.js';
import { readConfig, writeConfig, appendTransaction } from '../utils/store.js';

interface PayOptions {
  from?: string;
  fromSeed?: boolean;
  useCdp?: boolean;
  dryRun?: boolean;
  simulateDelay?: number;
  autoFaucet?: boolean;
}

async function fetchRequirements(url: string) {
  const res = await fetch(url, { method: 'GET' });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function loadWallet(opts: PayOptions, logger: any): Signer {
  if (opts.fromSeed) {
    const w = Wallet.createRandom();
    logger.info({ address: w.address }, 'Using ephemeral wallet (seed-derived)');
    return w;
  }
  if (opts.from) {
    const data = JSON.parse(fs.readFileSync(opts.from, 'utf8'));
    if (data.privateKey) {
      return walletFromPrivateKey(data.privateKey);
    }
    if (data.cdp) {
      // Simulate CDP: derive ephemeral wallet without external calls
      const w = Wallet.createRandom();
      logger.info({ cdp: true, address: w.address }, 'Using simulated CDP wallet');
      return w;
    }
    throw new Error('Unsupported --from file format');
  }
  if (opts.useCdp) {
    const w = Wallet.createRandom();
    logger.info({ cdp: true, address: w.address }, 'Using CDP via env (simulated)');
    return w;
  }
  // default ephemeral wallet
  const w = Wallet.createRandom();
  logger.info({ address: w.address }, 'Using default ephemeral wallet');
  return w;
}

function ensureBalanceOrFaucet(address: string, required: string, network: string, autoFaucet: boolean, logger: any) {
  const cfg = readConfig();
  cfg.balances = cfg.balances || {};
  const current = Number(cfg.balances[address] ?? 0);
  const needed = Number(required);
  if (current >= needed) return; // sufficient
  if (!autoFaucet) throw new Error('Insufficient balance and auto-faucet disabled');
  if (cfg.faucetDisabled) throw new Error('Faucet disabled by simulation');
  // Simulated faucet is allowed only on local
  if (network === 'local') {
    const credit = needed - current;
    cfg.balances[address] = current + credit;
    writeConfig(cfg);
    logger.info({ address, network, credit }, 'Auto-faucet credited (local)');
    return;
  }
  throw new Error('Auto-faucet is only available in local mode');
}

export async function pay(url: string, opts: PayOptions, globalOpts: any, logger: any) {
  const { status, body } = await fetchRequirements(url);
  if (status !== 402) {
    logger.warn({ status, body }, 'Server did not request payment (status != 402)');
  }
  const parsed = PaymentRequirementsV1Schema.safeParse(body);
  if (!parsed.success) {
    throw new Error('Invalid PaymentRequirements from server');
  }
  const req = parsed.data;

  const wallet = loadWallet(opts, logger);
  const addr = await wallet.getAddress();
  ensureBalanceOrFaucet(addr, req.price, req.network, !!opts.autoFaucet, logger);

  const payload = await buildExactPayment(req, { wallet });
  const header = buildXPaymentHeader(payload);

  if (opts.simulateDelay && opts.simulateDelay > 0) {
    await new Promise((r) => setTimeout(r, opts.simulateDelay));
  }

  let responseStatus: number | undefined;
  let explorerUrl: string | undefined;
  if (!opts.dryRun) {
    const res = await fetch(url, { method: 'GET', headers: { 'X-PAYMENT': header } });
    responseStatus = res.status;
    try {
      const body = await res.json();
      explorerUrl = body?.explorerUrl;
    } catch {}
  }

  const statusLabel = opts.dryRun
    ? 'dry-run'
    : responseStatus === 200
    ? 'paid'
    : responseStatus === 402
    ? 'rejected'
    : 'unknown';

  explorerUrl = explorerUrl ?? (req.network === 'base-sepolia' ? `https://sepolia.basescan.org/tx/${payload.txHash}` : undefined);

  // Persist transaction for inspect
  appendTransaction({
    txHash: payload.txHash,
    status: statusLabel,
    confirmations: 0,
    amount: req.price,
    asset: req.asset,
    to: req.payTo,
    explorerUrl,
    payload,
  });

  const out = {
    txHash: payload.txHash,
    status: statusLabel,
    httpStatus: responseStatus ?? 0,
    explorerUrl,
    xPaymentHeader: header,
  };

  if (globalOpts.json) {
    console.log(JSON.stringify(out));
  } else {
    console.log('txHash:', out.txHash);
    console.log('status:', out.status);
    if (out.explorerUrl) console.log('explorer:', out.explorerUrl);
    console.log('X-PAYMENT:', out.xPaymentHeader);
  }
}