---
title: "feat: Add Agent-to-Agent Integration Docs Page"
type: feat
status: active
date: 2026-05-11
origin: docs/brainstorms/2026-05-11-agent-to-agent-docs-requirements.md
---

# feat: Add Agent-to-Agent Integration Docs Page

## Overview

Add a single Docusaurus page at `/agent-to-agent` that serves as the complete integration reference for AI agents — both AI coding assistants (Claude Code, Cursor) and autonomous runtime agents. The page opens with a self-contained briefing block that gives an AI all minimum information to start integration, followed by structured sections for every SDK operation, reference tables, and troubleshooting. No Docusaurus config changes are required.

---

## Problem Frame

AI agents integrating Mnemos SDK today must browse multiple pages, follow links, and synthesize information scattered across quickstart, SDK reference, and environment docs. There is no single page an AI can consume linearly to produce a correct, runnable integration. This blocks the use case where a developer shares one URL with their AI coding assistant and expects a complete integration — and prevents autonomous agents from self-integrating without multi-page browsing. (see origin: `docs/brainstorms/2026-05-11-agent-to-agent-docs-requirements.md`)

---

## Requirements Trace

- R1. Page opens with `## AGENT START HERE` containing all minimum integration info (packages, env var keys + actual values, contract addresses, runnable `MnemosClient` init) in a self-contained block.
- R2. AGENT START HERE block contains no external links.
- R3. AGENT START HERE includes meta-instructions telling the AI when to read only the block vs. continue to detail sections.
- R4. Decision Tree immediately below AGENT START HERE maps "If you want X → go to Section Y" for all 13 SDK operations.
- R5. Decision Tree is ≤12 lines.
- R6. Each of the 13 operation sections follows a fixed sub-structure: Purpose, When to use, Complete code, Parameters table, Return value, Error handling.
- R7. No `...` or non-env-var placeholders in any code example.
- R8. All 13 operations covered: Install & Configure, `snapshot()`, `autoSnapshot()`, `list()`, `buy()`, `rent()`, `fork()`, `payRoyalty()`, `getListing()`, `scanListings()`, `loadMemory()`, `getMemoryInfo()`, `hasAccess()`.
- R9. Marketplace sections explicitly state that `tokenId` from `snapshot()` is required before calling `list()`, `buy()`, `rent()`, `fork()`, or `payRoyalty()`.
- R10. All Environment Variables table includes actual fixed values for `OG_CHAIN_ID`, `OG_RPC_URL`, `OG_STORAGE_NODE`, `REGISTRY_ADDRESS`, `MARKETPLACE_ADDRESS`.
- R11. Type Reference defines all 9 types exported from `@mnemos/sdk`: `MnemosClientConfig`, `MemoryBundle`, `MemoryMetadata`, `MemoryCategory`, `ListingTerms`, `ListingEvent`, `SnapshotResult`, `MemoryInfo`, `AutoSnapshotOptions`. The `Listing` type named in the origin doc does not exist in `types.ts` — `getListing()` returns an inline struct; its fields are documented within the `getListing()` operation section, not as a named type.
- R12. All price values in code examples use bigint wei with inline human-readable comments.
- R13. Troubleshooting covers ≥5 common errors with symptoms and fixes.
- R14–R17. Page is accessible at `/agent-to-agent`, uses `slug: /agent-to-agent` frontmatter, is not added to `sidebars.ts`, and uses a descriptive HTML `<title>` via `title:` frontmatter.

**Origin actors:** A1 (human developer), A2 (AI coding assistant), A3 (autonomous AI runtime agent), A4 (Mnemos SDK)

**Origin flows:** F1 (coding assistant integration), F2 (autonomous agent self-integration)

**Origin acceptance examples:** AE1 (covers R1, R2, R7), AE2 (covers R4, R5), AE3 (covers R6, R7, R8), AE4 (covers R9), AE5 (covers R10)

---

## Scope Boundaries

