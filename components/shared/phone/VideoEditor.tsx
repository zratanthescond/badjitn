"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import Video from "next-video";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useVideoProcess } from "@/hooks/useVideoProcess";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModifyVideo } from "./ModifyVideo";
import dynamic from "next/dynamic";
// const HLSPlayer = dynamic(() => import("./HlsPlayer"), {
//   suspense: true,
// });
import HLSPlayer from "./HlsPlayer";
import { useTranslations } from "next-intl";
export default function VideoEditor({
  url,
  setReel,
  userId,
}: {
  url: File | string;
  setReel: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [open, setOpen] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | File>("");
  const { data, isPending, mutate, error } = useVideoProcess(url);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const t = useTranslations("fileUploader");
  useEffect(() => {
    if (data) {
      const videoPath = process.env.NEXT_PUBLIC_FILE_SERVER_URL + data.path;
      console.log(videoPath);
      setVideoUrl(videoPath);
      // if (videoRef.current)
    }
  }, [data]);

  useEffect(() => {
    if (url && url.toString().indexOf(".m3u8") !== -1) {
      setVideoUrl(url);
      //alert(url);
    } else {
      if (url) {
        //alert("mutating");
        mutate();
      }
    }
  }, [url]);

  useEffect(() => {
    setReel(videoUrl);
  }, [videoUrl]);
  return data || videoUrl ? (
    <div className="flex z-10 flex-col items-center justify-center h-full w-full">
      <ModifyVideo video={videoUrl} setVideo={setVideoUrl} userId={userId} />

      <HLSPlayer
        className="rounded-lg w-full h-full aspect-video object-fill relative "
        manifest={videoUrl}
        ref={setVideo}
        controls
      />
    </div>
  ) : isPending ? (
    <div className="flex z-10 flex-col items-center justify-center h-full w-full">
      <span className="animate-spin ml-3">
        <svg
          viewBox="0 0 1024 1024"
          focusable="false"
          data-icon="loading"
          width="5em"
          height="5em"
          fill="white"
          aria-hidden="true"
        >
          <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
        </svg>
      </span>
    </div>
  ) : (
    error && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle className="">{t("uploadError")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button className="glass" onClick={() => mutate()}>
              {t("retry")}
            </Button>
            <Button className="glass" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
}
