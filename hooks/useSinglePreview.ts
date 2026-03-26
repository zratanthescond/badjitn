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
    video.setAttribute("playsinline", "true");
    (video as any).playsInline = true; 
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
        
        // Draw twice to ensure we get a frame in some mobile browsers
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          // Check if it's not a completely black or transparent frame if possible
          // But for now, just setting it is better than nothing
          setPreview(dataUrl);
        } catch (e) {
          console.warn("Failed to capture frame (likely CORS):", e);
        }
      }, 300); // Increased delay slightly
    };

    video.onloadedmetadata = () => {
      video.currentTime = time;
    };

    video.onseeked = () => {
      captureFrame();
    };

    video.onerror = () => {
      // Ignore errors if the source is empty (usually during cleanup)
      if (video.src === "" || video.src.includes(window.location.host + "/")) return;
      console.error("Video loading error for manifest:", manifest);
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
      // Remove listeners before clearing src to avoid triggering onerror
      video.onerror = null;
      video.onloadedmetadata = null;
      video.onseeked = null;
      
      video.src = "";
      video.load(); // Force release resources
      if (hls) {
        hls.destroy();
      }
    };
  }, [manifest, time]);

  return preview;
}
