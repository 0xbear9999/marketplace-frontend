import { EXPLORER_API_URL } from "@/config/chains";
import { COLLECTION_FACTORY_GRAPH_URL, MARKETPLACE_GRAPH_URL } from "@/config/constants";
import { getMarketplaceContract } from "@/utils/contracts";
import axios from "axios";

export async function getTokenbalances(account: string, chainId: number) {
    try {
        const result = await axios.get(
            `${EXPLORER_API_URL[chainId as any]}?module=account&action=tokenlist&address=${account}`
        );
        return result.data.result;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function fetchUserCollectionBalance(
    account: string,
    chainId: number
) {
    try {
        const result = await getTokenbalances(account, chainId);
        const collections: any = {};
        result
            .filter((token: any) => token.type === "ERC-721")
            .map((token: any) => {
                collections[token.contractAddress] = { ...token, address: token.contractAddress };
            });
        return collections;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function fetchCreatedCollections(
    account: string,
    chainId: number
) {
    try {
        const subgraph_endpoint = COLLECTION_FACTORY_GRAPH_URL;
        const response = await axios.post(subgraph_endpoint, {
            query: `{
          collections(
            first: 1000
            where: {creator: "${account?.toLowerCase()}"}
          ) {
            id
            name
            royaltyFraction
            royaltyReceiver
            symbol
            creator
            address
          }
        }`,
        });
        return response.data.data.collections;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getUserNFTs(
    address: string,
    account: string,
    chainId: number
) {

    try {
        let items: any = [];
        let blockNumber;
        let index;
        let response: any;
        do {
            blockNumber = response ? response.next_page_params.block_number : 100000000;
            index = response ? response.next_page_params.index : 0;
            response = await axios.get(`${EXPLORER_API_URL[chainId as number]
                }/v2/addresses/${account}/token-transfers?type=ERC-721&token=${address}&block_number=${blockNumber}&index=${index}
      `);
            response = response.data;
            items = [...items, ...response.items];
        } while (response.next_page_params);

        const ownedNFTs: any = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].to.hash.toLowerCase() !== account?.toLowerCase()) continue;
            const isExisting = items.find(
                (tx: any) =>
                    tx.from.hash.toLowerCase() === account?.toLowerCase() &&
                    new Date(tx.timestamp).getTime() > new Date(items[i].timestamp).getTime() &&
                    items[i].total.token_id === tx.total.token_id
            );
            if (!isExisting) ownedNFTs.push(parseInt(items[i].total.token_id));
        }

        return ownedNFTs.map((tokenId: any) => {
            return { address, chainId, tokenId };
        });
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getAuctionList(provider: any, chainId: number) {
    try {
        const contract = getMarketplaceContract(provider, chainId);
        const auctionCnt = await contract.totalAuctions();
        let auctionList = [];
        for (let i = 0; i < Number(auctionCnt); i++) {
            const auction = await contract.getAuction(i);
            auctionList.push({
                id: Number(auction.auctionId),
                creator: auction.auctionCreator,
                contract: auction.assetContract,
                tokenId: auction.tokenId,
                currency: auction.currency,
                minBidAmount: auction.minimumBidAmount,
                buyoutAmount: auction.buyoutBidAmount,
                timeBuffer: Number(auction.timeBufferInSeconds),
                bidBuffer: Number(auction.bidBufferBps),
                startTime: Number(auction.startTimestamp),
                endTime: Number(auction.endTimestamp),
                tokenType: auction.tokenType,
                status: auction.status
            });
        }
        return auctionList;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getListingList(provider: any, chainId: number) {
    try {
        const contract = getMarketplaceContract(provider, chainId);
        const listCnt = await contract.totalListings();
        let listingList = [];
        for (let i = 0; i < Number(listCnt); i++) {
            const listing = await contract.getListing(i);
            listingList.push({
                id: Number(listing.listingId),
                creator: listing.listingCreator,
                contract: listing.assetContract,
                tokenId: listing.tokenId,
                quantity: listing.quantity,
                currencies: listing.currencies,
                prices: listing.prices,
                startTime: Number(listing.startTimestamp),
                endTime: Number(listing.endTimestamp),
                reserved: listing.reserved,
                tokenType: listing.tokenType,
                status: listing.status
            });
        }
        return listingList;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getListedCollectionNFTs(provider: any, account: string, chainId: number) {
    try {
        const auctionList = await getAuctionList(provider, chainId);
        const listingList = await getListingList(provider, chainId);
        let temp = [];
        for (const auction of auctionList) {
            if (auction.creator.toLowerCase() === account.toLowerCase()) {
                temp.push({
                    address: auction.contract as string,
                    tokenId: Number(auction.tokenId),
                    type: 'auction',
                    chainId,
                    id: auction.id,
                    price: auction.minBidAmount,
                    currency: auction.currency
                });
            }
        }
        for (const listing of listingList) {
            if (listing.creator.toLowerCase() === account.toLowerCase()) {
                temp.push({
                    address: listing.contract as string,
                    tokenId: Number(listing.tokenId),
                    type: 'listing',
                    chainId,
                    id: listing.id,
                    price: listing.prices[0],
                    currency: listing.currencies[0]
                });
            }
        }
        return temp;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function getAuctionNFT(provider: any, chainId: number, id: number) {
    try {
        const contract = getMarketplaceContract(provider, chainId);
        const auction = await contract.getAuction(id);
        return {
            id: Number(auction[0]),
            creator: auction[1],
            contract: auction[2],
            tokenId: auction[3],
            currency: auction[4],
            minBidAmount: auction[5],
            buyoutAmount: auction[6],
            timeBuffer: Number(auction[7]),
            bidBuffer: Number(auction[8]),
            startTime: Number(auction[9]),
            endTime: Number(auction[10]),
            tokenType: auction[11],
            status: auction[12]
        }
    } catch (e) {
        console.log(e);
    }
}

export async function getListingNFT(provider: any, chainId: number, id: number) {
    const contract = getMarketplaceContract(provider, chainId);
    const listing = await contract.getListing(id);
    return {
        id: Number(listing[0]),
        creator: listing[1],
        contract: listing[2],
        tokenId: listing[3],
        quantity: listing[4],
        currencies: listing[5],
        prices: listing[6],
        startTime: Number(listing[7]),
        endTime: Number(listing[8]),
        reserved: listing[9],
        tokenType: listing[10],
        status: listing[11]
    }
}

export async function getBidHistory(account: string) {
    try {
        const result = await axios.post(MARKETPLACE_GRAPH_URL, {
            query: `{
          auctions(first: 1000) {
            bids(first: 1000, where: {bidder: "${account}"}) {
              auctionId
              bidAmount
              bidder
              id
              timestamp
            }
            assetContract
            auctionCreator
            auctionId
            bidBufferBps
            buyoutBidAmount
            currency
            endTimestamp
            id
            minimumBidAmount
            paidOutAuctionTokens
            paidOutBidAmount
            quantity
            startTimestamp
            status
            timeBufferInSeconds
            tokenId
            tokenType
          }
        }`,
        });
        const bids: any = [];
        result.data.data.auctions.map((auction: any) => auction.bids.map((bid: any) => bids.push({})));
        return result.data.data.auctions;
    } catch (e) {
        console.log(e);
        return [];
    }
}


export async function getTransactionHistory(account: string) {
    try {
        const response = await Promise.all([
            axios.post(MARKETPLACE_GRAPH_URL, {
                query: `{
          listings(first: 1000, where: {listingCreator: "${account}"}) {
            txHash
            tokenId
            tokenType
            status
            id
            assetContract
            currencies
            prices
            listingCreator
            timestamp
          }
          auctions(first: 1000, where: {auctionCreator: "${account}"}) {
            auctionCreator
            assetContract
            id
            currency
            buyoutBidAmount
            timestamp
            tokenId
            txHash
            tokenType
            status
          }
          bids(first: 1000, where: {bidder: "${account}"}) {
            id
            bidder
            bidAmount
            timestamp
            txHash
            auction {
              currency
              tokenId
              assetContract
            }
          }
          sales(first: 1000, where: {buyer: "${account}"}) {
            txHash
            timestamp
            totalPricePaid
            currency
            id
            buyer
            listing {
              listingCreator
              tokenId
              assetContract
            }
          }
        }`,
            }),
            axios.post(MARKETPLACE_GRAPH_URL, {
                query: `{
          sales(first: 1000, where: { listing_: {listingCreator: "${account}"}}) {
            txHash
            timestamp
            totalPricePaid
            currency
            id
            buyer
            listing {
              listingCreator
              tokenId
              assetContract
            }
          }
        }`,
            }),
        ]);
        const result = response[0];
        const buySale = response[0].data.data.sales;
        const sellSale = response[1].data.data.sales;
        const listings = result.data.data.listings.map((listing: any) => ({
            ...listing,
            creator: listing.listingCreator,
            currency: listing.currencies[0],
            price: listing.prices[0],
            type: "Listed",
            status: "history." + listing.status,
        }));

        const auctions = result.data.data.auctions.map((auction: any) => ({
            ...auction,
            creator: auction.auctionCreator,
            price: auction.buyoutBidAmount,
            type: "Listed",
            status: "history." + auction.status,
        }));

        const bids = result.data.data.bids.map((bid: any) => ({
            ...bid,
            ...bid.auction,
            creator: bid.bidder,
            price: bid.bidAmount,
            type: "Bid",
            status: "history.PLACED A BID",
        }));

        const sales = [...buySale, ...sellSale].map((sale: any) => ({
            ...sale,
            ...sale.listing,
            creator: sale.listing.listingCreator,
            price: sale.totalPricePaid,
            type: "Sale",
            status: sale.buyer === account ? "history.BOUGHT" : "history.SOLD",
        }));

        return [...listings, ...auctions, ...bids, ...sales].sort(
            (a: any, b: any) => b.timestamp - a.timestamp
        );
    } catch (e) {
        console.log(e);
        return [];
    }
}