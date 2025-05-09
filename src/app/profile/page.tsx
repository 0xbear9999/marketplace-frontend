"use client"
import Dropzone from "react-dropzone";
import { DiscordOutlineSVG, EmailOutlineSVG, LinkSVG, TelegramOutlineSVG } from "@/assets/svgs";
import Button from "@/components/Button";
import StyledInput from "@/components/StyledInput";
import { useCallback, useContext, useEffect, useState } from "react";
import { fileService } from "@/services/api.service";
import { AuthContext } from "@/hooks/ContextProvider";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "react-toastify";
import Notification from "@/components/Notification";

const ProfilePage = () => {
  const [name, setName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [telegram, setTelegram] = useState("");
  const [uploadUrl, setUploadedUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [confirmClicked, setConfirmClicked] = useState(false);
  const { primaryWallet } = useDynamicContext();
  const { user, updateUser } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    setName(user?.nickname || '');
    setIntroduction(user.bio || '');
    setEmail(user.email || '');
    setDiscord(user.discord || '');
    setTelegram(user.telegram || '');
    setUploadedUrl(user.avatar || '');
  }, [user])

  async function onLoadAvatar(acceptedFiles: any[]) {
    try {
      const [File] = acceptedFiles;
      const formData = new FormData();
      formData.append("file", File);
      const { path } = await fileService.upload(formData, "avatar");
      setUploadedUrl(path);
      setUploadedImage(URL.createObjectURL(File));
    } catch (e) {
      console.log(e);
    }
  }

  const updateUserHandler = useCallback(async () => {
    try {
      if (!primaryWallet) return;
      updateUser({
        avatar: uploadUrl,
        nickname: name,
        bio: introduction,
        email,
        discord,
        telegram,
        wallet: primaryWallet?.address
      });
      toast(<Notification type={"success"} msg="Successfully Updated" chain="EVM" />);
    } catch (e) {
      toast(<Notification type={"error"} msg="There is problem in update" chain="EVM" />);
    }
  }, [name, email, discord, telegram, uploadUrl, primaryWallet])

  return (
    <div className="relative px-3 py-[80px] z-0 tracking-normal overflow-hidden">
      <div className="max-w-[800px] relative z-10 mx-auto mt-[50px]">
        <div className="font-semibold text-[32px] leading-[1]">{"Personal info"}</div>
        <div className="mt-10">
          <div className="text-[#858585] leading-1">{"Photo"}</div>
          <div className="flex items-center mt-6">
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
              onDrop={(acceptedFiles) => onLoadAvatar(acceptedFiles)}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="cursor-pointer transition hover:opacity-70 relative [&>div]:hover:!opacity-100"
                >
                  <input {...getInputProps()} />
                  {
                    !!uploadUrl ? (
                      <img
                        src={uploadUrl}
                        alt={""}
                        className="rounded-full w-[68px] h-[68px] "
                        onError={(e: any) =>
                          (e.target.src = "/images/personalcenter/personaldata/avatar.png")
                        }
                      />
                    ) : (
                      <img
                        src={uploadedImage}
                        alt={""}
                        className="rounded-full w-[68px] h-[68px] "
                        onError={(e: any) =>
                          (e.target.src = "/images/personalcenter/personaldata/avatar.png")
                        }
                      />
                    )
                  }

                  <div className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] opacity-0">
                    {LinkSVG}
                  </div>
                </div>
              )}
            </Dropzone>

            <div className="ml-6">
              <div className="gradient-text font-semibold w-fit underline">
                {"Select photos"}
              </div>
              <div className="text-xs text-[#999999]">
                {"Supports JPG/PNG, with files smaller than 100MB"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-9 w-full leading-1 md:flex-row flex-col">
          <div className="w-full md:max-w-[340px] max-w-full flex flex-col mr-10">
            <div>
              <div className="text-[#C4C4C4] mb-3">{"Nickname"}</div>
              <StyledInput
                value={name}
                setValue={(e: any) => {
                  if (!e.includes(" ")) setName(e);
                }}
                maxLength={20}
              />
            </div>
            <div className="mt-[46px] flex-1 flex flex-col">
              <div className="text-[#C4C4C4] mb-3">{"Brief introduction"}</div>
              <div className="md:flex-1 flex-none md:h-fit h-[120px]">
                <StyledInput
                  value={introduction}
                  setValue={setIntroduction}
                  type={"textara"}
                  className="h-full"
                />
              </div>
            </div>
          </div>
          <div className="w-full md:max-w-[340px] max-w-full md:mt-0 mt-10">
            <div className="text-[#858585] mb-4">{"Social media"}</div>
            <div>
              <div className="mb-3 flex items-center">
                <div className="text-[#C4C4C4] mr-3">{EmailOutlineSVG}</div>
                <div className="text-[#999999]">{"Email"}</div>
              </div>
              <StyledInput value={email} setValue={setEmail} />
            </div>
            <div className="mt-4">
              <div className="mb-3 flex items-center">
                <div className="text-[#999999] mr-3">{DiscordOutlineSVG}</div>
                <div className="text-[#999999]">{"Discord"}</div>
              </div>
              <StyledInput value={discord} setValue={setDiscord} />
            </div>
            <div className="mt-4">
              <div className="mb-3 flex items-center">
                <div className="text-[#999999] mr-3">{TelegramOutlineSVG}</div>
                <div className="text-[#999999]">{"Telegram"}</div>
              </div>
              <StyledInput value={telegram} setValue={setTelegram} />
            </div>
          </div>
        </div>
        <div className="md:mt-20 mt-10">
          <Button
            type={"primary1"}
            className="w-full md:max-w-[340px] max-w-full"
            onClick={updateUserHandler}
          >
            {"Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;