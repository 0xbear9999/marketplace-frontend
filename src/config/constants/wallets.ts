import { WalletConfig } from "./types";

export class WalletConnectorNotFoundError extends Error {}
export class WalletSwitchChainError extends Error {}

export enum ConnectorNames {
  MetaMask = "metaMask",
  Injected = "injected",
  WalletConnect = "walletConnectLegacy",
  BSC = "bsc",
  WalletLink = "coinbaseWallet",
}

export const wallets: WalletConfig<ConnectorNames>[] = [
  {
    id: "metamask",
    title: "Metamask",
    description: "wallet.Most Popular Decentralized Wallets",
    icon: "/images/connectors/Metamask.svg",
    installed: typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask),
    connectorId: ConnectorNames.MetaMask,
    deepLink: "https://metamask.app.link/dapp/earn.brewlabs.info/",
    downloadLink: "https://metamask.app.link/dapp/earn.brewlabs.info/",
  },
  // {
  //   id: "binance",
  //   title: "Binance Wallet",
  //   description: "Connect to your Binance Wallet",
  //   icon: "/images/wallets/binance.png",
  //   installed: typeof window !== "undefined" && Boolean(window.BinanceChain),
  //   connectorId: ConnectorNames.BSC,
  //   guide: {
  //     desktop: "https://www.bnbchain.org/en/binance-wallet",
  //   },
  //   downloadLink: {
  //     desktop: isFirefox
  //       ? "https://addons.mozilla.org/en-US/firefox/addon/binance-chain/?src=search"
  //       : "https://chrome.google.com/webstore/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp",
  //   },
  // },
  // {
  //   id: "coinbase",
  //   title: "Coinbase Wallet",
  //   description: "Connect to your Coinbase Wallet",
  //   icon: "/images/wallets/coinbase.png",
  //   connectorId: ConnectorNames.WalletLink,
  // },
  // {
  //   id: "trust",
  //   title: "Trust Wallet",
  //   description: "Connect to your Trust Wallet",
  //   icon: "/images/wallets/trust.png",
  //   connectorId: ConnectorNames.Injected,
  //   installed:
  //     typeof window !== "undefined" &&
  //     !(window.ethereum as ExtendEthereum)?.isSafePal && // SafePal has isTrust flag
  //     (Boolean(window.ethereum?.isTrust) || Boolean(window.ethereum?.isTrustWallet)),
  //   deepLink: `https://link.trustwallet.com/open_url?coin_id=20000714&url=/api`,
  //   downloadLink: {
  //     desktop:
  //       "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph/related",
  //   },
  // },
  {
    id: "walletconnect",
    title: "WalletConnect",
    description: "wallet.Open source decentralized wallet connection protocol",
    icon: "/images/connectors/WalletConnect.svg",
    connectorId: ConnectorNames.WalletConnect,
  },
];
