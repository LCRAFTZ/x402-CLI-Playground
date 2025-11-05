import('../index.js').catch((err) => {
  console.error('Failed to start x402 CLI:', err);
  process.exit(1);
});