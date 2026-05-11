---
sidebar_label: Marketplace API
sidebar_position: 4
---

# Marketplace API

All endpoints under `/api/marketplace`. The server uses the configured `AGENT_PRIVATE_KEY` wallet for signing transactions.

**Note:** Buy and rent operations via the API use the **server wallet**, not the caller's wallet. For user-signed buy/rent (where the user's own wallet pays), use the frontend's wagmi flow or call the SDK directly.

All prices are in wei as decimal strings.

---

## GET /api/marketplace/listings/:tokenId

Read a token's current listing from the `MemoryMarketplace` contract.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Decimal token ID |

### Response `200`

```json
{
  "seller":           "0xdeadbeef00000000000000000000000000000001",
  "price":            "1000000000000000000",
  "rentalPricePerDay":"100000000000000000",
  "forkPrice":        "500000000000000000",
  "isForSale":        true,
  "isForRent":        true,
  "isForFork":        true,
  "forkRoyaltyBps":   500
}
```

`isForSale` is `true` when `price > 0`. `isForRent` is `true` when `rentalPricePerDay > 0`. `isForFork` is `true` when `forkPrice > 0`.

---

## POST /api/marketplace/list

List a token for sale, rent, or fork. The server wallet must be the current owner of the token.

**Auth:** None required.

### Request Body

```json
{
  "tokenId":          "42",
  "price":            "1000000000000000000",
  "rentalPricePerDay":"100000000000000000",
  "forkPrice":        "500000000000000000",
  "forkRoyaltyBps":   500
}
```

| Field | Type | Description |
|---|---|---|
| `tokenId` | string | Token ID to list |
| `price` | string | Buy price in wei. `"0"` = not for sale |
| `rentalPricePerDay` | string | Rent price per day in wei. `"0"` = not for rent |
| `forkPrice` | string | Fork price in wei. `"0"` = not forkable |
| `forkRoyaltyBps` | number | Royalty in basis points (0–10000). 500 = 5% |

### Response `201`

```json
{ "txHash": "0xabc123..." }
```

---

## POST /api/marketplace/buy/:tokenId

Purchase a listed token. The server wallet pays the sale price and becomes the new owner.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Token ID to buy |

### Response `201`

```json
{ "txHash": "0xabc123..." }
```

---

## POST /api/marketplace/rent/:tokenId

Rent access to a listed token for a fixed number of days.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Token ID to rent |

### Request Body

```json
{ "durationDays": 7 }
```

### Response `201`

```json
{ "txHash": "0xabc123..." }
```

---

## POST /api/marketplace/fork/:tokenId

Fork a token — mint a new child token derived from the specified parent.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Parent token ID to fork |

### Response `201`

```json
{ "txHash": "0xabc123..." }
```

---

## POST /api/marketplace/royalty/:tokenId

Pay a royalty to the parent token's creator.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Parent token ID receiving the royalty |

### Request Body

```json
{ "amount": "50000000000000000" }
```

| Field | Type | Description |
|---|---|---|
| `amount` | string | Amount to pay in wei |

### Response `201`

```json
{ "txHash": "0xabc123..." }
```
