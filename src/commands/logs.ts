import fs from 'fs';
import { getLogFilePath } from '../utils/logger.js';

export async function logs(opts: any, globalOpts: any, logger: any) {
  const file = getLogFilePath();
  if (!opts.tail) {
    const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    process.stdout.write(content);
    return;
  }
  // Tail mode
  if (!fs.existsSync(file)) {
    console.log('No log file at', file);
    return;
  }
  const stream = fs.createReadStream(file, { encoding: 'utf8', start: 0 });
  stream.pipe(process.stdout);
  fs.watch(file, { persistent: true }, () => {
    const content = fs.readFileSync(file, 'utf8');
    process.stdout.write(content.slice(content.length - 1024));
  });
}