"use client"
import { CloseSVG } from "@/assets/svgs";
import { Listed } from "@/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, useCallback, useEffect, useState } from "react";
import Button from "../Button";
import { getSplSymbol } from "@/utils/spl.utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import IDL from '@/idl/mint_nft.json';
import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import Notification from "../Notification";
import { auctionService } from "@/services/api.service";

interface Props {
    isOpen: boolean;
    close: () => void;
    listed: Listed | undefined;
}

const BuyDlg: FC<Props> = ({ listed, isOpen, close }) => {
    const [currency, setCurrency] = useState('');

    const { primaryWallet } = useDynamicContext();

    useEffect(() => {
        (async () => {
            try {
                if (!primaryWallet || !listed) return;
                // @ts-ignore
                const connection = await primaryWallet.getConnection();
                if (!connection) return;
                const program = new Program(IDL as Idl, { connection });
                const listing = new PublicKey(listed.account);
                // @ts-ignore
                const auctionAccount = await program.account.directListing.fetch(listing);
                const currencyMint: PublicKey = auctionAccount.currencies[0].mint;
                const symbol = await getSplSymbol(connection, currencyMint);
                setCurrency(symbol);

            } catch (e) {
                console.log(e);
            }
        })();
    }, [listed, primaryWallet]);

    const buyHandler = useCallback(async () => {
        try {
            if (!primaryWallet || !listed) return;
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
            const listing = new PublicKey(listed.account);
            // @ts-ignore
            const listingAccount = await program.account.directListing.fetch(listing);
            const currencyMint = listingAccount.currencies[0].mint;
            console.log("currencyMint", currencyMint.toBase58());
            console.log("assetMint", listingAccount.assetMint.toBase58());
            const assetMint = listingAccount.assetMint;
            const buyerCurrencyAccount = getAssociatedTokenAddressSync(
                currencyMint,
                payer
            );
            const buyerAssetAccount = getAssociatedTokenAddressSync(
                assetMint,
                payer
            );
            
            // Check if accounts exist and create them if they don't
            const instructions = [];
            const buyerCurrencyAccountInfo = await connection.getAccountInfo(buyerCurrencyAccount);
            if (buyerCurrencyAccountInfo === null) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    payer,
                    buyerCurrencyAccount,
                    payer,
                    currencyMint
                );
                instructions.push(createATAIx);
            }

            const buyerAssetAccountInfo = await connection.getAccountInfo(buyerAssetAccount);
            if (buyerAssetAccountInfo === null) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    payer,
                    buyerAssetAccount,
                    payer,
                    assetMint
                );
                instructions.push(createATAIx);
            }

            const owner = listingAccount.owner;
            const ownerCurrencyAccount = getAssociatedTokenAddressSync(
                currencyMint,
                owner
            );

            const buyIxn = await program.methods.buyFromListing(new BN(1)).accounts({
                currencyMint,
                assetMint,
                buyerCurrencyAccount,
                buyerAssetAccount,
                ownerCurrencyAccount,
                directListing: listing,
                tokenProgramCurrency: TOKEN_PROGRAM_ID,
                tokenProgramAsset: TOKEN_PROGRAM_ID,
            }).instruction();

            instructions.push(buyIxn);

            const blockhash = await connection.getLatestBlockhash('finalized');
            const messageV0 = new TransactionMessage({
                instructions,
                payerKey: payer,
                recentBlockhash: blockhash.blockhash,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            const signedTxn = await signer.signTransaction(transaction);
            await connection.sendTransaction(signedTxn, { preflightCommitment: 'finalized' })
                .then(async (res: any) => {
                    toast(
                        <Notification
                            type={"success"}
                            msg="Bought Successfully"
                            txhash={res}
                            chain="solana"
                        />
                    );
                    await auctionService.delete(listed._id);
                    close();
                })
        } catch (e) {
            console.log(e);
            toast(
                <Notification
                    type={"error"}
                    msg={"Transaction failed"}
                    chain="solana"
                />
            );
        }
    }, [listed, primaryWallet, currency]);

    return (
        <Dialog
            open={isOpen}
            onClose={close}
            as="div"
            className="relative z-10 focus:outline-none"
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full shadow-md shadow-black/80 max-w-md bg-amber-500/80 rounded-md p-6 backdrop-blur-2xl text-sm duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                    >
                        <DialogTitle as="h3" className="text-base/7 font-medium text-white flex">
                            <div className="flex-1">Are you sure?</div>
                            <div onClick={close} className="cursor-pointer">{CloseSVG}</div>
                        </DialogTitle>
                        <div className="flex">
                            <div className="flex-1">Price</div>
                            <div>{`${listed?.price} ${currency}`}</div>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <Button
                                type={"primary"}
                                border="1px"
                                itemClassName="p-[8px_16px]"
                                className="h-[44px]"
                                onClick={buyHandler}
                            >
                                Buy
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default BuyDlg;