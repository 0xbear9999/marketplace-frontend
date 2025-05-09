import { CHAIN_ICONS } from "@/config/constants/networks";
import { EXPLORER_URLS } from "@/config/networks";

export function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getEllipsis = (address: string, left = 6, right = 4) => {
  if (!address) return;
  return address.slice(0, left) + "..." + address.substring(address.length - right);
};

export const getChainLogo = (chainId: number) =>
  CHAIN_ICONS[chainId] ?? "/images/networks/unkown.png";

export const formatIPFSString = (url: any) => {
  let _url = url;
  if (!url) return "";
  if (url.includes("ipfs://")) _url = "https://nftstorage.link/ipfs/" + _url.replace("ipfs://", "");
  else if (url.includes("https://ipfs.io/ipfs/"))
    _url = "https://ipfs.io/ipfs/" + _url.replace("https://ipfs.io/ipfs/", "");
  else if (url.includes("ipfs://ipfs/"))
    _url = "https://nftstorage.link" + _url.replace("ipfs://ipfs/", "");
  return _url;
};

export function getBlockExplorerLink(
  data: string | number,
  type: "transaction" | "token" | "address" | "block" | "countdown" | "nft",
  tokenId = 0,
  chainId = 11155111
): string {
  switch (type) {
    case "transaction": {
      return `${EXPLORER_URLS[chainId]}/tx/${data}`;
    }
    case "token": {
      return `${EXPLORER_URLS[chainId]}/token/${data}`;
    }
    case "block": {
      return `${EXPLORER_URLS[chainId]}/block/${data}`;
    }
    case "countdown": {
      return `${EXPLORER_URLS[chainId]}/block/countdown/${data}`;
    }
    case "nft": {
      return `${EXPLORER_URLS[chainId]}/token/${data}/instance/${tokenId}`;
    }
    default: {
      return `${EXPLORER_URLS[chainId]}/address/${data}`;
    }
  }
}
