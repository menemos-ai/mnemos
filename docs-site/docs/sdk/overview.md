---
sidebar_label: SDK Overview
sidebar_position: 1
---

# SDK Overview

`@mnemos/sdk` is the TypeScript library for integrating AI agent memory with the 0G Network. It wraps three concerns — encryption, decentralized storage, and on-chain provenance — behind a single class: `MnemosClient`.

## Installation

```bash
npm install @mnemos/sdk @0gfoundation/0g-ts-sdk
```

`@0gfoundation/0g-ts-sdk` is a required peer dependency for 0G Storage uploads and downloads.

## The MnemosClient

`MnemosClient` is the single entry point for all SDK operations. Create one instance per agent.

```ts
import { MnemosClient } from '@mnemos/sdk';

const mnemos = new MnemosClient({
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chainId: parseInt(process.env.OG_CHAIN_ID!),
  rpcUrl: process.env.OG_RPC_URL!,
  storageNodeUrl: process.env.OG_STORAGE_NODE!,
  registryAddress: process.env.REGISTRY_ADDRESS as `0x${string}`,
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS as `0x${string}`,
});
```

See [Configuration →](/sdk/configuration) for all constructor options.

## Methods at a Glance

| Method | Description |
|---|---|
| [`snapshot(bundle)`](/sdk/snapshot) | Encrypt, upload, and mint a memory token in one call |
| [`autoSnapshot(options)`](/sdk/auto-snapshot) | Run `snapshot()` on a timer — returns a `stop()` function |
| [`list(tokenId, terms)`](/sdk/marketplace#list) | List a token for buy, rent, or fork |
| [`buy(tokenId)`](/sdk/marketplace#buy) | Purchase full ownership of a listed token |
| [`rent(tokenId, days)`](/sdk/marketplace#rent) | Rent time-bounded access to a token |
| [`fork(parentId, ...)`](/sdk/marketplace#fork) | Mint a child token derived from a parent |
| [`payRoyalty(parentId, amount)`](/sdk/marketplace#payroyalty) | Pay earnings to a parent token's creator |
| [`getListing(tokenId)`](/sdk/marketplace#getlisting) | Read a token's current marketplace listing |
| [`scanListings(fromBlock?)`](/sdk/marketplace#scanlistings) | Scan all `Listed` events and return deduplicated listings |
| [`loadMemory(tokenId)`](/sdk/load-memory#loadmemory) | Download and decrypt a token's memory bundle |
| [`getMemoryInfo(tokenId)`](/sdk/load-memory#getmemoryinfo) | Read on-chain provenance fields for a token |
| [`hasAccess(tokenId, address)`](/sdk/load-memory#hasaccess) | Check if an address is the owner or active renter |

## Usage Pattern

Agents typically use `autoSnapshot` to persist state on a timer and the marketplace methods to monetize or inherit memory:

```ts
// Persist state every 30 seconds
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000,
  buildBundle: () => ({ data: agent.getState(), metadata: { category: 'trading', agentId: 'my-agent' } }),
  onSnapshot: (r) => console.log('Minted token', r.tokenId),
  onError: (e) => console.error('Snapshot failed', e.message),
});

// At shutdown
process.on('SIGINT', () => { stop(); process.exit(0); });
```

## Error Handling

All methods throw on failure. Wrap in `try/catch` or use the `onError` callback in `autoSnapshot`:

```ts
try {
  const result = await mnemos.snapshot(bundle);
} catch (err) {
  console.error('Snapshot failed:', err.message);
}
```

`autoSnapshot` catches errors internally and forwards them to `onError`, so a failed snapshot does not crash the agent.

---

**Next:** [snapshot() →](/sdk/snapshot)
