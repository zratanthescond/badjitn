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
  fallbackImage = "/assets/images/placeholder.png",
  ...props
}: {
  src: string;
  className?: string;
  fallbackImage?: string;
}) {
  const [hovred, setHovered] = useState<boolean>(false);
  
  // Detect if the src is an HLS manifest (video) or a static image
  const isVideo = src?.includes(".m3u8");
  
  // Only attempt video preview for manifests
  const videoPoster = useSinglePreview(isVideo ? src : "", 2);
  
  // Use extracted video poster if video, otherwise use src directly as image
  const poster = isVideo ? videoPoster : src;

  return (
    <div
      className="w-full h-full rounded-lg relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovred && isVideo && poster ? (
        <HLSPlayer
          manifest={src}
          muted
          autoPlay
          className={className}
          poster={poster}
          isActive={hovred}
        />
      ) : (
        <div className="w-full h-full relative">
          {poster || fallbackImage ? (
            <Image
              alt="Event visual"
              src={poster || fallbackImage}
              fill
              className={`rounded-lg object-cover transition-opacity duration-300 ${className}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Skeleton className="h-full w-full rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
}
