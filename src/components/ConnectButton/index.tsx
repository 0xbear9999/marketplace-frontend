"use client"
import { DynamicConnectButton, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import dynamic from "next/dynamic";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { WalletSVG } from "@/assets/svgs";
import StyledImage from "../StyledImage";
import Link from "next/link";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AuthContext } from "@/hooks/ContextProvider";
import { URLS } from "@/config/urls";
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6'
import { formatEther } from "ethers";

const Button = dynamic(() => import('@/components/Button'), { ssr: false });

export default function ConnectButton() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const { primaryWallet, handleLogOut } = useDynamicContext();

  const { fetchUser, user } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      if (!primaryWallet) return;
      await fetchUser(primaryWallet.address);
    })();
  }, [primaryWallet]);

  const getBalance = useCallback(async () => {
    if (primaryWallet?.chain === 'SOL') {
      // @ts-ignore
      const connection: Connection = await primaryWallet.getConnection();
      if (!connection) return;
      const bal = await connection.getBalance(new PublicKey(primaryWallet.address));
      setBalance(`${(bal / LAMPORTS_PER_SOL).toFixed(2)} SOL`)
    } else if (primaryWallet?.chain === 'EVM') {
      if (!primaryWallet) return;
      try {
        const provider = await getWeb3Provider(primaryWallet as any);
        if (!provider) return;
        const balance = await provider.getBalance(primaryWallet.address);
        const formattedBalance = Number(formatEther(balance)).toFixed(2);
        setBalance(`${formattedBalance} ETH`);
      } catch (error) {
        console.error('Error fetching EVM balance:', error);
        setBalance('0.00 ETH');
      }
    }
  }, [primaryWallet]);

  useEffect(() => {
    getBalance();
  }, [primaryWallet]);

  const SOL_MENU = [
    { text: "Personal data", link: URLS.profile },
    { text: "My Collection", link: URLS.collection },
    { text: "Create NFT", link: URLS.createNFT },
    { text: "Exit", action: handleLogOut },
  ];

  const EVM_NENU = [
    { text: "Personal data", link: URLS.profile },
    { text: "My Collection", link: URLS.collection },
    { text: "Create Collection", link: URLS.createCollection },
    { text: "Create NFT", link: URLS.createNFT },
    { text: "Exit", action: handleLogOut },
  ]

  const menuRef: any = useRef();
  useEffect(() => {
    document.addEventListener("mouseup", function (event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    });
  }, []);
  return (
    <>
      {
        !!primaryWallet ? (
          <Button
            type={"primary"}
            border="1px"
            className="w-[200px] z-10"
            itemClassName="w-[calc(100%-4px)] tracking-normal relative"
            onClick={() => setOpen(!open)}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <div className="ml-0.5">{WalletSVG}</div>
                <div className="ml-1.5">
                  {balance}
                </div>
              </div>
              <div className="bg-[#858585] w-[1px] h-[27px]" />
              <div className="w-9 h-9 rounded-full overflow-hidden flex justify-center items-center">
                {
                  !!user?.avatar ? (
                    <StyledImage
                      src={user?.avatar}
                      alt={""}
                      className="w-full"
                    />
                  ) : (
                    <StyledImage
                      src={"/images/personalcenter/personaldata/avatar.png"}
                      alt={""}
                      className="w-full"
                    />
                  )
                }
              </div>
            </div>
            <div
              className={`absolute top-16 right-0 rounded-lg border border-white p-[8px_24px] backdrop-blur bg-white ${open ? "flex" : "hidden"
                } flex-col items-start`}
              ref={menuRef}
            >
              {
                (primaryWallet?.chain === 'SOL' ? SOL_MENU : EVM_NENU).map((item, i) =>
                  !!item.action ? (
                    <div key={i} className="leading-[1.2] my-2 relative before:content-[''] before:absolute before:w-0 before:-bottom-2 before:h-[1px] before:bg-[#81451E] before:transition-all hover:before:w-full before:duration-500" onClick={item.action}>{item.text}</div>
                  ) : (
                    <Link key={i} href={item.link}>
                      <div className="leading-[1.2] my-2 relative before:content-[''] before:absolute before:w-0 before:-bottom-2 before:h-[1px] before:bg-[#81451E] before:transition-all hover:before:w-full before:duration-500">
                        {item.text}
                      </div>
                    </Link>
                  )
                )
              }
            </div>
          </Button>
        ) : (
          <DynamicConnectButton>
            <div
              className={`border-primary w-full border-2 wallet-button`}
            >
              Connect Wallet
            </div>
          </DynamicConnectButton>
        )
      }
    </>
  );
}
