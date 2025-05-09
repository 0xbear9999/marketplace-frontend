"use client"
import { metadataService } from "@/services/api.service";
import { EvmNFT, Metadata } from "@/types";
import { getCollectionContract } from "@/utils/contracts";
import { getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FC, useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton'
import EvmAuctionDlg from "../EvmAuctionDlg/EvmAuctionDlg";


interface Props {
    nft: EvmNFT;
    listNFT: () => void;
    listed?: boolean;
}

const EvmNFTCard: FC<Props> = ({ nft, listNFT, listed = false }) => {
    const { primaryWallet } = useDynamicContext();
    const [loading, setLoading] = useState(false);
    const [openAuction, setOpenAuction] = useState(false);
    const [openListing, setOpenListing] = useState(false);
    const [metadata, setMetadata] = useState<Metadata>();
    useEffect(() => {
        (async () => {
            if (!primaryWallet) return;
            if (primaryWallet.chain !== 'EVM') return;
            setLoading(true);
            const provider = await getWeb3Provider(primaryWallet as any);
            const contract = getCollectionContract(nft.address, provider, nft.chainId);
            const tokenUri = await contract.tokenURI(nft.tokenId);
            const metadata = await metadataService.fetch(tokenUri);
            setMetadata(metadata);
            setLoading(false);
        })();
    }, [nft, primaryWallet]);




    return (
        <div className="bg-gray-600 rounded-xl p-4 max-w-[300px] w-full">
            <EvmAuctionDlg
                image={metadata?.image || '/logo.webp'}
                isOpen={openAuction}
                close={() => setOpenAuction(false)}
                metadata={metadata}
                nft={nft}
                listNFT={listNFT}
            />
            <div className="rounded-xl overflow-hidden h-[280px]">
                {
                    loading ? (
                        <Skeleton width={280} height={280} baseColor="#202020" highlightColor="#444" />
                    ) : (
                        <img src={metadata?.image} className="w-[280px] h-[280px] object-cover" />
                    )
                }
            </div>
            <div className="mt-4 flex flex-col gap-2">
                {
                    loading ? (
                        <Skeleton height={25} width={100} baseColor="#202020" highlightColor="#444" />
                    ) : (
                        <div className="text-xl font-bold">{metadata?.name}</div>
                    )
                }
                {
                    listed ? (
                        <></>
                    ) : (
                        <>
                            <div>
                                <button
                                    onClick={() => setOpenAuction(true)}
                                    className="bg-gradient-to-r from-pink-400 to-teal-400 w-full rounded-md"
                                >
                                    <div className="h-full m-0.5 bg-gray-600 rounded-md py-1">
                                        Auction
                                    </div>
                                </button>
                            </div>
                            <div>
                                <button
                                    onClick={() => setOpenListing(true)}
                                    className="bg-gradient-to-r from-pink-400 to-teal-400 w-full rounded-md"
                                >
                                    <div className="h-full m-0.5 bg-gray-600 rounded-md py-1">
                                        Listing
                                    </div>
                                </button>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}

export default EvmNFTCard;