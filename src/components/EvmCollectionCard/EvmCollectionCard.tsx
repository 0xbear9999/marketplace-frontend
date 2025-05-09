"use client";
import { EvmCollection } from "@/types";
import { getCollectionContract } from "@/utils/contracts";
import { getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FC, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";


interface Props {
    collection: EvmCollection;
}

const EvmCollectionCard: FC<Props> = ({ collection }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            if (!primaryWallet) return;
            if (primaryWallet.chain !== 'EVM') return;
            // @ts-ignore
            const provider = await getWeb3Provider(primaryWallet);
            const network = await provider.getNetwork();
            const chainId = network.chainId;
            const contract = getCollectionContract(collection.address, provider, Number(chainId));
            setLoading(true);
            const name = await contract.name();
            setName(name);
            setLoading(false);
        })();
    }, [collection, primaryWallet])

    return (
        <div
            className="rounded-xl bg-gray-600 p-4"
        >
            <div className="rounded-xl overflow-hidden">
                <img src={collection.logo} />
            </div>
            <div className="flex flex-col mt-2 text-xl">
                {
                    loading ? (
                        <Skeleton height={25} width={100} baseColor="#202020" highlightColor="#444" />
                    ) : (
                        <div className="uppercase truncate">{name}</div>
                    )
                }
                <div className="flex gap-2 text-gray-300">
                    <div className="w-1/2">Created by:</div>
                    <div className="truncate w-1/2">{collection.creator}</div>
                </div>
            </div>
        </div>
    )
}

export default EvmCollectionCard;