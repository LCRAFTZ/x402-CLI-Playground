import { keccak256, toUtf8Bytes, Wallet, Signer } from 'ethers';

export function deterministicTxHash(input: unknown): string {
  const json = JSON.stringify(input);
  return keccak256(toUtf8Bytes(json));
}

export async function signPayload(wallet: Signer, payloadHash: string): Promise<string> {
  // signMessage applies EIP-191 prefix; acceptable for mock facilitator
  return await wallet.signMessage(payloadHash);
}

export function walletFromPrivateKey(pk: string): Wallet {
  // ethers v6 Wallet accepts private key with 0x prefix
  const normalized = pk.startsWith('0x') ? pk : '0x' + pk;
  return new Wallet(normalized);
}