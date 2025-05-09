import { toast } from "react-toastify";


export default function HeroSection() {
  
  return (
    <div className="flex justify-between">
      <div className="mt-[50px] mr-3">
        <div className="text-[46px] font-semibold leading-[1.2] font-bebas">
          Marketplace For Creators
          <br />
          Buy & Sell NFTS
        </div>
        <div className="mt-4 text-[#C4C4C4] font-lg max-w-[673px] leading-[1.9]">
            NFT Marketplace is the premier marketplace for NFTs, which are digital items you can truly own. Digital Items have existed for a long time, but never like this.
        </div>
      </div>
      <div className="relative lg:block hidden">
        <div className="absolute bg-[#FFFFFF33] backdrop-blur rounded-lg p-[8px_38px] font-lg font-semibold leading-[1.9] -left-[70px] bottom-[45px]">
          2000+Creators
        </div>
        <img
          className="w-[350px]"
          src={"/images/home/hero-chmpz.png"}
          alt={""}
        />
      </div>
    </div>
  );
}
