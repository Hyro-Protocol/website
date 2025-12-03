import { RiskRating, VerificationStatus } from "@/protocol/hyroProtocol";
import { Address } from "@solana/kit";
import { atom } from "jotai";
import SuperJSON from "superjson";

export const atomWithLocalStorage = <T extends object | null>(
  key: string,
  initialValue: T
) => {
  const getInitialValue = (): T => {
    const item = global.localStorage?.getItem(key);
    if (typeof item === "string") {
      return SuperJSON.parse<T>(item);
    }
    return initialValue;
  };
  const baseAtom = atom<T>(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T | ((prev: T) => T)) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, SuperJSON.stringify(nextValue));
    }
  );
  return derivedAtom;
};

export type VaultRecord = {
  seed: string;
  kind: "AllowAny" | "DenyAll" | "Owners" | "LimitTransfer" | "Multisig" | "AnyOf" | "AllOf";
  address: Address;
};

export type ChallengeTemplateRecord = {
  stageId: number;
  address: Address;
  stageType: "evaluation" | "funded";
};

export type ManagerRecord = {
  address: Address;
  managerAddress?: string;
  riskRating?: RiskRating;
  verificationStatus?: VerificationStatus;
  isInitialized: boolean;
};

export type Chains = "solana:mainnet" | "solana:testnet" | "solana:devnet" | "solana:localnet" | `solana:${string}`
export const vaultsAtom = atomWithLocalStorage<VaultRecord[]>("hyro:vaults", []);
export const challengeTemplatesAtom = atomWithLocalStorage<ChallengeTemplateRecord[]>("hyro:challenge-templates", []);
export const managersAtom = atomWithLocalStorage<ManagerRecord[]>("hyro:managers", []);
export const addressBook = atomWithLocalStorage<Address[]>("hyro:addresses", []);
export const selectedChain = atomWithLocalStorage<{ selected: Chains }>("hyro:chain", { selected: "solana:localnet" })
export const selectedWallet = atomWithLocalStorage<{ name: string, address: Address } | null>("hyro:wallet", null)