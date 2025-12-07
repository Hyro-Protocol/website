import { useConnection } from "@/components/onchain/connection-context";
import { useSigner } from "@/components/wallet/wallet-context";
import { Transaction } from "@/lib/solana/transaction";
import { useLocalStorageState } from "@/utilities/useLocalStorageState";
import {
  fetchMaybeMint,
  fetchMint,
  getCreateMintInstructionPlan,
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

import {
  Address,
  generateKeyPairSigner,
  SolanaRpcApi,
  Rpc,
  KeyPairSigner,
  createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes,
  fetchEncodedAccount,
} from "@solana/kit";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

// RPC `getMinimumBalanceForRentExemption` for 82 bytes, which is token mint size
// Hardcoded to avoid requiring an RPC request each time
const MINIMUM_BALANCE_FOR_MINT = 1461600;

export const useEnsureTokenMint = (args: {
  symbol: string;
  decimals: number;
}) => {
  const [keypair, setKeypair] = useLocalStorageState<KeyPairSigner | null>(
    "keypair-" + args.symbol + "-" + args.decimals,
    null,
    {
      serialize: async (value) => {
        console.log("serializing keypair", value);

        if (!value) return "null";

        const jwk = await window.crypto.subtle.exportKey(
          "jwk",
          value.keyPair.privateKey
        );

        if (!jwk?.d) throw new Error("Private key not found");

        const privateKeyBase64Url = jwk.d;
        const sanitizedBase64 = privateKeyBase64Url
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");

        const privateKeyBytes = Array.from(
          Buffer.from(sanitizedBase64, "base64")
        );

        const serialized = JSON.stringify(privateKeyBytes);
        console.log("serialized", serialized);
        return serialized;
      },
      deserialize: async (value) => {
        const bytes = JSON.parse(value);
        if (bytes === null) return null;
        return await createKeyPairSignerFromPrivateKeyBytes(
          new Uint8Array(bytes),
          true
        );
      },
    }
  );

  useEffect(() => {
    async function process() {
      if (keypair) return;
      setKeypair(
        await createKeyPairSignerFromPrivateKeyBytes(
          crypto.getRandomValues(new Uint8Array(32)),
          true
        )
      );
    }
    process();
  }, [args.symbol, args.decimals, keypair]);

  const connection = useConnection();
  const signer = useSigner();
  return useMutation({
    mutationKey: ["ensureTokenMint"],
    mutationFn: async () => {
      if (!keypair) throw new Error("Keypair not found");

      console.log(
        "fetchEncodedAccount",
        await fetchEncodedAccount(connection.connection, keypair.address)
      );

      const maybeMint = await fetchMaybeMint(
        connection.connection,
        keypair.address
      );

      if (maybeMint?.exists) return maybeMint;

      const toastId = toast.loading("Creating token mint..." + keypair.address);

      if (!signer) throw new Error("Signer not found");

      const mintKeypair = await generateKeyPairSigner();

      const ixCreateAccount = getCreateAccountInstruction({
        payer: signer,
        newAccount: mintKeypair,
        lamports: MINIMUM_BALANCE_FOR_MINT,
        space: getMintSize(),
        programAddress: TOKEN_PROGRAM_ADDRESS,
      });

      const ixInitializeMint = getInitializeMintInstruction({
        mint: mintKeypair.address,
        decimals: 6,
        mintAuthority: signer.address,
      });

      await Transaction.send({
        rpc: connection.connection as Rpc<SolanaRpcApi>,
        subscription: connection.subscription,
        signer: signer,
        instructions: [ixCreateAccount, ixInitializeMint],
        simulation: {
          computeUnitLimit: 200000,
        },
      })
        .then(async ({ signature, status }) => {
          console.log("status", status, signature);
          if (status?.err) {
            throw new Error("Error creating vault: " + status.err.toString());
          }
          const tx = await connection.connection
            .getTransaction(signature, {
              maxSupportedTransactionVersion: 0,
              encoding: "jsonParsed",
            })
            .send();
          console.log("logs", tx);
          toast.success("Vault created", { id: toastId });
          return {
            ...(await fetchMint(connection.connection, keypair.address)),
            symbol: args.symbol,
          };
        })
        .catch(async (e) => {
          if (e instanceof Error) {
            toast.error(e.message, { id: toastId });
          } else {
            toast.error("Error creating mint", { id: toastId });
            console.error(e);
          }
          throw e;
        });
    },
  });
};
