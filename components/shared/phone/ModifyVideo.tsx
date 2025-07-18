import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Video from "next-video";
import { use, useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer, { AudioPlayerList } from "./AudoPlayer";
import { ListIcon, ListMusic, Music2Icon, VideoIcon } from "lucide-react";
import MusicUploader from "./MusicUploader";
import { useMusic } from "@/hooks/useMusic";
import Image from "next/image";
import { usePreview } from "@/hooks/usePreview";
import { Mixer } from "./Mixer";
import { IMusic } from "@/lib/database/models/music.model";
import { useReelCreate } from "@/hooks/useReelCreate";
import HLSPlayer from "./HlsPlayer";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
export function ModifyVideo({ video, setVideo, userId }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useMusic(10, searchQuery);
  const [usedTrack, SetUsedTrack] = useState<IMusic | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [videoData, setVideoData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    data: reelData,
    isPending: reelLoading,
    error: reelError,
    mutate: reelMutate,
  } = useReelCreate(videoData);
  useEffect(() => {
    console.log(reelData, reelLoading, reelError);
    if (reelData?.success == true) {
      //  alert(process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + reelData.videoPath);
      setVideo(process.env.NEXT_PUBLIC_FILE_SERVER_URL + reelData.videoPath);
      setIsDialogOpen(false);
    } else if (reelError) {
      toast({
        title: "Error",
        description: reelError.message || "Failed to create reel",
        variant: "destructive",
      });
    }
  }, [reelData, reelLoading, reelError]);

  useEffect(() => {
    console.log(video);
    if (videoRef.current) {
      videoRef.current.src = video;
    }
  }, [video, videoRef]);
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const processVideo = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("video", video);
    data.append("usedTrack", JSON.stringify(usedTrack));
    data.append("selectedTime", selectedTime as number);
    setVideoData(data);
    try {
      reelMutate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reel",
        variant: "destructive",
      });
    }
  };
  const handleScrollCapture = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        // alert("Load more music");
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    },
    []
  );
  const allMusic =
    data?.pages.flatMap((page) => {
      // Adjust based on your API response structure
      return Array.isArray(page) ? page : page?.data || [];
    }) ?? [];
  const t = useTranslations("videoEditor");
  return (
    <div className="absolute top-4 left-4 z-10  ">
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger className="flex flex-row items-center gap-2 bg-pink-500/70 z-50 p-2 rounded-full text-primary-50">
          <VideoIcon /> {t("modifyVideo")}
        </AlertDialogTrigger>
        <AlertDialogContent className="glass backdrop:blur backdrop-brightness-90 max-h-screen wrapper  px-4">
          <ScrollArea className="w-full h-screen pb-10">
            {" "}
            <AlertDialogHeader className="px-6">
              <AlertDialogTitle>{t("modifyVideo")}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col md:flex-row justify-around items-start w-full md:max-w-1/2 ">
              <ScrollArea
                className="h-96  w-full md:w-1/2"
                onScrollCapture={handleScrollCapture}
              >
                <div className="p-4 flex flex-col items-center w-full justify-center">
                  <div className="mb-4 p-2 w-full rounded-xl justify-between flex flex-row text-sm font-medium leading-none sticky top-0 z-10 glass">
                    <MusicUploader
                      userId={userId}
                      refetch={refetch}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                  {allMusic && (
                    <AudioPlayerList
                      players={allMusic}
                      setUsedTrack={SetUsedTrack}
                    />
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 w-full rounded-lg md:w-1/2 flex flex-row content-center  items-center justify-center h-96">
                <div className="rounded-lg flex flex-wrap md:w-48">
                  <HLSPlayer
                    manifest={video}
                    ref={videoRef}
                    onLoadedMetadata={handleMetadataLoaded}
                    className="rounded-lg"
                    autoPlay={false}
                    loop={false}
                  />
                </div>
              </div>
            </div>
            <Mixer
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              src={video}
              usedTrack={usedTrack}
              videoRef={videoRef}
              duration={duration}
            />
            <AlertDialogFooter className="px-6 ">
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>

              <AlertDialogAction
                onClick={(e) => processVideo(e)}
                disabled={reelLoading}
              >
                {reelLoading ? "Processing..." : t("createReels")}
              </AlertDialogAction>
            </AlertDialogFooter>{" "}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
