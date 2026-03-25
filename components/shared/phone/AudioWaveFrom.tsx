import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import Image from "next/image";
import { formatSeconds } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MoveHorizontal, GripVertical } from "lucide-react";

const Waveform = ({
  src,
  data,
  isPlaying,
  vDuration,
  setVDuration,
  selectedTime,
  setSelectedTime,
  currentTime,
  remPerSec,
}: {
  src: string;
  data: any;
  isPlaying: boolean;
  vDuration: number;
  setVDuration: React.Dispatch<React.SetStateAction<number>>;
  selectedTime: number;
  setSelectedTime: (time: number) => void;
  currentTime: number;
  remPerSec: number;
}) => {
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const REM_PER_SEC = remPerSec;
  const PIXELS_PER_SEC = REM_PER_SEC * 16;

  // Handle Drag Selection on Minimap
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "resize-left" | "resize-right" | null>(null);

  const handleMinimapPointer = useCallback((e: React.PointerEvent) => {
    if (!minimapRef.current || !duration) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const timeAtX = (x / rect.width) * duration;

    if (dragType === "move") {
      const newSelectedTime = Math.max(0, Math.min(timeAtX - vDuration / 2, duration - vDuration));
      setSelectedTime(newSelectedTime);
    } else if (dragType === "resize-right") {
      const newVDuration = Math.max(1, Math.min(timeAtX - selectedTime, 15, duration - selectedTime));
      setVDuration(newVDuration);
    } else if (dragType === "resize-left") {
      const maxPossibleDuration = Math.min(15, duration - selectedTime + vDuration);
      const newSelectedTime = Math.max(selectedTime + vDuration - maxPossibleDuration, Math.min(timeAtX, selectedTime + vDuration - 1));
      const newVDuration = vDuration + (selectedTime - newSelectedTime);
      setSelectedTime(newSelectedTime);
      setVDuration(newVDuration);
    }
  }, [dragType, duration, selectedTime, vDuration, setSelectedTime, setVDuration]);

  const onMinimapDown = (e: React.PointerEvent, type: "move" | "resize-left" | "resize-right") => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const waveImage = process.env.NEXT_PUBLIC_FILE_SERVER_URL + data.wave;
  const waveformWidthRem = (duration || 0) * REM_PER_SEC;

  // Sync scroll of Main Waveform based on selectedTime
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollLeft = selectedTime * PIXELS_PER_SEC;
    }
  }, [selectedTime, PIXELS_PER_SEC]);

  // Fetch Metadata (Duration Only)
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = src;
    const handleLoaded = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => audio.removeEventListener("loadedmetadata", handleLoaded);
  }, [src]);

  return (
    <div className="flex flex-col gap-4 w-full bg-black/60 p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* 1. Main Zoomed Waveform (Visual Reference) */}
      <div className="relative h-24 rounded-2xl overflow-hidden bg-pink-500/5 border border-pink-500/10 shadow-inner">
        <div className="absolute inset-y-0 left-0 w-1 bg-pink-500 z-30 shadow-[0_0_15px_rgba(236,72,153,1)]" />
        <ScrollArea ref={scrollAreaRef} className="h-full w-full pointer-events-none">
          <div className="relative h-full" style={{ width: `${waveformWidthRem}rem` }}>
             {waveImage && (
                <Image
                  src={waveImage}
                  alt="wave"
                  fill
                  className="object-cover opacity-80 brightness-125 contrast-150 saturate-150"
                  style={{ filter: 'drop-shadow(0 0 5px rgba(236,72,153,0.3))' }}
                />
             )}
          </div>
        </ScrollArea>
        <div className="absolute top-2 right-4 z-30 px-3 py-1 bg-pink-600/20 backdrop-blur-md rounded-full border border-pink-400/30">
           <span className="text-pink-100 font-mono text-[10px] font-bold">
             PRECISION VIEW
           </span>
        </div>
      </div>

      {/* 2. Minimap + Selector */}
      <div className="relative h-16 rounded-2xl bg-white/5 border border-white/5 overflow-hidden group/minimap">
        <div 
          ref={minimapRef}
          className="absolute inset-0 z-10"
          onPointerMove={(e) => isDragging && handleMinimapPointer(e)}
          onPointerUp={(e) => {
            setIsDragging(false);
            setDragType(null);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* Full track Waveform background */}
          {waveImage && (
            <Image
              src={waveImage}
              alt="minimap"
              fill
              className="object-fill opacity-20 transition-opacity group-hover/minimap:opacity-30"
            />
          )}

          {/* Selection Box */}
          <div 
            className="absolute inset-y-0 bg-pink-500/20 border-x-4 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] cursor-move flex items-center justify-between"
            style={{ 
              left: `${(selectedTime / (duration || 1)) * 100}%`, 
              width: `${(vDuration / (duration || 1)) * 100}%` 
            }}
            onPointerDown={(e) => onMinimapDown(e, "move")}
          >
            {/* Left Resize Handle */}
            <div 
              className="absolute left-0 inset-y-0 w-4 cursor-ew-resize flex items-center justify-center group/handle"
              onPointerDown={(e) => onMinimapDown(e, "resize-left")}
            >
              <div className="w-1 h-6 bg-white/50 rounded-full group-hover/handle:bg-white transition-colors" />
            </div>

            <MoveHorizontal className="h-4 w-4 text-white opacity-40" />

            {/* Right Resize Handle */}
            <div 
              className="absolute right-0 inset-y-0 w-4 cursor-ew-resize flex items-center justify-center group/handle"
              onPointerDown={(e) => onMinimapDown(e, "resize-right")}
            >
              <div className="w-1 h-6 bg-white/50 rounded-full group-hover/handle:bg-white transition-colors" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-4 z-20 pointer-events-none">
           <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
             Whole Track Minimap
           </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-white font-syne font-bold text-xs uppercase tracking-wider">{data.title}</span>
          <span className="text-pink-500 font-mono text-[10px] font-bold">OFFSET: {formatSeconds(selectedTime)}</span>
        </div>
        <div className="px-4 py-1.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
          <span className="text-pink-100 font-mono text-[10px] font-bold uppercase">SIZE: {formatSeconds(vDuration)}</span>
        </div>
      </div>
    </div>
  );
};

export default Waveform;
