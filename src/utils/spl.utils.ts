import { getAccount, getAssociatedTokenAddressSync, getMint, NATIVE_MINT, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metadata, Metaplex, Nft, Sft } from "@metaplex-foundation/js";


export const getSplTokenBalance = async (
  connection: Connection,
  mint: PublicKey,
  address: PublicKey
) => {
  try {
    if (mint.toBase58() === NATIVE_MINT.toBase58()) {
      const balance = await connection.getBalance(address);
      return balance;
    }
    const tokenAccount = getAssociatedTokenAddressSync(mint, address);
    const tokenAccountInfo = await getAccount(connection, tokenAccount);
    return Number(tokenAccountInfo.amount);
  } catch {
    try {
      const tokenAccount = getAssociatedTokenAddressSync(
        mint,
        address,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      const tokenAccountInfo = await getAccount(
        connection,
        tokenAccount,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      return Number(tokenAccountInfo.amount);
    } catch {
      return 0;
    }
  }
};

export const getSplDecimals = async (
    connection: Connection,
    mint: PublicKey
) => {
    try {
        const account = await getMint(
            connection,
            mint
        );
        return account.decimals;
    } catch {
        const account = await getMint(
            connection,
            mint,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        return account.decimals
    }
}

export const getSplSymbol = async (connection: Connection, mintAddress: PublicKey) => {
  const metaplex = Metaplex.make(connection);
  const sft = await metaplex.nfts().findByMint({mintAddress});
  return sft.symbol;
}

