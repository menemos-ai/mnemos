---
sidebar_label: snapshot()
sidebar_position: 2
---

# snapshot()

Serializes an agent's memory bundle to JSON, encrypts it, uploads it to 0G Storage, and mints a provenance NFT on 0G Chain. Returns a `SnapshotResult` when the on-chain transaction confirms.

## Signature

```ts
snapshot(bundle: MemoryBundle, parentTokenId?: bigint): Promise<SnapshotResult>
```

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `bundle` | `MemoryBundle` | The agent's memory state. See [MemoryBundle →](/sdk/types-reference#memorybundle) |
| `parentTokenId` | `bigint` (optional) | Token ID of a parent snapshot — for minting a fork. Pass `0n` or omit for a root token. |

## Returns

`Promise<SnapshotResult>`

```ts
interface SnapshotResult {
  tokenId:     bigint;         // minted NFT token ID on MemoryRegistry
  contentHash: `0x${string}`; // keccak256(plaintext JSON) — also the decryption key seed
  storageUri:  string;         // "v2:0g://<rootHash>" — content address on 0G Storage
  txHash:      `0x${string}`; // on-chain transaction hash
  timestamp:   number;         // Date.now() at time of call
}
```

## Example

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
    createdAt: Date.now(),
    tags: ['defi', 'yield'],
  },
};

const result = await mnemos.snapshot(bundle);

console.log(result.tokenId);    // 3n
console.log(result.storageUri); // "v2:0g://0xabc..."
console.log(result.txHash);     // "0xdef..."
```

## What Happens Internally

1. `JSON.stringify(bundle)` — serializes the bundle
2. `contentHash = keccak256(plaintext)` — derives both the on-chain identifier and the encryption key seed
3. NaCl secretbox encryption with a 24-byte random nonce (nonce || ciphertext stored together)
4. Upload to 0G Storage via `Indexer.upload` — returns a `0g://<rootHash>` URI
5. `MemoryRegistry.mintMemory(contentHash, "v2:" + uri)` — mints the NFT
6. Waits for transaction receipt and parses the `MemoryMinted` event for the token ID

The call blocks until the transaction is confirmed on-chain (up to 120-second timeout, polling every 3 seconds).

## Notes

- `tokenId` is extracted from the `MemoryMinted` event log. Keep it — you need it for listing, forking, or loading.
- The `contentHash` is public on-chain. Anyone with the `contentHash` can derive the decryption key. See [Privacy & Access →](/concepts/privacy) for the full explanation.
- For recurring snapshots, use [`autoSnapshot()`](/sdk/auto-snapshot) instead of calling `snapshot()` in a loop.

---

**Next:** [autoSnapshot() →](/sdk/auto-snapshot)
