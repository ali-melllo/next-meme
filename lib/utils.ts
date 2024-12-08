import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shortenString = (str: string, length: number) => {
  if (str?.length > length) {
    return ` ${str.substring(0, length)} ...`;
  }
  return str;
};

export function formatElapsedTime(timestamp: number) {
  const now = Date.now(); // Current time in milliseconds
  const elapsedTime = now - timestamp; // Time difference in milliseconds

  const minutes = Math.floor(elapsedTime / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return minutes < 1 ? '30s' : `${minutes}m`;
  }
}

export function formatMarketCap(value: number) {
  if (value >= 1_000_000_000) {
    return `$ ${(value / 1_000_000_000).toFixed(2)}B`; // Billions
  } else if (value >= 1_000_000) {
    return `$ ${(value / 1_000_000).toFixed(2)}M`; // Millions
  } else if (value >= 1_000) {
    return `$ ${(value / 1_000).toFixed(2)}K`; // Thousands
  } else {
    return '$ ' + value.toFixed(2); // Less than 1K, show up to 2 decimal places
  }
}

const normalize = (value: number, min: number, max: number) => (value - min) / (max - min);

const deriveFeatures = (token: any) => {
  const liquidityRatio = token.virtual_token_reserves / token.virtual_sol_reserves;
  const tradingRatio = token.sol_amount / token.token_amount;
  const marketCapPerUnit = token.usd_market_cap / token.total_supply;
  const activityRecency = (Date.now() - token.last_reply) / 60000; // minutes
  const ageInHours = (Date.now() - token.created_timestamp) / 3600000; // hours
  const supplyDemandRatio = token.total_supply / token.token_amount; // High demand, lower ratio
  const buyPressure = token.is_buy ? token.sol_amount : 0; // Track buy-side activity

  return { liquidityRatio, tradingRatio, marketCapPerUnit, activityRecency, ageInHours, supplyDemandRatio, buyPressure };
};

const scoreToken = (token: any) => {
  const { liquidityRatio, tradingRatio, marketCapPerUnit, activityRecency, ageInHours, supplyDemandRatio, buyPressure } = deriveFeatures(token);

  // Normalize values
  const normalizedLiquidity = normalize(liquidityRatio, 0.01, 100);
  const normalizedTrading = normalize(tradingRatio, 0.01, 10);
  const normalizedMarketCap = normalize(token.usd_market_cap, 1000, 1000000);
  const normalizedActivity = normalize(activityRecency, 0, 1440); // 24 hours max
  const normalizedAge = ageInHours < 24 ? 1 - normalize(ageInHours, 0, 24) : 0; // Favor young tokens
  const normalizedSupplyDemand = normalize(supplyDemandRatio, 0.01, 100);
  const normalizedBuyPressure = normalize(buyPressure, 0, 100000);

  // Social and sentiment analysis
  const socialScore = (token.twitter ? 0.4 : 0) + (token.telegram ? 0.4 : 0) + (token.website ? 0.2 : 0);
  const sentimentScore = /viral|trending|TikTok/i.test(token.description) ? 0.3 : 0;

  // Pump indicators (e.g., rapid activity and buy pressure)
  const pumpIndicator = normalizedActivity * 0.2 + normalizedBuyPressure * 0.3;

  // Total score
  return (
    normalizedLiquidity * 0.15 +
    normalizedTrading * 0.15 +
    normalizedMarketCap * 0.15 +
    normalizedActivity * 0.1 +
    normalizedAge * 0.1 +
    normalizedSupplyDemand * 0.1 +
    socialScore * 0.1 +
    sentimentScore * 0.05 +
    pumpIndicator * 0.1
  );
};

const rankTokens = (tokens: any) => {
  return tokens
    .map((token: any) => ({
      ...token,
      score: scoreToken(token),
    }))
    .sort((a: any, b: any) => b.score - a.score); // Sort by score descending
};

const analyzeTrends = (tokens: any, historicalScores: any) => {
  return tokens.map((token: any) => {
    const previousScore = historicalScores[token.mint] || 0;
    const currentScore = scoreToken(token);
    const trend = currentScore - previousScore;

    // Advanced trend detection: consider a token's momentum over multiple factors
    const isPumping = trend > 0.2 && token.is_buy && token.sol_amount > 1000; // Adjust thresholds as needed

    return {
      ...token,
      score: currentScore,
      trend: isPumping ? "pumping" : trend > 0 ? "upward" : "stable",
    };
  });
};

