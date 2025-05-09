'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";


export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "036ecc71-d538-4f6c-8e7a-9c5324208c7e",
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
        apiBaseUrl: "/dynamic-auth"
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}