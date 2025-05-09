"use client"
import { FC } from "react";
import BidDlg from "@/components/BidDlg/BidDlg";
import BuyDlg from "@/components/BuyDlg/BuyDlg";
import ListedCard from "@/components/ListedCard/ListedCard";
import { Listed } from "@/types";
import { Button } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
    nft: Listed;
}

const SolListedCard: FC<Props> = ({ nft }) => {
    const [openBid, setOpenBid] = useState(false);
    const [openBuy, setOpenBuy] = useState(false);
    const [selectListed, setSelectListed] = useState<Listed>();

    return (
        <div className="container flex gap-2 min-h-[700px]">
            <BidDlg 
                isOpen={openBid}
                close={() => setOpenBid(false)}
                listed={selectListed}
            />
            <BuyDlg 
                isOpen={openBuy}
                close={() => setOpenBuy(false)}
                listed={selectListed}
            />
            {
              <div className="relative group h-[200px]">
                  <ListedCard listed={nft} />
                  <div className="absolute bg-black/80 w-full h-[43px] top-[150px] left-0 flex justify-center items-center rounded-br-md rounded-bl-md invisible group-hover:visible">
                      {
                          nft.type === 'auction' ? (
                              <Button
                                  onClick={() => {setOpenBid(true);setSelectListed(nft)}}
                                  className="border-2 h-[25px] text-sm w-[100px] rounded-md bg-[#FCEFDE] text-[#834921] font-bold"
                              >
                                  Bid
                              </Button>
                          ) : (
                              <Button
                                  onClick={() => {setOpenBuy(true);setSelectListed(nft)}}
                                  className="border-2 h-[25px] text-sm w-[100px] rounded-md bg-[#FCEFDE] text-[#834921] font-bold"
                              >
                                  Buy
                              </Button>
                          )
                      }
                      <Button>

                      </Button>
                  </div>
              </div>
            }
        </div>
    );
}

export default SolListedCard;