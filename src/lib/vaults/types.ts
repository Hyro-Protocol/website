// Types for the vault explore page

import { Challenge } from "@/protocol/policyChallenges";
import { SanitizedAccount } from "../solana/helpers";

export interface VaultHistoricalSnapshot {
  timestamp: number;
  tvl: number;
  sharePrice: number;
}

export interface VaultPerformance {
  day1: number | null;
  week1: number | null;
  month1: number | null;
  month3: number | null;
  month6: number | null;
  year1: number | null;
  allTime: number | null;
}

export interface ManagerInfo {
  address: string;
  name: string | null;
  verified: boolean;
  riskRating: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
}

export interface VaultData {
  address: string;
  seed: string;
  name: string;
  
  // Manager info
  manager: ManagerInfo | null;
  
  // Current on-chain data (fetched real-time)
  tvl: number;
  sharePrice: number;
  totalShares: string; // Serialized as string for JSON compatibility
  underlyingMint: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  
  // Cached historical data
  performance: VaultPerformance;
  historicalSnapshots: VaultHistoricalSnapshot[];
  
  // Vault metadata
  createdAt: number;
  ageDays: number;
  
  // Fee structure
  managementFee: number | null;
  performanceFee: number | null;
}

export interface VaultFilters {
  search: string;
  managerVerified: boolean | null;
  riskRating: string | null;
  sortBy: 'tvl' | 'performance' | 'age' | 'name';
  sortOrder: 'asc' | 'desc';
  timeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
}

export interface VaultListResponse {
  vaults: VaultData[];
  totalCount: number;
  totalTvl: number;
}

// Mock data generator for development
export function generateMockVaults(count: number): VaultData[] {
  
  const strategies = [
    'Arbitrage Alpha',
    'DeFi Yield Optimizer',
    'SOL Momentum',
    'Delta Neutral',
    'Liquidity Mining Pro',
    'Perp Funding Harvester',
    'Cross-Chain Yield',
    'MEV Extraction',
    'Basis Trading',
    'Volatility Harvester',
    'Market Making Elite',
    'Trend Following',
    'Jupiter LP Strategy',
    'Marinade stSOL Yield',
    'Raydium Concentrated',
  ];
  
  const managers = [
    { name: 'Quantum Vault Labs', verified: true },
    { name: 'Solana Alpha Capital', verified: true },
    { name: 'DeFi Pioneers', verified: false },
    { name: 'Crypto Yield Masters', verified: true },
    { name: null, verified: false },
    { name: 'Institutional Grade', verified: true },
    { name: 'Retail Strategies', verified: false },
  ];
  
  const riskRatings: Array<'conservative' | 'moderate' | 'aggressive' | 'speculative'> = [
    'conservative', 'moderate', 'aggressive', 'speculative'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const manager = managers[i % managers.length];
    const tvl = Math.random() * 10000000 + 100000;
    const ageDays = Math.floor(Math.random() * 400) + 30;
    const now = Date.now();
    const createdAt = now - ageDays * 24 * 60 * 60 * 1000;
    
    // Generate historical snapshots (last 90 days)
    const snapshots: VaultHistoricalSnapshot[] = [];
    let currentTvl = tvl * (0.7 + Math.random() * 0.3);
    for (let day = 90; day >= 0; day--) {
      const change = (Math.random() - 0.48) * 0.03;
      currentTvl = currentTvl * (1 + change);
      snapshots.push({
        timestamp: now - day * 24 * 60 * 60 * 1000,
        tvl: currentTvl,
        sharePrice: 1 + (currentTvl - tvl * 0.85) / (tvl * 0.85) * 0.1,
      });
    }
    
    // Calculate performance based on snapshots
    const latestTvl = snapshots[snapshots.length - 1].tvl;
    const getPerformance = (daysAgo: number): number | null => {
      if (daysAgo > ageDays) return null;
      const index = Math.max(0, snapshots.length - 1 - daysAgo);
      const pastTvl = snapshots[index].tvl;
      return ((latestTvl - pastTvl) / pastTvl) * 100;
    };
    
    return {
      address: `${Array(44).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`,
      seed: strategies[i % strategies.length].toLowerCase().replace(/\s+/g, '-'),
      name: strategies[i % strategies.length],
      manager: {
        address: `${Array(44).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`,
        name: manager.name,
        verified: manager.verified,
        riskRating: riskRatings[Math.floor(Math.random() * riskRatings.length)],
      },
      tvl,
      sharePrice: 1 + (Math.random() - 0.3) * 0.5,
      totalShares: Math.floor(tvl * 1000000).toString(),
      underlyingMint: 'So11111111111111111111111111111111111111112',
      underlyingSymbol: 'SOL',
      underlyingDecimals: 9,
      performance: {
        day1: getPerformance(1),
        week1: getPerformance(7),
        month1: getPerformance(30),
        month3: getPerformance(90),
        month6: ageDays > 180 ? getPerformance(180) : null,
        year1: ageDays > 365 ? getPerformance(365) : null,
        allTime: ((latestTvl - snapshots[0].tvl) / snapshots[0].tvl) * 100,
      },
      historicalSnapshots: snapshots,
      createdAt,
      ageDays,
      managementFee: Math.random() > 0.3 ? Math.floor(Math.random() * 300) / 100 : null,
      performanceFee: Math.random() > 0.2 ? Math.floor(Math.random() * 2000 + 500) / 100 : null,
    };
  }).sort((a, b) => b.tvl - a.tvl);
}

