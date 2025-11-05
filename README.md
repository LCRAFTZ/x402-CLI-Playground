# x402 CLI Playground

An offline-first CLI for simulating the x402 payment protocol locally—no wallet, no RPC, no network required.

## Quick Start

```bash
x402 serve --endpoint /data --facilitator mock --network local --port 4020
x402 pay http://localhost:4020/data --auto-faucet --json
x402 inspect <tx-hash> --json
```

## Protocol Fidelity

- Implements x402 v1 PaymentRequirements and X-PAYMENT.
- Validates all payloads with Zod schemas.
- Uses a mock facilitator for in-memory verification and settlement.
- Spec reference: https://github.com/x402/spec

## Key Features

- Offline-first: works entirely in memory; no blockchain or wallet needed.
- Machine-readable output: all inspectable commands support `--json`.
- CI/CD ready: runs in Docker with `network_mode: none`.
- Full transaction history: stored locally in `.x402/transactions.json`.
- Faucet guardrails: auto-faucet only in local mode, with explicit error handling elsewhere.

## Usage Examples

```bash
# Start a local payment endpoint
x402 serve --endpoint /data --price 1 --asset usdc --network local --facilitator mock --port 4020

# Describe payment requirements (machine-readable)
x402 describe http://localhost:4020/data --json

# Pay with auto-faucet and get structured output
x402 pay http://localhost:4020/data --auto-faucet --json

# Inspect a transaction
x402 inspect <tx-hash> --json
```

## Docker & CI/CD

```yaml
version: "3.9"
services:
  x402:
    build: .
    command: ["node", "./bin/x402.js", "serve", "--facilitator", "mock", "--endpoint", "/data", "--port", "4020"]
    ports:
      - "4020:4020"
    environment:
      - X402_HOST=0.0.0.0
    network_mode: none
```

The container runs with no external network access by default, making it safe for CI.

## Installation

```bash
npm install -g x402-cli
# Or via npx:
npx x402-cli serve --endpoint /data --facilitator mock --network local --port 4020
```

Requires Node.js >= 20.

## License

MIT License. See LICENSE.

## 📬 Contact

Have questions, suggestions, or collaboration ideas? Feel free to reach out!

- Email: logiccrafterdz@gmail.com
- Website: `https://www.logiccrafterdz.site`
- Farcaster: `https://farcaster.xyz/esta`
- Twitter/X: `https://x.com/Arana_lib`
