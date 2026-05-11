---
sidebar_label: autoSnapshot()
sidebar_position: 3
---

# autoSnapshot()

Runs `snapshot()` on a configurable interval. Designed for long-running agents that need continuous, automatic memory persistence without cluttering their main loop.

## Signature

```ts
autoSnapshot(options: AutoSnapshotOptions): () => void
```

Returns a `stop()` function. Call it to cancel the timer.

## Parameters

```ts
interface AutoSnapshotOptions {
  intervalMs:  number;
  buildBundle: () => MemoryBundle | Promise<MemoryBundle>;
  onSnapshot?: (result: SnapshotResult) => void;
  onError?:    (error: Error) => void;
}
```

| Field | Type | Description |
|---|---|---|
| `intervalMs` | `number` | How often to snapshot, in milliseconds. |
| `buildBundle` | `() => MemoryBundle \| Promise<MemoryBundle>` | Called each tick to produce the bundle to snapshot. Can be async. |
| `onSnapshot` | `(result: SnapshotResult) => void` (optional) | Called after each successful snapshot with the result. |
| `onError` | `(error: Error) => void` (optional) | Called when a snapshot fails. The timer continues — the agent does not crash. |

## Returns

A `stop()` function. Calling it cancels the interval timer. It is safe to call `stop()` multiple times.

## Example

```ts
const stop = mnemos.autoSnapshot({
  intervalMs: 30_000, // every 30 seconds

  buildBundle: () => ({
    data: myAgent.getState(),
    metadata: {
      category: 'trading',
      agentId: 'my-agent-v1',
      version: '1.0.0',
    },
  }),

  onSnapshot: (result) => {
    console.log(`Snapshot minted — token ID: ${result.tokenId}`);
    console.log(`Storage URI: ${result.storageUri}`);
  },

  onError: (err) => {
    console.error(`Snapshot failed: ${err.message}`);
    // Timer continues — the agent keeps running
  },
});

// Stop on shutdown
process.on('SIGINT', () => {
  stop();
  process.exit(0);
});
```

## Behavior Notes

- **Errors are caught internally.** If `snapshot()` throws, `onError` is called and the timer continues. The agent does not crash.
- **Only one timer per client.** `MnemosClient` stores the interval handle as `autoSnapshotTimer`. Calling `autoSnapshot` a second time without stopping the first will start a second timer — the first one leaks. Always call `stop()` before starting a new interval on the same client.
- **`buildBundle` is called each tick**, so it always receives the agent's current state at snapshot time. No state is captured at `autoSnapshot` call time.
- **Async `buildBundle` is supported.** If building the bundle is async (e.g., querying a database), the timer waits for the bundle to resolve before uploading and minting.

## Recommended Intervals

| Agent type | Interval |
|---|---|
| High-frequency trading | 10–30 seconds |
| Research / knowledge accumulation | 5–60 minutes |
| Support agent | 1–10 minutes |
| Daily batch | `86_400_000` (24 hours) |

Shorter intervals mean more on-chain transactions and more A0GI spent on gas. Choose an interval that balances persistence granularity with cost.

---

**Next:** [Marketplace Operations →](/sdk/marketplace)
