"use server";

import { unstable_cache } from "next/cache";
import { rpc } from "../solana/provider";
import {
  Challenge,
  CHALLENGE_DISCRIMINATOR,
  getChallengeDecoder,
  getOracleCreateOrUpdateChallengeInstructionDataDecoder,
  getUpdateChallengeInstructionDataDecoder,
  POLICY_CHALLENGES_PROGRAM_ADDRESS,
} from "@/protocol/policyChallenges";
import {
  address,
  Base64EncodedBytes,
  decodeAccount,
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

      console.log(
        "signatures",
        signatures.filter((sig) => !sig.err).map((sig) => sig.signature)
      );
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

    console.log(
      "allUpdateSignatures",
      inspect(allUpdateSignatures, { depth: null })
    );

    // Fetch update signatures for each challenge
    const challengesWithHistory = await Promise.all(
      accounts.map(async (account) => {
        // const updateSignatures = await getChallengeUpdateSignatures(
        //   address(account.address as Address)
        // );

        return {
          account,
          address: account.address,
          updateSignatures: [],
        };
      })
    );

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

            console.log(
              "instructions",
              tx.transaction.message.instructions
                .map((ix) => {
                  if ("data" in ix) {
                    const decoders = [
                      getUpdateChallengeInstructionDataDecoder(),
                      getOracleCreateOrUpdateChallengeInstructionDataDecoder(),
                    ];

                    const decoded = decoders
                      .map((decoder) => {
                        try {
                          return decoder.decode(Buffer.from(ix.data, "base64"));
                        } catch (e) {
                          console.error("Failed to decode instruction data:", e);
                          return null;
                        }
                      })
                      .find((decoded) => decoded !== null);

                    return decoded ? decoded : null;
                  } else {
                    return null;
                  }
                })
                .filter(Boolean)
                .join(", ")
            );
            // Check if this is an update transaction
            const instructions = tx.transaction.message.instructions || [];
            const isUpdate = instructions.some((ix: any) => {
              // Check if instruction is update_challenge or oracle_create_or_update_challenge
              // This is a simplified check - in production you'd decode instruction data
              return (
                ix.programId === POLICY_CHALLENGES_PROGRAM_ADDRESS &&
                "parsed" in ix &&
                (ix.parsed?.type === "updateChallenge" ||
                  ix.parsed?.type === "oracleCreateOrUpdateChallenge")
              );
            });

            console.log("isUpdate", isUpdate);

            return isUpdate
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
