import { Button } from "@/components/ui/button";
import { useUploadMusic } from "@/hooks/useMusicUploader";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  LoaderIcon,
  Music,
  Pause,
  Play,
  Trash,
  Trash2,
  UploadCloud,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { generateClientDropzoneAccept } from "uploadthing/client";

const MusicUploader = ({ userId }: { userId: string }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File>();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);

  const { data, isPending, error, mutate } = useUploadMusic(
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
  return (
    <div className="flex flex-col items-center rounded-lg ">
      {uploadedFiles ? (
        <div className="flex flex-row justify-center items-center gap-4  backdrop:blur backdrop-brightness-200 ">
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Music className="w-8 h-8" color="white" />
          </div>
          <div className="flex flex-col justify-center items-start">
            <p>{uploadedFiles.name.substring(0, 25) + " ... "}</p>
            <Separator color="slate-800" className="my-1 bg-slate-800" />
            <p>{formatTime(duration)}</p>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button className="w-8 h-8  p-0 glass" onClick={handlePlayPause}>
              {!isPlaying ? <Play color="white" /> : <Pause color="white" />}
            </Button>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button
              className="w-8 h-8  p-0 glass"
              onClick={() => setUploadedFiles(undefined)}
            >
              <Trash />
            </Button>
          </div>
          <div className="flex flex-row justify-center items-center rounded-lg bg-pink-500 p-1 m-1">
            <Button
              className="h-8 p-0 glass"
              disabled={isPending}
              onClick={() => mutate()}
            >
              {isPending ? (
                <LoaderIcon color="white" className="animate-spin" />
              ) : (
                <>
                  <UploadCloud color="white" className="" />
                  Upload
                </>
              )}
            </Button>
          </div>
          <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex w-full bg-pink-500 p-1 rounded-lg"
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p>Drop the file here</p>
          ) : (
            <Button
              variant="default"
              className="flex glass  flex-row items-center justify-center "
            >
              <p className="text-center w-full">Add your music</p>
              <FaCloudUploadAlt className="w-8 h-8" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicUploader;
