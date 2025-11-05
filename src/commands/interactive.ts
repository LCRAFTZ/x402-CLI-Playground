import prompts from 'prompts';

export async function interactive(globalOpts: any, logger: any) {
  console.log('Guided walkthrough for constructing x402 serve commands (non-interactive by default).');
  const answers = await prompts([
    { type: 'text', name: 'endpoint', message: 'Endpoint to protect', initial: '/content' },
    { type: 'text', name: 'price', message: 'Price', initial: '1' },
    { type: 'text', name: 'asset', message: 'Asset', initial: 'usdc' },
    { type: 'text', name: 'network', message: 'Network', initial: 'local' },
    { type: 'text', name: 'payTo', message: 'Pay-to', initial: 'mock-payee' },
  ]);
  console.log('Command to run:');
  console.log(
    `x402 serve --endpoint ${answers.endpoint} --price ${answers.price} --asset ${answers.asset} --network ${answers.network} --pay-to ${answers.payTo} --scheme exact --confirmations 0 --facilitator mock`
  );
}