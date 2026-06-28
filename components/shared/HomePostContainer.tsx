"use client";
import { useEffect, useState } from "react";
import HLSPlayer from "./phone/HlsPlayer";
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

  // For static images use src directly; for video use extracted poster
  const resolvedSrc = (isVideo ? videoPoster : src) || fallbackImage;

  // Init directly from resolvedSrc to avoid iOS Safari double-render flash
  const [imageSrc, setImageSrc] = useState<string>(resolvedSrc);

  useEffect(() => {
    setImageSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <div
      className="w-full h-full rounded-lg relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovred && isVideo ? (
        <HLSPlayer
          manifest={src}
          muted
          autoPlay
          className={className}
          poster={resolvedSrc || ""}
          isActive={hovred}
        />
      ) : (
        <div className="w-full h-full relative">
          {imageSrc ? (
            <img
              alt="Event visual"
              src={imageSrc}
              className={`absolute inset-0 h-full w-full rounded-lg object-cover transition-opacity duration-300 ${className || ""}`}
              loading="eager"
              decoding="async"
              draggable={false}
              onError={() => {
                if (imageSrc !== fallbackImage) {
                  setImageSrc(fallbackImage);
                }
              }}
            />
          ) : (
            <Skeleton className="h-full w-full rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
}
