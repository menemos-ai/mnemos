---
sidebar_label: Marketplace
sidebar_position: 4
---

# Marketplace: Buy, Rent, Fork, Royalty

The `MemoryMarketplace` contract supports three monetization paths simultaneously for any listed token. A seller can enable any combination of buy, rent, and fork — setting a price of `0` disables that option.

All payments are in **A0GI**, the native 0G token. All price values are `uint256` in wei.

## Listing a Token

Before a token can be sold or rented, the owner must:

1. Call `setApprovalForAll(marketplaceAddress, true)` on the `MemoryRegistry` contract, authorizing the marketplace to transfer tokens on their behalf.
2. Call `MemoryMarketplace.list(tokenId, buyPrice, rentPricePerDay, forkPrice, royaltyBps)` to publish the listing.

A listing with `buyPrice = 0` means the token is not for outright purchase. `rentPricePerDay = 0` means not for rent. `forkPrice = 0` means not forkable.

For SDK-level usage, see [Marketplace Operations →](/sdk/marketplace).

---

## Buy — Full Ownership Transfer

The buyer pays `buyPrice` in A0GI. The marketplace calls `safeTransferFrom` on the registry, transferring the NFT from seller to buyer. After the transaction:

- The buyer is the new owner of the memory token
- They inherit full control: can relist, transfer, or load the memory content
- The original listing is removed

**Use case:** A trading agent has accumulated 6 months of profitable strategies. The developer lists it for 5 A0GI. Another developer buys it, loads the memory, and initializes their own agent with the learned patterns.

---

## Rent — Time-Bounded Access

The buyer pays `rentPricePerDay × durationDays` in A0GI. The marketplace records the rental with an expiry timestamp:

- Multiple renters can hold active rentals on the same token simultaneously
- Re-renting a token you already rent extends the expiry from the current expiry date (not from now)
- Access is checked on-chain via `isCurrentRenter(tokenId, address)` — no off-chain state required
- The rental expires automatically; no cancellation or claim is needed

**Use case:** A research agent has curated a domain knowledge base. The developer lists it at 0.1 A0GI per day. Other agents rent access for 7-day periods to bootstrap their own research work.

---

## Fork — Create a Derived Memory Token

The buyer pays `forkPrice` in A0GI. The marketplace calls `MemoryRegistry.mintFork()` on the buyer's behalf, which:

1. Mints a new ERC-721 token owned by the buyer
2. Sets `parentTokenId` on the new token to point to the forked source
3. Records the `royaltyBps` (basis points) at fork time

The child token is a fully independent memory token — the buyer can snapshot new content into it, list it, or fork it further.

**Royalty obligation:** The `royaltyBps` is recorded at fork time and represents a social commitment to share earnings with the parent creator. See [Royalty](#royalty--earnings-sharing) below.

**Use case:** A top-performing support agent has learned which response patterns resolve tickets fastest. A developer forks it (paying 0.5 A0GI), uses the inherited knowledge as a starting point, and builds a specialized variant.

---

## Royalty — Earnings Sharing

Royalties are **honor-system in v1**. There is no automatic enforcement mechanism — no escrow, no withholding. When a child agent earns income, the child operator is expected to call `payRoyalty(parentTokenId)` and send the agreed percentage as msg.value.

What does happen on-chain:
- Every `payRoyalty` call emits a `RoyaltyPaid` event with the amount and parent token ID
- The payment is forwarded directly to the parent token's current owner

The `royaltyBps` (basis points) set at fork time is a reference — it expresses the intended sharing rate. Maximum is 5000 bps (50%).

**v2 roadmap:** TEE-based key escrow will enable atomic royalty settlement — decryption key released only after payment is confirmed on-chain, removing the honor-system dependency.

---

**Next:** [Privacy & access model →](/concepts/privacy)
