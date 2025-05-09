import {
  CloseSVG,
  ConfirmSVG,
  CrossCircleSVG,
  WhiteLoadingSVG,
} from "@/assets/svgs";
import { getBlockExplorerLink, getEllipsis } from "@/utils/functions";
import { getSolanaTxnLink } from "@/utils/solana.utils";

const Notification = ({
  type,
  msg,
  txhash,
  chain
}: {
  type: string;
  msg: string;
  txhash?: any;
  chain: string
}) => {
  const icons: any = {
    loading: <div className="[&>svg]:w-5 [&>svg]:h-5">{WhiteLoadingSVG}</div>,
    success: (
      <div className="text-[#05C28C] [&>svg]:w-5 [&>svg]:h-5">{ConfirmSVG}</div>
    ),
    fail: (
      <div className="text-[#E3493F] [&>svg]:w-5 [&>svg]:h-5">
        {CrossCircleSVG}
      </div>
    ),
  };
  return (
    <div className="bg-[#055630] text-white rounded p-4 tracking-tight">
      <div className="flex justify-between ">
        <div className="flex">
          <div className="mt-0.5">{icons[type]}</div>
          <div className="ml-4">{msg}</div>
        </div>
        <div className="text-[#fff] ml-4 mt-1.5 [&>svg]:h-3 [&>svg]:w-3 transition hover:text-white">
          {CloseSVG}
        </div>
      </div>
      {txhash ? (
        <a
          href={chain !== 'solana' ? getBlockExplorerLink(txhash, "transaction") : getSolanaTxnLink(txhash)}
          target="_blank"
          className="text-[#fff] text-sm underline ml-9 font-semibold"
        >
          <span className="tracking-normal font-bold">View Tx</span>:{" "}
          {getEllipsis(txhash, 6, 4)}
        </a>
      ) : (
        ""
      )}
    </div>
  );
};

export default Notification;