- Does not modify `sidebars.ts`, `docusaurus.config.ts`, or any existing page.
- Does not create an `llms.txt` file at the docs-site root.
- Does not cover `WalletAuthGuard` or NestJS API authentication.
- Does not include conceptual prose (what is 0G, why memory matters) — the page is purely operational.
- Does not support languages other than TypeScript/JavaScript.
- Does not replace existing SDK detail pages — it is an AI-optimized entry point, not a migration of existing content.

---

## Context & Research

### Relevant Code and Patterns

- `docs-site/docusaurus.config.ts` — `routeBasePath: '/'` means `slug: /agent-to-agent` resolves to `https://mnemos-docs.vercel.app/agent-to-agent` directly; no config changes needed.
- `docs-site/sidebars.ts` — fully manual; omitting the new page from this file is the established hidden-page pattern (used by `docs/brainstorms/`).
- `docs-site/docs/intro.md` — only existing page using `slug:` frontmatter; confirms the pattern.
- `docs-site/docs/getting-started/quickstart.md` — canonical MnemosClient initialization example to mirror.
- `docs-site/docs/sdk/marketplace.md` — canonical `setApprovalForAll` warning and `fork()` three-step pattern; both must be preserved in the new page.
- `backend/packages/sdk/src/types.ts` — authoritative source for all public type definitions.
- `backend/packages/sdk/src/client.ts` — authoritative source for all public method signatures.
- `backend/abis/MemoryRegistry.ts` — contains `MEMORY_REGISTRY_ABI` with `setApprovalForAll` entry; use its ABI fragment shape for the inline viem call in the `list()` code example.
- `backend/.env` — authoritative source for all fixed environment variable values (not `.env.example`, which contains only placeholders).

### Institutional Learnings

- `setApprovalForAll(marketplaceAddress, true)` must be called on the MemoryRegistry contract before `list()`. The SDK does not call this automatically. This is the single most likely integration error. The SDK does not expose a helper for this — the `list()` code example must include an inline viem `writeContract` call using an ERC-721 ABI fragment (modeled after `backend/abis/MemoryRegistry.ts`). It must appear in the code block, not just in a warning paragraph.
- `fork()` requires: (1) fetch `contentHash` and `storageUri` from `getMemoryInfo(parentTokenId)` — these are passed into `fork()` as the child's content, making the fork a reference fork that starts with the same content as the parent; (2) fetch `forkPrice` from `getListing(parentTokenId)`; (3) call `fork(parentTokenId, info.contentHash, info.storageUri, listing.forkPrice)`. The three steps must appear in one code block without cross-references.
- `payRoyalty(parentTokenId, amount)` takes `parentTokenId` (not `childTokenId`). `amount` is an agent-supplied bigint representing earned royalty — it is not derived from any SDK query. `royaltyBps` from `getListing(parentTokenId)` may be shown as context for calculating the suggested percentage, but `amount` is always caller-determined business logic.
- `MnemosClientConfig.chainId` is `number`, not `string`. The code example must include `chainId: Number(process.env.OG_CHAIN_ID)` — not `chainId: process.env.OG_CHAIN_ID` — to avoid a runtime type error.
- Docusaurus `onBrokenLinks: 'throw'` catches broken page links but does NOT validate in-page `#fragment` anchors. Decision Tree anchor links must be verified manually against Docusaurus-generated heading slugs (lowercase, hyphenated) — this check is not automated by the build step.

### External References

None required — local patterns cover all needs.

---

## Key Technical Decisions

