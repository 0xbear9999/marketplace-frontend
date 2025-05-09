"use client"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import SolanaNFT from "./SolanaNFT";
import EvmNFT from "./EvmNFT";

const CreatePage = () => {
  const { primaryWallet } = useDynamicContext();

  return (
    <div className="relative px-3 py-[80px] z-0 tracking-normal overflow-hidden min-h-screen">
      {
        primaryWallet?.chain === 'SOL' ? (
          <SolanaNFT/>
        ) : (
          <EvmNFT />
        )
      }
    </div>
  );
}

export default CreatePage;