"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useUploadMusic } from "@/hooks/useMusicUploader";
import {
  ListRestartIcon,
  LoaderIcon,
  Music,
  Pause,
  Play,
  Search,
  Trash,
  UploadCloud,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";

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
    uploadedFiles!,
    userId
  );

  const handleDrop = (acceptedFiles: File[]) => {
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
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch.trim().length > 2 || localSearch === "") {
        setSearchQuery(localSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "audio/*": [] },
    multiple: false,
  });

  const t = useTranslations("videoEditor");

  return (
    <div className="w-full flex flex-col gap-4">
      {uploadedFiles ? (
        <div 
          className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 border border-foreground/10 dark:border-white/10 p-4 rounded-2xl shadow-xl"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
            <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <Music className="w-7 h-7 text-white" />
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full border-4 border-white/30 rounded-xl animate-ping" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-foreground dark:text-white font-bold text-sm truncate uppercase tracking-tight">
                {uploadedFiles.name}
              </p>
              <p className="text-muted-foreground dark:text-white/40 text-xs font-medium font-syne">
                {formatTime(duration)} • Ready to upload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 shrink-0 rounded-full bg-foreground/10 dark:bg-white/10 hover:bg-foreground/20 dark:hover:bg-white/20 border-0 text-foreground dark:text-white"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
            </Button>

            <Button
              size="icon"
              variant="destructive"
              className="h-10 w-10 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border-0"
              onClick={() => setUploadedFiles(undefined)}
            >
              <Trash className="h-4 w-4" />
            </Button>

            <Button
              disabled={isPending}
              onClick={() => mutate()}
              className="h-10 px-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-pink-500/20"
            >
              {isPending ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  <span>{t("upload")}</span>
                </div>
              )}
            </Button>
          </div>
          <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
          {/* Search Area */}
          <div className="relative flex-1 group">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search tracks, artists..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted dark:bg-slate-800 border border-foreground/10 dark:border-white/10 text-foreground dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-muted/80 dark:focus:bg-white/10 transition-all placeholder:text-foreground/20 dark:placeholder:text-white/20"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 dark:text-white/20 group-focus-within:text-pink-500 transition-colors" />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
             <Button
               variant="secondary"
               size="icon"
               className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-muted dark:bg-slate-800 border border-foreground/10 dark:border-white/10 text-foreground dark:text-white transition-all"
               onClick={() => refetch()}
             >
               <ListRestartIcon className="h-5 w-5" />
             </Button>

             <div {...getRootProps()} className="flex-1 sm:flex-none min-w-0">
                <input {...getInputProps()} />
                <Button
                  variant="outline"
                  className={`h-10 sm:h-12 w-full sm:w-auto px-3 sm:px-6 rounded-2xl font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all border-dashed border-2 ${
                    isDragActive 
                      ? "bg-pink-500 text-white border-pink-400" 
                      : "bg-muted dark:bg-slate-800 text-foreground/60 dark:text-white/60 border-foreground/10 dark:border-white/10 hover:border-pink-500/50"
                  }`}
                >
                  <FaCloudUploadAlt className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 shrink-0" />
                  <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none">{t("addYourMusic")}</span>
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicUploader;
