"use client"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { FC, useContext, useEffect } from "react";
import ConnectButton from "../ConnectButton";
import { URLS } from "@/config/urls";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import { NFTContext } from "@/hooks/NFTContextProvider";


interface Props { }

const Topbar: FC<Props> = () => {
  const { primaryWallet } = useDynamicContext();

  const { fetchCollection } = useContext(SolNFTContext);
  const { fetchNFTs, fetchListedCollection } = useContext(NFTContext);

  useEffect(() => {
    if (!primaryWallet) return;
    console.log("Primary Wallet: ", primaryWallet);
    if (primaryWallet.chain === 'SOL') {
      fetchCollection();
    }
    if (primaryWallet.chain === 'EVM') {
      fetchNFTs();
      fetchListedCollection();
    }
  }, [primaryWallet]);

  return (
    <div className="bg-[#FFFFFF1A] w-full absolute z-[100]">
      <div className="px-3 relative">
        <div className="absolute w-full h-full left-0 top-0 backdrop-blur" />
        <div className="w-full max-w-[1367px] mx-auto h-20 flex items-center justify-between relative z-10">
          <div className="flex items-center w-full mr-3 justify-between">
            <Link
              className="font-medium text-[26px] mr-[26px] flex items-center"
              href={"/"}
            >
              <img src={"/header_logo.webp"} alt="logo" className="h-16 mr-4" />
            </Link>
            <div className="flex items-center">
              <Link
                href={"/"}
                className="mx-6 text-lg font-semibold lg:block hidden"
              >
                Marketplace
              </Link>
              {
                primaryWallet?.chain === 'SOL' ? (
                  <Link className="mx-6 text-lg font-semibold lg:block hidden" href={URLS.createNFT}>
                    Create NFT
                  </Link>
                ) : (
                  <Link href={URLS.createCollection}
                    className="mx-6 text-lg font-semibold lg:block hidden"
                  >
                    Create a Collection
                  </Link>
                )
              }
            </div>
          </div>
          <div className="flex items-center xs:px-12 px-3">
            <div className="xs:block hidden lg:mr-6 mr-12">

            </div>
            <div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar;