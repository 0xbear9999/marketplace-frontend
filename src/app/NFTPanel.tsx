"use client"
import EvmListedCard from "@/components/EvmListedCard/EvmListedCard";
import EvmNFTCard from "@/components/EvmNFTCard/EvmNFTCard";
import SolListedCard from "@/components/SolListedCard/SolListedCard";
import { NFTContext } from "@/hooks/NFTContextProvider";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FC, useContext } from "react";

interface Props {

}

const NFTPanel: FC<Props> = () => {
    const { primaryWallet } = useDynamicContext();
    const { listedList } = useContext(NFTContext);
    const { allListedNFTs } = useContext(SolNFTContext);

    return (
        <div className="w-full grid gap-2 md:grid-cols-3 grid-cols-1 lg:grid-cols-4 max-h-[700px] overflow-y-auto">
            {
                primaryWallet?.chain === 'EVM' ? (
                    listedList.map((nft, i) => (
                        <EvmListedCard 
                            key={i}
                            nft={nft}
                        />
                    ))
                ) : (
                    allListedNFTs.map((nft, i) => (
                        <SolListedCard
                            key={i}
                            nft={nft}
                        />
                    ))
                )
            }
        </div>
    );
}

export default NFTPanel;