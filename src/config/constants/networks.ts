import { ethers } from "ethers";

export const CHAIN_ICONS: any = {
  1: "/images/networks/eth.svg",
  56: "/images/networks/bsc.png",
};

export const SUPPORTED_CHAIN_IDS: any = [11155111];


export const rpcProvider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
);