import { useEffect, useState } from "react";
import Hls from "hls.js";

const usePreview = (url: string) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false; // To handle unmount during async operations
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";

    const captureFrameAtSecond = (second: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        video.currentTime = second;

        const handleSeeked = () => {
          const canvas = document.createElement("canvas");
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          if (!videoWidth || !videoHeight) {
            reject(new Error("Invalid video dimensions."));
            return;
          }

          const targetWidth = 71;
          const aspectRatio = videoWidth / videoHeight;
          const targetHeight = targetWidth / aspectRatio;

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              video,
              0,
              0,
              videoWidth,
              videoHeight,
              0,
              0,
              targetWidth,
              targetHeight
            );
            resolve(canvas.toDataURL());
          } else {
            reject(new Error("Canvas context not available."));
          }

          video.removeEventListener("seeked", handleSeeked);
        };

        video.addEventListener("seeked", handleSeeked, { once: true });
      });
    };

    const generatePreviews = async () => {
      try {
        const duration = Math.ceil(video.duration);
        const interval = 4; // Capture 4 frames per second
        const previews: string[] = [];

        for (let second = 0; second <= duration; second += 1 / interval) {
          if (isCancelled) break;
          const preview = await captureFrameAtSecond(second);
          previews.push(preview);
        }

        if (!isCancelled) setImages(previews);
      } catch (error) {
        console.error("Error generating previews:", error);
      }
    };

    const handleLoadedMetadata = () => {
      generatePreviews();
    };

    // Initialize HLS.js if needed
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (e.g., Safari)
      video.src = url;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    } else {
      console.error("HLS is not supported in this browser.");
    }

    return () => {
      isCancelled = true;
      video.pause();
      video.src = "";
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return images;
};

export { usePreview };
