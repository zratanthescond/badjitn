import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useUploadMusic } from "@/hooks/useMusicUploader";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  ListRestartIcon,
  LoaderIcon,
  Music,
  Pause,
  Play,
  Trash,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { generateClientDropzoneAccept } from "uploadthing/client";

const MusicUploader = ({
  userId,
  refetch,
  searchQuery,
  setSearchQuery,
}: {
  userId: string;
  refetch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File | undefined>();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);

  const { data, isPending, error, mutate, isSuccess } = useUploadMusic(
    uploadedFiles,
    userId
  );

  const handleDrop = (acceptedFiles: File[]) => {
    // Logic for handling the dropped files
    setUploadedFiles(acceptedFiles[0]);
  };
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log(audioRef.current.duration);
    }
  };

  // Function to format time in minutes and seconds
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: generateClientDropzoneAccept(["audio/*"]),
    multiple: false,
  });
  useEffect(() => {
    if (uploadedFiles) {
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(uploadedFiles);
      }
    }
  }, [uploadedFiles]);
  useEffect(() => {
    if (data && isSuccess) {
      setUploadedFiles(undefined);
      toast({
        title: "Success",
        description: "Music uploaded successfully",
      });
    }
    if (error) {
      toast({
        title: "Error",
        description: "Failed to upload music",
        variant: "destructive",
      });
    }
  }, [data, isSuccess, error]);
  const t = useTranslations("videoEditor");
  const handleSearchMusic = (query: string) => {
    // Logic to handle search musi

    console.log("Search query:", query);
    setTimeout(() => {
      if (query.trim().length > 2) {
        setSearchQuery(query);
      } else {
        setSearchQuery("");
      }
    }, 1000);
  };
  return (
    <div className="flex flex-col items-center w-full rounded-lg ">
      {uploadedFiles ? (
        <div className="flex flex-row justify-center items-center gap-4  backdrop:blur backdrop-brightness-200 rounded-xl ">
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Music className="w-8 h-8" color="white" />
          </div>
          <div className="flex flex-col justify-center items-start">
            <p>{uploadedFiles.name.substring(0, 25) + " ... "}</p>
            <Separator color="slate-800" className="my-1 bg-slate-800" />
            <p>{formatTime(duration)}</p>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button
              className="w-8 h-8  p-0 glass"
              variant="outline"
              onClick={handlePlayPause}
            >
              {!isPlaying ? <Play color="white" /> : <Pause color="white" />}
            </Button>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button
              variant="outline"
              className="w-8 h-8  p-0 glass"
              onClick={() => setUploadedFiles(undefined)}
            >
              <Trash />
            </Button>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button
              variant="outline"
              className="h-8 p-0 glass"
              disabled={isPending}
              onClick={() => mutate()}
            >
              {isPending ? (
                <LoaderIcon color="white" className="animate-spin" />
              ) : (
                <>
                  <UploadCloud color="white" className="" />
                  {t("upload")}
                </>
              )}
            </Button>
          </div>
          <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
        </div>
      ) : (
        <div className="flex !w-full flex-row items-center justify-between gap-2 ">
          <Button
            variant="outline"
            size={"icon"}
            className="flex bg-pink-500 flex-row items-center   rounded-lg"
            onClick={() => refetch()}
          >
            <ListRestartIcon color="white" className="w-8 h-8" size={35} />
          </Button>
          <Input
            type="text"
            onChange={(e) => handleSearchMusic(e.target.value)}
            placeholder={t("searchMusic")}
            className="w-1/4 rounded-full hover:w-2/4 glass bg-card-foreground/50 text-card border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div {...getRootProps()} className="flex  bg-pink-500 p-1 rounded-lg">
            <input {...getInputProps()} />

            {isDragActive ? (
              <p>Drop the file here</p>
            ) : (
              <Button
                variant="outline"
                className="flex glass  flex-row items-center justify-center border-dashed "
              >
                {t("addYourMusic")}
                <FaCloudUploadAlt className="w-8 h-8 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicUploader;
