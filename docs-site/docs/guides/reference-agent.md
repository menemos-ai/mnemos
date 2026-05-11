---
sidebar_label: Reference Agent
sidebar_position: 2
---

# Reference Agent: DeFi Yield Explorer

The reference agent (`apps/reference-agent/`) is a working example that exercises the full Mnemos SDK lifecycle against live 0G Mainnet contracts. It demonstrates how to integrate `autoSnapshot` into a long-running agent in fewer than 100 lines of TypeScript.

## What It Does

- Generates a synthetic `TradeEvent` every 2 seconds using `setInterval`
- Accumulates trades in an in-memory `AgentMemory` object (total PnL, win rate, last 100 trades)
- Calls `mnemos.autoSnapshot` every 30 seconds to mint a live on-chain memory token
- Logs each trade and each mint result to stdout

## What It Does Not Do

- Persist memory between restarts — `AgentMemory` is a plain in-memory object
- Execute real trades — all trade data is synthetic and randomly generated
- Handle partial snapshots — if the timer fires before any trades accumulate, it still snapshots an empty array

## Running the Agent

```bash
# From the mnemos-backend repository root
pnpm sdk:build   # build the SDK first
pnpm agent:run   # start the reference agent
```

Requires a populated `.env` file at the workspace root:

```env
AGENT_PRIVATE_KEY=0x<your-private-key>
OG_CHAIN_ID=16661
OG_RPC_URL=https://evmrpc.0g.ai
OG_STORAGE_NODE=https://indexer-storage-turbo.0g.ai
REGISTRY_ADDRESS=0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E
MARKETPLACE_ADDRESS=0xFeb5Ac77Cd7746e2b35825dA800458D660D10209
```

## Expected Output

```
DeFi Yield Explorer agent starting...
Trades every 2s | Snapshot every 30s

[2026-05-11T10:00:02.000Z] BUY ETH/USDC | $123.45 @ $2100.00 | PnL: +$12.34 | Total: +$12.34
[2026-05-11T10:00:04.000Z] SELL BTC/USDC | $89.00 @ $61000.00 | PnL: -$4.50 | Total: +$7.84
...

Snapshot #1 minted
  Token ID:  3
  Storage:   v2:0g://0xabc...
  Tx:        0xdef...
```

Every snapshot mints a new ERC-721 token on 0G Chain. You can watch them appear in real time on [chainscan.0g.ai](https://chainscan.0g.ai/address/0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E).

## Memory Bundle Structure

Each snapshot stores the last 100 trade events plus summary stats:

```ts
interface AgentMemory {
  trades:        TradeEvent[];  // last 100 events
  totalPnl:      number;
  winRate:       number;        // fraction of winning trades
  snapshotCount: number;
}
```

The metadata category is `"trading"` with tags `["defi", "yield", "automated"]`.

## Key SDK Integration Points

The agent uses `autoSnapshot` with the standard 5-line integration pattern:

```ts
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000,
  buildBundle: (): MemoryBundle => ({
    data: { ...memory, trades: memory.trades.slice(-100) },
    metadata: {
      category:  'trading',
      title:     'DeFi Yield Explorer v1',
      agentId:   'defi-yield-explorer-v1',
      version:   '1.0.0',
      createdAt: Date.now(),
      tags:      ['defi', 'yield', 'automated'],
    },
  }),
  onSnapshot: (result) => {
    memory.snapshotCount++;
    console.log(`Snapshot #${memory.snapshotCount} minted — token ID: ${result.tokenId}`);
  },
  onError: (err) => {
    console.error(`[snapshot error] ${err.message}`);
  },
});

process.on('SIGINT', () => { stop(); process.exit(0); });
```

Notice the graceful shutdown: `stop()` is called on `SIGINT` so the timer is cleaned up before exit.
