"use client"
import { WhiteLoadingSVG } from "@/assets/svgs";
import React from "react";
import { Oval } from "react-loader-spinner";
import styled from "styled-components";

const Button = ({
  type,
  className,
  children,
  disabled,
  onClick,
  id,
  ref,
  border,
  itemClassName,
  pending,
}: {
  type?: string;
  className?: string;
  children?: any;
  disabled?: boolean;
  onClick?: any;
  id?: string;
  ref?: any;
  border?: string;
  itemClassName?: string;
  pending?: boolean;
}) => {
  const LoadingSpinner = () => {
    return (
      <div className="absolute right-2">
        <Oval
          width={20}
          height={20}
          color={"white"}
          secondaryColor="black"
          strokeWidth={3}
          strokeWidthSecondary={3}
        />
      </div>
    );
  };
  return (
    <>
      {type === "primary" ? (
        <PrimaryButton
          className={className}
          disabled={disabled}
          onClick={onClick}
          id={id}
          ref={ref}
        >
          <div
            className={`${itemClassName} h-full rounded-lg whitespace-nowrap transition flex justify-center items-center`}
          >
            {pending ? <div className="mr-1">{WhiteLoadingSVG}</div> : ""}
            {children}
          </div>
        </PrimaryButton>
      ) : type === "primary1" ? (
        <PrimaryButton1
          className={className}
          disabled={disabled}
          onClick={onClick}
          id={id}
          ref={ref}
          border={border}
        >
          <div
            className={`${itemClassName} h-full rounded-lg whitespace-nowrap transition flex justify-center items-center`}
          >
            {pending ? <div className="mr-1">{WhiteLoadingSVG}</div> : ""}
            {children}
          </div>
        </PrimaryButton1>
      ) : type === "secondary" ? (
        <SecondaryButton
          className={className}
          disabled={disabled}
          onClick={onClick}
          id={id}
          ref={ref}
        >
          <div className="w-full h-full rounded-lg flex justify-center items-center">
            {pending ? <div className="mr-1">{WhiteLoadingSVG}</div> : ""}
            {children}
          </div>
        </SecondaryButton>
      ) : type === "category" ? (
        <CategoryButton
          className={className}
          disabled={disabled}
          onClick={onClick}
          id={id}
          ref={ref}
        >
          {pending ? <div className="mr-1">{WhiteLoadingSVG}</div> : ""}
          {children}
        </CategoryButton>
      ) : (
        ""
      )}
    </>
  );
};

const BaseButton = styled.button`
  font-size: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  :disabled {
    cursor: not-allowed;
  }
  color: white;
  line-height: 1.2;
  letter-spacing: 0.9px;
`;

const PrimaryButton = styled(BaseButton)<{ border?: string }>`
  color: rgb(129, 69, 30);
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.2s ease-in-out 0s;
  font-size: 16px;
  background: transparent;
  border-width: 10px;
  border-style: solid;
  border-color: initial;
  border-image: url(/navBorder.svg) 12 fill / 1 / 0 stretch;
  text-align: center;
  &:hover:not([disabled]){
    cursor: pointer;
    transform: scale(1.05);
    transition: all 0.2s ease-in-out 0s;
    box-shadow: rgba(0, 0, 0, 0.6) -10px 10px 0px -4px;
  }
  :disabled {
    opacity: 0.65;
  }
  /* bg */
`;

const PrimaryButton1 = styled(BaseButton)<{ border?: string }>`
  color: rgb(129, 69, 30);
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.2s ease-in-out 0s;
  font-size: 16px;
  background: transparent;
  border-width: 10px;
  border-style: solid;
  border-color: initial;
  border-image: url(/navBorder.svg) 12 fill / 1 / 0 stretch;
  // width: 35%;
  text-align: center;
  &:hover:not([disabled]) {
    cursor: pointer;
    transform: scale(1.05);
    transition: all 0.2s ease-in-out 0s;
    box-shadow: rgba(0, 0, 0, 0.6) -10px 10px 0px -4px;
  }
  /* bg */
`;

const SecondaryButton = styled(BaseButton)`
  :not([disabled]) > div:nth-child(1) {
    transition: all 0.3s;
    background: linear-gradient(130deg, #a28e26, #32781e, #32781e, #32781e);
    background-size: 300% 100%;
    :hover {
      background-position: 100% 0;
    }
  }
  > div:nth-child(1) {
    transition: all 0.3s;
    background: linear-gradient(130deg, #a28e26, #32781e, #32781e, #32781e);
    background-size: 300% 100%;
  }

  transition: none;
  :hover:not([disabled]) {
    box-shadow: 0px 2px 4px #ffffff40;
  }
`;

const CategoryButton = styled(BaseButton)`
  border: 1px solid white;
  padding: 12px;
  border-radius: 12px;
  background: #ffffff1a;
  transition: 0.15s all;
  :hover:not([disabled]) {
    box-shadow: 0px 2px 6px #ffffffa4;
  }
`;
export default Button;
