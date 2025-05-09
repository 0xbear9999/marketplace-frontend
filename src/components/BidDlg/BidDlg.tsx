"use client"
import { CloseSVG } from "@/assets/svgs";
import { Dialog, DialogPanel, DialogTitle, Input } from "@headlessui/react";
import { FC, useCallback, useState } from "react";
import Button from "../Button";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import IDL from '@/idl/mint_nft.json';
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, BN, Idl, Program, utils } from "@coral-xyz/anchor";
import { Listed } from "@/types";
import { getSplDecimals } from "@/utils/spl.utils";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import Notification from "../Notification";
import { sleep } from "@/utils/time.utils";


interface Props {
    isOpen: boolean;
    close: () => void;
    listed: Listed | undefined;
}

const BidDlg: FC<Props> = ({ isOpen, close, listed }) => {
    const [amount, setAmount] = useState('0');

    const { primaryWallet } = useDynamicContext();

    const bidHandler = useCallback(async () => {
        try {
            console.log("listed: ", listed, primaryWallet);
            if (!primaryWallet || !listed) return;
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            console.log("connection: ", connection);
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
            const auction = new PublicKey(listed.account);
            console.log("auction: ", auction.toBase58());
            // @ts-ignore
            const auctionAccount = await program.account.auction.fetch(auction);
            console.log("auctionAccount: ", auctionAccount);
            const currencyMint: PublicKey = auctionAccount.currencyMint;
            console.log("currencyMint: ", currencyMint.toBase58());
            const bidderCurrencyAccount = getAssociatedTokenAddressSync(
                currencyMint,
                payer
            );
            console.log("bidderCurrencyAccount: ", bidderCurrencyAccount.toBase58());
            const auctionBid = PublicKey.findProgramAddressSync(
                [
                    utils.bytes.utf8.encode("auction-bid"),
                    auction.toBuffer()
                ],
                program.programId
            )[0];
            console.log("auctionBid: ", auctionBid.toBase58());
            let oldBidder = null;
            let oldBidderCurrencyAccount = bidderCurrencyAccount;
            try {
                // @ts-ignore
                const auctionBidAccount = await program.account.auctionBid.fetch(auctionBid);
                const oldBidder: PublicKey = auctionBidAccount.bidder;
                oldBidderCurrencyAccount = getAssociatedTokenAddressSync(
                    currencyMint,
                    oldBidder
                );
            } catch (e) {
                console.log(e)
            }
            const decimals = await getSplDecimals(connection, currencyMint);
            const ixn = await program.methods.bidInAuction(
                new BN(Number(amount) * (10 ** decimals))
            ).accounts({
                currencyMint,
                bidderCurrencyAccount,
                oldBidderCurrencyAccount,
                auction,
                tokenProgram: TOKEN_PROGRAM_ID
            }).instruction();
            const instructions = [ixn];
            const blockhash = await connection.getLatestBlockhash('finalized');
            const messageV0 = new TransactionMessage({
                instructions,
                payerKey: payer,
                recentBlockhash: blockhash.blockhash,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            const signedTxn = await signer.signTransaction(transaction);
            const res = await connection.sendTransaction(signedTxn, {preflightCommitment: "processed"});
            toast(
                <Notification
                    type={"success"}
                    msg="Bid Successfully"
                    txhash={res}
                    chain="solana"
                />
            );
            await sleep(5000);
            close();
        } catch (e) {
            console.log("e: ", e);
            if (JSON.stringify(e).includes('NotWinBid')) {
                toast(
                    <Notification
                        type={"success"}
                        msg="Not win bid!"
                        chain="solana"
                    />
                );
            }
            close();
        }
        setAmount('0');
    }, [amount, listed, close])

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-10 focus:outline-none"
            onClose={close}
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full shadow-md shadow-black/80 max-w-md bg-amber-500/80 rounded-md p-6 backdrop-blur-2xl text-sm duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                    >
                        <DialogTitle as="h3" className="text-base/7 font-medium text-white flex">
                            <div className="flex-1">Bid</div>
                            <div onClick={close} className="cursor-pointer">{CloseSVG}</div>
                        </DialogTitle>
                        <div className="mt-4 flex flex-col gap-2">
                            <Input
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="h-[40px] rounded-md bg-white/30 border px-2 text-right"
                            />
                            <Button
                                type={"primary"}
                                border="1px"
                                itemClassName="p-[8px_16px]"
                                className="h-[44px]"
                                onClick={bidHandler}
                            >
                                Bid
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default BidDlg;