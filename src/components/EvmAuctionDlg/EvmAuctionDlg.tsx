"use client"
import { Dialog, DialogPanel, DialogTitle, Input, Select } from "@headlessui/react";
import Image from "next/image";
import { FC, useCallback, useEffect, useState } from "react";
import StyledInput from "../StyledInput";
import Button from "../Button";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { CloseSVG } from "@/assets/svgs";
import { Token, TOKENS } from "@/config/tokens";
import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { EvmNFT, Metadata } from "@/types";
import { getCollectionContract, getMarketplaceContract } from "@/utils/contracts";
import { parseUnits } from "ethers";
import { amount } from "@metaplex-foundation/js";
import { MARKETPLACE_ADDR } from "@/config/contracts";
import { toast } from "react-toastify";
import Notification from "../Notification";


interface Props {
    close: () => void;
    isOpen: boolean;
    image: string;
    metadata: Metadata | undefined;
    nft: EvmNFT;
    listNFT: () => void;
}

const EvmAuctionDlg: FC<Props> = ({ isOpen, close, image, metadata, nft, listNFT }) => {
    const [minBidAmount, setMinBidAmount] = useState('0');
    const [buyoutAmount, setBuyoutAmount] = useState('0');
    const [endTime, setEndTime] = useState('');
    const [timeBuffer, setTimeBuffer] = useState('0');
    const [bidBuffer, setBidBuffer] = useState('0');
    const [currenyList, setCurrencyList] = useState<Token[]>([]);
    const [currency, setCurrency] = useState(0);

    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            if (!primaryWallet) return;
            const provider = await getWeb3Provider(primaryWallet as any);
            const network = await provider.getNetwork();
            const chainId = network.chainId;
            setCurrencyList(TOKENS[Number(chainId)]);
        })();
    }, [primaryWallet]);

    const createAuction = useCallback(async () => {
        try {
            if (!primaryWallet) return;
            const provider = await getWeb3Provider(primaryWallet as any);
            const network = await provider.getNetwork();
            const chainId = network.chainId;
            const signer = await getSigner(primaryWallet as any);
            const contract = getMarketplaceContract(signer, Number(chainId));
            const params = {
                assetContract: nft.address,
                tokenId: nft.tokenId,
                quantity: 1,
                currency: currenyList[currency].address,
                minimumBidAmount: parseUnits(minBidAmount, currenyList[currency].decimals),
                buyoutBidAmount: parseUnits(buyoutAmount, currenyList[currency].decimals),
                timeBufferInSeconds: timeBuffer,
                bidBufferBps: bidBuffer,
                startTimestamp: Math.floor(Date.now() / 1000),
                endTimestamp: Math.floor(new Date(endTime).getTime() / 1000)
            };
            const nftContract = getCollectionContract(nft.address, signer, Number(chainId));
            const allowance = await nftContract.isApprovedForAll(primaryWallet.address, MARKETPLACE_ADDR[Number(chainId)]);
            if (Number(allowance) < 1) {
                const tx = await nftContract.setApprovalForAll(MARKETPLACE_ADDR[Number(chainId)], true);
                toast(
                    <Notification
                        type={"loading"}
                        msg="Transaction submitted"
                        txhash={tx.hash}
                        chain="EVM"
                    />
                );
                await tx.wait();
            }
            const tx = await contract.createAuction(params);
            toast(
                <Notification
                    type={"loading"}
                    msg="Transaction submitted"
                    txhash={tx.hash}
                    chain="EVM"
                />
            );
            await tx.wait();
            listNFT();
            close();
        } catch (e) {
            console.log(e);
        }
    }, [metadata, nft, minBidAmount, buyoutAmount, endTime, timeBuffer, bidBuffer, currency, primaryWallet]);

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-10 focus:outline-none"
            onClose={() => { }}
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full shadow-md shadow-black/80 max-w-md bg-gray-600 rounded-xl p-6 backdrop-blur-2xl text-sm duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                    >
                        <DialogTitle as="h3" className="text-base/7 font-medium text-white flex">
                            <div className="flex-1">Create Auction</div>
                            <div onClick={close} className="cursor-pointer">{CloseSVG}</div>
                        </DialogTitle>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex">
                                <div className="rounded-xl overflow-hidden h-[100px]">
                                    <img src={image} className="w-[100px] h-[100px] object-cover" />
                                </div>
                                <div className="flex justify-center items-center h-full w-full text-xl font-bold">
                                    {metadata?.name}
                                </div>
                            </div>
                            <div>Currency</div>
                            <div className="relative">
                                <Select
                                    value={currency}
                                    onChange={e => setCurrency(Number(e.target.value))}
                                    className="h-[40px] rounded-md bg-white/10 border px-2 w-full"
                                >
                                    {
                                        currenyList.map((coin, i) => (
                                            <option className="text-black" value={i} key={i}>
                                                {coin.symbol}
                                            </option>
                                        ))
                                    }
                                </Select>
                            </div>
                            <div>End time</div>
                            <Input
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                type="datetime-local"
                                className="h-[40px] rounded-md bg-white/10 border px-2"
                            />
                            <div>Min bid amount</div>
                            <StyledInput
                                value={minBidAmount}
                                setValue={setMinBidAmount}
                                className="h-[40px]"
                            />
                            <div>Buy out amount</div>
                            <StyledInput
                                value={buyoutAmount}
                                setValue={setBuyoutAmount}
                                className="h-[40px]"
                            />
                            <div>Time buffer in seconds</div>
                            <StyledInput
                                value={timeBuffer}
                                setValue={setTimeBuffer}
                                className="h-[40px]"
                            />
                            <div>Bid buffer percentage</div>
                            <StyledInput
                                value={bidBuffer}
                                setValue={setBidBuffer}
                                className="h-[40px]"
                            />
                            <Button
                                onClick={createAuction}
                                type={"primary"}
                                border="1px"
                                itemClassName="p-[8px_16px]"
                                className="h-[44px]"
                            >
                                Submit
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default EvmAuctionDlg;