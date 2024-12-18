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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Video from "next-video";
import { useEffect, useRef, useState } from "react";
import AudioPlayer, { AudioPlayerList } from "./AudoPlayer";
import { ListIcon, ListMusic, Music2Icon } from "lucide-react";
import MusicUploader from "./MusicUploader";
import { useMusic } from "@/hooks/useMusic";
import Image from "next/image";
import { usePreview } from "@/hooks/usePreview";
import { Mixer } from "./Mixer";
import { IMusic } from "@/lib/database/models/music.model";
import { useReelCreate } from "@/hooks/useReelCreate";
import HLSPlayer from "./HlsPlayer";
export function ModifyVideo({ video, setVideo }: any) {
  const { data, isLoading, error } = useMusic(10);
  const [usedTrack, SetUsedTrack] = useState<IMusic | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [videoData, setVideoData] = useState<any>(null);
  const {
    data: reelData,
    isPending: reelLoading,
    error: reelError,
    mutate: reelMutate,
  } = useReelCreate(videoData);
  useEffect(() => {
    console.log(reelData, reelLoading, reelError);
    if (reelData?.success == true) {
      alert(process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + reelData.videoPath);
      setVideo(
        process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + reelData.videoPath
      );
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
    reelMutate();
  };
  return (
    <div className="absolute top-4 left-4 z-50 w-1/2 max-w-full">
      <AlertDialog>
        <AlertDialogTrigger className="flex-1 glass backdrop:blur p-2 rounded-sm text-primary-50">
          Modify Video
        </AlertDialogTrigger>

        <AlertDialogContent className="glass backdrop:blur backdrop-brightness-90  wrapper px-4">
          <AlertDialogHeader className="px-6">
            <AlertDialogTitle>Modify Video</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col md:flex-row justify-around items-start w-full md:max-w-1/2 ">
            <ScrollArea className="h-96  w-full md:w-1/2">
              <div className="p-4">
                <div className="mb-4 p-2 rounded-xl justify-between flex flex-row text-sm font-medium leading-none sticky top-0 z-10 glass">
                  <div className="flex items-center gap-2 bg-pink-500 p-1 m-1 rounded-lg">
                    <ListMusic className="w-8 h-8" color="white" />
                  </div>
                  <MusicUploader />
                </div>
                {data && (
                  <AudioPlayerList players={data} setUsedTrack={SetUsedTrack} />
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={(e) => processVideo(e)}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
