import CollectionCard from "@/components/CollectionCard/CollectionCard";
import ListedCard from "@/components/ListedCard/ListedCard";
import NFTCard from "@/components/NFTCard/NFTCard";
import { URLS } from "@/config/urls";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import Link from "next/link";
import { FC, useContext, useState } from "react";


interface Props {
    type: string;
}

const SolCollection: FC<Props> = ({ type }) => {
    const [curCollection, setCurCollection] = useState('');
    const { collectionList, listedNFTList, singleNFTList } = useContext(SolNFTContext);
    return (
        <div>
            {
                type === 'collection' && (
                    <div className="flex flex-wrap gap-1">
                        {
                            collectionList.map((collection, i) => (
                                <CollectionCard
                                    key={i}
                                    collection={collection}
                                    curCollection={curCollection}
                                    setCurCollection={setCurCollection}
                                />
                            ))
                        }
                        {
                            !curCollection && singleNFTList.map((nft, i) => (
                                <NFTCard key={i} nft={nft} />
                            ))
                        }
                    </div>
                )
            }
            {
                type === 'listed' && (
                    <div className="flex gap-1">
                        {
                            listedNFTList.map((item, i) => (
                                <Link
                                    key={i}
                                    href={`${URLS.nftOverview}?mint=${item.mint}&type=${item.type}`}
                                >
                                    <ListedCard listed={item} />
                                </Link>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
}

export default SolCollection;