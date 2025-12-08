"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import {
  type VaultData,
  type VaultListResponse,
  type VaultFilters,
  type VaultPerformance,
  type VaultHistoricalSnapshot,
  generateMockVaults,
} from "./types";
import { rpc } from "../solana/provider";
import {
  getVaultDecoder,
  HYRO_PROTOCOL_PROGRAM_ADDRESS,
} from "@/protocol/hyroProtocol";
import {
  Challenge,
  getChallengeDecoder,
  POLICY_CHALLENGES_PROGRAM_ADDRESS,
} from "@/protocol/policyChallenges";
import { decodeAccount } from "@solana/kit";
import { sanitizeAccount } from "../solana/helpers";
import { getChallengesWithHistory } from "../challenges/actions";

// Cache tags for revalidation
const CACHE_TAGS = {
  vaults: "vaults",
  vaultHistory: "vault-history",
  vaultStats: "vault-stats",
};

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  // Historical data changes rarely, cache for longer
  historical: 60 * 60, // 1 hour
  // Vault list metadata can be cached for a bit
  vaultList: 1, // 60 * 5, // 5 minutes
  // Stats aggregate data
  stats: 60 * 2, // 2 minutes
};

/**
 * Fetch historical performance data for a vault
 * This is cached because historical data doesn't change
 */
const getCachedVaultHistory = unstable_cache(
  async (vaultAddress: string): Promise<VaultHistoricalSnapshot[]> => {
    // TODO: Replace with actual database/storage query
    // In production, this would fetch from a database that stores
    // periodic snapshots of vault state (e.g., every hour or day)
    console.log(`[Cache Miss] Fetching history for vault: ${vaultAddress}`);

    // For now, return mock data
    const mockVaults = generateMockVaults(1);
    return mockVaults[0]?.historicalSnapshots || [];
  },
  ["vault-history"],
  {
    tags: [CACHE_TAGS.vaultHistory],
    revalidate: CACHE_DURATIONS.historical,
  }
);

/**
 * Fetch cached performance metrics for a vault
 * Performance is calculated from historical snapshots
 */
const getCachedVaultPerformance = unstable_cache(
  async (vaultAddress: string): Promise<VaultPerformance> => {
    console.log(
      `[Cache Miss] Calculating performance for vault: ${vaultAddress}`
    );

    const snapshots = await getCachedVaultHistory(vaultAddress);

    if (snapshots.length === 0) {
      return {
        day1: null,
        week1: null,
        month1: null,
        month3: null,
        month6: null,
        year1: null,
        allTime: null,
      };
    }

    const latestPrice = snapshots[snapshots.length - 1].sharePrice;

    const getPerformance = (daysAgo: number): number | null => {
      const targetTimestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      const snapshot = snapshots.find((s) => s.timestamp <= targetTimestamp);
      if (!snapshot) return null;
      return ((latestPrice - snapshot.sharePrice) / snapshot.sharePrice) * 100;
    };

    return {
      day1: getPerformance(1),
      week1: getPerformance(7),
      month1: getPerformance(30),
      month3: getPerformance(90),
      month6: getPerformance(180),
      year1: getPerformance(365),
      allTime:
        snapshots.length > 0
          ? ((latestPrice - snapshots[0].sharePrice) /
              snapshots[0].sharePrice) *
            100
          : null,
    };
  },
  ["vault-performance"],
  {
    tags: [CACHE_TAGS.vaultHistory],
    revalidate: CACHE_DURATIONS.historical,
  }
);

/**
 * Fetch aggregate vault statistics
 * Cached for quick page loads
 */
export const getVaultStats = unstable_cache(
  async (): Promise<{
    totalTvl: number;
    vaultCount: number;
    verifiedManagers: number;
  }> => {
    console.log("[Cache Miss] Calculating vault stats");

    // TODO: Replace with actual aggregation query
    // In production, this would be a database aggregation
    const mockVaults = generateMockVaults(50);

    return {
      totalTvl: mockVaults.reduce((sum, v) => sum + v.tvl, 0),
      vaultCount: mockVaults.length,
      verifiedManagers: mockVaults.filter((v) => v.manager?.verified).length,
    };
  },
  ["vault-stats"],
  {
    tags: [CACHE_TAGS.vaultStats],
    revalidate: CACHE_DURATIONS.stats,
  }
);

