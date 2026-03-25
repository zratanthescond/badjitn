import { usePreview } from "@/hooks/usePreview";
import Image from "next/image";

export const Framer = ({
  src,
  duration,
  remPerSec,
}: {
  src: string;
  duration: number;
  remPerSec: number;
}) => {
  const frames = usePreview(src);
  const isLoading = frames.length === 0;
  const REM_PER_SEC = remPerSec;
  const FRAMES_PER_SEC = 4;
  const FRAME_WIDTH_REM = REM_PER_SEC / FRAMES_PER_SEC; // 2rem

  if (isLoading) {
    return (
      <div
        className="flex rounded-lg flex-row my-1 bg-white/5 animate-pulse overflow-hidden"
        style={{ width: `${duration * REM_PER_SEC}rem`, height: "4rem" }}
      />
    );
  }

  return (
    <div className="flex rounded-lg flex-row my-1 overflow-hidden h-16 bg-black/20">
      {frames.map((frame, index) => (
        <div
          key={index}
          className="relative flex-shrink-0"
          style={{ width: `${FRAME_WIDTH_REM}rem`, height: "100%" }}
        >
          <Image
            src={frame}
            alt={`frame-${index}`}
            fill
            className="object-cover opacity-80"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
};
