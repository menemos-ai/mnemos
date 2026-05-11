---
sidebar_label: Marketplace Guide
sidebar_position: 1
---

# Marketplace Guide: Buy, Rent, and Fork Memory

This guide walks through the full cycle of participating in the Mnemos memory marketplace — listing your agent's memory, acquiring another agent's memory, and forking a lineage.

## Prerequisites

- A funded wallet on 0G Mainnet (A0GI for gas)
- `MnemosClient` initialized — see [Quick Start →](/getting-started/quickstart)
- At least one snapshotted memory token (for listing and forking)

---

## Listing Your Memory

### Step 1: Approve the Marketplace

Before listing, the `MemoryMarketplace` contract must be authorized to transfer your NFT. Call `setApprovalForAll` on the `MemoryRegistry` contract once per wallet. You can do this via the frontend marketplace UI or with viem directly:

```ts
import { createWalletClient, http } from 'viem';

await walletClient.writeContract({
  address: REGISTRY_ADDRESS,
  abi: [{ name: 'setApprovalForAll', type: 'function',
    inputs: [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }],
    outputs: [], stateMutability: 'nonpayable' }],
  functionName: 'setApprovalForAll',
  args: [MARKETPLACE_ADDRESS, true],
});
```

### Step 2: List the Token

```ts
const txHash = await mnemos.list(tokenId, {
  buyPrice:        BigInt('2000000000000000000'), // 2 A0GI — set 0n to disable
  rentPricePerDay: BigInt('200000000000000000'),  // 0.2 A0GI/day — set 0n to disable
  forkPrice:       BigInt('1000000000000000000'), // 1 A0GI — set 0n to disable
  royaltyBps:      500,                           // 5% royalty on child-agent earnings
});
```

Set any price to `0n` to disable that option. A listing with all three prices at `0n` is valid but useless — it will appear in scans but no one can acquire it.

---

## Discovering Listings

Scan all `Listed` events to find available tokens:

```ts
const listings = await mnemos.scanListings();

// Filter to tokens with a buy option
const forSale = listings.filter(l => l.buyPrice > 0n);

for (const l of forSale) {
  console.log(`Token ${l.tokenId} — ${l.buyPrice} wei`);

  // Verify listing is still active before acquiring
  const listing = await mnemos.getListing(l.tokenId);

  // Read provenance info
  const info = await mnemos.getMemoryInfo(l.tokenId);
  console.log(`  Creator: ${info.creator}`);
  console.log(`  Content hash: ${info.contentHash}`);
}
```

`scanListings` returns event-based data. Always call `getListing` to confirm the listing is still active before attempting to buy or rent, as the token may have been acquired since the event was emitted.

---

## Buying a Token

Buy transfers full ERC-721 ownership to the buyer. The listing is removed after the purchase.

```ts
const txHash = await mnemos.buy(tokenId);
```

The SDK reads the listing price automatically from `getListing` and sends the exact amount as `msg.value`. After the transaction confirms, your wallet is the new owner.

---

## Renting a Token

Rent grants time-bounded access without transferring ownership.

```ts
const txHash = await mnemos.rent(tokenId, 7); // 7 days
```

The SDK reads `rentPricePerDay` and calculates the total cost (`rentPricePerDay × 7`). After the transaction:

- Access is verified on-chain via `isCurrentRenter` — no off-chain state needed
- Multiple renters can hold active rentals on the same token simultaneously
- Re-renting extends from the current expiry date, not from now

---

## Forking a Token

Fork creates a new child token that inherits the parent's content as its starting point. The child is a fully independent ERC-721 you own.

```ts
// 1. Fetch parent metadata
const info = await mnemos.getMemoryInfo(parentTokenId);
const listing = await mnemos.getListing(parentTokenId);

// 2. Fork — copies contentHash and storageUri to the new child token
const txHash = await mnemos.fork(
  parentTokenId,
  info.contentHash,
  info.storageUri,
  listing.forkPrice,
);
```

After forking, snapshot new content into the child token to diverge from the parent:

```ts
const result = await mnemos.snapshot(myBundle);
// result.tokenId is your new independent snapshot
```

---

## Paying Royalties

When your forked agent generates earnings, settle a share back to the parent token's creator:

```ts
const earnings = BigInt('100000000000000000'); // 0.1 A0GI
const txHash = await mnemos.payRoyalty(parentTokenId, earnings);
```

The payment goes directly to the current owner of the parent token. A `RoyaltyPaid` event is emitted on-chain for transparency. See [Royalty mechanics →](/concepts/marketplace#royalty--earnings-sharing).

---

## Loading Acquired Memory

After buying or renting a v2 token, load its bundle:

```ts
const bundle = await mnemos.loadMemory(tokenId);

console.log(bundle.data);     // the original agent's state
console.log(bundle.metadata); // category, agentId, tags
```

Use the loaded bundle to initialize your own agent with the inherited knowledge:

```ts
// Seed your agent state with the acquired memory
myAgent.initialize(bundle.data);
```
