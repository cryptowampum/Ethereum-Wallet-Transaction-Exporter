#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportAddressCsv } from '../src/services/exportService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Take address and optional filename from command line
const address = process.argv[2];
const filename = process.argv[3]; // Optional

if (!address) {
  console.log('Usage: npx eth-export <ethereum-address> [filename]');
  console.log('Example: npx eth-export 0xa39b189482f984388a34460636fea9eb181ad1a6');
  console.log('Example: npx eth-export 0xa39b189482f984388a34460636fea9eb181ad1a6 my-transactions.csv');
  process.exit(1);
}

async function main() {
  try {
    const outputDir = path.join(__dirname, '..', 'exports');
    const result = await exportAddressCsv({ address, outputDir, filename });
    console.log(`✅ Exported ${result.count} transactions to: ${result.filePath}`);
  } catch (e) {
    console.error('❌ Export failed:', e?.message || e);
    process.exit(1);
  }
}

main();


