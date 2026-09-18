# FROIN Solana Kora — Gasless Fee Payer Setup

Gasless SPL token transaction infrastructure for **$FROIN**, the arcade/loyalty
token powering **RiffWin** (proof-of-participation), **VWin** (watch-to-earn) within the **Fravents** ecosystem — a
live-events and ticketing platform in Colombia (Bogotá/Medellín).

Built for the **Colosseum hackathon**.

## The Problem

Fravents fans earn and redeem $FROIN through watch-to-earn dynamics, merchant
bonus redemptions, and ticket purchases. Most of these fans are not crypto-native:
requiring them to hold SOL just to pay network fees is the single biggest
onboarding blocker for a loyalty token meant to feel like a normal app reward,
not a crypto asset.

This repo solves that specific problem: **users interact with $FROIN without
ever needing to acquire or hold SOL.**

## How We Use Solana

- **$FROIN** is a standard SPL token (Token Program, no Token-2022 extensions
  for this phase) — kept intentionally simple for the hackathon scope.
- **Kora** acts as a fee-payer node: it validates incoming transactions against
  a strict security policy (program allowlist, token allowlist, per-wallet rate
  limits, max fee caps) and co-signs as the fee payer, so the end user only ever
  signs their own transfer instruction — never a SOL-denominated fee.
- Fee sponsorship currently runs in **Free mode** (fully subsidized by us) to
  maximize onboarding conversion during the hackathon. The config is structured
  so that switching to fee collection _in $FROIN itself_ (via a Jupiter price
  oracle) later is a config change, not an architecture change.
- **Helius** provides RPC access, balance/token account queries, and webhook-based
  transaction indexing — no reliance on public Solana RPC endpoints.
- Wallet onboarding (outside this specific repo, in the main app) uses
  **Web3Auth (MetaMask Embedded Wallet SDK)** for non-custodial, MPC-based
  embedded wallets — social/email login, no seed phrase, no browser extension
  required.

## Why This Matters for Fravents

Fravents already runs a real ticketing business with actual merchants and a
300-person beta. $FROIN is designed as an _arcade token_ (per a16z's framework):
a stable-value, issuer-managed unit for spending inside the ecosystem — not a
speculative asset. Solana makes this practical because:

- Fees are a fraction of a cent, which matters when you're issuing thousands of
  micro-rewards per live event.
- Fast finality supports real-time redemption at a merchant booth during an event.
- A mature embedded-wallet and gasless-transaction ecosystem (Web3Auth, Kora)
  lets us deliver a Web2-feeling UX on top of a fully on-chain, transferable,
  interoperable token — without building a custodial ledger ourselves.

## Scope of This Repo

This repo covers **only the Kora fee-payer node setup**:

- `server/kora.toml` — Kora RPC server configuration: program allowlist, token
  allowlist, fee cap, per-wallet usage limits, pricing mode.
- `server/signer.toml` — fee-payer signer configuration (local keypair for this
  phase; migrating to a managed signer like Turnkey/Vault is explicitly deferred
  to production).

**Out of scope for this repo / this phase:**

- Anchor smart contracts (on-chain vault, staking, verifiable reward rules) —
  deferred to Phase 2.
- Token-2022 migration — deferred, staying on classic SPL for now.
- Web3Auth frontend integration, backend SIWS auth, and the main Next.js/Node.js
  app — live in the main Fravents/RiffWin/VWin codebase, not here.
- Cloud deployment (Cloud Run) — this node currently runs locally for development
  and testing on devnet.

## Environment

Currently configured for **Solana devnet**. All secrets (signer keypair path,
API keys) are supplied via environment variables — never hardcoded, never
committed. See `.gitignore` for excluded files.

## Getting Started

1. Install `kora-cli` (requires the Rust toolchain):

```bash
   cargo install kora-cli
```

2. Generate a devnet keypair for the fee-payer signer (kept separate from any
   treasury wallet) and fund it via the Solana devnet faucet.
3. Configure `server/signer.toml` to point to that keypair.
4. Configure `server/kora.toml` with the $FROIN devnet mint address.
5. Run the node:

```bash
   kora rpc --config server/kora.toml --signers-config server/signer.toml
```

## Security Notes

- The fee-payer signer wallet is funded with devnet SOL only and is fully
  separate from any $FROIN treasury wallet.
- `allowed_programs` is intentionally minimal: System Program, SPL Token
  Program, Associated Token Account Program. No arbitrary program execution
  is permitted.
- Per-wallet usage limits are enforced to prevent abuse of the sponsored-fee
  model.
- Moving the signer to a managed key-management solution (Turnkey/Vault) is a
  required step before any mainnet deployment.

## Status

Hackathon prep phase — Kora running locally against devnet, ahead of
integration with the main Fravents/RiffWin/VWin application.
