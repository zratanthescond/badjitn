import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pause, Play } from "lucide-react";
import { TimeStep } from "./TimeStep";
import { useEffect, useRef, useState } from "react";
import { Framer } from "./Framer";
import { MusicWave } from "./MusicWave";
import { formatSeconds } from "@/lib/utils";
import { IMusic } from "@/lib/database/models/music.model";

type MixerProps = {
  src: string;
  usedTrack: IMusic | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  remPerSec: number;
  duration: number;
  vDuration: number;
  setVDuration: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  selectedTime: number;
  setSelectedTime: (time: number | ((prev: number) => number)) => void;
};

export function Mixer({
  src,
  usedTrack,
  videoRef,
  duration,
  vDuration,
  setVDuration,
  remPerSec,
  selectedTime,
  setSelectedTime,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
}: MixerProps) {
  const controllerRef = useRef<HTMLDivElement>(null);

  const REM_PER_SEC = remPerSec;
  const contentWidthRem = duration * REM_PER_SEC;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const handleVideoFinish = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener("ended", handleVideoFinish);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoFinish);
    };
  }, [videoRef]);

  const handleTimelineAction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!controllerRef.current || !videoRef.current) return;

    const viewport = controllerRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const scrollLeft = viewport.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;

    const xInRem = x / 16;
    let newTime = xInRem / REM_PER_SEC;

    newTime = Math.max(0, Math.min(newTime, duration));

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineAction(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-transform active:scale-95"
            onClick={() => {
              if (isPlaying) {
                videoRef.current?.pause();
              } else {
                videoRef.current?.play();
              }
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-syne font-bold text-foreground">
              {formatSeconds(currentTime)}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              / {formatSeconds(duration)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="relative group/timeline w-full touch-none"
        ref={controllerRef}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => isDragging && handleTimelineAction(e)}
        onPointerUp={(e) => {
          setIsDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        <ScrollArea
          type="hover"
          className="rounded-xl bg-muted/30 dark:bg-black/40 border border-foreground/10 dark:border-white/10 p-2 md:p-4 transition-all group-hover/timeline:bg-muted/50 dark:group-hover/timeline:bg-white/5 shadow-inner"
        >
          <div
            className="relative space-y-4 min-w-0"
            style={{ width: `${contentWidthRem}rem` }}
          >
            {/* Unified Playhead (Needle) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,1)] z-50 pointer-events-none rounded-full"
              style={{ left: `${currentTime * REM_PER_SEC}rem` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-500 rounded-full border-2 border-white shadow-lg" />
            </div>

            <TimeStep duration={Math.ceil(duration)} currentTime={currentTime} remPerSec={remPerSec} />
            <Framer src={src} duration={duration} remPerSec={remPerSec} />
            <MusicWave
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              usedTrack={usedTrack}
              isPlaying={isPlaying}
              vDuration={vDuration}
              setVDuration={setVDuration}
              currentTime={currentTime}
              remPerSec={remPerSec}
            />
          </div>
          <ScrollBar orientation="horizontal" className="bg-foreground/10 dark:bg-white/10" />
        </ScrollArea>
      </div>
    </div>
  );
}