export const analyzeAndPredictTokens = (tokens: any, historicalScores = {}) => {
  const rankedTokens = rankTokens(tokens);
  const trendAnalysis = analyzeTrends(rankedTokens, historicalScores);

  return trendAnalysis.filter((token: any) => token.trend === "pumping").slice(0, 10);
};

interface Transfer {
  token_address: string;
  flow: "in" | "out";
  amount: number;
  value: number;
  block_time: number;
  transaction_hash: string;
  activity_type: string;
}

interface Token {
  address: string;
  tokenAddress: string;
  amount: number;
  decimals: number;
  owner: string;
  priceUsdt: number;
  tokenName: string;
  tokenSymbol: string;
  tokenIcon: string;
  balance: number;
  value: number;
}

interface Item {
  mintAddress: string;
  volume: number;
  price: number;
  transactionCount: number;
  liquidity: number;
  marketCap: number;
  transfers: Transfer[]; // Transfers are now inside the item
  tokens: Token[]; // Tokens are now inside the item
}

interface ScoredItem extends Item {
  score: number;
  totalValueIn: number;
  totalValueOut: number;
  maxAmountOut: number;
  maxValueOut: number;
  hoursBetweenTransfers: number;
  totalTokenValue: number;
  totalBalance: number;
}

interface TokensData {
  data_type: string;
  tokens: Token[];
  count: number;
}


interface NestedTransfer {
  [key: string]: Transfer; // Each transfer is keyed by an identifier
}


// Helper function to calculate volatility (as an example, you can tweak this based on your data characteristics)
const calculateVolatility = (transfers: Transfer[]) => {
  const values = transfers.map(transfer => transfer.value);
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / values.length;
  const volatility = Math.sqrt(variance);
  return volatility;
};

// Helper function to calculate the frequency of transfers in a given time window
const calculateTransferFrequency = (transfers: Transfer[], timeWindow: number) => {
  const now = Date.now() / 1000; // Current time in seconds
  const recentTransfers = transfers.filter(transfer => now - transfer.block_time <= timeWindow);
  return recentTransfers.length / timeWindow; // Transfers per second in the last `timeWindow` seconds
};

// Analyze function with enhanced metrics
const analyzeTransfers = (transfers: NestedTransfer, timeWindow: number) => {
  let totalValueIn = 0;
  let totalValueOut = 0;
  let maxAmountOut = 0;
  let maxValueOut = 0;
  let latestTime = 0;
  let firstTransferTime: number | null = null;
  let volatility = 0;
  let transferFrequency = 0;

  // Analyze the transfers data
  const transferList = Object.values(transfers); // Convert to array for easy iteration
  volatility = calculateVolatility(transferList);
  transferFrequency = calculateTransferFrequency(transferList, timeWindow);

  for (const transfer of transferList) {
    if (transfer.activity_type === "ACTIVITY_SPL_TRANSFER") {
      if (transfer.flow === "out") {
        totalValueOut += transfer.value;
        maxAmountOut = Math.max(maxAmountOut, transfer.amount);
        maxValueOut = Math.max(maxValueOut, transfer.value);
      } else if (transfer.flow === "in") {
        totalValueIn += transfer.value;
      }

      latestTime = Math.max(latestTime, transfer.block_time);
      if (firstTransferTime === null || transfer.block_time < firstTransferTime) {
        firstTransferTime = transfer.block_time;
      }
    }
  }

  return {
    totalValueIn,
    totalValueOut,
    maxAmountOut,
    maxValueOut,
    volatility,
    transferFrequency,
    latestTime,
    firstTransferTime,
  };
};

const analyzeTokens = (tokensData: TokensData) => {
  let totalTokenValue = 0;
  let totalBalance = 0;

  // Ensure tokens array exists in the object
  const { tokens } = tokensData;

  // Iterate through tokens and calculate total value and balance
  for (let token of tokens) {
    if (token.tokenAddress) {  // Check if the token has a tokenAddress
      totalTokenValue += token.value;
      totalBalance += token.balance;
    }
  }

  return { totalTokenValue : totalTokenValue || 0, totalBalance : totalBalance || 0 };
};

