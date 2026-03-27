import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import Hls from "hls.js";

interface Props extends React.HTMLProps<HTMLVideoElement> {
  manifest: string;
  isActive: boolean; // 🔥 Controls if this video should play
}

const HLSPlayer = forwardRef<HTMLVideoElement, Props>(
  ({ manifest, isActive = true, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      if (!isActive || !manifest) return; // Only initialize if active

      const video = videoRef.current;
      if (!video) return;

      // Destroy existing HLS instance if any
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS support
        video.src = manifest;
        video.load(); // Force load on source change
        video.play().catch(() => console.log("Autoplay blocked"));
      } else if (Hls.isSupported()) {
        // Use HLS.js for Chrome and other browsers
        const hls = new Hls({
          autoStartLoad: true,
        });

        hlsRef.current = hls;
        hls.loadSource(manifest);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_LOADED, () => {
          video.play().catch(() => console.log("Autoplay blocked"));
        });
      }

      return () => {
        hlsRef.current?.destroy();
        hlsRef.current = null;
      };
    }, [isActive, manifest]); // Ensure re-init on active change

    return (
      <video
        {...props}
        ref={videoRef}
        autoPlay
        muted // 🔥 Required for autoplay to work on mobile!
        playsInline // 🔥 Required for iOS
        crossOrigin="anonymous" // Match preview hook and avoid CORS issues
        //controls={false} // Hide controls to mimic TikTok
      />
    );
  }
);

HLSPlayer.displayName = "HLSPlayer";
export default HLSPlayer;
