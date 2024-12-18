import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";

const Waveform = ({
  src,
  data,
  isPlaying,
  vDuration,
  selectedTime,
  setSelectedTime,
}) => {
  console.log(data);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioRef = useRef<HTMLMediaElement | null>(null);

  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        //  setDuration(audioRef.current.duration);
      });

      return () => {
        hls.destroy();
      };
    } else if (audioRef?.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari support
      audioRef.current.src = src;
      audioRef.current.addEventListener("loadedmetadata", () => {
        // setDuration(audioRef.current.duration);
      });
    }
  }, [src]);
  // Cleanup on unmount
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      console.log("selectedTime", selectedTime);
      console.log("currentTime", audioRef.current.currentTime);
      if (Math.ceil(audioRef.current.currentTime) - selectedTime >= vDuration) {
        audioRef.current.currentTime = selectedTime;
      }
      audioRef.current?.pause();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      handlePlayPause();
    }
  }, [isPlaying]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = event.target;
    const scrolled = (scrollLeft / (scrollWidth - clientWidth)) * 100;

    setSelectedTime(Math.ceil((Math.ceil(scrolled) * duration) / 100));
  };
  useEffect(() => {
    audioRef.current.currentTime = selectedTime;
  }, [selectedTime]);
  const waveImage = process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + data.wave;
  const scrollWidth = vDuration * 18 + 4.5;
  const insideWidth = scrollWidth * 5;

  return (
    <div
      style={{
        maxWidth: `${scrollWidth}rem`,
      }}
      className=" border-4 border-white rounded-xl"
    >
      <ScrollArea
        onScrollCapture={handleScroll}
        className=" h-12 z-0 rounded-lg"
      >
        <div
          style={{ width: `${insideWidth}rem` }}
          className={`flex flex-row z-0 h-12 items-center bg-pink-500 rounded-lg p-1  `}
        >
          <h1 className="absolute z-10 text-primary-50">
            {data.title} {selectedTime}
          </h1>
          <Image
            src={waveImage}
            alt="wave"
            style={{
              objectFit: "fill",
              position: "relative",
              filter:
                "invert(37%) sepia(74%) saturate(2390%) hue-rotate(223deg) brightness(97%) contrast(95%)",
            }}
            height={100}
            width={3000}
            className="w-[2800rem] max-h-12 z-0  opacity-80 relative rounded-lg"
          />

          <audio
            ref={audioRef}
            onLoadedData={() => setDuration(audioRef.current.duration)}
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Waveform;
