import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

export function useSinglePreview(manifest: string, time: number = 3) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!manifest) {
      setPreview(null);
      return;
    }

    let hls: Hls | null = null;
    const video = document.createElement("video");
    
    // Attempt to avoid tainted canvas and black frames
    video.setAttribute("crossorigin", "anonymous");
    video.muted = true;
    video.preload = "auto";
    video.autoplay = false;

    const captureFrame = () => {
      // Small delay to ensure the frame is actually rendered and not black
      setTimeout(() => {
        if (video.videoWidth === 0 || video.videoHeight === 0) return;
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPreview(dataUrl);
        } catch (e) {
          console.warn("Failed to capture frame (likely CORS):", e);
        }
      }, 200);
    };

    video.onloadedmetadata = () => {
      video.currentTime = time;
    };

    video.onseeked = () => {
      captureFrame();
    };

    video.onerror = (e) => {
      console.error("Video loading error:", e);
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifest;
    } else if (Hls.isSupported()) {
      hls = new Hls({ 
        maxBufferLength: 5, 
        lowLatencyMode: true,
        autoStartLoad: true
      });
      hls.loadSource(manifest);
      hls.attachMedia(video);
    }

    return () => {
      video.src = "";
      if (hls) {
        hls.destroy();
      }
    };
  }, [manifest, time]);

  return preview;
}
