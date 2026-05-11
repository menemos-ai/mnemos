---
sidebar_label: Load Memory
sidebar_position: 5
---

# Load Memory

Methods for reading memory content and on-chain provenance from the registry.

---

## loadMemory()

Download and decrypt a token's memory bundle from 0G Storage.

```ts
loadMemory(tokenId: bigint): Promise<MemoryBundle>
```

**Returns:** `MemoryBundle` — the decrypted agent memory.

```ts
const bundle = await mnemos.loadMemory(42n);

console.log(bundle.data);     // the agent's stored state
console.log(bundle.metadata); // category, agentId, tags, etc.
```

### Decryption Behavior

The SDK uses the `storageUri` prefix to determine which key scheme to use:

| URI prefix | Key derivation | Who can decrypt |
|---|---|---|
| `v2:0g://...` | `contentHash[0:32]` from on-chain data | Anyone with the `contentHash` |
| `0g://...` (v1) | `keccak256(walletAddress)` | Only the original creator |

For v2 tokens, the decryption key is derived from the publicly available on-chain `contentHash`. This means any party can decrypt a v2 token — there is no cryptographic access restriction. See [Privacy & Access →](/concepts/privacy).

For v1 tokens, decryption only succeeds if the calling wallet is the same address that originally minted the token.

---

## getMemoryInfo()

Read the on-chain provenance fields for a token from the `MemoryRegistry` contract.

```ts
getMemoryInfo(tokenId: bigint): Promise<MemoryInfo>
```

```ts
interface MemoryInfo {
  tokenId:     bigint;
  contentHash: `0x${string}`;
  storageUri:  string;
  creator:     `0x${string}`;
  parent:      bigint;         // 0n for root tokens; parent token ID for forks
  timestamp:   bigint;         // block timestamp at mint time
}
```

```ts
const info = await mnemos.getMemoryInfo(42n);

console.log(info.creator);    // "0x..."
console.log(info.parent);     // 0n (root) or <parentTokenId> (fork)
console.log(info.timestamp);  // block timestamp (bigint)
```

Use `getMemoryInfo` to verify a token's provenance — content hash, creator, fork lineage — before purchasing or renting.

---

## hasAccess()

Check whether an address currently has access to a token as its owner or as an active renter.

```ts
hasAccess(tokenId: bigint, callerAddress: `0x${string}`): Promise<boolean>
```

```ts
const allowed = await mnemos.hasAccess(42n, '0xYourAddress');

if (allowed) {
  const bundle = await mnemos.loadMemory(42n);
}
```

This method checks two things in parallel:
1. Whether `callerAddress` is the current ERC-721 owner (`ownerOf`)
2. Whether `callerAddress` has an active rental (`isCurrentRenter`) — checked on-chain, no off-chain state

Returns `true` if either check passes. If the token does not exist, `ownerOf` reverts — `hasAccess` handles this gracefully and returns `false`.

---

**Next:** [Types Reference →](/sdk/types-reference)