- **Single file at `docs/agent-to-agent.md`, not in a subdirectory**: The `slug: /agent-to-agent` frontmatter overrides the path-derived URL anyway, making the file location irrelevant to routing. Placing it at the root of `docs/` keeps the directory clean and avoids an orphaned single-file subdirectory.
- **`title:` frontmatter for HTML head, H1 for rendered body**: Docusaurus 3 derives `<title>` from H1 by default. Adding `title:` frontmatter (`"Mnemos Agent Integration — Agent-to-Agent Docs"`) overrides the browser tab title without affecting the rendered page heading — satisfying R17 while keeping the H1 concise.
- **Hidden page via omission from `sidebars.ts`**: The established pattern in this repo. No need for Docusaurus `custom_edit_url: null` or any other "hide" mechanism.
- **Fixed operation section sub-structure**: Purpose → When to use → Complete code → Parameters (table) → Return value → Error handling. The uniform structure lets AI agents parse sections predictably — any variation per section defeats the purpose.
- **`setApprovalForAll` in the `list()` code block, not a prose warning**: The complete `list()` code example opens with an inline viem `writeContract` call using an ERC-721 ABI fragment for `setApprovalForAll`. The ABI fragment is defined inline in the example (not imported) so the example remains self-contained. Pattern: `inputs: [{name:'operator',type:'address'},{name:'approved',type:'bool'}]`.
- **`fork()` example shows all three steps inline**: `getMemoryInfo()` → `getListing()` → `fork()` in a single code block, passing the parent's `contentHash` and `storageUri` directly into `fork()`. Explicit comment: "fork starts as a reference to the parent's content."
- **`payRoyalty` amount is always caller-supplied**: No SDK query produces the royalty amount. The example shows a caller-computed `earningsInWei` bigint, with an optional comment showing how `royaltyBps` from `getListing(parentTokenId)` can be used to calculate a suggested amount.
- **Decision Tree has exactly 12 lines, no grouping**: Each of the 12 named SDK methods gets one line in the Decision Tree. `getListing` and `scanListings` are separate entries. Zero grouping — each entry maps to exactly one section.
- **`chainId: Number(process.env.OG_CHAIN_ID)`**: Every MnemosClient init example must include this explicit `Number()` conversion. `process.env.*` values are strings; `MnemosClientConfig.chainId` is `number`.

---

## Open Questions

### Resolved During Planning

- **Does `slug: /agent-to-agent` produce the correct URL?** Yes — `routeBasePath: '/'` is already configured in `docusaurus.config.ts`. The page will be served at `https://mnemos-docs.vercel.app/agent-to-agent`.
- **Does `storageMock` belong in the env table?** No — it is a test/demo-only flag (`MNEMO_STORAGE_MOCK` in the arbitrage agent). The new page targets production integration; omitting it keeps the table focused.
- **Which network should the page target?** Mainnet (chain ID 16661). Testnet values are a footnote at most; they do not belong in the primary reference or code examples.

### Deferred to Implementation

- **Exact formatting of the AGENT START HERE meta-instructions**: The wording of "when to read only this block vs. continue" depends on what an implementer finds most natural when reading as an AI. The requirement (R3) defines the intent; the exact phrasing is an execution-time decision.
- **Whether to include a `## Next Steps` or footer section linking to the deeper SDK pages**: R17 allows links to SDK detail pages for advanced cases. Whether to add a brief footer is an implementer judgment call.

---

## Output Structure

```
docs-site/
  docs/
    agent-to-agent.md   ← new file (the only output)
```

No changes to any existing file.

---

## High-Level Technical Design

> *This illustrates the intended page structure as directional guidance for review, not an implementation specification. The implementing agent should treat it as context, not content to reproduce verbatim.*

