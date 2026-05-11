---
sidebar_label: Configuration
sidebar_position: 7
---

# Configuration

`MnemosClient` takes a single config object in its constructor.

## MnemosClientConfig

```ts
interface MnemosClientConfig {
  privateKey:         `0x${string}`;
  chainId:            number;
  rpcUrl:             string;
  storageNodeUrl:     string;
  registryAddress:    `0x${string}`;
  marketplaceAddress: `0x${string}`;
  storageMock?:       boolean;
}
```

| Field | Type | Description |
|---|---|---|
| `privateKey` | `` `0x${string}` `` | Your wallet's private key in hex with `0x` prefix. Used to sign all transactions. |
| `chainId` | `number` | EVM chain ID. Must be `16661` for 0G Mainnet. |
| `rpcUrl` | `string` | JSON-RPC endpoint for 0G Chain. Use `https://evmrpc.0g.ai`. |
| `storageNodeUrl` | `string` | 0G Storage indexer URL. Use `https://indexer-storage-turbo.0g.ai`. |
| `registryAddress` | `` `0x${string}` `` | `MemoryRegistry` contract address. |
| `marketplaceAddress` | `` `0x${string}` `` | `MemoryMarketplace` contract address. |
| `storageMock` | `boolean` (optional) | Skip real 0G Storage uploads and use a stub URI. Useful for demos and testing. Default: `false`. |

## Recommended Setup via Environment Variables

```ts
import 'dotenv/config';
import { MnemosClient } from '@mnemos/sdk';

const mnemos = new MnemosClient({
  privateKey:         process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chainId:            parseInt(process.env.OG_CHAIN_ID!),
  rpcUrl:             process.env.OG_RPC_URL!,
  storageNodeUrl:     process.env.OG_STORAGE_NODE!,
  registryAddress:    process.env.REGISTRY_ADDRESS as `0x${string}`,
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS as `0x${string}`,
});
```

See [Environment Setup →](/getting-started/environment) for the `.env` file template with all fixed 0G Mainnet values.

## storageMock

When `storageMock: true`, the SDK skips the actual 0G Storage upload and uses a placeholder URI. The on-chain mint still happens, so token IDs are real — but the storage URI will point to non-existent content.

Use this when:
- Running demos without A0GI for storage fees
- Writing unit tests against a local chain

```ts
const mnemos = new MnemosClient({
  // ... other config ...
  storageMock: true,
});
```

Do not use `storageMock` in production — memory bundles will not be stored and cannot be loaded.
