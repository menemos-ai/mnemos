---
slug: /
sidebar_label: Introduction
sidebar_position: 1
---

# Mnemos — On-Chain AI Agent Memory Protocol

Mnemos turns an AI agent's operational memory into an ownable, transferable, and inheritable on-chain asset. Agents can snapshot their learned experience, mint it as an NFT on **0G Chain**, and sell, rent, or fork it through a decentralized marketplace — all with royalty tracking for derivative agents.

## The Problem

Every time an AI agent is redeployed, it loses everything it learned. Accumulated trading intuitions, refined reasoning patterns, domain-specific knowledge — gone. Developers have no way to preserve, transfer, or build on a previous agent's experience.

[Learn more about the problem →](/concepts/problem)

## How It Works

Mnemos integrates two 0G Network modules:

- **0G Chain** (EVM-compatible, chain ID 16661) — hosts two Solidity contracts: `MemoryRegistry` (ERC-721 NFTs) and `MemoryMarketplace` (buy / rent / fork / royalty).
- **0G Storage** — stores the actual memory bundles (structured JSON, potentially megabytes of agent state) as encrypted, content-addressed files.

[See the full architecture →](/concepts/architecture)

## Deployed Contracts

| Contract | Address | Network |
|---|---|---|
| MemoryRegistry (ERC-721) | [`0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E`](https://chainscan.0g.ai/address/0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E) | 0G Mainnet · chain ID 16661 |
| MemoryMarketplace | [`0xFeb5Ac77Cd7746e2b35825dA800458D660D10209`](https://chainscan.0g.ai/address/0xFeb5Ac77Cd7746e2b35825dA800458D660D10209) | 0G Mainnet · chain ID 16661 |

## Quick Links

| | |
|---|---|
| [Quick Start →](/getting-started/quickstart) | Install the SDK and snapshot your first memory in 5 minutes |
| [SDK Reference →](/sdk/overview) | Full API reference for `MnemosClient` |
| [REST API →](/api/overview) | HTTP endpoints for server-side or frontend integration |
| [Demo Video](https://youtu.be/m0DG4nA9Tvo) | See Mnemos in action |
| [Live Marketplace](https://chainscan.0g.ai/address/0xFeb5Ac77Cd7746e2b35825dA800458D660D10209) | Browse active memory listings on-chain |
