"use client";
// components/HLSAudioPlayer.js

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { ForwardIcon, PauseIcon, PlayIcon, RewindIcon, Search } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
const HLSAudioPlayer = ({
  data,
  id,
  isActive,
  onPlay,
  onStop,
  setUsedTrack,
}: {
  data: any;
  id: any;
  isActive: boolean;
  onPlay: (id: any) => void;
  onStop: (id: any) => void;
  setUsedTrack: (track: any) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // State to manage the play/pause status
  const [duration, setDuration] = useState<number>(0); // State to manage the duration of the track
  const audiSrc = process.env.NEXT_PUBLIC_FILE_SERVER_URL + data.path;
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(audiSrc);
      hls.attachMedia(audioRef.current!);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // audioRef.current.play();
      });

      return () => {
        hls.destroy();
      };
    } else if (audioRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari support
      audioRef.current!.src = audiSrc;
      audioRef.current!.addEventListener("loadedmetadata", () => {
        //audioRef.current.play();
      });
    }
  }, [data]);
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const handlePlayPause = () => {
    if (isActive) {
      audioRef.current?.pause();

      onStop(id);
    } else {
      audioRef.current?.play();

      onPlay(id);
    }
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current!.duration);
    }
  };
  useEffect(() => {
    if (audioRef.current) {
      if (isActive) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
    }
  }, [isActive]);
  const t = useTranslations("videoEditor");
  return (
    <div 
      className={`group relative flex items-center justify-between gap-3 p-3 rounded-2xl h-[80px] w-full transition-all duration-300 ${
        isActive 
          ? "bg-pink-500/10 border-pink-500/40 shadow-md shadow-pink-500/5" 
          : "bg-white/5 dark:bg-slate-900/50 border-input dark:border-white/10 hover:bg-white/10 dark:hover:bg-slate-800 hover:border-pink-500/20"
      } border overflow-hidden shrink-0 pr-4`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500 bg-muted">
          <Image
            src={data.image ? `${process.env.NEXT_PUBLIC_FILE_SERVER_URL}${data.image}` : "/assets/images/placeholder.png"}
            alt={data.title}
            fill
            className="object-cover"
          />
          {isActive && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
               <div className="flex gap-0.5 items-end h-4 pb-0.5">
                  <div className="w-1 bg-pink-500 animate-audio-bar-1 h-3" />
                  <div className="w-1 bg-pink-500 animate-audio-bar-2 h-4" />
                  <div className="w-1 bg-pink-500 animate-audio-bar-3 h-2" />
               </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-foreground dark:text-white font-syne font-bold text-sm truncate group-hover:text-pink-400 transition-colors">
            {data.title || "Untitled Track"}
          </h3>
          <p className="text-muted-foreground dark:text-white/40 text-[10px] uppercase tracking-wider truncate mt-0.5 font-medium">
            {data.artist || "Unknown Artist"} • {formatTime(duration)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2 mr-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          className={`h-9 w-9 rounded-full transition-all ${
            isActive 
              ? "bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/40" 
              : "bg-muted dark:bg-white/10 text-foreground dark:text-white hover:bg-muted/80 dark:hover:bg-white/20"
          }`}
        >
          {isActive ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <Button
          variant="secondary"
          className="h-8 px-4 rounded-full bg-pink-500 dark:bg-pink-500 text-white hover:bg-pink-600 font-bold text-[10px] uppercase tracking-widest transition-all transform active:scale-95 shadow-md shadow-pink-500/20"
          onClick={() => setUsedTrack(data)}
        >
          {t("use")}
        </Button>
      </div>
      <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
    </div>
  );
};


export const AudioPlayerList = ({ players, setUsedTrack }: { players: any[]; setUsedTrack: (track: any) => void }) => {
  const [activePlayer, setActivePlayer] = useState<any>(null);

  const handlePlay = (id: any) => {
    setActivePlayer(id);
  };

  const handleStop = (id: any) => {
    if (activePlayer === id) {
      setActivePlayer(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {players && players.length > 0 ? (
        players.map((player: any) => (
          <HLSAudioPlayer
            key={player._id}
            id={player._id}
            data={player}
            setUsedTrack={setUsedTrack}
            isActive={activePlayer === player._id}
            onPlay={handlePlay}
            onStop={handleStop}
          />
        ))
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
           <div className="h-16 w-16 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-foreground/10 dark:text-white/10" />
           </div>
           <p className="text-foreground dark:text-white font-syne font-bold text-sm">No tracks found</p>
           <p className="text-muted-foreground dark:text-white/30 text-xs mt-1">Try a different search or upload your own!</p>
        </div>
      )}
    </div>
  );
};
export default HLSAudioPlayer;
