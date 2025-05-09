
export const TOKENS: Record<number, Token[]> = {
  11155111: [
    {
      chainId: 11155111,
      address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 18,
      logo: "/images/tether.png",
    },
    {
      chainId: 11155111,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logo: "/images/eth.svg",
    },
  ],
};

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
}
