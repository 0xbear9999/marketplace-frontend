"use client"
import { Dialog, DialogPanel, DialogTitle, Input, Select } from "@headlessui/react";
import { FC, useCallback, useContext, useState } from "react";
import StyledInput from "../StyledInput";
import Button from "../Button";
import { CloseSVG } from "@/assets/svgs";
import { Nft } from "@metaplex-foundation/js";
import Image from "next/image";
import { SOL_STABLE_COINS } from "@/config/solana";
import IDL from '@/idl/mint_nft.json';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { getSplDecimals } from "@/utils/spl.utils";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import Notification from "../Notification";
import { auctionService } from "@/services/api.service";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import { sleep } from "@/utils/time.utils";

interface Props {
    close: () => void;
    isOpen: boolean;
    nft: Nft;
    image: string;
}

const AuctionDlg: FC<Props> = ({ isOpen, close, nft, image }) => {
    const [minBidAmount, setMinBidAmount] = useState('0');
    const [buyoutAmount, setBuyoutAmount] = useState('0');
    const [endTime, setEndTime] = useState('');
    const [timeBuffer, setTimeBuffer] = useState('0');
    const [bidBuffer, setBidBuffer] = useState('0');
    const [currency, setCurrency] = useState(SOL_STABLE_COINS[0].mint);

    const { primaryWallet } = useDynamicContext();
    const { listingNFT } = useContext(SolNFTContext);


    const createAuction = useCallback(async () => {
        try {
            if (!primaryWallet) return;
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            if (!connection) return;
            // @ts-ignore
            const signer: ISolana = await primaryWallet.getSigner();
            const payer = new PublicKey(primaryWallet.address);
            const wallet = {
                signTransaction: signer.signTransaction,
                signAllTransactions: signer.signAllTransactions,
                publicKey: payer
            }
            const provider = new AnchorProvider(
                connection,
                wallet
            );
            const program = new Program(IDL as Idl, provider);
            const instructions = [];
            console.log("NFT--------: ", nft);
            // @ts-ignore
            const assetMint = nft.mintAddress as PublicKey;
            const decimals = await getSplDecimals(connection, new PublicKey(currency));
            const creatorAssetAccount = getAssociatedTokenAddressSync(
                assetMint,
                payer
            );
            const auctionKeypair = Keypair.generate();
            const auction = auctionKeypair.publicKey;
            const ixn = await program.methods.createAuction(
                new BN(1),
                new BN(1),
                new BN(Number(minBidAmount) * (10 ** decimals)),
                new BN(Number(buyoutAmount) * (10 ** decimals)),
                new BN(Number(timeBuffer)),
                new BN(Number(bidBuffer) * 100),
                new BN(Math.floor(Date.now() / 1000)),
                new BN(Math.floor(new Date(endTime).getTime() / 1000))
            ).accounts({
                assetMint,
                currencyMint: new PublicKey(currency),
                creatorAssetAccount,
                auction,
                tokenProgram: TOKEN_PROGRAM_ID
            }).signers([auctionKeypair]).instruction();

            instructions.push(ixn);
            const blockhash = await connection.getLatestBlockhash('finalized');
            const messageV0 = new TransactionMessage({
                instructions,
                payerKey: payer,
                recentBlockhash: blockhash.blockhash,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            transaction.sign([auctionKeypair]);
            const signedTxn = await signer.signTransaction(transaction);
            await connection.sendTransaction(signedTxn, { preflightCommitment: 'finalized' })
                .then(async (res: any) => {
                    await auctionService.create({
                        account: auction.toBase58(),
                        mint: assetMint.toBase58(),
                        creator: primaryWallet.address,
                        collectionMint: nft.collection?.address.toBase58(),
                        price: Number(minBidAmount),
                        currencyMint: currency,
                        amount: 1
                    })
                    toast(
                        <Notification
                            type={"success"}
                            msg="Auction created Successfully"
                            txhash={res.signature}
                            chain="solana"
                        />
                    );
                    await sleep(5000);

                    console.log("NFT: ", nft);
                    // @ts-ignore
                    listingNFT(nft.mintAddress);
                    close();
                })
                .catch((reason: any) => {
                    console.error(reason);
                });

        } catch (e) {
            console.log(e);
        }
    }, [nft, minBidAmount, buyoutAmount, endTime, timeBuffer, bidBuffer, currency, primaryWallet]);

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
                        className="w-full shadow-md shadow-black/80 max-w-md bg-amber-500/80 rounded-md p-6 backdrop-blur-2xl text-sm duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                    >
                        <DialogTitle as="h3" className="text-base/7 font-medium text-white flex">
                            <div className="flex-1">Create Auction</div>
                            <div onClick={close} className="cursor-pointer">{CloseSVG}</div>
                        </DialogTitle>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex">
                                <Image
                                    src={image}
                                    width={150}
                                    height={150}
                                    alt="nft"
                                    className="w-[150px]"
                                />
                                <div className="flex justify-center items-center h-full w-full text-xl font-bold">
                                    {nft.name}
                                </div>
                            </div>
                            <div>Currency</div>
                            <div className="relative">
                                <Select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className="h-[40px] rounded-md bg-white/10 border px-2 w-full"
                                >
                                    {
                                        SOL_STABLE_COINS.map((coin, i) => (
                                            <option className="text-black" value={coin.mint} key={i}>
                                                {coin.symbol}
                                            </option>
                                        ))
                                    }
                                </Select>
                            </div>
                            <div>End time</div>
                            <Input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
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
                                type={"primary"}
                                border="1px"
                                itemClassName="p-[8px_16px]"
                                className="h-[44px]"
                                onClick={createAuction}
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

export default AuctionDlg;