```
docs/agent-to-agent.md
│
├── [frontmatter]  slug, title, sidebar_label
├── # Mnemos — Agent Integration Reference
│
├── ## AGENT START HERE                    ← R1, R2, R3
│   ├── (meta-instructions block)
│   ├── Installation commands
│   ├── All env vars with actual values
│   └── Runnable MnemosClient init
│
├── ## Decision Tree                       ← R4, R5
│   └── "If you want X → Section Y" (≤12 lines)
│
├── ## Install & Configure                 ← R6, R7, R8
│
├── ## snapshot()                          ← R6, R7, R8
├── ## autoSnapshot()                      ← R6, R7, R8
│
├── ## Marketplace Operations              ← R6, R7, R8, R9
│   ├── ## list()   (setApprovalForAll first)
│   ├── ## buy()
│   ├── ## rent()
│   ├── ## fork()   (3-step: getMemoryInfo + getListing + fork)
│   ├── ## payRoyalty()
│   ├── ## getListing()
│   └── ## scanListings()
│
├── ## Memory Access                       ← R6, R7, R8
│   ├── ## loadMemory()
│   ├── ## getMemoryInfo()
│   └── ## hasAccess()
│
├── ## All Environment Variables           ← R10
│   └── (table: Variable | Value | Required | Description)
│
├── ## Type Reference                      ← R11
│   └── (types: MnemosClientConfig, MemoryBundle, MemoryMetadata,
│           ListingTerms, SnapshotResult, MemoryInfo, ListingEvent,
│           AutoSnapshotOptions)
│
└── ## Troubleshooting                     ← R13
    └── (≥5 errors: missing key, low balance, no approval,
         storage fail, wrong chain)
```

---

## Implementation Units

- U1. **Page scaffold and AGENT START HERE block**

**Goal:** Create `docs/agent-to-agent.md` with correct frontmatter and write the AGENT START HERE block and Decision Tree — the highest-value sections that alone make the page useful.

**Requirements:** R1, R2, R3, R4, R5, R14, R15, R16, R17

**Dependencies:** None

**Files:**
- Create: `docs-site/docs/agent-to-agent.md`

**Approach:**
- Frontmatter: `slug: /agent-to-agent`, `title: "Mnemos Agent Integration — Agent-to-Agent Docs"`, `sidebar_label: "Agent Integration"`. No `sidebar_position`.
- H1: `# Mnemos — Agent Integration Reference`
- AGENT START HERE block: opens with an explicit meta-instruction paragraph (one short paragraph in italics or blockquote) that tells the AI: "Read this block to get started. Use the Decision Tree to jump to a specific operation. If you need full parameter details, continue to the numbered sections below." Then: `npm install` command, all 6 env var keys with actual fixed values (or `0x<your-wallet-key>` for `AGENT_PRIVATE_KEY`), and a complete `MnemosClient` constructor call. No links in this block.
- Decision Tree: exactly 12 lines, one per named SDK method, no grouping: `snapshot`, `autoSnapshot`, `list`, `buy`, `rent`, `fork`, `payRoyalty`, `getListing`, `scanListings`, `loadMemory`, `getMemoryInfo`, `hasAccess`. Install & Configure is implicit in AGENT START HERE and does not occupy a Decision Tree line. Each entry format: `- If you want to [X] → [Section Y](#anchor)`. Anchor slugs must match Docusaurus-generated heading slugs (lowercase, hyphenated from H2/H3 text) — verify each anchor manually, as `pnpm build` does not validate in-page `#fragment` links.
- MnemosClient init in AGENT START HERE must use `chainId: Number(process.env.OG_CHAIN_ID)` — env vars are strings; `MnemosClientConfig.chainId` is `number`.
- Do NOT add any entry to `sidebars.ts`.

**Patterns to follow:**
- `docs-site/docs/intro.md` — only existing page using `slug:` frontmatter.
- `docs-site/docs/getting-started/environment.md` — env var table format.

**Test scenarios:**
- Happy path: Run `pnpm build` in `docs-site/` — build completes with no errors and no broken-link warnings for the new page.
- Happy path: Route `/agent-to-agent` resolves to the new page (verify via `pnpm start` and browser, or inspect build output for the route).
- Edge case: `sidebars.ts` is unchanged — the new page does not appear in the sidebar navigation.
- Edge case: AGENT START HERE block contains zero Markdown links (only backtick code, no `[text](url)` links).
- Edge case: All 12 Decision Tree anchor slugs match their target H2/H3 headings exactly (verify manually — `pnpm build` does not validate in-page `#fragment` links).
- Edge case: MnemosClient init in AGENT START HERE uses `chainId: Number(process.env.OG_CHAIN_ID)` — not the bare string env var.

