import { SOL_STABLE_COINS } from "@/config/solana";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Dialog, DialogPanel, DialogTitle, Input, Select } from "@headlessui/react";
import { Nft } from "@metaplex-foundation/js";
import Image from "next/image";
import { FC, useCallback, useContext, useState } from "react";
import StyledInput from "../StyledInput";
import { CloseSVG } from "@/assets/svgs";
import Button from "../Button";
import { PublicKey } from "@solana/web3.js";
import IDL from '@/idl/mint_nft.json';
import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { getSplDecimals } from "@/utils/spl.utils";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { auctionService } from "@/services/api.service";
import { toast } from "react-toastify";
import Notification from "../Notification";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";


interface Props {
    close: () => void;
    isOpen: boolean;
    nft: Nft;
    image: string;
}

const ListingDlg:FC<Props> = ({ isOpen, close, nft, image }) => {
    const [buyoutAmount, setBuyoutAmount] = useState('0');
    const [endTime, setEndTime] = useState('');
    const [currency, setCurrency] = useState(SOL_STABLE_COINS[0].mint);

    const { primaryWallet } = useDynamicContext();
    const { listingNFT } = useContext(SolNFTContext);

    const createListing = useCallback(async () => {
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
            // @ts-ignore
            const assetMint = nft.mintAddress as PublicKey;
            const decimals = await getSplDecimals(connection, new PublicKey(currency));
            const assetAccount = getAssociatedTokenAddressSync(
                assetMint,
                payer
            );
            const directListingKeypair = Keypair.generate();
            const directListing = directListingKeypair.publicKey;
            const ixn = await program.methods.createDirectListing(
                new BN(1),
                new BN(1),
                new BN(Number(buyoutAmount) * (10 ** decimals)),
                new BN(Math.floor(Date.now() / 1000)),
                new BN(Math.floor(new Date(endTime).getTime() / 1000))
            ).accounts({
                directListing,
                assetMint,
                currencyMint: new PublicKey(currency),
                assetAccount,
                tokenProgram: TOKEN_PROGRAM_ID
            }).signers([directListingKeypair]).instruction();
            instructions.push(ixn);
            const blockhash = await connection.getLatestBlockhash('finalized');
            const messageV0 = new TransactionMessage({
                instructions,
                payerKey: payer,
                recentBlockhash: blockhash.blockhash,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            transaction.sign([directListingKeypair]);
            const signedTxn = await signer.signTransaction(transaction);
            await connection.sendTransaction(signedTxn, { preflightCommitment: 'finalized' })
                .then(async (res: any) => {
                    await auctionService.create({
                        account: directListing.toBase58(),
                        mint: assetMint.toBase58(),
                        creator: primaryWallet.address,
                        collectionMint: nft.collection?.address.toBase58(),
                        type: 'listing',
                        price: Number(buyoutAmount),
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
                    listingNFT(nft.address);
                    close();
                })
                .catch((reason: any) => {
                    console.error(reason);
                });

        } catch (e) {
            console.log(e)
        }
    }, [nft, buyoutAmount, endTime, primaryWallet, currency]);

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
                            <div className="flex-1">Create Listing</div>
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
                            <div>Listing price</div>
                            <StyledInput
                                value={buyoutAmount}
                                setValue={setBuyoutAmount}
                                className="h-[40px]"
                            />
                            <Button
                                onClick={createListing}
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

export default ListingDlg;