import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ETHERSCAN_API_KEY || '';
const BASE_URL = 'https://api.etherscan.io/v2/api'; // Etherscan v2 unified endpoint

// Parse chain IDs: prefer CHAIN_IDS (comma-separated), fall back to CHAIN_ID, default to '1'
export function getChainIds() {
  if (process.env.CHAIN_IDS) {
    return process.env.CHAIN_IDS.split(',').map(id => id.trim());
  }
  return [process.env.CHAIN_ID || '1'];
}

async function getData(action, address, chainId) {
  console.log(`Calling API: ${action} for ${address} on chain ${chainId}`);

  const { data } = await axios.get(BASE_URL, {
    params: { chainid: chainId, module: 'account', action, address, apikey: API_KEY }
  });
  
  console.log(`API response status: ${data?.status}, message: ${data?.message}`);
  
  // "No transactions found" is normal, not an error
  if (data?.status === '0' && data?.message === 'No transactions found') {
    console.log(`No transactions found for ${action}`);
    return [];
  }
  
  // Real API errors
  if (data?.status === '0') {
    console.log(`API error: ${data?.result}`);
    throw new Error(data?.result || 'API error');
  }
  
  return data.result || [];
}

// Helper function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTransactions(address, chainId) {
  console.log(`Fetching transactions for chain ${chainId}...`);

  // Sequential calls with 1 second delay between each (respects 2/sec limit)
  const normal = await getData('txlist', address, chainId);
  console.log('Got normal transactions');
  await wait(1000); // Wait 1 second

  const internal = await getData('txlistinternal', address, chainId);
  console.log('Got internal transactions');
  await wait(1000); // Wait 1 second

  const erc20 = await getData('tokentx', address, chainId);
  console.log('Got ERC-20 transactions');
  await wait(1000); // Wait 1 second

  const erc721 = await getData('tokennfttx', address, chainId);
  console.log('Got ERC-721 transactions');
  await wait(1000); // Wait 1 second

  const erc1155 = await getData('token1155tx', address, chainId);
  console.log('Got ERC-1155 transactions');

  return { normal, internal, erc20, erc721, erc1155 };
}


