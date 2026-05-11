---
sidebar_label: Marketplace Operations
sidebar_position: 4
---

# Marketplace Operations

The SDK wraps all `MemoryMarketplace` contract calls. All prices are in wei (A0GI × 10¹⁸).

---

## list()

List a token for buy, rent, fork, or any combination. Requires the caller to have previously called `setApprovalForAll(marketplaceAddress, true)` on the `MemoryRegistry` contract.

**Note:** The SDK does not call `setApprovalForAll` automatically. You must approve the marketplace before listing.

```ts
list(tokenId: bigint, terms: ListingTerms): Promise<`0x${string}`>
```

```ts
interface ListingTerms {
  buyPrice:        bigint; // 0n = not for sale
  rentPricePerDay: bigint; // 0n = not for rent
  forkPrice:       bigint; // 0n = not forkable
  royaltyBps:      number; // basis points (100 = 1%), max 5000 (50%)
}
```

**Returns:** transaction hash

```ts
const txHash = await mnemos.list(result.tokenId, {
  buyPrice:        BigInt('1000000000000000000'), // 1 A0GI
  rentPricePerDay: BigInt('100000000000000000'),  // 0.1 A0GI/day
  forkPrice:       BigInt('500000000000000000'),  // 0.5 A0GI to fork
  royaltyBps:      500,                           // 5%
});
```

---

## buy()

Purchase full ownership of a listed token. The SDK reads the listing price automatically and sends the exact amount.

```ts
buy(tokenId: bigint): Promise<`0x${string}`>
```

**Returns:** transaction hash

```ts
const txHash = await mnemos.buy(42n);
```

After a successful buy, the buyer becomes the new ERC-721 owner and the listing is removed from the marketplace.

---

## rent()

Rent time-bounded access to a token. The SDK reads `rentPricePerDay` from the listing and calculates the total cost (`rentPricePerDay × durationDays`).

```ts
rent(tokenId: bigint, durationDays: number): Promise<`0x${string}`>
```

**Returns:** transaction hash

```ts
const txHash = await mnemos.rent(42n, 7); // rent for 7 days
```

- Multiple renters can hold active rentals on the same token simultaneously
- Re-renting extends the expiry from the **current expiry**, not from now
- Access expiry is checked on-chain via `isCurrentRenter` — no off-chain state needed

---

## fork()

Mint a new child token derived from a parent. The child is an independent ERC-721 token owned by the buyer, with `parentTokenId` set on-chain.

```ts
fork(
  parentTokenId: bigint,
  contentHash:   `0x${string}`,
  storageURI:    string,
  value:         bigint,
): Promise<`0x${string}`>
```

**Returns:** transaction hash

```ts
// First, fetch the parent token's metadata
const info = await mnemos.getMemoryInfo(42n);
const listing = await mnemos.getListing(42n);

const txHash = await mnemos.fork(
  42n,
  info.contentHash,
  info.storageUri,
  listing.forkPrice,
);
```

The `contentHash` and `storageUri` are copied from the parent token's on-chain record so the child references the same content. The child can then be snapshotted into with new content independently.

---

## payRoyalty()

Pay a share of earnings to the parent token's creator. The payment is forwarded directly to the current owner of the parent token.

```ts
payRoyalty(parentTokenId: bigint, amount: bigint): Promise<`0x${string}`>
```

**Returns:** transaction hash

```ts
const earningsInWei = BigInt('50000000000000000'); // 0.05 A0GI
const txHash = await mnemos.payRoyalty(parentTokenId, earningsInWei);
```

Royalties in v1 are honor-system — the `amount` you pass is what gets paid. There is no enforcement of the `royaltyBps` agreed at fork time. Every call emits a `RoyaltyPaid` event with the amount and parent token ID for transparency. See [Royalty →](/concepts/marketplace#royalty--earnings-sharing).

---

## getListing()

Read a token's current listing from the marketplace contract.

```ts
getListing(tokenId: bigint): Promise<{
  seller:          `0x${string}`;
  buyPrice:        bigint;
  rentPricePerDay: bigint;
  forkPrice:       bigint;
  royaltyBps:      number;
}>
```

```ts
const listing = await mnemos.getListing(42n);

console.log(listing.seller);
console.log(`Buy price: ${listing.buyPrice} wei`);
console.log(`Rent: ${listing.rentPricePerDay} wei/day`);
```

A `buyPrice` of `0n` means the token is not for sale. A `rentPricePerDay` of `0n` means not for rent. A `forkPrice` of `0n` means not forkable.

---

## scanListings()

Scan all `Listed` events from the marketplace contract and return deduplicated listings. Deduplication is by `tokenId` — the last `Listed` event per token wins, handling re-listing scenarios.

```ts
scanListings(fromBlock?: bigint): Promise<ListingEvent[]>
```

| Parameter | Type | Description |
|---|---|---|
| `fromBlock` | `bigint` (optional) | Start block for the log scan. Defaults to `0n` (from genesis). |

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

```ts
const listings = await mnemos.scanListings();

for (const l of listings) {
  console.log(`Token ${l.tokenId} — seller: ${l.seller}`);
}
```

`scanListings` returns event-based data without cross-referencing current chain state. A listed token may have been subsequently bought or the listing removed — callers should handle `getListing` failure when acting on a result from `scanListings`.

---

**Next:** [Load Memory →](/sdk/load-memory)
