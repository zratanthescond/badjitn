import { formatSeconds } from "@/lib/utils";

export const TimeStep = ({
  duration,
  currentTime,
  remPerSec,
}: {
  duration: number;
  currentTime: number;
  remPerSec: number;
}) => {
  const REM_PER_SEC = remPerSec;
  const blocks = Array.from(Array(duration + 1).keys());

  const Step = ({ time }: { time: number }) => {
    return (
      <div
        className="relative flex-shrink-0 border-l border-white/20 h-6 flex items-end pb-1 px-1"
        style={{ width: `${REM_PER_SEC}rem` }}
      >
        <span className="text-[10px] font-bold text-white/40 tabular-nums">
          {time % 5 === 0 ? formatSeconds(time) : ""}
        </span>
        {/* Ticks for each second */}
        <div className="absolute left-0 bottom-0 w-px h-1 bg-white/10" />
      </div>
    );
  };

  return (
    <div className="flex rounded-md bg-white/5 flex-row items-center overflow-visible">
      {blocks.map((block, index) => (
        <Step key={index} time={block} />
      ))}
    </div>
  );
};
