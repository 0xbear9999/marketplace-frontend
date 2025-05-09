import { ethers } from "ethers";
import { sample } from "lodash";

export const SUPPORTED_CHAINS: any = [1, 11155111];
export const RPC_ENDPOINT: any = {
  1: ["https://mainnet.infura.io/v3/95cf7deb290646d58ead4012d6792d0d"],
  11155111:
    ["https://sepolia.infura.io/v3/95cf7deb290646d58ead4012d6792d0d"],
};

const CHAIN_NAMES: any = {
  1: "Ethereum",
  11155111: "Sepolia",
};

const CHAIN_LOGO: any = {
  1: "/images/networks/eth.svg",
  11155111: "/images/networks/eth",
};

const SCAN_LOGO: any = {
  1: "/icons/etherscan.png",
  11155111: "/icons/etherscan.png",
};

const EXPLORER_URL: any = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
};

export const EXPLORER_API_URL: any = {
  1: "https://eth.blockscout.com/api",
  11155111: "https://eth-sepolia.blockscout.com/api",
};

export const EXPLORER_API_KEYS: any = {
  1: "47I5RB52NG9GZ95TEA38EXNKCAT4DMV5RX",
  11155111: "HQ1F33DXXJGEF74NKMDNI7P8ASS4BHIJND",
};

export const getExplorerLogo = (chainId: number) => SCAN_LOGO[chainId] ?? "";
export const getChainName = (chainId: number) => CHAIN_NAMES[chainId] ?? "";
export const getChainLogo = (chainId: number) =>
  CHAIN_LOGO[chainId] ?? "/images/networks/unknown.png";

export const getExplorerLink = (
  chainId: any,
  type: any,
  addressOrHash: any
) => {
  const explorerUrl = EXPLORER_URL[chainId];
  switch (type) {
    case "address":
      return `${explorerUrl}/address/${addressOrHash}`;
    case "token":
      return `${explorerUrl}/token/${addressOrHash}`;
    case "transaction":
      return `${explorerUrl}/tx/${addressOrHash}`;
    default:
      return explorerUrl;
  }
};

export const simpleRpcProvider = (chainId: any) =>
  new ethers.JsonRpcProvider(sample(RPC_ENDPOINT[chainId || 11155111]));
