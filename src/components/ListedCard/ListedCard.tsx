"use client"
import { Listed } from "@/types";
import { getNFTByMint } from "@/utils/metaplex.utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Nft } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { collectionService } from "@/services/api.service";
import Image from "next/image";



interface Props {
    listed: Listed;
}

const ListedCard: FC<Props> = ({ listed }) => {
    const [nft, setNft] = useState<Nft>();
    const [imageUri, setImageUri] = useState('/logo.webp');

    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            if (!listed || !primaryWallet) return;
            // @ts-ignore
            const connection = await (primaryWallet).connector.getPublicClient<Connection | undefined>();
            if (!connection) return;
            const listedNft = await getNFTByMint(connection, new PublicKey(listed.mint));
            setNft(listedNft as Nft);
        })();
    }, [listed, primaryWallet]);

    useEffect(() => {
        (async () => {
            if (!nft) return;
            const { image } = await collectionService.getImageUri(nft.uri);
            setImageUri(image);
        })();
    }, [nft]);

    return (
        <div
            className="relative w-[150px]"
        >
            <div className="bg-gray-500/50 w-[150px] h-[150px] rounded-tr-md rounded-tl-md overflow-hidden">
                <Image
                    src={imageUri}
                    alt="nft"
                    className="object-scale-down"
                    width={150}
                    height={150}
                />
            </div>
            <div className="text-sm justify-center bg-black/70 items-center flex flex-col gap-1 px-2 rounded-br-md rounded-bl-md relative">
                <div className="text-center">
                    {nft?.name}
                </div>
                <div className="flex text-sm w-full">
                    <div className="flex-1 capitalize">{listed.type}</div>
                    <div>
                        {`${listed.price}$`}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListedCard;