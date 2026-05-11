---
sidebar_label: Memory Tokens
sidebar_position: 3
---

# Memory Tokens

A memory token is an ERC-721 NFT where each token ID represents exactly one immutable memory snapshot. Think of it as a provenance certificate: it proves what was stored, who stored it, and when — with a permanent pointer to the encrypted content on 0G Storage.

## On-Chain Fields

Each minted token records five fields in the `MemoryRegistry` contract:

| Field | Type | Description |
|---|---|---|
| `contentHash` | `bytes32` | `keccak256(plaintext JSON)` — both the content identifier and the encryption key seed |
| `storageURI` | `string` | Pointer to the encrypted bundle on 0G Storage — format: `v2:0g://rootHash` |
| `parentTokenId` | `uint256` | `0` for a root token; non-zero for a forked token (points to the parent) |
| `creator` | `address` | The wallet that minted this token |
| `createdAt` | `uint256` | Block timestamp at mint time |

## The `contentHash` Dual Role

The `contentHash` is `keccak256(plaintext JSON)` — which means it serves two purposes simultaneously:

1. **On-chain identifier**: it uniquely identifies the content stored in this token
2. **Encryption key seed**: the decryption key is derived from the first 32 bytes of this hash

This design means anyone who can read the `contentHash` on-chain can derive the decryption key and decrypt the bundle. See [Privacy & Access](/concepts/privacy) for full details on what this means for confidentiality.

## The `storageURI` Format

Storage URIs use a versioned prefix:

- `v2:0g://rootHash` — current scheme (v2 key: decryptable by anyone with `contentHash`)
- `0g://rootHash` — legacy scheme (v1 key: only the original creator can decrypt)

The `v2:` prefix allows consumers to distinguish which decryption path to use.

## Fork Lineage

When a token is forked through the marketplace, the `MemoryMarketplace` calls `MemoryRegistry.mintFork()` on the buyer's behalf. The new child token gets its own token ID, but its `parentTokenId` points back to the forked token.

- Root tokens: `parentTokenId = 0`
- Fork tokens: `parentTokenId = <original token ID>`

The registry exposes `getLineage(tokenId, maxDepth)` which walks the parent chain and returns the full ancestry of a token. This makes provenance queryable on-chain — you can always trace a forked agent's memory back to its origin.

## Why Immutability Matters

Once minted, a memory token's fields are permanent. The `contentHash` cannot be changed, the `storageURI` cannot be updated, and the `creator` cannot be reassigned. This immutability is what makes provenance trustworthy: a token's history cannot be rewritten.

For type definitions, see [Types Reference →](/sdk/types-reference).

---

**Next:** [Marketplace mechanics →](/concepts/marketplace)
