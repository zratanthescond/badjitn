// components/HLSAudioPlayer.js

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ForwardIcon, PauseIcon, PlayIcon, RewindIcon } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
const HLSAudioPlayer = ({
  data,
  id,
  isActive,
  onPlay,
  onStop,
  setUsedTrack,
}) => {
  const audioRef = useRef(null);
  // State to manage the play/pause status
  const [duration, setDuration] = useState<number>(0); // State to manage the duration of the track
  const audiSrc = process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + data.path;
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(audiSrc);
      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // audioRef.current.play();
      });

      return () => {
        hls.destroy();
      };
    } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari support
      audioRef.current.src = audiSrc;
      audioRef.current.addEventListener("loadedmetadata", () => {
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
      setDuration(audioRef.current.duration);
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
  return (
    <Card className="card glass backdrop-blur-sm text-primary-content w-full  rounded-xl">
      <CardContent className="flex flex-row  items-center justify-center gap-4 p-1 rounded-xl ">
        <Image
          src={`${process.env.NEXT_PUBLIC_FILE_SERVER_URL}/${data.image}`}
          alt="Album Cover"
          width={100}
          height={100}
          className="rounded-xl w-12 h-12 object-cover"
        />
        <div className="text-left w-full">
          <h2 className="text-sm font-semibold">
            {data.title.substring(0, 20) + " ..." || "Audio Title"}
          </h2>
          <p className="text-muted-foreground">
            <span>{formatTime(duration)}</span>.
            {data.artist.substring(0, 10) + " ..." || "Person Name"}
          </p>
        </div>

        <div className="flex items-center gap-4 absolute  left-2">
          <Button variant="ghost" size="icon" onClick={handlePlayPause}>
            {isActive ? (
              <PauseIcon className="w-6 h-6 stroke-pink-500 " />
            ) : (
              <PlayIcon className="w-6 h-6  stroke-pink-500" />
            )}
          </Button>
        </div>
        <Button
          variant={"ghost"}
          className="glass  text-white"
          onClick={() => setUsedTrack(data)}
        >
          use
        </Button>
        <audio ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
      </CardContent>
    </Card>
  );
};

export const AudioPlayerList = ({ players, setUsedTrack }) => {
  const [activePlayer, setActivePlayer] = useState(null);

  // Play a player and stop the others
  const handlePlay = (id) => {
    setActivePlayer(id); // Set the current player as active
  };

  // Stop the current active player
  const handleStop = (id) => {
    if (activePlayer === id) {
      setActivePlayer(null); // Reset if this player was playing
    }
  };

  return (
    <div>
      {players.map((player) => (
        <>
          <HLSAudioPlayer
            key={player._id}
            id={player._id}
            data={player}
            setUsedTrack={setUsedTrack}
            isActive={activePlayer === player._id}
            onPlay={handlePlay}
            onStop={handleStop}
          />
          <Separator className="my-2" />
        </>
      ))}
    </div>
  );
};
export default HLSAudioPlayer;
