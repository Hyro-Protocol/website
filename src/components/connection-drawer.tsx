"use client";

import { address as asAddress } from "@solana/kit";
import { ConnectWalletMenu } from "./wallet/connect-wallet-menu";
import { WalletBalance } from "./wallet/wallet-balance";
import { SwitchChain } from "./onchain/switch-chain";
import { useWallet } from "./wallet/wallet-context";

export const ConnectionDrawer = () => {
  const wallet = useWallet();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-full flex flex-row items-center z-50">
      <div className="flex flex-row gap-4 items-center p-4 border border-border shadow-md sticky top-0 z-50 isolate bg-background">
        <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
        {wallet?.address && (
          <WalletBalance address={asAddress(wallet.address)} />
        )}
        <SwitchChain />
      </div>
    </div>
  );
};
