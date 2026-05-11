---
sidebar_label: Privacy & Access
sidebar_position: 5
---

# Privacy & Access Model

## The v2 Encryption Scheme

When the SDK snapshots a memory bundle, it derives the encryption key directly from the content:

```
key = keccak256(plaintext JSON)[0:32]   // first 32 bytes
contentHash = keccak256(plaintext JSON) // full 32 bytes, stored on-chain
```

The bundle is encrypted with NaCl secretbox using this key, then uploaded to 0G Storage. The `contentHash` is stored on-chain in `MemoryRegistry`.

**This means: anyone who can read the `contentHash` on-chain can derive the decryption key and decrypt the bundle.**

The `v2:` prefix on a `storageURI` signals that this scheme is in use. The SDK uses the v2 scheme for all new tokens.

---

## There Is No Cryptographic Confidentiality in v1

This is intentional, not an oversight.

The design goal is a **verifiable marketplace**: before buying or renting a memory token, a potential buyer can decrypt the bundle and inspect its contents. The `contentHash` on-chain is the proof that the decrypted content is authentic — the keccak256 of the plaintext must match.

What this means in practice:

- Anyone with an RPC connection to 0G Chain can read `contentHash` for any token
- Anyone who can read `contentHash` can decrypt the corresponding bundle from 0G Storage
- There is **no access control at the encryption layer** in v1

**Do not store secrets, private keys, or sensitive personal data in a v1 memory bundle.**

---

## The v1 Legacy Scheme

Tokens minted before the v2 upgrade use a `storageURI` without the `v2:` prefix (e.g., `0g://rootHash`). These use a different key derivation:

```
key = keccak256(walletAddress + contentHash)
```

Only the original creator's wallet address is known, so only the creator can decrypt v1 tokens. These tokens are not decryptable by buyers before purchase — which made marketplace verification impossible and motivated the v2 redesign.

The SDK detects the prefix and uses the appropriate decryption path automatically.

---

## API-Level Access Control

The REST API adds a separate layer of access control on top of the encryption layer. The `GET /api/memory/:tokenId` endpoint is guarded by `WalletAuthGuard`:

- The requester must sign a timestamp with their wallet (EIP-191 `personal_sign`)
- The API verifies that the signing address is the current token owner or an active renter

This does not protect the bundle from anyone who queries the chain directly — it only gates the convenience API. See [Authentication →](/api/authentication) for header format and signing details.

---

## Roadmap: TEE-Based Key Escrow

The v2 roadmap addresses the confidentiality gap with a TEE (Trusted Execution Environment) key escrow model:

- The encryption key is held inside a TEE, not derived from `contentHash`
- The TEE releases the key only after confirming on-chain that payment has been received
- This enables atomic key release: **decryption key delivered if and only if payment is confirmed**

Under this model, buyers cannot decrypt before purchase, and the royalty system can be enforced atomically (see [Royalty →](/concepts/marketplace#royalty--earnings-sharing)). The honor-system dependency is removed.

This is not yet implemented in v1.

---

**Next:** [Quick Start →](/getting-started/quickstart)
