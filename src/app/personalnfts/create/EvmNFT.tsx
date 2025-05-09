"use client"
import { FC, useContext, useEffect } from "react";
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
import { toast } from "react-toastify";
import Notification from "@/components/Notification";
import { collectionService, fileService, nftService } from "@/services/api.service";
import { useRouter } from "next/navigation";
import { EvmCollection } from "@/types";
import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import Dropdown from "@/components/Dropdown";
import { getCollectionContract } from "@/utils/contracts";
import { NFTContext } from "@/hooks/NFTContextProvider";
import { URLS } from "@/config/urls";
import { sleep } from "@/utils/time.utils";

interface Props { }


const EvmNFT: FC<Props> = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [uploadedLogo, setUploadedLogo] = useState<any>("");
    const [localLogo, setLocalLogo] = useState("");
    const [traitTypes, setTraitTypes] = useState([""]);
    const [values, setValues] = useState([""]);
    const [symbol, setSymbol] = useState('');
    const [collectionList, setCollectionList] = useState<EvmCollection[]>([]);

    const [confirmClicked, setConfirmClicked] = useState(false);
    const [pending, setPending] = useState(false);
    const [collection, setCollection] = useState(0);

    const { primaryWallet } = useDynamicContext();
    const { fetchNFTs } = useContext(NFTContext);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (!!primaryWallet) {
                // @ts-ignore
                const provider = await getWeb3Provider(primaryWallet);
                const network = await provider.getNetwork();
                const chainId = network.chainId;
                const collections = await collectionService.fetchChainCollection(Number(chainId), primaryWallet.address);
                setCollectionList(collections);
                console.log(collections);
            }
        })();
    }, [primaryWallet]);

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
            // @ts-ignore
            const provider = await getWeb3Provider(primaryWallet);
            const network = await provider.getNetwork();
            const chainId = network.chainId;
            // @ts-ignore
            const signer = await getSigner(primaryWallet);
            const nftContract = getCollectionContract(
                collectionList[collection].address,
                signer,
                Number(chainId)
            );
            const totalSupply = await nftContract.totalSupply();
            const tokenId = Number(totalSupply) + 1;
            const txResponse = await nftContract.mint(
                primaryWallet.address,
                tokenId,
                uri,
            );
            toast(
                <Notification
                    type={"loading"}
                    msg="Transaction submitted"
                    txhash={txResponse.hash}
                    chain="EVM"
                />
            );
            await txResponse.wait();
            setPending(false);
            setConfirmClicked(false);
            await sleep(3000);
            fetchNFTs();
            router.push(URLS.collection);
        } catch (e) {
            setPending(false);
            setConfirmClicked(false);
            console.log(e);
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
                <div className="mt-7 z-10 relative">
                    <div className="text-xl mb-2">
                        Collection
                    </div>
                    <Dropdown
                        values={collectionList.map(item => item.name ?? item.address)}
                        value={collection}
                        setValue={setCollection}
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

export default EvmNFT;