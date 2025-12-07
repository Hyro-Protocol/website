import { useConnection } from "@/components/onchain/connection-context";
import { useProtocol } from "@/components/onchain/protocol-context";
import { useSigner } from "@/components/wallet/wallet-context";
import { Transaction } from "@/lib/solana/transaction";
import {
    fetchManagerRegistry,
    fetchMaybeManagerRegistry,
    getInitializeManagerRegistryInstructionAsync
} from "@/protocol/hyroProtocol";
import { Rpc, SolanaRpcApi } from "@solana/kit";
import { useMutation } from "@tanstack/react-query";


export const useEnsureManagerRegistry = () => {
  const protocol = useProtocol();
  const connection = useConnection();
  const signer = useSigner();

  return useMutation({
    mutationKey: ["ensureManagerRegistry"],
    mutationFn: async () => {
      const [managerRegistry] = await protocol.helpers.getManagerRegistryPda();

      return fetchMaybeManagerRegistry(
        connection.connection,
        managerRegistry
      ).then(async (result) => {
        if (result.exists) {
          return result;
        } else {
          if (!signer) throw new Error("Signer not found");

          console.log("Creating new manager registry", managerRegistry);
          // create new manager registry
          const ix = await getInitializeManagerRegistryInstructionAsync({
            admin: signer,
          });

          return Transaction.send({
            rpc: connection.connection as Rpc<SolanaRpcApi>,
            subscription: connection.subscription,
            signer: signer,
            instructions: [ix],
            simulation: {
              computeUnitLimit: 200000,
            },
          })
            .then(async ({ signature }) => {
              console.log("Manager registry created", signature);

              const tx = await connection.connection
                .getTransaction(signature, {
                  maxSupportedTransactionVersion: 0,
                  encoding: "jsonParsed",
                })
                .send();

              console.log("tx", tx);
              return fetchManagerRegistry(
                connection.connection,
                managerRegistry
              );
            })
            .catch(async (e) => {
              console.error("error", e);
              if ("signature" in e && typeof e.signature === "string") {
                const tx = await connection.connection
                  .getTransaction(e.signature, {
                    maxSupportedTransactionVersion: 0,
                    encoding: "jsonParsed",
                  })
                  .send();

                if (tx) {
                  console.log("tx", tx);
                }
              }
              throw e;
            });
        }
      });
    },
  });
};
