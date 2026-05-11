---
sidebar_label: The Problem
sidebar_position: 1
---

# The Problem: AI Agents Have No Memory

## Agents Are Stateless by Default

When you build an AI agent today — whether it's a trading bot, a research assistant, or a support agent — it runs in memory. It might accumulate useful state as it works: profitable trade patterns, curated document summaries, refined response strategies. But the moment you redeploy it, upgrade its dependencies, or restart the process, all of that learned experience is gone.

This is not a bug. It's the default design of AI agent systems. Computation is ephemeral; persistent state is the developer's responsibility. And most developers have no good solution for it.

## What Gets Lost

Consider three real scenarios:

**Trading agent.** A DeFi bot runs for six weeks and learns which token pairs are most profitable at which times. It develops timing intuitions based on thousands of trades. You upgrade the model or fix a bug — the agent restarts from zero. Six weeks of learned edge, gone.

**Research agent.** An agent curates a knowledge base over two months — identifying reliable sources, building a mental model of a domain, learning which queries return useful results. You migrate to a new provider — the agent starts fresh. Two months of curation work, gone.

**Support agent.** An agent refines its response patterns based on which answers resolve tickets versus which ones lead to escalations. Over time it gets better. A new version ships — the agent forgets every lesson. All that feedback, gone.

## The Missing Infrastructure Layer

The deeper problem is not just memory loss — it's that there is no market for agent intelligence.

When a developer builds a great trading agent, they have no way to transfer that agent's accumulated knowledge to another developer. When an agent retires, its learned experience dies with it. When a new agent developer needs a head start, they must build from scratch or train from raw data — there is no way to inherit a proven agent's learned patterns.

Mnemos is the missing infrastructure layer. It makes **agent memory a first-class on-chain asset** — ownable, transferable, and inheritable.

---

**Next:** [How Mnemos works →](/concepts/architecture)
