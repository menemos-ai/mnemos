---
sidebar_label: Types Reference
sidebar_position: 6
---

# Types Reference

All exported types from `@mnemos/sdk`.

---

## MemoryBundle

The agent's memory state. Passed to `snapshot()` and returned by `loadMemory()`.

```ts
interface MemoryBundle {
  data:     unknown;
  metadata: MemoryMetadata;
}
```

`data` is any JSON-serializable value — your agent's state object. The SDK does not validate or transform it.

---

## MemoryMetadata

Descriptive fields attached to each memory snapshot. `category` is the only required field.

```ts
interface MemoryMetadata {
  category:   MemoryCategory;
  title?:     string;
  agentId?:   string;
  version?:   string;
  createdAt?: number;   // Unix timestamp in ms
  tags?:      string[];
}
```

---

## MemoryCategory

A string union of the canonical memory categories. The type allows arbitrary strings via `(string & {})` so you can use custom categories without TypeScript errors.

```ts
type MemoryCategory =
  | 'trading'
  | 'research'
  | 'support'
  | 'gaming'
  | 'social'
  | (string & {});
```

---

## SnapshotResult

Returned by `snapshot()` after a successful on-chain mint.

```ts
interface SnapshotResult {
  tokenId:     bigint;         // minted NFT token ID
  contentHash: `0x${string}`; // keccak256(plaintext JSON)
  storageUri:  string;         // "v2:0g://<rootHash>"
  txHash:      `0x${string}`; // on-chain transaction hash
  timestamp:   number;         // Date.now() at call time
}
```

---

## MemoryInfo

On-chain provenance fields for a token. Returned by `getMemoryInfo()`.

```ts
interface MemoryInfo {
  tokenId:     bigint;
  contentHash: `0x${string}`;
  storageUri:  string;
  creator:     `0x${string}`;
  parent:      bigint;   // 0n for root tokens; parent token ID for forks
  timestamp:   bigint;   // block timestamp at mint time (seconds)
}
```

Note: `timestamp` here is a `bigint` (block timestamp in seconds), whereas `SnapshotResult.timestamp` is a `number` (Date.now() in milliseconds).

---

## ListingTerms

Passed to `list()`. Set any price to `0n` to disable that option.

```ts
interface ListingTerms {
  buyPrice:        bigint; // 0n = not for sale
  rentPricePerDay: bigint; // 0n = not for rent
  forkPrice:       bigint; // 0n = not forkable
  royaltyBps:      number; // basis points; max 5000 (50%)
}
```

---

## ListingEvent

Returned by `scanListings()`. Sourced from `Listed` event logs.

```ts
interface ListingEvent {
  tokenId:         bigint;
  seller:          `0x${string}`;
  buyPrice:        bigint;
  rentPricePerDay: bigint;
  forkPrice:       bigint;
  royaltyBps:      number;
}
```

---

## AutoSnapshotOptions

Passed to `autoSnapshot()`.

```ts
interface AutoSnapshotOptions {
  intervalMs:  number;
  buildBundle: () => MemoryBundle | Promise<MemoryBundle>;
  onSnapshot?: (result: SnapshotResult) => void;
  onError?:    (error: Error) => void;
}
```

---

## MnemosClientConfig

Passed to the `MnemosClient` constructor. See [Configuration →](/sdk/configuration) for field descriptions.

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
```

---

**Next:** [Configuration →](/sdk/configuration)
