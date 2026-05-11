---
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

This guide takes you from zero to a working memory snapshot in about 5 minutes.

## 1. Install the SDK

```bash
npm install @mnemos-sdk/sdk @0gfoundation/0g-ts-sdk
```

`@0gfoundation/0g-ts-sdk` is a required peer dependency for 0G Storage uploads and downloads.

---

## 2. Configure Environment

Set up your `.env` file as described in [Environment Setup →](/getting-started/environment). The minimum required variable is `AGENT_PRIVATE_KEY`; the rest are fixed 0G Mainnet values.

---

## 3. Initialize MnemosClient

`MnemosClient` is the single entry point for all SDK operations. Create one instance per agent and reuse it.

```ts
import 'dotenv/config';
import { MnemosClient } from '@mnemos-sdk/sdk';

const mnemos = new MnemosClient({
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chainId: parseInt(process.env.OG_CHAIN_ID!),
  rpcUrl: process.env.OG_RPC_URL!,
  storageNodeUrl: process.env.OG_STORAGE_NODE!,
  registryAddress: process.env.REGISTRY_ADDRESS as `0x${string}`,
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS as `0x${string}`,
});
```

See [SDK Overview →](/sdk/overview) for all constructor options.

---

## 4. Snapshot Your Agent's Memory

A snapshot serializes your agent's state to JSON, encrypts it, uploads it to 0G Storage, and mints a provenance NFT on 0G Chain — all in one call.

```ts
import type { MemoryBundle } from '@mnemos-sdk/sdk';

const bundle: MemoryBundle = {
  data: {
    trades: [{ pair: 'ETH/USDC', amount: 1.5, side: 'buy' }],
    totalPnl: 42.0,
  },
  metadata: {
    category: 'trading',
    agentId: 'my-agent-v1',
    version: '1.0.0',
  },
};

const result = await mnemos.snapshot(bundle);

console.log(result.tokenId);    // bigint — the minted NFT token ID
console.log(result.storageUri); // "v2:0g://..." — content address on 0G Storage
console.log(result.txHash);     // on-chain transaction hash
```

The `result.tokenId` is the on-chain identity of this memory snapshot. Keep it — you need it to list, load, or fork the memory later.

---

## 5. Set Up Auto-Snapshots (Recommended)

For long-running agents, use `autoSnapshot` to persist state on a timer automatically. It returns a `stop()` function.

```ts
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000, // snapshot every 30 seconds
  buildBundle: () => ({
    data: myAgent.getState(),
    metadata: {
      category: 'trading',
      agentId: 'my-agent-v1',
      version: '1.0.0',
    },
  }),
  onSnapshot: (result) => {
    console.log(`Snapshot minted — token ID: ${result.tokenId}`);
  },
  onError: (err) => {
    console.error(`Snapshot failed: ${err.message}`);
  },
});

process.on('SIGINT', () => { stop(); process.exit(0); });
```

Errors are caught internally and passed to `onError`, so the agent does not crash on a failed snapshot. See [Auto-Snapshot →](/sdk/auto-snapshot) for all options.

---

## 6. List on the Marketplace (Optional)

Once you have a `tokenId`, you can list it for buy, rent, or fork — or any combination. Set a price to `0n` to disable that option.

```ts
const txHash = await mnemos.list(result.tokenId, {
  buyPrice:        BigInt('1000000000000000000'), // 1 A0GI
  rentPricePerDay: BigInt('100000000000000000'),  // 0.1 A0GI/day
  forkPrice:       BigInt('500000000000000000'),  // 0.5 A0GI to fork
  royaltyBps:      500,                           // 5% royalty
});
```

All prices are in wei (A0GI × 10¹⁸). See [Marketplace Operations →](/sdk/marketplace) for full details.

---

## What's Next

| | |
|---|---|
| [snapshot() reference →](/sdk/snapshot) | Full options and return type for manual snapshots |
| [autoSnapshot() reference →](/sdk/auto-snapshot) | Interval, callbacks, and error handling |
| [Marketplace Operations →](/sdk/marketplace) | Buy, rent, fork, and royalty calls |
| [Load Memory →](/sdk/load-memory) | Download and decrypt a token's memory bundle |
| [REST API →](/api/overview) | HTTP endpoints — no private key required on the client |
