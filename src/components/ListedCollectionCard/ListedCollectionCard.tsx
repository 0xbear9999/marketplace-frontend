"use client"
import { URLS } from "@/config/urls";
import { collectionService } from "@/services/api.service";
import { ListedCollection } from "@/types";
import { getNFTByMint } from "@/utils/metaplex.utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Nft } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";


interface Props {
    collection: ListedCollection;
}

const ListedCollectionCard: FC<Props> = ({ collection }) => {
    const [nft, setNft] = useState<Nft>();
    const [imageUri, setImageUri] = useState('/logo.webp');

    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            if (!collection || !primaryWallet) return;
            const connection = (primaryWallet?.connector as any).provider.connection;
            if (!connection) return;
            const listedNft = await getNFTByMint(connection, new PublicKey(collection.mint));
            setNft(listedNft as Nft);
        })();
    }, [collection, primaryWallet]);

    useEffect(() => {
        (async () => {
            if (!nft) return;
            const { image } = await collectionService.getImageUri(nft.uri);
            setImageUri(image);
        })();
    }, [nft]);

    return (
        <Link href={`${URLS.listedCollection}?collection=${!!collection.collectionMint ? collection.collectionMint : undefined}`}>
            <div className="w-[200px] shadow-md shadow-gray-200">
                <div className="bg-gray-500/50">
                    <Image
                        src={imageUri}
                        alt="nft"
                        className="w-[200px] h-[200px] object-scale-down"
                        width={150}
                        height={150}
                    />
                </div>
                <div className="flex flex-col gap-2 text-sm p-2 bg-gray-700 text-white">
                    <div className="flex">
                        <div className="flex-1">Collection</div>
                        <div>{!!collection.collectionMint ? nft?.name : 'Single NFTs'}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-1">Count</div>
                        <div>{`${collection.count}`}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-1">Floor</div>
                        <div>{`${collection.floor} $`}</div>
                    </div>
                    <div className="flex">
                        <div className="flex-1">Top offer</div>
                        <div>{`${collection.top} $`}</div>
                    </div>
                </div>
            </div>
        </Link>

    );
}

export default ListedCollectionCard;