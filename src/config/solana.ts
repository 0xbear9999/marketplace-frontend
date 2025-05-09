
export const SOL_STABLE_COINS = [
    {
        name: 'USDT',
        symbol: "USDT",
        // mint: "GTBMdNFQwVFse31m3KgGhrUYmzGN4aD6A5gBbC5cLANK",
        mint: "9saeTATj4rb33Kik8sSccWWUUuC3f65Db8DYrf1L7i4e",
        decimals: 6,
    },
    {
        name: 'USDC',
        symbol: 'USDC',
        mint: "ABg3DjPV7j3CrJKzU2ssWnLj5h7sXXEFPC4rirYUjSWf",
        decimals: 6,
    }
]

export const findSymbol = (mint: string) => {
    const index = SOL_STABLE_COINS.findIndex(item => item.mint = mint);
    return SOL_STABLE_COINS[index].symbol;
}