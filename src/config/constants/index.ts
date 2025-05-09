import { NFTStorage } from "nft.storage";

export const NFT_STORAGE = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY2MEQ1OGJFNTQ5MkY2N2E5MkRBZjdEZTFjQTkzN2NGODBCMWJhMzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMTcwMTA5NTI3MywibmFtZSI6IkNITVBaIn0.SEiO-9M_gLmiPQMqH4jsxOM9vI56Y6h6Ibp-y0WIYSo",
});

export const COLLECTION_FACTORY_GRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/pudgefury/chmpz-collection-factory-test";
export const MARKETPLACE_GRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/pudgefury/chmpz-marketplace-test";

export const GAS_MULTIPLE = 2;

export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";


export const NFT_NAME_CHAR_LIMIT = 100;
export const NFT_DESCRP_CHAR_LIMIT = 500;
export const NFT_TRAIT_CHAR_LIMIT = 50;
