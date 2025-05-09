"use client"
import { auctionService, userService } from "@/services/api.service";
import { Listed, SolanaCollection, UserNFTs } from "@/types";
import { findUserNFT, getNFTByMint } from "@/utils/metaplex.utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

import { PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { createContext, useCallback, useState } from "react";
import { Nft } from "@metaplex-foundation/js";


interface Props {
    collectionList: SolanaCollection[];
    singleNFTList: Nft[];
    fetchCollection: () => void;
    listedNFTList: Listed[];
    addNFT: (mint: PublicKey) => void;
    listingNFT: (mint: PublicKey) => void;
    allCollections: SolanaCollection[];
    allSingleNFTs: Nft[];
    allListedNFTs: Listed[];
}

export const SolNFTContext = createContext<Props>({} as Props);

export const SolNFTContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [collectionList, setCollectionList] = useState<SolanaCollection[]>([]);
    const [singleNFTList, setSingleNFTList] = useState<Nft[]>([]);
    const [listedNFTList, setListedNFTList] = useState<Listed[]>([]);
    const [allCollections, setAllCollections] = useState<SolanaCollection[]>([]);
    const [allSingleNFTs, setAllSingleNFTs] = useState<Nft[]>([]);
    const [allListedNFTs, setAllListedNFTs] = useState<Listed[]>([]);
    const { primaryWallet } = useDynamicContext();

    const fetchCollection = useCallback(async () => {
        try {
            const users = await userService.fetchAllUsers();
            console.log("Users: ", users);
            if (!primaryWallet) return;
            if (primaryWallet.chain === 'SOL') {
                // @ts-ignore
                const connection: Connection = await primaryWallet.getConnection();
                if (!connection) return;

                const collections: SolanaCollection[] = [];
                const singleNFTs: Nft[] = [];
                const listedNFTs: Listed[] = [];
                users.forEach(async (user: any) => {
                    if (user.wallet.slice(0, 2) === "0x")
                        return;

                    const res = await findUserNFT(connection, new PublicKey(user.wallet));
                    collections.push(...res.collections);
                    singleNFTs.push(...res.singleNFTs as Nft[]);

                    const listed = await auctionService.listed(user.wallet);
                    listedNFTs.push(...listed);

                    if (user.wallet === primaryWallet.address) {
                        setCollectionList(res.collections);
                        setSingleNFTList(res.singleNFTs as Nft[]);
                        setListedNFTList(listed);
                    }
                });

                console.log("Collections: ", collections);
                console.log("Single NFTs: ", singleNFTs);
                console.log("Listed NFTs: ", listedNFTs);

                setAllCollections(collections);
                setAllSingleNFTs(singleNFTs);
                setAllListedNFTs(listedNFTs);
            }
        } catch (e) {
            console.log(e);
        }
    }, [primaryWallet]);

    const addNFT = useCallback(async (mint: PublicKey) => {
        try {
            if (!primaryWallet) return;
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            if (!connection) return;
            const nft = await getNFTByMint(connection, mint);
            if (!!nft.collection) {
                const index = collectionList.findIndex(item => item.collectionAddress.toBase58() === nft.collection?.address.toBase58());
                if (index !== -1) {
                    setCollectionList(prev => {
                        const newList = [...prev];
                        newList[index].nfts.push(nft as Nft);
                        return newList;
                    })
                } else {
                    setCollectionList(prev => {
                        const newList = [...prev];
                        if (nft.collection && nft.collection.address) {
                            newList.push({
                                collectionAddress: nft.collection.address,
                                nfts: nft.model === "nft" ? [nft] : []
                            });
                        }
                        return newList;
                    })
                }
            } else {
                setSingleNFTList(prev => {
                    const newList = [...prev];
                    newList.push(nft as Nft);
                    return newList;
                })
            }
        } catch (e) {
            console.log(e)
        }
    }, [primaryWallet, collectionList, singleNFTList, setCollectionList, setSingleNFTList])

    const listingNFT = useCallback(async (mint: PublicKey) => {
        try {
            if (!primaryWallet) return;
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            if (!connection) return;
            const nft = await getNFTByMint(connection, mint);
            if (!!nft.collection) {
                const index = collectionList.findIndex(item => item.collectionAddress.toBase58() === nft.collection?.address.toBase58());
                if (index !== -1) {
                    setCollectionList(prev => {
                        const newList = [...prev];
                        newList[index].nfts.filter(item => item.address.toBase58() !== mint.toBase58());
                        return newList;
                    })
                } else {
                    setSingleNFTList(prev => {
                        const newList = prev.filter(item => item.address.toBase58() !== mint.toBase58());
                        return newList;
                    })
                }
            } else {
                setSingleNFTList(prev => {
                    const newList = prev.filter(item => item.address.toBase58() !== mint.toBase58());
                    return newList;
                })
            }
            const listed = await auctionService.listed(primaryWallet.address);
            setListedNFTList(listed);
        } catch (e) {
            console.log(e);
        }
    }, [primaryWallet]);

    return (
        <SolNFTContext.Provider
            value={{
                collectionList,
                singleNFTList,
                listedNFTList,
                fetchCollection,
                addNFT,
                listingNFT,
                allCollections,
                allSingleNFTs,
                allListedNFTs
            }}
        >
            {children}
        </SolNFTContext.Provider>
    )
}
