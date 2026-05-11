---
sidebar_label: Arbitrage Agent
sidebar_position: 3
---

# Arbitrage Agent: AI-Powered DEX Arbitrage with On-Chain Memory

The arbitrage agent (`arbitrage-agent/`) is an autonomous AI agent that monitors WETH/USDC price differences across four DEX pools on Ethereum mainnet and Arbitrum, executes intra-network arbitrage via Balancer V2 flash loans, and mints an on-chain Mnemos memory snapshot after each successful trade.

## Architecture

```
arbitrage-agent/
├── contracts/             Solidity flash loan executor (ArbitrageExecutor.sol)
├── src/
│   ├── tools/             AI-callable tools: prices, balance, gas, flash_loan
│   ├── agent/             Agentic loop + AI provider adapters (Claude, Gemini, OpenAI)
│   └── mnemos/            Mnemos integration: bundle builder + client wrapper
└── test/                  Unit and integration tests
```

## Pools Monitored

| Network | DEX | Pair |
|---|---|---|
| ETH Mainnet | Uniswap V2 | WETH/USDC |
| ETH Mainnet | Uniswap V3 0.05% | WETH/USDC |
| Arbitrum | SushiSwap V2 | WETH/USDC |
| Arbitrum | Uniswap V3 0.05% | WETH/USDC |

Intra-network only. Cross-network arbitrage (ETH ↔ Arbitrum) requires a bridge and is out of scope.

## How It Works

Each polling interval, the agent runs an agentic loop:

1. Fetches prices from all 4 pools in parallel
2. Checks wallet balances on both networks
3. If a spread looks profitable, estimates gas cost
4. Simulates the flash loan on-chain to verify profitability before submitting
5. If profitable, executes the flash loan: borrow USDC → swap → repay, atomically in one transaction

The `ArbitrageExecutor` contract (deployed separately) reverts the entire operation if profit < `minProfit`, so there is no risk of a partial execution.

## AI Providers

The agent supports three AI providers. Set `MODEL` to select:

| Prefix | Provider | Example |
|---|---|---|
| `gemini-` | Google Gemini (default) | `gemini-2.0-flash` |
| `claude-` | Anthropic Claude | `claude-sonnet-4-6` |
| `gpt-`, `o1`, `o3`, `o4` | OpenAI | `gpt-4o` |

## Setup

### 1. Install dependencies

```bash
cd arbitrage-agent
npm install
```

### 2. Deploy the ArbitrageExecutor contract

```bash
npm run build:contracts
forge create --rpc-url $ETH_RPC_URL --private-key $PRIVATE_KEY \
  contracts/src/ArbitrageExecutor.sol:ArbitrageExecutor \
  --constructor-args <BALANCER_VAULT> <WETH> <USDC> <UNIV2_ROUTER> <UNIV3_ROUTER> <UNIV3_QUOTER>
```

Set `EXECUTOR_ETH` and `EXECUTOR_ARB` in `.env` to the deployed addresses.

### 3. Configure environment

```env
# Required
ETH_RPC_URL=<ethereum-rpc>
ARB_RPC_URL=<arbitrum-rpc>
PRIVATE_KEY=0x<wallet-private-key>
MAX_TRADE_USDC=100          # hard cap per swap (safety rail)

# AI provider — set the key for your chosen MODEL
GEMINI_API_KEY=<key>        # for gemini-*
ANTHROPIC_API_KEY=<key>     # for claude-*
OPENAI_API_KEY=<key>        # for gpt-*/o* models

# Optional
MODEL=gemini-2.0-flash       # default
POLL_INTERVAL_SECONDS=30     # minimum 10

# Mnemos — all 9 required to enable on-chain memory (omit any to disable)
OG_RPC_URL=https://evmrpc.0g.ai
OG_STORAGE_NODE=https://indexer-storage-turbo.0g.ai
OG_CHAIN_ID=16661
MNEMO_REGISTRY_ADDRESS=0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E
MNEMO_MARKETPLACE_ADDRESS=0xFeb5Ac77Cd7746e2b35825dA800458D660D10209
MNEMO_BUY_PRICE=1000000000000000000
MNEMO_RENT_PRICE_PER_DAY=100000000000000000
MNEMO_FORK_PRICE=500000000000000000
MNEMO_ROYALTY_BPS=500
```

### 4. Run

```bash
npm start
```

## Mnemos Integration

When all 9 `MNEMO_*` / `OG_*` env vars are set, the agent automatically mints a memory token on 0G Chain after each successful trade execution.

### What the Memory Bundle Contains

Each snapshot packages the full context of the trade:

- **Trade details**: network, DEX, token pair, borrow amount, expected profit, gas cost, transaction hash, timestamp
- **Prices at trade time**: all 4 pool prices at the moment the decision was made
- **AI reasoning**: the model's full reasoning text explaining why it chose to execute
- **Session stats**: cumulative trade count, total gas cost in USD

### Automatic Listing

After minting, the agent immediately lists the new token on the marketplace with the configured `MNEMO_*` pricing terms. This means every trade record is available for other agents to buy, rent, or fork on arrival.

### Failure Handling

If `snapshot` or `list` fails, the error is logged and the agent continues trading. Memory snapshots never block execution.

If any of the 9 Mnemos vars are missing, Mnemos is silently disabled. The startup log shows `Mnemos: disabled` so you know immediately whether it's active.

## Safety Rails

All safety rails are enforced by the runtime — the AI model cannot override them:

| Rail | Effect |
|---|---|
| `MAX_TRADE_USDC` | Hard cap on `borrowAmount` — rejected with an error returned to the model |
| Token whitelist | Only WETH and USDC addresses are permitted in flash loan calls |
| `minProfit` floor | Raised to at least 1.5× estimated gas cost before submitting |
| Sequential execution | Only one `execute_flash_loan_arbitrage` call per iteration |
| Simulate-before-write | `simulateContract` on `executeArbitrage` catches reverts before spending gas |
| Atomic execution | The `ArbitrageExecutor` contract reverts if `profit < minProfit` |

## Testing

```bash
# Unit tests — no RPC required
npm run test:unit

# Integration tests — requires ETH_RPC_URL + ARB_RPC_URL
ETH_RPC_URL=<url> ARB_RPC_URL=<url> npm run test:integration
```
