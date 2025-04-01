import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

export function useSinglePreview(manifest: string, time: number = 1) {
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!manifest) return;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous"; // Avoid CORS issues
    video.muted = true;
    video.preload = "metadata"; // Load only metadata first

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifest;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 5, lowLatencyMode: true });
      hls.loadSource(manifest);
      hls.attachMedia(video);
    }

    video.onloadedmetadata = () => {
      video.currentTime = time; // Seek to desired timestamp
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPreview(canvas.toDataURL("image/jpeg")); // Convert to Data URL
    };

    return () => {
      video.src = "";
    };
  }, [manifest, time]);

  return preview;
}
