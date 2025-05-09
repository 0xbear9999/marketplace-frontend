"use client"
import NFTCard from '@/components/NFTCard/NFTCard';
import SimpleNFTCard from '@/components/SimpleNFTCard/SimpleNFTCard';
import { auctionService, collectionService } from '@/services/api.service';
import { Listed } from '@/types';
import { getNFTByMint } from '@/utils/metaplex.utils';
import { AnchorProvider, Idl, Program, utils } from '@coral-xyz/anchor';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Nft } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useContext, useEffect, useState, Suspense } from 'react';
import IDL from '@/idl/mint_nft.json';
import Image from 'next/image';
import { ClipboardIcon } from '@heroicons/react/24/outline'
import { getSplDecimals, getSplSymbol } from '@/utils/spl.utils';
import { findSymbol } from '@/config/solana';
import { calculateTimeLeft, sleep } from '@/utils/time.utils';
import Button from '@/components/Button';
import { createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TransactionMessage } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'react-toastify';
import Notification from '@/components/Notification';
import { URLS } from '@/config/urls';
import { SolNFTContext } from '@/hooks/SolNFTContextProvider';

function NFTOverviewContent() {
    const [nft, setNft] = useState<Nft>();
    const [listingInfo, setListingInfo] = useState<Listed>();
    const searchParams = useSearchParams();
    const { primaryWallet } = useDynamicContext();
    const [mint, setMint] = useState('');
    const [currencyMint, setCurrencyMint] = useState('');
    const [start, setStart] = useState(Math.floor(Date.now() / 1000));
    const [end, setEnd] = useState(Math.floor(Date.now() / 1000));
    const [minBid, setMinBid] = useState(0);
    const [maxBid, setMaxBid] = useState(0);
    const [imageUrl, setImageUri] = useState('/logo.webp');
    const [creator, setCreator] = useState('');
    const [bidAmount, setBidAmount] = useState(0);
    const [time, setTime] = useState({
        days: '00',
        hours: '00',
        mins: '00',
        sec: '00'
    });

    const router = useRouter();
    const { fetchCollection } = useContext(SolNFTContext);

    const approve = useCallback(async () => {
        try {
            if (!primaryWallet) return;
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            if (!connection || !listingInfo) return;
            // @ts-ignore
            const signer: ISolana = await primaryWallet.getSigner();
            const payer = new PublicKey(primaryWallet.address);
            const wallet = {
                signTransaction: signer.signTransaction,
                signAllTransactions: signer.signAllTransactions,
                publicKey: new PublicKey(primaryWallet.address)
            }
            const provider = new AnchorProvider(
                connection,
                wallet
            )
            const program = new Program(IDL as Idl, provider);
            const auctionBid = PublicKey.findProgramAddressSync(
                [
                    utils.bytes.utf8.encode('auction-bid'),
                    new PublicKey(listingInfo.account).toBuffer(),
                ],
                program.programId
            )[0];
            // @ts-ignore
            const auctionBidAccount = await program.account.auctionBid.fetch(auctionBid);
            const bidder = auctionBidAccount.bidder;
            const bidderAssetAccount = getAssociatedTokenAddressSync(
                new PublicKey(mint),
                bidder
            );
            const creatorCurrencyAccount = getAssociatedTokenAddressSync(
                new PublicKey(currencyMint),
                new PublicKey(creator)
            );
            const instructions = [];
            try {
                await getAccount(connection, bidderAssetAccount);
            } catch {
                const ixn = createAssociatedTokenAccountInstruction(
                    payer,
                    bidderAssetAccount,
                    bidder,
                    new PublicKey(mint),
                );
                instructions.push(ixn);
            }
            try {
                await getAccount(connection, creatorCurrencyAccount);
            } catch {
                const ixn = createAssociatedTokenAccountInstruction(
                    payer,
                    creatorCurrencyAccount,
                    new PublicKey(creator),
                    new PublicKey(currencyMint),
                );
                instructions.push(ixn);
            }
            const ixn = await program.methods.closeAuctionForBidder().accounts({
                auction: new PublicKey(listingInfo.account),
                bidder,
                currencyMint: new PublicKey(currencyMint),
                assetMint: new PublicKey(mint),
                bidderAssetAccount,
                creatorCurrencyAccount,
                tokenProgramAsset: TOKEN_PROGRAM_ID,
                tokenProgramCurrency: TOKEN_PROGRAM_ID
            }).instruction();
            const blockhash = await connection.getLatestBlockhash();
            instructions.push(ixn);
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
                            msg="Auction closed Successfully"
                            txhash={res.signature}
                            chain="solana"
                        />
                    );
                    await auctionService.delete(listingInfo._id);
                    await sleep(5000);
                    fetchCollection();   
                    router.push(URLS.collection)
                })
                .catch((reason: any) => {
                    console.error(reason);
                });
        } catch (e) {
            console.log(e);
        }
    }, [primaryWallet, listingInfo]);


    useEffect(() => {
        (async () => {
            const mintString = searchParams.get('mint');
            if (!mintString || !primaryWallet) return;
            const connection = (primaryWallet as any).connector.getConnection();
            if (!connection) return;
            const info = await getNFTByMint(connection, new PublicKey(mintString));
            setNft(info as Nft);
            const listed: Listed = await auctionService.auctionByMint(mintString);
            setListingInfo(listed);
            const program = new Program(IDL as Idl, { connection });
            const auction = new PublicKey(listed.account);
            // @ts-ignore
            const auctionAccount = await program.account.auction.fetch(auction);
            setMint(mintString);
            setCurrencyMint(auctionAccount.currencyMint.toBase58());
            const decimals = await getSplDecimals(connection, auctionAccount.currencyMint);
            setStart(Number(auctionAccount.startTime));
            setEnd(Number(auctionAccount.endTime));
            setMinBid(Number(auctionAccount.minBidAmount) / (10 ** decimals));
            setMaxBid(Number(auctionAccount.buyoutBidAmount) / (10 ** decimals));
            setCreator(auctionAccount.creator.toBase58());
            const auctionBid = PublicKey.findProgramAddressSync(
                [
                    utils.bytes.utf8.encode('auction-bid'),
                    auction.toBuffer(),
                ],
                program.programId
            )[0];
            // @ts-ignore
            const auctionBidAccount = await program.account.auctionBid.fetch(auctionBid);
            setBidAmount(Number(auctionBidAccount.bidAmount) / (10 ** decimals));
        })();
    }, [searchParams, primaryWallet]);

    useEffect(() => {
        (async () => {
            if (!nft || !primaryWallet) return;
            const { image } = await collectionService.getImageUri(nft.uri);
            setImageUri(image || '');
        })();
    }, [nft, primaryWallet]);

    useEffect(() => {
        const interval = setInterval(() => {
            const timeLeft = calculateTimeLeft(end);
            setTime(timeLeft);
        }, 1000);
        return () => clearInterval(interval);
    }, [end]);

    return (
        <div className='min-h-[600px] container flex justify-center py-[100px]'>
            {
                !!nft && (
                    <div className='lg:w-[900px] w-full flex lg:flex-row flex-col lg:gap-12 gap-8'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center bg-black/40 rounded-xl overflow-hidden'>
                                <Image
                                    src={imageUrl}
                                    alt='nft'
                                    width={400}
                                    height={500}
                                />
                            </div>
                            <div className='text-2xl font-bold mt-8'>Details</div>
                            <div className='flex'>
                                <div className='flex-1'>Network</div>
                                <div className='font-bold'>Solana</div>
                            </div>
                            <div className='flex'>
                                <div className='flex-1'>Mint address</div>
                                <div className='font-bold flex items-center gap-1'>
                                    <div>{`${nft.address.toBase58().slice(0, 5)}...${nft.address.toBase58().slice(-5)}`}</div>
                                    <div onClick={() => navigator.clipboard.writeText(nft.address.toBase58())}>
                                        <ClipboardIcon className='w-5 h-5 cursor-pointer' />
                                    </div>
                                </div>
                            </div>
                            <div className='flex'>
                                <div className='flex-1'>Owner</div>
                                <div className='font-bold flex items-center gap-1'>
                                    <div>{`${creator.slice(0, 5)}...${creator.slice(-5)}`}</div>
                                    <div onClick={() => navigator.clipboard.writeText(creator)}>
                                        <ClipboardIcon className='w-5 h-5 cursor-pointer' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4 flex-1'>
                            <div className='text-4xl font-bold'>{nft.name}</div>
                            <div className='flex'>
                                <div className='flex-1'>Min Price</div>
                                <div>{`${minBid} ${!!currencyMint && findSymbol(currencyMint)}`}</div>
                            </div>
                            <div className='flex'>
                                <div className='flex-1'>Buy out Price</div>
                                <div>{`${maxBid} ${!!currencyMint && findSymbol(currencyMint)}`}</div>
                            </div>
                            <div className='border-t' />
                            <div className='flex gap-2'>
                                <div className='flex flex-col gap-2 flex-1'>
                                    <div className='text-xl font-bold'>Current bid</div>
                                    <div>{`${bidAmount} ${!!currencyMint && findSymbol(currencyMint)}`}</div>
                                </div>
                                <div className='flex gap-2 flex-1'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='text-xl font-bold'>Deadline</div>
                                        <div className='flex gap-1 text-xl items-center'>
                                            <div>{time.days}</div>
                                            <div className='text-sm text-white/50'>day</div>
                                            <div>{time.hours}</div>
                                            <div className='text-sm text-white/50'>h</div>
                                            <div>{time.mins}</div>
                                            <div className='text-sm text-white/50'>m</div>
                                            <div>{time.sec}</div>
                                            <div className='text-sm text-white/50'>s</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-16">
                                <Button
                                    onClick={approve}
                                    type={"primary"}
                                    className="w-full h-[48px]"
                                >
                                    {"Confirm"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default function NFTOverviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NFTOverviewContent />
        </Suspense>
    );
}