export const getVaultAccounts = unstable_cache(
  async () => {
    const rawAccounts = await rpc
      .getProgramAccounts(POLICY_CHALLENGES_PROGRAM_ADDRESS, {
        commitment: "confirmed",
        encoding: "base64",
        filters: [
          {
            dataSize: 210n,
          },
        ],
      })
      .send()
      .then(
        (accounts) => (
          console.log("fetched policy challenges accounts", accounts),
          accounts.map(({ account, pubkey }) => ({
            ...account,
            address: pubkey,
            data: Buffer.from(account.data[0], "base64"),
            programAddress: POLICY_CHALLENGES_PROGRAM_ADDRESS,
          }))
        )
      )
      .then(
        (accounts) => {
          const sanitizeAccounts = [];
          for (const account of accounts) {
            try {
              sanitizeAccounts.push(
                sanitizeAccount<Challenge>(
                  decodeAccount(account, getChallengeDecoder())
                )
              );
            } catch (error) {
              console.error("Failed to sanitize account", error);
            }
          }
          return sanitizeAccounts;
        }
        // accounts.map((account) =>
        //   sanitizeAccount<Challenge>(
        //     decodeAccount(account, getChallengeDecoder())
        //   )
        // )
      );

    return rawAccounts;
    // .then((accounts) =>
    //   Promise.all(
    //     accounts.map(async (account) => {
    //       const signatures = await rpc
    //         .getSignaturesForAddress(account.address, {
    //           commitment: "confirmed",
    //         })
    //         .send();
    //       const transactions = await Promise.all(
    //         signatures.map(async ({ signature }) =>
    //           rpc.getTransaction(signature, {
    //             commitment: "confirmed",
    //             encoding: "jsonParsed",
    //           })
    //         )
    //       );
    //       return {
    //         ...account,
    //         transactions,
    //         signatures,
    //       };
    //     })
    //   )
    // );
  },

  ["vault-accounts"],
  {
    tags: [CACHE_TAGS.vaults],
    revalidate: CACHE_DURATIONS.vaultList,
  }
);

export const revalidateCache = async () => {
  console.log("revalidating cache");

  revalidateTag(CACHE_TAGS.vaults, "max");
  revalidateTag(CACHE_TAGS.vaultHistory, "max");
  revalidateTag(CACHE_TAGS.vaultStats, "max");

  await Promise.resolve();
};

/**
 * Convert Challenge account to VaultData format
 * challenge is Sanitized<Account<Challenge, string>>
 */
function challengeToVault(challenge: { address: string; data: any; history: any }): VaultData {
  console.log('history', challenge.history)
  const challengeData = challenge.data;
  
  // All bigints are converted to numbers by sanitizeAccount
  // latestBalance and startingBalance are in lamports (1e9 lamports = 1 SOL)
  const balance = (challengeData.latestBalance || 0) / 1e9;
  const startingBalance = (challengeData.startingBalance || 0) / 1e9;
  const createdAt = Number(challengeData.createdAt || 0) * 1000;
  const ageDays = Math.floor((Date.now() - createdAt) / (24 * 60 * 60 * 1000));
  
  // Calculate performance based on balance change
  const balanceChange = startingBalance > 0 
    ? ((balance - startingBalance) / startingBalance) * 100 
    : 0;
  
  // Generate simple historical snapshots
  const historicalSnapshots: VaultHistoricalSnapshot[] = [
    {
      timestamp: createdAt || Date.now(),
      tvl: startingBalance || 0,
      sharePrice: 1.0,
    },
    {
      timestamp: Date.now(),
      tvl: balance || 0,
      sharePrice: 1.0 + (balanceChange / 100) * 0.1,
    },
  ];

  const challengeId = challengeData.challengeId || 'unknown';
  const userAddress = (challengeData.user as string) || 'unknown';

  return {
    address: challenge.address,
    seed: challengeId.slice(0, 16).toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: `Challenge ${challengeId.slice(0, 8)}`,
    manager: {
      address: userAddress,
      name: `User ${userAddress.slice(0, 8)}`,
      verified: false,
      riskRating: 'moderate' as const,
    },
    tvl: balance || 0,
    sharePrice: 1.0 + (balanceChange / 100) * 0.1,
    totalShares: Math.floor((balance || 0) * 1e9).toString(),
    underlyingMint: 'So11111111111111111111111111111111111111112',
    underlyingSymbol: 'SOL',
    underlyingDecimals: 9,
    performance: {
      day1: null,
      week1: null,
      month1: balanceChange,
      month3: balanceChange,
      month6: balanceChange,
      year1: balanceChange,
      allTime: balanceChange,
    },
    historicalSnapshots,
    createdAt: createdAt || Date.now(),
    ageDays: Math.max(1, ageDays),
    managementFee: null,
    performanceFee: null,
  };
}

