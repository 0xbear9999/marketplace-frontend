import { CreateAuctionPayload, CreateNFTPayload, UserProps } from "@/types";
import axios from "axios";


const token = ``
const environmentId = '036ecc71-d538-4f6c-8e7a-9c5324208c7e';

// const unlinkWallet = async (walletId: string) => {
//   const options = {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   }
//   const res = await axios.post(`https://app.dynamicauth.com/api/v0/sdk/${environmentId}/verify/unlink`, {
//     {
//       walletId,

//     }
//   })
// }

// devmode
export const fileService = {
  upload: async (formdata: FormData, type: string) => {
    const res = await axios.post('/api/uploads', formdata);
    console.log("########################--upload---", res.data);
    return res.data;
    // if (type === "logo") {
    //   return {"path": "http://localhost:5000/uploads/1.png"}
    // } else if (type === "banner") {
    //   return {"path": "http://localhost:5000/uploads/2.png"}
    // } else if (type === "avatar") {
    //   return {"path": "http://localhost:5000/uploads/3.png"}
    // }
    // return {"path": "http://localhost:5000/uploads/4.png"}
  },
  uploadMetadata: async (payload: FormData) => {
    const res = await axios.post('/api/uploads/metadata', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("########################--metadata---", res.data);
    return res.data;
  }
}

export const userService = {
  fetchAllUsers: async () => {
    const res = await axios.get('/api/users');
    return res.data;
  },
  fetch: async (wallet: string) => {
    const res = await axios.get(`/api/users/${wallet}`);
    return res.data;
  },
  update: async (payload: UserProps) => {
    const res = await axios.patch(`/api/users/${payload.wallet}`, payload);
    return res.data;
  },
  create: async (wallet: string) => {
    const res = await axios.post('/api/users', {
      wallet
    });
    return res.data;
  }
}

export const collectionService = {
  create: async (payload: {chainId: number; name: string; address: string;logo: string;banner: string;description: string; supply: number; classification: string[]; creator: string;})  => {
    const res = await axios.post('/api/collections', payload);
    return res.data;
  },
  getImageUri: async (payload: string) => {
    const res = await axios.post('/api/solana-nft/image', {uri: payload});
    return res.data;
  },
  fetchChainCollection: async (chainId: number, address: string) => {
    const res = await axios.get(`/api/collections/chain/${chainId}/${address}`);
    return res.data;
  },
  fetchEvmCollection: async (chainId: number) => {
    const res = await axios.get(`/api/collections/${chainId}`);
    return res.data;
  }
}

export const auctionService = {
  create: async (payload: CreateAuctionPayload) => {
    const res = await axios.post('/api/auction', payload);
    return res.data;
  },
  fetch: async () => {
    const res = await axios.get('/api/auction');
    return res.data;
  },
  listed: async (address: string) => {
    const res = await axios.get(`/api/auction/${address}`);
    return res.data;
  },
  collections: async (address = '') => {
    const res = await axios.get(`/api/auction/collections?address=${address}`);
    return res.data;
  },
  collectionNFTs: async (mint: string | null) => {
    const res = await axios.get(`/api/auction/collection/${mint}`);
    return res.data;
  },
  auctionByMint: async (mint: string) => {
    const res = await axios.get(`/api/auction/mint/${mint}`);
    return res.data;
  },
  delete: async (mint: string) => {
    const res = await axios.delete(`/api/auction/${mint}`);
    return res.data;
  }
}

export const nftService = {
  fetch: async (chainId: number, address: string) => {
    const res = await axios.get(`/api/nft/owner/${chainId}/${address}`);
    return res.data;
  },
  create: async (payload: CreateNFTPayload) => {
    const res = await axios.post('/api/nft', payload);
    return res.data;
  }
}

export const metadataService = {
  fetch: async (uri: string) => {
    const res = await axios.post('/api/metadata', {uri});
    return res.data;
  }
}