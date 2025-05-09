"use client"
import Link from "next/link";
import { FC } from "react";
import { IconButton, IconWrapper } from "./FooterElements";
import { FaTwitter, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { SiLinktree } from "react-icons/si";
import { MdEmail } from "react-icons/md";

interface Props { }

const Footer: FC<Props> = () => {
  return (
    <div className="w-screen h-[300px] bg-[#3B3930] flex justify-center items-center flex-col gap-4">
      <div className="flex flex-col gap-4 items-center">
        <Link
          className="font-medium text-[26px] mr-[26px] flex items-center"
          href={"/"}
        >
          <img src={"/header_logo.webp"} alt="logo" className="h-16 mr-4" />
        </Link>
        <div className="text-sm text-center lg:w-[800px] w-full">
          Cryptocurrency may be unregulated in your jurisdiction. The value of cryptocurrencies may go down as well as up. Profits may be subject to capital gains or other taxes applicable in your jurisdiction.
        </div>
        <IconWrapper>
          <Link href={"https://twitter.com/RealChimpzee"} target="blank">
            <IconButton>
              <FaTwitter />
            </IconButton>
          </Link>
          <Link href={"https://instagram.com/chimpzee.io"} target="blank">
            <IconButton>
              <FaInstagram />
            </IconButton>
          </Link>
          <Link href={"https://t.me/officialchimpzeetelegramgroup"} target="blank">
            <IconButton>
              <FaTelegramPlane />
            </IconButton>
          </Link>
          <Link href={"https://linktr.ee/chimpzee"} target="blank">
            <IconButton>
              <SiLinktree />
            </IconButton>
          </Link>
          <Link href={"https://www.chimpzee.io/contact"} target="blank">
            <IconButton>
              <MdEmail />
            </IconButton>
          </Link>
        </IconWrapper>
      </div>
      <div className="border-t border-white w-full pt-4 flex flex-col gap-2 items-center">
        <div className="text-sm text-center w-[500px]">
          Copyright © 2024 Chimpzee. All rights reserved.
          1st Floor, Ricardo Arias Street, Panama City, Panama, contact@chimpzee.io
        </div>
      </div>
    </div>
  )
}

export default Footer;