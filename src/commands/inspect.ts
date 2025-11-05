import { readTransactions } from '../utils/store.js';

export async function inspect(txHash: string, opts: any, globalOpts: any, logger: any) {
  const { transactions } = readTransactions();
  const matches = transactions.filter((t: any) => t.txHash === txHash);
  const tx = matches.length ? matches[matches.length - 1] : undefined;
  if (!tx) {
    const out = { status: 'unknown', txHash };
    if (globalOpts.json) console.log(JSON.stringify(out));
    else console.log('status: unknown');
    return;
  }
  const out = {
    status: tx.status,
    confirmations: tx.confirmations ?? 0,
    amount: tx.amount ?? tx.payload?.amount,
    asset: tx.asset ?? tx.payload?.asset,
    payee: tx.to ?? tx.payload?.to,
    explorerUrl: tx.explorerUrl,
    ...(opts.verbose ? { raw: tx } : {}),
  };
  if (globalOpts.json) console.log(JSON.stringify(out));
  else {
    console.log('status:', out.status);
    console.log('confirmations:', out.confirmations);
    console.log('amount:', out.amount);
    console.log('asset:', out.asset);
    console.log('payee:', out.payee);
    if (out.explorerUrl) console.log('explorer:', out.explorerUrl);
    if (opts.verbose) console.log('raw:', JSON.stringify(out.raw));
  }
}