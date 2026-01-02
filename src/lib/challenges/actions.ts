"use server";

import { unstable_cache } from "next/cache";
import { rpc } from "../solana/provider";
import {
  Challenge,
  CHALLENGE_DISCRIMINATOR,
  getChallengeDecoder,
  getOracleCreateOrUpdateChallengeDiscriminatorBytes,
  getOracleCreateOrUpdateChallengeInstructionDataDecoder,
  getUpdateChallengeDiscriminatorBytes,
  getUpdateChallengeInstructionDataDecoder,
  OracleCreateOrUpdateChallengeInstructionData,
  POLICY_CHALLENGES_PROGRAM_ADDRESS,
} from "@/protocol/policyChallenges";
import {
  address,
  Base64EncodedBytes,
  decodeAccount,
  getBase58Decoder,
  getBase58Encoder,
  type Account,
  type Address,
} from "@solana/kit";
import {
  Prettify,
  sanitize,
  sanitizeAccount,
  Sanitized,
  type SanitizedAccount,
} from "../solana/helpers";
import { inspect } from "util";
import { parse } from "path";

// Cache tags for revalidation
const CACHE_TAGS = {
  challenges: "challenges",
  challengeHistory: "challenge-history",
};

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  challengeList: 60, // 1 minute
  challengeHistory: 60 * 5, // 5 minutes
};

export interface ChallengeWithHistory {
  account: Sanitized<Account<Challenge, string>>;
  address: Address;
  updateSignatures: Array<{
    signature: string;
    slot: number;
    blockTime: number | null;
    err: any;
    balance: number | null;
  }>;
}

/**
 * Fetch all Challenge accounts from the policy_challenges program
 */
export const getChallengeAccounts = unstable_cache(
  async () => {
    const rawAccounts = await rpc
      .getProgramAccounts(POLICY_CHALLENGES_PROGRAM_ADDRESS, {
        commitment: "confirmed",
        encoding: "base64",
        filters: [
          {
            memcmp: {
              offset: 0n,
              bytes: Buffer.from(CHALLENGE_DISCRIMINATOR).toString(
                "base64"
              ) as Base64EncodedBytes,
              encoding: "base64",
            },
          },
        ],
      })
      .send()
      .then((accounts) =>
        accounts.map(({ account, pubkey }) => ({
          ...account,
          address: pubkey,
          data: Buffer.from(account.data[0], "base64"),
          programAddress: POLICY_CHALLENGES_PROGRAM_ADDRESS,
        }))
      )
      .then((accounts) => {
        const sanitizeAccounts: Sanitized<Account<Challenge>>[] = [];
        for (const account of accounts) {
          try {
            const decoded = decodeAccount(account, getChallengeDecoder());
            sanitizeAccounts.push(sanitizeAccount<Challenge>(decoded));
          } catch (error) {
            console.error("Failed to decode challenge account", error);
          }
        }
        return sanitizeAccounts;
      });

    return rawAccounts;
  },
  ["challenge-accounts"],
  {
    tags: [CACHE_TAGS.challenges],
    revalidate: CACHE_DURATIONS.challengeList,
  }
);

/**
 * Fetch update transaction signatures for a specific challenge account
 * Filters to only oracle update transactions (update_challenge or oracle_create_or_update_challenge)
 */
export const getChallengeUpdateSignatures = unstable_cache(
  async (challengeAddress: Address) => {
    try {
      const signatures = await rpc
        .getSignaturesForAddress(challengeAddress, {
          limit: 1000, // Get up to 1000 signatures
        })
        .send();

      // Filter signatures to only successful transactions
      const successfulSignatures = signatures.filter((sig) => !sig.err);

      // Fetch transactions to check if they're oracle updates
      const transactions = await Promise.all(
        successfulSignatures.map(async ({ signature }) => {
          try {
            const tx = await rpc
              .getTransaction(signature, {
                commitment: "confirmed",
                encoding: "jsonParsed",
                maxSupportedTransactionVersion: 0,
              })
              .send();

            if (!tx) return null;

            // Check if transaction contains update_challenge or oracle_create_or_update_challenge instruction
            const instructions = tx.transaction.message.instructions || [];
            const isOracleUpdate = instructions.some((ix: any) => {
              if (ix.programId === POLICY_CHALLENGES_PROGRAM_ADDRESS) {
                // Check instruction name (this is a simplified check)
                // In production, you'd decode the instruction data to verify
                return true; // For now, assume all policy_challenges instructions to this account are updates
              }
              return false;
            });

            return isOracleUpdate
              ? {
                  signature,
                  slot: tx.slot,
                  blockTime: tx.blockTime,
                  transaction: tx,
                }
              : null;
          } catch (error) {
            console.error(`Failed to fetch transaction ${signature}:`, error);
            return null;
          }
        })
      );

      // Filter out nulls and return signatures with metadata
      return transactions
        .filter((tx): tx is NonNullable<typeof tx> => tx !== null)
        .map((tx) => ({
          signature: tx.signature,
          slot: Number(tx.slot),
          blockTime: tx.blockTime,
          err: null,
        }));
    } catch (error) {
      console.error(
        `Failed to fetch signatures for challenge ${challengeAddress}:`,
        error
      );
      return [];
    }
  },
  ["challenge-update-signatures"],
  {
    tags: [CACHE_TAGS.challengeHistory],
    revalidate: CACHE_DURATIONS.challengeHistory,
  }
);