**Verification:**
- `docs-site/docs/agent-to-agent.md` exists.
- `pnpm build` in `docs-site/` exits 0 with no broken-link errors.
- The AGENT START HERE block is self-contained: a reader (or AI) who copies only that section has enough to produce a working `MnemosClient` initialization.
- All 12 Decision Tree anchor links are manually verified against rendered heading slugs.

---

- U2. **All 13 operation sections**

**Goal:** Write the body of the page covering Install & Configure plus all 12 SDK methods, each using the fixed sub-structure (Purpose → When to use → Complete code → Parameters → Return value → Error handling).

**Requirements:** R6, R7, R8, R9, R12

**Dependencies:** U1

**Files:**
- Modify: `docs-site/docs/agent-to-agent.md`

**Approach:**
- **Install & Configure**: `npm install @mnemos/sdk @0gfoundation/0g-ts-sdk`, then the full `MnemosClient` constructor with all 6 config fields populated from `process.env.*` (same as AGENT START HERE but in the body section with a Parameters table for `MnemosClientConfig`).
- **`snapshot(bundle, parentTokenId?)`**: Complete code showing `MemoryBundle` construction inline, `await mnemos.snapshot(bundle)`, and reading all three return fields (`tokenId`, `storageUri`, `txHash`). Parameters table: `bundle: MemoryBundle`, `parentTokenId?: bigint`. Return: `SnapshotResult` fields inline.
- **`autoSnapshot(options)`**: Complete code with `intervalMs`, `buildBundle`, `onSnapshot`, `onError`, and `process.on('SIGINT', stop)` cleanup. Parameters table for `AutoSnapshotOptions`.
- **`list(tokenId, terms)`**: Code block constructs a viem `walletClient` (using `createWalletClient`, `privateKeyToAccount`, and `http` from `viem` — same pattern as `client.ts` internals) since `MnemosClient` does not expose its internal wallet client. Then defines an inline ERC-721 ABI fragment: `const ERC721_APPROVAL_ABI = [{ name: 'setApprovalForAll', type: 'function', inputs: [{name:'operator',type:'address'},{name:'approved',type:'bool'}], outputs: [] }] as const`. Then calls `walletClient.writeContract({ address: REGISTRY_ADDRESS, abi: ERC721_APPROVAL_ABI, functionName: 'setApprovalForAll', args: [MARKETPLACE_ADDRESS, true] })`. Inline comment: `// call once per agent wallet — approval persists on-chain`. Then `mnemos.list(tokenId, terms)`. R9 note: explicit comment that `tokenId` comes from `snapshot()`.
- **`buy(tokenId)`**: Include `getListing()` call before `buy()` to show how to read the price. R9 note.
- **`rent(tokenId, durationDays)`**: Show `getListing()` before the call; compute total cost in a comment. R9 note.
- **`fork(parentTokenId, contentHash, storageUri, value)`**: Single code block — `const info = await mnemos.getMemoryInfo(parentTokenId)`, `const listing = await mnemos.getListing(parentTokenId)`, `await mnemos.fork(parentTokenId, info.contentHash, info.storageUri, listing.forkPrice)`. Inline comment: `// child starts as a reference to the parent's content`. No cross-references in the code.
- **`payRoyalty(parentTokenId, amount)`**: Show `earningsInWei` as a caller-supplied bigint. Show optional comment deriving a suggested amount using `royaltyBps` from `getListing(parentTokenId)`. Takes `parentTokenId`, not childTokenId. R9 note.
- **`getListing(tokenId)`**: Simple read call; return the inline struct fields: `seller`, `buyPrice`, `rentPricePerDay`, `forkPrice`, `royaltyBps`.
- **`scanListings(fromBlock?)`**: Show both the no-argument call (scan all history) and the `fromBlock` variant. Return: array of `ListingEvent`.
- **`loadMemory(tokenId)`**: Show access check first (`hasAccess`), then `loadMemory`, then how to use the returned `MemoryBundle.data`.
- **`getMemoryInfo(tokenId)`**: Simple read; return all `MemoryInfo` fields.
- **`hasAccess(tokenId, callerAddress)`**: Show deriving `callerAddress` from the wallet.
- **R12**: Every wei-valued bigint literal carries a `// X A0GI` comment inline. Example: `buyPrice: BigInt('1000000000000000000') // 1 A0GI`.

