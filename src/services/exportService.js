import fs from 'fs';
import path from 'path';
import { getTransactions, getChainIds } from '../clients/etherscanClient.js';
import { normalizeTransactions } from '../utils/normalize.js';

function rowsToCsv(rows) {
  return rows.map(row =>
    Object.values(row).map(val => `"${val}"`).join(',')
  ).join('\n');
}

export async function exportAddressCsv({ address, outputDir, filename }) {
  const chainIds = getChainIds();

  // Create output file with headers
  await fs.promises.mkdir(outputDir, { recursive: true });
  const fileName = filename || `transactions_${address}_${Date.now()}.csv`;
  const filePath = path.join(outputDir, fileName);

  const headers = 'chainId,transactionHash,dateTime,from,to,transactionType,assetContract,assetSymbol,tokenId,value,gasFeeEth\n';
  await fs.promises.writeFile(filePath, headers);

  let totalCount = 0;
  const errors = [];

  // Process each chain and append to CSV immediately
  for (let i = 0; i < chainIds.length; i++) {
    const chainId = chainIds[i];
    console.log(`\nFetching from chain ${chainId} (${i + 1}/${chainIds.length})...`);

    try {
      const data = await getTransactions(address, chainId);
      const rows = normalizeTransactions(data, chainId);

      if (rows.length > 0) {
        await fs.promises.appendFile(filePath, rowsToCsv(rows) + '\n');
        console.log(`Wrote ${rows.length} transactions for chain ${chainId}`);
        totalCount += rows.length;
      } else {
        console.log(`No transactions found for chain ${chainId}`);
      }
    } catch (err) {
      console.error(`Error fetching chain ${chainId}: ${err.message}`);
      errors.push({ chainId, error: err.message });
      // Continue to next chain
    }
  }

  if (errors.length > 0) {
    console.warn(`\nCompleted with ${errors.length} chain error(s):`, errors.map(e => `chain ${e.chainId}`).join(', '));
  }

  return { filePath, fileName, count: totalCount, errors };
}


