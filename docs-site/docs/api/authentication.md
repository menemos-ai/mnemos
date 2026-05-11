---
sidebar_label: Authentication
sidebar_position: 2
---

# Authentication

The `GET /api/memory/:tokenId` endpoint requires wallet signature authentication. All other endpoints are currently open.

## How It Works

The API uses `WalletAuthGuard`, which implements EIP-191 `personal_sign` verification. The caller proves ownership of a wallet address by signing a deterministic challenge message without transmitting the private key.

### Required Headers

| Header | Value |
|---|---|
| `x-wallet-address` | EIP-55 checksummed wallet address |
| `x-wallet-signature` | Hex-encoded EIP-191 signature of the challenge message |
| `x-wallet-timestamp` | Unix timestamp in **seconds** (not milliseconds) |

### Challenge Message Format

The string you sign is:

```
mnemos:access:<tokenId>:<checksummedAddress>:<timestamp>
```

Example for token ID `42`, address `0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B`, timestamp `1715000000`:

```
mnemos:access:42:0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B:1715000000
```

### Timestamp Window

The timestamp must be within **120 seconds** of the server's current time. Use `Math.floor(Date.now() / 1000)` — Unix seconds, not milliseconds.

### Access Check

After verifying the signature, the guard checks that the recovered address is either:
- The current ERC-721 owner of the token, or
- An active renter (checked via `isCurrentRenter` on the marketplace contract)

If neither, the request is rejected with `403 Forbidden`.

---

## Example: Signing with ethers.js

```ts
import { ethers } from 'ethers';

const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
const tokenId = '42';
const address = await signer.getAddress();
const timestamp = Math.floor(Date.now() / 1000).toString();

const challenge = `mnemos:access:${tokenId}:${address}:${timestamp}`;
const signature = await signer.signMessage(challenge);

const response = await fetch(`http://localhost:3001/api/memory/${tokenId}`, {
  headers: {
    'x-wallet-address':   address,
    'x-wallet-signature': signature,
    'x-wallet-timestamp': timestamp,
  },
});
```

## Example: Signing with viem

```ts
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const tokenId = '42';
const timestamp = Math.floor(Date.now() / 1000).toString();
const challenge = `mnemos:access:${tokenId}:${account.address}:${timestamp}`;

const signature = await account.signMessage({ message: challenge });

const response = await fetch(`http://localhost:3001/api/memory/${tokenId}`, {
  headers: {
    'x-wallet-address':   account.address,
    'x-wallet-signature': signature,
    'x-wallet-timestamp': timestamp,
  },
});
```

---

## Notes

- The API is **stateless** — signatures are not stored or consumed server-side. Any valid signature can be replayed within the 120-second window. A production deployment should add a consumed-nonce store to prevent replay attacks.
- Only `GET /api/memory/:tokenId` (download memory bundle) requires auth. The info endpoint (`GET /api/memory/:tokenId/info`) is public.

---

**Next:** [Memory API →](/api/memory-api)