**Patterns to follow:**
- `docs-site/docs/sdk/marketplace.md` — `setApprovalForAll` warning placement and `fork()` three-step pattern.
- `docs-site/docs/sdk/snapshot.md` — `MemoryBundle` construction pattern.
- `docs-site/docs/sdk/auto-snapshot.md` — `autoSnapshot` options and SIGINT cleanup.

**Test scenarios:**
- Happy path: Every code block in the section is syntactically valid TypeScript (no syntax errors detectable by reading).
- Happy path: Every operation listed in R8 has a section with all 6 sub-structure fields present (Purpose, When to use, Complete code, Parameters table, Return value, Error handling).
- Edge case: `list()` code block contains `setApprovalForAll` call before `mnemos.list()`.
- Edge case: `fork()` code block contains all three steps (`getMemoryInfo`, `getListing`, `fork`) without referencing other sections.
- Edge case: No code block contains `...` or `/* your code here */` or similar placeholder patterns.
- Integration: AE3 — copy-paste the `fork()` code block; it should produce a complete, runnable function without modification beyond env vars. Covers AE3.
- Integration: AE4 — `list()` section explicitly states `tokenId` must come from `snapshot()`. Covers AE4.

**Verification:**
- All 13 operation sections are present in the file.
- `pnpm build` still exits 0 (no broken links introduced by internal links within sections).
- Every code block is free of non-env-var placeholders.

---

- U3. **Reference sections and Troubleshooting**

**Goal:** Write the All Environment Variables table, Type Reference, and Troubleshooting section to complete the page.

**Requirements:** R10, R11, R12, R13

**Dependencies:** U2

**Files:**
- Modify: `docs-site/docs/agent-to-agent.md`

**Approach:**
- **All Environment Variables table** (columns: Variable | Value / Example | Required | Description):

  | Variable | Value / Example | Required | Description |
  |---|---|---|---|
  | `AGENT_PRIVATE_KEY` | `0x<your-wallet-key>` | Yes | Wallet key used to sign txns and encrypt memory |
  | `OG_CHAIN_ID` | `16661` | Yes | 0G Mainnet chain ID |
  | `OG_RPC_URL` | `https://evmrpc.0g.ai` | Yes | 0G Chain EVM RPC endpoint |
  | `OG_STORAGE_NODE` | `https://indexer-storage-turbo.0g.ai` | Yes | 0G Storage indexer URL |
  | `REGISTRY_ADDRESS` | `0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E` | Yes | MemoryRegistry ERC-721 contract |
  | `MARKETPLACE_ADDRESS` | `0xFeb5Ac77Cd7746e2b35825dA800458D660D10209` | Yes | MemoryMarketplace contract |

- **Type Reference**: For each of the 9 exported types, show field names and TypeScript types in a code block. Do not repeat prose from operation sections. Types: `MnemosClientConfig`, `MemoryBundle`, `MemoryMetadata`, `MemoryCategory`, `ListingTerms`, `ListingEvent`, `SnapshotResult`, `MemoryInfo`, `AutoSnapshotOptions`. Note: `Listing` from the origin doc R11 does not exist as a named exported type — `getListing()` return fields are documented in the `getListing()` section.
- **Troubleshooting** (≥5 entries, format: symptom → cause → fix):
  1. `Error: Missing required env var: AGENT_PRIVATE_KEY` → env not set → set `AGENT_PRIVATE_KEY=0x...` in `.env`.
  2. `Error: insufficient funds` / tx reverts silently → A0GI balance too low → fund wallet from faucet.0g.ai.
  3. `Error: execution reverted` on `buy()` or `list()` → `setApprovalForAll` not called → call `setApprovalForAll(MARKETPLACE_ADDRESS, true)` on the MemoryRegistry contract before listing.
  4. `Error: Upload failed` or `AxiosError` during `snapshot()` → 0G Storage node unreachable or bundle too large → verify `OG_STORAGE_NODE` URL; ensure bundle JSON is serializable.
  5. `Error: could not detect network` or chain ID mismatch → wrong `OG_RPC_URL` or `OG_CHAIN_ID` → confirm both match the chain table in the env vars section.

