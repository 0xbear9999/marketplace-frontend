"use client"
import { collectionService, nftService } from "@/services/api.service";
import { fetchUserCollectionBalance, getListedCollectionNFTs } from "@/services/evm.service";
import { EvmCollection, EvmNFT, NFT, UserCollection } from "@/types";
import { getCollectionContract } from "@/utils/contracts";
import { getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { createContext, useCallback, useState } from "react";



interface Props {
    fetchNFTs: () => void;
    collectionList: EvmCollection[];
    appendCollection: (collection: EvmCollection) => void;
    fetchListedCollection: () => void;
    listedList: EvmNFT[];
}

export const NFTContext = createContext<Props>({} as Props);

export const NFTContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [collectionList, setCollectionList] = useState<EvmCollection[]>([]);
    const [listedList, setListedList] = useState<EvmNFT[]>([]);

    const { primaryWallet } = useDynamicContext();

    const fetchNFTs = useCallback(async () => {
        // fetch nfts
        if (!primaryWallet) return;
        if (primaryWallet.chain !== 'EVM') return;
        const provider = await getWeb3Provider(primaryWallet as any);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        const collections = await collectionService.fetchEvmCollection(Number(chainId));
        let temp = [];
        for await (const collection of collections) {
            const contract = getCollectionContract(collection.address, provider, Number(chainId));
            const balance = await contract.balanceOf(primaryWallet.address);
            if (Number(balance) > 0) {
                temp.push(collection);
            }
        }
        setCollectionList(temp);
    }, [primaryWallet]);

    const fetchListedCollection = useCallback(async () => {
        if (!primaryWallet) return;
        if (primaryWallet.chain !== 'EVM') return;
        const provider = await getWeb3Provider(primaryWallet as any);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        const collections = await getListedCollectionNFTs(
            provider,
            primaryWallet.address,
            Number(chainId)
        );
        setListedList(collections);

    }, [primaryWallet]);

    const appendCollection = useCallback((collection: EvmCollection) => {
        setCollectionList([...collectionList, collection]);
    }, [collectionList]);
        
    const fetchEvmMarket = useCallback(async () => {
        if (!primaryWallet) return;
        if (primaryWallet.chain !== 'EVM') return;
        const provider = await getWeb3Provider(primaryWallet as any);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        
    }, [primaryWallet]);

    return (
        <NFTContext.Provider
            value={{
                fetchNFTs,
                collectionList,
                appendCollection,
                fetchListedCollection,
                listedList
            }}
        >
            {children}
        </NFTContext.Provider>
    )
}