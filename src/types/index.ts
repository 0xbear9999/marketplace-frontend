import { Nft } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";


export interface UserProps {
  avatar?: string;
  nickname?: string;
  bio?: string;
  email?: string;
  discord?: string;
  telegram?: string;
  wallet: string;
}

export interface AuthContextProps {
  user?: UserProps;
  fetchUser: (wallet: string) => Promise<boolean>;
  updateUser: (payload: UserProps) => void;
  createUser: (wallet: string) => void;
}


export interface SolanaCollection {
  collectionAddress: PublicKey,
  nfts: Nft[];
}

export interface UserNFTs {
  collections: SolanaCollection[];
  singleNFTs: Nft[];
}

export interface CreateAuctionPayload {
  account: string;
  mint: string;
  creator: string;
  collectionMint?: string;
  type?: string;
  price: number;
  currencyMint: string;
  amount: number;
}

export interface Listed {
  _id: string;
  account: string;
  mint: string;
  creator: string;
  collectionMint?: string;
  type: string;
  price: number;
}

export interface ListedCollection {
  collectionMint: string;
  count: number;
  mint: string;
  floor: number;
  top: number;
}

export interface EvmCollection {
  chainId: number;
  address: string;
  logo: string;
  banner: string;
  descrription: string;
  supply: number;
  creator: string;
  classification: string[];
  name: string;
}

export interface CreateNFTPayload {
  tokenId: number;
  name: string;
  collection: string;
  owner: string;
  chainId: number;
}

export interface NFT {
  contractAddress: string;
  balance: string;
  name: string;
  symbol: string;
  type: string;
}

export interface UserCollection {
  contractAddress: string;
  balance: string;
  name: string;
  symbol: string;
  type: string;
}

export interface EvmNFT {
  id?: number;
  address: string;
  chainId: number;
  tokenId: number;
  type?: string;
  price: bigint;
  currency: string;
}

export interface Metadata {
  name: string;
  image: string;
  description: string;
}

export interface EvmAuction {
  id: number;
  creator: string;
  contract: string;
  tokenId: number;
  currency: string;
  mintBidAmount: string;
  buyoutAmount: string;
  timeBuffer: number;
  bidBuffer: number;
  startTime: number;
  endTime: number;
  tokenType: string;
  status: string;
} 