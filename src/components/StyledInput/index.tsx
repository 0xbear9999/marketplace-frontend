import { SearchSVG } from "@/assets/svgs";
import RequireAlert from "@/components/RequireAlert";
import { escapeRegExp } from "@/utils/validation.utils";
import { Oval } from "react-loader-spinner";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export default function StyledInput({
  value,
  setValue,
  placeholder,
  className,
  type = "text",
  suffix,
  isValid = true,
  requireText = "requireText.Please input field",
  maxLength = 0,
  pending = false,
  decimals = 18,
}: {
  value: any;
  setValue?: any;
  placeholder?: string;
  className?: string;
  type?: string;
  suffix?: any;
  isValid?: boolean | string | number;
  requireText?: string;
  maxLength?: number;
  pending?: boolean;
  decimals?: number;
}) {
  const enforcer = (nextUserInput: any) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      setValue(nextUserInput);
    }
  };

  const handleOnChange = (e: any) => {
    if (e.currentTarget.validity.valid) {
      enforcer(e.target.value.replace(/,/g, "."));
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div
        className={`relative ${className} bg-[#0000001A] backdrop-blur flex items-center p-3 w-full relative border rounded-lg`}
      >
        {type === "text" ? (
          <input
            type={"text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent flex-1 outline-none border-none text-lg leading-[1.6] min-w-0"
          />
        ) : type === "number" ? (
          <input
            value={value}
            onChange={handleOnChange}
            inputMode="decimal"
            placeholder={placeholder || "0.00"}
            pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
            className="bg-transparent flex-1 outline-none border-none text-lg leading-[1.6] min-w-0"
            maxLength={79}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent flex-1 outline-none border-none text-lg leading-[1.6] min-w-0 h-full"
          />
        )}
        <div className="text-[#858585]">{suffix}</div>
        {maxLength && value ? (
          <div className={value.length > maxLength ? "text-danger" : "text-[#858585]"}>
            {value.length}/{maxLength}
          </div>
        ) : (
          ""
        )}
        {pending ? (
          <div className="ml-1">
            <Oval
              width={20}
              height={20}
              color={"#cccccc"}
              secondaryColor="black"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        ) : (
          ""
        )}
      </div>
      {!isValid ? <RequireAlert text={requireText} value={isValid} /> : ""}
      {maxLength && value && value.length > maxLength ? (
        <RequireAlert text={"Invalid input"} value={false} />
      ) : (
        ""
      )}
    </div>
  );
}
