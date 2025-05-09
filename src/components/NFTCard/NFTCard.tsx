"use client"
import { collectionService } from "@/services/api.service";
import { Nft } from "@metaplex-foundation/js";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@headlessui/react";
import AuctionDlg from "../AuctionDlg/AuctionDlg";
import Image from "next/image";
import ListingDlg from "../ListingDlg/ListingDlg";


interface Props {
    nft: Nft;
    balance?: number;
};

const NFTCard: FC<Props> = ({ nft, balance }) => {
    const [imageUri, setImageUri] = useState('/logo.webp');
    const [openAuction, setOpenAuction] = useState(false);
    const [openListing, setOpenListing] =useState(false);
    
    useEffect(() => {
        (async () => {
            const { image } = await collectionService.getImageUri(nft.uri);
            setImageUri(image);
        })();
    }, []);
    return (
        <div
            className="relative rounded-md overflow-hidden shadow-md shadow-gray-500 w-[150px] group"
        >
            <AuctionDlg image={imageUri} nft={nft} isOpen={openAuction} close={() => setOpenAuction(false)} />
            <ListingDlg image={imageUri} nft={nft} isOpen={openListing} close={() => setOpenListing(false)} />
            <div className="bg-gray-500/50">
                <Image
                    src={imageUri}
                    alt="nft"
                    className="w-[150px] h-[150px] object-scale-down"
                    width={150}
                    height={150}
                />
            </div>
            <div className="text-sm font-semibold justify-center bg-white/50 h-[30px] items-center flex">
                <div>
                    {nft.name}
                </div>
                <div>
                    {!!balance && `(${balance})`}
                </div>
            </div>
            {
                !balance && (
                    <div
                        className="absolute w-full h-full top-0 left-0 bg-black/60 flex-col justify-center items-center gap-4 hidden group-hover:flex"
                    >
                        <Button onClick={() => setOpenAuction(true)} className="border py-1 w-[80px] text-center rounded-md text-sm">
                            Auction
                        </Button>
                        <Button onClick={() => setOpenListing(true)} className="border py-1 w-[80px] text-center rounded-md text-sm">
                            Listing
                        </Button>
                    </div>
                )
            }
        </div>
    )
}

export default NFTCard;