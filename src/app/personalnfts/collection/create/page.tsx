"use client"
import { URLS } from "@/config/urls";
import Link from "next/link";
import { ChevronLeftSVG } from "@/assets/svgs";
import RequireIcon from "@/components/RequireIcon";
import Dropzone from "react-dropzone";
import { useCallback, useContext, useEffect, useState } from "react";
import { collectionService, fileService } from "@/services/api.service";
import { Puff } from "react-loader-spinner";
import LoadingText from "@/components/LoadingText";
import RequireAlert from "@/components/RequireAlert";
import StyledInput from "@/components/StyledInput";
import Button from "@/components/Button";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { getCollectionFactoryContract } from "@/utils/contracts";
import { toast } from "react-toastify";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";
import { NFTContext } from "@/hooks/NFTContextProvider";
import { PublicKey, Keypair, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import IDL from "@/idl/mint_nft.json";

const classifications = [
  "New Floor Price",
  "PFP",
  "Photography",
  "Cartoon/Anime",
  "Music",
  "3D",
  "Ticket / Pass",
];

const CreateCollectionPage = () => {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState("");
  const [localLogo, setLocalLogo] = useState("");
  const [confirmClicked, setConfirmClicked] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadedBanner, setUploadedBanner] = useState("");
  const [localBanner, setLocalBanner] = useState("");
  const [royalty, setRoyalty] = useState(0);

  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [isNameLoading, setIsNameLoading] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const { appendCollection } = useContext(NFTContext);

  const onLoadLogoImage = async (acceptedFiles: any[]) => {
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

  const onLoadBannerImage = async (acceptedFiles: any[]) => {
    setIsUploadingBanner(true);
    try {
      const [File] = acceptedFiles;
      setUploadedBanner(File);
      setLocalBanner(URL.createObjectURL(File));
    } catch (e) {
      console.log(e);
    }
    setIsUploadingBanner(false);
  };

  const [selectedClassification, setSelectedClassification] = useState<string[]>([]);

  const { primaryWallet } = useDynamicContext();
  const router = useRouter();

  const onConfirm = useCallback(async () => {
    try {
      setConfirmClicked(true);
      if (
        !name ||
        !isNameValid ||
        !uploadedLogo ||
        !uploadedBanner ||
        !symbol ||
        !description ||
        name.length > 20 ||
        symbol.length > 10 ||
        description.length > 500
      )
        return;

      setPending(true);
      if (!primaryWallet) return;

      if (primaryWallet.chain === 'EVM') {
        // @ts-ignore
        const provider = await getWeb3Provider(primaryWallet);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        // @ts-ignore
        const signer = await getSigner(primaryWallet);
        const factoryContract = getCollectionFactoryContract(signer, Number(chainId));
        // Call createClone and wait for the transaction to be mined

        const txResponse = await factoryContract.createClone(
          name,
          symbol,
          primaryWallet.address,
          Number(royalty ?? 0) * 100,
          name
        );
        toast(
          <Notification
            type={"loading"}
            msg="Transaction submitted"
            txhash={txResponse.hash}
            chain="EVM"
          />
        );
        factoryContract.on("CreateCollection", async (creator, newCollection, metadata) => {
          if (creator === primaryWallet.address) {
            // The new deployed contract address is in the logs of the transaction receipt
            console.log("Newly Deployed Contract Address:", newCollection);
            const formData1 = new FormData();
            formData1.append("file", uploadedLogo);
            const logoUrl = await fileService.upload(formData1, "logo");
            const logo = logoUrl.path;
            const formData2 = new FormData();
            formData2.append("file", uploadedBanner);
            const bannerUrl = await fileService.upload(formData2, "banner");
            const banner = bannerUrl.path;
            const res = await collectionService.create({
              chainId: Number(chainId),
              address: newCollection,
              logo,
              banner,
              description,
              creator,
              supply: 0,
              classification: selectedClassification,
              name
            });
            setPending(false);
            setConfirmClicked(false);
            appendCollection(res);
            router.push(URLS.collection);
          }
        });
      } else if (primaryWallet.chain === 'SOL') {
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
        
        // Create collection mint
        const collectionMintKeypair = Keypair.generate();
        const collectionMint = collectionMintKeypair.publicKey;
        
        // Create metadata for collection
        const metadata = {
          name,
          description,
          image: "", // Will be updated after upload
          attributes: selectedClassification.map(classification => ({
            trait_type: "Classification",
            value: classification
          }))
        };

        // Upload collection metadata and images
        const formData1 = new FormData();
        formData1.append("file", uploadedLogo);
        const logoUrl = await fileService.upload(formData1, "logo");
        const logo = logoUrl.path;
        
        const formData2 = new FormData();
        formData2.append("file", uploadedBanner);
        const bannerUrl = await fileService.upload(formData2, "banner");
        const banner = bannerUrl.path;

        // Update metadata with image URLs
        metadata.image = logo;

        // Upload metadata to IPFS
        const formData3 = new FormData();
        formData3.append('metadata', JSON.stringify(metadata));
        const { uri } = await fileService.uploadMetadata(formData3);

        // Create collection instruction
        const collectionIxn = await program.methods.createSingleNft(
          name,
          symbol,
          uri
        ).accounts({
          mint: collectionMint,
          tokenAccount: getAssociatedTokenAddressSync(collectionMint, payer)
        }).signers([collectionMintKeypair]).instruction();

        const blockhash = await connection.getLatestBlockhash('finalized');
        
        // Create and sign transaction
        const transaction = new VersionedTransaction(
          new TransactionMessage({
            instructions: [collectionIxn],
            payerKey: payer,
            recentBlockhash: blockhash.blockhash,
          }).compileToV0Message()
        );
        
        // Sign with both the collection mint keypair and the wallet
        transaction.sign([collectionMintKeypair]);
        const signedTx = await signer.signTransaction(transaction);
        
        try {
          // Send transaction
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

          // Create collection in backend
          const res = await collectionService.create({
            chainId: 0, // Solana chain ID
            address: collectionMint.toString(),
            logo,
            banner,
            description,
            creator: primaryWallet.address,
            supply: 0,
            classification: selectedClassification,
            name
          });

          toast(
            <Notification
              type={"success"}
              msg="Collection Created Successfully"
              txhash={signature}
              chain="solana"
            />
          );

          setPending(false);
          setConfirmClicked(false);
          appendCollection(res);
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
      }
    } catch (e) {
      console.log(e);
      setPending(false);
      setConfirmClicked(false);
    }
  }, [
    name, isNameValid, uploadedLogo, uploadedBanner, symbol, description, primaryWallet, selectedClassification
  ]);

  return (
    <div className="relative px-3 py-[80px] z-0 tracking-normal overflow-hidden min-h-screen">
      <div className="max-w-[1240px] relative z-10 mx-auto mt-[50px]">
        <div className="flex">
          <Link href={URLS.collection} className="mt-3.5">
            {ChevronLeftSVG}
          </Link>
          <div className="ml-4">
            <div className="text-[32px] font-semibold">
              Create a collection
            </div>
            <div className="text-[#C4C4C4]">
              Create, plan, and manage an exclusive NFT series for sharing and sales.
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1000px] mx-auto text-[#858585]">
          <div className="mt-12">
            <div className="text-xl">
              Logo Image
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
              text="Require upload image"
              value={!confirmClicked || uploadedLogo}
            />
          </div>
          <div className="mt-6">
            <div className="text-xl">
              Banner Image
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
                onDrop={(acceptedFiles) => onLoadBannerImage(acceptedFiles)}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="primary-shadow flex  bg-[#FFFFFF1A] backdrop-blur rounded-lg w-full cursor-pointer items-center justify-center border border-dashed border-transparent bg-[#202023] transition hover:border-white"
                  >
                    <input {...getInputProps()} />
                    {isUploadingBanner ? (
                      <div className="flex h-[200px] w-full flex-col items-center justify-center">
                        <Puff
                          width={45}
                          height={45}
                          color={"#ffffff9e"}
                          secondaryColor="black"
                        />
                        <div className="mt-2 text-sm text-[#ffffff9e]">
                          <LoadingText text={"loading.Uploading Image"} />
                        </div>
                      </div>
                    ) : localBanner ? (
                      <div className="rounded w-full h-[200px] flex justify-center items-center overflow-hidden">
                        <img
                          src={localBanner}
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
              text="Require upload image"
              value={!confirmClicked || uploadedBanner}
            />
          </div>
          <div className="mt-6">
            <div className="text-xl mb-2">
              My Series Name
              <RequireIcon />
            </div>
            <StyledInput
              value={name}
              setValue={setName}
              className="border-[#656565] text-white"
              isValid={isNameValid}
              maxLength={20}
              pending={isNameLoading}
              requireText={
                "Invalid name"
              }
            />
            <div className="">
              The name cannot be changed after creating a collection.
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xl mb-2">
              Token symbol
              <RequireIcon />
            </div>
            <StyledInput
              value={symbol}
              setValue={setSymbol}
              className="border-[#656565] text-white"
              isValid={!confirmClicked || symbol}
              maxLength={10}
            />
            <div className="">
              The symbol will be used to create your smart contract and cannot be changed after creating the collection.When others view your smart contract, the token symbol will be displayed on the blockbrowser.
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xl mb-2">
              Description
              <RequireIcon />
            </div>
            <StyledInput
              value={description}
              setValue={setDescription}
              className="border-[#656565] text-white"
              isValid={!confirmClicked || description}
              maxLength={500}
            />
            <div className="">
              The symbol will be used to create your smart contract and cannot be changed after creating the collection.When others view your smart contract, the token symbol will be displayed on the blockbrowser.
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xl mb-2">
              Classification
              <RequireIcon />
            </div>
            <div className="flex flex-wrap">
              {classifications.map((data, i: number) => {
                return (
                  <Button
                    key={i}
                    type={"category"}
                    className={`mr-3 mb-3 ${selectedClassification.includes(data)
                      ? "!bg-white !text-black font-semibold"
                      : ""
                      }`}
                    onClick={() => {
                      const temp: string[] = [...selectedClassification];
                      const index = temp.indexOf(data);
                      if (index === -1) temp.push(data);
                      else temp.splice(index, 1);
                      setSelectedClassification(temp);
                    }}
                  >
                    {data}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* <div className="mt-6 z-10 relative">
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

          {/* <div className="mt-6">
            <div className="text-xl mb-2">
              Royalty
              <RequireIcon />
            </div>
            <StyledInput
              type={"number"}
              value={royalty}
              setValue={setRoyalty}
              className="border-[#656565] text-white"
              suffix="%"
              decimals={2}
            />
            <div className="">
              createCollection.Charge a handling fee when a user resells a project originally created by you. You can set a ratio of less than 10%, which cannot be changed after creating a collection.
            </div>
          </div> */}

          <div className="mt-16">
            <Button
              type={"primary1"}
              className="w-full h-[48px]"
              onClick={() => onConfirm()}
              disabled={pending}
              pending={pending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCollectionPage;