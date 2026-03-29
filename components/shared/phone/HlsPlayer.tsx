import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import Hls from "hls.js";

interface Props extends React.HTMLProps<HTMLVideoElement> {
  manifest: string;
  isActive: boolean;
}

const HLSPlayer = forwardRef<HTMLVideoElement, Props>(
  ({ manifest, isActive = true, autoPlay, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      if (!manifest) return;

      const video = videoRef.current;
      if (!video) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = manifest;
        video.load();
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          autoStartLoad: true,
        });

        hlsRef.current = hls;
        hls.loadSource(manifest);
        hls.attachMedia(video);
      }

      return () => {
        hlsRef.current?.destroy();
        hlsRef.current = null;
      };
    }, [manifest]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !manifest) return;

      const handleLoadedMetadata = () => {
        if (!isActive && video.currentTime === 0) {
          try {
            video.currentTime = 0.1;
          } catch {}
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      if (isActive) {
        video.play().catch(() => console.log("Autoplay blocked"));
      } else {
        video.pause();
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }, [isActive, manifest]);

    return (
      <video
        {...props}
        ref={videoRef}
        autoPlay={autoPlay}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />
    );
  }
);

HLSPlayer.displayName = "HLSPlayer";
export default HLSPlayer;
