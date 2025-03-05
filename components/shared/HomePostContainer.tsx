"use client";
import { useEffect, useRef, useState } from "react";
import HLSPlayer from "./phone/HlsPlayer";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { useSinglePreview } from "@/hooks/useSinglePreview";
import { Skeleton } from "../ui/skeleton";
export default function HomePostContainer({
  src,
  className,
  ...props
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovred, setHovered] = useState<boolean>(false);
  const poster = useSinglePreview(src, 2);

  return (
    <div
      className=" w-full h-full rounded-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovred && poster ? (
        <>
          <HLSPlayer
            manifest={src}
            ref={videoRef}
            muted
            autoPlay
            className={className}
            poster={poster}
          />
        </>
      ) : (
        <>
          {poster && (
            <Image
              alt={""}
              style={{ objectFit: "fill" }}
              layout="responsive"
              width={296}
              height={81 / 16 / 9}
              src={poster!}
              className="rounded-lg w-full h-full object-cover"
            />
          )}

          <Skeleton className="min-h-full w-full" />
        </>
      )}
    </div>
  );
}
