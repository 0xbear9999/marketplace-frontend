"use client"
import { Token, TOKENS } from "@/config/tokens";
import { metadataService } from "@/services/api.service";
import { EvmNFT, Metadata } from "@/types";
import { getCollectionContract, getErc20TokenContract, getMarketplaceContract } from "@/utils/contracts";
import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { formatUnits, parseUnits } from "ethers";
import { FC, useCallback, useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton'
import Button from "../Button";
import { toast } from "react-toastify";
import Notification from "../Notification";


interface Props {
    nft: EvmNFT;
}

const EvmListedCard: FC<Props> = ({ nft }) => {
    const { primaryWallet } = useDynamicContext();
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<Metadata>();
    const [token, setToken] = useState<Token>();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        (async () => {
            if (!primaryWallet) return;
            if (primaryWallet.chain !== 'EVM') return;
            setLoading(true);
            const provider = await getWeb3Provider(primaryWallet as any);
            const contract = getCollectionContract(nft.address, provider, nft.chainId);
            const tokenUri = await contract.tokenURI(nft.tokenId);
            const metadata = await metadataService.fetch(tokenUri);
            setMetadata(metadata);
            setLoading(false);
        })();
        const currency = TOKENS[nft.chainId].find(item => item.address === nft.currency);
        setToken(currency);
    }, [nft, primaryWallet]);

    const handleBuy = useCallback(async () => {
        if (!primaryWallet) return;
        if (primaryWallet.chain !== 'EVM') return;
        if (nft.type === 'auction') {
            
        } else if (nft.type === 'listing') {
            try {
                const provider = await getWeb3Provider(primaryWallet as any);
                const network = await provider.getNetwork();
                const chainId = network.chainId;
                const signer = await getSigner(primaryWallet as any);
                const contract = getMarketplaceContract(signer, Number(chainId));
                const isNative = nft.currency === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                setPending(true);
                if (isNative) {
                    const tx = await contract.buyFromListing(
                        nft.id,
                        primaryWallet.address,
                        1,
                        nft.currency,
                        {
                            value: nft.price
                        }
                    );
                    toast(
                        <Notification
                            type={"loading"}
                            msg="Transaction submitted"
                            txhash={tx.hash}
                            chain="EVM"
                        />
                    );
                } else {
                    const tokenContract = getErc20TokenContract(nft.currency, signer, Number(chainId));
                    const allowance = await tokenContract.allowance(primaryWallet.address, await contract.getAddress());
                    if (allowance < nft.price) {
                        const tx = await tokenContract.approve(await contract.getAddress(), nft.price);
                        await tx.wait();
                    }
                    const tx = await contract.buyFromListing(
                        nft.id,
                        primaryWallet.address,
                        1,
                        nft.currency
                    );
                    await tx.wait();
                    toast(
                        <Notification
                            type={"loading"}
                            msg="Transaction submitted"
                            txhash={tx.hash}
                            chain="EVM"
                        />
                    );
                }
                setPending(false);
            } catch (e) {
                console.log(e);
                setPending(false);
            }
        }
    }, [nft, primaryWallet, token])

    return (
        <div className="bg-gray-600 rounded-xl p-4 max-w-[300px] w-full">
            <div className="rounded-xl overflow-hidden h-[280px]">
                {
                    loading ? (
                        <Skeleton width={280} height={280} baseColor="#202020" highlightColor="#444" />
                    ) : (
                        <img src={metadata?.image} className="w-[280px] h-[280px] object-cover" />
                    )
                }
            </div>
            <div className="mt-4 flex flex-col gap-2">
                {
                    loading ? (
                        <Skeleton height={25} width={100} baseColor="#202020" highlightColor="#444" />
                    ) : (
                        <div className="text-xl font-bold">{metadata?.name}</div>
                    )
                }
                <div className="flex text-base text-gray-300">
                    <div className="flex-1">Price</div>
                    {
                        loading ? (
                            <Skeleton height={25} width={100} baseColor="#202020" highlightColor="#444" />
                        ) : (
                            <div>{`${formatUnits(nft.price, token?.decimals)} ${token?.symbol}`}</div>
                        )
                    }
                </div>
                <Button
                    onClick={handleBuy}
                    type={"primary"}
                    border="1px"
                    itemClassName="p-[8px_16px]"
                    className="h-[44px]"
                >
                    {nft.type === 'auction' ? 'Bid' : 'Buy Now'}
                </Button>
            </div>
        </div>
    );
}

export default EvmListedCard;