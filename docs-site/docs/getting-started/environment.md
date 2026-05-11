---
sidebar_label: Environment Setup
sidebar_position: 1
---

# Environment Setup

## Prerequisites

- Node.js >= 20
- A funded wallet on **0G Mainnet** (chain ID 16661) — needed for gas and marketplace transactions

You do **not** need to deploy any contracts. The `MemoryRegistry` and `MemoryMarketplace` contracts are already deployed and shared across all agents integrating with Mnemos.

---

## Environment Variables

Create a `.env` file in your project root:

```env
# Your wallet private key (hex, 0x-prefixed)
AGENT_PRIVATE_KEY=0x<your-private-key>

# 0G Mainnet — do not change these values
OG_CHAIN_ID=16661
OG_RPC_URL=https://evmrpc.0g.ai
OG_STORAGE_NODE=https://indexer-storage-turbo.0g.ai

# Deployed contract addresses — do not change these
REGISTRY_ADDRESS=0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E
MARKETPLACE_ADDRESS=0xFeb5Ac77Cd7746e2b35825dA800458D660D10209
```

The only value you supply is `AGENT_PRIVATE_KEY`. Everything else is fixed for 0G Mainnet.

### Variable Reference

| Variable | Description | Required |
|---|---|---|
| `AGENT_PRIVATE_KEY` | Wallet private key (`0x`-prefixed hex). Used to sign transactions and derive the wallet address. | Yes |
| `OG_CHAIN_ID` | EVM chain ID for 0G Mainnet. Must be `16661`. | Yes |
| `OG_RPC_URL` | JSON-RPC endpoint for 0G Chain. | Yes |
| `OG_STORAGE_NODE` | 0G Storage indexer node URL — used by the SDK to upload and locate memory bundles. | Yes |
| `REGISTRY_ADDRESS` | Deployed `MemoryRegistry` contract address. | Yes |
| `MARKETPLACE_ADDRESS` | Deployed `MemoryMarketplace` contract address. | Yes |
| `PORT` | NestJS API server port (REST API only). Defaults to `3001`. | No |

---

## Network

| Network | Chain ID | Explorer | Status |
|---|---|---|---|
| **0G Mainnet** | `16661` | [chainscan.0g.ai](https://chainscan.0g.ai) | Use this |
| 0G Galileo Testnet | `16602` | — | Not supported |

The contracts are deployed on mainnet. Using a testnet RPC or a different chain ID will cause contract calls to fail or revert silently.

---

## Getting A0GI

A0GI is the native token of 0G Chain used to pay for gas and marketplace transactions. You need A0GI in your wallet before calling any on-chain methods.

Bridge or acquire A0GI from the [0G ecosystem resources](https://docs.0g.ai).

---

**Next:** [Quick Start →](/getting-started/quickstart)
