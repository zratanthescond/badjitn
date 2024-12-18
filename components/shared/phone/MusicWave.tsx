import { Music } from "lucide-react";
import AudioWaveform from "./AudioWaveFrom";

export const MusicWave = ({
  usedTrack,
  isPlaying,
  vDuration,
  selectedTime,
  setSelectedTime,
}) => {
  return (
    <div className="w-full h-12 flex items-center justify-start  bg-indigo-500 my-2 rounded-lg ">
      {/* <Music color="white" />
      <h4 className="font-semibold px-3 text-white"> Add a song here</h4> */}
      {usedTrack != null ? (
        <AudioWaveform
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          vDuration={vDuration}
          isPlaying={isPlaying}
          data={usedTrack}
          src={process.env.NEXT_PUBLIC_FILE_SERVER_URL + "/" + usedTrack.path}
        />
      ) : (
        <div className="w-full h-12 flex items-center justify-start px-5 bg-indigo-500 my-2 rounded-lg text-start font-semibold text-white ">
          Add a song here
        </div>
      )}
    </div>
  );
};
