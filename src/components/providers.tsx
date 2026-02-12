"use client";

// Default styles that can be overridden by your app
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ChainContextProvider } from "./onchain/chain-context-provider";
import { ConnectionContextProvider } from "./onchain/connection-context-provider";
import { ProtocolContextProvider } from "./onchain/protocol-context-provider";
import { SelectedWalletAccountContextProvider } from "./wallet/wallet-context-provider";
import { HyroProvider } from "@hyr0-xyz/react";
import { useConnection } from "./onchain/connection-context";
import { useSigner } from "./wallet/wallet-context";

const queryClient = new QueryClient();

const HyroProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { connection, subscription } = useConnection();
  const signer = useSigner() || undefined;
  return (
    <HyroProvider config={{ connection, subscription, signer }}>
      {children}
    </HyroProvider>
  );
};

export const Providers = (props: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChainContextProvider>
        <SelectedWalletAccountContextProvider>
          <ConnectionContextProvider>
            <ProtocolContextProvider>
              <HyroProviderWrapper>
              {props.children}
              </HyroProviderWrapper>
              <ReactQueryDevtools />
            </ProtocolContextProvider>
          </ConnectionContextProvider>
        </SelectedWalletAccountContextProvider>
      </ChainContextProvider>
    </QueryClientProvider>
  );
};


