import { Music } from "lucide-react";
import AudioWaveform from "./AudioWaveFrom";

export const MusicWave = ({
  usedTrack,
  isPlaying,
  vDuration,
  currentTime,
  remPerSec,
  selectedTime,
}: {
  usedTrack: any;
  isPlaying: boolean;
  vDuration: number;
  currentTime: number;
  remPerSec: number;
  selectedTime: number;
}) => {
  const REM_PER_SEC = remPerSec;
  const totalWidthRem = vDuration * REM_PER_SEC;
  const waveImage = usedTrack ? process.env.NEXT_PUBLIC_FILE_SERVER_URL + usedTrack.wave : null;

  return (
    <div
      style={{ width: `${totalWidthRem}rem` }}
      className="h-10 flex items-center justify-start bg-pink-500/10 hover:bg-pink-500/15 my-1 rounded-lg border border-pink-500/20 transition-all group/music overflow-hidden relative"
    >
      {usedTrack ? (
        <div className="relative w-full h-full flex items-center">
            {/* Waveform Background (Clipped to selected window) */}
            <div 
                className="absolute inset-0 opacity-60 grayscale brightness-150 contrast-125 saturate-150"
                style={{
                    backgroundImage: `url(${waveImage})`,
                    backgroundSize: `${(usedTrack.duration / vDuration) * 100}% 100%`,
                    backgroundPosition: `${(selectedTime / (usedTrack.duration - vDuration || 1)) * 100}% center`,
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            {/* Playback Progress Overlay */}
            <div 
                className="absolute inset-y-0 left-0 bg-pink-500/20 border-r border-pink-500/50 transition-all duration-100"
                style={{ width: `${(currentTime / vDuration) * 100}%` }}
            />

            <div className="relative z-10 px-3 flex items-center gap-2">
                <Music size={12} className="text-pink-500" />
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">
                  {usedTrack.title}
                </span>
            </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center gap-2 px-4 transition-all group-hover/music:scale-[1.01]">
          <Music size={12} className="text-white/20" />
          <span className="font-syne font-bold text-[10px] text-white/30 uppercase tracking-widest">
            Tap to Select Music
          </span>
        </div>
      )}
    </div>
  );
};
