"use client"
import EvmCollectionCard from "@/components/EvmCollectionCard/EvmCollectionCard";
import EvmNFTCard from "@/components/EvmNFTCard/EvmNFTCard";
import { NFTContext } from "@/hooks/NFTContextProvider";
import { getUserNFTs } from "@/services/evm.service";
import { EvmCollection, EvmNFT } from "@/types";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import EvmListedNFTs from "./EvmListedNFTs";


interface Props {
    type: string;
}

const Collection: FC<Props> = ({type}) => {
    const [selCol, setSelCol] = useState<EvmCollection>();
    const [nftList, setNftList] = useState([]);

    const { collectionList } = useContext(NFTContext);
    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            if (!selCol || !primaryWallet) return;
            const nfts = await getUserNFTs(
                selCol.address,
                primaryWallet.address,
                selCol.chainId
            );
            setNftList(nfts);
        })();
    }, [selCol, primaryWallet]);

    const listNFT = useCallback(async() => {
        if (!selCol || !primaryWallet) return;
        const nfts = await getUserNFTs(
            selCol.address,
            primaryWallet.address,
            selCol.chainId
        );
        if (nfts.length > 0) {
            setNftList(nfts);
        } else {
            setSelCol(undefined);
            setNftList([]);
        }
    }, [selCol, primaryWallet])

    const CollectionListRender = (
        <div className="grid lg:grid-cols-4 gap-2 md:grid-cols-3 grid-cols-2 sm:grid-cols-1">
            {
                type === 'collection' && collectionList.map((item, i) => (
                    <div onClick={() => setSelCol(item)} key={i} className="cursor-pointer">
                        <EvmCollectionCard collection={item} />
                    </div>
                ))
            }
            {
                type === 'listed' && (
                    <EvmListedNFTs />
                )
            }
        </div>
    );

    const SelectedCollectionRender = (
        <div className="flex flex-col gap-2">
            <div>
                <div onClick={() => {setSelCol(undefined);setNftList([])}} className="flex gap-2 items-center cursor-pointer">
                    <div>
                        <ArrowLeftIcon className="size-5" />
                    </div>
                    <div>Back</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {
                    nftList.map((nft, i) => (
                        <EvmNFTCard key={i} nft={nft} listNFT={listNFT}/>
                    ))
                }
            </div>
        </div>
    )

    return (
        <div>
            {
                !!selCol ? SelectedCollectionRender : CollectionListRender
            }
        </div>
    )
}

export default Collection;