import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pause, Play } from "lucide-react";
import { TimeStep } from "./TimeStep";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useDimensions from "@/hooks/useDimensions";
import { Framer } from "./Framer";
import { MusicWave } from "./MusicWave";
import { formatSeconds } from "@/lib/utils";
import { IMusic } from "@/lib/database/models/music.model";
type MixerProps = {
  src: string;
  usedTrack: IMusic | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  selectedTime: number;
  setSelectedTime: React.Dispatch<React.SetStateAction<number>>;
};
export function Mixer({
  src,
  usedTrack,
  videoRef,
  duration,
  selectedTime,
  setSelectedTime,
}: MixerProps) {
  const controllerRef = useRef();
  const [scrollAreaWidth, setScrollAreaWidth] = useState();
  const dimensions = useDimensions(controllerRef);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const handleVideoFinish = () => {
      // alert("Video finished successfully  ");
      setIsPlaying(false);
      setCurrentTime(0);
    };
    if (video) {
      video.addEventListener("ended", handleVideoFinish);
      video.addEventListener("timeupdate", handleTimeUpdate);
    }
    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleVideoFinish);
      }
    };
  }, [videoRef]);
  return (
    <div className="p-1 w-full flex flex-col items-center justify-center">
      <div className="w-full flex  items-center justify-center backdrop-brightness-200 p-1 rounded-lg">
        {isPlaying ? (
          <Button variant={"ghost"} size={"icon"}>
            <Pause
              size={20}
              color="white"
              fill="white"
              onClick={() => {
                videoRef?.current.pause();
                setIsPlaying(false);
              }}
            />
          </Button>
        ) : (
          <Button variant={"ghost"} size={"icon"}>
            <Play
              size={20}
              color="white"
              fill="white"
              onClick={() => {
                videoRef?.current.play();
                setIsPlaying(true);
              }}
            />
          </Button>
        )}
        <span className="mx-2">{formatSeconds(currentTime)}</span> /{" "}
        <span className="mx-2 text-muted ">{formatSeconds(duration)}</span>
      </div>
      <div className="flex w-full" ref={controllerRef}>
        <ScrollArea type="hover" style={{ maxWidth: dimensions.width + "px" }}>
          <TimeStep duration={Math.ceil(duration)} currentTime={currentTime} />
          <Framer src={src} duration={duration} />
          <ScrollBar orientation="horizontal" />
          <MusicWave
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            usedTrack={usedTrack}
            isPlaying={isPlaying}
            vDuration={Math.ceil(duration)}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
