"use client"
import StyledImage from "@/components/StyledImage";
import { AuthContext } from "@/hooks/ContextProvider";
import Link from "next/link";
import { useContext, useEffect, useState, Suspense } from "react";
import { ConfirmSVG, CopySVG, LinkSVG } from "@/assets/svgs";
import { getEllipsis } from "@/utils/functions";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { URLS } from "@/config/urls";
import Button from "@/components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import CollectionCard from "@/components/CollectionCard/CollectionCard";
import NFTCard from "@/components/NFTCard/NFTCard";
import ListedCard from "@/components/ListedCard/ListedCard";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import SolCollection from "./SolCollection";
import Collection from "./Collection";


const filters = [
  { name: "My collection", link: "collection" },
  { name: "Listed", link: "listed" },
  { name: "Sale", link: "sale" },
  { name: "Bid", link: "bid" },
  { name: "Transaction History", link: "transactionhistory" },
];

function CollectionContent() {
  const [isCopied, setIsCopied] = useState(false);
  const [type, setType] = useState('collection');
  const { user } = useContext(AuthContext);
  const { primaryWallet } = useDynamicContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!!tab) {
      setType(tab);
    } else {
      router.push(`${URLS.collection}?tab=collection`)
    }
  }, [searchParams])




  const onCopyAddress = (address: string) => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="relative px-3 py-[80px] z-0 tracking-normal overflow-hidden min-h-screen">
      <div className="max-w-[1240px] relative z-10 mx-auto mt-[50px]">
        <div className="flex justify-between items-center  sm:flex-row flex-col">
          <div className="flex items-center sm:mb-0 mb-6">
            <StyledImage
              src={user?.avatar ?? ""}
              onError={(e: any) =>
                (e.target.src = "/images/personalcenter/personaldata/avatar.png")
              }
              alt={""}
              className="!w-[60px] !h-[60px] rounded-full mr-4"
            />

            <div>
              <div className="flex items-center">
                <div className="font-semibold text-[32px] mr-5 leading-[1.2]">
                  {user?.nickname}
                </div>
                <Link href={URLS.profile}>{LinkSVG}</Link>
              </div>
              <div className="flex items-center justify-between text-sm text-[#C4C4C4]">
                <div>{isCopied ? "Copied" : getEllipsis(primaryWallet?.address as string)}</div>
                <div
                  className="w-5 flex justify-center cursor-pointer"
                  onClick={() => onCopyAddress(primaryWallet?.address as string)}
                >
                  {isCopied ? ConfirmSVG : CopySVG}
                </div>
              </div>
            </div>
          </div>
          <div className="flex xs:flex-row flex-col xs:items-start items-center">
            <Link href={URLS.createNFT}>
              <Button type={"primary1"} className="mr-3 w-[162px] h-[44px]">
                Create NFT
              </Button>
            </Link>
            {
              primaryWallet?.chain !== 'solana' && (
                <Link href={URLS.createCollection} className="xs:mt-0 mt-4">
                  <Button
                    type={"primary"}
                    border="1px"
                    itemClassName="p-[8px_16px]"
                    className="h-[44px]"
                  >
                    Create a Collection
                  </Button>
                </Link>
              )
            }
          </div>
        </div>
        <div className="mt-7 xl:items-center items-end flex justify-between xl:flex-row flex-col-reverse">
          <div className="md:flex hidden">
            {filters.map((data, i) => {
              return (
                <Link key={i} href={`${URLS.collection}?tab=${data.link}`}>
                  <Button
                    type="category"
                    className={`h-[36px] !rounded-lg mr-3 whitespace-nowrap ${data.link === type?.toLowerCase() ? "!bg-white !text-black font-semibold" : ""
                      }`}
                  >
                    {data.name}
                  </Button>
                </Link>
              );
            })}
          </div>
          <div className="relative z-10 md:hidden block">

          </div>
          <div className="xl:mb-0 mb-4 w-full flex justify-end">

          </div>
        </div>
        <div className="mt-[30px]" />
        {
          primaryWallet?.chain === 'SOL' && (
            <SolCollection type={type}/>
          )
        }
        {
          primaryWallet?.chain === 'EVM' && (
            <Collection type={type}/>
          )
        }
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionContent />
    </Suspense>
  );
}