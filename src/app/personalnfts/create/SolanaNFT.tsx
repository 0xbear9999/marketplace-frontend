"use client"
import { FC, useContext } from "react";
import Link from "next/link";
import { ChevronLeftSVG } from "@/assets/svgs";
import RequireIcon from "@/components/RequireIcon";
import Dropzone from "react-dropzone";
import { useCallback, useState } from "react";
import { Puff } from "react-loader-spinner";
import LoadingText from "@/components/LoadingText";
import RequireAlert from "@/components/RequireAlert";
import StyledInput from "@/components/StyledInput";
import { NFT_DESCRP_CHAR_LIMIT, NFT_NAME_CHAR_LIMIT, NFT_TRAIT_CHAR_LIMIT } from "@/config/constants";
import Button from "@/components/Button";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Connection } from "@solana/web3.js";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import IDL from '@/idl/mint_nft.json';
import { Keypair } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "react-toastify";
import Notification from "@/components/Notification";
import { fileService } from "@/services/api.service";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useRouter } from "next/navigation";
import { URLS } from "@/config/urls";
import { SolNFTContext } from "@/hooks/SolNFTContextProvider";
import { sleep } from "@/utils/time.utils";

interface Props { }


const SolanaNFT: FC<Props> = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [uploadedLogo, setUploadedLogo] = useState<any>("");
    const [localLogo, setLocalLogo] = useState("");
    const [traitTypes, setTraitTypes] = useState([""]);
    const [values, setValues] = useState([""]);
    const [symbol, setSymbol] = useState('');

    const [confirmClicked, setConfirmClicked] = useState(false);
    const [pending, setPending] = useState(false);
    const [collection, setCollection] = useState();

    const { primaryWallet } = useDynamicContext();
    const { addNFT } = useContext(SolNFTContext);

    const router = useRouter();

    const onLoadLogoImage = async (acceptedFiles: any) => {
        setIsUploadingLogo(true);
        try {
            const [File] = acceptedFiles;
            setUploadedLogo(File);
            setLocalLogo(URL.createObjectURL(File));
        } catch (e) {
            console.log(e);
        }
        setIsUploadingLogo(false);
    };

    const mintSolNFT = useCallback(async () => {
        try {
            if (
                !name ||
                !uploadedLogo ||
                !description ||
                name.length > NFT_NAME_CHAR_LIMIT ||
                description.length > NFT_DESCRP_CHAR_LIMIT
            ) {
                return;
            }
            if (!primaryWallet) return;
            setPending(true);
            setConfirmClicked(true);
            const metadata = {
                name,
                description,
                attributes: traitTypes
                    .filter((type, i) => type)
                    .map((type, i) => {
                        return {
                            trait_type: type,
                            value: values[i],
                        };
                    }),
            }
            const formdata = new FormData();
            formdata.append('file', uploadedLogo);
            formdata.append('metadata', JSON.stringify(metadata));

            const { uri } = await fileService.uploadMetadata(formdata);
            console.log("-------2--------", uri);
            // @ts-ignore
            const connection = await primaryWallet.getConnection();
            if (!connection) return;
            // @ts-ignore
            const signer: ISolana = await primaryWallet.getSigner();
            const payer = new PublicKey(primaryWallet.address);
            const wallet = {
                signTransaction: signer.signTransaction,
                signAllTransactions: signer.signAllTransactions,
                publicKey: new PublicKey(primaryWallet.address)
            }
            const provider = new AnchorProvider(
                connection,
                wallet
            )
            const program = new Program(IDL as Idl, provider);
            const mintKeypair = Keypair.generate();
            const mint = mintKeypair.publicKey;
            // const nftMetadata = findMetadataAccount(connection, mintKeypair.publicKey);
            // const masterEditionAccount = findMasterEditionAccount(connection, mintKeypair.publicKey);
            const instructions = [];
            const tokenAccount = getAssociatedTokenAddressSync(
                mint,
                payer
            );
            if (!collection) {
                const ixn = await program.methods.createSingleNft(
                    name,
                    symbol,
                    uri
                ).accounts({
                    mint,
                    tokenAccount
                }).signers([mintKeypair]).instruction();
                instructions.push(ixn);
            } else {
                const ixn = await program.methods.mintToCollection(
                    name,
                    symbol,
                    uri
                ).accounts({
                    mint,
                    collection: new PublicKey(collection)
                }).instruction();
                instructions.push(ixn);
            }

            const blockhash = await connection.getLatestBlockhash('finalized');
            
            // Create and sign transaction in one step
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions,
                    payerKey: payer,
                    recentBlockhash: blockhash.blockhash,
                }).compileToV0Message()
            );
            
            // Sign with both the mint keypair and the wallet
            transaction.sign([mintKeypair]);
            const signedTx = await signer.signTransaction(transaction);
            
            try {
                // Send with specific commitment level and options
                const signature = await connection.sendTransaction(signedTx, {
                    preflightCommitment: 'confirmed',
                    maxRetries: 5,
                    skipPreflight: false
                });

                // Wait for confirmation
                const confirmation = await connection.confirmTransaction({
                    signature,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight
                });

                if (confirmation.value.err) {
                    throw new Error(`Transaction failed: ${confirmation.value.err}`);
                }

                console.log(
                    `Transaction successful: https://solscan.io/tx/${signature}?cluster=devnet`,
                );
                toast(
                    <Notification
                        type={"success"}
                        msg="NFT Minted Successfully"
                        txhash={signature}
                        chain="solana"
                    />
                );
                await sleep(5000);
                setPending(false);
                setConfirmClicked(false);
                addNFT(mintKeypair.publicKey);
                router.push(URLS.collection);
            } catch (error: any) {
                console.error("Transaction error:", error);
                setPending(false);
                setConfirmClicked(false);
                toast(
                    <Notification
                        type={"error"}
                        msg="Transaction failed"
                        txhash={error.message}
                        chain="solana"
                    />
                );
            }
        } catch (e) {
            console.log(e);
            setPending(false);
            setConfirmClicked(false);
        }
    }, [primaryWallet, name, description, uploadedLogo, traitTypes, values, symbol, collection]);


    return (
        <div className="max-w-[1240px] relative z-10 mx-auto mt-[50px]">
            <div className="flex">
                <Link href={"/personalnfts/mycollection"} className="mt-3.5">
                    {ChevronLeftSVG}
                </Link>
                <div className="ml-4">
                    <div className="text-[32px] font-semibold">
                        Create NFT
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[1000px] mx-auto text-[#858585]">
                <div className="mt-12">
                    <div className="text-xl">
                        Import pictures, videos, or audio
                        <RequireIcon />
                    </div>
                    <div className="mt-3">
                        <Dropzone
                            maxFiles={1}
                            accept={{
                                "image/png": ['.png'],
                                "image/jpeg": ['.jpg', '.jpeg'],
                                "image/gif": ['.gif'],
                                "video/mp4": ['.mp4'],
                                "video/quicktime": ['.mov'],
                                "audio/mpeg": ['.mp3'],
                                "audio/wav": ['.wav']
                            }}
                            onDrop={(acceptedFiles) => onLoadLogoImage(acceptedFiles)}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <div
                                    {...getRootProps()}
                                    className="primary-shadow flex bg-[#FFFFFF1A] backdrop-blur rounded-lg w-full cursor-pointer items-center justify-center border border-dashed border-transparent bg-[#202023] transition hover:border-white"
                                >
                                    <input {...getInputProps()} />
                                    {isUploadingLogo ? (
                                        <div className="flex h-[200px] w-full flex-col items-center justify-center">
                                            <Puff
                                                width={45}
                                                height={45}
                                                color={"#ffffff9e"}
                                                secondaryColor="black"
                                            />
                                            <div className="mt-2 text-sm text-[#ffffff9e]">
                                                <LoadingText text={"Uploading Image"} />
                                            </div>
                                        </div>
                                    ) : localLogo ? (
                                        <div className="rounded w-[200px] h-[200px] flex justify-center items-center overflow-hidden p-4">
                                            <img
                                                src={localLogo}
                                                alt={""}
                                                className="w-full rounded"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center h-[58px]">
                                            <div className="gradient-text text-[32px] w-fit">+</div>
                                            <div className="text-[#858585] text-sm ml-2">
                                                Supports JPG/PNG, with files smaller than 2M
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Dropzone>
                    </div>
                    <RequireAlert
                        text={"Require Upload Image"}
                        value={!confirmClicked || uploadedLogo}
                    />
                </div>

                <div className="mt-7">
                    <div className="text-xl mb-2">
                        My NFT Name
                        <RequireIcon />
                    </div>
                    <StyledInput
                        value={name}
                        setValue={setName}
                        className="border-[#656565] text-white"
                        isValid={!confirmClicked || name}
                        maxLength={NFT_NAME_CHAR_LIMIT}
                    />
                </div>

                {
                    primaryWallet?.chain === 'solana' && (
                        <div className="mt-7">
                            <div className="text-xl mb-2">
                                Symbol
                                <RequireIcon />
                            </div>
                            <StyledInput
                                value={symbol}
                                setValue={setSymbol}
                                className="border-[#656565] text-white"
                                isValid={!confirmClicked || name}
                                maxLength={NFT_NAME_CHAR_LIMIT}
                            />
                        </div>
                    )
                }

                <div className="mt-7">
                    <div className="text-xl mb-2">
                        Description
                        <RequireIcon />
                    </div>
                    <StyledInput
                        value={description}
                        setValue={setDescription}
                        className="border-[#656565] text-white"
                        isValid={!confirmClicked || description}
                        maxLength={NFT_DESCRP_CHAR_LIMIT}
                    />
                </div>

                {/* <div className="mt-7 z-20 relative">
            <div className="text-xl mb-2">
              Network
              <RequireIcon />
            </div>
            <Dropdown
              values={["Sepolia"]}
              value={network}
              setValue={setNetwork}
            />
          </div> */}

                <div className="mt-7 z-10 relative">
                    <div className="text-xl mb-2">
                        Collection
                    </div>
                    <StyledInput 
                        value={collection}
                        setValue={setCollection}
                        className="border-[#656565] text-white"
                        isValid={!confirmClicked || description}
                        maxLength={NFT_DESCRP_CHAR_LIMIT}
                    />
                    <div className="">
                        Select a collection for your project, once selected and cast, it cannot be modified.If you need a new collection, please create a collection.
                    </div>
                </div>

                <div className="mt-7">
                    <div className="text-xl mb-2">
                        Characteristic
                        <RequireIcon />
                    </div>
                    {traitTypes.map((type, i) => {
                        return (
                            <div
                                className="flex sm:flex-row flex-col mb-2 text-white"
                                key={i}
                            >
                                <StyledInput
                                    value={type}
                                    setValue={(e: any) => {
                                        const temp = [...traitTypes];
                                        temp[i] = e;
                                        setTraitTypes(temp);
                                    }}
                                    placeholder={"Attribute"}
                                    className="border-[#333131]"
                                    maxLength={NFT_TRAIT_CHAR_LIMIT}
                                />
                                <div className="sm:mr-2 mr-0 sm:mb-0 mb-2" />
                                <StyledInput
                                    value={values[i]}
                                    setValue={(e: any) => {
                                        const temp = [...values];
                                        temp[i] = e;
                                        setValues(temp);
                                    }}
                                    placeholder={"Value"}
                                    className="border-[#656565]"
                                    maxLength={NFT_TRAIT_CHAR_LIMIT}
                                />
                                <div
                                    className="text-center text-4xl cursor-pointer hover:text-white transition mx-4 mt-1 text-[#858585]"
                                    onClick={() => {
                                        const _traitTypes = [...traitTypes];
                                        _traitTypes.splice(i, 1);
                                        setTraitTypes(_traitTypes);
                                        const _values = [...values];
                                        _values.splice(i, 1);
                                        setValues(_values);
                                    }}
                                >
                                    -
                                </div>
                            </div>
                        );
                    })}
                    <div
                        className="cursor-pointer mt-2 hover:text-white transition flex items-center"
                        onClick={() => {
                            setTraitTypes([...traitTypes, ""]);
                            setValues([...values, ""]);
                        }}
                    >
                        <span className="text-4xl">+</span>&nbsp;
                        <span className="text-xl">{"Add attributes?"}</span>
                    </div>
                </div>

                <div className="mt-16">
                    <Button
                        type={"primary"}
                        className="w-full h-[48px]"
                        onClick={mintSolNFT}
                        disabled={pending}
                        pending={pending}
                    >
                        {"Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SolanaNFT;