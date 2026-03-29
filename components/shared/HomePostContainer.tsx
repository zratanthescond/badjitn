"use client";

import { useEffect, useState } from "react";
import HLSPlayer from "./phone/HlsPlayer";
import { Skeleton } from "../ui/skeleton";

export default function HomePostContainer({
  src,
  videoSrc,
  className,
  fallbackImage = "/assets/images/placeholder.png",
}: {
  src: string;
  videoSrc?: string;
  className?: string;
  fallbackImage?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(fallbackImage);

  const playbackSrc = videoSrc || src;
  const isVideo = playbackSrc?.includes(".m3u8");

  useEffect(() => {
    setImageSrc(src || fallbackImage);
  }, [fallbackImage, src]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isVideo ? (
        <>
          {!hovered && imageSrc ? (
            <img
              alt="Event visual"
              src={imageSrc}
              className={`absolute inset-0 h-full w-full rounded-lg object-cover transition-opacity duration-300 ${
                className || ""
              }`}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => {
                if (imageSrc !== fallbackImage) {
                  setImageSrc(fallbackImage);
                }
              }}
            />
          ) : null}
          <HLSPlayer
            manifest={playbackSrc}
            muted
            autoPlay={hovered}
            loop={hovered}
            className={`absolute inset-0 h-full w-full rounded-lg object-cover transition-transform duration-700 ease-out ${
              className || ""
            }`}
            isActive={hovered}
            style={{ opacity: hovered ? 1 : 0 }}
          />
        </>
      ) : (
        <div className="relative h-full w-full">
          {imageSrc ? (
            <img
              alt="Event visual"
              src={imageSrc}
              className={`absolute inset-0 h-full w-full rounded-lg object-cover transition-opacity duration-300 ${
                className || ""
              }`}
              loading="lazy"
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
