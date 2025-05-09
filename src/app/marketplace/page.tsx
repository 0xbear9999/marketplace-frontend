"use client"
import ListedCollectionCard from "@/components/ListedCollectionCard/ListedCollectionCard";
import { auctionService } from "@/services/api.service";
import { ListedCollection } from "@/types";
import { useEffect, useState } from "react";


const MarketplacePage = () => {
    const [collections, setCollections] = useState<ListedCollection[]>([]);

    useEffect(() => {
        (async () => {
            const res: ListedCollection[] = await auctionService.collections();
            console.log("Collections(SOL): ", res);
            setCollections(res);
        })();
    }, []);

    return (
        <div className="container flex flex-wrap gap-2 pt-[200px] pb-[50px] min-h-[700px]">
            {
                collections.map((collection, i) => (
                    <ListedCollectionCard key={i} collection={collection}/>
                ))
            }
        </div>
    );
}

export default MarketplacePage;