/**
 * Fetch the list of vaults with filtering and sorting
 * Uses caching for the vault metadata, but real-time data (TVL, share price)
 * should be fetched client-side via RPC for freshness
 * Now includes challenges as vaults
 */
export const getVaultList = unstable_cache(
  async (filters?: Partial<VaultFilters>): Promise<VaultListResponse> => {
    console.log("[Cache Miss] Fetching vault list with filters:", filters);

    // Fetch both vault accounts and challenge accounts
    const [vaultAccounts, challengeAccounts] = await Promise.all([
      getVaultAccounts(),
      getChallengesWithHistory(),
    ]);

    // Convert challenges to vault format
    const challengeVaults = challengeAccounts.map((challenge) => {
      // challenge is Sanitized<Account<Challenge, string>>
      // Access the data through challenge.data
      // Address is sanitized to string by sanitizeAccount
      return challengeToVault({
        address: challenge.address as unknown as string,
        data: challenge.account.data,
        history: challenge.updateSignatures
      });
    });

    // Generate mock vaults for now (replace with actual vault decoding later)
    // const mockVaults = generateMockVaults(vaultAccounts.length || 0);
    
    // Combine mock vaults and challenge vaults
    let vaults = [...challengeVaults];

    // Apply filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      vaults = vaults.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.address.toLowerCase().includes(search) ||
          v.manager?.name?.toLowerCase().includes(search) ||
          v.manager?.address?.toLowerCase().includes(search) ||
          v.seed.toLowerCase().includes(search) // Challenge ID is in seed
      );
    }

    if (
      filters?.managerVerified !== null &&
      filters?.managerVerified !== undefined
    ) {
      vaults = vaults.filter(
        (v) => v.manager?.verified === filters.managerVerified
      );
    }

    if (filters?.riskRating) {
      vaults = vaults.filter(
        (v) => v.manager?.riskRating === filters.riskRating
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "tvl";
    const sortOrder = filters?.sortOrder || "desc";

    vaults.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "tvl":
          comparison = a.tvl - b.tvl;
          break;
        case "performance":
          const timeframe = filters?.timeframe || "1m";
          const perfKey = {
            "1d": "day1",
            "1w": "week1",
            "1m": "month1",
            "3m": "month3",
            "6m": "month6",
            "1y": "year1",
            all: "allTime",
          }[timeframe] as keyof VaultPerformance;
          const aPerf = a.performance[perfKey] ?? -Infinity;
          const bPerf = b.performance[perfKey] ?? -Infinity;
          comparison = aPerf - bPerf;
          break;
        case "age":
          comparison = a.ageDays - b.ageDays;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    const totalTvl = vaults.reduce((sum, v) => sum + v.tvl, 0);

    return {
      vaults,
      totalCount: vaults.length,
      totalTvl,
    };
  },
  ["vault-list"],
  {
    tags: [CACHE_TAGS.vaults],
    revalidate: CACHE_DURATIONS.vaultList,
  }
);

/**
 * Fetch a single vault's details
 * Combines cached historical data with real-time on-chain data
 */
export const getVaultDetails = unstable_cache(
  async (vaultAddress: string): Promise<VaultData | null> => {
    console.log(`[Cache Miss] Fetching vault details for: ${vaultAddress}`);

    // TODO: Implement actual vault fetching
    // 1. Fetch current vault state from Solana RPC (real-time)
    // 2. Fetch cached historical data
    // 3. Combine and return

    // For demo purposes, generate a mock vault with the given address
    const mockVault = generateMockVaults(1)[0];

    // Use the actual address from the URL
    return {
      ...mockVault,
      address: vaultAddress,
    };
  },
  ["vault-details"],
  {
    tags: [CACHE_TAGS.vaults],
    revalidate: CACHE_DURATIONS.vaultList,
  }
);

/**
 * Get vault historical snapshots for charts
 */
export async function getVaultHistory(
  vaultAddress: string
): Promise<VaultHistoricalSnapshot[]> {
  return getCachedVaultHistory(vaultAddress);
}

/**
 * Get vault performance metrics
 */
export async function getVaultPerformance(
  vaultAddress: string
): Promise<VaultPerformance> {
  return getCachedVaultPerformance(vaultAddress);
}
