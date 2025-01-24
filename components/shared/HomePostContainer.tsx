"use client";
import { useRef, useState } from "react";
import HLSPlayer from "./phone/HlsPlayer";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { useSinglePreview } from "@/hooks/useSinglePreview";
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
  console.log(poster);
  return (
    <div
      className="flex w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovred ? (
        <HLSPlayer
          manifest={src}
          ref={videoRef}
          muted
          autoPlay
          className={className}
          {...props}
        />
      ) : poster ? (
        <Image
          alt={""}
          style={{ objectFit: "fill" }}
          layout="responsive"
          width={296}
          height={81 / 16 / 9}
          src={poster}
        />
      ) : (
        <p>loading image</p>
      )}
    </div>
  );
}
