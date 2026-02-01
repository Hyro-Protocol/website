import { useConnection } from "@/components/onchain/connection-context";
import { useProtocol } from "@/components/onchain/protocol-context";
import { useSigner } from "@/components/wallet/wallet-context";
import { Transaction } from "@/lib/solana/transaction";
import {
  fetchVault,
  getInitializeVaultInstructionAsync,
} from "@/protocol/hyroProtocol";
import { POLICY_ALLOW_ANY_PROGRAM_ADDRESS } from "@/protocol/policyAllowAny";
import { address, Rpc, SolanaRpcApi } from "@solana/kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCreateMintInstructionPlan } from "@solana-program/token";
import { useEnsureTokenMint } from "./use-ensure-token-mint";

const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const ORACLE = address("F9nB3BKFkXpA6WzLkogUP4RHyvwXZGAh8PhHPPkDNAa");

export const useCreateVaultMutation = () => {
  const signer = useSigner();
  const protocol = useProtocol();
  const connection = useConnection();
  const getOrCreateUnderlyingMint = useEnsureTokenMint({
    symbol: "USDC",
    decimals: 6,
  });
  return useMutation({
    mutationKey: ["createVault"],
    mutationFn: async ({
      seed,
      name,
      description,
    }: {
      seed: string;
      name: string;
      description: string;
    }) => {
      if (!signer) throw new Error("Signer not found");

      const [pda] = await protocol.helpers.getVaultPda(seed);

      const underlyingMint = await getOrCreateUnderlyingMint.mutateAsync();

      console.log("underlyingMint", underlyingMint);

      const initializeIx = await getInitializeVaultInstructionAsync({
        signer: signer,
        underlyingMint: USDC,
        seed,
        policyProgram: POLICY_ALLOW_ANY_PROGRAM_ADDRESS,
        name,
        description,
      });

      const toastId = toast.loading("Creating vault...");

      return Transaction.send({
        rpc: connection.connection as Rpc<SolanaRpcApi>,
        subscription: connection.subscription,
        signer: signer,
        instructions: [initializeIx],
        simulation: {
          computeUnitLimit: 200000,
        },
      })
        .then(async ({ signature, status }) => {
          console.log("status", status);
          if (status?.err) {
            throw new Error("Error creating vault: " + status.err.toString());
          }
          toast.success("Vault created", { id: toastId });
          return fetchVault(connection.connection, pda[0]);
        })
        .catch(async (e) => {
          if (e instanceof Error) {
            toast.error(e.message, { id: toastId });
          } else {
            toast.error("Error creating vault", { id: toastId });
            console.error(e);
          }
          throw e;
        });
    },
  });
};
