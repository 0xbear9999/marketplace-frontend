import { SolanaCollection } from "@/types";
import { FC } from "react";
import NFTCard from "../NFTCard/NFTCard";
import { Button } from "@headlessui/react";
import { ArrowLeftIcon } from "@dynamic-labs/sdk-react-core";


interface Props {
    collection: SolanaCollection;
    curCollection: string;
    setCurCollection: (val: string) => void;
}

const CollectionCard: FC<Props> = ({ collection, curCollection, setCurCollection }) => {
    return (
        <div className="flex">
            {
                curCollection === collection.collectionAddress.toBase58() && !!curCollection ? (
                    <div className="flex flex-col gap-2">
                        <div onClick={() => setCurCollection('')} className="flex gap-2 items-center cursor-pointer">
                            <div>
                                <ArrowLeftIcon className="size-5"/>
                            </div>
                            <div>{collection.nfts[0].name}</div>
                        </div>
                        <div className="flex gap-1">
                            {
                                collection.nfts.map((nft, i) => (
                                    <NFTCard nft={nft} key={i} />
                                ))
                            }
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => setCurCollection(collection?.collectionAddress.toBase58())}>
                        <NFTCard nft={collection.nfts[0]} balance={!!collection.collectionAddress && collection.nfts.length} />
                    </Button>
                )
            }
        </div>
    );
}

export default CollectionCard;