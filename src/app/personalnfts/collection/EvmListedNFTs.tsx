"use client"
import EvmNFTCard from "@/components/EvmNFTCard/EvmNFTCard";
import { NFTContext } from "@/hooks/NFTContextProvider";
import { FC, useContext } from "react";


interface Props {

}

const EvmListedNFTs: FC<Props> = () => {
    const { listedList } = useContext(NFTContext);

    return (
        <>
            {
                listedList.map((nft, i) => (
                    <EvmNFTCard key={i} nft={nft} listNFT={() => { }} listed={true} />
                ))
            }
        </>
    );
}

export default EvmListedNFTs;