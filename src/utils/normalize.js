function toEth(wei) {
  return (Number(wei) / 1e18).toFixed(6);
}

export function normalizeTransactions(data, chainId) {
  const rows = [];

  // Normal ETH transactions
  for (const tx of data.normal || []) {
    rows.push({
      chainId,
      transactionHash: tx.hash,
      dateTime: new Date(tx.timeStamp * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      transactionType: 'ETH',
      assetContract: '',
      assetSymbol: 'ETH',
      tokenId: '',
      value: toEth(tx.value),
      gasFeeEth: toEth(tx.gasPrice * tx.gasUsed)
    });
  }

  // ERC-20 tokens
  for (const tx of data.erc20 || []) {
    rows.push({
      chainId,
      transactionHash: tx.hash,
      dateTime: new Date(tx.timeStamp * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      transactionType: 'ERC-20',
      assetContract: tx.contractAddress,
      assetSymbol: tx.tokenSymbol,
      tokenId: '',
      value: (Number(tx.value) / Math.pow(10, tx.tokenDecimal)).toFixed(6),
      gasFeeEth: ''
    });
  }

  // ERC-721 NFTs
  for (const tx of data.erc721 || []) {
    rows.push({
      chainId,
      transactionHash: tx.hash,
      dateTime: new Date(tx.timeStamp * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      transactionType: 'ERC-721',
      assetContract: tx.contractAddress,
      assetSymbol: tx.tokenName,
      tokenId: tx.tokenID,
      value: '1',
      gasFeeEth: ''
    });
  }

  return rows;
}

