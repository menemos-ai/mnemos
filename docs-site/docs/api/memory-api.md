---
sidebar_label: Memory API
sidebar_position: 3
---

# Memory API

All endpoints under `/api/memory`. The server uses the configured `AGENT_PRIVATE_KEY` wallet for signing transactions.

---

## POST /api/memory/snapshot

Encrypt the agent's memory bundle, upload to 0G Storage, and mint a provenance token on 0G Chain.

**Auth:** None required.

### Request Body

```json
{
  "data": { "trades": [{ "pair": "ETH/USDC", "amount": 1.5, "side": "buy" }] },
  "metadata": {
    "category": "trading",
    "agentId": "my-agent-v1",
    "version": "1.0.0"
  },
  "parentTokenId": "0"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `data` | object | Yes | Any JSON-serializable agent state |
| `metadata` | object | Yes | See [MemoryMetadata →](/sdk/types-reference#memorymetadata) |
| `metadata.category` | string | Yes | `"trading"`, `"research"`, `"support"`, `"gaming"`, `"social"`, or custom |
| `parentTokenId` | string | No | Token ID of parent to fork from. Omit or set `"0"` for a root snapshot |

### Response `201`

```json
{
  "tokenId":     "42",
  "contentHash": "0xe7e68ea56a3288a641f40d33f0616836b0b80e842b3f98dbb0fd5fbca28d4021",
  "storageUri":  "v2:0g://0xe7e...",
  "txHash":      "0xdeadbeef...",
  "timestamp":   1746614400000
}
```

All bigint values (`tokenId`) are returned as decimal strings.

---

## GET /api/memory/:tokenId/info

Read on-chain provenance fields for a token from `MemoryRegistry`.

**Auth:** None required.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Decimal token ID (e.g., `"42"`) |

### Response `200`

```json
{
  "tokenId":     "42",
  "contentHash": "0xe7e68ea56a3288a641f40d33f0616836b0b80e842b3f98dbb0fd5fbca28d4021",
  "storageUri":  "v2:0g://0xe7e...",
  "creator":     "0x742d35Cc6634C0532925a3b8D4C9c5e9C8b5F0a1",
  "parent":      "0",
  "timestamp":   "1746614400"
}
```

`parent` is `"0"` for root tokens; the parent token ID for forks. `timestamp` is a block timestamp in seconds.

---

## GET /api/memory/:tokenId

Download and decrypt a token's memory bundle from 0G Storage.

**Auth: Required.** See [Authentication →](/api/authentication).

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokenId` | string | Decimal token ID |

### Required Headers

| Header | Description |
|---|---|
| `x-wallet-address` | EIP-55 checksummed caller address |
| `x-wallet-signature` | EIP-191 `personal_sign` of the challenge message |
| `x-wallet-timestamp` | Unix timestamp in **seconds** |

Challenge message: `mnemos:access:<tokenId>:<checksummedAddress>:<timestamp>`

### Response `200`

```json
{
  "data": {
    "trades": [{ "pair": "ETH/USDC", "amount": 1.5, "side": "buy" }]
  },
  "metadata": {
    "category": "trading",
    "agentId": "my-agent-v1",
    "version": "1.0.0"
  }
}
```

### Error Responses

| Status | Reason |
|---|---|
| `403` | Missing or invalid signature, or caller is not owner/renter |
| `404` | Token not found on-chain |
| `500` | Decryption failed or 0G Storage unavailable |

---

**Next:** [Marketplace API →](/api/marketplace-api)
