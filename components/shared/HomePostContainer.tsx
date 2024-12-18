"use client";
import { useRef } from "react";
import HLSPlayer from "./phone/HlsPlayer";
import { vi } from "date-fns/locale";

export default function HomePostContainer({
  src,
  className,
  ...props
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <HLSPlayer
      manifest={src}
      ref={videoRef}
      muted
      onMouseOver={(e) => videoRef.current?.play()}
      onMouseOut={(e) => videoRef.current?.pause()}
      className={className}
      {...props}
    />
  );
}