const analyzeBalanceChanges = (transfers: Record<string, Transfer>) => {
  let totalBalanceChange = 0;
  let maxBalanceChange = 0;
  let balanceAtStartTime = Infinity;
  let balanceAtEndTime = -Infinity;

  for (const transferId in transfers) {
    const transfer = transfers[transferId];

    // We now simply check the flow ("in" or "out") and adjust the balance change accordingly
    if (transfer.flow === "in") {
      totalBalanceChange += transfer.amount;
    } else if (transfer.flow === "out") {
      totalBalanceChange -= transfer.amount;
    }

    // Track the maximum balance change
    maxBalanceChange = Math.max(maxBalanceChange, Math.abs(transfer.amount));

    // Track the first and last block times (optional based on your requirements)
    if (transfer.block_time < balanceAtStartTime) {
      balanceAtStartTime = transfer.block_time;
    }
    if (transfer.block_time > balanceAtEndTime) {
      balanceAtEndTime = transfer.block_time;
    }
  }

  return {
    totalBalanceChange,
    maxBalanceChange,
    balanceAtStartTime: balanceAtStartTime === Infinity ? null : balanceAtStartTime,
    balanceAtEndTime: balanceAtEndTime === -Infinity ? null : balanceAtEndTime,
  };
};

export const finalAnalyze = async (topTenItems: Item[]) => {
  if (topTenItems.length === 0) {
    console.log("No items to analyze.");
    return [];
  }

  const weights = {
    transfers: 0.3, // Reduced weight for transfers slightly
    tokens: 0.25, // Token activity score
    balanceChanges: 0.3, // Balance change score, focusing on volatility
    liquidity: 0.1, // Slight weight to liquidity
    marketCap: 0.1, // Slight weight to market cap
  };

  // Use Promise.all to run all analysis functions in parallel
  const analyzedItems = await Promise.all(
    topTenItems.map(async (item: any) => {
      const { transfers, tokens } = item;

      // Set time window for recency analysis (e.g., 24 hours)
      const timeWindow = 86400; // 24 hours in seconds

      // Parallel analysis for transfers, tokens, and balance changes
      const [transferAnalysis, tokenAnalysis, balanceChangeAnalysis] = await Promise.all([
        analyzeTransfers(transfers, timeWindow),
        analyzeTokens(tokens),
        analyzeBalanceChanges(transfers),
      ]);

      return {
        ...item,
        transferAnalysis,
        tokenAnalysis,
        balanceChangeAnalysis,
      };
    })
  );

  // Normalize data using standard deviation for more meaningful comparisons
  const maxTransferValue = Math.max(
    1,
    ...analyzedItems.map(item => item.transferAnalysis.totalValueIn + item.transferAnalysis.totalValueOut)
  );
  const maxTokenValue = Math.max(1, ...analyzedItems.map(item => item.tokenAnalysis.totalTokenValue));
  const maxBalanceChange = Math.max(1, ...analyzedItems.map(item => item.balanceChangeAnalysis.totalBalanceChange));
  const maxVolatility = Math.max(1, ...analyzedItems.map(item => item.transferAnalysis.volatility));
  const maxTransferFrequency = Math.max(1, ...analyzedItems.map(item => item.transferAnalysis.transferFrequency));

  // Now calculate the scores for each item based on all factors
  const finalScoredItems = analyzedItems.map(item => {
    const { transferAnalysis, tokenAnalysis, balanceChangeAnalysis } = item;

    // Scoring based on normalized data
    const transferScore =
      ((transferAnalysis.totalValueIn + transferAnalysis.totalValueOut) / maxTransferValue) * weights.transfers +
      (transferAnalysis.transferFrequency / maxTransferFrequency) * 0.1 + // Adding transfer frequency to the score
      (transferAnalysis.volatility / maxVolatility) * 0.2 || 0; // Adding volatility

    const tokenScore =
      (tokenAnalysis.totalTokenValue / maxTokenValue) * weights.tokens || 0;

    const balanceChangeScore =
      (balanceChangeAnalysis.totalBalanceChange / maxBalanceChange) * weights.balanceChanges || 0;

    const liquidityScore = (item.liquidity / 1000) * weights.liquidity || 0; // Example: Liquidity normalized

    const marketCapScore = (item.marketCap / 1000000000) * weights.marketCap || 0; // Example: Market cap in billions

    // Calculate total score with added weights for liquidity and market cap
    const totalScore =
      transferScore +
      tokenScore +
      balanceChangeScore +
      liquidityScore +
      marketCapScore;

    return {
      ...item,
      score: isNaN(totalScore) ? 0 : totalScore, // Handle NaN scores
      transferAnalysis,
      tokenAnalysis,
      balanceChangeAnalysis,
    };
  });

  // Sort items by score (highest to lowest)
  const sortedByScore = finalScoredItems.sort((a, b) => b.score - a.score);

  return sortedByScore;
};