**Patterns to follow:**
- `docs-site/docs/getting-started/environment.md` — env var table format (Variable | Value | Description columns).
- `docs-site/docs/sdk/types-reference.md` — TypeScript type block format.

**Test scenarios:**
- Happy path: All Environment Variables table has exactly 6 rows, with fixed values for 5 of them (only `AGENT_PRIVATE_KEY` is agent-supplied). Covers AE5.
- Happy path: Type Reference contains all 9 exported SDK types listed in R11 (not `Listing`, which is not an exported type).
- Happy path: Troubleshooting section has ≥5 entries, each with symptom, cause, and fix.
- Edge case: All fixed env var values in the table match the values used in code examples in U2 (no inconsistency between table and code).
- Edge case: No broken internal links to type anchors from operation sections (Docusaurus auto-generates anchors from H3 headings; verify anchor names match what Decision Tree links to).
- Integration: AE1 — an AI reading only the AGENT START HERE block (U1) can produce a working init; the env table (U3) provides backup detail. Covers AE1.

**Verification:**
- `pnpm build` in `docs-site/` exits 0 with no errors.
- The env table has actual values (no "fill in" placeholder) for all 5 fixed variables.
- Troubleshooting has ≥5 distinct errors covering the categories: missing env, low balance, missing approval, storage failure, wrong chain.
- All 9 types in R11 are defined in Type Reference.

---

## System-Wide Impact

- **Interaction graph:** No existing page links to `/agent-to-agent`, so no callback chain is affected. The new page may link to existing pages (quickstart, SDK reference, marketplace) — those links must resolve or the build fails (`onBrokenLinks: 'throw'`).
- **Error propagation:** Broken internal links fail the Vercel build. All `[text](/path)` links in the new page must point to existing routes.
- **State lifecycle risks:** None — this is a static content addition.
- **API surface parity:** None — no code interfaces are changed.
- **Integration coverage:** Manual verification that the page routes correctly at `/agent-to-agent` after `pnpm build` / `pnpm start`.
- **Unchanged invariants:** `sidebars.ts`, `docusaurus.config.ts`, and all existing pages are unmodified. Sidebar navigation and all existing routes remain identical.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `setApprovalForAll` has no SDK helper — viem `writeContract` must be shown inline in the `list()` example | U2 approach specifies the exact inline ABI fragment and call pattern; implementer must follow it to satisfy R7 |
| In-page `#fragment` anchor links are not validated by `pnpm build` | U1 verification explicitly requires manual anchor slug verification; Docusaurus `onBrokenLinks: 'throw'` does not cover this |
| Contract addresses could theoretically change on a future redeployment | Addresses are confirmed from `backend/.env` against the live 0G Mainnet deployment; the page should note the deployment source (chainscan.0g.ai links) so users can verify |
| `list()` viem `writeContract` call pattern may require constructing a wallet client separately from MnemosClient | MnemosClient does not expose its internal walletClient; the U2 example must show constructing a separate `createWalletClient` using the same private key and chain, identical to what `client.ts` does internally |

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-11-agent-to-agent-docs-requirements.md](../brainstorms/2026-05-11-agent-to-agent-docs-requirements.md)
- Related code: `backend/packages/sdk/src/types.ts`, `backend/packages/sdk/src/client.ts`
- Related docs: `docs-site/docs/sdk/marketplace.md`, `docs-site/docs/getting-started/environment.md`