type a = Prettify<Sanitized<ChallengeWithHistory>>;
/**
 * Fetch all challenges with their update history
 */
export const getChallengesWithHistory = unstable_cache(
  async (): Promise<Sanitized<ChallengeWithHistory>[]> => {
    const accounts = await getChallengeAccounts();
    const allUpdateSignatures = await getProgramUpdateSignatures();

    // Build a map of challenge address -> update signatures with balance
    const challengeUpdatesMap = new Map<
      string,
      Array<{
        signature: string;
        slot: number;
        blockTime: number | null;
        err: any;
        balance: number | null;
      }>
    >();

    // Process all update signatures and group by challenge address
    for (const update of allUpdateSignatures) {
      const { challengeAddress } = update;

      if (!challengeUpdatesMap.has(challengeAddress)) {
        challengeUpdatesMap.set(challengeAddress, []);
      }

      challengeUpdatesMap.get(challengeAddress)!.push({
        signature: update.signature,
        slot: update.slot,
        blockTime: update.blockTime,
        err: null,
        balance: update.balance || null,
      });
    }

    // Match challenges with their update history
    const challengesWithHistory = accounts.map((account) => {
      const challengeAddress = account.address;
      const updateSignatures = challengeUpdatesMap.get(challengeAddress) || [];

      // Sort by blockTime (oldest first)
      updateSignatures.sort((a, b) => {
        const timeA = a.blockTime || 0;
        const timeB = b.blockTime || 0;
        return timeA - timeB;
      });

      return {
        account,
        address: challengeAddress,
        updateSignatures,
      };
    });

    return challengesWithHistory.map(sanitize);
  },
  ["challenges-with-history"],
  {
    tags: [CACHE_TAGS.challenges, CACHE_TAGS.challengeHistory],
    revalidate: CACHE_DURATIONS.challengeList,
  }
);

/**
 * Get update signatures for the policy_challenges program
 * This finds all transactions that called update_challenge or oracle_create_or_update_challenge
 */
export const getProgramUpdateSignatures = unstable_cache(
  async () => {
    const base58Decoder = getBase58Decoder();
    const base58Encoder = getBase58Encoder();

    try {
      // Get signatures for the program address
      const signatures = await rpc
        .getSignaturesForAddress(POLICY_CHALLENGES_PROGRAM_ADDRESS, {
          commitment: "confirmed",
          limit: 1000,
        })
        .send();

      // Filter to successful transactions
      const successfulSignatures = signatures.filter((sig) => !sig.err);

      // Fetch transactions and filter to oracle updates
      const updateTransactions = await Promise.all(
        successfulSignatures.map(async ({ signature }) => {
          try {
            const tx = await rpc
              .getTransaction(signature, {
                commitment: "confirmed",
                encoding: "jsonParsed",
                maxSupportedTransactionVersion: 0,
              })
              .send();

            if (!tx) return null;

            // Check if this is an update transaction and extract balance data
            const parsedData = await new Promise<{
              data: OracleCreateOrUpdateChallengeInstructionData;
              challengeAddress: Address;
            } | null>((resolve) => {
              const instructions = tx.transaction.message.instructions || [];
              for (const ix of instructions) {
                if ("data" in ix) {
                  const data = base58Encoder.encode(ix.data);
                  try {
                    return resolve({
                      data: getOracleCreateOrUpdateChallengeInstructionDataDecoder().decode(
                        data
                      ),
                      challengeAddress: ix.accounts[1],
                    });
                  } catch {
                    continue;
                  }
                }
              }

              resolve(null);
            });

            if (!parsedData) return null;

            // Extract balance from parsed instruction data
            const parsed = parsedData;
            return {
              signature,
              slot: tx.slot,
              blockTime: tx.blockTime,
              transaction: tx,
              balance: Number(parsed.data.updateDto.latestBalance),
              challengeId: parsed.data.challengeId,
              challengeAddress: parsed.challengeAddress,
            };
          } catch (error) {
            console.error(`Failed to fetch transaction ${signature}:`, error);
            return null;
          }
        })
      );

      console.log(
        "updateTransactions",
        updateTransactions.filter(Boolean).length
      );

      return updateTransactions
        .filter((tx): tx is NonNullable<typeof tx> => tx !== null)
        .map(sanitize);
    } catch (error) {
      console.error("Failed to fetch program update signatures:", error);
      return [];
    }
  },
  ["program-update-signatures"],
  {
    tags: [CACHE_TAGS.challengeHistory],
    revalidate: CACHE_DURATIONS.challengeHistory,
  }
);
