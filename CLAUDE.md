# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run the Express server (port 3000)
npm run start

# Development mode with auto-reload
npm run dev

# CLI usage
npx eth-export <ethereum-address>
npx eth-export 0xa39b189482f984388a34460636fea9eb181ad1a6
```

## Environment Setup

Create `.env` in project root:
```
ETHERSCAN_API_KEY=your_key
CHAIN_IDS=1,137,42161  # Comma-separated chain IDs (Ethereum, Polygon, Arbitrum)
```

Use `CHAIN_IDS` for multiple chains or `CHAIN_ID` for a single chain. Defaults to Ethereum mainnet (1). Uses Etherscan v2 unified API.

## Architecture

This is a Node.js + Express service with a CLI that exports Ethereum wallet transactions to CSV.

### Data Flow

```
CLI (bin/cli.js) or REST (/export)
    → exportService.js
    → etherscanClient.js (API calls with rate limiting)
    → normalize.js (unified CSV schema)
    → CSV file output
```

### Key Components

- **`src/clients/etherscanClient.js`**: Thin Etherscan API client with built-in 1-second delays between calls (respects free tier 2 calls/sec limit). Fetches normal, internal, ERC-20, ERC-721, and ERC-1155 transactions.

- **`src/utils/normalize.js`**: Transforms provider-specific response shapes into a unified row schema. Add new transaction types here.

- **`src/services/exportService.js`**: Orchestrates fetching and CSV generation. Shared by both server and CLI entrypoints.

- **Dual entrypoints**: `src/server.js` (Express) and `bin/cli.js` both use the same exportService.

### API Endpoints

- `GET /export?address=<ethAddress>` - Returns JSON with export result
- Server runs on PORT env var or 3000

### Test Addresses

- `0xa39b189482f984388a34460636fea9eb181ad1a6` - small account
- `0xd620AADaBaA20d2af700853C4504028cba7C3333` - sample address
