import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const X402_DIR = path.resolve('.x402');
const TX_FILE = path.join(X402_DIR, 'transactions.json');
const CONFIG_FILE = path.join(X402_DIR, 'config.json');

export function ensureStore() {
  if (!fs.existsSync(X402_DIR)) fs.mkdirSync(X402_DIR, { recursive: true });
  if (!fs.existsSync(TX_FILE)) fs.writeFileSync(TX_FILE, JSON.stringify({ transactions: [] }, null, 2));
  if (!fs.existsSync(CONFIG_FILE)) fs.writeFileSync(CONFIG_FILE, JSON.stringify({ version: 1 }, null, 2));
}

export function readTransactions(): { transactions: any[] } {
  ensureStore();
  const raw = fs.readFileSync(TX_FILE, 'utf8');
  return JSON.parse(raw);
}

export function writeTransactions(data: { transactions: any[] }) {
  ensureStore();
  const tmp = TX_FILE + '.tmp-' + randomUUID();
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, TX_FILE);
}

export function appendTransaction(tx: any) {
  const current = readTransactions();
  current.transactions.push(tx);
  writeTransactions(current);
}

export function readConfig(): Record<string, any> {
  ensureStore();
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

export function writeConfig(cfg: Record<string, any>) {
  ensureStore();
  const tmp = CONFIG_FILE + '.tmp-' + randomUUID();
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2));
  fs.renameSync(tmp, CONFIG_FILE);
}

export const paths = {
  X402_DIR,
  TX_FILE,
  CONFIG_FILE,
};