import { Metadata, Metaplex, Nft, Sft } from "@metaplex-foundation/js";
import { PublicKey, Connection } from "@solana/web3.js";


export const findMetadataAccount = (connection: Connection, mint: PublicKey) => {
  const metaplex = Metaplex.make(connection);
  const metadataAccount = metaplex.nfts().pdas().metadata({mint});
  return metadataAccount as PublicKey;
}

export const findMasterEditionAccount = (connection: Connection, mint: PublicKey) => {
  const metaplex = Metaplex.make(connection);
  const pda = metaplex.nfts().pdas().masterEdition({mint});
  return pda as PublicKey;
}

export const getNFTByMint = async (connection: Connection, mintAddress: PublicKey) => {
  const metaplex = Metaplex.make(connection);
  const nft = await metaplex.nfts().findByMint({mintAddress});
  return nft;
}

export const findUserNFT = async (connection: Connection, owner: PublicKey) => {
  const metaplex = Metaplex.make(connection);
  const nfts = await metaplex.nfts().findAllByOwner({owner});
  // Create a map to group NFTs by their collection
  const collectionsMap = new Map();
  const singleNFTs: (Metadata | Nft | Sft)[] = [];
  nfts.forEach(nft => {
    // Check if the NFT has a collection field
    if (!!nft.collection) {
      const collectionKey = nft.collection.address.toBase58(); // Use the collection key as a unique identifier
      
      // If the collection doesn't exist in the map, create a new entry
      if (!collectionsMap.has(collectionKey)) {
        collectionsMap.set(collectionKey, {
          collectionAddress: nft.collection.address,
          nfts: []
        });
      }

      // Add the NFT to the corresponding collection
      collectionsMap.get(collectionKey).nfts.push(nft);
    } else {
      singleNFTs.push(nft);
    }
  });

  // Convert the map to an array
  const collections = [...Array.from(collectionsMap.values())];
  return {collections, singleNFTs};
}