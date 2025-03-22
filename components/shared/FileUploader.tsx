"use client";

import {
  useCallback,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import { signIn, useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Share2,
  Share2Icon,
  ShareIcon,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FaComment } from "react-icons/fa";
import PhoneIcons from "./phone/PhoneIcons";
import VideoEditor from "./phone/VideoEditor";

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  imageUrl: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setReel: Dispatch<SetStateAction<string>>;
  userId: string;
};

export function FileUploader({
  imageUrl,
  onFieldChange,
  setFiles,
  setReel,
  userId,
}: FileUploaderProps) {
  const [fileToUpload, setFileToUpload] = useState<File | string>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setFileToUpload(acceptedFiles[0]);
    onFieldChange(convertFileToUrl(acceptedFiles[0]));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*", "video/*"]),
  });
  useEffect(() => {
    if (imageUrl.indexOf(".m3u8")) {
      //  alert("update");
      setFileToUpload(imageUrl);
    }
  }, []);
  const { data: session } = useSession();
  return imageUrl ? (
    <div className="flex w-full h-full items-center justify-center">
      <div className="mockup-phone border-indigo-600 w-full h-full max-w-[400px] max-h-[930px]">
        <div className="camera"></div>
        <div className="display bg-card/30 min-h-full w-full  ">
          {/* <Image
                //  width={"100%"}
                blurDataURL={imageUrl}
                placeholder="blur"
                style={{ objectFit: "contain" }}
                fill
                src={imageUrl}
                alt="image"
              /> */}
          <AspectRatio ratio={7.5 / 15}>
            <VideoEditor url={fileToUpload} setReel={setReel} userId={userId} />

            <div className="absolute right-0  top-0  h-full p-4">
              <div className="flex w-full justify-end">
                <Button
                  className="glass rounded-full  "
                  size={"icon"}
                  onClick={() => {
                    onFieldChange("");
                    setFiles([]);
                  }}
                >
                  <X color="white" />
                </Button>
              </div>
              <PhoneIcons />
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ) : (
    <div
      {...getRootProps()}
      className="flex-center bg-dark-3 flex h-full cursor-pointer flex-col overflow-hidden rounded-xl"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      <div className="mockup-phone border-indigo-600 w-full min-h-full max-w-[400px] max-h-[930px]">
        <AspectRatio ratio={7.5 / 15} className=" h-full">
          {" "}
          <div className="camera"></div>
          <div className="display bg-card/95 min-h-full ">
            <Image
              blurDataURL={"/assets/icons/upload.svg"}
              placeholder="blur"
              style={{ objectFit: "contain" }}
              fill
              src="/assets/icons/upload.svg"
              className=" object-cover object-center flex-1"
              alt="file upload"
            />
            <div className=" absolute bottom-10 w-full flex-col text-center items-center justify-center">
              <h3 className="mb-2 mt-2">Drag photo here</h3>
              <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
              <Button type="button" className="rounded-full glass">
                Select from computer
              </Button>
            </div>
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}
