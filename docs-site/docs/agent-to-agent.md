---
title: "Mnemos Agent Integration — Agent-to-Agent Docs"
slug: /agent-to-agent
sidebar_label: "Agent Integration"
---

# Mnemos — Agent Integration Reference

> This page is designed for AI agents and coding assistants. Read the **AGENT START HERE** block to begin. Use the **Decision Tree** to jump to a specific operation. Continue to the numbered sections for full parameter details.

---

## AGENT START HERE

> **Instructions for AI agents:** Copy the block below as your integration context. This block alone is sufficient to initialize `MnemosClient` and start snapshotting. Use the Decision Tree below to find any specific operation. Follow links to numbered sections only when you need full parameter tables or error handling examples.

**Step 1 — Install**

```bash
npm install @mnemos/sdk @0gfoundation/0g-ts-sdk
```

**Step 2 — Set environment variables**

```bash
# Required — your wallet private key
AGENT_PRIVATE_KEY=0x<your-wallet-key>

# Fixed values — copy as-is for 0G Mainnet
OG_CHAIN_ID=16661
OG_RPC_URL=https://evmrpc.0g.ai
OG_STORAGE_NODE=https://indexer-storage-turbo.0g.ai
REGISTRY_ADDRESS=0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E
MARKETPLACE_ADDRESS=0xFeb5Ac77Cd7746e2b35825dA800458D660D10209
```

**Step 3 — Initialize client and start snapshotting**

```ts
import 'dotenv/config';
import { MnemosClient } from '@mnemos/sdk';

const mnemos = new MnemosClient({
  privateKey:         process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chainId:            Number(process.env.OG_CHAIN_ID),
  rpcUrl:             process.env.OG_RPC_URL!,
  storageNodeUrl:     process.env.OG_STORAGE_NODE!,
  registryAddress:    process.env.REGISTRY_ADDRESS as `0x${string}`,
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS as `0x${string}`,
});

// Auto-snapshot every 30 seconds
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000,
  buildBundle: () => ({
    data: { /* your agent state */ },
    metadata: { category: 'trading', agentId: 'my-agent-v1', version: '1.0.0' },
  }),
  onSnapshot: (r) => console.log(`Memory minted — token ${r.tokenId}`),
  onError:    (e) => console.error(`Snapshot failed: ${e.message}`),
});

process.on('SIGINT', () => { stop(); process.exit(0); });
```

That's the minimum integration. Your agent's memory is now an on-chain asset.

---

## Decision Tree

