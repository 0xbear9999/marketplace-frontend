

export const getSolanaTxnLink = (signature: string) => {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}