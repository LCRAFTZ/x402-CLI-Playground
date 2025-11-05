import pino from 'pino';
import fs from 'fs';
import path from 'path';

const X402_DIR = path.resolve('.x402');
const LOG_FILE = path.join(X402_DIR, 'logs.jsonl');

export function ensureX402Dir() {
  if (!fs.existsSync(X402_DIR)) {
    fs.mkdirSync(X402_DIR, { recursive: true });
  }
}

export function createLogger() {
  ensureX402Dir();
  const stream = pino.destination({ dest: LOG_FILE, sync: false });
  const logger = pino({ level: process.env.X402_LOG_LEVEL ?? 'info' }, stream);
  return logger;
}

export function getLogFilePath() {
  return LOG_FILE;
}