- If you want to **take a one-off memory snapshot** → [snapshot()](#snapshot)
- If you want to **auto-snapshot on a timer** → [autoSnapshot()](#autosnapshot)
- If you want to **list a token for sale/rent/fork** → [list()](#list)
- If you want to **buy a token outright** → [buy()](#buy)
- If you want to **rent time-bounded access** → [rent()](#rent)
- If you want to **fork a token and mint a child** → [fork()](#fork)
- If you want to **pay royalty to a parent creator** → [payRoyalty()](#payroyalty)
- If you want to **read a token's listing terms** → [getListing()](#getlisting)
- If you want to **browse all marketplace listings** → [scanListings()](#scanlistings)
- If you want to **download and decrypt a memory bundle** → [loadMemory()](#loadmemory)
- If you want to **read a token's on-chain provenance** → [getMemoryInfo()](#getmemoryinfo)
- If you want to **check if an address has access** → [hasAccess()](#hasaccess)

---

## Install & Configure

**Purpose:** Install the SDK and initialize `MnemosClient` — the single entry point for all operations.

**When to use:** Once at agent startup, before calling any other method.

```ts
import 'dotenv/config';
import { MnemosClient } from '@mnemos/sdk';

const mnemos = new MnemosClient({
  privateKey:         process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chainId:            Number(process.env.OG_CHAIN_ID),
  rpcUrl:             process.env.OG_RPC_URL!,
  storageNodeUrl:     process.env.OG_STORAGE_NODE!,
  registryAddress:    process.env.REGISTRY_ADDRESS as `0x${string}`,
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS as `0x${string}`,
});
```

**Parameters (`MnemosClientConfig`)**

| Field | Type | Description |
|---|---|---|
| `privateKey` | `` `0x${string}` `` | Wallet private key — signs transactions and derives the encryption key |
| `chainId` | `number` | Chain ID — use `Number(process.env.OG_CHAIN_ID)` (env vars are strings) |
| `rpcUrl` | `string` | EVM RPC endpoint for 0G Chain |
| `storageNodeUrl` | `string` | 0G Storage indexer URL |
| `registryAddress` | `` `0x${string}` `` | MemoryRegistry contract address |
| `marketplaceAddress` | `` `0x${string}` `` | MemoryMarketplace contract address |

**Error handling**

```ts
try {
  const mnemos = new MnemosClient({ /* ... */ });
} catch (err) {
  // Throws if privateKey format is invalid or addresses are malformed
  console.error('Client init failed:', (err as Error).message);
}
```

---

## snapshot()

**Purpose:** Encrypt a memory bundle, upload it to 0G Storage, and mint a provenance NFT on 0G Chain.

**When to use:** When you want to persist a point-in-time snapshot of your agent's state as an on-chain asset.

```ts
import type { MemoryBundle } from '@mnemos/sdk';

const bundle: MemoryBundle = {
  data: {
    trades: [{ pair: 'ETH/USDC', amount: 1.5, side: 'buy' }],
    totalPnl: 42.0,
  },
  metadata: {
    category: 'trading',
    agentId:  'my-agent-v1',
    version:  '1.0.0',
  },
};

const result = await mnemos.snapshot(bundle);

console.log(result.tokenId);    // 3n — the minted NFT token ID
console.log(result.storageUri); // "v2:0g://0xabc..."
console.log(result.txHash);     // "0xdef..."
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `bundle` | `MemoryBundle` | Agent memory state and metadata |
| `parentTokenId` | `bigint` (optional) | Pass to mint a fork; omit for a root token |

**Returns** `Promise<SnapshotResult>`

| Field | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Minted NFT token ID — save this for listing or loading |
| `contentHash` | `` `0x${string}` `` | `keccak256(plaintext)` — also the decryption key seed |
| `storageUri` | `string` | Content address on 0G Storage (`v2:0g://...`) |
| `txHash` | `` `0x${string}` `` | On-chain transaction hash |
| `timestamp` | `number` | `Date.now()` at call time (ms) |

**Error handling**

```ts
try {
  const result = await mnemos.snapshot(bundle);
} catch (err) {
  // Throws on: 0G Storage upload failure, insufficient A0GI balance, RPC error
  console.error('Snapshot failed:', (err as Error).message);
}
```

---

## autoSnapshot()

**Purpose:** Run `snapshot()` on a configurable interval and return a `stop()` function.

**When to use:** For long-running agents that need automatic, continuous memory persistence without a manual loop.

```ts
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000, // every 30 seconds

  buildBundle: () => ({
    data: myAgent.getState(),
    metadata: {
      category: 'trading',
      agentId:  'my-agent-v1',
      version:  '1.0.0',
    },
  }),

  onSnapshot: (result) => {
    console.log(`Snapshot minted — token ID: ${result.tokenId}`);
  },

  onError: (err) => {
    console.error(`Snapshot failed: ${err.message}`);
    // Timer continues — the agent does not crash on a failed snapshot
  },
});

// Stop on shutdown
process.on('SIGINT', () => {
  stop();
  process.exit(0);
});
```

**Parameters (`AutoSnapshotOptions`)**

| Field | Type | Description |
|---|---|---|
| `intervalMs` | `number` | Milliseconds between snapshots |
| `buildBundle` | `() => MemoryBundle \| Promise<MemoryBundle>` | Called each tick to produce the bundle; can be async |
| `onSnapshot` | `(result: SnapshotResult) => void` (optional) | Called after each successful snapshot |
| `onError` | `(error: Error) => void` (optional) | Called when a snapshot fails; timer continues |

**Returns** `() => void` — call to cancel the interval timer.

**Error handling**

Errors inside each tick are caught internally and forwarded to `onError`. The agent does not crash. If `onError` is not provided, errors are silently swallowed.

---

## list()

**Purpose:** List a memory token on the marketplace for buy, rent, fork, or any combination.

**When to use:** After `snapshot()` returns a `tokenId` and you want to monetize or share the memory.

> **Important:** The SDK does not call `setApprovalForAll` automatically. You must approve the marketplace on the MemoryRegistry contract before listing. This is a one-time call per wallet — the approval persists on-chain.

```ts
import { createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// tokenId must come from a prior snapshot() call
const tokenId = result.tokenId;

// Construct a wallet client to call setApprovalForAll (one-time, per wallet)
const chain = defineChain({
  id:               Number(process.env.OG_CHAIN_ID),
  name:             '0G Network',
  nativeCurrency:   { name: '0G', symbol: 'A0GI', decimals: 18 },
  rpcUrls:          { default: { http: [process.env.OG_RPC_URL!] } },
});
const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({ account, chain, transport: http(process.env.OG_RPC_URL!) });

// ERC-721 setApprovalForAll ABI fragment
const ERC721_APPROVAL_ABI = [{
  name:    'setApprovalForAll',
  type:    'function',
  inputs:  [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }],
  outputs: [],
}] as const;

// Approve marketplace — call once per agent wallet (approval persists on-chain)
await walletClient.writeContract({
  address:      process.env.REGISTRY_ADDRESS as `0x${string}`,
  abi:          ERC721_APPROVAL_ABI,
  functionName: 'setApprovalForAll',
  args:         [process.env.MARKETPLACE_ADDRESS as `0x${string}`, true],
});

// List the token
const txHash = await mnemos.list(tokenId, {
  buyPrice:        BigInt('1000000000000000000'), // 1 A0GI
  rentPricePerDay: BigInt('100000000000000000'),  // 0.1 A0GI/day
  forkPrice:       BigInt('500000000000000000'),  // 0.5 A0GI to fork
  royaltyBps:      500,                           // 5% royalty on forks
});
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID from `snapshot()` |
| `terms.buyPrice` | `bigint` | Buy price in wei; `0n` = not for sale |
| `terms.rentPricePerDay` | `bigint` | Rent price per day in wei; `0n` = not for rent |
| `terms.forkPrice` | `bigint` | Fork price in wei; `0n` = not forkable |
| `terms.royaltyBps` | `number` | Royalty in basis points (max 5000 = 50%) |

**Returns** ``Promise<`0x${string}`>`` — transaction hash.

**Error handling**

```ts
try {
  const txHash = await mnemos.list(tokenId, terms);
} catch (err) {
  // "execution reverted" → setApprovalForAll was not called first
  // "Not token owner"    → tokenId does not belong to this wallet
  console.error('List failed:', (err as Error).message);
}
```

---

## buy()

**Purpose:** Purchase full ownership of a listed memory token.

**When to use:** When you want to acquire a memory token outright — after `buy()`, you become the ERC-721 owner and the listing is removed.

> `tokenId` must come from `scanListings()` or a known listed token.

```ts
// Read the listing first to verify the price before buying
const listing = await mnemos.getListing(42n);
console.log(`Buy price: ${listing.buyPrice} wei`);

const txHash = await mnemos.buy(42n);
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID of the listed token to buy |

**Returns** ``Promise<`0x${string}`>`` — transaction hash.

**Error handling**

```ts
try {
  const txHash = await mnemos.buy(42n);
} catch (err) {
  // "Not for sale"          → token has no buyPrice listing
  // "Insufficient payment"  → A0GI balance below buyPrice
  console.error('Buy failed:', (err as Error).message);
}
```

---

## rent()

**Purpose:** Rent time-bounded access to a listed memory token.

**When to use:** When you want to read a token's memory without purchasing ownership — multiple agents can rent the same token simultaneously.

> `tokenId` must come from a token listed with `rentPricePerDay > 0n`.

```ts
// Read rent price before renting
const listing = await mnemos.getListing(42n);
const durationDays = 7;
// Total cost = rentPricePerDay × durationDays
const totalCost = listing.rentPricePerDay * BigInt(durationDays);
console.log(`Total rent cost: ${totalCost} wei`);

const txHash = await mnemos.rent(42n, durationDays);
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID of the listed token to rent |
| `durationDays` | `number` | Number of days to rent; extends from current expiry if already renting |

**Returns** ``Promise<`0x${string}`>`` — transaction hash.

**Error handling**

```ts
try {
  const txHash = await mnemos.rent(42n, 7);
} catch (err) {
  // "Not for rent"         → token has no rentPricePerDay listing
  // "Insufficient payment" → A0GI balance below total rent cost
  console.error('Rent failed:', (err as Error).message);
}
```

---

## fork()

**Purpose:** Mint a new child token derived from a parent — the child starts as a reference to the parent's content.

**When to use:** When you want to inherit a parent agent's memory and build on top of it, with royalty obligations to the parent's creator.

> `parentTokenId` must refer to a token listed with `forkPrice > 0n`. Fetch the parent's metadata and listing before calling `fork()`.

```ts
const parentTokenId = 42n;

// Step 1: fetch the parent's on-chain metadata
const info = await mnemos.getMemoryInfo(parentTokenId);

// Step 2: fetch the fork price
const listing = await mnemos.getListing(parentTokenId);

// Step 3: mint the child token
// contentHash and storageUri are copied from the parent — the child starts
// as a reference to the parent's content
const txHash = await mnemos.fork(
  parentTokenId,
  info.contentHash,
  info.storageUri,
  listing.forkPrice, // 0.5 A0GI to fork (example)
);
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `parentTokenId` | `bigint` | Token ID of the parent to fork |
| `contentHash` | `` `0x${string}` `` | `contentHash` from `getMemoryInfo(parentTokenId)` |
| `storageUri` | `string` | `storageUri` from `getMemoryInfo(parentTokenId)` |
| `value` | `bigint` | Fork price in wei — must equal `listing.forkPrice` |

**Returns** ``Promise<`0x${string}`>`` — transaction hash.

**Error handling**

```ts
try {
  const txHash = await mnemos.fork(parentTokenId, info.contentHash, info.storageUri, listing.forkPrice);
} catch (err) {
  // "Not forkable"         → forkPrice is 0n
  // "Insufficient payment" → value below forkPrice
  console.error('Fork failed:', (err as Error).message);
}
```

---

## payRoyalty()

**Purpose:** Pay a share of earnings to the current owner of a parent token.

**When to use:** When your forked agent has earned revenue and you want to honor the royalty obligation to the parent creator.

> Takes `parentTokenId` (the parent of your forked token), not the child token ID. The `amount` is caller-supplied — it represents the royalty share you choose to pay.

```ts
const parentTokenId = 42n;

// Optional: read the agreed royaltyBps from the parent's listing
const listing = await mnemos.getListing(parentTokenId);
const earnedInWei = BigInt('500000000000000000'); // 0.5 A0GI earned this cycle
// Suggested royalty = earnedInWei * royaltyBps / 10000
const suggestedRoyalty = (earnedInWei * BigInt(listing.royaltyBps)) / 10000n;

// Pay the royalty — amount is caller-determined (honor-system in v1)
const txHash = await mnemos.payRoyalty(
  parentTokenId,
  suggestedRoyalty, // BigInt('25000000000000000') = 0.025 A0GI at 5%
);
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `parentTokenId` | `bigint` | Token ID of the parent (not the child/forked token) |
| `amount` | `bigint` | Royalty amount in wei — forwarded directly to the parent token's current owner |

**Returns** ``Promise<`0x${string}`>`` — transaction hash.

**Error handling**

```ts
try {
  const txHash = await mnemos.payRoyalty(parentTokenId, amount);
} catch (err) {
  // "No royalty payment" → amount is 0n
  // "Token has no parent" → parentTokenId is not a forked token
  console.error('payRoyalty failed:', (err as Error).message);
}
```

---

## getListing()

**Purpose:** Read the current marketplace listing terms for a token.

**When to use:** Before `buy()`, `rent()`, or `fork()` to verify price and availability, or to check if a token is listed at all.

```ts
const listing = await mnemos.getListing(42n);

console.log(listing.seller);          // "0x..."
console.log(`Buy:  ${listing.buyPrice} wei`);        // 0n = not for sale
console.log(`Rent: ${listing.rentPricePerDay} wei/day`); // 0n = not for rent
console.log(`Fork: ${listing.forkPrice} wei`);       // 0n = not forkable
console.log(`Royalty: ${listing.royaltyBps} bps`);   // e.g. 500 = 5%
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID to query |

**Returns** `Promise<{ seller, buyPrice, rentPricePerDay, forkPrice, royaltyBps }>`

| Field | Type | Description |
|---|---|---|
| `seller` | `` `0x${string}` `` | Address that listed the token |
| `buyPrice` | `bigint` | Buy price in wei; `0n` = not for sale |
| `rentPricePerDay` | `bigint` | Rent price per day in wei; `0n` = not for rent |
| `forkPrice` | `bigint` | Fork price in wei; `0n` = not forkable |
| `royaltyBps` | `number` | Royalty in basis points (0–5000) |

**Error handling**

```ts
try {
  const listing = await mnemos.getListing(42n);
  if (listing.buyPrice === 0n) console.log('Token is not for sale');
} catch (err) {
  console.error('getListing failed:', (err as Error).message);
}
```

---

## scanListings()

**Purpose:** Scan all `Listed` events from the marketplace and return deduplicated active listings.

**When to use:** To browse all available listings — e.g., to build a marketplace UI or find tokens to rent or fork.

```ts
// Scan all listings from genesis
const listings = await mnemos.scanListings();

for (const l of listings) {
  console.log(`Token ${l.tokenId} — seller: ${l.seller}, buy: ${l.buyPrice} wei`);
}

// Scan only from a specific block (faster for recent listings)
const recentListings = await mnemos.scanListings(21_000_000n);
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `fromBlock` | `bigint` (optional) | Start block for the log scan; defaults to `0n` (genesis) |

**Returns** `Promise<ListingEvent[]>`

| Field | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Listed token ID |
| `seller` | `` `0x${string}` `` | Seller address |
| `buyPrice` | `bigint` | Buy price in wei |
| `rentPricePerDay` | `bigint` | Rent price per day in wei |
| `forkPrice` | `bigint` | Fork price in wei |
| `royaltyBps` | `number` | Royalty basis points |

> `scanListings` returns event-sourced data. A listed token may have since been bought or unlisted — verify with `getListing()` before transacting.

**Error handling**

```ts
try {
  const listings = await mnemos.scanListings();
} catch (err) {
  console.error('scanListings failed:', (err as Error).message);
}
```

---

## loadMemory()

**Purpose:** Download and decrypt a token's memory bundle from 0G Storage.

**When to use:** When you want to read the content of a memory token you own or have rented.

```ts
const tokenId = 42n;
const callerAddress = process.env.WALLET_ADDRESS as `0x${string}`;

// Check access before attempting to load
const allowed = await mnemos.hasAccess(tokenId, callerAddress);
if (!allowed) {
  throw new Error('No access to this token — buy or rent it first');
}

const bundle = await mnemos.loadMemory(tokenId);

console.log(bundle.data);     // the agent's stored state
console.log(bundle.metadata); // category, agentId, tags, etc.
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID to load |

**Returns** `Promise<MemoryBundle>` — decrypted agent memory with `data` and `metadata`.

**Error handling**

```ts
try {
  const bundle = await mnemos.loadMemory(42n);
} catch (err) {
  // Decryption fails for v1 tokens if caller is not the original creator
  // Download fails if 0G Storage node is unreachable
  console.error('loadMemory failed:', (err as Error).message);
}
```

---

## getMemoryInfo()

**Purpose:** Read on-chain provenance fields for a token from the MemoryRegistry contract.

**When to use:** To verify a token's content hash, creator, fork lineage, and storage URI before purchasing, renting, or forking.

```ts
const info = await mnemos.getMemoryInfo(42n);

console.log(info.contentHash); // "0x..." — keccak256 of plaintext
console.log(info.storageUri);  // "v2:0g://..."
console.log(info.creator);     // "0x..." — original minter
console.log(info.parent);      // 0n = root; non-zero = forked token
console.log(info.timestamp);   // block timestamp (bigint, in seconds)
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID to query |

**Returns** `Promise<MemoryInfo>`

| Field | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Same as input |
| `contentHash` | `` `0x${string}` `` | `keccak256(plaintext)` — also the decryption key seed |
| `storageUri` | `string` | Content address on 0G Storage |
| `creator` | `` `0x${string}` `` | Wallet that originally minted the token |
| `parent` | `bigint` | `0n` for root tokens; parent token ID for forks |
| `timestamp` | `bigint` | Block timestamp at mint time (seconds, not ms) |

**Error handling**

```ts
try {
  const info = await mnemos.getMemoryInfo(42n);
} catch (err) {
  // Reverts if tokenId does not exist
  console.error('getMemoryInfo failed:', (err as Error).message);
}
```

---

## hasAccess()

**Purpose:** Check whether an address currently has access to a token as its owner or as an active renter.

**When to use:** Before calling `loadMemory()` to confirm the caller has the right to decrypt.

```ts
// Derive the caller's address from the private key
import { privateKeyToAccount } from 'viem/accounts';
const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
const callerAddress = account.address;

const allowed = await mnemos.hasAccess(42n, callerAddress);

if (allowed) {
  const bundle = await mnemos.loadMemory(42n);
} else {
  console.log('No access — buy or rent this token first');
}
```

**Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | `bigint` | Token ID to check |
| `callerAddress` | `` `0x${string}` `` | Address to check access for |

**Returns** `Promise<boolean>` — `true` if the address is the current owner or has an active rental.

**Error handling**

```ts
try {
  const allowed = await mnemos.hasAccess(42n, callerAddress);
} catch (err) {
  // Rare: reverts if RPC is unreachable
  console.error('hasAccess failed:', (err as Error).message);
}
```

---

## All Environment Variables

All six variables are required. The five fixed values below apply to 0G Mainnet and do not need to be looked up elsewhere.

| Variable | Value / Example | Required | Description |
|---|---|---|---|
| `AGENT_PRIVATE_KEY` | `0x<your-wallet-key>` | Yes | EVM wallet private key — signs all transactions and derives the storage encryption key |
| `OG_CHAIN_ID` | `16661` | Yes | 0G Mainnet chain ID — pass as `Number(process.env.OG_CHAIN_ID)` because env vars are strings |
| `OG_RPC_URL` | `https://evmrpc.0g.ai` | Yes | 0G EVM RPC endpoint |
| `OG_STORAGE_NODE` | `https://indexer-storage-turbo.0g.ai` | Yes | 0G Storage indexer URL for uploading and retrieving memory bundles |
| `REGISTRY_ADDRESS` | `0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E` | Yes | MemoryRegistry contract address on 0G Mainnet |
| `MARKETPLACE_ADDRESS` | `0xFeb5Ac77Cd7746e2b35825dA800458D660D10209` | Yes | MemoryMarketplace contract address on 0G Mainnet |

---

## Type Reference

All public types exported from `@mnemos/sdk`.

```ts
interface MnemosClientConfig {
  privateKey:         `0x${string}`;
  chainId:            number;
  rpcUrl:             string;
  storageNodeUrl:     string;
  registryAddress:    `0x${string}`;
  marketplaceAddress: `0x${string}`;
  storageMock?:       boolean;
}

interface MemoryBundle {
  data:     unknown;       // any JSON-serializable agent state
  metadata: MemoryMetadata;
}

interface MemoryMetadata {
  category:   MemoryCategory;
  title?:     string;
  agentId?:   string;
  version?:   string;
  createdAt?: number;      // Unix timestamp in ms
  tags?:      string[];
}

type MemoryCategory =
  | 'trading' | 'research' | 'support' | 'gaming' | 'social'
  | (string & {});          // allows custom category strings

interface SnapshotResult {
  tokenId:     bigint;
  contentHash: `0x${string}`;
  storageUri:  string;
  txHash:      `0x${string}`;
  timestamp:   number;     // Date.now() in ms
}

interface MemoryInfo {
  tokenId:     bigint;
  contentHash: `0x${string}`;
  storageUri:  string;
  creator:     `0x${string}`;
  parent:      bigint;     // 0n = root; non-zero = forked token
  timestamp:   bigint;     // block timestamp in seconds (not ms)
}

interface ListingTerms {
  buyPrice:        bigint; // 0n = not for sale
  rentPricePerDay: bigint; // 0n = not for rent
  forkPrice:       bigint; // 0n = not forkable
  royaltyBps:      number; // basis points; max 5000 (50%)
}

interface ListingEvent {
  tokenId:         bigint;
  seller:          `0x${string}`;
  buyPrice:        bigint;
  rentPricePerDay: bigint;
  forkPrice:       bigint;
  royaltyBps:      number;
}

interface AutoSnapshotOptions {
  intervalMs:  number;
  buildBundle: () => MemoryBundle | Promise<MemoryBundle>;
  onSnapshot?: (result: SnapshotResult) => void;
  onError?:    (error: Error) => void;
}
```

---

## Troubleshooting

**1. `Error: invalid private key` on `MnemosClient` init**

Cause: `AGENT_PRIVATE_KEY` is missing, empty, or not prefixed with `0x`.

Fix: Ensure the variable is set and starts with `0x`. Confirm `.env` is loaded with `import 'dotenv/config'` at the top of your entry file.

---

**2. `Error: insufficient funds` on `snapshot()`**

Cause: The wallet has no A0GI to pay gas for the on-chain mint transaction.

Fix: Fund the wallet address derived from `AGENT_PRIVATE_KEY` with A0GI on 0G Mainnet.

---

**3. `Error: execution reverted` on `list()`**

Cause: `setApprovalForAll` was not called before `list()`. The marketplace contract needs ERC-721 approval to transfer the token on behalf of the owner.

Fix: Call `setApprovalForAll` once per wallet using the viem walletClient pattern shown in the [list()](#list) section. The approval persists on-chain — you only need to do this once.

---

**4. `Error: upload failed` or timeout on `snapshot()`**

Cause: The 0G Storage node at `OG_STORAGE_NODE` is unreachable or returning errors.

Fix: Verify `OG_STORAGE_NODE=https://indexer-storage-turbo.0g.ai` is set correctly. Check network connectivity. The error is transient — retry `snapshot()` after a delay.

---

**5. `Error: could not detect network` or transactions landing on the wrong chain**

Cause: `OG_RPC_URL` is pointing to a different network, or `OG_CHAIN_ID` does not match the RPC endpoint.

Fix: Use `OG_RPC_URL=https://evmrpc.0g.ai` and `OG_CHAIN_ID=16661`. Verify the chain ID matches by calling `eth_chainId` on the RPC endpoint.

---

**6. TypeScript error: `Argument of type 'string' is not assignable to parameter of type 'number'` on `chainId`**

Cause: `process.env.OG_CHAIN_ID` is a `string`. Passing it directly to `chainId` (which expects `number`) fails at compile time.

Fix: Wrap with `Number()` — use `chainId: Number(process.env.OG_CHAIN_ID)` in `MnemosClientConfig`.

---
