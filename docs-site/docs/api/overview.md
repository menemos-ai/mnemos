---
sidebar_label: API Overview
sidebar_position: 1
---

# REST API Overview

The Mnemos REST API is a NestJS server that wraps the TypeScript SDK. Use it when:

- Your integration runs in an environment without a local private key (e.g., a frontend, a serverless function)
- You want simple HTTP calls instead of a Node.js SDK dependency
- You need read endpoints (listing info, memory provenance) without signing transactions

**Base URL:** `http://localhost:3001/api` (self-hosted)

## Running the API

```bash
# From the mnemos-backend repository root
pnpm api:dev    # watch mode, port 3001
pnpm api:build  # compile
pnpm api:start  # run compiled output (production)
```

The server reads the same environment variables as the SDK. See [Environment Setup →](/getting-started/environment).

## Endpoint Groups

| Group | Prefix | Description |
|---|---|---|
| [Memory API →](/api/memory-api) | `/api/memory` | Snapshot, provenance info, download |
| [Marketplace API →](/api/marketplace-api) | `/api/marketplace` | List, buy, rent, fork, royalty |

## Data Types

All `bigint` values (token IDs, prices, timestamps) are serialized as **decimal strings** in JSON responses, since JSON does not support bigint natively. For example:

```json
{ "tokenId": "42", "price": "1000000000000000000" }
```

When sending prices or token IDs in request bodies, send them as decimal strings too.

## Swagger UI

The API exposes a Swagger UI at `/api/docs` when running in development mode. Use it to explore all endpoints, view schemas, and try requests interactively.

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Validation error — check request body against the DTO schema |
| `403` | Wallet auth failure — missing or invalid signature headers |
| `404` | Token not found on-chain |
| `500` | RPC error, chain revert, or storage failure |

---

**Next:** [Authentication →](/api/authentication)
