import { ChevronLeftSVG } from "@/assets/svgs";
import { useState, useEffect, useRef } from "react";

export default function Dropdown({
  values,
  value,
  setValue,
  className,
  bodyClassName = "",
  itemClassName = "",
  iconClassName = "",
  isBorder = true,
}: {
  values: any;
  value: any;
  setValue: any;
  className?: string;
  bodyClassName?: string;
  itemClassName?: string;
  iconClassName?: string;
  isBorder?: boolean;
}) {
  const dropRef: any = useRef();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.addEventListener("mouseup", function (event) {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setOpen(false);
      }
    });
  }, []);

  return (
    <div className={`relative cursor-pointer text-xl ${className}`}>
      <div
        className={`backdrop-blur text-[#858585] bg-[#0000001A] p-[12px_24px] cursor-pointer z-100 ${
          open ? "rounded-t-lg" : "rounded-lg"
        } ${bodyClassName} ${isBorder ? "border border-[#656565]" : ""}`}
        onClick={() => setOpen(!open)}
        ref={dropRef}
      >
        <div className="flex items-center justify-between">
          <div className="">{values[value]}</div>
          <div
            className={`${
              open ? "[&>svg]:rotate-[90deg]" : "[&>svg]:rotate-[270deg]"
            } ${iconClassName}`}
          >
            {ChevronLeftSVG}
          </div>
        </div>
      </div>
      <div
        className={`absolute w-full rounded-b-lg left-0 w-full top-full bg-[#0000001A] backdrop-blur overflow-hidden ${
          open ? "" : "hidden"
        }  ${isBorder ? "border border-[#656565]" : ""} max-h-[200px] overflow-y-auto white-scroll`}
      >
        {values.map((data: any, i: number) => {
          return (
            <div
              key={i}
              className={`p-[12px_24px] transition hover:bg-[#65656561] hover:text-white ${itemClassName}`}
              onClick={() => setValue(i)}
            >
              {data}
            </div>
          );
        })}
      </div>
    </div>
  );
}
